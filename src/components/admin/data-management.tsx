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

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
  doc,
  getDoc,
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
} from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
  step: string;
  status: 'pending' | 'done' | 'error';
  detail?: string;
}

// Content collections — seeded exam-prep data. Safe to wipe for a fresh start.
// Does NOT include users, payments, support_tickets, or premium_plans.
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
  'daily_quizzes',
  'notifications',
] as const;

// ALL collections — for the NUKE option. Includes operational data.
const ALL_COLLECTIONS = [
  ...CONTENT_COLLECTIONS,
  'premium_plans',
  'users',
  'payments',
  'test_purchases',
  'subject_pack_purchases',
  'exam_pack_purchases',
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
  daily_quizzes: 'Daily Quizzes',
  notifications: 'Notifications',
  premium_plans: 'Premium Plans',
  users: 'Users',
  payments: 'Payments',
  test_purchases: 'Test Purchases',
  subject_pack_purchases: 'Subject Pack Purchases',
  exam_pack_purchases: 'Exam Pack Purchases',
  support_tickets: 'Support Tickets',
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
  async function clearCollection(name: string): Promise<number> {
    const snap = await getDocs(collection(db, name));
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
  async function clearCollectionWithSubs(name: string, subName?: string): Promise<number> {
    const snap = await getDocs(collection(db, name));
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
        updateLog(`Clearing ${label}...`, 'done', n === 0 ? 'empty' : `${n} deleted`);
      }

      const total = Object.values(results).reduce((a, b) => a + b, 0);
      toast.success(`Cleared ${total} documents from ${CONTENT_COLLECTIONS.length} content collections`);
      updateLog('Done', 'done', `${total} total documents deleted`);
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
        updateLog(`Nuking ${label}...`, 'done', n === 0 ? 'empty' : `${n} deleted`);
      }

      const total = Object.values(results).reduce((a, b) => a + b, 0);
      toast.success(`NUKE complete — ${total} documents deleted across ${ALL_COLLECTIONS.length} collections`);
      updateLog('Done', 'done', `${total} total documents deleted`);
    } catch (e) {
      console.error('[nukeAll]', e);
      const msg = e instanceof Error ? e.message : 'Unknown error';
      toast.error(`NUKE failed: ${msg}`);
      updateLog('Error', 'error', msg);
    } finally {
      setNuking(false);
    }
  };

  const busy = clearing || nuking;
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
    </div>
  );
}
