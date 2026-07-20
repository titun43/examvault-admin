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
import {
  uploadImage,
  toDateTimeInputValue,
  formatDate,
  timestampToDate,
  deleteItems,
  deleteDocWithFiles,
  deleteItemsWithFiles,
} from '@/lib/admin-firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BulkTextarea } from './bulk-textarea';
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
  Layers,
  Download,
  FileSpreadsheet,
  Globe,
  ExternalLink,
  Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadJson, downloadCsv, parseCsv } from '@/lib/download';

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
  officialUrl?: string;     // Official website / info page link
  applyUrl?: string;        // Direct application / registration link
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
  categoryId: 'none',
  examDate: '',
  applicationStartDate: '',
  applicationEndDate: '',
  notificationUrl: '',
  syllabusUrl: '',
  officialUrl: '',
  applyUrl: '',
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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Bilingual template: English (primary) + Assamese (As suffix). Optional.
  const BULK_SAMPLE = '[{"name":"SSC CGL 2024","nameAs":"এছ এছ চি চিজিএল ২০২৪","organization":"Staff Selection Commission","organizationAs":"কৰ্মচাৰী নিৰ্বাচন আয়োন","examDate":"2024-12-15T00:00:00.000Z","applicationStartDate":"2024-10-01T00:00:00.000Z","applicationEndDate":"2024-10-31T00:00:00.000Z","description":"Combined Graduate Level","descriptionAs":"স্নাতক স্তৰৰ সংযুক্ত পৰীক্ষা","imageUrl":"https://example.com/ssc-cgl-banner.png","notificationUrl":"https://ssc.nic.in/notification","officialUrl":"https://ssc.nic.in","isPublished":true,"order":1},{"name":"IBPS PO 2024","nameAs":"আইবিপিএছ পিঅ ২০২৪","organization":"IBPS","organizationAs":"আইবিপিএছ","examDate":"2024-11-20T00:00:00.000Z","description":"Probationary Officer exam","descriptionAs":"প্ৰবেশনাৰী বিষয়া পৰীক্ষা","imageUrl":"https://example.com/ibps-po-banner.png","officialUrl":"https://ibps.in","isPublished":true,"order":2}]';

  const CSV_HEADERS = ['name', 'nameAs', 'organization', 'organizationAs', 'imageUrl', 'categoryId', 'examDate', 'applicationStartDate', 'applicationEndDate', 'notificationUrl', 'syllabusUrl', 'officialUrl', 'applyUrl', 'description', 'descriptionAs', 'order', 'isPublished'];
  const CSV_SAMPLE_ROWS: (string | number | boolean)[][] = [
    ['SSC CGL 2024', 'এছ এছ চি চিজিএল ২০২৪', 'Staff Selection Commission', 'কৰ্মচাৰী নিৰ্বাচন আয়োন', 'https://example.com/ssc-cgl-banner.png', '', '2024-12-15', '2024-10-01', '2024-10-31', 'https://ssc.nic.in/notification', '', 'https://ssc.nic.in', 'https://ssc.nic.in/apply', 'Combined Graduate Level', 'স্নাতক স্তৰৰ সংযুক্ত পৰীক্ষা', 1, true],
    ['IBPS PO 2024', 'আইবিপিএছ পিঅ ২০২৪', 'IBPS', 'আইবিপিএছ', 'https://example.com/ibps-po-banner.png', '', '2024-11-20', '', '', '', '', 'https://ibps.in', 'https://ibps.in/apply', 'Probationary Officer exam', 'প্ৰবেশনাৰী বিষয়া পৰীক্ষা', 2, true],
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
            if ('order' in obj) obj.order = Number(obj.order) || 0;
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
      const batch = writeBatch(db);
      const colRef = collection(db, 'upcoming_exams');
      parsed.forEach((item) => {
        const ref = doc(colRef);
        const payload = { ...item };
        // Convert ISO date strings to Date objects if present
        ['examDate', 'applicationStartDate', 'applicationEndDate'].forEach((key) => {
          if (typeof payload[key] === 'string' && payload[key] !== '') payload[key] = new Date(payload[key]);
        });
        if (!payload.createdAt) payload.createdAt = serverTimestamp();
        if (!payload.updatedAt) payload.updatedAt = serverTimestamp();
        batch.set(ref, payload);
      });
      await batch.commit();
      toast.success(`Imported ${parsed.length} items successfully` + (isCsv ? ' (from CSV)' : ''));
      setBulkOpen(false);
      setBulkText('');
    } catch (err: any) {
      toast.error(err?.message || 'Bulk import failed');
    } finally {
      setBulkSaving(false);
    }
  };

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
      categoryId: item.categoryId || 'none',
      examDate: item.examDate ? toDateTimeInputValue(item.examDate) : '',
      applicationStartDate: item.applicationStartDate ? toDateTimeInputValue(item.applicationStartDate) : '',
      applicationEndDate: item.applicationEndDate ? toDateTimeInputValue(item.applicationEndDate) : '',
      notificationUrl: item.notificationUrl || '',
      syllabusUrl: item.syllabusUrl || '',
      officialUrl: item.officialUrl || '',
      applyUrl: item.applyUrl || '',
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
        categoryId: form.categoryId === 'none' ? null : form.categoryId,
        examDate: new Date(form.examDate),
        applicationStartDate: form.applicationStartDate ? new Date(form.applicationStartDate) : null,
        applicationEndDate: form.applicationEndDate ? new Date(form.applicationEndDate) : null,
        notificationUrl: form.notificationUrl.trim() || null,
        syllabusUrl: form.syllabusUrl.trim() || null,
        officialUrl: form.officialUrl.trim() || null,
        applyUrl: form.applyUrl.trim() || null,
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
      await deleteDocWithFiles('upcoming_exams', deleteId, ['image']);
      toast.success('Exam deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((e) => e.id);
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
      await deleteItemsWithFiles('upcoming_exams', ids, ['image']);
      toast.success(`${ids.length} exam${ids.length === 1 ? '' : 's'} deleted`);
      setBulkDeleteOpen(false);
      clearSelection();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
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
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Exam
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
            <CalendarClock className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No upcoming exams yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="flex items-center gap-3 flex-wrap rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all upcoming exams"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const remaining = daysRemaining(item.examDate);
            const catName = categoryName(item.categoryId);
            const isSelected = selectedIds.has(item.id);
            return (
              <Card
                key={item.id}
                className={`hover:border-slate-700 transition-colors group relative ${isSelected ? 'border-red-800 bg-red-950/20' : 'bg-slate-900 border-slate-800'}`}
              >
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelectOne(item.id)}
                    aria-label={`Select ${item.name}`}
                  />
                </div>
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
                        {item.officialUrl && (
                          <Badge variant="outline" className="bg-sky-950/40 text-sky-400 border-sky-800/50">
                            <Globe className="w-3 h-3 mr-1" /> Official
                          </Badge>
                        )}
                        {item.applyUrl && (
                          <Badge variant="outline" className="bg-amber-950/40 text-amber-400 border-amber-800/50">
                            <ExternalLink className="w-3 h-3 mr-1" /> Apply
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
        </>
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
                    <SelectItem value="none">None</SelectItem>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Official Link</Label>
                <Input
                  value={form.officialUrl}
                  onChange={(e) => setForm({ ...form, officialUrl: e.target.value })}
                  placeholder="https://official-website..."
                  className="bg-slate-800 border-slate-700"
                />
                <p className="text-[11px] text-slate-500">Official website / info page</p>
              </div>
              <div className="space-y-2">
                <Label>Apply Link</Label>
                <Input
                  value={form.applyUrl}
                  onChange={(e) => setForm({ ...form, applyUrl: e.target.value })}
                  placeholder="https://apply-here..."
                  className="bg-slate-800 border-slate-700"
                />
                <p className="text-[11px] text-slate-500">Direct application / registration URL</p>
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

      {/* Bulk Add Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Add Upcoming Exams</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of upcoming exam objects below, or paste CSV rows (first row = column headers).
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJson('upcoming-exams-template', JSON.parse(BULK_SAMPLE))}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv('upcoming-exams-template', CSV_HEADERS, CSV_SAMPLE_ROWS)}
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
              placeholder='[{"name":"SSC CGL 2024","nameAs":"...","organization":"...","organizationAs":"...","examDate":"2024-12-15T00:00:00.000Z"}]'
            />
            <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2">
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mb-1">
                <Languages className="w-3.5 h-3.5" /> Bilingual support (English + Assamese)
              </p>
              <p className="text-xs text-amber-200/70">
                Add <code className="text-amber-300">nameAs</code>, <code className="text-amber-300">organizationAs</code>, and <code className="text-amber-300">descriptionAs</code> alongside the English fields to show exams in both languages. The <code className="text-amber-300">*As</code> fields are optional.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">name</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">nameAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">organization</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">organizationAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">examDate</span> (ISO string),{' '}
              <span className="text-slate-400">applicationStartDate</span> (ISO string),{' '}
              <span className="text-slate-400">applicationEndDate</span> (ISO string),{' '}
              <span className="text-slate-400">description</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">descriptionAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">isPublished</span> (boolean),{' '}
              <span className="text-slate-400">order</span> (number)
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

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} exam{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} exam{selectedIds.size === 1 ? '' : 's'} from Firestore.
              They will be removed from the user app immediately.
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
              Delete {selectedIds.size} exam{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
