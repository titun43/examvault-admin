import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT: Update test (including publish/unpublish)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      subjectId,
      title,
      slug,
      type,
      duration,
      totalMarks,
      passingMarks,
      isPublished,
      difficulty,
      negativeMarking,
      negativeMarks,
      instructions,
      year,
      examSession,
    } = body;

    const test = await db.test.update({
      where: { id },
      data: {
        ...(subjectId !== undefined && { subjectId }),
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(type !== undefined && { type }),
        ...(duration !== undefined && { duration }),
        ...(totalMarks !== undefined && { totalMarks }),
        ...(passingMarks !== undefined && { passingMarks }),
        ...(isPublished !== undefined && { isPublished }),
        ...(difficulty !== undefined && { difficulty }),
        ...(negativeMarking !== undefined && { negativeMarking }),
        ...(negativeMarks !== undefined && { negativeMarks }),
        ...(instructions !== undefined && { instructions }),
        ...(year !== undefined && { year }),
        ...(examSession !== undefined && { examSession }),
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ test });
  } catch (error) {
    console.error("Admin test update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete test
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.test.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Admin test delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
