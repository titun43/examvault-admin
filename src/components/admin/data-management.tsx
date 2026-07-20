'use client';

// =============================================================================
// ExamVault - Data Management (Clear Firebase)
// =============================================================================
// Standalone tool to wipe data from Firestore. Does NOT depend on seed-data.ts.
//
// Two operations:
//   1. "Clear All Content Data" — deletes every document from the content
//      collections (categories, subjects, tests, questions, banners,
//      announcements, upcoming_exams, current_affairs, study_materials, etc.).
//      Does NOT touch user accounts, payments, or support tickets.
//
//   2. "NUKE ALL DATA" — deletes EVERYTHING including users, payments,
//      support tickets, and premium plans. True clean slate. Irreversible.
//
// Both use the client-side Firebase SDK (same auth context as the rest of the
// admin panel). The admin must be signed in; Firestore rules enforce that only
// admins can write/delete.
// =============================================================================

import { useEffect, useState, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Database,
  Bomb,
  ShieldAlert,
  Search,
  FolderTree,
  BookOpen,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Megaphone,
  CalendarClock,
  Newspaper,
} from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
  step: string;
  status: 'pending' | 'done' | 'error';
  detail?: string;
}

// Content collections — seeded exam-prep data. Safe to wipe for a fresh start.
// Does NOT include users, payments, support_tickets, results, or premium_plans.
// NOTE: 'daily_quizzes' is NOT a separate collection — daily quizzes are stored
// in the 'tests' collection with type='dailyQuiz'. So clearing 'tests' covers them.
// NOTE: subject_pack_purchases & exam_pack_purchases are Prisma (SQLite) tables,
// NOT Firestore collections — they cannot be cleared here.
const CONTENT_COLLECTIONS = [
  'questions',
  'tests',
  'subjects',
  'categories',
  'banners',
  'app_open_banners',
  'announcements',
  'upcoming_exams',
  'current_affairs',
  'study_materials',
  'notifications',
] as const;

// ALL Firestore collections — for the NUKE option. Includes operational data.
// Every collection here MUST have a corresponding match block in firestore.rules
// with allow delete: if isAdmin() — otherwise the delete will fail.
const ALL_COLLECTIONS = [
  ...CONTENT_COLLECTIONS,
  'premium_plans',
  'users',
  'payments',
  'test_purchases',
  'results',
  'subscriptions',
  'leaderboard',
  'support_tickets',
] as const;

// Human-readable labels for display
const COLLECTION_LABELS: Record<string, string> = {
  categories: 'Categories',
  subjects: 'Subjects',
  tests: 'Tests',
  questions: 'Questions',
  banners: 'Banners',
  app_open_banners: 'App Open Banners',
  announcements: 'Announcements',
  upcoming_exams: 'Upcoming Exams',
  current_affairs: 'Current Affairs',
  study_materials: 'Study Materials',
  notifications: 'Notifications',
  premium_plans: 'Premium Plans',
  users: 'Users',
  payments: 'Payments',
  test_purchases: 'Test Purchases',
  results: 'Results',
  subscriptions: 'Subscriptions',
  leaderboard: 'Leaderboard',
  support_tickets: 'Support Tickets',
};

// Config for the "Browse & Delete Individual Items" panel.
// Maps each browsable collection to: icon, and whether it's hierarchical
// (deleting a parent should offer to cascade-delete children).
const COLLECTION_BROWSE_CONFIG: Record<
  string,
  { icon: typeof Database; hasChildren: boolean }
> = {
  categories:        { icon: FolderTree,    hasChildren: true  },
  subjects:          { icon: BookOpen,      hasChildren: true  },
  tests:             { icon: FileText,      hasChildren: true  },
  questions:         { icon: HelpCircle,    hasChildren: false },
  banners:           { icon: ImageIcon,     hasChildren: false },
  app_open_banners:  { icon: ImageIcon,     hasChildren: false },
  announcements:     { icon: Megaphone,     hasChildren: false },
  upcoming_exams:    { icon: CalendarClock, hasChildren: false },
  current_affairs:   { icon: Newspaper,     hasChildren: false },
  study_materials:   { icon: BookOpen,      hasChildren: false },
  notifications:     { icon: Megaphone,     hasChildren: false },
};

// Ordered list of collections shown as pills in the browse panel.
const BROWSABLE_COLLECTIONS = [
  'categories', 'subjects', 'tests', 'questions',
  'banners', 'app_open_banners', 'announcements',
  'upcoming_exams', 'current_affairs', 'study_materials', 'notifications',
];

// Returns the primary human-readable name for a document.
const getDisplayName = (colName: string, data: any): string => {
  if (!data) return '(unknown)';
  return String(data.name || data.title || data.question || '(unnamed)');
};

// Returns an optional secondary line (metadata) shown under the name.
const getDisplaySubtitle = (colName: string, data: any): string | null => {
  if (!data) return null;
  const fmtDate = (v: any): string | null => {
    if (!v) return null;
    const d = v?.seconds ? new Date(v.seconds * 1000) : v instanceof Date ? v : null;
    return d ? d.toLocaleDateString() : null;
  };
  switch (colName) {
    case 'categories':
      return [
        data.isPremium ? '★ Premium' : null,
        data.subjectCount != null ? `${data.subjectCount} subjects` : null,
      ].filter(Boolean).join(' • ') || null;
    case 'subjects':
      return [
        data.testCount != null ? `${data.testCount} tests` : null,
        data.categoryId ? `cat:${String(data.categoryId).slice(0, 8)}` : null,
      ].filter(Boolean).join(' • ') || null;
    case 'tests':
      return [
        data.isPremium ? '★ Premium' : null,
        data.questionCount != null ? `${data.questionCount} Qs` : null,
        data.duration ? `${data.duration} min` : null,
      ].filter(Boolean).join(' • ') || null;
    case 'questions':
      return data.testId ? `test:${String(data.testId).slice(0, 8)}` : null;
    case 'banners':
    case 'app_open_banners':
      return data.isActive === false ? 'Inactive' : 'Active';
    case 'announcements':
      return [data.type || null, data.isPinned ? 'Pinned' : null].filter(Boolean).join(' • ') || null;
    case 'upcoming_exams':
      return [data.organization || null, fmtDate(data.examDate)].filter(Boolean).join(' • ') || null;
    case 'current_affairs':
      return [data.category || null, fmtDate(data.date)].filter(Boolean).join(' • ') || null;
    case 'study_materials':
      return [data.type || null, data.subjectId ? `subj:${String(data.subjectId).slice(0, 8)}` : null].filter(Boolean).join(' • ') || null;
    case 'notifications':
      return data.type || null;
    default:
      return null;
  }
};

export default function DataManagement() {
  const [clearing, setClearing] = useState(false);
  const [nuking, setNuking] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [nukeDialogOpen, setNukeDialogOpen] = useState(false);
  const [nukeConfirmText, setNukeConfirmText] = useState('');

  // Live counts for every collection we track
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(ALL_COLLECTIONS.map((c) => [c, 0])),
  );

  // ---- Individual-item browser state ----
  const [selectedCollection, setSelectedCollection] = useState<string>('categories');
  const [browseItems, setBrowseItems] = useState<Array<{ id: string; data: any }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; data: any; collection: string } | null>(null);
  const [cascadeDelete, setCascadeDelete] = useState(true);
  const [childCounts, setChildCounts] = useState<{ subjects: number; tests: number; questions: number }>({ subjects: 0, tests: 0, questions: 0 });
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);

  useEffect(() => {
    const unsubs = (ALL_COLLECTIONS as readonly string[]).map((name) =>
      onSnapshot(
        collection(db, name),
        (snap) => setCounts((prev) => ({ ...prev, [name]: snap.size })),
        () => {},
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  // Live subscription to the currently-browsed collection for the individual
  // delete panel. Re-subscribes whenever the admin switches collections.
  useEffect(() => {
    setBrowseItems([]);
    const unsub = onSnapshot(
      collection(db, selectedCollection),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, data: d.data() as any }));
        items.sort((a, b) => {
          const an = String(getDisplayName(selectedCollection, a.data));
          const bn = String(getDisplayName(selectedCollection, b.data));
          return an.localeCompare(bn);
        });
        setBrowseItems(items);
      },
      () => {},
    );
    return () => unsub();
  }, [selectedCollection]);

  // Whenever the delete target changes, fetch how many child documents would
  // be affected (for the cascade warning in the confirmation dialog).
  useEffect(() => {
    if (!deleteTarget || !COLLECTION_BROWSE_CONFIG[deleteTarget.collection]?.hasChildren) {
      setChildCounts({ subjects: 0, tests: 0, questions: 0 });
      return;
    }
    let cancelled = false;
    setLoadingChildren(true);
    (async () => {
      try {
        const result = { subjects: 0, tests: 0, questions: 0 };
        const { id, collection: col } = deleteTarget;
        if (col === 'categories') {
          const subjSnap = await getDocs(query(collection(db, 'subjects'), where('categoryId', '==', id)));
          result.subjects = subjSnap.size;
          const subjectIds = subjSnap.docs.map((d) => d.id);
          for (let i = 0; i < subjectIds.length; i += 30) {
            const chunk = subjectIds.slice(i, i + 30);
            const tSnap = await getDocs(query(collection(db, 'tests'), where('subjectId', 'in', chunk)));
            result.tests += tSnap.size;
            const testIds = tSnap.docs.map((d) => d.id);
            for (let j = 0; j < testIds.length; j += 30) {
              const qChunk = testIds.slice(j, j + 30);
              const qSnap = await getDocs(query(collection(db, 'questions'), where('testId', 'in', qChunk)));
              result.questions += qSnap.size;
            }
          }
        } else if (col === 'subjects') {
          const tSnap = await getDocs(query(collection(db, 'tests'), where('subjectId', '==', id)));
          result.tests = tSnap.size;
          const testIds = tSnap.docs.map((d) => d.id);
          for (let i = 0; i < testIds.length; i += 30) {
            const chunk = testIds.slice(i, i + 30);
            const qSnap = await getDocs(query(collection(db, 'questions'), where('testId', 'in', chunk)));
            result.questions += qSnap.size;
          }
        } else if (col === 'tests') {
          const qSnap = await getDocs(query(collection(db, 'questions'), where('testId', '==', id)));
          result.questions = qSnap.size;
        }
        if (!cancelled) setChildCounts(result);
      } catch (e) {
        console.error('[childCounts]', e);
      } finally {
        if (!cancelled) setLoadingChildren(false);
      }
    })();
    return () => { cancelled = true; };
  }, [deleteTarget]);

  // Filtered list for the browse panel (search by name, subtitle, or doc id).
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return browseItems;
    const q = searchQuery.toLowerCase();
    return browseItems.filter((item) => {
      const name = String(getDisplayName(selectedCollection, item.data)).toLowerCase();
      const subtitle = String(getDisplaySubtitle(selectedCollection, item.data) || '').toLowerCase();
      return name.includes(q) || subtitle.includes(q) || item.id.toLowerCase().includes(q);
    });
  }, [browseItems, searchQuery, selectedCollection]);

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

  // Delete all docs from a single collection in chunked batches.
  // Firestore writeBatch limit is 500 ops — we use 450 for safety.
  // RESILIENT: if getDocs fails (permission denied / collection has no rules),
// returns -1 instead of throwing — so one bad collection doesn't abort the
  // entire NUKE operation. The caller logs the skip and continues.
  async function clearCollection(name: string): Promise<number> {
    let snap;
    try {
      snap = await getDocs(collection(db, name));
    } catch (e: any) {
      // Permission denied or collection has no rules — skip, don't abort
      console.warn(`[clearCollection] ${name}: read failed (skipping):`, e?.code || e?.message);
      return -1;
    }
    if (snap.empty) return 0;

    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 450) {
      const chunk = docs.slice(i, i + 450);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    return docs.length;
  }

  // Delete a collection AND its known subcollections (e.g. support_tickets/{id}/messages)
  // RESILIENT: same skip-on-error pattern as clearCollection.
  async function clearCollectionWithSubs(name: string, subName?: string): Promise<number> {
    let snap;
    try {
      snap = await getDocs(collection(db, name));
    } catch (e: any) {
      console.warn(`[clearCollectionWithSubs] ${name}: read failed (skipping):`, e?.code || e?.message);
      return -1;
    }
    if (snap.empty) return 0;

    let total = 0;
    // Delete subcollections first (if any) to avoid orphaned docs
    if (subName) {
      for (const parentDoc of snap.docs) {
        try {
          const subSnap = await getDocs(collection(db, name, parentDoc.id, subName));
          if (!subSnap.empty) {
            for (let i = 0; i < subSnap.docs.length; i += 450) {
              const chunk = subSnap.docs.slice(i, i + 450);
              const batch = writeBatch(db);
              chunk.forEach((d) => batch.delete(d.ref));
              await batch.commit();
            }
            total += subSnap.docs.length;
          }
        } catch {
          // subcollection may not exist — ignore
        }
      }
    }

    // Delete parent docs
    for (let i = 0; i < snap.docs.length; i += 450) {
      const chunk = snap.docs.slice(i, i + 450);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    total += snap.docs.length;
    return total;
  }

  // ===========================================================================
  // CLEAR ALL CONTENT DATA
  // ===========================================================================
  const handleClearContent = async () => {
    setClearing(true);
    setLog([]);
    setClearDialogOpen(false);

    const results: Record<string, number> = {};

    try {
      for (const colName of CONTENT_COLLECTIONS) {
        const label = COLLECTION_LABELS[colName] || colName;
        updateLog(`Clearing ${label}...`, 'pending');
        const n = await clearCollection(colName);
        results[colName] = n;
        if (n === -1) {
          updateLog(`Clearing ${label}...`, 'error', 'skipped (permission denied)');
        } else {
          updateLog(`Clearing ${label}...`, 'done', n === 0 ? 'empty' : `${n} deleted`);
        }
      }

      const deleted = Object.values(results).filter((n) => n > 0).reduce((a, b) => a + b, 0);
      const skipped = Object.values(results).filter((n) => n === -1).length;
      const msg = skipped > 0
        ? `Cleared ${deleted} documents (${skipped} collections skipped — no rules)`
        : `Cleared ${deleted} documents from ${CONTENT_COLLECTIONS.length} content collections`;
      toast.success(msg);
      updateLog('Done', 'done', `${deleted} total documents deleted${skipped > 0 ? `, ${skipped} skipped` : ''}`);
    } catch (e) {
      console.error('[clearContent]', e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Clear failed: ${msg}`);
      updateLog('Error', 'error', msg);
    } finally {
      setClearing(false);
    }
  };

  // ===========================================================================
  // NUKE ALL DATA (everything — including users, payments, support tickets)
  // ===========================================================================
  const handleNukeAll = async () => {
    setNuking(true);
    setLog([]);
    setNukeDialogOpen(false);
    setNukeConfirmText('');

    const results: Record<string, number> = {};

    try {
      for (const colName of ALL_COLLECTIONS) {
        const label = COLLECTION_LABELS[colName] || colName;
        updateLog(`Nuking ${label}...`, 'pending');
        // support_tickets has a 'messages' subcollection
        const n = colName === 'support_tickets'
          ? await clearCollectionWithSubs(colName, 'messages')
          : await clearCollection(colName);
        results[colName] = n;
        if (n === -1) {
          updateLog(`Nuking ${label}...`, 'error', 'skipped (permission denied)');
        } else {
          updateLog(`Nuking ${label}...`, 'done', n === 0 ? 'empty' : `${n} deleted`);
        }
      }

      const deleted = Object.values(results).filter((n) => n > 0).reduce((a, b) => a + b, 0);
      const skipped = Object.values(results).filter((n) => n === -1).length;
      const msg = skipped > 0
        ? `NUKE complete — ${deleted} documents deleted (${skipped} collections skipped — no rules)`
        : `NUKE complete — ${deleted} documents deleted across ${ALL_COLLECTIONS.length} collections`;
      toast.success(msg);
      updateLog('Done', 'done', `${deleted} total documents deleted${skipped > 0 ? `, ${skipped} skipped` : ''}`);
    } catch (e) {
      console.error('[nukeAll]', e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`NUKE failed: ${msg}`);
      updateLog('Error', 'error', msg);
    } finally {
      setNuking(false);
    }
  };

  // ===========================================================================
  // INDIVIDUAL ITEM DELETE
  // ===========================================================================
  // After deleting a child doc (subject/test/question), the parent's cached
  // count field (subjectCount / testCount / questionCount) is now stale. The
  // Flutter app reads these directly, so we recompute + write them back here.
  const recomputeParentCount = async (deletedColName: string, parentId: string) => {
    try {
      if (deletedColName === 'subjects') {
        const snap = await getDocs(query(collection(db, 'subjects'), where('categoryId', '==', parentId)));
        await updateDoc(doc(db, 'categories', parentId), { subjectCount: snap.size, updatedAt: serverTimestamp() });
      } else if (deletedColName === 'tests') {
        const snap = await getDocs(query(collection(db, 'tests'), where('subjectId', '==', parentId)));
        await updateDoc(doc(db, 'subjects', parentId), { testCount: snap.size, updatedAt: serverTimestamp() });
      } else if (deletedColName === 'questions') {
        const snap = await getDocs(query(collection(db, 'questions'), where('testId', '==', parentId)));
        await updateDoc(doc(db, 'tests', parentId), { questionCount: snap.size, updatedAt: serverTimestamp() });
      }
    } catch (e) {
      console.error('[recomputeParentCount]', e);
    }
  };

  // Deletes a single document. For hierarchical collections, optionally cascades
  // to all descendant documents. Commits in batches of 450 (Firestore limit 500).
  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    setDeletingItem(true);
    try {
      const { id, collection: colName, data } = deleteTarget;
      const refs: any[] = [];

      if (cascadeDelete && COLLECTION_BROWSE_CONFIG[colName]?.hasChildren) {
        if (colName === 'categories') {
          const subjSnap = await getDocs(query(collection(db, 'subjects'), where('categoryId', '==', id)));
          const subjectIds = subjSnap.docs.map((d) => d.id);
          subjSnap.docs.forEach((d) => refs.push(d.ref));
          for (let i = 0; i < subjectIds.length; i += 30) {
            const chunk = subjectIds.slice(i, i + 30);
            const tSnap = await getDocs(query(collection(db, 'tests'), where('subjectId', 'in', chunk)));
            const testIds = tSnap.docs.map((d) => d.id);
            tSnap.docs.forEach((d) => refs.push(d.ref));
            for (let j = 0; j < testIds.length; j += 30) {
              const qChunk = testIds.slice(j, j + 30);
              const qSnap = await getDocs(query(collection(db, 'questions'), where('testId', 'in', qChunk)));
              qSnap.docs.forEach((d) => refs.push(d.ref));
            }
          }
        } else if (colName === 'subjects') {
          const tSnap = await getDocs(query(collection(db, 'tests'), where('subjectId', '==', id)));
          const testIds = tSnap.docs.map((d) => d.id);
          tSnap.docs.forEach((d) => refs.push(d.ref));
          for (let i = 0; i < testIds.length; i += 30) {
            const chunk = testIds.slice(i, i + 30);
            const qSnap = await getDocs(query(collection(db, 'questions'), where('testId', 'in', chunk)));
            qSnap.docs.forEach((d) => refs.push(d.ref));
          }
        } else if (colName === 'tests') {
          const qSnap = await getDocs(query(collection(db, 'questions'), where('testId', '==', id)));
          qSnap.docs.forEach((d) => refs.push(d.ref));
        }
      }

      refs.push(doc(db, colName, id));

      for (let i = 0; i < refs.length; i += 450) {
        const chunk = refs.slice(i, i + 450);
        const batch = writeBatch(db);
        chunk.forEach((r) => batch.delete(r));
        await batch.commit();
      }

      const parentId = data?.categoryId || data?.subjectId || data?.testId;
      if (parentId) await recomputeParentCount(colName, parentId);

      const displayName = getDisplayName(colName, data);
      const childCount = refs.length - 1;
      toast.success(
        childCount > 0
          ? `Deleted "${displayName.slice(0, 50)}" + ${childCount} child doc${childCount === 1 ? '' : 's'}`
          : `Deleted "${displayName.slice(0, 50)}"`,
      );
      setDeleteTarget(null);
      setCascadeDelete(true);
    } catch (e) {
      console.error('[deleteItem]', e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`Delete failed: ${msg}`);
    } finally {
      setDeletingItem(false);
    }
  };

  const busy = clearing || nuking || deletingItem;
  const contentTotal = CONTENT_COLLECTIONS.reduce((sum, c) => sum + (counts[c] || 0), 0);
  const allTotal = ALL_COLLECTIONS.reduce((sum, c) => sum + (counts[c] || 0), 0);

  return (
    <div className="space-y-6">
      {/* ===================== Header ===================== */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-400" />
            Data Management
          </h2>
          <p className="text-slate-400 mt-1 text-sm max-w-2xl">
            Wipe data directly from Firestore. Use this to get a clean slate before
            re-seeding, or to remove all test data before launch. These operations
            are <span className="text-red-400 font-semibold">irreversible</span>.
          </p>
        </div>
      </div>

      {/* ===================== Live Data Status ===================== */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Current Data in Firestore (live)</h3>
            <span className="text-xs text-slate-500 ml-auto">updates in real-time</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {(ALL_COLLECTIONS as readonly string[]).map((key) => {
              const n = counts[key] || 0;
              const isContent = (CONTENT_COLLECTIONS as readonly string[]).includes(key);
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-2.5 text-center ${
                    n > 0
                      ? isContent
                        ? 'border-amber-800 bg-amber-950/30'
                        : 'border-red-800 bg-red-950/30'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className={`text-2xl font-bold ${n > 0 ? (isContent ? 'text-amber-400' : 'text-red-400') : 'text-slate-600'}`}>
                    {n}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                    {COLLECTION_LABELS[key] || key}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-amber-800 bg-amber-950/30" />
              Content ({contentTotal} docs)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-red-800 bg-red-950/30" />
              Operational ({allTotal - contentTotal} docs)
            </span>
            <span className="ml-auto">Total: <span className="text-white font-semibold">{allTotal}</span> documents</span>
          </div>
        </CardContent>
      </Card>

      {/* ===================== Action Cards ===================== */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Clear Content */}
        <Card className="bg-slate-900 border-amber-900/50">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-amber-400" />
              Clear All Content Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-400">
              Deletes all documents from the <span className="text-amber-400 font-semibold">content collections</span>:
              categories, subjects, tests, questions, banners, announcements, upcoming
              exams, current affairs, study materials, daily quizzes, and notifications.
            </p>
            <div className="rounded-lg bg-amber-950/30 border border-amber-900/40 p-3 text-xs text-amber-300/80">
              <p className="flex items-center gap-1.5 font-semibold mb-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Safe to use — does NOT delete:
              </p>
              <p>User accounts, payments, support tickets, premium plans. The admin account stays intact.</p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                Will delete: <span className="text-amber-400 font-bold">{contentTotal}</span> docs
              </span>
              <Button
                onClick={() => setClearDialogOpen(true)}
                disabled={busy || contentTotal === 0}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Content
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NUKE All */}
        <Card className="bg-slate-900 border-red-900/60">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Bomb className="w-5 h-5 text-red-400" />
              NUKE ALL DATA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-400">
              Deletes <span className="text-red-400 font-semibold">EVERYTHING</span> from Firestore —
              content, users, payments, purchases, support tickets, and premium plans.
              True clean slate.
            </p>
            <div className="rounded-lg bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-300/90">
              <p className="flex items-center gap-1.5 font-semibold mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Warning — irreversible:
              </p>
              <p>This will delete ALL user accounts, ALL payment records, and ALL support tickets. The admin login itself (stored in the <code className="text-red-200">admins</code> collection) is preserved so you can still sign in.</p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                Will delete: <span className="text-red-400 font-bold">{allTotal}</span> docs
              </span>
              <Button
                onClick={() => setNukeDialogOpen(true)}
                disabled={busy || allTotal === 0}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Bomb className="w-4 h-4 mr-2" />
                NUKE Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===================== Browse & Delete Individual Items ===================== */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Browse &amp; Delete Individual Items</h3>
            <span className="text-xs text-slate-500 ml-auto">live from Firestore</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Pick a collection, then delete items one at a time. For categories, subjects &amp; tests you can cascade-delete all children too.
          </p>

          {/* Collection pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {BROWSABLE_COLLECTIONS.map((key) => {
              const cfg = COLLECTION_BROWSE_CONFIG[key];
              if (!cfg) return null;
              const active = selectedCollection === key;
              const n = key === selectedCollection ? browseItems.length : counts[key] || 0;
              const label = COLLECTION_LABELS[key] || key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setSelectedCollection(key); setSearchQuery(''); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-700/50'
                  }`}
                >
                  <cfg.icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20' : 'bg-slate-900/60 text-slate-400'}`}>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + count */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${COLLECTION_LABELS[selectedCollection]?.toLowerCase() ?? 'items'}…`}
                className="pl-8 h-9 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
              />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap tabular-nums">
              {filteredItems.length} / {browseItems.length}
            </span>
          </div>

          {/* Items list */}
          {browseItems.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No items in this collection.</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">No matches for “{searchQuery}”.</p>
          ) : (
            <div className="border border-slate-800 rounded-lg divide-y divide-slate-800 max-h-96 overflow-y-auto">
              {filteredItems.map((item) => {
                const name = getDisplayName(selectedCollection, item.data);
                const subtitle = getDisplaySubtitle(selectedCollection, item.data);
                return (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{name}</p>
                      {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget({ id: item.id, data: item.data, collection: selectedCollection })}
                      disabled={busy}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 px-2 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===================== Operation Log ===================== */}
      {log.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              {busy ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              Operation Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-2">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm font-mono py-1 border-b border-slate-800/50 last:border-0"
                >
                  {entry.status === 'pending' && (
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0 mt-0.5" />
                  )}
                  {entry.status === 'done' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {entry.status === 'error' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-slate-300">{entry.step}</span>
                  {entry.detail && (
                    <span className={`text-xs ml-auto shrink-0 ${
                      entry.status === 'error' ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      {entry.detail}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===================== Clear Content Confirmation ===================== */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-amber-400" />
              Clear all content data?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete <span className="text-amber-400 font-semibold">{contentTotal} documents</span> across{' '}
              {CONTENT_COLLECTIONS.length} content collections (categories, subjects, tests,
              questions, banners, announcements, upcoming exams, current affairs, study
              materials, daily quizzes, notifications). User accounts and payments are NOT
              affected. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearContent}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Yes, clear all content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===================== NUKE Confirmation (type DELETE) ===================== */}
      <AlertDialog open={nukeDialogOpen} onOpenChange={(v) => { setNukeDialogOpen(v); if (!v) setNukeConfirmText(''); }}>
        <AlertDialogContent className="bg-slate-900 border-red-900/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Bomb className="w-5 h-5 text-red-400" />
              NUKE ALL DATA — are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 space-y-2">
              <span>
                This will permanently delete <span className="text-red-400 font-semibold">{allTotal} documents</span> across{' '}
                {ALL_COLLECTIONS.length} collections. This includes:
              </span>
              <span className="block text-red-300/90">
                • All user accounts (users collection)<br />
                • All payment records &amp; purchases<br />
                • All support tickets &amp; messages<br />
                • All content (categories, tests, questions, etc.)
              </span>
              <span>The admin account (in the <code>admins</code> collection) is preserved so you can still log in afterwards.</span>
              <span className="block font-semibold text-red-400">This action is IRREVERSIBLE. Type DELETE to confirm.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={nukeConfirmText}
            onChange={(e) => setNukeConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="bg-slate-950 border-red-900/50 text-white placeholder:text-slate-600 font-mono"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleNukeAll}
              disabled={nukeConfirmText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Bomb className="w-4 h-4 mr-2" />
              NUKE EVERYTHING
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===================== Individual Delete Confirmation ===================== */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deletingItem) {
            setDeleteTarget(null);
            setCascadeDelete(true);
          }
        }}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete this {deleteTarget ? (COLLECTION_LABELS[deleteTarget.collection] || 'item').toLowerCase() : 'item'}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-slate-400">
                {deleteTarget && (
                  <p className="text-sm">
                    You are about to permanently delete{' '}
                    <span className="font-semibold text-white">
                      “{getDisplayName(deleteTarget.collection, deleteTarget.data).slice(0, 80)}”
                    </span>
                  </p>
                )}

                {deleteTarget && COLLECTION_BROWSE_CONFIG[deleteTarget.collection]?.hasChildren && (
                  <>
                    {loadingChildren ? (
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Counting child documents…
                      </p>
                    ) : (() => {
                      const total = childCounts.subjects + childCounts.tests + childCounts.questions;
                      if (total === 0) {
                        return (
                          <p className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-2.5">
                            ✓ This item has no child documents. Safe to delete.
                          </p>
                        );
                      }
                      return (
                        <div className="rounded-lg bg-slate-950/60 border border-slate-700 p-3 space-y-1.5 text-xs">
                          <p className="font-medium text-slate-300">This item has child documents:</p>
                          {deleteTarget.collection === 'categories' && (
                            <ul className="text-slate-400 space-y-0.5 ml-1">
                              <li>• <strong className="text-slate-200">{childCounts.subjects}</strong> subject{childCounts.subjects === 1 ? '' : 's'}</li>
                              <li>• <strong className="text-slate-200">{childCounts.tests}</strong> test{childCounts.tests === 1 ? '' : 's'}</li>
                              <li>• <strong className="text-slate-200">{childCounts.questions}</strong> question{childCounts.questions === 1 ? '' : 's'}</li>
                            </ul>
                          )}
                          {deleteTarget.collection === 'subjects' && (
                            <ul className="text-slate-400 space-y-0.5 ml-1">
                              <li>• <strong className="text-slate-200">{childCounts.tests}</strong> test{childCounts.tests === 1 ? '' : 's'}</li>
                              <li>• <strong className="text-slate-200">{childCounts.questions}</strong> question{childCounts.questions === 1 ? '' : 's'}</li>
                            </ul>
                          )}
                          {deleteTarget.collection === 'tests' && (
                            <ul className="text-slate-400 space-y-0.5 ml-1">
                              <li>• <strong className="text-slate-200">{childCounts.questions}</strong> question{childCounts.questions === 1 ? '' : 's'}</li>
                            </ul>
                          )}
                        </div>
                      );
                    })()}
                    {!loadingChildren && (() => {
                      const total = childCounts.subjects + childCounts.tests + childCounts.questions;
                      if (total === 0) return null;
                      return (
                        <label className="flex items-start gap-2 cursor-pointer rounded-lg border border-amber-900/50 bg-amber-950/30 p-3">
                          <input
                            type="checkbox"
                            checked={cascadeDelete}
                            onChange={(e) => setCascadeDelete(e.target.checked)}
                            className="rounded border-slate-600 mt-0.5"
                          />
                          <span className="text-sm text-slate-300">
                            <strong className="text-amber-400">
                              Also delete all {total} child document{total === 1 ? '' : 's'}
                            </strong>{' '}
                            (recommended)
                            <br />
                            <span className="text-xs text-slate-500">
                              If unchecked, children remain but become <strong>orphaned</strong> — their parent ID will point to a deleted doc.
                            </span>
                          </span>
                        </label>
                      );
                    })()}
                  </>
                )}

                <p className="text-red-400 text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" disabled={deletingItem}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteItem();
              }}
              disabled={deletingItem || loadingChildren}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {deletingItem ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Yes, Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
