import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT: Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, message, image, priority, target, isPublished, scheduledAt, type, gradient, emoji, link, buttonText, badgeText, order } = body;

    const announcement = await db.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(message !== undefined && { message }),
        ...(image !== undefined && { image }),
        ...(priority !== undefined && { priority }),
        ...(target !== undefined && { target }),
        ...(isPublished !== undefined && { isPublished }),
        ...(scheduledAt !== undefined && {
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        }),
        ...(type !== undefined && { type }),
        ...(gradient !== undefined && { gradient }),
        ...(emoji !== undefined && { emoji }),
        ...(link !== undefined && { link }),
        ...(buttonText !== undefined && { buttonText }),
        ...(badgeText !== undefined && { badgeText }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("Admin announcement update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Admin announcement delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
