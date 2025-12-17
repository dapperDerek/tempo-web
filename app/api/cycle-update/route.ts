import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { couple, cycleUpdates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserCoupleContext, requireHerRole } from "@/lib/couple-auth";

// POST /api/cycle-update - Log a new period start (Her only)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { periodStart } = body;

    if (!periodStart) {
      return NextResponse.json(
        { error: "Period start date is required" },
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

    const now = new Date();
    const periodStartDate = new Date(periodStart);

    // Add cycle update
    const updateId = crypto.randomUUID();
    await db.insert(cycleUpdates).values({
      id: updateId,
      coupleId: context.coupleId,
      periodStart: periodStartDate,
      createdAt: now,
    });

    // Update couple's lastPeriodStart if cycle tracking is shared
    if (context.couple.cycleTrackingShared) {
      await db
        .update(couple)
        .set({
          lastPeriodStart: periodStartDate,
          updatedAt: now,
        })
        .where(eq(couple.id, context.coupleId));
    }

    return NextResponse.json({
      success: true,
      cycleUpdate: {
        id: updateId,
        periodStart: periodStartDate,
      },
    });
  } catch (error) {
    console.error("Error logging cycle update:", error);

    if (error instanceof Error && error.message.includes("Her")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to log cycle update" },
      { status: 500 }
    );
  }
}
