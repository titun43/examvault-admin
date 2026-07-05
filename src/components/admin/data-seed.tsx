'use client';

// =============================================================================
// ExamVault - Data Seed Manager
// =============================================================================
// Two buttons:
//   1. "Seed Real Indian Exam Data" — adds 7 categories, 14 subjects,
//      14 tests, 70 questions, 5 banners, 8 announcements, 10 upcoming exams
//      to Firestore. Idempotent — checks for existing slug/name before
//      adding. Safe to run multiple times.
//   2. "Delete All Seeded Data" — removes ONLY documents from the collections
//      listed below. CANNOT delete user-generated content (users, results,
//      bookmarks, subscriptions). Requires double confirmation.
//
// Both operations use the client-side Firebase SDK (same auth context as the
// rest of the admin panel). No server-side firebase-admin needed.
// =============================================================================

import { useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Database, Trash2, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  SEED_CATEGORIES,
  SEED_BANNERS,
  SEED_ANNOUNCEMENTS,
  SEED_UPCOMING_EXAMS,
} from '@/lib/seed-data';

interface LogEntry {
  step: string;
  status: 'pending' | 'done' | 'error';
  detail?: string;
}

export default function DataSeed() {
  const [seeding, setSeeding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm2, setDeleteConfirm2] = useState(false);

  const updateLog = (step: string, status: LogEntry['status'], detail?: string) => {
    setLog((prev) => {
      const idx = prev.findIndex((l) => l.step === step);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { step, status, detail };
        return copy;
      }
      return [...prev, { step, status, detail }];
    });
  };

  // ===========================================================================
  // SEED OPERATION
  // ===========================================================================
  const handleSeed = async () => {
    setSeeding(true);
    setLog([]);

    let categoriesAdded = 0;
    let subjectsAdded = 0;
    let testsAdded = 0;
    let questionsAdded = 0;
    let bannersAdded = 0;
    let announcementsAdded = 0;
    let upcomingExamsAdded = 0;

    try {
      // -------------------------------------------------------------------
      // Step 1: Categories, Subjects, Tests, Questions
      // -------------------------------------------------------------------
      for (const cat of SEED_CATEGORIES) {
        updateLog(`Category: ${cat.name}`, 'pending');

        // Check if category with same slug exists
        const existingCat = await getDocs(
          query(collection(db, 'categories'), where('slug', '==', cat.slug)),
        );

        let categoryId: string;
        if (!existingCat.empty) {
          categoryId = existingCat.docs[0].id;
          updateLog(`Category: ${cat.name}`, 'done', `Already exists (id: ${categoryId.slice(0, 8)}...)`);
        } else {
          const catRef = await addDoc(collection(db, 'categories'), {
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
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          categoryId = catRef.id;
          categoriesAdded++;
          updateLog(`Category: ${cat.name}`, 'done', `Added (id: ${categoryId.slice(0, 8)}...)`);
        }

        // Subjects
        for (const subj of cat.subjects) {
          const existingSubj = await getDocs(
            query(collection(db, 'subjects'), where('slug', '==', subj.slug)),
          );

          let subjectId: string;
          if (!existingSubj.empty) {
            subjectId = existingSubj.docs[0].id;
          } else {
            const subjRef = await addDoc(collection(db, 'subjects'), {
              categoryId,
              name: subj.name,
              slug: subj.slug,
              icon: subj.icon,
              description: subj.description,
              order: subj.order,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            subjectId = subjRef.id;
            subjectsAdded++;
          }

          // Tests
          for (const test of subj.tests) {
            const existingTest = await getDocs(
              query(collection(db, 'tests'), where('slug', '==', test.slug)),
            );

            let testId: string;
            if (!existingTest.empty) {
              testId = existingTest.docs[0].id;
            } else {
              const testRef = await addDoc(collection(db, 'tests'), {
                subjectId,
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
                attemptCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
              testId = testRef.id;
              testsAdded++;
            }

            // Questions — check by testId + question text (no slug on questions)
            for (const q of test.questions) {
              const existingQ = await getDocs(
                query(
                  collection(db, 'questions'),
                  where('testId', '==', testId),
                  where('question', '==', q.question),
                ),
              );
              if (existingQ.empty) {
                await addDoc(collection(db, 'questions'), {
                  testId,
                  question: q.question,
                  options: q.options,
                  correctAnswerIndex: q.correctAnswerIndex,
                  explanation: q.explanation,
                  subjectTopic: q.subjectTopic,
                  marks: q.marks,
                  isPremium: q.isPremium,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                questionsAdded++;
              }
            }
          }
        }
      }

      // -------------------------------------------------------------------
      // Step 2: Banners
      // -------------------------------------------------------------------
      updateLog('Banners (5)', 'pending');
      for (const banner of SEED_BANNERS) {
        const existing = await getDocs(
          query(collection(db, 'banners'), where('title', '==', banner.title)),
        );
        if (existing.empty) {
          await addDoc(collection(db, 'banners'), {
            title: banner.title,
            subtitle: banner.subtitle,
            imageUrl: banner.imageUrl,
            link: banner.link,
            linkLabel: banner.linkLabel,
            order: banner.order,
            isActive: banner.isActive,
            startsAt: new Date(banner.startsAt),
            endsAt: new Date(banner.endsAt),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          bannersAdded++;
        }
      }
      updateLog('Banners (5)', 'done', `${bannersAdded} added`);

      // -------------------------------------------------------------------
      // Step 3: Announcements
      // -------------------------------------------------------------------
      updateLog('Announcements (8)', 'pending');
      for (const ann of SEED_ANNOUNCEMENTS) {
        const existing = await getDocs(
          query(collection(db, 'announcements'), where('title', '==', ann.title)),
        );
        if (existing.empty) {
          await addDoc(collection(db, 'announcements'), {
            title: ann.title,
            message: ann.message,
            type: ann.type,
            imageUrl: ann.imageUrl || '',
            link: ann.link || '',
            linkLabel: ann.linkLabel || '',
            isPinned: ann.isPinned,
            isPublished: ann.isPublished,
            order: ann.order,
            expiresAt: new Date(ann.expiresAt),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          announcementsAdded++;
        }
      }
      updateLog('Announcements (8)', 'done', `${announcementsAdded} added`);

      // -------------------------------------------------------------------
      // Step 4: Upcoming Exams
      // -------------------------------------------------------------------
      updateLog('Upcoming Exams (10)', 'pending');

      // Build a slug -> categoryId map by fetching existing categories
      const allCatsSnap = await getDocs(collection(db, 'categories'));
      const slugToCatId: Record<string, string> = {};
      allCatsSnap.forEach((d) => {
        const data = d.data() as { slug?: string };
        if (data.slug) slugToCatId[data.slug] = d.id;
      });

      for (const exam of SEED_UPCOMING_EXAMS) {
        const existing = await getDocs(
          query(collection(db, 'upcoming_exams'), where('name', '==', exam.name)),
        );
        if (existing.empty) {
          const resolvedCategoryId = slugToCatId[exam.categoryIdSlug] || '';
          await addDoc(collection(db, 'upcoming_exams'), {
            name: exam.name,
            organization: exam.organization,
            categoryId: resolvedCategoryId,
            examDate: new Date(exam.examDate),
            applicationStartDate: new Date(exam.applicationStartDate),
            applicationEndDate: new Date(exam.applicationEndDate),
            notificationUrl: exam.notificationUrl,
            syllabusUrl: exam.syllabusUrl,
            imageUrl: exam.imageUrl,
            description: exam.description,
            tags: exam.tags,
            isPublished: exam.isPublished,
            order: exam.order,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          upcomingExamsAdded++;
        }
      }
      updateLog('Upcoming Exams (10)', 'done', `${upcomingExamsAdded} added`);

      // -------------------------------------------------------------------
      // Done
      // -------------------------------------------------------------------
      const summary = [
        `${categoriesAdded}/7 categories`,
        `${subjectsAdded}/14 subjects`,
        `${testsAdded}/14 tests`,
        `${questionsAdded}/70 questions`,
        `${bannersAdded}/5 banners`,
        `${announcementsAdded}/8 announcements`,
        `${upcomingExamsAdded}/10 upcoming exams`,
      ].join(' • ');
      toast.success(`Seed complete: ${summary}`);
      updateLog('✅ Done', 'done', summary);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Seed failed: ${msg}`);
      updateLog('❌ Error', 'error', msg);
    } finally {
      setSeeding(false);
    }
  };

  // ===========================================================================
  // DELETE OPERATION
  // ===========================================================================
  const handleDelete = async () => {
    setDeleting(true);
    setLog([]);
    setDeleteConfirm2(false);
    setDeleteDialogOpen(false);

    // Only deletes from content collections — never user data
    const contentCollections = [
      'banners',
      'announcements',
      'upcoming_exams',
      'current_affairs',
      'questions',
      'tests',
      'subjects',
      'categories',
    ];

    const counts: Record<string, number> = {};

    try {
      for (const colName of contentCollections) {
        updateLog(`Deleting ${colName}...`, 'pending');
        const snap = await getDocs(collection(db, colName));
        if (snap.empty) {
          counts[colName] = 0;
          updateLog(`Deleting ${colName}...`, 'done', 'empty');
          continue;
        }

        // Delete in batches of 450 (Firestore batch limit is 500)
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i += 450) {
          const chunk = docs.slice(i, i + 450);
          const batch = writeBatch(db);
          chunk.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
        counts[colName] = docs.length;
        updateLog(`Deleting ${colName}...`, 'done', `${docs.length} deleted`);
      }

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      toast.success(`Deleted ${total} documents from ${contentCollections.length} collections`);
      updateLog('✅ Done', 'done', `${total} total documents deleted`);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Delete failed: ${msg}`);
      updateLog('❌ Error', 'error', msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================== Header ===================== */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            Data Seed Manager
          </h2>
          <p className="text-slate-500 mt-1 text-sm max-w-2xl">
            Seed the app with real Indian exam-prep data (LIC, SSC, Banking, UPSC,
            Assam, West Bengal, Uttar Pradesh), or wipe all content collections to
            start fresh. Indian Railways category is preserved if it already exists.
          </p>
        </div>
      </div>

      {/* ===================== Cards ===================== */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* ---- Seed Card ---- */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Seed Real Indian Exam Data</h3>
                <p className="text-xs text-slate-500">Idempotent — safe to run multiple times</p>
              </div>
            </div>
            <ul className="text-sm text-slate-600 space-y-1 mb-4">
              <li>• 7 categories (LIC, SSC, Banking, UPSC, Assam, WB, UP)</li>
              <li>• 14 subjects + 14 tests + 70 questions</li>
              <li>• 5 banners (homepage promotional)</li>
              <li>• 8 announcements (exam notifications)</li>
              <li>• 10 upcoming exams (real 2025-2026 dates)</li>
            </ul>
            <Button
              onClick={handleSeed}
              disabled={seeding || deleting}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Seed Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ---- Delete Card ---- */}
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Delete All Content</h3>
                <p className="text-xs text-slate-500">Destructive — requires double confirmation</p>
              </div>
            </div>
            <ul className="text-sm text-slate-600 space-y-1 mb-4">
              <li>• banners, announcements, upcoming_exams</li>
              <li>• current_affairs, questions, tests</li>
              <li>• subjects, categories</li>
              <li className="text-emerald-700 font-medium">
                ✓ Never deletes: users, results, bookmarks, payments, subscriptions
              </li>
            </ul>
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              disabled={seeding || deleting}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Content
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ===================== Progress Log ===================== */}
      {(seeding || deleting || log.length > 0) && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Loader2
                className={`w-4 h-4 ${(seeding || deleting) ? 'animate-spin' : 'hidden'}`}
              />
              {seeding ? 'Seeding progress' : deleting ? 'Deletion progress' : 'Last operation log'}
            </h4>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {log.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm font-mono py-1 border-b border-slate-100 last:border-0"
                >
                  {entry.status === 'pending' && <Loader2 className="w-3.5 h-3.5 mt-0.5 animate-spin text-slate-400 flex-shrink-0" />}
                  {entry.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-600 flex-shrink-0" />}
                  {entry.status === 'error' && <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-red-600 flex-shrink-0" />}
                  <span className="text-slate-700 flex-1">{entry.step}</span>
                  {entry.detail && (
                    <span className="text-slate-400 text-xs">{entry.detail}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===================== Double Confirmation Dialog ===================== */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-700">
              ⚠️ Delete ALL content data?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This will permanently delete all documents from these collections:
                  <span className="font-mono text-xs block mt-1 p-2 bg-slate-100 rounded">
                    banners, announcements, upcoming_exams, current_affairs,
                    questions, tests, subjects, categories
                  </span>
                </p>
                <p className="text-emerald-700 font-medium">
                  ✓ User data (users, results, bookmarks, payments, subscriptions) is SAFE.
                </p>
                <p className="text-red-600 font-medium">
                  ✗ This action cannot be undone. All seeded exam content will be lost.
                </p>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={deleteConfirm2}
                    onChange={(e) => setDeleteConfirm2(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700">
                    I understand this is permanent and irreversible
                  </span>
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!deleteConfirm2}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
