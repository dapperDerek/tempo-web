import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { couple, phasePreferences, articles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  calculateCycleInfo,
  phaseContexts,
  type CyclePhase,
} from "@/lib/cycle-calculator";

export interface DailyCard {
  date: string;
  phase: CyclePhase;
  phaseTitle: string;
  dayOfCycle: number;
  daysUntilNextPeriod: number;
  whatIsHappening: string;
  commonMisreads: string[];
  smartMoves: string[];
  article: {
    id: string;
    title: string;
    summary: string;
    readTime: number;
  } | null;
}

// GET /api/daily-card - Get today's context card
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get couple profile
    const coupleProfile = await db
      .select()
      .from(couple)
      .where(eq(couple.userId, session.user.id))
      .limit(1);

    if (coupleProfile.length === 0) {
      return NextResponse.json(
        {
          error: "Couple profile not found. Complete onboarding first.",
          onboardingRequired: true,
        },
        { status: 404 }
      );
    }

    const profile = coupleProfile[0];

    if (!profile.onboardingComplete) {
      return NextResponse.json(
        {
          error: "Onboarding not complete.",
          onboardingRequired: true,
        },
        { status: 400 }
      );
    }

    // Calculate current cycle info
    const cycleInfo = calculateCycleInfo(
      profile.lastPeriodStart,
      profile.cycleLength,
      profile.periodLength
    );

    // Get phase context
    const context = phaseContexts[cycleInfo.phase];

    // Get personalized preferences for this phase
    const preferences = await db
      .select()
      .from(phasePreferences)
      .where(
        and(
          eq(phasePreferences.coupleId, profile.id),
          eq(phasePreferences.phase, cycleInfo.phase)
        )
      )
      .limit(1);

    // Parse smart moves (combine general + personalized)
    let smartMoves = [...context.generalSmartMoves];
    if (preferences.length > 0) {
      const personalizedMoves = JSON.parse(preferences[0].smartMoves || "[]");
      if (personalizedMoves.length > 0) {
        // Replace general moves with personalized ones
        smartMoves = personalizedMoves;
      }
    }

    // Get a random article for this phase
    const phaseArticles = await db
      .select()
      .from(articles)
      .where(and(eq(articles.phase, cycleInfo.phase), eq(articles.published, true)))
      .limit(10);

    let article = null;
    if (phaseArticles.length > 0) {
      // Pick a random article
      const randomArticle =
        phaseArticles[Math.floor(Math.random() * phaseArticles.length)];
      article = {
        id: randomArticle.id,
        title: randomArticle.title,
        summary: randomArticle.summary,
        readTime: randomArticle.readTime,
      };
    }

    const card: DailyCard = {
      date: new Date().toISOString().split("T")[0],
      phase: cycleInfo.phase,
      phaseTitle: context.title,
      dayOfCycle: cycleInfo.dayOfCycle,
      daysUntilNextPeriod: cycleInfo.daysUntilNextPeriod,
      whatIsHappening: context.whatIsHappening,
      commonMisreads: context.commonMisreads,
      smartMoves,
      article,
    };

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error generating daily card:", error);
    return NextResponse.json(
      { error: "Failed to generate daily card" },
      { status: 500 }
    );
  }
}
