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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/lib/store';
import { uploadImage } from '@/lib/admin-firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, FileQuestion, ArrowLeft, CheckCircle2, Circle, Image as ImageIcon, X, Crown, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  testId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  subjectTopic?: string;
  marks: number;
  isPremium: boolean;
  imageUrl?: string;
}

const emptyForm = {
  question: '', options: ['', '', '', ''], correctAnswerIndex: 0,
  explanation: '', subjectTopic: '', marks: 1, isPremium: false, imageUrl: '',
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

  const BULK_SAMPLE = '[{"testId":"<paste existing test id>","question":"What is 2+2?","options":["3","4","5","6"],"correctAnswer":1,"explanation":"2+2=4","difficulty":"easy","marks":1},{"testId":"<paste existing test id>","question":"Capital of India?","options":["Mumbai","Delhi","Kolkata","Chennai"],"correctAnswer":1,"explanation":"New Delhi is the capital","difficulty":"easy","marks":1}]';

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
      const colRef = collection(db, 'questions');
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
      options: item.options?.length === 4 ? item.options : ['', '', '', ''],
      correctAnswerIndex: item.correctAnswerIndex ?? 0,
      explanation: item.explanation || '',
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
      const data = {
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
      await deleteDoc(doc(db, 'questions', deleteId));
      // Decrement questionCount
      if (selectedTestId) {
        const testRef = doc(db, 'tests', selectedTestId);
        await updateDoc(testRef, { questionCount: Math.max(0, items.length - 1) });
      }
      toast.success('Question deleted');
      setDeleteId(null);
    } catch (err: any) { toast.error(err?.message || 'Delete failed'); }
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
        <div className="space-y-3">
          {items.map((item, idx) => (
            <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="text-white font-medium flex-1 min-w-0">{item.question}</p>
                      {item.isPremium && <Badge variant="outline" className="border-amber-700 text-amber-400 bg-amber-950/40 shrink-0"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
                      <Badge variant="outline" className="border-slate-700 text-slate-400 shrink-0">{item.marks}m</Badge>
                    </div>
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
                    {item.explanation && (
                      <div className="mt-2 p-2 rounded-lg bg-slate-800/30 border border-slate-800">
                        <p className="text-xs text-slate-500">Explanation:</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.explanation}</p>
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
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Question' : 'Add Question'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question *</Label>
              <Textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} rows={3} placeholder="Enter the question..." className="bg-slate-800 border-slate-700" />
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
            <div className="space-y-2">
              <Label>Explanation</Label>
              <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} placeholder="Why is this the correct answer?" className="bg-slate-800 border-slate-700" />
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
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Add Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of question objects below.
              </p>
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
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={15}
              placeholder='[{"testId":"...","question":"...","options":["A","B","C","D"],"correctAnswer":1}]'
              className="bg-slate-800 border-slate-700 font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">testId</span> (existing test id),{' '}
              <span className="text-slate-400">question</span> (string),{' '}
              <span className="text-slate-400">options</span> (array of 4 strings),{' '}
              <span className="text-slate-400">correctAnswer</span> (0-based index),{' '}
              <span className="text-slate-400">explanation</span> (string),{' '}
              <span className="text-slate-400">difficulty</span> (easy | medium | hard),{' '}
              <span className="text-slate-400">marks</span> (number)
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
    </div>
  );
}
