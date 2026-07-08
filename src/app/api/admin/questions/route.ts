import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: List questions by testId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json(
        { error: "testId query parameter is required" },
        { status: 400 }
      );
    }

    const questions = await db.question.findMany({
      where: { testId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Admin questions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create question (using imageUrl instead of image)
export async function POST(request: NextRequest) {
  try {
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

    if (!testId || !text || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json(
        { error: "testId, text, all options, and correctAnswer are required" },
        { status: 400 }
      );
    }

    const question = await db.question.create({
      data: {
        testId,
        text,
        imageUrl: imageUrl || null,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        explanation: explanation || null,
        marks: marks || 1,
        negativeMarks: negativeMarks || 0,
        topic: topic || null,
        difficulty: difficulty || "medium",
        order: order || 0,
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Admin question create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
