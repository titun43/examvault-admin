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
  query,
  where,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/lib/store';
import { uploadImage, deleteItems, deleteDocWithFiles, deleteItemsWithFiles } from '@/lib/admin-firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BulkTextarea } from './bulk-textarea';
import { resolveTestIdByName } from '@/lib/bulk-resolve';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, FileQuestion, ArrowLeft, CheckCircle2, Circle, Image as ImageIcon, X, Crown, Layers, Download, FileSpreadsheet, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { downloadJson, downloadCsv, parseCsv } from '@/lib/download';

interface Question {
  id: string;
  testId: string;
  question: string;
  questionAs?: string;
  options: string[];
  optionsAs?: string[];
  correctAnswerIndex: number;
  explanation?: string;
  explanationAs?: string;
  subjectTopic?: string;
  marks: number;
  isPremium: boolean;
  imageUrl?: string;
}

const emptyForm = {
  question: '', questionAs: '', options: ['', '', '', ''], optionsAs: ['', '', '', ''], correctAnswerIndex: 0,
  explanation: '', explanationAs: '', subjectTopic: '', marks: 1, isPremium: false, imageUrl: '',
};

export default function Questions() {
  const { selectedTestId, selectedTestTitle, setCurrentSection } = useAppStore();
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Bilingual template: English (primary) + Assamese (As suffix).
  // The *As fields are optional — if omitted, the question is single-language.
  // Firestore is schemaless, so adding these fields requires no migration.
  const BULK_SAMPLE = '[{"testTitle":"SSC Mock 1","subjectName":"Quantitative Aptitude","categoryName":"SSC","question":"What is 2+2?","questionAs":"২+২ ৰ মান কি?","options":["3","4","5","6"],"optionsAs":["৩","৪","৫","৬"],"correctAnswer":1,"explanation":"2+2=4","explanationAs":"২+২=৪","difficulty":"easy","marks":1},{"testTitle":"SSC Mock 1","subjectName":"Quantitative Aptitude","categoryName":"SSC","question":"Capital of India?","questionAs":"ভাৰতৰ ৰাজধানী কি?","options":["Mumbai","Delhi","Kolkata","Chennai"],"optionsAs":["মুম্বাই","দিল্লী","কলকাতা","চেন্নাই"],"correctAnswer":1,"explanation":"New Delhi is the capital","explanationAs":"নতুন দিল্লী হৈছে ৰাজধানী","difficulty":"easy","marks":1}]';

  const CSV_HEADERS = ['testTitle', 'subjectName', 'categoryName', 'question', 'questionAs', 'option1', 'option2', 'option3', 'option4', 'option1As', 'option2As', 'option3As', 'option4As', 'correctAnswerIndex', 'explanation', 'explanationAs', 'subjectTopic', 'marks', 'isPremium'];
  const CSV_SAMPLE_ROWS: (string | number | boolean)[][] = [
    ['SSC Mock 1', 'Quantitative Aptitude', 'SSC', 'What is 2+2?', '২+২ ৰ মান কি?', '3', '4', '5', '6', '৩', '৪', '৫', '৬', 1, '2+2=4', '২+২=৪', 'Math', 1, false],
    ['SSC Mock 1', 'Quantitative Aptitude', 'SSC', 'Capital of India?', 'ভাৰতৰ ৰাজধানী কি?', 'Mumbai', 'Delhi', 'Kolkata', 'Chennai', 'মুম্বাই', 'দিল্লী', 'কলকাতা', 'চেন্নাই', 1, 'New Delhi is the capital', 'নতুন দিল্লী হৈছে ৰাজধানী', 'GK', 1, false],
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
            // Transform CSV-only columns into the Firestore object shape
            const opt1 = obj.option1 ?? '';
            const opt2 = obj.option2 ?? '';
            const opt3 = obj.option3 ?? '';
            const opt4 = obj.option4 ?? '';
            obj.options = [opt1, opt2, opt3, opt4];
            // Bilingual: map option*As columns -> optionsAs array (Assamese)
            const opt1As = obj.option1As ?? '';
            const opt2As = obj.option2As ?? '';
            const opt3As = obj.option3As ?? '';
            const opt4As = obj.option4As ?? '';
            if (opt1As || opt2As || opt3As || opt4As) {
              obj.optionsAs = [opt1As, opt2As, opt3As, opt4As];
            }
            delete obj.option1;
            delete obj.option2;
            delete obj.option3;
            delete obj.option4;
            delete obj.option1As;
            delete obj.option2As;
            delete obj.option3As;
            delete obj.option4As;
            if ('correctAnswerIndex' in obj) {
              obj.correctAnswerIndex = Number(obj.correctAnswerIndex) || 0;
            }
            if ('marks' in obj) obj.marks = Number(obj.marks) || 0;
            if ('isPremium' in obj) obj.isPremium = String(obj.isPremium).toLowerCase() === 'true';
            // CSV fallback: only attach to selected test if the row has NO
            // test reference at all (no testId AND no testTitle). If the row
            // has a testTitle, let the resolution loop below handle it.
            if (selectedTestId && !obj.testId && !obj.testTitle) {
              obj.testId = selectedTestId;
            }
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
      // Each row can use EITHER `testId` (explicit Firestore doc id —
      // backward compatible) OR `testTitle` (resolved to id via Firestore
      // lookup, optionally disambiguated by `subjectName` + `categoryName`).
      // If both are present, testId wins.
      //
      // IMPORTANT for CSV users: CSV rows do NOT carry a test reference, so
      // they fall back to the currently-selected test in the dropdown above
      // (selectedTestId). This preserves the previous CSV behaviour.
      // -----------------------------------------------------------------
      const skipList: { row: number; reason: string }[] = [];
      const resolved: any[] = [];
      const testIdCache = new Map<string, string | null>();

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        const rowNo = i + 1;
        let testId = (item.testId ?? '').toString().trim();
        const testTitle = (item.testTitle ?? '').toString().trim();
        const subjName = (item.subjectName ?? '').toString().trim();
        const catName = (item.categoryName ?? '').toString().trim();

        const testKey = `${testTitle.toLowerCase()}||${subjName.toLowerCase()}||${catName.toLowerCase()}`;

        if (!testId && testTitle) {
          if (testIdCache.has(testKey)) {
            testId = testIdCache.get(testKey) ?? '';
          } else {
            const r = await resolveTestIdByName(
              testTitle,
              subjName || undefined,
              catName || undefined,
            );
            testIdCache.set(testKey, r.id);
            testId = r.id ?? '';
          }
          if (!testId) {
            skipList.push({
              row: rowNo,
              reason: `test "${testTitle}"${subjName ? ` (in ${subjName}${catName ? ` / ${catName}` : ''})` : ''} not found`,
            });
            continue;
          }
        }
        // CSV fallback: if no test reference at all, attach to selected test.
        if (!testId && selectedTestId) {
          testId = selectedTestId;
        }
        if (!testId) {
          skipList.push({
            row: rowNo,
            reason: 'no testId, testTitle, or selected test in the dropdown',
          });
          continue;
        }

        const payload = { ...item };
        payload.testId = testId;
        delete payload.testTitle;
        delete payload.subjectName;
        delete payload.categoryName;
        if (!payload.createdAt) payload.createdAt = serverTimestamp();
        if (!payload.updatedAt) payload.updatedAt = serverTimestamp();
        resolved.push(payload);
      }

      if (resolved.length === 0) {
        const sample = skipList.slice(0, 3).map((s) => `Row ${s.row}: ${s.reason}`).join('; ');
        toast.error(`No rows to import. ${sample}${skipList.length > 3 ? ` (+${skipList.length - 3} more)` : ''}`);
        return;
      }

      const batch = writeBatch(db);
      const colRef = collection(db, 'questions');
      resolved.forEach((payload) => {
        const ref = doc(colRef);
        batch.set(ref, payload);
      });
      await batch.commit();

      // ---- Sync questionCount on every affected test doc ----
      // The Test model stores a denormalized `questionCount` field that the
      // Flutter user app reads directly (it doesn't count questions itself).
      // The single-add / single-delete paths below update this field, but
      // bulk-import never did — so after a bulk import the count stayed at
      // 0 (or stale) until someone opened the Tests admin page (whose own
      // onSnapshot writeback would eventually fix it).
      //
      // We now write the ABSOLUTE count (via a fresh getDocs query per
      // affected test) instead of `increment(N)` to avoid races with the
      // Tests page's own writeback. Both writebacks are idempotent and
      // write the same value, so order doesn't matter.
      const affectedTestIds = Array.from(
        new Set(resolved.map((r) => r.testId).filter(Boolean)),
      );
      await Promise.all(
        affectedTestIds.map(async (testId) => {
          try {
            const qsnap = await getDocs(
              query(collection(db, 'questions'), where('testId', '==', testId)),
            );
            await updateDoc(doc(db, 'tests', testId), {
              questionCount: qsnap.size,
              updatedAt: serverTimestamp(),
            });
          } catch (e) {
            // Don't fail the whole import if one test's count sync fails —
            // the Tests admin page's onSnapshot will reconcile it later.
            console.warn('[questions bulk] count sync failed for', testId, e);
          }
        }),
      );

      const skippedNote = skipList.length > 0 ? `, ${skipList.length} skipped` : '';
      toast.success(`Imported ${resolved.length} question${resolved.length === 1 ? '' : 's'}${skippedNote}` + (isCsv ? ' (from CSV)' : ''));
      if (skipList.length > 0) {
        console.warn('[questions bulk] skipped rows:', skipList);
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
    if (!selectedTestId) { setLoading(false); return; }
    setLoading(true);
    const q = query(collection(db, 'questions'), where('testId', '==', selectedTestId));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Question));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [selectedTestId]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (item: Question) => {
    setForm({
      question: item.question,
      questionAs: item.questionAs || '',
      options: item.options?.length === 4 ? item.options : ['', '', '', ''],
      optionsAs: item.optionsAs?.length === 4 ? item.optionsAs : ['', '', '', ''],
      correctAnswerIndex: item.correctAnswerIndex ?? 0,
      explanation: item.explanation || '',
      explanationAs: item.explanationAs || '',
      subjectTopic: item.subjectTopic || '',
      marks: item.marks || 1,
      isPremium: item.isPremium || false,
      imageUrl: item.imageUrl || '',
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage('test_images', file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.question.trim()) { toast.error('Question text is required'); return; }
    if (form.options.some((o) => !o.trim())) { toast.error('All 4 options are required'); return; }
    setSaving(true);
    try {
      const data: any = {
        testId: selectedTestId,
        question: form.question.trim(),
        options: form.options.map((o) => o.trim()),
        correctAnswerIndex: Number(form.correctAnswerIndex),
        explanation: form.explanation || null,
        subjectTopic: form.subjectTopic || null,
        marks: Number(form.marks) || 1,
        isPremium: form.isPremium,
        imageUrl: form.imageUrl || null,
      };
      // Bilingual: only save *As fields if they have content (don't store empty strings)
      if (form.questionAs.trim()) data.questionAs = form.questionAs.trim();
      if (form.optionsAs.some((o) => o.trim())) data.optionsAs = form.optionsAs.map((o) => o.trim());
      if (form.explanationAs.trim()) data.explanationAs = form.explanationAs.trim();
      if (editingId) {
        await updateDoc(doc(db, 'questions', editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success('Question updated');
      } else {
        await addDoc(collection(db, 'questions'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        // Increment questionCount on the test
        const testRef = doc(db, 'tests', selectedTestId!);
        await updateDoc(testRef, { questionCount: items.length + 1 });
        toast.success('Question added');
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
      await deleteDocWithFiles('questions', deleteId, ['imageUrl']);
      // Decrement questionCount
      if (selectedTestId) {
        const testRef = doc(db, 'tests', selectedTestId);
        await updateDoc(testRef, { questionCount: Math.max(0, items.length - 1) });
      }
      toast.success('Question deleted');
      setDeleteId(null);
    } catch (err: any) { toast.error(err?.message || 'Delete failed'); }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((q) => q.id);
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
      await deleteItemsWithFiles('questions', ids, ['imageUrl']);
      // Decrement questionCount on the test
      if (selectedTestId) {
        const testRef = doc(db, 'tests', selectedTestId);
        await updateDoc(testRef, { questionCount: Math.max(0, items.length - ids.length) });
      }
      toast.success(`${ids.length} question${ids.length === 1 ? '' : 's'} deleted`);
      setBulkDeleteOpen(false);
      clearSelection();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  if (!selectedTestId) {
    return (
      <Card className="bg-slate-900 border-slate-800 border-dashed">
        <CardContent className="py-16 text-center">
          <FileQuestion className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No test selected. Please select a test first to manage its questions.</p>
          <Button onClick={() => setCurrentSection('tests')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Go to Tests
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 shrink-0" onClick={() => setCurrentSection('tests')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2 truncate">
              <FileQuestion className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="truncate">Questions</span>
            </h3>
            <p className="text-slate-500 text-sm truncate">for: {selectedTestTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add Question
          </Button>
          <Button
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 shrink-0"
          >
            <Layers className="w-4 h-4 mr-1" /> Bulk Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <FileQuestion className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No questions yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="flex items-center gap-3 flex-wrap rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all questions"
            />
            <span className="text-sm text-slate-400">
              {allFilteredSelected ? 'All selected' : someFilteredSelected ? `${selectedIds.size} selected` : 'Select all'}
            </span>
          </div>
          <div className="flex-1" />
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
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
                variant="ghost"
                className="h-8 text-slate-400 hover:bg-slate-800"
                onClick={clearSelection}
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => {
            const isSelected = selectedIds.has(item.id);
            return (
            <Card key={item.id} className={`bg-slate-900 hover:border-slate-700 transition-colors group ${isSelected ? 'border-red-800 bg-red-950/20' : 'border-slate-800'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelectOne(item.id)}
                    aria-label={`Select question ${idx + 1}`}
                    className="mt-1"
                  />
                  <div className="w-7 h-7 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="text-white font-medium flex-1 min-w-0">{item.question}</p>
                      {item.questionAs && <Badge variant="outline" className="border-amber-700/60 text-amber-300 bg-amber-950/30 shrink-0"><Languages className="w-3 h-3 mr-1" />AS</Badge>}
                      {item.isPremium && <Badge variant="outline" className="border-amber-700 text-amber-400 bg-amber-950/40 shrink-0"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
                      <Badge variant="outline" className="border-slate-700 text-slate-400 shrink-0">{item.marks}m</Badge>
                    </div>
                    {item.questionAs && <p className="text-amber-200/70 text-sm mt-1 font-medium">{item.questionAs}</p>}
                    {item.imageUrl && <img src={item.imageUrl} alt="question" className="mt-2 max-h-40 rounded-lg" />}
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {item.options?.map((opt, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${i === item.correctAnswerIndex ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300' : 'bg-slate-800/50 text-slate-400'}`}>
                          {i === item.correctAnswerIndex ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Circle className="w-4 h-4 text-slate-600 shrink-0" />}
                          <span className="font-mono text-xs text-slate-500">{String.fromCharCode(65 + i)}.</span>
                          <span className="truncate">{opt}</span>
                        </div>
                      ))}
                    </div>
                    {item.optionsAs && item.optionsAs.length > 0 && item.optionsAs.some((o) => o && o.trim()) && (
                      <div className="mt-1.5 grid sm:grid-cols-2 gap-2">
                        {item.optionsAs.map((opt, i) => (
                          <div key={`as-${i}`} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${i === item.correctAnswerIndex ? 'bg-amber-950/20 border border-amber-800/30 text-amber-200/80' : 'bg-slate-800/20 text-slate-500'}`}>
                            <span className="font-mono text-[10px] text-amber-600/70">{String.fromCharCode(65 + i)}.</span>
                            <span className="truncate">{opt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.explanation && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-800/30 border border-slate-800">
                        <p className="text-xs text-slate-500">Explanation:</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.explanation}</p>
                        {item.explanationAs && <p className="text-xs text-amber-200/60 mt-1 border-t border-slate-700/50 pt-1">{item.explanationAs}</p>}
                      </div>
                    )}
                    {item.subjectTopic && <p className="text-xs text-slate-600 mt-1">Topic: {item.subjectTopic}</p>}
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => openEdit(item)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-950/40" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Question' : 'Add Question'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question *</Label>
              <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={3} placeholder="Enter the question..." className="bg-slate-800 border-slate-700" />
            </div>
            {/* Bilingual: Assamese question (optional) */}
            <div className="space-y-2 rounded-md border border-amber-800/30 bg-amber-950/10 p-3">
              <Label className="text-amber-300 flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" /> Question (Assamese) <span className="text-slate-500 font-normal">— optional</span></Label>
              <Textarea value={form.questionAs} onChange={(e) => setForm({ ...form, questionAs: e.target.value })} rows={2} placeholder="অসমীয়া প্ৰশ্ন..." className="bg-slate-800 border-amber-800/50" />
            </div>
            {form.imageUrl && (
              <div className="relative inline-block">
                <img src={form.imageUrl} alt="preview" className="max-h-32 rounded-lg" />
                <button onClick={() => setForm({ ...form, imageUrl: '' })} className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white"><X className="w-3 h-3" /></button>
              </div>
            )}
            <div className="space-y-2">
              <Label>Options * (select the correct answer)</Label>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button type="button" onClick={() => setForm({ ...form, correctAnswerIndex: i })} className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${i === form.correctAnswerIndex ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 text-slate-500 hover:border-slate-500'}`}>
                      {String.fromCharCode(65 + i)}
                    </button>
                    <Input value={opt} onChange={(e) => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="bg-slate-800 border-slate-700" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Click the letter button to mark the correct answer (currently: <span className="text-emerald-400 font-semibold">{String.fromCharCode(65 + form.correctAnswerIndex)}</span>)</p>
            </div>
            {/* Bilingual: Assamese options (optional) */}
            <div className="space-y-2 rounded-md border border-amber-800/30 bg-amber-950/10 p-3">
              <Label className="text-amber-300 flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" /> Options (Assamese) <span className="text-slate-500 font-normal">— optional, same order as above</span></Label>
              <div className="space-y-2">
                {form.optionsAs.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-amber-800/50 text-amber-400 text-sm font-bold">{String.fromCharCode(65 + i)}</span>
                    <Input value={opt} onChange={(e) => { const opts = [...form.optionsAs]; opts[i] = e.target.value; setForm({ ...form, optionsAs: opts }); }} placeholder={`বিকল্প ${String.fromCharCode(65 + i)}`} className="bg-slate-800 border-amber-800/50" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} placeholder="Why is this the correct answer?" className="bg-slate-800 border-slate-700" />
            </div>
            {/* Bilingual: Assamese explanation (optional) */}
            <div className="space-y-2 rounded-md border border-amber-800/30 bg-amber-950/10 p-3">
              <Label className="text-amber-300 flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" /> Explanation (Assamese) <span className="text-slate-500 font-normal">— optional</span></Label>
              <Textarea value={form.explanationAs} onChange={(e) => setForm({ ...form, explanationAs: e.target.value })} rows={2} placeholder="কিয় এইটো শুদ্ধ উত্তৰ?" className="bg-slate-800 border-amber-800/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Subject Topic</Label><Input value={form.subjectTopic} onChange={(e) => setForm({ ...form, subjectTopic: e.target.value })} placeholder="e.g. Indian Polity" className="bg-slate-800 border-slate-700" /></div>
              <div className="space-y-2"><Label>Marks</Label><Input type="number" value={form.marks} onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2"><Switch checked={form.isPremium} onCheckedChange={(v) => setForm({ ...form, isPremium: v })} /><Label className="cursor-pointer flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-400" /> Premium only</Label></div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="border-slate-700 text-slate-300">
                {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-1" />}
                {form.imageUrl ? 'Change Image' : 'Add Image'}
              </Button>
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
            <DialogTitle>Bulk Add Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of question objects below, or paste CSV rows (first row = column headers).
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJson('questions-template', JSON.parse(BULK_SAMPLE))}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv('questions-template', CSV_HEADERS, CSV_SAMPLE_ROWS)}
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
              placeholder='[{"testTitle":"SSC Mock 1","question":"...","questionAs":"...","options":["A","B","C","D"],"optionsAs":["ক","খ","গ","ঘ"],"correctAnswer":1}]'
            />
            <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2">
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mb-1">
                <Languages className="w-3.5 h-3.5" /> Bilingual support (English + Assamese)
              </p>
              <p className="text-xs text-amber-200/70">
                Add <code className="text-amber-300">questionAs</code>, <code className="text-amber-300">optionsAs</code> (array of 4), and{' '}
                <code className="text-amber-300">explanationAs</code> alongside the English fields to show questions in both languages.
                The <code className="text-amber-300">*As</code> fields are optional — omit them for English-only questions.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400 text-emerald-300">testTitle</span> (parent test — recommended) or{' '}
              <span className="text-slate-400">testId</span> (existing id),{' '}
              <span className="text-slate-400 text-emerald-300">subjectName</span> +{' '}
              <span className="text-slate-400 text-emerald-300">categoryName</span> (optional, disambiguates same-name tests),{' '}
              <span className="text-slate-400">question</span> (string, English),{' '}
              <span className="text-slate-400 text-amber-300">questionAs</span> (string, Assamese — optional),{' '}
              <span className="text-slate-400">options</span> (array of 4 strings, English),{' '}
              <span className="text-slate-400 text-amber-300">optionsAs</span> (array of 4 strings, Assamese — optional),{' '}
              <span className="text-slate-400">correctAnswer</span> (0-based index),{' '}
              <span className="text-slate-400">explanation</span> (string, English),{' '}
              <span className="text-slate-400 text-amber-300">explanationAs</span> (string, Assamese — optional),{' '}
              <span className="text-slate-400">difficulty</span> (easy | medium | hard),{' '}
              <span className="text-slate-400">marks</span> (number),{' '}
              <span className="text-slate-400">imageUrl</span> (URL string),{' '}
              <span className="text-slate-400">isPremium</span> (boolean)
            </p>
            <p className="text-xs text-slate-500">
              Tip: add tests first, then bulk-add questions by{' '}
              <code className="text-emerald-300">testTitle</code>. For CSV
              without a test column, questions attach to the test selected in
              the dropdown above.
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
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">This action cannot be undone.</AlertDialogDescription>
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} question{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} question{selectedIds.size === 1 ? '' : 's'} from Firestore.
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
              Delete {selectedIds.size} question{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
