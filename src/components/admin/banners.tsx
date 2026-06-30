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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage, toDateTimeInputValue, formatDateTime } from '@/lib/admin-firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Image as ImageIcon,
  X,
  Link2,
  Calendar,
  ImageUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
  linkLabel?: string;
  order?: number;
  isActive?: boolean;
  startsAt?: any;
  endsAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

const emptyForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  link: '',
  linkLabel: '',
  order: 0,
  isActive: true,
  startsAt: '',
  endsAt: '',
};

export default function Banners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'banners'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Banner)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (item: Banner) => {
    setForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      imageUrl: item.imageUrl || '',
      link: item.link || '',
      linkLabel: item.linkLabel || '',
      order: item.order || 0,
      isActive: item.isActive !== false,
      startsAt: item.startsAt ? toDateTimeInputValue(item.startsAt) : '',
      endsAt: item.endsAt ? toDateTimeInputValue(item.endsAt) : '',
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage('banner_images', file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Banner image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.imageUrl) {
      toast.error('Banner image is required');
      return;
    }
    setSaving(true);
    try {
      const data: Record<string, any> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        imageUrl: form.imageUrl,
        link: form.link.trim() || null,
        linkLabel: form.linkLabel.trim() || null,
        order: Number(form.order) || 0,
        isActive: !!form.isActive,
        startsAt: form.startsAt ? new Date(form.startsAt) : null,
        endsAt: form.endsAt ? new Date(form.endsAt) : null,
      };
      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        toast.success('Banner updated');
      } else {
        await addDoc(collection(db, 'banners'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Banner added');
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
      await deleteDoc(doc(db, 'banners', deleteId));
      toast.success('Banner deleted');
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
            <ImageIcon className="w-5 h-5 text-emerald-400" /> Banners
          </h3>
          <p className="text-slate-500 text-sm">Carousel banners shown on home screen</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No banners yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group overflow-hidden"
            >
              <div className="relative aspect-video bg-slate-800">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-slate-700" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {item.isActive ? (
                    <Badge variant="outline" className="bg-emerald-950/80 text-emerald-400 border-emerald-800/60 backdrop-blur">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-900/80 text-slate-400 border-slate-700 backdrop-blur">
                      Inactive
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-slate-900/80 text-slate-400 border-slate-700 backdrop-blur">
                    #{item.order || 0}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="text-white font-medium truncate">{item.title}</h4>
                {item.subtitle && (
                  <p className="text-slate-500 text-xs mt-1 line-clamp-1">{item.subtitle}</p>
                )}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {item.link && (
                    <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                      <Link2 className="w-3 h-3 mr-1" /> {item.linkLabel || 'Link'}
                    </Badge>
                  )}
                  {item.startsAt && (
                    <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                      <Calendar className="w-3 h-3 mr-1" /> {formatDateTime(item.startsAt)}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-red-400 hover:bg-red-950/40"
                    onClick={() => setDeleteId(item.id)}
                  >
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
            <DialogTitle>{editingId ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Banner Image * (recommended 16:9)</Label>
              {form.imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700">
                  <img src={form.imageUrl} alt="preview" className="w-full aspect-video object-cover" />
                  <button
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 flex flex-col items-center justify-center gap-2 hover:border-emerald-600 hover:bg-slate-800 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                  ) : (
                    <ImageUp className="w-8 h-8 text-slate-500" />
                  )}
                  <span className="text-sm text-slate-400">
                    {uploading ? 'Uploading...' : 'Click to upload banner image'}
                  </span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 50% off Premium!"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Short tagline"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Link Label</Label>
                <Input
                  value={form.linkLabel}
                  onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
                  placeholder="Subscribe"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Starts At</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Ends At</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label className="cursor-pointer">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The banner will be removed from the home carousel immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
