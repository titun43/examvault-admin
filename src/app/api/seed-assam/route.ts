// =============================================================================
// ExamVault Admin — Seed Assam Data API
// POST /api/seed-assam
// Uploads all Assam-specific seed data (categories, subjects, tests, questions,
// banners, upcoming exams, current affairs, announcements) to Firestore.
// Requires admin authentication.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyAdminToken } from "@/lib/admin-token";
import {
  ADDITIONAL_ASSAM_CATEGORIES,
  ASSAM_DAILY_QUIZZES,
  ADDITIONAL_ASSAM_UPCOMING_EXAMS,
  ADDITIONAL_ASSAM_BANNERS,
  ADDITIONAL_ASSAM_CURRENT_AFFAIRS,
  ADDITIONAL_ASSAM_ANNOUNCEMENTS,
} from "@/seed-data/06-assam-extra";

export async function POST(request: NextRequest) {
  // Verify admin auth
  const adminCheck = await verifyAdminToken(request);
  if (!adminCheck.ok) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const results = {
    categories: 0,
    subjects: 0,
    tests: 0,
    questions: 0,
    banners: 0,
    upcomingExams: 0,
    currentAffairs: 0,
    announcements: 0,
    errors: [] as string[],
  };

  try {
    // ================================================================
    // 1. Categories + Subjects + Tests + Questions
    // ================================================================
    const allCategories = [...ADDITIONAL_ASSAM_CATEGORIES, ...ASSAM_DAILY_QUIZZES];

    for (const cat of allCategories) {
      try {
        // Add category
        const catRef = doc(collection(db, "categories"));
        const catData: Record<string, any> = {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          image: cat.image,
          color: cat.color,
          order: cat.order,
          isPremium: cat.isPremium,
          premiumPrice: cat.premiumPrice,
          premiumDurationMonths: cat.premiumDurationMonths,
          subjectCount: cat.subjects.length,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(catRef, catData);
        results.categories++;

        // Add subjects
        for (const subj of cat.subjects) {
          try {
            const subjRef = doc(collection(db, "subjects"));
            const subjData: Record<string, any> = {
              name: subj.name,
              slug: subj.slug,
              icon: subj.icon,
              description: subj.description,
              order: subj.order,
              categoryId: catRef.id,
              categoryName: cat.name,
              testCount: subj.tests.length,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(subjRef, subjData);
            results.subjects++;

            // Add tests
            for (const test of subj.tests) {
              try {
                const testRef = doc(collection(db, "tests"));
                const testData: Record<string, any> = {
                  title: test.title,
                  slug: test.slug,
                  type: test.type,
                  duration: test.duration,
                  totalMarks: test.totalMarks,
                  passingMarks: test.passingMarks,
                  isPublished: test.isPublished,
                  difficulty: test.difficulty,
                  negativeMarking: test.negativeMarking,
                  negativeMarks: test.negativeMarks,
                  instructions: test.instructions,
                  year: test.year,
                  examSession: test.examSession,
                  isPremium: test.isPremium,
                  price: test.price,
                  categoryId: catRef.id,
                  categoryName: cat.name,
                  subjectId: subjRef.id,
                  subjectName: subj.name,
                  attemptCount: 0,
                  questionCount: test.questions.length,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                };
                await setDoc(testRef, testData);
                results.tests++;

                // Add questions (batch — max 500 per batch)
                const batchSize = Math.min(test.questions.length, 450);
                const batch = writeBatch(db);
                for (let i = 0; i < batchSize; i++) {
                  const q = test.questions[i];
                  const qRef = doc(collection(db, "questions"));
                  batch.set(qRef, {
                    ...q,
                    testId: testRef.id,
                    testTitle: test.title,
                    subjectId: subjRef.id,
                    subjectName: subj.name,
                    categoryId: catRef.id,
                    categoryName: cat.name,
                    order: i + 1,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });
                  results.questions++;
                }
                await batch.commit();
              } catch (e: any) {
                results.errors.push(`Test "${test.title}": ${e.message}`);
              }
            }
          } catch (e: any) {
            results.errors.push(`Subject "${subj.name}": ${e.message}`);
          }
        }
      } catch (e: any) {
        results.errors.push(`Category "${cat.name}": ${e.message}`);
      }
    }

    // ================================================================
    // 2. Banners
    // ================================================================
    for (const banner of ADDITIONAL_ASSAM_BANNERS) {
      try {
        const bRef = doc(collection(db, "banners"));
        await setDoc(bRef, {
          ...banner,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.banners++;
      } catch (e: any) {
        results.errors.push(`Banner "${banner.title}": ${e.message}`);
      }
    }

    // ================================================================
    // 3. Upcoming Exams
    // ================================================================
    for (const exam of ADDITIONAL_ASSAM_UPCOMING_EXAMS) {
      try {
        const eRef = doc(collection(db, "upcomingExams"));
        await setDoc(eRef, {
          ...exam,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.upcomingExams++;
      } catch (e: any) {
        results.errors.push(`Upcoming Exam "${exam.name}": ${e.message}`);
      }
    }

    // ================================================================
    // 4. Current Affairs
    // ================================================================
    for (const ca of ADDITIONAL_ASSAM_CURRENT_AFFAIRS) {
      try {
        const caRef = doc(collection(db, "currentAffairs"));
        await setDoc(caRef, {
          ...ca,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.currentAffairs++;
      } catch (e: any) {
        results.errors.push(`Current Affair "${ca.title}": ${e.message}`);
      }
    }

    // ================================================================
    // 5. Announcements
    // ================================================================
    for (const ann of ADDITIONAL_ASSAM_ANNOUNCEMENTS) {
      try {
        const aRef = doc(collection(db, "announcements"));
        await setDoc(aRef, {
          ...ann,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.announcements++;
      } catch (e: any) {
        results.errors.push(`Announcement "${ann.title}": ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Assam data seeded successfully!",
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        results,
      },
      { status: 500 }
    );
  }
}

// Helper: setDoc wrapper (imported but need to add to imports)
async function setDoc(ref: any, data: any) {
  const { setDoc: fsSetDoc } = await import("firebase/firestore");
  await fsSetDoc(ref, data);
}
