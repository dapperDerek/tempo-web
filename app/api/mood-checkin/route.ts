import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { moodCheckIns } from "@/lib/db/schema";
import { getUserCoupleContext, requireHerRole } from "@/lib/couple-auth";
import { eq, and, desc } from "drizzle-orm";
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
    const { mood, note } = body;

    if (!mood) {
      return NextResponse.json(
        { error: "Mood is required" },
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

    const today = new Date().toISOString().split("T")[0];

    // Check if check-in already exists for today
    const existing = await db
      .select()
      .from(moodCheckIns)
      .where(
        and(
          eq(moodCheckIns.coupleId, context.coupleId),
          eq(moodCheckIns.date, today)
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
          date: today,
          mood,
          note: note || null,
          createdAt: existing[0].createdAt,
        },
        updated: true,
      });
    }

    // Create new check-in
    const checkInId = randomUUID();
    await db.insert(moodCheckIns).values({
      id: checkInId,
      coupleId: context.coupleId,
      date: today,
      mood,
      note: note || null,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      checkIn: {
        id: checkInId,
        coupleId: context.coupleId,
        date: today,
        mood,
        note: note || null,
        createdAt: new Date(),
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

// GET /api/mood-checkin - Get latest mood check-in (Both can read)
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

    // Get latest mood check-in
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
