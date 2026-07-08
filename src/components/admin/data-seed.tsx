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

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
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
import { Loader2, Database, Trash2, CheckCircle2, AlertTriangle, Sparkles, Activity, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  SEED_CATEGORIES,
  SEED_BANNERS,
  SEED_ANNOUNCEMENTS,
  SEED_UPCOMING_EXAMS,
  SEED_CURRENT_AFFAIRS,
} from '@/lib/seed-data';

interface LogEntry {
  step: string;
  status: 'pending' | 'done' | 'error';
  detail?: string;
}

// Expected counts after a successful seed. Used by the status panel to tell
// the user at a glance whether data is present, partial, or missing.
const EXPECTED: Record<string, { label: string; min: number }> = {
  categories:       { label: 'Categories',       min: 8 },  // 7 seeded + Indian Railways
  subjects:         { label: 'Subjects',         min: 26 },
  tests:            { label: 'Tests',            min: 26 },
  questions:        { label: 'Questions',         min: 130 },
  banners:          { label: 'Banners',          min: 5 },
  announcements:    { label: 'Announcements',    min: 8 },
  upcoming_exams:   { label: 'Upcoming Exams',   min: 10 },
  current_affairs:  { label: 'Current Affairs',  min: 15 },
};

export default function DataSeed() {
  const [seeding, setSeeding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm2, setDeleteConfirm2] = useState(false);
  // Live counts for each content collection. Updated in real-time via
  // onSnapshot so the admin can see exactly what's in Firestore right now —
  // no more guessing whether the seed ran.
  const [counts, setCounts] = useState<Record<string, number>>({
    categories: 0, subjects: 0, tests: 0, questions: 0,
    banners: 0, announcements: 0, upcoming_exams: 0, current_affairs: 0,
  });

  useEffect(() => {
    const cols = Object.keys(EXPECTED);
    const unsubs = cols.map((name) =>
      onSnapshot(
        collection(db, name),
        (snap) => setCounts((prev) => ({ ...prev, [name]: snap.size })),
        () => {},
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, []);

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
  // SYNC COUNTS OPERATION (standalone — recomputes subjectCount & testCount)
  // ===========================================================================
  // The Flutter user app reads `category.subjectCount` and `subject.testCount`
  // directly from Firestore. If these fields are missing or stale (which can
  // happen when data is added via seed, bulk-import, or manual edit and the
  // auto-sync on the Categories/Subjects page silently failed — its
  // batch.commit().catch(() => {}) swallows errors), the user app shows
  // "0 Subjects" on category cards even though the subjects actually exist.
  //
  // This button is a reliable one-click fix: it fetches ALL categories,
  // subjects, and tests fresh, computes the real counts, and writes them
  // back in batches with proper error handling. Safe to run anytime.
  // ===========================================================================
  const handleSyncCounts = async () => {
    setSyncing(true);
    try {
      toast.info('Syncing counts…');
      const [allCatsSnap, allSubjectsSnap, allTestsSnap, allQuestionsSnap] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'subjects')),
        getDocs(collection(db, 'tests')),
        getDocs(collection(db, 'questions')),
      ]);

      // Count subjects per category (by categoryId field on each subject doc)
      const subjCountByCat: Record<string, number> = {};
      allSubjectsSnap.forEach((d) => {
        const catId = (d.data() as any)?.categoryId;
        if (catId) subjCountByCat[catId] = (subjCountByCat[catId] || 0) + 1;
      });

      // Count tests per subject (by subjectId field on each test doc)
      const testCountBySubj: Record<string, number> = {};
      allTestsSnap.forEach((d) => {
        const sId = (d.data() as any)?.subjectId;
        if (sId) testCountBySubj[sId] = (testCountBySubj[sId] || 0) + 1;
      });

      // Count questions per test (by testId field on each question doc)
      const qCountByTest: Record<string, number> = {};
      allQuestionsSnap.forEach((d) => {
        const tId = (d.data() as any)?.testId;
        if (tId) qCountByTest[tId] = (qCountByTest[tId] || 0) + 1;
      });

      // Write back category.subjectCount
      let catsFixed = 0;
      const catBatch = writeBatch(db);
      allCatsSnap.forEach((d) => {
        const correct = subjCountByCat[d.id] || 0;
        const stored = (d.data() as any)?.subjectCount ?? -1;
        if (stored !== correct) {
          catBatch.update(d.ref, { subjectCount: correct, updatedAt: serverTimestamp() });
          catsFixed++;
        }
      });
      if (catsFixed > 0) await catBatch.commit();

      // Write back subject.testCount
      let subjsFixed = 0;
      const subjBatch = writeBatch(db);
      allSubjectsSnap.forEach((d) => {
        const correct = testCountBySubj[d.id] || 0;
        const stored = (d.data() as any)?.testCount ?? -1;
        if (stored !== correct) {
          subjBatch.update(d.ref, { testCount: correct, updatedAt: serverTimestamp() });
          subjsFixed++;
        }
      });
      if (subjsFixed > 0) await subjBatch.commit();

      // Write back test.questionCount — the Flutter app shows "N Questions"
      // on every test card. Without this, seeded tests show "0 Questions".
      let testsFixed = 0;
      const testBatch = writeBatch(db);
      allTestsSnap.forEach((d) => {
        const correct = qCountByTest[d.id] || 0;
        const stored = (d.data() as any)?.questionCount ?? -1;
        if (stored !== correct) {
          testBatch.update(d.ref, { questionCount: correct, updatedAt: serverTimestamp() });
          testsFixed++;
        }
      });
      if (testsFixed > 0) await testBatch.commit();

      toast.success(
        `Synced ✓ ${catsFixed} categor${catsFixed === 1 ? 'y' : 'ies'} + ${subjsFixed} subject${subjsFixed === 1 ? '' : 's'} + ${testsFixed} test${testsFixed === 1 ? '' : 's'} updated. Pull-to-refresh in the user app to see the counts.`,
      );
    } catch (e) {
      console.error('[syncCounts]', e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Sync failed: ${msg}`);
    } finally {
      setSyncing(false);
    }
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
    let currentAffairsAdded = 0;

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
            // Defensive: ensure the field exists immediately so the Flutter
            // app never reads a missing subjectCount (defaults to 0). Step 6
            // below will overwrite with the real count.
            subjectCount: 0,
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
              // Defensive: ensure the field exists immediately.
              testCount: 0,
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
                // Defensive: ensure the field exists immediately so the
                // Flutter app never reads a missing questionCount (defaults
                // to 0, showing "0 Questions"). Step 6 overwrites with the
                // real count after all questions are added.
                questionCount: 0,
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
        const payload = {
          subtitle: banner.subtitle,
          imageUrl: banner.imageUrl,
          link: banner.link,
          linkLabel: banner.linkLabel,
          order: banner.order,
          isActive: banner.isActive,
          // IMPORTANT: startsAt MUST be in the past, otherwise the Flutter
          // app's BannerModel.isVisible check (now.isBefore(startsAt) →
          // hidden) will hide the banner from users. We always overwrite
          // the dates here so any previously-seeded banner with a bad
          // future start date gets repaired on re-seed.
          startsAt: new Date(banner.startsAt),
          endsAt: new Date(banner.endsAt),
          updatedAt: serverTimestamp(),
        };
        if (existing.empty) {
          await addDoc(collection(db, 'banners'), {
            title: banner.title,
            ...payload,
            createdAt: serverTimestamp(),
          });
          bannersAdded++;
        } else {
          // Banner exists — repair its dates + fields in case it was
          // seeded before the startsAt fix.
          await updateDoc(existing.docs[0].ref, payload);
        }
      }
      updateLog('Banners (5)', 'done', `${bannersAdded} added (existing ones date-repaired)`);

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
            officialUrl: exam.officialUrl || null,
            applyUrl: exam.applyUrl || null,
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
      // Step 5: Current Affairs (15 real 2025 entries)
      // -------------------------------------------------------------------
      updateLog('Current Affairs (15)', 'pending');
      for (const ca of SEED_CURRENT_AFFAIRS) {
        const existing = await getDocs(
          query(collection(db, 'current_affairs'), where('title', '==', ca.title)),
        );
        if (existing.empty) {
          await addDoc(collection(db, 'current_affairs'), {
            date: new Date(ca.date),
            title: ca.title,
            summary: ca.summary,
            content: ca.content,
            source: ca.source || null,
            category: ca.category || null,
            categoryId: ca.categoryId || null,
            isImportant: !!ca.isImportant,
            tags: ca.tags || [],
            pdfUrl: ca.pdfUrl || null,
            imageUrl: ca.imageUrl || null,
            isPublished: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          currentAffairsAdded++;
        }
      }
      updateLog('Current Affairs (15)', 'done', `${currentAffairsAdded} added`);

      // -------------------------------------------------------------------
      // Step 6: Sync counts (subjectCount on categories, testCount on subjects)
      // The Flutter app reads `category.subjectCount` and `subject.testCount`
      // directly from Firestore. If these are 0 (the default), the user app
      // shows "0 Subjects" on category cards and "0" in the Tests column —
      // even though the subjects/tests actually exist. This step computes the
      // real counts from the subjects/tests collections and writes them back.
      // -------------------------------------------------------------------
      updateLog('Syncing counts', 'pending');
      const allSubjectsSnap = await getDocs(collection(db, 'subjects'));
      const subjCountByCat: Record<string, number> = {};
      allSubjectsSnap.forEach((d) => {
        const catId = (d.data() as any)?.categoryId;
        if (catId) subjCountByCat[catId] = (subjCountByCat[catId] || 0) + 1;
      });
      const allTestsSnap = await getDocs(collection(db, 'tests'));
      const testCountBySubj: Record<string, number> = {};
      allTestsSnap.forEach((d) => {
        const sId = (d.data() as any)?.subjectId;
        if (sId) testCountBySubj[sId] = (testCountBySubj[sId] || 0) + 1;
      });
      // Write back category.subjectCount
      let catsFixed = 0;
      const catBatch = writeBatch(db);
      allCatsSnap.forEach((d) => {
        const correct = subjCountByCat[d.id] || 0;
        const stored = (d.data() as any)?.subjectCount ?? -1;
        if (stored !== correct) {
          catBatch.update(d.ref, { subjectCount: correct, updatedAt: serverTimestamp() });
          catsFixed++;
        }
      });
      if (catsFixed > 0) await catBatch.commit();
      // Write back subject.testCount
      let subjsFixed = 0;
      const subjBatch = writeBatch(db);
      allSubjectsSnap.forEach((d) => {
        const correct = testCountBySubj[d.id] || 0;
        const stored = (d.data() as any)?.testCount ?? -1;
        if (stored !== correct) {
          subjBatch.update(d.ref, { testCount: correct, updatedAt: serverTimestamp() });
          subjsFixed++;
        }
      });
      if (subjsFixed > 0) await subjBatch.commit();
      // Write back test.questionCount — the Flutter app reads
      // `test.questionCount` directly to show "N Questions" on test cards.
      // The seed creates test docs with questionCount: 0 then adds questions
      // separately, so without this write-back every test shows "0 Questions".
      const allQuestionsSnap = await getDocs(collection(db, 'questions'));
      const qCountByTest: Record<string, number> = {};
      allQuestionsSnap.forEach((d) => {
        const tId = (d.data() as any)?.testId;
        if (tId) qCountByTest[tId] = (qCountByTest[tId] || 0) + 1;
      });
      let testsFixed = 0;
      const testBatch = writeBatch(db);
      allTestsSnap.forEach((d) => {
        const correct = qCountByTest[d.id] || 0;
        const stored = (d.data() as any)?.questionCount ?? -1;
        if (stored !== correct) {
          testBatch.update(d.ref, { questionCount: correct, updatedAt: serverTimestamp() });
          testsFixed++;
        }
      });
      if (testsFixed > 0) await testBatch.commit();
      updateLog('Syncing counts', 'done', `${catsFixed} categories + ${subjsFixed} subjects + ${testsFixed} tests updated`);

      // -------------------------------------------------------------------
      // Done
      // -------------------------------------------------------------------
      const summary = [
        `${categoriesAdded}/13 categories`,
        `${subjectsAdded}/26 subjects`,
        `${testsAdded}/26 tests`,
        `${questionsAdded}/130 questions`,
        `${bannersAdded}/5 banners`,
        `${announcementsAdded}/8 announcements`,
        `${upcomingExamsAdded}/10 upcoming exams`,
        `${currentAffairsAdded}/15 current affairs`,
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
            Seed the app with real Indian exam-prep data — 13 categories (LIC, SSC,
            Banking, UPSC, Assam, WB, UP, Defence, Teaching, Insurance, Police,
            Rajasthan, Maharashtra), 26 subjects, 26 tests, 130 questions, 15 current
            affairs, 5 banners, 8 announcements, 10 upcoming exams with official +
            apply links. Indian Railways category is preserved if it already exists.
          </p>
        </div>
      </div>

      {/* ===================== Live Data Status ===================== */}
      <Card className="border-slate-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-900">Current Data in Firestore (live)</h3>
            <span className="text-xs text-slate-400 ml-auto">updates in real-time</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {Object.entries(EXPECTED).map(([key, exp]) => {
              const n = counts[key] || 0;
              const ok = n >= exp.min;
              const partial = n > 0 && n < exp.min;
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-2.5 text-center ${
                    ok
                      ? 'border-emerald-200 bg-emerald-50'
                      : partial
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-red-200 bg-red-50'
                  }`}
                  title={`Expected ≥ ${exp.min}`}
                >
                  <div className={`text-2xl font-bold ${ok ? 'text-emerald-700' : partial ? 'text-amber-700' : 'text-red-700'}`}>
                    {n}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{exp.label}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">
                    {ok ? '✓ ready' : partial ? 'partial' : 'missing'}
                  </div>
                </div>
              );
            })}
          </div>
          {(counts.categories || 0) === 0 ? (
            <p className="text-xs text-red-600 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              No categories found. Click <span className="font-semibold">“Seed Data”</span> below to populate the app.
            </p>
          ) : (counts.subjects || 0) === 0 ? (
            <p className="text-xs text-amber-700 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Categories exist but no subjects. The seed may have partially failed — click <span className="font-semibold">“Seed Data”</span> again (it’s safe, it skips existing docs).
            </p>
          ) : (
            <p className="text-xs text-emerald-700 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Data is present. If the user app still shows “0 subjects”, pull-to-refresh inside the category — Firestore streams should sync automatically.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ===================== Cards ===================== */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <li>• 13 categories (LIC, SSC, Banking, UPSC, Assam, WB, UP, Defence, Teaching, Insurance, Police, Rajasthan, Maharashtra)</li>
              <li>• 26 subjects + 26 tests + 130 questions</li>
              <li>• 5 banners (homepage promotional)</li>
              <li>• 8 announcements (exam notifications)</li>
              <li>• 10 upcoming exams (real 2025-2026 dates + official/apply links)</li>
              <li>• 15 current affairs (real 2025 events — National, International, Sports, Economy, Science, Technology)</li>
            </ul>
            <Button
              onClick={handleSeed}
              disabled={seeding || deleting || syncing}
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

        {/* ---- Sync Counts Card ---- */}
        <Card className="border-sky-200 bg-sky-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-sky-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Sync Subject / Test / Question Counts</h3>
                <p className="text-xs text-slate-500">Fixes “0 subjects” &amp; “0 Questions” on cards</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Recomputes <code className="text-xs bg-sky-100 px-1 rounded">subjectCount</code> on every
              category, <code className="text-xs bg-sky-100 px-1 rounded">testCount</code> on every
              subject, and <code className="text-xs bg-sky-100 px-1 rounded">questionCount</code> on
              every test from the live collections, then writes the correct values back to Firestore.
            </p>
            <ul className="text-sm text-slate-600 space-y-1 mb-4">
              <li>• Run this after seeding, bulk-import, or manual edits</li>
              <li>• Use it if the user app shows “0 Subjects” or “0 Questions”</li>
              <li>• Safe to run anytime — only writes docs whose count is stale</li>
            </ul>
            <Button
              onClick={handleSyncCounts}
              disabled={seeding || deleting || syncing}
              className="w-full bg-sky-600 hover:bg-sky-700"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Counts Now
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
              disabled={seeding || deleting || syncing}
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
      {(seeding || deleting || syncing || log.length > 0) && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Loader2
                className={`w-4 h-4 ${(seeding || deleting || syncing) ? 'animate-spin' : 'hidden'}`}
              />
              {seeding ? 'Seeding progress' : deleting ? 'Deletion progress' : syncing ? 'Syncing counts' : 'Last operation log'}
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
