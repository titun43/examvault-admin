import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Return subscription for userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const subscription = await db.subscription.findUnique({
      where: { userId },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create/activate subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan, price, paymentId, paymentMethod } = body;

    if (!userId || !plan || !price) {
      return NextResponse.json(
        { error: "userId, plan, and price are required" },
        { status: 400 }
      );
    }

    // Check if user already has a subscription
    const existing = await db.subscription.findUnique({
      where: { userId },
    });

    if (existing) {
      // Update existing subscription
      const now = new Date();
      const expiresAt = new Date(now);

      if (plan === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (plan === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      const subscription = await db.subscription.update({
        where: { userId },
        data: {
          plan,
          price,
          startedAt: now,
          expiresAt,
          isActive: true,
          paymentId: paymentId || null,
          paymentMethod: paymentMethod || null,
        },
      });

      return NextResponse.json({ subscription });
    }

    // Create new subscription
    const now = new Date();
    const expiresAt = new Date(now);

    if (plan === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        plan,
        price,
        startedAt: now,
        expiresAt,
        isActive: true,
        paymentId: paymentId || null,
        paymentMethod: paymentMethod || null,
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    console.error("Subscription create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
