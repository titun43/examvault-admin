import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT: Update question (using imageUrl instead of image)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      testId,
      text,
      imageUrl,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      marks,
      negativeMarks,
      topic,
      difficulty,
      order,
    } = body;

    const question = await db.question.update({
      where: { id },
      data: {
        ...(testId !== undefined && { testId }),
        ...(text !== undefined && { text }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(optionA !== undefined && { optionA }),
        ...(optionB !== undefined && { optionB }),
        ...(optionC !== undefined && { optionC }),
        ...(optionD !== undefined && { optionD }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(explanation !== undefined && { explanation }),
        ...(marks !== undefined && { marks }),
        ...(negativeMarks !== undefined && { negativeMarks }),
        ...(topic !== undefined && { topic }),
        ...(difficulty !== undefined && { difficulty }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Admin question update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.question.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Admin question delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
