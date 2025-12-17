import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { moodCheckIns } from "@/lib/db/schema";
import { getUserCoupleContext, requireHimRole } from "@/lib/couple-auth";
import { eq, and } from "drizzle-orm";
import { calculateCycleInfo, phaseContexts, type CyclePhase } from "@/lib/cycle-calculator";

// Mood interpretations by phase
const moodPhaseInterpretations: Record<
  CyclePhase,
  Record<string, { interpretation: string; smartMoves: string[] }>
> = {
  menstrual: {
    stressed: {
      interpretation: "Low hormone levels + stress means her nervous system is working overtime. She's dealing with physical discomfort AND external pressure.",
      smartMoves: [
        "Take things off her plate without being asked",
        "Don't add decision fatigue—just handle it",
        "Physical comfort matters: heat, rest, quiet",
      ],
    },
    cranky: {
      interpretation: "Cramps, fatigue, and low hormones create a low tolerance for minor irritations. It's not personal—her body is working hard.",
      smartMoves: [
        "Give extra space and patience",
        "Don't take short responses personally",
        "Skip the jokes—timing is everything",
      ],
    },
    energized: {
      interpretation: "Even during her period, she might have moments of clarity or energy. Hormones are low but stable.",
      smartMoves: [
        "Support her momentum, but don't push",
        "She might want to nest or organize",
        "Good time for low-key quality time",
      ],
    },
    frisky: {
      interpretation: "Menstruation doesn't mean zero libido. Some women feel more connected to their bodies during this time.",
      smartMoves: [
        "Follow her lead on intimacy",
        "Normalize and welcome it",
        "Comfort and connection are key",
      ],
    },
    calm: {
      interpretation: "She's in a grounded, introspective space. Hormones are at baseline, which can feel peaceful.",
      smartMoves: [
        "Match her energy—no need to amp things up",
        "Good time for meaningful conversation",
        "Respect her need for stillness",
      ],
    },
  },
  follicular: {
    stressed: {
      interpretation: "Rising estrogen usually boosts mood, but stress can override that. She's capable but overwhelmed.",
      smartMoves: [
        "Help her prioritize—she might be overcommitting",
        "Remind her it's okay to say no",
        "Suggest a break or reset activity",
      ],
    },
    cranky: {
      interpretation: "Unusual for this phase. Something external is likely the cause, not hormones.",
      smartMoves: [
        "Ask what's wrong—don't assume it's hormonal",
        "Listen without trying to fix",
        "Give her agency to solve it",
      ],
    },
    energized: {
      interpretation: "This is peak follicular phase energy. She's feeling capable, creative, and motivated.",
      smartMoves: [
        "Support her projects and ideas",
        "Great time for planning and deep talks",
        "Match her energy with enthusiasm",
      ],
    },
    frisky: {
      interpretation: "Estrogen is climbing, which boosts libido and confidence. She's feeling good in her body.",
      smartMoves: [
        "Initiate connection and intimacy",
        "Compliments land well right now",
        "Quality time and romance go far",
      ],
    },
    calm: {
      interpretation: "She's in a steady, positive state. Hormones are rising but not peaking yet.",
      smartMoves: [
        "Enjoy the ease—no special action needed",
        "Good time for collaboration and teamwork",
        "Build on this momentum together",
      ],
    },
  },
  ovulation: {
    stressed: {
      interpretation: "Peak estrogen usually means peak confidence, but stress can create a mismatch. She's capable but stretched thin.",
      smartMoves: [
        "Acknowledge she's doing a lot",
        "Lighten her load where you can",
        "Don't minimize her stress",
      ],
    },
    cranky: {
      interpretation: "Rare for ovulation. External factors are likely at play, not her cycle.",
      smartMoves: [
        "Ask directly what's bothering her",
        "Don't dismiss it as hormonal",
        "Validate and support",
      ],
    },
    energized: {
      interpretation: "Peak hormonal state. She's feeling confident, social, and at her best.",
      smartMoves: [
        "Appreciate and acknowledge her energy",
        "Great time for adventures or social plans",
        "She'll likely initiate and lead",
      ],
    },
    frisky: {
      interpretation: "Ovulation = peak fertility and peak libido. Biologically primed for connection.",
      smartMoves: [
        "Prioritize intimacy and quality time",
        "She feels attractive and wants to be desired",
        "Show appreciation and attraction",
      ],
    },
    calm: {
      interpretation: "Confident and steady. High estrogen without the intensity.",
      smartMoves: [
        "Match her relaxed confidence",
        "Good time for meaningful connection",
        "Enjoy the emotional closeness",
      ],
    },
  },
  luteal: {
    stressed: {
      interpretation: "Progesterone drop + stress = heightened reactivity. Her nervous system is genuinely more sensitive right now.",
      smartMoves: [
        "Extra patience is essential",
        "Reduce stressors where possible",
        "Validate feelings without trying to fix",
      ],
    },
    cranky: {
      interpretation: "Classic PMS. Progesterone drop makes everything feel more irritating. It's biochemical, not personal.",
      smartMoves: [
        "Give space when she needs it",
        "Don't take things personally",
        "Avoid criticism or 'helpful' suggestions",
      ],
    },
    energized: {
      interpretation: "She might be pushing through luteal fatigue or finding pockets of energy. Less common but possible.",
      smartMoves: [
        "Support her momentum but watch for burnout",
        "She might be masking discomfort",
        "Check in on how she's really feeling",
      ],
    },
    frisky: {
      interpretation: "Progesterone can increase intimacy desire for some, even as energy drops. Connection matters.",
      smartMoves: [
        "Respond to her cues",
        "Emotional intimacy might matter more than physical",
        "Be present and attentive",
      ],
    },
    calm: {
      interpretation: "She's managing the luteal phase well. Hormones are shifting but she's grounded.",
      smartMoves: [
        "Maintain the peace—no drama",
        "Low-key support and presence",
        "Don't rock the boat",
      ],
    },
  },
};

// GET /api/daily-card/enhanced - Get daily card with mood context (Him only)
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

    // Verify user has "him" role
    await requireHimRole(session.user.id, context.coupleId);

    // Get today's mood check-in
    const today = new Date().toISOString().split("T")[0];
    const todayMood = await db
      .select()
      .from(moodCheckIns)
      .where(
        and(
          eq(moodCheckIns.coupleId, context.coupleId),
          eq(moodCheckIns.date, today)
        )
      )
      .limit(1);

    // If no mood check-in today, return null
    if (todayMood.length === 0) {
      return NextResponse.json({ enhancedCard: null });
    }

    const mood = todayMood[0];

    // Calculate current cycle info
    const cycleInfo = calculateCycleInfo(
      context.couple.lastPeriodStart,
      context.couple.cycleLength,
      context.couple.periodLength
    );

    // Get mood-phase interpretation
    const moodKey = mood.mood.toLowerCase();
    const phaseInterpretations = moodPhaseInterpretations[cycleInfo.phase];
    const interpretation = phaseInterpretations[moodKey] || {
      interpretation: `She's feeling ${mood.mood} during the ${cycleInfo.phase} phase.`,
      smartMoves: phaseContexts[cycleInfo.phase].generalSmartMoves,
    };

    return NextResponse.json({
      enhancedCard: {
        date: today,
        phase: cycleInfo.phase,
        phaseTitle: phaseContexts[cycleInfo.phase].title,
        dayOfCycle: cycleInfo.dayOfCycle,
        mood: mood.mood,
        moodNote: mood.note,
        moodContext: {
          interpretation: interpretation.interpretation,
          smartMoves: interpretation.smartMoves,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching enhanced daily card:", error);

    if (error instanceof Error && error.message.includes("Him")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch enhanced daily card" },
      { status: 500 }
    );
  }
}
