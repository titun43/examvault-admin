'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteItems } from '@/lib/admin-firestore';
import { useAppStore } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, FileText, FileQuestion, Crown, Eye, EyeOff, Layers, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { downloadJson } from '@/lib/download';

interface Test {
  id: string;
  subjectId: string;
  title: string;
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
  year?: number;
  examSession?: string;
  isPremium: boolean;
  price: number;
  questionCount?: number;
  attemptCount?: number;
}

interface Subject { id: string; name: string; categoryId: string; }
interface Category { id: string; name: string; }

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
  subjectId: '', title: '', slug: '', type: 'mock', duration: 60, totalMarks: 100, passingMarks: 40,
  isPublished: true, difficulty: 'medium', negativeMarking: false, negativeMarks: 0.25,
  instructions: '', year: new Date().getFullYear(), examSession: '', isPremium: false, price: 0,
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

  // When fixedType is set, derive a filtered view + friendly labels.
  const fixedLabel = fixedType ? (TYPE_LABELS[fixedType] || fixedType) : null;
  const visibleItems = fixedType ? items.filter((t) => t.type === fixedType) : items;

  const BULK_SAMPLE = '[{"title":"Mock Test 1","subjectId":"<paste existing subject id>","type":"mock","duration":60,"totalMarks":100,"passingMarks":40,"difficulty":"medium","isPublished":true,"isPremium":false,"negativeMarking":false,"negativeMarks":0,"price":0},{"title":"Mock Test 2","subjectId":"<paste existing subject id>","type":"mock","duration":90,"totalMarks":150,"passingMarks":60,"difficulty":"hard","isPublished":true,"isPremium":true,"negativeMarking":true,"negativeMarks":0.25,"price":29}]';

  const handleBulkImport = async () => {
    let parsed: any;
    try {
      parsed = JSON.parse(bulkText);
    } catch (e: any) {
      toast.error('Invalid JSON: ' + (e?.message || 'parse error'));
      return;
    }
    if (!Array.isArray(parsed)) {
      toast.error('JSON must be an array of items');
      return;
    }
    setBulkSaving(true);
    try {
      const batch = writeBatch(db);
      const colRef = collection(db, 'tests');
      parsed.forEach((item) => {
        const ref = doc(colRef);
        const payload = { ...item };
        if (!payload.createdAt) payload.createdAt = serverTimestamp();
        if (!payload.updatedAt) payload.updatedAt = serverTimestamp();
        batch.set(ref, payload);
      });
      await batch.commit();
      toast.success(`Imported ${parsed.length} items successfully`);
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
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Test));
      setLoading(false);
    }, () => setLoading(false));
    const u2 = onSnapshot(collection(db, 'subjects'), (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject)));
    const u3 = onSnapshot(collection(db, 'categories'), (snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)));
    return () => { u1(); u2(); u3(); };
  }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name || '—';
  const categoryName = (sid: string) => {
    const sub = subjects.find((s) => s.id === sid);
    if (!sub) return '—';
    return categories.find((c) => c.id === sub.categoryId)?.name || '—';
  };

  const openAdd = () => {
    setForm({ ...emptyForm, type: fixedType || 'mock' });
    setEditingId(null);
    setDialogOpen(true);
  };
  const openEdit = (item: Test) => {
    setForm({
      subjectId: item.subjectId, title: item.title, slug: item.slug, type: item.type || 'mock',
      duration: item.duration, totalMarks: item.totalMarks, passingMarks: item.passingMarks,
      isPublished: item.isPublished, difficulty: item.difficulty || 'medium',
      negativeMarking: item.negativeMarking, negativeMarks: item.negativeMarks || 0.25,
      instructions: item.instructions || '', year: item.year || new Date().getFullYear(),
      examSession: item.examSession || '', isPremium: item.isPremium, price: item.price ?? 0,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.subjectId) { toast.error('Please select a subject'); return; }
    setSaving(true);
    try {
      const data: any = {
        subjectId: form.subjectId,
        title: form.title.trim(),
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
        isPremium: form.isPremium,
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
      ) : visibleItems.length === 0 ? (
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
              variant="ghost"
              className="h-8 text-slate-400 hover:bg-slate-800"
              onClick={clearSelection}
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
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
                      <td className="p-4 text-center text-slate-400">{item.questionCount || 0}</td>
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
            <div className={`grid gap-3 ${fixedType ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {!fixedType && (
                <div className="space-y-2">
                  <Label>Type</Label>
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
                </div>
              )}
              {fixedType && (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={fixedLabel || fixedType}
                    disabled
                    className="bg-slate-800 border-slate-700 text-slate-400"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
              <div className="space-y-2"><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
              <div className="space-y-2"><Label>Passing Marks</Label><Input type="number" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
            </div>
            <div className="space-y-2">
              <Label>Price (INR)</Label>
              <Input type="number" min={0} step={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="bg-slate-800 border-slate-700" />
              <p className="text-xs text-slate-500">0 = free. Non-zero enables pay-per-test purchase.</p>
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
              <div className="space-y-2"><Label>Negative Marks (per wrong)</Label><Input type="number" step="0.25" value={form.negativeMarks} onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })} disabled={!form.negativeMarking} className="bg-slate-800 border-slate-700 disabled:opacity-40" /></div>
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
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
                <Label className="cursor-pointer">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.negativeMarking} onCheckedChange={(v) => setForm({ ...form, negativeMarking: v })} />
                <Label className="cursor-pointer">Negative Marking</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isPremium} onCheckedChange={(v) => setForm({ ...form, isPremium: v })} />
                <Label className="cursor-pointer flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-400" /> Premium</Label>
              </div>
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
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Add Tests</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of test objects below.
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
                  onClick={() => setBulkText(BULK_SAMPLE)}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  Load Sample
                </Button>
              </div>
            </div>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={15}
              placeholder='[{"title":"Mock Test 1","subjectId":"...","type":"mock","duration":60,"totalMarks":100}]'
              className="bg-slate-800 border-slate-700 font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">title</span>,{' '}
              <span className="text-slate-400">subjectId</span> (existing subject id),{' '}
              <span className="text-slate-400">type</span> (mock | previousYear | dailyQuiz | practice | subjectwise),{' '}
              <span className="text-slate-400">duration</span> (min),{' '}
              <span className="text-slate-400">totalMarks</span>,{' '}
              <span className="text-slate-400">passingMarks</span>,{' '}
              <span className="text-slate-400">difficulty</span> (easy | medium | hard),{' '}
              <span className="text-slate-400">isPublished</span> (boolean),{' '}
              <span className="text-slate-400">isPremium</span> (boolean),{' '}
              <span className="text-slate-400">negativeMarking</span> (boolean),{' '}
              <span className="text-slate-400">negativeMarks</span> (number),{' '}
              <span className="text-slate-400">price</span> (number, INR; 0 = free)
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
    </div>
  );
}
