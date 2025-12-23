import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { periodCheckIns } from "@/lib/db/schema";
import { getUserCoupleContext, requireHerRole } from "@/lib/couple-auth";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";

// POST /api/period-checkin - Log period status for today (Her only)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { isActive, date } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
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
      .from(periodCheckIns)
      .where(
        and(
          eq(periodCheckIns.coupleId, context.coupleId),
          eq(periodCheckIns.date, date)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing check-in
      await db
        .update(periodCheckIns)
        .set({ isActive })
        .where(eq(periodCheckIns.id, existing[0].id));

      return NextResponse.json({
        success: true,
        checkIn: {
          id: existing[0].id,
          date,
          isActive,
        },
        updated: true,
      });
    }

    // Create new check-in
    const checkInId = randomUUID();
    await db.insert(periodCheckIns).values({
      id: checkInId,
      coupleId: context.coupleId,
      date,
      isActive,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      checkIn: {
        id: checkInId,
        date,
        isActive,
      },
      updated: false,
    });
  } catch (error) {
    console.error("Error creating period check-in:", error);

    if (error instanceof Error && error.message.includes("Her")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create period check-in" },
      { status: 500 }
    );
  }
}

// GET /api/period-checkin - Get period check-ins (Both can read)
// Supports query params: date (single date), startDate & endDate (date range), limit (number of records)
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
    const limit = parseInt(searchParams.get("limit") || "100");

    // If specific date is requested
    if (date) {
      const checkIn = await db
        .select()
        .from(periodCheckIns)
        .where(
          and(
            eq(periodCheckIns.coupleId, context.coupleId),
            eq(periodCheckIns.date, date)
          )
        )
        .limit(1);

      if (checkIn.length === 0) {
        return NextResponse.json({ checkIn: null });
      }

      return NextResponse.json({
        checkIn: {
          id: checkIn[0].id,
          date: checkIn[0].date,
          isActive: checkIn[0].isActive,
          createdAt: checkIn[0].createdAt,
        },
      });
    }

    // If date range is requested
    if (startDate && endDate) {
      const checkIns = await db
        .select()
        .from(periodCheckIns)
        .where(
          and(
            eq(periodCheckIns.coupleId, context.coupleId),
            gte(periodCheckIns.date, startDate),
            lte(periodCheckIns.date, endDate)
          )
        )
        .orderBy(desc(periodCheckIns.date));

      return NextResponse.json({
        checkIns: checkIns.map((ci) => ({
          id: ci.id,
          date: ci.date,
          isActive: ci.isActive,
          createdAt: ci.createdAt,
        })),
      });
    }

    // Default: Get recent period check-ins with limit
    const checkIns = await db
      .select()
      .from(periodCheckIns)
      .where(eq(periodCheckIns.coupleId, context.coupleId))
      .orderBy(desc(periodCheckIns.date))
      .limit(limit);

    return NextResponse.json({
      checkIns: checkIns.map((ci) => ({
        id: ci.id,
        date: ci.date,
        isActive: ci.isActive,
        createdAt: ci.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching period check-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch period check-ins" },
      { status: 500 }
    );
  }
}
