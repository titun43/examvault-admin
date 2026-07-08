import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalUsers,
      totalTests,
      totalAttempts,
      totalCategories,
      totalSubjects,
      totalQuestions,
      premiumUsers,
    ] = await Promise.all([
      db.user.count(),
      db.test.count(),
      db.testAttempt.count(),
      db.category.count(),
      db.subject.count(),
      db.question.count(),
      db.subscription.count({ where: { isActive: true } }),
    ]);

    // Total revenue from subscriptions
    const revenueAgg = await db.subscription.aggregate({
      where: { isActive: true },
      _sum: { price: true },
    });

    const totalRevenue = revenueAgg._sum.price || 0;

    // Recent activity
    const recentAttempts = await db.testAttempt.findMany({
      where: { isCompleted: true },
      include: {
        user: { select: { name: true, email: true } },
        test: {
          select: {
            title: true,
            subject: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });

    // New users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await db.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    // Average score across all attempts
    const scoreAgg = await db.testAttempt.aggregate({
      where: { isCompleted: true },
      _avg: { score: true },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTests,
        totalAttempts,
        totalCategories,
        totalSubjects,
        totalQuestions,
        premiumUsers,
        totalRevenue,
        newUsersThisWeek,
        avgScore: Math.round((scoreAgg._avg.score || 0) * 100) / 100,
      },
      recentActivity: recentAttempts,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
