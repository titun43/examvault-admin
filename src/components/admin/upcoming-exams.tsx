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
import {
  uploadImage,
  toDateTimeInputValue,
  formatDate,
  timestampToDate,
} from '@/lib/admin-firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CalendarClock,
  Image as ImageIcon,
  X,
  Eye,
  EyeOff,
  Building2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface UpcomingExam {
  id: string;
  name?: string;
  organization?: string;
  categoryId?: string;
  examDate?: any;
  applicationStartDate?: any;
  applicationEndDate?: any;
  notificationUrl?: string;
  syllabusUrl?: string;
  imageUrl?: string;
  description?: string;
  tags?: string[];
  isPublished?: boolean;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

interface Category {
  id: string;
  name?: string;
}

const emptyForm = {
  name: '',
  organization: '',
  categoryId: '',
  examDate: '',
  applicationStartDate: '',
  applicationEndDate: '',
  notificationUrl: '',
  syllabusUrl: '',
  imageUrl: '',
  description: '',
  tags: '',
  isPublished: true,
  order: 0,
};

function daysRemaining(examDate: any): { days: number; label: string; color: string } | null {
  const d = timestampToDate(examDate);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exam = new Date(d);
  exam.setHours(0, 0, 0, 0);
  const diff = Math.round((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { days: diff, label: 'Past', color: 'bg-slate-800 text-slate-400 border-slate-700' };
  if (diff === 0) return { days: 0, label: 'Today', color: 'bg-red-950/60 text-red-400 border-red-800/50' };
  if (diff <= 30) return { days: diff, label: `${diff} day${diff === 1 ? '' : 's'} left`, color: 'bg-red-950/60 text-red-400 border-red-800/50' };
  return { days: diff, label: `${diff} days left`, color: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' };
}

export default function UpcomingExams() {
  const [items, setItems] = useState<UpcomingExam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub1 = onSnapshot(
      collection(db, 'upcoming_exams'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as UpcomingExam)
          .sort((a, b) => {
            const ordA = a.order || 0;
            const ordB = b.order || 0;
            if (ordA !== ordB) return ordA - ordB;
            const dA = timestampToDate(a.examDate)?.getTime() || 0;
            const dB = timestampToDate(b.examDate)?.getTime() || 0;
            return dA - dB;
          });
        setItems(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
    const unsub2 = onSnapshot(collection(db, 'categories'), (snap) => {
      const cats = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Category)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setCategories(cats);
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const categoryName = (id?: string) => {
    if (!id) return null;
    return categories.find((c) => c.id === id)?.name || null;
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (item: UpcomingExam) => {
    setForm({
      name: item.name || '',
      organization: item.organization || '',
      categoryId: item.categoryId || '',
      examDate: item.examDate ? toDateTimeInputValue(item.examDate) : '',
      applicationStartDate: item.applicationStartDate ? toDateTimeInputValue(item.applicationStartDate) : '',
      applicationEndDate: item.applicationEndDate ? toDateTimeInputValue(item.applicationEndDate) : '',
      notificationUrl: item.notificationUrl || '',
      syllabusUrl: item.syllabusUrl || '',
      imageUrl: item.imageUrl || '',
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      isPublished: item.isPublished !== false,
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
      const url = await uploadImage('upcoming_exam_images', file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded');
    } catch {
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
    if (!form.examDate) {
      toast.error('Exam date is required');
      return;
    }
    setSaving(true);
    try {
      const tagsArray = form.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const data: Record<string, any> = {
        name: form.name.trim(),
        organization: form.organization.trim() || null,
        categoryId: form.categoryId || null,
        examDate: new Date(form.examDate),
        applicationStartDate: form.applicationStartDate ? new Date(form.applicationStartDate) : null,
        applicationEndDate: form.applicationEndDate ? new Date(form.applicationEndDate) : null,
        notificationUrl: form.notificationUrl.trim() || null,
        syllabusUrl: form.syllabusUrl.trim() || null,
        imageUrl: form.imageUrl || null,
        description: form.description.trim() || null,
        tags: tagsArray,
        isPublished: !!form.isPublished,
        order: Number(form.order) || 0,
      };
      if (editingId) {
        await updateDoc(doc(db, 'upcoming_exams', editingId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        toast.success('Exam updated');
      } else {
        await addDoc(collection(db, 'upcoming_exams'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Exam added');
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
      await deleteDoc(doc(db, 'upcoming_exams', deleteId));
      toast.success('Exam deleted');
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
            <CalendarClock className="w-5 h-5 text-emerald-400" /> Upcoming Exams
          </h3>
          <p className="text-slate-500 text-sm">Exam schedule with countdown for users</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Exam
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <CalendarClock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No upcoming exams yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const remaining = daysRemaining(item.examDate);
            const catName = categoryName(item.categoryId);
            return (
              <Card
                key={item.id}
                className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <CalendarClock className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{item.name}</h4>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {item.organization && (
                          <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                            <Building2 className="w-3 h-3 mr-1" /> {item.organization}
                          </Badge>
                        )}
                        {catName && (
                          <Badge variant="outline" className="bg-emerald-950/40 text-emerald-400 border-emerald-800/50">
                            <BookOpen className="w-3 h-3 mr-1" /> {catName}
                          </Badge>
                        )}
                        {item.isPublished ? (
                          <Badge variant="outline" className="bg-emerald-950/40 text-emerald-400 border-emerald-800/50">
                            <Eye className="w-3 h-3 mr-1" /> Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                            <EyeOff className="w-3 h-3 mr-1" /> Draft
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-2">
                        Exam: <span className="text-white font-medium">{formatDate(item.examDate)}</span>
                      </p>
                      {remaining && (
                        <Badge variant="outline" className={`mt-2 ${remaining.color}`}>
                          {remaining.label}
                        </Badge>
                      )}
                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 3).map((t, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Exam' : 'Add Upcoming Exam'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Exam Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. RRB NTPC 2025"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Organization</Label>
                <Input
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="RRB, SSC, UPSC..."
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Exam Date *</Label>
              <Input
                type="datetime-local"
                value={form.examDate}
                onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Application Start</Label>
                <Input
                  type="datetime-local"
                  value={form.applicationStartDate}
                  onChange={(e) => setForm({ ...form, applicationStartDate: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Application End</Label>
                <Input
                  type="datetime-local"
                  value={form.applicationEndDate}
                  onChange={(e) => setForm({ ...form, applicationEndDate: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Notification PDF URL</Label>
                <Input
                  value={form.notificationUrl}
                  onChange={(e) => setForm({ ...form, notificationUrl: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Syllabus URL</Label>
                <Input
                  value={form.syllabusUrl}
                  onChange={(e) => setForm({ ...form, syllabusUrl: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  <div className="relative">
                    <img src={form.imageUrl} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                    <button
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="border-slate-700 text-slate-300"
                >
                  {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-1" />}
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description about the exam"
                className="bg-slate-800 border-slate-700"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="govt, railway, graduate"
                className="bg-slate-800 border-slate-700"
              />
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
                  checked={form.isPublished}
                  onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
                />
                <Label className="cursor-pointer">Published</Label>
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
            <AlertDialogTitle>Delete this exam entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The exam will be removed from the user app immediately.
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
