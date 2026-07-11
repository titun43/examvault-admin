'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { uploadImage, deleteItems } from '@/lib/admin-firestore';
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
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Library,
  ClipboardList,
  BookOpen,
  FileText,
  Crown,
  X,
  Upload,
  FileType2,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types — mirrors the Firestore `study_materials` collection contract that
// the Flutter user app reads (SubjectDetail screen content-type cards).
// ---------------------------------------------------------------------------
type MaterialType = 'previousPaper' | 'notes' | 'syllabus';

interface StudyMaterial {
  id: string;
  subjectId: string;
  categoryId: string;
  type: MaterialType;
  title: string;
  description?: string | null;
  pdfUrl: string;
  thumbnailUrl?: string | null;
  year?: number | null;
  pages?: number | null;
  isPremium: boolean;
  isPublished: boolean;
  order: number;
  downloadCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

interface Subject { id: string; name: string; categoryId: string; }
interface Category { id: string; name: string; }

// ---------------------------------------------------------------------------
// Type metadata (label + icon + badge classes) used by table, dialog & filters
// ---------------------------------------------------------------------------
const TYPE_META: Record<MaterialType, { label: string; Icon: typeof ClipboardList; badge: string }> = {
  previousPaper: {
    label: 'Previous Paper',
    Icon: ClipboardList,
    badge: 'border-amber-700 text-amber-400 bg-amber-950/40',
  },
  notes: {
    label: 'Study Notes',
    Icon: BookOpen,
    badge: 'border-emerald-700 text-emerald-400 bg-emerald-950/40',
  },
  syllabus: {
    label: 'Syllabus',
    Icon: FileText,
    badge: 'border-sky-700 text-sky-400 bg-sky-950/40',
  },
};

const emptyForm = {
  type: 'previousPaper' as MaterialType,
  subjectId: '',
  title: '',
  description: '',
  year: new Date().getFullYear(),
  pages: 0,
  isPremium: false,
  isPublished: true,
  order: 0,
  // Existing URL (kept when editing & user doesn't pick a new file).
  pdfUrl: '',
  thumbnailUrl: '',
  // Newly-selected files; uploaded on Save.
  pdfFile: null as File | null,
  thumbnailFile: null as File | null,
};

export default function StudyMaterials() {
  const [items, setItems] = useState<StudyMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // Filter bar state
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | MaterialType>('all');
  const [filterPremium, setFilterPremium] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    // Listen to the WHOLE study_materials collection. We filter client-side
    // because (a) the list is small, (b) we need flexible multi-filter combos,
    // and (c) Firestore `where` queries can't combine `in` + multiple
    // inequality filters without composite indexes.
    const u1 = onSnapshot(collection(db, 'study_materials'), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as StudyMaterial)
        .sort((a, b) => {
          // Newest first; fall back to order field if timestamps missing.
          const at = a.createdAt?.toMillis?.() || 0;
          const bt = b.createdAt?.toMillis?.() || 0;
          if (bt !== at) return bt - at;
          return (a.order || 0) - (b.order || 0);
        });
      setItems(list);
      setLoading(false);
    }, () => setLoading(false));
    const u2 = onSnapshot(collection(db, 'subjects'), (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Subject)));
    const u3 = onSnapshot(collection(db, 'categories'), (snap) => setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category)));
    return () => { u1(); u2(); u3(); };
  }, []);

  // ---- Lookup helpers ----
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name || '—';
  const subjectCategoryId = (sid: string) => subjects.find((s) => s.id === sid)?.categoryId || '';
  const categoryName = (sid: string) => {
    const cid = subjectCategoryId(sid);
    if (!cid) return '—';
    return categories.find((c) => c.id === cid)?.name || '—';
  };

  // ---- Filtered items (client-side) ----
  const filteredItems = useMemo(() => {
    return items.filter((m) => {
      if (filterSubject !== 'all' && m.subjectId !== filterSubject) return false;
      if (filterType !== 'all' && m.type !== filterType) return false;
      if (filterPremium === 'free' && m.isPremium) return false;
      if (filterPremium === 'premium' && !m.isPremium) return false;
      return true;
    });
  }, [items, filterSubject, filterType, filterPremium]);

  // ---- Dialog open helpers ----
  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };
  const openEdit = (item: StudyMaterial) => {
    setForm({
      type: item.type,
      subjectId: item.subjectId,
      title: item.title,
      description: item.description || '',
      year: item.year || new Date().getFullYear(),
      pages: item.pages || 0,
      isPremium: item.isPremium,
      isPublished: item.isPublished,
      order: item.order || 0,
      pdfUrl: item.pdfUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
      pdfFile: null,
      thumbnailFile: null,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  // ---- Save (add or update) ----
  // Uploads happen here (not on file select), per the task spec.
  // Storage path is `study_materials/{materialId}/{timestamp}_{filename}`.
  // For ADD we must first create the doc to get its id, then upload, then
  // patch the URL onto the doc.
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.subjectId) { toast.error('Please select a subject'); return; }
    if (!editingId && !form.pdfFile) { toast.error('Please select a PDF file'); return; }
    if (form.type !== 'previousPaper' && (!editingId && !form.pdfFile)) {
      toast.error('Please select a PDF file');
      return;
    }

    setSaving(true);
    try {
      const categoryId = subjectCategoryId(form.subjectId);
      const baseData = {
        subjectId: form.subjectId,
        categoryId,
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || null,
        year: form.type === 'previousPaper' ? (Number(form.year) || null) : null,
        pages: Number(form.pages) > 0 ? Number(form.pages) : null,
        isPremium: form.isPremium,
        isPublished: form.isPublished,
        order: Number(form.order) || 0,
      };

      if (editingId) {
        // ---- UPDATE ----
        // Upload new files (if any) BEFORE writing the doc so we don't end
        // up with a stale URL if the upload fails. Storage path uses the
        // existing doc id.
        let nextPdfUrl = form.pdfUrl;
        let nextThumbUrl = form.thumbnailUrl;

        if (form.pdfFile) {
          setUploadingPdf(true);
          try {
            nextPdfUrl = await uploadImage(`study_materials/${editingId}`, form.pdfFile);
          } finally {
            setUploadingPdf(false);
          }
        }
        if (form.thumbnailFile) {
          setUploadingThumb(true);
          try {
            nextThumbUrl = await uploadImage(`study_materials/${editingId}`, form.thumbnailFile);
          } finally {
            setUploadingThumb(false);
          }
        }

        await updateDoc(doc(db, 'study_materials', editingId), {
          ...baseData,
          pdfUrl: nextPdfUrl,
          thumbnailUrl: nextThumbUrl || null,
          updatedAt: serverTimestamp(),
        });
        toast.success('Study material updated');
      } else {
        // ---- ADD ----
        // Create the doc first with a placeholder pdfUrl so we have an id
        // to use in the storage path. Then upload the PDF (and optional
        // thumbnail), then patch the URLs back.
        const ref = await addDoc(collection(db, 'study_materials'), {
          ...baseData,
          pdfUrl: '', // patched below after upload
          thumbnailUrl: null,
          downloadCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        const newId = ref.id;

        setUploadingPdf(true);
        let pdfUrl = '';
        try {
          pdfUrl = await uploadImage(`study_materials/${newId}`, form.pdfFile!);
        } finally {
          setUploadingPdf(false);
        }

        let thumbnailUrl: string | null = null;
        if (form.thumbnailFile) {
          setUploadingThumb(true);
          try {
            thumbnailUrl = await uploadImage(`study_materials/${newId}`, form.thumbnailFile);
          } finally {
            setUploadingThumb(false);
          }
        }

        await updateDoc(doc(db, 'study_materials', newId), {
          pdfUrl,
          thumbnailUrl,
          updatedAt: serverTimestamp(),
        });
        toast.success('Study material added');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
      setUploadingPdf(false);
      setUploadingThumb(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'study_materials', deleteId));
      toast.success('Study material deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = filteredItems.map((m) => m.id);
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
      await deleteItems('study_materials', ids);
      toast.success(`${ids.length} study material${ids.length === 1 ? '' : 's'} deleted`);
      setBulkDeleteOpen(false);
      clearSelection();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const isUploading = uploadingPdf || uploadingThumb;
  const saveLabel = uploadingPdf ? 'Uploading PDF…' : uploadingThumb ? 'Uploading thumbnail…' : editingId ? 'Update' : 'Add';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Library className="w-5 h-5 text-emerald-400" /> Study Materials
          </h3>
          <p className="text-slate-500 text-sm">
            PDF content (Previous Papers, Notes, Syllabus) for subject detail screens in the user app
          </p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Material
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-3 flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider pr-2">
            <Filter className="w-3.5 h-3.5" /> Filter
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Subject</Label>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="bg-slate-800 border-slate-700 w-[200px]">
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Type</Label>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | MaterialType)}>
              <SelectTrigger className="bg-slate-800 border-slate-700 w-[170px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="previousPaper">Previous Paper</SelectItem>
                <SelectItem value="notes">Study Notes</SelectItem>
                <SelectItem value="syllabus">Syllabus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Access</Label>
            <Select value={filterPremium} onValueChange={(v) => setFilterPremium(v as 'all' | 'free' | 'premium')}>
              <SelectTrigger className="bg-slate-800 border-slate-700 w-[140px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(filterSubject !== 'all' || filterType !== 'all' || filterPremium !== 'all') && (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 text-slate-400 hover:bg-slate-800"
              onClick={() => { setFilterSubject('all'); setFilterType('all'); setFilterPremium('all'); }}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          )}
          <div className="ml-auto text-xs text-slate-500">
            {filteredItems.length} of {items.length}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <Library className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No study materials yet. Add your first PDF!</p>
          </CardContent>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <Filter className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No materials match your filters.</p>
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
                          aria-label="Select all study materials"
                        />
                      </th>
                      <th className="text-left p-4 font-medium">Material</th>
                      <th className="text-left p-4 font-medium">Subject / Category</th>
                      <th className="text-center p-4 font-medium">Type</th>
                      <th className="text-center p-4 font-medium">Year</th>
                      <th className="text-center p-4 font-medium">Access</th>
                      <th className="text-center p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const TypeIcon = TYPE_META[item.type]?.Icon || FileText;
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
                            <div className="flex items-center gap-3">
                              {/* Thumbnail (or type-icon placeholder) */}
                              <div className="w-9 h-11 rounded-md overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                                {item.thumbnailUrl ? (
                                  <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <TypeIcon className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium truncate max-w-[260px]">{item.title}</p>
                                {item.description && (
                                  <p className="text-slate-500 text-xs truncate max-w-[260px]">{item.description}</p>
                                )}
                                {item.pages ? (
                                  <p className="text-slate-600 text-xs">{item.pages} pages · {item.downloadCount || 0} downloads</p>
                                ) : (
                                  <p className="text-slate-600 text-xs">{item.downloadCount || 0} downloads</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-300">{subjectName(item.subjectId)}</p>
                            <p className="text-slate-600 text-xs">{categoryName(item.subjectId)}</p>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="outline" className={TYPE_META[item.type]?.badge || ''}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {TYPE_META[item.type]?.label || item.type}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            {item.year ? (
                              <Badge variant="outline" className="border-amber-700 text-amber-400 bg-amber-950/40">{item.year}</Badge>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {item.isPremium ? (
                              <Badge variant="outline" className="border-amber-700 text-amber-400 bg-amber-950/40">
                                <Crown className="w-3 h-3 mr-1" /> Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-emerald-700 text-emerald-400 bg-emerald-950/40">Free</Badge>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {item.isPublished ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                                <Eye className="w-3.5 h-3.5" /> Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                                <EyeOff className="w-3.5 h-3.5" /> Draft
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.pdfUrl && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                                  onClick={() => window.open(item.pdfUrl, '_blank')}
                                  title="Open PDF"
                                >
                                  <FileType2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Study Material' : 'Add Study Material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as MaterialType })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="previousPaper">Previous Paper</SelectItem>
                    <SelectItem value="notes">Study Notes</SelectItem>
                    <SelectItem value="syllabus">Syllabus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({ ...form, subjectId: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. RRB NTPC 2023 Previous Paper" className="bg-slate-800 border-slate-700" />
            </div>

            {form.type === 'previousPaper' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label>Pages (optional)</Label>
                  <Input type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })} className="bg-slate-800 border-slate-700" />
                </div>
              </div>
            )}

            {form.type !== 'previousPaper' && (
              <div className="space-y-2">
                <Label>Pages (optional)</Label>
                <Input type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })} className="bg-slate-800 border-slate-700" />
              </div>
            )}

            {/* PDF upload */}
            <div className="space-y-2">
              <Label>PDF File {editingId ? '(leave empty to keep current)' : '*'}</Label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700/60 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300 truncate flex-1">
                      {form.pdfFile ? form.pdfFile.name : editingId && form.pdfUrl ? 'PDF selected (click to replace)' : 'Choose PDF file…'}
                    </span>
                    {form.pdfFile && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setForm({ ...form, pdfFile: null }); }}
                        className="text-slate-500 hover:text-red-400"
                        title="Remove selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setForm({ ...form, pdfFile: f });
                      // Reset the native input so re-selecting the same file fires onChange.
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {uploadingPdf && (
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Uploading PDF…
                </p>
              )}
              {!form.pdfFile && editingId && form.pdfUrl && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <FileType2 className="w-3 h-3" /> Current PDF will be kept.
                </p>
              )}
            </div>

            {/* Thumbnail upload (optional) */}
            <div className="space-y-2">
              <Label>Thumbnail (optional)</Label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700/60 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300 truncate flex-1">
                      {form.thumbnailFile ? form.thumbnailFile.name : 'Choose image…'}
                    </span>
                    {form.thumbnailFile && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setForm({ ...form, thumbnailFile: null }); }}
                        className="text-slate-500 hover:text-red-400"
                        title="Remove selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setForm({ ...form, thumbnailFile: f });
                      e.target.value = '';
                    }}
                  />
                </label>
                {form.thumbnailUrl && !form.thumbnailFile && (
                  <img src={form.thumbnailUrl} alt="" className="w-9 h-11 object-cover rounded-md border border-slate-700" />
                )}
              </div>
              {uploadingThumb && (
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Uploading thumbnail…
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="bg-slate-800 border-slate-700" placeholder="Short description shown on the content card" />
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
                <Label className="cursor-pointer flex items-center gap-1">
                  {form.isPublished ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  Published
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isPremium} onCheckedChange={(v) => setForm({ ...form, isPremium: v })} />
                <Label className="cursor-pointer flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Premium
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isUploading} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || isUploading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {(saving || isUploading) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {saveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this study material?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              The Firestore doc will be removed. The PDF file in Firebase Storage will remain.
            </AlertDialogDescription>
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} study material{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} study material{selectedIds.size === 1 ? '' : 's'} from Firestore.
              PDF files in Firebase Storage will remain.
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
              Delete {selectedIds.size} study material{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
