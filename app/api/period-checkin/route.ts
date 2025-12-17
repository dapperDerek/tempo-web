import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { periodCheckIns, couple } from "@/lib/db/schema";
import { getUserCoupleContext, requireHerRole } from "@/lib/couple-auth";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// POST /api/period-checkin - Log period status for today (Her only)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
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

    const today = new Date().toISOString().split("T")[0];

    // Check if check-in already exists for today
    const existing = await db
      .select()
      .from(periodCheckIns)
      .where(
        and(
          eq(periodCheckIns.coupleId, context.coupleId),
          eq(periodCheckIns.date, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing check-in
      await db
        .update(periodCheckIns)
        .set({ isActive })
        .where(eq(periodCheckIns.id, existing[0].id));

      // If period just started, update couple.lastPeriodStart
      if (isActive && context.couple.cycleTrackingShared) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        await db
          .update(couple)
          .set({ lastPeriodStart: todayDate })
          .where(eq(couple.id, context.coupleId));
      }

      return NextResponse.json({
        success: true,
        checkIn: {
          id: existing[0].id,
          date: today,
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
      date: today,
      isActive,
      createdAt: new Date(),
    });

    // If period started today, update couple.lastPeriodStart
    if (isActive && context.couple.cycleTrackingShared) {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      // Check if this is a new period (not same day as last period)
      const lastPeriodDate = new Date(context.couple.lastPeriodStart);
      lastPeriodDate.setHours(0, 0, 0, 0);

      if (todayDate.getTime() !== lastPeriodDate.getTime()) {
        await db
          .update(couple)
          .set({ lastPeriodStart: todayDate })
          .where(eq(couple.id, context.coupleId));
      }
    }

    return NextResponse.json({
      success: true,
      checkIn: {
        id: checkInId,
        date: today,
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

// GET /api/period-checkin - Get recent period check-ins (Both can read)
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
    const limit = parseInt(searchParams.get("limit") || "30");

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
