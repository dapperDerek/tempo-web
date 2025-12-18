import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { couple } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

// Generate a random 6-character invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/couple - Get couple profile
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find couple where user is Her or Him
    const coupleProfile = await db
      .select()
      .from(couple)
      .where(
        or(
          eq(couple.herUserId, session.user.id),
          eq(couple.himUserId, session.user.id)
        )
      )
      .limit(1);

    if (coupleProfile.length === 0) {
      return NextResponse.json({ couple: null });
    }

    // Determine user's role
    let role = null;
    if (coupleProfile[0].herUserId === session.user.id) {
      role = "her";
    } else if (coupleProfile[0].himUserId === session.user.id) {
      role = "him";
    }

    return NextResponse.json({
      couple: coupleProfile[0],
      role,
    });
  } catch (error) {
    console.error("Error fetching couple:", error);
    return NextResponse.json(
      { error: "Failed to fetch couple profile" },
      { status: 500 }
    );
  }
}

// POST /api/couple - Create or update couple profile
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      cycleLength,
      periodLength,
      role, // "him" or "her" - who is creating this profile
    } = body;

    // Validation
    if (!role || !["him", "her"].includes(role)) {
      return NextResponse.json(
        { error: "Role is required and must be 'him' or 'her'" },
        { status: 400 }
      );
    }

    // Check if couple profile already exists for this user
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

    const now = new Date();
    let coupleId: string;
    let inviteCode: string;

    if (existingCouple.length > 0) {
      // Update existing
      const updateData: {
        cycleLength: number;
        periodLength: number;
        herUserId?: string;
        himUserId?: string;
      } = {
        cycleLength: cycleLength || 28,
        periodLength: periodLength || 5,
      };

      // Ensure the user's role is set correctly
      if (role === "her") {
        updateData.herUserId = session.user.id;
      } else if (role === "him") {
        updateData.himUserId = session.user.id;
      }

      await db
        .update(couple)
        .set(updateData)
        .where(eq(couple.id, existingCouple[0].id));

      coupleId = existingCouple[0].id;
      inviteCode = existingCouple[0].inviteCode || generateInviteCode();

      // Update invite code if it wasn't set
      if (!existingCouple[0].inviteCode) {
        await db
          .update(couple)
          .set({ inviteCode })
          .where(eq(couple.id, coupleId));
      }
    } else {
      // Create new
      coupleId = crypto.randomUUID();
      inviteCode = generateInviteCode();

      await db.insert(couple).values({
        id: coupleId,
        herUserId: role === "her" ? session.user.id : null,
        himUserId: role === "him" ? session.user.id : null,
        cycleLength: cycleLength || 28,
        periodLength: periodLength || 5,
        inviteCode,
        createdAt: now,
      });
    }

    // Fetch updated couple
    const updatedCouple = await db
      .select()
      .from(couple)
      .where(eq(couple.id, coupleId))
      .limit(1);

    // Determine user's role in response
    let userRole = null;
    if (updatedCouple[0].herUserId === session.user.id) {
      userRole = "her";
    } else if (updatedCouple[0].himUserId === session.user.id) {
      userRole = "him";
    }

    return NextResponse.json({
      couple: updatedCouple[0],
      role: userRole,
      inviteCode: updatedCouple[0].inviteCode,
    });
  } catch (error) {
    console.error("Error creating/updating couple:", error);
    return NextResponse.json(
      { error: "Failed to save couple profile" },
      { status: 500 }
    );
  }
}
