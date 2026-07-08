import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || request.headers.get("user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Total attempts
    const totalAttempts = await db.testAttempt.count({
      where: { userId, isCompleted: true },
    });

    // Average score
    const scoreAgg = await db.testAttempt.aggregate({
      where: { userId, isCompleted: true },
      _avg: { score: true },
      _max: { score: true },
    });

    const avgScore = scoreAgg._avg.score || 0;
    const bestScore = scoreAgg._max.score || 0;

    // User info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { streak: true, xp: true, level: true },
    });

    // Subscription status
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: {
        id: true,
        plan: true,
        isActive: true,
        expiresAt: true,
      },
    });

    // Bookmark count
    const bookmarkCount = await db.bookmark.count({
      where: { userId },
    });

    // Leaderboard rank
    const leaderboard = await db.leaderboard.findUnique({
      where: { userId },
      select: { totalScore: true, dailyRank: true, weeklyRank: true, monthlyRank: true },
    });

    // Tests by category (using subject -> category chain)
    const attempts = await db.testAttempt.findMany({
      where: { userId, isCompleted: true },
      include: {
        test: {
          include: {
            subject: {
              include: {
                category: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    const categoryMap = new Map<string, { name: string; count: number; avgScore: number }>();
    for (const attempt of attempts) {
      const category = attempt.test.subject.category;
      const existing = categoryMap.get(category.id);
      if (existing) {
        existing.count++;
        existing.avgScore = (existing.avgScore * (existing.count - 1) + attempt.score) / existing.count;
      } else {
        categoryMap.set(category.id, {
          name: category.name,
          count: 1,
          avgScore: attempt.score,
        });
      }
    }

    // Recent attempts
    const recentAttempts = await db.testAttempt.findMany({
      where: { userId, isCompleted: true },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            subject: {
              select: { name: true, category: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      stats: {
        totalAttempts,
        avgScore: Math.round(avgScore * 100) / 100,
        bestScore,
        streak: user?.streak || 0,
        xp: user?.xp || 0,
        level: user?.level || 1,
        subscription: subscription || null,
        bookmarkCount,
        leaderboardRank: leaderboard
          ? {
              totalScore: leaderboard.totalScore,
              dailyRank: leaderboard.dailyRank,
              weeklyRank: leaderboard.weeklyRank,
              monthlyRank: leaderboard.monthlyRank,
            }
          : null,
      },
      testsByCategory: Array.from(categoryMap.values()),
      recentAttempts,
    });
  } catch (error) {
    console.error("User stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
