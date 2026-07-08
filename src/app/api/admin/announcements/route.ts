import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: List all announcements
export async function GET() {
  try {
    const announcements = await db.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Admin announcements fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, image, priority, target, isPublished, scheduledAt, type, gradient, emoji, link, buttonText, badgeText, order } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        message,
        image: image || null,
        priority: priority || "info",
        target: target || "all",
        isPublished: isPublished !== undefined ? isPublished : true,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        type: type || "info",
        gradient: gradient || null,
        emoji: emoji || null,
        link: link || null,
        buttonText: buttonText || null,
        badgeText: badgeText || null,
        order: order || 0,
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error("Admin announcement create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
