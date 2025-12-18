import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { couple } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

// POST /api/couple/join - Join an existing couple using invite code
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { inviteCode, role } = body;

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    if (!role || !["him", "her"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be 'him' or 'her'" },
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

    // Determine which field to update based on role
    const updateField = role === "her" ? "herUserId" : "himUserId";

    // Check if this role is already taken
    if (profile[updateField as keyof typeof profile]) {
      return NextResponse.json(
        { error: `The '${role}' role is already filled in this couple` },
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
    await db
      .update(couple)
      .set({ [updateField]: session.user.id })
      .where(eq(couple.id, profile.id));

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
