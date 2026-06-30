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
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, FolderTree, Image as ImageIcon, X, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  image?: string;
  color?: string;
  order?: number;
  subjectCount?: number;
}

const emptyForm = { name: '', slug: '', icon: '', description: '', image: '', color: '#10b981', order: 0 };

export default function Categories() {
  const { setCurrentSection } = useAppStore();
  const [items, setItems] = useState<Category[]>([]);
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

  const BULK_SAMPLE = '[{"name":"SSC","description":"Staff Selection Commission exams","icon":"📋","color":"#10b981","order":1,"isActive":true},{"name":"Banking","description":"Bank PO/Clerk exams","icon":"🏦","color":"#f59e0b","order":2,"isActive":true}]';

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
      const colRef = collection(db, 'categories');
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
    const unsub = onSnapshot(collection(db, 'categories'), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Category)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setItems(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (item: Category) => {
    setForm({
      name: item.name || '',
      slug: item.slug || '',
      icon: item.icon || '',
      description: item.description || '',
      image: item.image || '',
      color: item.color || '#10b981',
      order: item.order || 0,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage('category_images', file);
      setForm((f) => ({ ...f, image: url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        slug: form.slug ? slugify(form.slug) : slugify(form.name),
        icon: form.icon || null,
        description: form.description || null,
        image: form.image || null,
        color: form.color || null,
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success('Category updated');
      } else {
        await addDoc(collection(db, 'categories'), { ...data, subjectCount: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success('Category added');
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
      await deleteDoc(doc(db, 'categories', deleteId));
      toast.success('Category deleted');
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
            <FolderTree className="w-5 h-5 text-emerald-400" /> Categories
          </h3>
          <p className="text-slate-500 text-sm">Exam categories like SSC, Railway, UPSC, Banking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Category
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
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <FolderTree className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No categories yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (item.color || '#10b981') + '22' }}>
                      <FolderTree className="w-6 h-6" style={{ color: item.color || '#10b981' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium truncate">{item.name}</h4>
                      <Badge variant="outline" className="text-slate-500 border-slate-700 shrink-0">{item.subjectCount || 0} subjects</Badge>
                    </div>
                    {item.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description}</p>}
                    <p className="text-slate-600 text-[10px] mt-1">/{item.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => openEdit(item)}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-red-400 hover:bg-red-950/40" onClick={() => setDeleteId(item.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })}
                placeholder="e.g. SSC, Railway, UPSC"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="bg-slate-800 border-slate-700" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🚂" className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-9 rounded border border-slate-700 bg-slate-800 cursor-pointer" />
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="bg-slate-800 border-slate-700" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className="bg-slate-800 border-slate-700" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {form.image && (
                  <div className="relative">
                    <img src={form.image} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                    <button onClick={() => setForm({ ...form, image: '' })} className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="border-slate-700 text-slate-300">
                  {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-1" />}
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="bg-slate-800 border-slate-700" />
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
            <DialogTitle>Bulk Add Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of category objects below.
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
              placeholder='[{"name":"SSC","description":"...","icon":"📋","color":"#10b981","order":1,"isActive":true}]'
              className="bg-slate-800 border-slate-700 font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">name</span>,{' '}
              <span className="text-slate-400">description</span>,{' '}
              <span className="text-slate-400">icon</span> (emoji),{' '}
              <span className="text-slate-400">color</span> (hex),{' '}
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. Subjects and tests under this category will remain but lose their category link.
            </AlertDialogDescription>
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
