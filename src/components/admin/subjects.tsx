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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage } from '@/lib/admin-firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, BookOpen, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface Subject {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  order?: number;
  testCount?: number;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
}

const emptyForm = { name: '', categoryId: '', slug: '', icon: '', description: '', order: 0 };

export default function Subjects() {
  const [items, setItems] = useState<Subject[]>([]);
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

  const BULK_SAMPLE = '[{"name":"Quantitative Aptitude","description":"Math for competitive exams","icon":"🔢","categoryId":"<paste existing category id>","order":1,"isActive":true},{"name":"Reasoning","description":"Logical reasoning","icon":"🧩","categoryId":"<paste existing category id>","order":2,"isActive":true}]';

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
      const colRef = collection(db, 'subjects');
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
    const u1 = onSnapshot(collection(db, 'subjects'), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Subject)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setItems(list);
      setLoading(false);
    }, () => setLoading(false));

    const u2 = onSnapshot(collection(db, 'categories'), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category));
    });

    return () => { u1(); u2(); };
  }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || '—';

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (item: Subject) => {
    setForm({
      name: item.name, categoryId: item.categoryId, slug: item.slug,
      icon: item.icon || '', description: item.description || '', order: item.order || 0,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.categoryId) { toast.error('Please select a category'); return; }
    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        slug: form.slug ? slugify(form.slug) : slugify(form.name),
        icon: form.icon || null,
        description: form.description || null,
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await updateDoc(doc(db, 'subjects', editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success('Subject updated');
      } else {
        await addDoc(collection(db, 'subjects'), { ...data, testCount: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success('Subject added');
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
      await deleteDoc(doc(db, 'subjects', deleteId));
      toast.success('Subject deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" /> Subjects
          </h3>
          <p className="text-slate-500 text-sm">Subjects linked to categories (e.g. GK, Math, English)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Subject
          </Button>
          <Button
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
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
            <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No subjects yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase">
                    <th className="text-left p-4 font-medium">Subject</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Slug</th>
                    <th className="text-center p-4 font-medium">Tests</th>
                    <th className="text-center p-4 font-medium">Order</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 group">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {item.icon && <span className="text-lg">{item.icon}</span>}
                          <span className="text-white font-medium">{item.name}</span>
                        </div>
                        {item.description && <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>}
                      </td>
                      <td className="p-4"><Badge variant="outline" className="border-slate-700 text-slate-300">{categoryName(item.categoryId)}</Badge></td>
                      <td className="p-4 text-slate-500 text-xs">/{item.slug}</td>
                      <td className="p-4 text-center text-slate-400">{item.testCount || 0}</td>
                      <td className="p-4 text-center text-slate-400">{item.order || 0}</td>
                      <td className="p-4">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => openEdit(item)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-950/40" onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Subject' : 'Add Subject'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} placeholder="e.g. General Knowledge" className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📚" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="bg-slate-800 border-slate-700" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="bg-slate-800 border-slate-700" />
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
            <DialogTitle>Bulk Add Subjects</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of subject objects below.
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
              placeholder='[{"name":"Quantitative Aptitude","categoryId":"...","order":1}]'
              className="bg-slate-800 border-slate-700 font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">name</span>,{' '}
              <span className="text-slate-400">description</span>,{' '}
              <span className="text-slate-400">icon</span> (emoji),{' '}
              <span className="text-slate-400">categoryId</span> (existing category id),{' '}
              <span className="text-slate-400">order</span> (number),{' '}
              <span className="text-slate-400">isActive</span> (boolean)
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
            <AlertDialogTitle>Delete this subject?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Tests under this subject will remain but lose their subject link.</AlertDialogDescription>
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
