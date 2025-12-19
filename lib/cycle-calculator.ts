import { db } from "@/lib/db";
import { periodCheckIns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// Cycle phase calculator
export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

/**
 * Get the last period start date from period check-ins
 * Returns null if no period check-ins found
 */
export async function getLastPeriodStart(
  coupleId: string
): Promise<Date | null> {
  const periodStarts = await db
    .select()
    .from(periodCheckIns)
    .where(eq(periodCheckIns.coupleId, coupleId))
    .orderBy(desc(periodCheckIns.date))
    .limit(100);

  // Find the most recent period start (first day of isActive=true streak)
  for (let i = 0; i < periodStarts.length; i++) {
    if (periodStarts[i].isActive) {
      // Check if this is the start of a period (previous day was not active or doesn't exist)
      if (i === 0) {
        // Most recent check-in and it's active - this is the latest period start
        return new Date(periodStarts[i].date);
      }

      const currentDate = new Date(periodStarts[i].date);
      const previousDate = new Date(periodStarts[i - 1].date);
      const dayDiff = Math.floor(
        (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If there's a gap or the previous day wasn't active, this is a period start
      if (dayDiff > 1 || !periodStarts[i - 1].isActive) {
        return new Date(periodStarts[i].date);
      }
    }
  }

  return null;
}

export interface CycleInfo {
  phase: CyclePhase;
  dayOfCycle: number;
  daysUntilNextPeriod: number;
  phaseDay: number; // Day within the current phase
}

export function calculateCycleInfo(
  lastPeriodStart: Date,
  cycleLength: number = 28,
  periodLength: number = 5,
  targetDate?: Date
): CycleInfo {
  const today = targetDate ? new Date(targetDate) : new Date();
  today.setHours(0, 0, 0, 0);

  const lastPeriod = new Date(lastPeriodStart);
  lastPeriod.setHours(0, 0, 0, 0);

  // Calculate days since last period
  const daysSinceLastPeriod = Math.floor(
    (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate current day in cycle (1-based)
  let dayOfCycle = (daysSinceLastPeriod % cycleLength) + 1;
  if (dayOfCycle > cycleLength) dayOfCycle = 1;

  // Days until next period
  const daysUntilNextPeriod = cycleLength - dayOfCycle + 1;

  // Determine phase and phase day
  let phase: CyclePhase;
  let phaseDay: number;

  if (dayOfCycle <= periodLength) {
    // Menstrual phase (days 1-5)
    phase = "menstrual";
    phaseDay = dayOfCycle;
  } else if (dayOfCycle <= Math.floor(cycleLength / 2) - 2) {
    // Follicular phase (days 6-12 in a 28-day cycle)
    phase = "follicular";
    phaseDay = dayOfCycle - periodLength;
  } else if (dayOfCycle <= Math.floor(cycleLength / 2) + 2) {
    // Ovulation phase (days 13-16 in a 28-day cycle)
    phase = "ovulation";
    phaseDay = dayOfCycle - (Math.floor(cycleLength / 2) - 2);
  } else {
    // Luteal phase (days 17-28 in a 28-day cycle)
    phase = "luteal";
    phaseDay = dayOfCycle - (Math.floor(cycleLength / 2) + 2);
  }

  return {
    phase,
    dayOfCycle,
    daysUntilNextPeriod,
    phaseDay,
  };
}

// Phase descriptions and context
export const phaseContexts: Record<
  CyclePhase,
  {
    title: string;
    whatIsHappening: string;
    commonMisreads: string[];
    generalSmartMoves: string[];
  }
> = {
  menstrual: {
    title: "Menstrual Phase",
    whatIsHappening:
      "Hormone levels (estrogen and progesterone) are at their lowest. Energy may be lower, and she might be more introspective. The body is shedding the uterine lining.",
    commonMisreads: [
      "Lower energy or wanting alone time isn't about you",
      "Physical discomfort might make her seem distant or short",
      "She's not upset—she might just be tired or cramping",
    ],
    generalSmartMoves: [
      "Offer to handle more tasks without being asked",
      "Check in with genuine care, not obligation",
      "Heat pack, favorite snack, low-key evening at home",
    ],
  },
  follicular: {
    title: "Follicular Phase",
    whatIsHappening:
      "Estrogen starts rising. Energy increases, mood tends to lift, and she may feel more social, creative, and motivated. This is often the 'feel-good' phase.",
    commonMisreads: [
      "Higher energy doesn't mean she wants to say yes to everything",
      "She's not necessarily looking for more plans—just feeling capable",
    ],
    generalSmartMoves: [
      "This is a good time for deeper conversations or planning",
      "Support new ideas or projects she's excited about",
      "Date nights and social time tend to go well",
    ],
  },
  ovulation: {
    title: "Ovulation Phase",
    whatIsHappening:
      "Estrogen peaks, testosterone rises slightly. She's likely feeling confident, attractive, and socially connected. Sex drive may be higher.",
    commonMisreads: [
      "She's not flirting with everyone—she just feels good",
      "Increased confidence isn't arrogance or dismissiveness",
    ],
    generalSmartMoves: [
      "Compliment her—she'll receive it well right now",
      "Good time for intimacy and connection",
      "She might appreciate being seen and appreciated",
    ],
  },
  luteal: {
    title: "Luteal Phase",
    whatIsHappening:
      "Progesterone rises, then both estrogen and progesterone drop before the next period. Energy may decline, emotions can feel bigger, and she might be more sensitive or irritable.",
    commonMisreads: [
      "Sensitivity isn't overreacting—her nervous system is genuinely more reactive",
      "Irritability isn't about you—it's hormonal turbulence",
      "Wanting comfort or reassurance isn't weakness",
    ],
    generalSmartMoves: [
      "Give space when she needs it, closeness when she asks",
      "Avoid criticism or jokes that might land wrong",
      "Validate feelings without trying to fix them",
    ],
  },
};
