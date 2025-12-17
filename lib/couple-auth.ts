import { db } from "@/lib/db";
import { couple } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export type CoupleRole = "her" | "him" | null;

export interface CoupleContext {
  coupleId: string;
  role: CoupleRole;
  couple: typeof couple.$inferSelect;
}

/**
 * Get the user's couple and their role within it
 */
export async function getUserCoupleContext(
  userId: string
): Promise<CoupleContext | null> {
  const coupleProfile = await db
    .select()
    .from(couple)
    .where(
      or(
        eq(couple.userId, userId),
        eq(couple.herUserId, userId),
        eq(couple.himUserId, userId)
      )
    )
    .limit(1);

  if (coupleProfile.length === 0) {
    return null;
  }

  const profile = coupleProfile[0];

  // Determine role
  let role: CoupleRole = null;
  if (profile.herUserId === userId) {
    role = "her";
  } else if (profile.himUserId === userId) {
    role = "him";
  }

  return {
    coupleId: profile.id,
    role,
    couple: profile,
  };
}

/**
 * Get the user's role within a specific couple
 */
export async function getCoupleRole(
  userId: string,
  coupleId: string
): Promise<CoupleRole> {
  const coupleProfile = await db
    .select()
    .from(couple)
    .where(eq(couple.id, coupleId))
    .limit(1);

  if (coupleProfile.length === 0) {
    return null;
  }

  const profile = coupleProfile[0];

  if (profile.herUserId === userId) return "her";
  if (profile.himUserId === userId) return "him";
  if (profile.userId === userId) return null; // Legacy/incomplete setup

  return null;
}

/**
 * Require user to have "her" role for this couple
 * Throws error if not authorized
 */
export async function requireHerRole(
  userId: string,
  coupleId: string
): Promise<void> {
  const role = await getCoupleRole(userId, coupleId);
  if (role !== "her") {
    throw new Error("This action can only be performed by Her");
  }
}

/**
 * Require user to have "him" role for this couple
 * Throws error if not authorized
 */
export async function requireHimRole(
  userId: string,
  coupleId: string
): Promise<void> {
  const role = await getCoupleRole(userId, coupleId);
  if (role !== "him") {
    throw new Error("This action can only be performed by Him");
  }
}

/**
 * Require user to be part of this couple (either role)
 * Throws error if not authorized
 */
export async function requireCoupleAccess(
  userId: string,
  coupleId: string
): Promise<CoupleRole> {
  const role = await getCoupleRole(userId, coupleId);
  if (!role) {
    throw new Error("You do not have access to this couple profile");
  }
  return role;
}
