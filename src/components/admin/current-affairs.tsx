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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Newspaper,
  Image as ImageIcon,
  X,
  FileText,
  Star,
  Tag as TagIcon,
  Upload,
  Layers,
  Download,
  FileSpreadsheet,
  Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadJson, downloadCsv, parseCsv } from '@/lib/download';

interface CurrentAffair {
  id: string;
  date?: any;
  title?: string;
  content?: string;
  summary?: string;
  pdfUrl?: string;
  imageUrl?: string;
  source?: string;
  category?: string;
  categoryId?: string;
  isImportant?: boolean;
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
}

interface Category {
  id: string;
  name?: string;
}

const emptyForm = {
  date: '',
  title: '',
  summary: '',
  content: '',
  source: '',
  category: '',
  categoryId: 'none',
  isImportant: false,
  tags: '',
  pdfUrl: '',
  imageUrl: '',
};

const CATEGORY_COLORS: Record<string, string> = {
  National: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
  International: 'bg-purple-950/60 text-purple-400 border-purple-800/50',
  Sports: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
  Economy: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/50',
  Science: 'bg-pink-950/60 text-pink-400 border-pink-800/50',
  Technology: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
};

function getCategoryColor(cat?: string): string {
  if (!cat) return 'bg-slate-800 text-slate-400 border-slate-700';
  return CATEGORY_COLORS[cat] || 'bg-slate-800 text-slate-400 border-slate-700';
}

export default function CurrentAffairs() {
  const [items, setItems] = useState<CurrentAffair[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Bilingual template: English (primary) + Assamese (As suffix). Optional.
  const BULK_SAMPLE = '[{"date":"2024-01-15T00:00:00.000Z","title":"Sample News 1","titleAs":"নমুনা বাতৰি ১","summary":"Brief summary","summaryAs":"চমু সাৰাংশ","content":"Full content here","contentAs":"সম্পূৰ্ণ বিষয়বস্তু ইয়াত","source":"Newspaper","category":"National","imageUrl":"https://example.com/news1.jpg","isImportant":false,"tags":["india","politics"]},{"date":"2024-01-14T00:00:00.000Z","title":"Sample News 2","titleAs":"নমুনা বাতৰি ২","summary":"Brief summary 2","summaryAs":"চমু সাৰাংশ ২","content":"Full content 2","contentAs":"সম্পূৰ্ণ বিষয়বস্তু ২","source":"TV","category":"Sports","imageUrl":"https://example.com/news2.jpg","isImportant":true,"tags":["cricket"]}]';

  const CSV_HEADERS = ['date', 'source', 'title', 'titleAs', 'summary', 'summaryAs', 'content', 'contentAs', 'category', 'imageUrl', 'tags', 'isImportant'];
  const CSV_SAMPLE_ROWS: (string | number | boolean)[][] = [
    ['2024-01-15', 'Newspaper', 'Sample News 1', 'নমুনা বাতৰি ১', 'Brief summary', 'চমু সাৰাংশ', 'Full content here', 'সম্পূৰ্ণ বিষয়বস্তু ইয়াত', 'National', 'https://example.com/news1.jpg', 'india,politics', false],
    ['2024-01-14', 'TV', 'Sample News 2', 'নমুনা বাতৰি ২', 'Brief summary 2', 'চমু সাৰাংশ ২', 'Full content 2', 'সম্পূৰ্ণ বিষয়বস্তু ২', 'Sports', 'https://example.com/news2.jpg', 'cricket', true],
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
            if ('isImportant' in obj) obj.isImportant = String(obj.isImportant).toLowerCase() === 'true';
            // Convert comma-separated tags into an array
            if ('tags' in obj && typeof obj.tags === 'string') {
              obj.tags = obj.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
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
      const batch = writeBatch(db);
      const colRef = collection(db, 'current_affairs');
      parsed.forEach((item) => {
        const ref = doc(colRef);
        const payload = { ...item };
        // Convert ISO date strings to Date objects if present
        if (typeof payload.date === 'string') payload.date = new Date(payload.date);
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
      collection(db, 'current_affairs'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as CurrentAffair)
          .sort((a, b) => {
            const dA = timestampToDate(a.date)?.getTime() || 0;
            const dB = timestampToDate(b.date)?.getTime() || 0;
            return dB - dA;
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

  const openAdd = () => {
    setForm({ ...emptyForm, date: toDateTimeInputValue(new Date()) });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (item: CurrentAffair) => {
    setForm({
      date: item.date ? toDateTimeInputValue(item.date) : '',
      title: item.title || '',
      summary: item.summary || '',
      content: item.content || '',
      source: item.source || '',
      category: item.category || '',
      categoryId: item.categoryId || 'none',
      isImportant: !!item.isImportant,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      pdfUrl: item.pdfUrl || '',
      imageUrl: item.imageUrl || '',
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage('current_affairs_pdf', file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const url = await uploadImage('current_affairs_pdf', file);
      setForm((f) => ({ ...f, pdfUrl: url }));
      toast.success('PDF uploaded');
    } catch {
      toast.error('PDF upload failed');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async () => {
    if (!form.date) {
      toast.error('Date is required');
      return;
    }
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.summary.trim()) {
      toast.error('Summary is required');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Content is required');
      return;
    }
    setSaving(true);
    try {
      const tagsArray = form.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const data: Record<string, any> = {
        date: new Date(form.date),
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        source: form.source.trim() || null,
        category: form.category.trim() || null,
        categoryId: form.categoryId === 'none' ? null : form.categoryId,
        isImportant: !!form.isImportant,
        tags: tagsArray,
        pdfUrl: form.pdfUrl || null,
        imageUrl: form.imageUrl || null,
      };
      if (editingId) {
        await updateDoc(doc(db, 'current_affairs', editingId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        toast.success('Current affair updated');
      } else {
        await addDoc(collection(db, 'current_affairs'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Current affair added');
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
      await deleteDocWithFiles('current_affairs', deleteId, ['pdfUrl', 'imageUrl']);
      toast.success('Current affair deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((c) => c.id);
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
      await deleteItemsWithFiles('current_affairs', ids, ['pdfUrl', 'imageUrl']);
      toast.success(`${ids.length} current affair${ids.length === 1 ? '' : 's'} deleted`);
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
            <Newspaper className="w-5 h-5 text-emerald-400" /> Current Affairs
          </h3>
          <p className="text-slate-500 text-sm">Daily current affairs updates for users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Current Affair
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
            <Newspaper className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No current affairs yet. Add your first one!</p>
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
            <div className="max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 w-[44px]">
                      <Checkbox
                        checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all current affairs"
                      />
                    </TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Title</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Source</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                    <TableRow key={item.id} className={`border-slate-800 hover:bg-slate-800/40 ${isSelected ? 'bg-red-950/20' : ''}`}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectOne(item.id)}
                          aria-label={`Select ${item.title}`}
                        />
                      </TableCell>
                      <TableCell className="text-slate-300 whitespace-nowrap">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-start gap-2">
                          {item.isImportant && (
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">{item.title}</p>
                            <p className="text-slate-500 text-xs line-clamp-1">{item.summary}</p>
                            {Array.isArray(item.tags) && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.tags.slice(0, 2).map((t, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 inline-flex items-center"
                                  >
                                    <TagIcon className="w-2.5 h-2.5 mr-1" />
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.category ? (
                          <Badge variant="outline" className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        ) : (
                          <span className="text-slate-600 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-400 text-sm">
                        {item.source || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.pdfUrl && (
                            <a
                              href={item.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
                              title="Open PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-red-400 hover:bg-red-950/40"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Current Affair' : 'Add Current Affair'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Input
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="PIB, The Hindu..."
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Headline of the current affair"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Summary *</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Short one-line summary"
                className="bg-slate-800 border-slate-700"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Full content of the current affair"
                className="bg-slate-800 border-slate-700"
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="National, Sports..."
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Linked Category</Label>
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
              <Label>Tags (comma-separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="economy, policy, budget"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex items-center gap-2">
                  {form.imageUrl ? (
                    <div className="relative">
                      <img src={form.imageUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                      <button
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageRef.current?.click()}
                      disabled={uploadingImage}
                      className="border-slate-700 text-slate-300 h-12"
                    >
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    </Button>
                  )}
                  <input ref={imageRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>PDF</Label>
                <div className="flex items-center gap-2">
                  {form.pdfUrl ? (
                    <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 max-w-full">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <a
                        href={form.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-300 truncate max-w-[80px]"
                      >
                        View PDF
                      </a>
                      <button
                        onClick={() => setForm({ ...form, pdfUrl: '' })}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => pdfRef.current?.click()}
                      disabled={uploadingPdf}
                      className="border-slate-700 text-slate-300 h-12"
                    >
                      {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </Button>
                  )}
                  <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch
                checked={form.isImportant}
                onCheckedChange={(v) => setForm({ ...form, isImportant: v })}
              />
              <Label className="cursor-pointer">Mark as important</Label>
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
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Bulk Add Current Affairs</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of current affair objects below, or paste CSV rows (first row = column headers).
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJson('current-affairs-template', JSON.parse(BULK_SAMPLE))}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv('current-affairs-template', CSV_HEADERS, CSV_SAMPLE_ROWS)}
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
              placeholder='[{"date":"2024-01-15T00:00:00.000Z","title":"...","titleAs":"...","summary":"...","summaryAs":"...","content":"...","contentAs":"..."}]'
            />
            <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2">
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mb-1">
                <Languages className="w-3.5 h-3.5" /> Bilingual support (English + Assamese)
              </p>
              <p className="text-xs text-amber-200/70">
                Add <code className="text-amber-300">titleAs</code>, <code className="text-amber-300">summaryAs</code>, and <code className="text-amber-300">contentAs</code> alongside the English fields to show current affairs in both languages. The <code className="text-amber-300">*As</code> fields are optional.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">date</span> (ISO string),{' '}
              <span className="text-slate-400">title</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">titleAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">summary</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">summaryAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">content</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">contentAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">source</span>,{' '}
              <span className="text-slate-400">category</span> (National | Sports | Economy | Science | Technology | International),{' '}
              <span className="text-slate-400">isImportant</span> (boolean),{' '}
              <span className="text-slate-400">tags</span> (string array)
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
            <AlertDialogTitle>Delete this current affair?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The current affair will be removed from all user apps immediately.
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} current affair{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} current affair{selectedIds.size === 1 ? '' : 's'} from Firestore.
              They will be removed from all user apps immediately.
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
              Delete {selectedIds.size} current affair{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
