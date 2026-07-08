import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Bulk create questions from JSON array (using imageUrl instead of image)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, questions } = body;

    if (!testId || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "testId and questions array are required" },
        { status: 400 }
      );
    }

    const questionData = questions.map((q: any, index: number) => ({
      testId,
      text: q.text as string,
      imageUrl: (q.imageUrl as string) || null,
      optionA: q.optionA as string,
      optionB: q.optionB as string,
      optionC: q.optionC as string,
      optionD: q.optionD as string,
      correctAnswer: q.correctAnswer as string,
      explanation: (q.explanation as string) || null,
      marks: (q.marks as number) || 1,
      negativeMarks: (q.negativeMarks as number) || 0,
      topic: (q.topic as string) || null,
      difficulty: (q.difficulty as string) || "medium",
      order: (q.order as number) || index,
    }));

    const result = await db.question.createMany({
      data: questionData,
    });

    return NextResponse.json(
      { message: `Created ${result.count} questions`, count: result.count },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin questions bulk create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
