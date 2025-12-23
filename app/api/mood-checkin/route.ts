import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { moodCheckIns } from "@/lib/db/schema";
import { getUserCoupleContext, requireHerRole } from "@/lib/couple-auth";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface MoodCheckIn {
  id: string;
  coupleId: string;
  date: string;
  mood: string;
  note?: string;
  createdAt: Date;
}

// POST /api/mood-checkin - Create a mood check-in (Her only)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { mood, note, date } = body;

    if (!mood) {
      return NextResponse.json(
        { error: "Mood is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Date must be in YYYY-MM-DD format" },
        { status: 400 }
      );
    }

    // Get user's couple context
    const context = await getUserCoupleContext(session.user.id);

    if (!context) {
      return NextResponse.json(
        { error: "Couple profile not found. Complete onboarding first." },
        { status: 404 }
      );
    }

    // Verify user has "her" role
    await requireHerRole(session.user.id, context.coupleId);

    // Check if check-in already exists for this date
    const existing = await db
      .select()
      .from(moodCheckIns)
      .where(
        and(
          eq(moodCheckIns.coupleId, context.coupleId),
          eq(moodCheckIns.date, date)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing check-in
      await db
        .update(moodCheckIns)
        .set({
          mood,
          note: note || null,
        })
        .where(eq(moodCheckIns.id, existing[0].id));

      return NextResponse.json({
        success: true,
        checkIn: {
          id: existing[0].id,
          coupleId: context.coupleId,
          date,
          mood,
          note: note || null,
          createdAt: existing[0].createdAt,
        },
        updated: true,
      });
    }

    // Create new check-in
    const checkInId = randomUUID();
    const now = new Date();
    await db.insert(moodCheckIns).values({
      id: checkInId,
      coupleId: context.coupleId,
      date,
      mood,
      note: note || null,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      checkIn: {
        id: checkInId,
        coupleId: context.coupleId,
        date,
        mood,
        note: note || null,
        createdAt: now,
      },
      updated: false,
    });
  } catch (error) {
    console.error("Error creating mood check-in:", error);

    if (error instanceof Error && error.message.includes("Her")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create mood check-in" },
      { status: 500 }
    );
  }
}

// GET /api/mood-checkin - Get mood check-in(s) (Both can read)
// Supports query params: date (single date), startDate & endDate (date range)
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const context = await getUserCoupleContext(session.user.id);

    if (!context) {
      return NextResponse.json(
        { error: "Couple profile not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // If specific date is requested
    if (date) {
      const checkIn = await db
        .select()
        .from(moodCheckIns)
        .where(
          and(
            eq(moodCheckIns.coupleId, context.coupleId),
            eq(moodCheckIns.date, date)
          )
        )
        .limit(1);

      if (checkIn.length === 0) {
        return NextResponse.json({ checkIn: null });
      }

      return NextResponse.json({
        checkIn: {
          id: checkIn[0].id,
          coupleId: checkIn[0].coupleId,
          date: checkIn[0].date,
          mood: checkIn[0].mood,
          note: checkIn[0].note,
          createdAt: checkIn[0].createdAt,
        },
      });
    }

    // If date range is requested
    if (startDate && endDate) {
      const checkIns = await db
        .select()
        .from(moodCheckIns)
        .where(
          and(
            eq(moodCheckIns.coupleId, context.coupleId),
            gte(moodCheckIns.date, startDate),
            lte(moodCheckIns.date, endDate)
          )
        )
        .orderBy(desc(moodCheckIns.date));

      return NextResponse.json({
        checkIns: checkIns.map((checkIn) => ({
          id: checkIn.id,
          coupleId: checkIn.coupleId,
          date: checkIn.date,
          mood: checkIn.mood,
          note: checkIn.note,
          createdAt: checkIn.createdAt,
        })),
      });
    }

    // Default: Get latest mood check-in
    const latest = await db
      .select()
      .from(moodCheckIns)
      .where(eq(moodCheckIns.coupleId, context.coupleId))
      .orderBy(desc(moodCheckIns.date))
      .limit(1);

    if (latest.length === 0) {
      return NextResponse.json({ checkIn: null });
    }

    return NextResponse.json({
      checkIn: {
        id: latest[0].id,
        coupleId: latest[0].coupleId,
        date: latest[0].date,
        mood: latest[0].mood,
        note: latest[0].note,
        createdAt: latest[0].createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching mood check-in:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood check-in" },
      { status: 500 }
    );
  }
}
