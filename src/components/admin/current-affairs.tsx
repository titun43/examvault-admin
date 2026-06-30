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
} from 'lucide-react';
import { toast } from 'sonner';

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
  categoryId: '',
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

  const BULK_SAMPLE = '[{"date":"2024-01-15T00:00:00.000Z","title":"Sample News 1","summary":"Brief summary","content":"Full content here","source":"Newspaper","category":"National","isImportant":false,"tags":["india","politics"]},{"date":"2024-01-14T00:00:00.000Z","title":"Sample News 2","summary":"Brief summary 2","content":"Full content 2","source":"TV","category":"Sports","isImportant":true,"tags":["cricket"]}]';

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
      categoryId: item.categoryId || '',
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
        categoryId: form.categoryId || null,
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
      await deleteDoc(doc(db, 'current_affairs', deleteId));
      toast.success('Current affair deleted');
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
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <div className="max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Title</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Source</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/40">
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Add Current Affairs</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of current affair objects below.
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
              placeholder='[{"date":"2024-01-15T00:00:00.000Z","title":"...","summary":"...","content":"..."}]'
              className="bg-slate-800 border-slate-700 font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">date</span> (ISO string),{' '}
              <span className="text-slate-400">title</span>,{' '}
              <span className="text-slate-400">summary</span>,{' '}
              <span className="text-slate-400">content</span>,{' '}
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
    </div>
  );
}
