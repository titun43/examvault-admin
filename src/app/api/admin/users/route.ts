import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: List all users with stats and subscription info
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        state: true,
        streak: true,
        xp: true,
        level: true,
        lastActiveAt: true,
        createdAt: true,
        _count: {
          select: { testAttempts: true },
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            isActive: true,
            expiresAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
