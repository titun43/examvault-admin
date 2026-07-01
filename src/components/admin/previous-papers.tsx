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
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, ClipboardList, FileQuestion, Crown, X } from 'lucide-react';
import { toast } from 'sonner';

interface Test {
  id: string;
  subjectId: string;
  title: string;
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
  questionCount?: number;
}

interface Subject { id: string; name: string; categoryId: string; }
interface Category { id: string; name: string; }

const emptyForm = {
  subjectId: '', title: '', duration: 120, totalMarks: 150, passingMarks: 60,
  isPublished: true, difficulty: 'medium', negativeMarking: true, negativeMarks: 0.25,
  instructions: '', year: new Date().getFullYear(), examSession: '', isPremium: false,
};

export default function PreviousPapers() {
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
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    // Query tests where type == previousYear
    const q = query(collection(db, 'tests'), where('type', '==', 'previousYear'));
    const u1 = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Test)
        .sort((a, b) => (b.year || 0) - (a.year || 0));
      setItems(list);
      setLoading(false);
    }, () => setLoading(false));
    const u2 = onSnapshot(collection(db, 'subjects'), (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject)));
    const u3 = onSnapshot(collection(db, 'categories'), (snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)));
    return () => { u1(); u2(); u3(); };
  }, []);

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name || '—';
  const categoryName = (sid: string) => {
    const sub = subjects.find((s) => s.id === sid);
    if (!sub) return '—';
    return categories.find((c) => c.id === sub.categoryId)?.name || '—';
  };

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (item: Test) => {
    setForm({
      subjectId: item.subjectId, title: item.title, duration: item.duration,
      totalMarks: item.totalMarks, passingMarks: item.passingMarks,
      isPublished: item.isPublished, difficulty: item.difficulty || 'medium',
      negativeMarking: item.negativeMarking, negativeMarks: item.negativeMarks || 0.25,
      instructions: item.instructions || '', year: item.year || new Date().getFullYear(),
      examSession: item.examSession || '', isPremium: item.isPremium,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.subjectId) { toast.error('Please select a subject'); return; }
    setSaving(true);
    try {
      const data = {
        subjectId: form.subjectId,
        title: form.title.trim(),
        slug: form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        type: 'previousYear',
        duration: Number(form.duration) || 120,
        totalMarks: Number(form.totalMarks) || 150,
        passingMarks: Number(form.passingMarks) || 60,
        isPublished: form.isPublished,
        difficulty: form.difficulty,
        negativeMarking: form.negativeMarking,
        negativeMarks: Number(form.negativeMarks) || 0,
        instructions: form.instructions || null,
        year: Number(form.year) || null,
        examSession: form.examSession || null,
        isPremium: form.isPremium,
      };
      if (editingId) {
        await updateDoc(doc(db, 'tests', editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success('Previous paper updated');
      } else {
        await addDoc(collection(db, 'tests'), { ...data, questionCount: 0, attemptCount: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success('Previous paper added');
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
      toast.success('Previous paper deleted');
      setDeleteId(null);
    } catch (err: any) { toast.error(err?.message || 'Delete failed'); }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((t) => t.id);
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
      toast.success(`${ids.length} previous paper${ids.length === 1 ? '' : 's'} deleted`);
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
            <ClipboardList className="w-5 h-5 text-amber-400" /> Previous Year Papers
          </h3>
          <p className="text-slate-500 text-sm">Past exam papers for practice (stored as tests with type=previousYear)</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Paper
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-amber-500 animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No previous papers yet. Add your first one!</p>
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
                        aria-label="Select all previous papers"
                      />
                    </th>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Subject / Category</th>
                    <th className="text-center p-4 font-medium">Year</th>
                    <th className="text-center p-4 font-medium">Duration</th>
                    <th className="text-center p-4 font-medium">Marks</th>
                    <th className="text-center p-4 font-medium">Qs</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
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
                        {item.examSession && <p className="text-slate-500 text-xs">{item.examSession}</p>}
                      </td>
                      <td className="p-4">
                        <p className="text-slate-300">{subjectName(item.subjectId)}</p>
                        <p className="text-slate-600 text-xs">{categoryName(item.subjectId)}</p>
                      </td>
                      <td className="p-4 text-center"><Badge variant="outline" className="border-amber-700 text-amber-400 bg-amber-950/40">{item.year || '—'}</Badge></td>
                      <td className="p-4 text-center text-slate-400">{item.duration}m</td>
                      <td className="p-4 text-center text-slate-400">{item.totalMarks}</td>
                      <td className="p-4 text-center text-slate-400">{item.questionCount || 0}</td>
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
          <DialogHeader><DialogTitle>{editingId ? 'Edit Previous Paper' : 'Add Previous Year Paper'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. RRB NTPC 2023 Previous Paper" className="bg-slate-800 border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Year *</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="bg-slate-800 border-slate-700" /></div>
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
              <div className="space-y-2"><Label>Exam Session</Label><Input value={form.examSession} onChange={(e) => setForm({ ...form, examSession: e.target.value })} placeholder="e.g. CBT-1 Shift-2" className="bg-slate-800 border-slate-700" /></div>
            </div>
            <div className="space-y-2"><Label>Negative Marks (per wrong)</Label><Input type="number" step="0.25" value={form.negativeMarks} onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })} disabled={!form.negativeMarking} className="bg-slate-800 border-slate-700 disabled:opacity-40" /></div>
            <div className="space-y-2"><Label>Instructions</Label><Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={2} className="bg-slate-800 border-slate-700" /></div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2"><Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} /><Label className="cursor-pointer">Published</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.negativeMarking} onCheckedChange={(v) => setForm({ ...form, negativeMarking: v })} /><Label className="cursor-pointer">Negative Marking</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.isPremium} onCheckedChange={(v) => setForm({ ...form, isPremium: v })} /><Label className="cursor-pointer flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-400" /> Premium</Label></div>
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

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this previous paper?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Questions under this paper will remain in Firestore.</AlertDialogDescription>
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} previous paper{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} previous paper{selectedIds.size === 1 ? '' : 's'} from Firestore.
              Questions under these papers will remain in Firestore.
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
              Delete {selectedIds.size} previous paper{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
