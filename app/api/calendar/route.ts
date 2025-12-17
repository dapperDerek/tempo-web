import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { moodCheckIns, periodCheckIns } from "@/lib/db/schema";
import { getUserCoupleContext, requireHerRole } from "@/lib/couple-auth";
import { eq, and, gte, lte } from "drizzle-orm";
import { calculateCycleInfo } from "@/lib/cycle-calculator";

// GET /api/calendar - Get calendar view with cycle and mood data (Her only)
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

    // Verify user has "her" role
    await requireHerRole(session.user.id, context.coupleId);

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Get mood check-ins for this month
    const moods = await db
      .select()
      .from(moodCheckIns)
      .where(
        and(
          eq(moodCheckIns.coupleId, context.coupleId),
          gte(moodCheckIns.date, startDateStr),
          lte(moodCheckIns.date, endDateStr)
        )
      );

    // Get period check-ins for this month
    const periods = await db
      .select()
      .from(periodCheckIns)
      .where(
        and(
          eq(periodCheckIns.coupleId, context.coupleId),
          gte(periodCheckIns.date, startDateStr),
          lte(periodCheckIns.date, endDateStr)
        )
      );

    // Calculate cycle info for today
    const cycleInfo = calculateCycleInfo(
      context.couple.lastPeriodStart,
      context.couple.cycleLength,
      context.couple.periodLength
    );

    // Build day-by-day calendar data
    const days = [];
    const daysInMonth = endDate.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split("T")[0];

      // Find mood for this day
      const mood = moods.find((m) => m.date === dateStr);

      // Find period status for this day
      const period = periods.find((p) => p.date === dateStr);

      // Calculate cycle day for this date
      const dayInfo = calculateCycleInfo(
        context.couple.lastPeriodStart,
        context.couple.cycleLength,
        context.couple.periodLength,
        date
      );

      days.push({
        date: dateStr,
        dayOfMonth: day,
        cycleDay: dayInfo.dayOfCycle,
        phase: dayInfo.phase,
        mood: mood ? mood.mood : null,
        moodNote: mood ? mood.note : null,
        isPeriod: period ? period.isActive : null,
      });
    }

    return NextResponse.json({
      year,
      month,
      currentCycleDay: cycleInfo.dayOfCycle,
      currentPhase: cycleInfo.phase,
      days,
    });
  } catch (error) {
    console.error("Error fetching calendar:", error);

    if (error instanceof Error && error.message.includes("Her")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}
