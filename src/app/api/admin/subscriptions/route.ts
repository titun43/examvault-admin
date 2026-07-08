import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Return all subscriptions with user info
export async function GET() {
  try {
    const subscriptions = await db.subscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Admin subscriptions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update subscription (activate/deactivate/extend)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, plan, expiresAt, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Subscription id is required" },
        { status: 400 }
      );
    }

    const existing = await db.subscription.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (action === "activate") {
      updateData.isActive = true;
    } else if (action === "deactivate") {
      updateData.isActive = false;
    } else if (action === "extend") {
      const currentExpiry = new Date(existing.expiresAt);
      currentExpiry.setMonth(currentExpiry.getMonth() + 1);
      updateData.expiresAt = currentExpiry;
    }

    // Allow direct field updates too
    if (plan !== undefined) updateData.plan = plan;
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
    if (isActive !== undefined) updateData.isActive = isActive;

    const subscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Admin subscription update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
