import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Return bookmarks for a userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const bookmarks = await db.bookmark.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            imageUrl: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctAnswer: true,
            explanation: true,
            marks: true,
            topic: true,
            difficulty: true,
            test: {
              select: {
                id: true,
                title: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                    category: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Bookmarks fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Add bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, questionId, note } = body;

    if (!userId || !questionId) {
      return NextResponse.json(
        { error: "userId and questionId are required" },
        { status: 400 }
      );
    }

    // Check if bookmark already exists
    const existing = await db.bookmark.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bookmark already exists", bookmark: existing },
        { status: 409 }
      );
    }

    // Verify question exists
    const question = await db.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const bookmark = await db.bookmark.create({
      data: {
        userId,
        questionId,
        note: note || null,
      },
    });

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error("Bookmark create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove bookmark
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const questionId = searchParams.get("questionId");

    if (!userId || !questionId) {
      return NextResponse.json(
        { error: "userId and questionId are required" },
        { status: 400 }
      );
    }

    const bookmark = await db.bookmark.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    await db.bookmark.delete({
      where: {
        userId_questionId: { userId, questionId },
      },
    });

    return NextResponse.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Bookmark delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
