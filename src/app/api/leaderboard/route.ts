import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "total"; // daily/weekly/monthly/total

    // Determine which score field to sort by
    let orderByField: string;
    let scoreField: string;
    let rankField: string;

    switch (period) {
      case "daily":
        orderByField = "dailyScore";
        scoreField = "dailyScore";
        rankField = "dailyRank";
        break;
      case "weekly":
        orderByField = "weeklyScore";
        scoreField = "weeklyScore";
        rankField = "weeklyRank";
        break;
      case "monthly":
        orderByField = "monthlyScore";
        scoreField = "monthlyScore";
        rankField = "monthlyRank";
        break;
      default:
        orderByField = "totalScore";
        scoreField = "totalScore";
        rankField = "totalRank";
        break;
    }

    const leaderboard = await db.leaderboard.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            level: true,
          },
        },
      },
      orderBy: { [orderByField]: "desc" },
      take: 50,
    });

    // Add rank
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      score: (entry as Record<string, unknown>)[scoreField],
      rankField,
    }));

    return NextResponse.json({ leaderboard: leaderboardWithRank });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
