import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Start a new test attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Check if test exists and is published
    const test = await db.test.findUnique({
      where: { id: testId },
    });

    if (!test || !test.isPublished) {
      return NextResponse.json(
        { error: "Test not found or not published" },
        { status: 404 }
      );
    }

    // Check for any in-progress attempt
    const existingAttempt = await db.testAttempt.findFirst({
      where: {
        userId,
        testId,
        isCompleted: false,
      },
    });

    if (existingAttempt) {
      return NextResponse.json({ attempt: existingAttempt });
    }

    // Create new attempt
    const attempt = await db.testAttempt.create({
      data: {
        userId,
        testId,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    console.error("Start attempt error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Submit test attempt with answers (using UserAnswer model)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;
    const body = await request.json();
    const { attemptId, userId, answers, timeTaken } = body;

    if (!attemptId || !userId || !answers) {
      return NextResponse.json(
        { error: "attemptId, userId, and answers are required" },
        { status: 400 }
      );
    }

    // Verify the attempt exists and belongs to this user
    const attempt = await db.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== userId || attempt.testId !== testId) {
      return NextResponse.json(
        { error: "Invalid attempt" },
        { status: 404 }
      );
    }

    if (attempt.isCompleted) {
      return NextResponse.json(
        { error: "Attempt already submitted" },
        { status: 400 }
      );
    }

    // Get all questions for the test
    const questions = await db.question.findMany({
      where: { testId },
    });

    // Calculate score
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;
    let score = 0;

    const answerRecords = [];

    for (const question of questions) {
      const userAnswer = answers.find(
        (a: { questionId: string; selectedOption: string | null }) =>
          a.questionId === question.id
      );

      const selectedOption = userAnswer?.selectedOption || null;
      const isCorrect = selectedOption === question.correctAnswer;
      const isSkipped = !selectedOption;

      if (isSkipped) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
        score += question.marks;
      } else {
        wrongCount++;
        score -= question.negativeMarks;
      }

      answerRecords.push({
        attemptId,
        questionId: question.id,
        selectedOption,
        isCorrect,
        timeTaken: userAnswer?.timeTaken || 0,
        isMarked: userAnswer?.isMarked || false,
      });
    }

    // Ensure score is not negative
    score = Math.max(0, score);

    // Update attempt and create answers in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create UserAnswer records (no direct userId)
      await tx.userAnswer.createMany({
        data: answerRecords,
      });

      // Update the attempt
      const updatedAttempt = await tx.testAttempt.update({
        where: { id: attemptId },
        data: {
          isCompleted: true,
          score,
          correctCount,
          wrongCount,
          skippedCount,
          timeTaken: timeTaken || 0,
          submittedAt: new Date(),
        },
        include: {
          test: {
            include: {
              questions: {
                select: {
                  id: true,
                  text: true,
                  optionA: true,
                  optionB: true,
                  optionC: true,
                  optionD: true,
                  correctAnswer: true,
                  explanation: true,
                  marks: true,
                  negativeMarks: true,
                },
              },
            },
          },
          answers: true,
        },
      });

      // Update user XP and streak
      const xpEarned = Math.floor(score * 10) + correctCount * 5;
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned },
          lastActiveAt: new Date(),
        },
      });

      // Update leaderboard scores
      const leaderboard = await tx.leaderboard.findUnique({
        where: { userId },
      });

      if (leaderboard) {
        await tx.leaderboard.update({
          where: { userId },
          data: {
            dailyScore: { increment: Math.floor(score) },
            weeklyScore: { increment: Math.floor(score) },
            monthlyScore: { increment: Math.floor(score) },
            totalScore: { increment: Math.floor(score) },
            lastUpdated: new Date(),
          },
        });
      } else {
        await tx.leaderboard.create({
          data: {
            userId,
            dailyScore: Math.floor(score),
            weeklyScore: Math.floor(score),
            monthlyScore: Math.floor(score),
            totalScore: Math.floor(score),
            lastUpdated: new Date(),
          },
        });
      }

      return updatedAttempt;
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Submit attempt error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
