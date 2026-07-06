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
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage, deleteItems } from '@/lib/admin-firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BulkTextarea } from './bulk-textarea';
import { resolveCategoryIdByName } from '@/lib/bulk-resolve';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Loader2, BookOpen, Layers, X, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { downloadJson, downloadCsv, parseCsv } from '@/lib/download';

interface Subject {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  order?: number;
  testCount?: number;
  premiumPrice?: number;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
}

const emptyForm = { name: '', categoryId: '', slug: '', icon: '', description: '', order: 0, premiumPrice: 0 };

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
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // Live test count per subject. Computed from the tests collection so the
  // number is always accurate, and stale `testCount` values are written back
  // to subject docs to keep Firestore consistent.
  const [testCountMap, setTestCountMap] = useState<Record<string, number>>({});
  const itemsRef = useRef<Subject[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const BULK_SAMPLE = '[{"name":"Quantitative Aptitude","description":"Math for competitive exams","icon":"🔢","categoryName":"SSC","order":1,"isActive":true},{"name":"Reasoning","description":"Logical reasoning","icon":"🧩","categoryName":"SSC","order":2,"isActive":true}]';

  const CSV_HEADERS = ['name', 'categoryName', 'icon', 'order', 'slug', 'description', 'isActive'];
  const CSV_SAMPLE_ROWS: (string | number | boolean)[][] = [
    ['Quantitative Aptitude', 'SSC', '🔢', 1, 'quantitative-aptitude', 'Math for competitive exams', true],
    ['Reasoning', 'SSC', '🧩', 2, 'reasoning', 'Logical reasoning', true],
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
            if ('isActive' in obj) obj.isActive = String(obj.isActive).toLowerCase() === 'true';
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
      // ---- Name-based parent resolution ----
      // Each row can use EITHER `categoryId` (explicit Firestore doc id —
      // backward compatible) OR `categoryName` (resolved to id via
      // Firestore lookup, case-insensitive). If both are present,
      // categoryId wins. If neither is present, the row is skipped with
      // a clear error.
      //
      // We validate EVERY row first (no partial writes). If any parent
      // name can't be resolved, we abort the whole import with a precise
      // error listing which rows failed and which names were unknown.
      // -----------------------------------------------------------------
      const skipList: { row: number; reason: string }[] = [];
      const resolved: any[] = [];
      // Cache so we only hit Firestore once for duplicate names.
      const catIdCache = new Map<string, string | null>();

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        const rowNo = i + 1;
        let categoryId = (item.categoryId ?? '').toString().trim();
        const catName = (item.categoryName ?? '').toString().trim();

        if (!categoryId && catName) {
          if (catIdCache.has(catName.toLowerCase())) {
            categoryId = catIdCache.get(catName.toLowerCase()) ?? '';
          } else {
            const r = await resolveCategoryIdByName(catName);
            catIdCache.set(catName.toLowerCase(), r.id);
            categoryId = r.id ?? '';
          }
          if (!categoryId) {
            skipList.push({ row: rowNo, reason: `category "${catName}" not found` });
            continue;
          }
        }
        if (!categoryId) {
          skipList.push({ row: rowNo, reason: 'no categoryId or categoryName provided' });
          continue;
        }

        const payload = { ...item };
        // Always store the resolved id; drop the helper name field so it
        // doesn't end up as junk in Firestore.
        payload.categoryId = categoryId;
        delete payload.categoryName;
        if (!payload.createdAt) payload.createdAt = serverTimestamp();
        if (!payload.updatedAt) payload.updatedAt = serverTimestamp();
        resolved.push(payload);
      }

      if (resolved.length === 0) {
        const sample = skipList.slice(0, 3).map((s) => `Row ${s.row}: ${s.reason}`).join('; ');
        toast.error(`No rows to import. ${sample}${skipList.length > 3 ? ` (+${skipList.length - 3} more)` : ''}`);
        return;
      }

      const batch = writeBatch(db);
      const colRef = collection(db, 'subjects');
      resolved.forEach((payload) => {
        const ref = doc(colRef);
        batch.set(ref, payload);
      });
      await batch.commit();

      // ---- Sync subjectCount on every affected category doc ----
      // The Category model stores a denormalized `subjectCount` field that
      // the Flutter user app reads directly. The single-add / single-delete
      // paths update this field, but bulk-import didn't — so the count
      // stayed stale until someone opened the Categories admin page (whose
      // own onSnapshot writeback would eventually fix it). We now write the
      // ABSOLUTE count via a fresh getDocs query per affected category, so
      // the Flutter app sees the right number immediately.
      const affectedCategoryIds = Array.from(
        new Set(resolved.map((r) => r.categoryId).filter(Boolean)),
      );
      await Promise.all(
        affectedCategoryIds.map(async (categoryId) => {
          try {
            const snap = await getDocs(
              query(collection(db, 'subjects'), where('categoryId', '==', categoryId)),
            );
            await updateDoc(doc(db, 'categories', categoryId), {
              subjectCount: snap.size,
              updatedAt: serverTimestamp(),
            });
          } catch (e) {
            console.warn('[subjects bulk] count sync failed for', categoryId, e);
          }
        }),
      );

      // Build a precise success report.
      const skippedNote = skipList.length > 0 ? `, ${skipList.length} skipped` : '';
      toast.success(
        `Imported ${resolved.length} subject${resolved.length === 1 ? '' : 's'}${skippedNote}` + (isCsv ? ' (from CSV)' : ''),
      );
      if (skipList.length > 0) {
        // Surface skip reasons in console for debugging.
        console.warn('[subjects bulk] skipped rows:', skipList);
      }
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

    // Live test counts → { subjectId: count }. Kept in state for instant
    // display, and stale `testCount` values are written back to subject docs.
    const u3 = onSnapshot(collection(db, 'tests'), (snap) => {
      const map: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const subjId = (d.data() as any)?.subjectId;
        if (subjId) map[subjId] = (map[subjId] || 0) + 1;
      });
      setTestCountMap(map);
      const batch = writeBatch(db);
      let needsCommit = false;
      itemsRef.current.forEach((s) => {
        const correct = map[s.id] || 0;
        if ((s.testCount || 0) !== correct) {
          batch.update(doc(db, 'subjects', s.id), { testCount: correct, updatedAt: serverTimestamp() });
          needsCommit = true;
        }
      });
      if (needsCommit) batch.commit().catch(() => {});
    });

    return () => { u1(); u2(); u3(); };
  }, []);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name || '—';

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (item: Subject) => {
    setForm({
      name: item.name, categoryId: item.categoryId, slug: item.slug,
      icon: item.icon || '', description: item.description || '', order: item.order || 0,
      premiumPrice: item.premiumPrice ?? 0,
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
        // Subject Pack price (INR). 0 = not purchasable individually.
        // When > 0, the Flutter test_list_screen shows an "Unlock this subject
        // for ₹X" banner. The admin should ALSO create a matching SUBJECT_PACK
        // Product in the Products section (refId = this subject's id) with the
        // same price — the backend uses the Product price as the server-side
        // authority.
        premiumPrice: Math.max(0, Number(form.premiumPrice) || 0),
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

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((s) => s.id);
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
      await deleteItems('subjects', ids);
      toast.success(`${ids.length} subject${ids.length === 1 ? '' : 's'} deleted`);
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
                        aria-label="Select all subjects"
                      />
                    </th>
                    <th className="text-left p-4 font-medium">Subject</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Slug</th>
                    <th className="text-center p-4 font-medium">Tests</th>
                    <th className="text-center p-4 font-medium">Order</th>
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
                          aria-label={`Select ${item.name}`}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {item.icon && <span className="text-lg">{item.icon}</span>}
                          <span className="text-white font-medium">{item.name}</span>
                        </div>
                        {item.description && <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>}
                      </td>
                      <td className="p-4"><Badge variant="outline" className="border-slate-700 text-slate-300">{categoryName(item.categoryId)}</Badge></td>
                      <td className="p-4 text-slate-500 text-xs">/{item.slug}</td>
                      <td className="p-4 text-center text-slate-400">{testCountMap[item.id] || 0}</td>
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
              <Label>Subject Pack Price (INR)</Label>
              <Input
                type="number"
                min={0}
                value={form.premiumPrice}
                onChange={(e) => setForm({ ...form, premiumPrice: Number(e.target.value) })}
                placeholder="0 = not sold individually"
                className="bg-slate-800 border-slate-700"
              />
              <p className="text-slate-500 text-[10px]">
                Set &gt; 0 to let users unlock ALL tests in this subject as a one-time
                purchase. You must also create a matching SUBJECT_PACK product in the
                Products section with the same price (server-side authority).
              </p>
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
                Paste a JSON array of subject objects below, or paste CSV rows (first row = column headers).
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJson('subjects-template', JSON.parse(BULK_SAMPLE))}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv('subjects-template', CSV_HEADERS, CSV_SAMPLE_ROWS)}
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
              placeholder='[{"name":"Quantitative Aptitude","categoryName":"SSC","order":1}]'
            />
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">name</span>,{' '}
              <span className="text-slate-400">description</span>,{' '}
              <span className="text-slate-400">icon</span> (emoji),{' '}
              <span className="text-slate-400 text-emerald-300">categoryName</span> (parent category — recommended) or{' '}
              <span className="text-slate-400">categoryId</span> (existing id),{' '}
              <span className="text-slate-400">order</span> (number),{' '}
              <span className="text-slate-400">isActive</span> (boolean)
            </p>
            <p className="text-xs text-slate-500">
              Tip: add categories first, then bulk-add subjects by{' '}
              <code className="text-emerald-300">categoryName</code>. The system
              resolves the name to the category id automatically.
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

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} subject{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} subject{selectedIds.size === 1 ? '' : 's'} from Firestore.
              Tests under these subjects will remain but lose their subject link.
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
              Delete {selectedIds.size} subject{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
