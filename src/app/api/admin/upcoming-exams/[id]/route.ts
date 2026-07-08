import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT: Update upcoming exam
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      categoryId,
      name,
      examDate,
      lastApplyDate,
      description,
      image,
      notificationLink,
      tags,
      isActive,
    } = body;

    const upcomingExam = await db.upcomingExam.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(name !== undefined && { name }),
        ...(examDate !== undefined && { examDate: new Date(examDate) }),
        ...(lastApplyDate !== undefined && {
          lastApplyDate: lastApplyDate ? new Date(lastApplyDate) : null,
        }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(notificationLink !== undefined && { notificationLink }),
        ...(tags !== undefined && { tags }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ upcomingExam });
  } catch (error) {
    console.error("Admin upcoming exam update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete upcoming exam
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.upcomingExam.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Upcoming exam deleted successfully" });
  } catch (error) {
    console.error("Admin upcoming exam delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
