import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT: Update current affair
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      date,
      title,
      content,
      summary,
      pdfUrl,
      category,
      categoryId,
      isImportant,
      tags,
    } = body;

    const currentAffair = await db.currentAffair.update({
      where: { id },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(summary !== undefined && { summary }),
        ...(pdfUrl !== undefined && { pdfUrl }),
        ...(category !== undefined && { category }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isImportant !== undefined && { isImportant }),
        ...(tags !== undefined && { tags }),
      },
      include: {
        categoryRef: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ currentAffair });
  } catch (error) {
    console.error("Admin current affair update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete current affair
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.currentAffair.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Current affair deleted successfully" });
  } catch (error) {
    console.error("Admin current affair delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
