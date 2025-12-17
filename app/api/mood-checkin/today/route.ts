import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { moodCheckIns } from "@/lib/db/schema";
import { getUserCoupleContext } from "@/lib/couple-auth";
import { eq, and } from "drizzle-orm";

// GET /api/mood-checkin/today - Get today's mood check-in if exists
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

    const today = new Date().toISOString().split("T")[0];

    const todayCheckIn = await db
      .select()
      .from(moodCheckIns)
      .where(
        and(
          eq(moodCheckIns.coupleId, context.coupleId),
          eq(moodCheckIns.date, today)
        )
      )
      .limit(1);

    if (todayCheckIn.length === 0) {
      return NextResponse.json({ checkIn: null });
    }

    return NextResponse.json({
      checkIn: {
        id: todayCheckIn[0].id,
        coupleId: todayCheckIn[0].coupleId,
        date: todayCheckIn[0].date,
        mood: todayCheckIn[0].mood,
        note: todayCheckIn[0].note,
        createdAt: todayCheckIn[0].createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching today's mood check-in:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's mood check-in" },
      { status: 500 }
    );
  }
}
