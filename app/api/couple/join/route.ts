import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { couple, periodCheckIns } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

// POST /api/couple/join - Join an existing couple using invite code
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { inviteCode, cycleLength, periodLength, lastPeriodStart } = body;

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Find couple by invite code
    const coupleProfile = await db
      .select()
      .from(couple)
      .where(eq(couple.inviteCode, inviteCode))
      .limit(1);

    if (coupleProfile.length === 0) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    const profile = coupleProfile[0];

    // Check if user is already part of a couple
    const existingCouple = await db
      .select()
      .from(couple)
      .where(
        or(
          eq(couple.herUserId, session.user.id),
          eq(couple.himUserId, session.user.id)
        )
      )
      .limit(1);

    if (existingCouple.length > 0) {
      return NextResponse.json(
        { error: "You are already part of a couple profile" },
        { status: 400 }
      );
    }

    // Automatically determine role based on available slot
    let role: "her" | "him";
    let updateField: "herUserId" | "himUserId";

    if (!profile.herUserId) {
      role = "her";
      updateField = "herUserId";
    } else if (!profile.himUserId) {
      role = "him";
      updateField = "himUserId";
    } else {
      // Both slots are filled
      return NextResponse.json(
        { error: "This couple is already complete" },
        { status: 400 }
      );
    }

    // Check if user is trying to join their own couple
    if (
      profile.herUserId === session.user.id ||
      profile.himUserId === session.user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot join your own couple profile. Share the invite code with your partner.",
        },
        { status: 400 }
      );
    }

    // Update the couple profile with the new partner
    // If cycle data is provided (female joiner may have edited it), update that too
    const updateData: any = { [updateField]: session.user.id };

    if (cycleLength !== undefined) {
      updateData.cycleLength = cycleLength;
    }
    if (periodLength !== undefined) {
      updateData.periodLength = periodLength;
    }

    await db
      .update(couple)
      .set(updateData)
      .where(eq(couple.id, profile.id));

    // Create initial period check-in if lastPeriodStart provided (Her only)
    if (lastPeriodStart && role === "her") {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(lastPeriodStart)) {
        try {
          // Create period check-in for the last period start date
          await db.insert(periodCheckIns).values({
            id: crypto.randomUUID(),
            coupleId: profile.id,
            date: lastPeriodStart,
            isActive: true,
            createdAt: new Date(),
          });
        } catch (error) {
          console.error("Error creating initial period check-in:", error);
          // Don't fail the whole request if period check-in creation fails
        }
      }
    }

    // Fetch updated couple profile
    const updatedCouple = await db
      .select()
      .from(couple)
      .where(eq(couple.id, profile.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      couple: updatedCouple[0],
      role,
    });
  } catch (error) {
    console.error("Error joining couple:", error);
    return NextResponse.json(
      { error: "Failed to join couple" },
      { status: 500 }
    );
  }
}
