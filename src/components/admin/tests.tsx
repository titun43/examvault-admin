'use client';

import { useEffect, useState, useRef } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteItems } from '@/lib/admin-firestore';
import { useAppStore } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BulkTextarea } from './bulk-textarea';
import { resolveSubjectIdByName, resolveCategoryIdByName } from '@/lib/bulk-resolve';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, FileText, FileQuestion, Crown, Eye, EyeOff, Layers, X, Download, Info, FileSpreadsheet, IndianRupee, Unlock, Languages, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { downloadJson, downloadCsv, parseCsv } from '@/lib/download';

interface Test {
  id: string;
  subjectId: string;
  title: string;
  titleAs?: string | null;
  slug: string;
  type: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  difficulty: string;
  negativeMarking: boolean;
  negativeMarks: number;
  instructions?: string;
  description?: string | null;
  descriptionAs?: string | null;
  year?: number;
  examSession?: string;
  isPremium: boolean;
  price: number;
  questionCount?: number;
  attemptCount?: number;
}

interface Subject { id: string; name: string; categoryId: string; }
interface Category { id: string; name: string; isPremium?: boolean; }

const TYPE_COLORS: Record<string, string> = {
  mock: 'border-emerald-700 text-emerald-400 bg-emerald-950/40',
  previousYear: 'border-amber-700 text-amber-400 bg-amber-950/40',
  dailyQuiz: 'border-purple-700 text-purple-400 bg-purple-950/40',
  practice: 'border-cyan-700 text-cyan-400 bg-cyan-950/40',
  subjectwise: 'border-pink-700 text-pink-400 bg-pink-950/40',
};
const TYPE_LABELS: Record<string, string> = {
  mock: 'Mock Test', previousYear: 'Previous Year', dailyQuiz: 'Daily Quiz', practice: 'Practice', subjectwise: 'Subject-wise',
};

const emptyForm = {
  categoryId: '', subjectId: '', title: '', titleAs: '', slug: '', type: 'mock', duration: 60, totalMarks: 100, passingMarks: 40,
  isPublished: true, difficulty: 'medium', negativeMarking: false, negativeMarks: 0.25,
  instructions: '', description: '', descriptionAs: '', year: new Date().getFullYear(), examSession: '', isPremium: false, price: 0,
};

interface TestsProps {
  /** When set, locks the list to this test type and pre-fills the Add form
   *  with it. Used by the dedicated "Daily Quiz" nav section so admins can
   *  manage daily quizzes without touching other test types. */
  fixedType?: string;
}

export default function Tests({ fixedType }: TestsProps = {}) {
  const { setCurrentSection, setSelectedTest } = useAppStore();
  const [items, setItems] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // Bulk "make free" state — resets isPremium=false, price=0.
  const [bulkFreeOpen, setBulkFreeOpen] = useState(false);
  const [bulkFreeAllOpen, setBulkFreeAllOpen] = useState(false);
  const [bulkFreeing, setBulkFreeing] = useState(false);

  // Live question count per test. Computed from the questions collection so
  // the number is always accurate (manual add, bulk import, seed, deletes
  // via other tabs — all count). The stored `questionCount` field on the
  // Test doc is only updated by the questions.tsx single-add/delete path;
  // bulk-import does NOT update it, so without this live map the "Qs"
  // column would show 0 right after a bulk question import.
  //
  // We ALSO write the correct count back to each test doc whose stored
  // `questionCount` has drifted, so the Flutter user app (which reads
  // `test.questionCount`) stays in sync without a manual re-save.
  const [questionCountMap, setQuestionCountMap] = useState<Record<string, number>>({});
  const itemsRef = useRef<Test[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // When fixedType is set, derive a filtered view + friendly labels.
  const fixedLabel = fixedType ? (TYPE_LABELS[fixedType] || fixedType) : null;
  const visibleItems = fixedType ? items.filter((t) => t.type === fixedType) : items;

  // Bilingual template: English (primary) + Assamese (As suffix). Optional.
  const BULK_SAMPLE = '[{"title":"SSC Mock 1","titleAs":"এছ এছ চি মক ১","description":"Full mock test","descriptionAs":"সম্পূৰ্ণ মক পৰীক্ষা","subjectName":"Quantitative Aptitude","categoryName":"SSC","type":"mock","duration":60,"totalMarks":100,"passingMarks":40,"difficulty":"medium","isPublished":true,"isPremium":false,"negativeMarking":false,"negativeMarks":0,"price":0},{"title":"SSC Mock 2","titleAs":"এছ এছ চি মক ২","description":"Hard mock test","descriptionAs":"কঠিন মক পৰীক্ষা","subjectName":"Quantitative Aptitude","categoryName":"SSC","type":"mock","duration":90,"totalMarks":150,"passingMarks":60,"difficulty":"hard","isPublished":true,"isPremium":true,"negativeMarking":true,"negativeMarks":0.25,"price":29}]';

  const CSV_HEADERS = ['title', 'titleAs', 'description', 'descriptionAs', 'duration', 'totalMarks', 'passingMarks', 'difficulty', 'type', 'subjectName', 'categoryName', 'isPremium', 'isPublished'];
  const CSV_SAMPLE_ROWS: (string | number | boolean)[][] = [
    ['SSC Mock 1', 'এছ এছ চি মক ১', 'Full mock test', 'সম্পূৰ্ণ মক পৰীক্ষা', 60, 100, 40, 'medium', 'mock', 'Quantitative Aptitude', 'SSC', false, true],
    ['SSC Mock 2', 'এছ এছ চি মক ২', 'Hard mock test', 'কঠিন মক পৰীক্ষা', 90, 150, 60, 'hard', 'mock', 'Quantitative Aptitude', 'SSC', true, true],
  ];

  const handleBulkImport = async () => {
    let parsed: any;
    const text = bulkText.trim();
    if (!text) {
      toast.error('Please paste JSON or CSV data first');
      return;
    }
    let isCsv = false;
    try {
      parsed = JSON.parse(text);
    } catch {
      try {
        const rows = parseCsv(text);
        if (rows.length < 2) {
          toast.error('CSV must have a header row and at least 1 data row');
          return;
        }
        const headers = rows[0].map((h) => h.trim());
        parsed = rows
          .slice(1)
          .filter((r) => r.some((c) => c.trim() !== ''))
          .map((r) => {
            const obj: any = {};
            headers.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
            if ('duration' in obj) obj.duration = Number(obj.duration) || 0;
            if ('totalMarks' in obj) obj.totalMarks = Number(obj.totalMarks) || 0;
            if ('passingMarks' in obj) obj.passingMarks = Number(obj.passingMarks) || 0;
            if ('isPremium' in obj) obj.isPremium = String(obj.isPremium).toLowerCase() === 'true';
            if ('isPublished' in obj) obj.isPublished = String(obj.isPublished).toLowerCase() === 'true';
            return obj;
          });
        isCsv = true;
      } catch (e: any) {
        toast.error('Invalid JSON or CSV: ' + (e?.message || 'parse error'));
        return;
      }
    }
    if (!Array.isArray(parsed)) {
      toast.error('Input must be a JSON array or a CSV with a header row');
      return;
    }
    setBulkSaving(true);
    try {
      // ---- Name-based parent resolution ----
      // Each row can use EITHER `subjectId` (explicit Firestore doc id —
      // backward compatible) OR `subjectName` (resolved to id via Firestore
      // lookup, optionally disambiguated by `categoryName`). If both are
      // present, subjectId wins. If neither is present, the row is skipped.
      //
      // We ALSO resolve categoryName -> categoryId here so the row keeps a
      // denormalized categoryId (the Test model stores subjectId only, but
      // some downstream queries expect categoryId to be present too).
      // -----------------------------------------------------------------
      const skipList: { row: number; reason: string }[] = [];
      const resolved: any[] = [];
      // Per-import caches so we hit Firestore once per unique name.
      const subjIdCache = new Map<string, string | null>();
      const catIdCache = new Map<string, string | null>();

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        const rowNo = i + 1;
        let subjectId = (item.subjectId ?? '').toString().trim();
        const subjName = (item.subjectName ?? '').toString().trim();
        const catName = (item.categoryName ?? '').toString().trim();

        // Cache key for subject: name + '||' + categoryName (disambiguator).
        const subjKey = `${subjName.toLowerCase()}||${catName.toLowerCase()}`;

        if (!subjectId && subjName) {
          if (subjIdCache.has(subjKey)) {
            subjectId = subjIdCache.get(subjKey) ?? '';
          } else {
            const r = await resolveSubjectIdByName(subjName, catName || undefined);
            subjIdCache.set(subjKey, r.id);
            subjectId = r.id ?? '';
          }
          if (!subjectId) {
            skipList.push({
              row: rowNo,
              reason: `subject "${subjName}"${catName ? ` (in ${catName})` : ''} not found`,
            });
            continue;
          }
        }
        if (!subjectId) {
          skipList.push({ row: rowNo, reason: 'no subjectId or subjectName provided' });
          continue;
        }

        const payload = { ...item };
        payload.subjectId = subjectId;
        delete payload.subjectName;
        // Optionally denormalize categoryId if the admin gave categoryName.
        // (Skip if the row already had categoryId — explicit wins.)
        if (catName && !payload.categoryId) {
          if (catIdCache.has(catName.toLowerCase())) {
            const cid = catIdCache.get(catName.toLowerCase());
            if (cid) payload.categoryId = cid;
          } else {
            const c = await resolveCategoryIdByName(catName);
            catIdCache.set(catName.toLowerCase(), c.id);
            if (c.id) payload.categoryId = c.id;
          }
        }
        if (!payload.createdAt) payload.createdAt = serverTimestamp();
        if (!payload.updatedAt) payload.updatedAt = serverTimestamp();
        resolved.push(payload);
      }

      if (resolved.length === 0) {
        const sample = skipList.slice(0, 3).map((s) => `Row ${s.row}: ${s.reason}`).join('; ');
        toast.error(`No rows to import. ${sample}${skipList.length > 3 ? ` (+${skipList.length - 3} more)` : ''}`);
        return;
      }

      // Build a subjectId -> category.isPremium lookup so imported tests
      // inherit premium status from their parent category. A test inside a
      // premium category MUST be premium, otherwise the Flutter fast-path
      // (`if (!test.isPaid) grant`) lets users take it for free.
      const subjectPremiumMap = new Map<string, boolean>();
      for (const s of subjects) {
        const cat = categories.find((c) => c.id === s.categoryId);
        subjectPremiumMap.set(s.id, !!cat?.isPremium);
      }
      let autoPremiumCount = 0;

      const batch = writeBatch(db);
      const colRef = collection(db, 'tests');
      resolved.forEach((payload) => {
        // Inherit premium from parent category. If the admin explicitly set
        // isPremium=false on a row whose category is premium, force it true.
        const sid = payload.subjectId;
        if (typeof sid === 'string' && subjectPremiumMap.get(sid)) {
          if (!payload.isPremium) autoPremiumCount++;
          payload.isPremium = true;
        }
        const ref = doc(colRef);
        batch.set(ref, payload);
      });
      await batch.commit();

      // ---- Sync testCount on every affected subject doc ----
      // The Subject model stores a denormalized `testCount` field that the
      // Flutter user app reads directly. The single-add / single-delete
      // paths update this field, but bulk-import didn't — so the count
      // stayed stale until someone opened the Subjects admin page (whose
      // own onSnapshot writeback would eventually fix it). We now write the
      // ABSOLUTE count via a fresh getDocs query per affected subject, so
      // the Flutter app sees the right number immediately.
      const affectedSubjectIds = Array.from(
        new Set(resolved.map((r) => r.subjectId).filter(Boolean)),
      );
      await Promise.all(
        affectedSubjectIds.map(async (subjectId) => {
          try {
            const snap = await getDocs(
              query(collection(db, 'tests'), where('subjectId', '==', subjectId)),
            );
            await updateDoc(doc(db, 'subjects', subjectId), {
              testCount: snap.size,
              updatedAt: serverTimestamp(),
            });
          } catch (e) {
            console.warn('[tests bulk] count sync failed for', subjectId, e);
          }
        }),
      );

      const skippedNote = skipList.length > 0 ? `, ${skipList.length} skipped` : '';
      const autoNote = autoPremiumCount > 0
        ? ` (${autoPremiumCount} auto-marked premium — parent category is premium)`
        : '';
      toast.success(`Imported ${resolved.length} test${resolved.length === 1 ? '' : 's'}${skippedNote}` + (isCsv ? ' (from CSV)' : '') + autoNote);
      if (skipList.length > 0) {
        console.warn('[tests bulk] skipped rows:', skipList);
      }
      setBulkOpen(false);
      setBulkText('');
    } catch (err: any) {
      toast.error(err?.message || 'Bulk import failed');
    } finally {
      setBulkSaving(false);
    }
  };

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'tests'), (snap) => {
      setError(null);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Test));
      setLoading(false);
    }, (err) => {
      console.error('[tests] onSnapshot error:', err);
      setError(err?.message || 'Failed to load tests. Check Firestore permissions and network connection.');
      setLoading(false);
    });
    const u2 = onSnapshot(collection(db, 'subjects'), (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject)));
    const u3 = onSnapshot(collection(db, 'categories'), (snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)));

    // Live question counts → { testId: count }. Kept in state for instant
    // display in the "Qs" column, AND stale `questionCount` values are
    // written back to the test docs so the Flutter user app (which reads
    // `test.questionCount`) shows the right number too.
    const u4 = onSnapshot(collection(db, 'questions'), (snap) => {
      const map: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const tId = (d.data() as any)?.testId;
        if (tId) map[tId] = (map[tId] || 0) + 1;
      });
      setQuestionCountMap(map);
      const batch = writeBatch(db);
      let needsCommit = false;
      itemsRef.current.forEach((t) => {
        const correct = map[t.id] || 0;
        if ((t.questionCount || 0) !== correct) {
          batch.update(doc(db, 'tests', t.id), { questionCount: correct, updatedAt: serverTimestamp() });
          needsCommit = true;
        }
      });
      if (needsCommit) batch.commit().catch(() => {});
    });

    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name || '—';
  const categoryName = (sid: string) => {
    const sub = subjects.find((s) => s.id === sid);
    if (!sub) return '—';
    return categories.find((c) => c.id === sub.categoryId)?.name || '—';
  };

  // Subjects filtered by the selected category in the Add/Edit form. When the
  // admin picks a category, the Subject dropdown shows only subjects in that
  // category — so the admin doesn't have to hunt through a long flat list.
  const filteredSubjects = form.categoryId
    ? subjects.filter((s) => s.categoryId === form.categoryId)
    : subjects;

  const openAdd = () => {
    setForm({ ...emptyForm, type: fixedType || 'mock' });
    setEditingId(null);
    setDialogOpen(true);
  };
  const openEdit = (item: Test) => {
    // Pre-fill categoryId from the subject's parent category so the Subject
    // dropdown filters correctly and the admin sees the full hierarchy.
    const subj = subjects.find((s) => s.id === item.subjectId);
    setForm({
      categoryId: subj?.categoryId || '',
      subjectId: item.subjectId, title: item.title, titleAs: item.titleAs || '', slug: item.slug, type: item.type || 'mock',
      duration: item.duration, totalMarks: item.totalMarks, passingMarks: item.passingMarks,
      isPublished: item.isPublished, difficulty: item.difficulty || 'medium',
      negativeMarking: item.negativeMarking, negativeMarks: item.negativeMarks || 0.25,
      instructions: item.instructions || '', description: item.description || '', descriptionAs: item.descriptionAs || '',
      year: item.year || new Date().getFullYear(),
      examSession: item.examSession || '', isPremium: item.isPremium, price: item.price ?? 0,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.categoryId) { toast.error('Please select a category'); return; }
    if (!form.subjectId) { toast.error('Please select a subject'); return; }
    setSaving(true);
    try {
      // ---- Inherit premium status from the parent category ----
      // CRITICAL: a test inside a PREMIUM category must itself be premium,
      // otherwise the Flutter `take_test_screen` fast-path
      // (`if (!test.isPaid) grant`) lets users take it for free — bypassing
      // the category paywall. If the admin left "Premium test" OFF but the
      // test's subject's category is premium, force it ON and warn the admin.
      let effectiveIsPremium = form.isPremium;
      const subj = subjects.find((s) => s.id === form.subjectId);
      const cat = subj ? categories.find((c) => c.id === subj.categoryId) : undefined;
      if (cat?.isPremium && !form.isPremium) {
        effectiveIsPremium = true;
        toast.warning(
          `This test's category "${cat.name}" is premium — the test has been marked premium automatically so it isn't accessible for free.`,
        );
      }

      const data: any = {
        // Denormalize categoryId onto the test doc so downstream queries
        // (e.g. "all tests in SSC") don't need a subject lookup join.
        categoryId: form.categoryId,
        subjectId: form.subjectId,
        title: form.title.trim(),
        titleAs: form.titleAs.trim() || null,
        slug: form.slug ? slugify(form.slug) : slugify(form.title),
        // Force the fixed type when in fixedType mode (Daily Quiz section)
        type: fixedType || form.type,
        duration: Number(form.duration) || 60,
        totalMarks: Number(form.totalMarks) || 100,
        passingMarks: Number(form.passingMarks) || 40,
        isPublished: form.isPublished,
        difficulty: form.difficulty,
        negativeMarking: form.negativeMarking,
        negativeMarks: Number(form.negativeMarks) || 0,
        instructions: form.instructions || null,
        description: form.description.trim() || null,
        descriptionAs: form.descriptionAs.trim() || null,
        isPremium: effectiveIsPremium,
        price: Number(form.price) || 0,
      };
      if ((fixedType || form.type) === 'previousYear') {
        data.year = Number(form.year) || null;
        data.examSession = form.examSession || null;
      }
      if (editingId) {
        await updateDoc(doc(db, 'tests', editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success('Test updated');
      } else {
        await addDoc(collection(db, 'tests'), { ...data, questionCount: 0, attemptCount: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success('Test added');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'tests', deleteId));
      toast.success('Test deleted');
      setDeleteId(null);
    } catch (err: any) { toast.error(err?.message || 'Delete failed'); }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = visibleItems.map((t) => t.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someFilteredSelected = filteredIds.some((id) => selectedIds.has(id)) && !allFilteredSelected;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredIds.forEach((id) => next.delete(id));
      } else {
        filteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      await deleteItems('tests', ids);
      toast.success(`${ids.length} test${ids.length === 1 ? '' : 's'} deleted`);
      setBulkDeleteOpen(false);
      clearSelection();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Reset tests to free (isPremium=false, price=0) in a single Firestore batch.
  // all=true -> every test; all=false -> only selected tests.
  const handleBulkMakeFree = async (all: boolean) => {
    const ids = all ? items.map((t) => t.id) : Array.from(selectedIds);
    if (ids.length === 0) {
      toast.error('No tests to update');
      return;
    }
    setBulkFreeing(true);
    try {
      const batch = writeBatch(db);
      for (const id of ids) {
        const ref = doc(db, 'tests', id);
        batch.update(ref, { isPremium: false, price: 0 });
      }
      await batch.commit();
      toast.success(`${ids.length} test${ids.length === 1 ? '' : 's'} reset to free`);
      setBulkFreeOpen(false);
      setBulkFreeAllOpen(false);
      if (!all) clearSelection();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset tests');
    } finally {
      setBulkFreeing(false);
    }
  };

  const manageQuestions = (test: Test) => {
    setSelectedTest(test.id, test.title);
    setCurrentSection('questions');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> {fixedLabel || 'Tests'}
          </h3>
          <p className="text-slate-500 text-sm">
            {fixedType
              ? `Manage ${fixedLabel} tests — published ones appear in the user app's ${fixedLabel} screen.`
              : 'Mock tests, daily quizzes, practice sets'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> {fixedType ? `Add ${fixedLabel}` : 'Add Test'}
          </Button>
          {!fixedType && (
            <Button
              variant="outline"
              onClick={() => setBulkOpen(true)}
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <Layers className="w-4 h-4 mr-1" /> Bulk Add
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
      ) : (
        <>
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 text-red-300 text-sm rounded-lg bg-red-950/40 border border-red-800/40 mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 underline shrink-0">Dismiss</button>
        </div>
      )}
      {visibleItems.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">
              {fixedType
                ? `No ${fixedLabel} tests yet. Add your first one!`
                : 'No tests yet. Add your first one!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-red-900/50 bg-red-950/30 px-3 py-1.5 flex-wrap">
            <Badge variant="outline" className="bg-red-950/60 text-red-300 border-red-800/50">
              {selectedIds.size} selected
            </Badge>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 bg-red-600 hover:bg-red-700"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-emerald-700 text-emerald-300 hover:bg-emerald-950/40"
              onClick={() => setBulkFreeOpen(true)}
              title="Reset selected tests to free (isPremium=false, price=0)"
            >
              <Unlock className="w-3.5 h-3.5 mr-1" /> Make Selected Free
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-slate-400 hover:bg-slate-800"
              onClick={clearSelection}
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
        {/* Always-available "Make ALL tests free" banner */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-amber-900/50 bg-amber-950/20 px-3 py-1.5 flex-wrap">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-200/80">
              {items.filter((t) => t.isPremium || t.price > 0).length} of {items.length} tests are currently paid/premium.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-amber-700 text-amber-300 hover:bg-amber-950/40"
              onClick={() => setBulkFreeAllOpen(true)}
              title="Reset ALL tests to free (isPremium=false, price=0)"
            >
              <Unlock className="w-3.5 h-3.5 mr-1" /> Make ALL Tests Free
            </Button>
          </div>
        )}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase">
                    <th className="text-left p-4 font-medium w-[44px]">
                      <Checkbox
                        checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all tests"
                      />
                    </th>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Subject / Category</th>
                    {!fixedType && <th className="text-left p-4 font-medium">Type</th>}
                    <th className="text-center p-4 font-medium">Duration</th>
                    <th className="text-center p-4 font-medium">Qs</th>
                    <th className="text-center p-4 font-medium">Price</th>
                    <th className="text-center p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                    <tr key={item.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 group ${isSelected ? 'bg-red-950/20' : ''}`}>
                      <td className="p-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOne(item.id)}
                          aria-label={`Select ${item.title}`}
                        />
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">{item.title}</p>
                        {item.year && <p className="text-slate-500 text-xs">{item.year}{item.examSession ? ` · ${item.examSession}` : ''}</p>}
                      </td>
                      <td className="p-4">
                        <p className="text-slate-300">{subjectName(item.subjectId)}</p>
                        <p className="text-slate-600 text-xs">{categoryName(item.subjectId)}</p>
                      </td>
                      {!fixedType && (
                        <td className="p-4">
                          <Badge variant="outline" className={TYPE_COLORS[item.type] || TYPE_COLORS.mock}>{TYPE_LABELS[item.type] || item.type}</Badge>
                        </td>
                      )}
                      <td className="p-4 text-center text-slate-400">{item.duration}m</td>
                      <td className="p-4 text-center text-slate-400">
                        {/* Live count from the questions collection — always
                            accurate, even right after a bulk question import
                            that didn't update test.questionCount. Falls back
                            to the stored field if the map hasn't loaded yet. */}
                        {questionCountMap[item.id] ?? item.questionCount ?? 0}
                      </td>
                      <td className="p-4 text-center">
                        {item.price && item.price > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800">₹{item.price}</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-500 bg-slate-800/60 border border-slate-700">FREE</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.isPublished ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                          {item.isPremium && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="h-8 border-slate-700 text-emerald-400 hover:bg-slate-800" onClick={() => manageQuestions(item)}>
                            <FileQuestion className="w-3.5 h-3.5 mr-1" /> Qs
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => openEdit(item)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-950/40" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </>
      )}
      </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Test' : fixedType ? `Add ${fixedLabel}` : 'Add Test'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} placeholder="e.g. RRB NTPC Mock Test 1" className="bg-slate-800 border-slate-700" />
            </div>
            {/* Bilingual: Assamese title (optional) */}
            <div className="space-y-2 rounded-md border border-amber-800/30 bg-amber-950/10 p-3">
              <Label className="text-amber-300 flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" /> Title (Assamese) <span className="text-slate-500 font-normal">— optional</span></Label>
              <Input value={form.titleAs} onChange={(e) => setForm({ ...form, titleAs: e.target.value })} placeholder="অসমীয়া শিৰোনাম" className="bg-slate-800 border-amber-800/50" />
            </div>
            {/* Category + Subject row. Category filters the Subject dropdown so
                the admin doesn't scroll through a long flat subject list. */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v, subjectId: '' })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-500">No categories yet</div>
                    ) : (
                      categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}{c.isPremium ? ' 👑' : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="text-xs text-amber-400/80 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    No categories found.{' '}
                    <button
                      type="button"
                      onClick={() => setCurrentSection('categories')}
                      className="underline text-emerald-400 hover:text-emerald-300"
                    >
                      Add a category first →
                    </button>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select
                  value={form.subjectId}
                  onValueChange={(v) => setForm({ ...form, subjectId: v })}
                  disabled={!form.categoryId}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder={form.categoryId ? 'Select subject' : 'Select category first'} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {filteredSubjects.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-500">
                        {form.categoryId ? 'No subjects in this category' : 'Select a category first'}
                      </div>
                    ) : (
                      filteredSubjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {form.categoryId && filteredSubjects.length === 0 && (
                  <p className="text-xs text-amber-400/80 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    No subjects in this category yet.{' '}
                    <button
                      type="button"
                      onClick={() => setCurrentSection('subjects')}
                      className="underline text-emerald-400 hover:text-emerald-300"
                    >
                      Add a subject →
                    </button>
                  </p>
                )}
              </div>
            </div>
            {/* Type — full-width row. When fixedType is set, shows a disabled
                input explaining the type is locked for this section. */}
            <div className="space-y-2">
              <Label>Type</Label>
              {!fixedType ? (
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="mock">Mock Test</SelectItem>
                    <SelectItem value="previousYear">Previous Year</SelectItem>
                    <SelectItem value="dailyQuiz">Daily Quiz</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                    <SelectItem value="subjectwise">Subject-wise</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <Input
                    value={fixedLabel || fixedType}
                    disabled
                    className="bg-slate-800 border-slate-700 text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-amber-400/80 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Type is fixed for this section and cannot be changed.
                  </p>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
              <div className="space-y-2"><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
              <div className="space-y-2"><Label>Passing Marks</Label><Input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Negative Marks (per wrong)</Label>
                <Input type="number" step="0.25" value={form.negativeMarks} onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })} disabled={!form.negativeMarking} className="bg-slate-800 border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed" />
                {!form.negativeMarking && (
                  <p className="text-xs text-amber-400/80 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Turn on "Negative Marking" below to set the deduction value.
                  </p>
                )}
              </div>
            </div>
            {form.type === 'previousYear' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Year</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
                <div className="space-y-2"><Label>Exam Session</Label><Input value={form.examSession} onChange={(e) => setForm({ ...form, examSession: e.target.value })} placeholder="e.g. CBT-1 Shift-2" className="bg-slate-800 border-slate-700" /></div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={2} placeholder="Test instructions for students" className="bg-slate-800 border-slate-700" />
            </div>
            {/* Bilingual: Assamese description (optional) */}
            <div className="space-y-2 rounded-md border border-amber-800/30 bg-amber-950/10 p-3">
              <Label className="text-amber-300 flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" /> Description (Assamese) <span className="text-slate-500 font-normal">— optional</span></Label>
              <Textarea value={form.descriptionAs} onChange={(e) => setForm({ ...form, descriptionAs: e.target.value })} rows={2} placeholder="অসমীয়া বিৱৰণ" className="bg-slate-800 border-amber-800/50" />
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
                <Label className="cursor-pointer">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.negativeMarking} onCheckedChange={(v) => setForm({ ...form, negativeMarking: v })} />
                <Label className="cursor-pointer">Negative Marking</Label>
              </div>
            </div>
            {/* Premium + Price box — mirrors the category premium layout.
                When Premium is ON, a Price input appears below the toggle so
                the admin always sets an amount for premium tests. This fixes
                the "Buy for ₹0" bug in the user app (premium test with no
                price showed a broken buy button). */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <Label className="cursor-pointer font-semibold text-white">Premium Test</Label>
                </div>
                <Switch
                  checked={form.isPremium}
                  onCheckedChange={(v) => setForm({ ...form, isPremium: v })}
                />
              </div>
              <p className="text-xs text-slate-500">
                Premium tests require a subscription OR a one-time per-test payment. Set a price below so non-premium users can buy it individually.
              </p>
              {(form.isPremium || form.price > 0) && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-700">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Price (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      placeholder="29"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <p className="text-xs text-amber-400/80 flex items-center gap-1">
                      <Info className="w-3 h-3" /> {form.isPremium ? '0 = premium-only (users must subscribe). Non-zero = buy individually OR subscribe.' : 'Non-zero enables pay-per-test purchase without premium.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Bulk Add Tests</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of test objects below, or paste CSV rows (first row = column headers).
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJson('tests-template', JSON.parse(BULK_SAMPLE))}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv('tests-template', CSV_HEADERS, CSV_SAMPLE_ROWS)}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Download CSV
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkText(BULK_SAMPLE)}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  Load Sample
                </Button>
              </div>
            </div>
            <BulkTextarea
              value={bulkText}
              onChange={setBulkText}
              placeholder='[{"title":"SSC Mock 1","titleAs":"...","description":"...","descriptionAs":"...","type":"mock","duration":60}]'
            />
            <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2">
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mb-1">
                <Languages className="w-3.5 h-3.5" /> Bilingual support (English + Assamese)
              </p>
              <p className="text-xs text-amber-200/70">
                Add <code className="text-amber-300">titleAs</code> and <code className="text-amber-300">descriptionAs</code> alongside the English fields to show tests in both languages. The <code className="text-amber-300">*As</code> fields are optional.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">title</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">titleAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">description</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">descriptionAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400 text-emerald-300">subjectName</span> (parent subject — recommended) or{' '}
              <span className="text-slate-400">subjectId</span> (existing id),{' '}
              <span className="text-slate-400 text-emerald-300">categoryName</span> (optional, disambiguates same-name subjects),{' '}
              <span className="text-slate-400">type</span> (mock | previousYear | dailyQuiz | practice | subjectwise),{' '}
              <span className="text-slate-400">duration</span> (min),{' '}
              <span className="text-slate-400">totalMarks</span>,{' '}
              <span className="text-slate-400">passingMarks</span>,{' '}
              <span className="text-slate-400">difficulty</span> (easy | medium | hard),{' '}
              <span className="text-slate-400">isPublished</span> (boolean),{' '}
              <span className="text-slate-400">isPremium</span> (boolean),{' '}
              <span className="text-slate-400">negativeMarking</span> (boolean),{' '}
              <span className="text-slate-400">negativeMarks</span> (number),{' '}
              <span className="text-slate-400">price</span> (number, INR; 0 = free),{' '}
              <span className="text-slate-400">instructions</span> (string),{' '}
              <span className="text-slate-400">imageUrl</span> (URL string)
            </p>
            <p className="text-xs text-slate-500">
              Tip: add subjects first, then bulk-add tests by{' '}
              <code className="text-emerald-300">subjectName</code>{' '}
              (+ optional <code className="text-emerald-300">categoryName</code>{' '}
              if the same subject name exists in multiple categories). Tests
              inside a premium category are auto-marked premium.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkOpen(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={bulkSaving || !bulkText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {bulkSaving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Validate & Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this test?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Questions under this test will remain in Firestore but lose their test link.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} test{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} test{selectedIds.size === 1 ? '' : 's'} from Firestore.
              Questions under these tests will remain in Firestore but lose their test link.
              <span className="block mt-2 text-red-300 font-medium">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {bulkDeleting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Delete {selectedIds.size} test{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk "Make Selected Free" confirmation */}
      <AlertDialog open={bulkFreeOpen} onOpenChange={setBulkFreeOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" /> Reset {selectedIds.size} test{selectedIds.size === 1 ? '' : 's'} to free?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This sets <b>isPremium = false</b> and <b>price = 0</b> on the selected test{selectedIds.size === 1 ? '' : 's'} in Firestore.
              Users will be able to attempt them without paying or subscribing.
              <span className="block mt-2 text-emerald-300 font-medium">You can re-enable premium/pricing later by editing each test.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkMakeFree(false)}
              disabled={bulkFreeing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {bulkFreeing && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Make {selectedIds.size} test{selectedIds.size === 1 ? '' : 's'} free
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* "Make ALL tests free" confirmation */}
      <AlertDialog open={bulkFreeAllOpen} onOpenChange={setBulkFreeAllOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-400" /> Make ALL {items.length} tests free?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will reset <b>isPremium = false</b> and <b>price = 0</b> on <b>every test</b> in Firestore
              ({items.length} total, {items.filter((t) => t.isPremium || t.price > 0).length} currently paid/premium).
              All users will be able to attempt every test without paying.
              <span className="block mt-2 text-amber-300 font-medium">Use this if tests are incorrectly showing "Go Premium" in the user app.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkMakeFree(true)}
              disabled={bulkFreeing}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {bulkFreeing && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Make all {items.length} tests free
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
