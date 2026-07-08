import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const test = await db.test.findUnique({
      where: { id, isPublished: true },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            text: true,
            imageUrl: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            marks: true,
            negativeMarks: true,
            topic: true,
            difficulty: true,
            order: true,
            // Deliberately NOT selecting correctAnswer for test-taking
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            category: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { questions: true, testAttempts: true },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error) {
    console.error("Test fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
