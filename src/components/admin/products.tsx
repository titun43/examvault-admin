'use client';

// =============================================================================
// ExamVault - Admin > Products (Subject Packs + Exam Packs)
// =============================================================================
// CRUD UI for the Product table (Prisma). Two tabs:
//   - Subject Packs  (type = SUBJECT_PACK, refId = Firestore subjectId)
//   - Exam Packs     (type = EXAM_PACK,    refId = Firestore categoryId +
//                       optional subjectIds[] list)
//
// Each tab shows a table of products + an "Add Product" button. Add/Edit dialog
// has: name, description, refId (picked from a live dropdown of Firestore
// categories / subjects — no more manual ID copy/paste), price (₹),
// isActive switch, and for EXAM_PACK a checkbox list of subjects filtered by
// the chosen category (with an "Advanced" raw-ID input for edge cases).
//
// Delete is gated by a confirmation dialog. The backend refuses to delete a
// product that has existing purchases (returns 400 with a clear message); we
// surface that error and suggest deactivating instead.
// =============================================================================

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  IndianRupee,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  KeyRound,
  BookOpen,
  FolderTree,
  ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminToken, clearAdminToken } from '@/lib/admin-token';
import AdminTokenGate from './admin-token-gate';

type ProductType = 'SUBJECT_PACK' | 'EXAM_PACK';

interface Product {
  id: string;
  type: ProductType;
  name: string;
  slug: string;
  description: string | null;
  refId: string;
  price: number; // paise
  currency: string;
  isActive: boolean;
  subjectIds: string; // JSON string
  createdAt: string;
  updatedAt: string;
  purchases: number;
}

interface ListResponse {
  products: Product[];
}

// ---- Firestore category / subject options for dropdowns -----------------
interface CategoryOption {
  id: string;
  name: string;
  icon?: string;
}

interface SubjectOption {
  id: string;
  categoryId: string;
  name: string;
  icon?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Products() {
  return (
    <AdminTokenGate title="Products">
      <ProductsInner />
    </AdminTokenGate>
  );
}

function ProductsInner() {
  const { token } = useAdminToken();
  const [tab, setTab] = useState<ProductType>('SUBJECT_PACK');
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Edit / Add dialog ----
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // ---- Delete dialog ----
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---- Form state ----
  const emptyForm: ProductForm = {
    name: '',
    description: '',
    refId: '',
    price: '',
    isActive: true,
    subjectIds: '',
  };
  const [form, setForm] = useState<ProductForm>(emptyForm);

  // ---- Live Firestore categories + subjects for the dropdown selectors ----
  // These power the Subject/Category dropdowns in the Add/Edit dialog so the
  // admin never has to manually copy/paste Firestore doc IDs.
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    let u1: (() => void) | undefined;
    let u2: (() => void) | undefined;
    try {
      u1 = onSnapshot(collection(db, 'categories'), (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() as {
            name?: string;
            icon?: string;
          };
          return {
            id: d.id,
            name: data.name?.trim() || 'Untitled',
            icon: data.icon,
          };
        });
        list.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(list);
      });
      u2 = onSnapshot(collection(db, 'subjects'), (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data() as {
            name?: string;
            icon?: string;
            categoryId?: string;
          };
          return {
            id: d.id,
            categoryId: data.categoryId ?? '',
            name: data.name?.trim() || 'Untitled',
            icon: data.icon,
          };
        });
        list.sort((a, b) => a.name.localeCompare(b.name));
        setSubjects(list);
      });
    } catch (e) {
      // Firestore may not be reachable (e.g. admin not signed in yet).
      // Dropdowns will simply render empty — the admin can still type IDs
      // manually if needed. We surface nothing to keep the page usable.
      console.warn('[products] Firestore options load failed', e);
    } finally {
      setOptionsLoading(false);
    }
    return () => {
      u1?.();
      u2?.();
    };
  }, []);

  // Subjects belonging to the currently-selected category (Exam Pack tab).
  // Used to populate the multi-select checkbox list.
  const examPackSubjects = useMemo(
    () => subjects.filter((s) => s.categoryId === form.refId),
    [subjects, form.refId],
  );

  // Already-selected subject IDs (parsed from the comma form field).
  const selectedSubjectIds = useMemo(
    () =>
      form.subjectIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [form.subjectIds],
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products?type=${tab}`, {
        headers: { 'x-admin-token': token ?? '' },
      });
      if (res.status === 401) {
        setError('Admin token rejected. Clear and re-enter the token.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ListResponse;
      setItems(json.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [tab, token]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ---- Open Add ----
  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(emptyForm);
    setEditorOpen(true);
  }, []);

  // ---- Open Edit ----
  const openEdit = useCallback((p: Product) => {
    setEditing(p);
    let subjectIdsStr = '';
    try {
      const arr = JSON.parse(p.subjectIds) as string[];
      if (Array.isArray(arr)) subjectIdsStr = arr.join(', ');
    } catch {
      // ignore
    }
    setForm({
      name: p.name,
      description: p.description ?? '',
      refId: p.refId,
      price: (p.price / 100).toString(),
      isActive: p.isActive,
      subjectIds: subjectIdsStr,
    });
    setEditorOpen(true);
  }, []);

  // ---- Save (create or update) ----
  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.refId.trim()) {
      toast.error('Ref ID is required');
      return;
    }
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error('Price must be a positive number');
      return;
    }

    setSaving(true);
    try {
      const subjectIds = form.subjectIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const body: Record<string, unknown> = {
        type: tab,
        name: form.name.trim(),
        description: form.description.trim(),
        refId: form.refId.trim(),
        price: priceNum,
        isActive: form.isActive,
      };
      if (tab === 'EXAM_PACK') body.subjectIds = subjectIds;

      const url = editing
        ? `/api/admin/products/${editing.id}`
        : '/api/admin/products';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'x-admin-token': token ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

      toast.success(editing ? 'Product updated' : 'Product created');
      setEditorOpen(false);
      await fetchList();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [form, tab, editing, token, fetchList]);

  // ---- Toggle isActive (inline quick toggle) ----
  const handleToggleActive = useCallback(
    async (p: Product, next: boolean) => {
      // Optimistic update
      setItems((cur) =>
        cur.map((it) => (it.id === p.id ? { ...it, isActive: next } : it)),
      );
      try {
        const res = await fetch(`/api/admin/products/${p.id}`, {
          method: 'PUT',
          headers: {
            'x-admin-token': token ?? '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: next }),
        });
        if (!res.ok) {
          const j = await res.json();
          throw new Error(j.error || `HTTP ${res.status}`);
        }
        toast.success(`${p.name}: ${next ? 'activated' : 'deactivated'}`);
      } catch (e) {
        // revert
        setItems((cur) =>
          cur.map((it) => (it.id === p.id ? { ...it, isActive: p.isActive } : it)),
        );
        toast.error(e instanceof Error ? e.message : 'Toggle failed');
      }
    },
    [token],
  );

  // ---- Delete ----
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token ?? '' },
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      toast.success('Product deleted');
      setDeleteTarget(null);
      await fetchList();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, token, fetchList]);

  // ---- Clear admin token ----
  const handleClearToken = useCallback(() => {
    clearAdminToken();
    toast.info('Admin token cleared. Reload to re-enter.');
    setTimeout(() => window.location.reload(), 500);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Products</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Subject Packs and Exam Packs — admin-managed purchasable items.
            Refs point to Firestore subject / category docs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchList}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearToken}
            className="text-slate-400 hover:text-amber-300 hover:bg-amber-950/40"
            title="Clear admin token"
          >
            <KeyRound className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as ProductType)}
      >
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="SUBJECT_PACK" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-300 text-slate-300">
            <BookOpen className="w-4 h-4 mr-1.5" />
            Subject Packs
          </TabsTrigger>
          <TabsTrigger value="EXAM_PACK" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-300 text-slate-300">
            <FolderTree className="w-4 h-4 mr-1.5" />
            Exam Packs
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <Card className="bg-slate-900/60 border-slate-800">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <p className="text-sm text-slate-400">
                  {tab === 'SUBJECT_PACK'
                    ? 'Each subject pack unlocks all premium tests for one subject.'
                    : 'Each exam pack unlocks all subjects (and their tests) for one exam category.'}
                </p>
                <Button
                  size="sm"
                  onClick={openAdd}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Product
                </Button>
              </div>

              {error ? (
                <div className="flex items-center gap-2 p-4 text-red-300 text-sm rounded-lg bg-red-950/40 border border-red-800/40">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400 pl-1">Name</TableHead>
                      <TableHead className="text-slate-400">Ref ID</TableHead>
                      <TableHead className="text-slate-400 text-right">Price</TableHead>
                      <TableHead className="text-slate-400 text-center">Active</TableHead>
                      <TableHead className="text-slate-400 text-right">Purchases</TableHead>
                      <TableHead className="text-slate-400 text-right pr-1">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={`s${i}`} className="border-slate-800">
                          <TableCell className="pl-1">
                            <Skeleton className="h-4 w-40 bg-slate-800" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24 bg-slate-800" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-4 w-16 bg-slate-800 ml-auto" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-5 w-9 bg-slate-800 mx-auto" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-4 w-8 bg-slate-800 ml-auto" />
                          </TableCell>
                          <TableCell className="text-right pr-1">
                            <Skeleton className="h-8 w-20 bg-slate-800 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : items.length === 0 ? (
                      <TableRow className="border-slate-800">
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2 text-slate-500">
                            <Package className="w-8 h-8 opacity-40" />
                            <p className="text-sm">
                              No {tab === 'SUBJECT_PACK' ? 'subject' : 'exam'}{' '}
                              packs yet. Click "Add Product" to create one.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((p) => (
                        <TableRow key={p.id} className="border-slate-800">
                          <TableCell className="pl-1">
                            <div className="text-sm text-slate-100 font-medium">
                              {p.name}
                            </div>
                            {p.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[280px]">
                                {p.description}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                              {p.slug}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                              {p.refId}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-0.5 text-slate-100 font-semibold">
                              <IndianRupee className="w-3 h-3 text-slate-400" />
                              {(p.price / 100).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Switch
                                checked={p.isActive}
                                onCheckedChange={(v) => handleToggleActive(p, v)}
                                aria-label="Toggle active"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-slate-300 text-sm">
                            {p.purchases}
                          </TableCell>
                          <TableCell className="text-right pr-1">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(p)}
                                className="text-slate-300 hover:text-white hover:bg-slate-800"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(p)}
                                className="text-slate-300 hover:text-red-400 hover:bg-red-950/40"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              {editing ? 'Edit Product' : 'Add Product'}{' '}
              <Badge
                variant="outline"
                className="text-[10px] bg-slate-700/40 text-slate-300 border-slate-600"
              >
                {tab === 'SUBJECT_PACK' ? 'Subject Pack' : 'Exam Pack'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {tab === 'SUBJECT_PACK'
                ? 'Unlocks all premium tests for a single subject.'
                : 'Unlocks all subjects in an exam category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-200">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={tab === 'SUBJECT_PACK' ? 'e.g. Maths Full Pack' : 'e.g. WBPSC Complete Pack'}
                className="bg-slate-950/60 border-slate-700 text-white"
              />
              <p className="text-[11px] text-slate-500">
                Slug is auto-generated from the name and made unique with a
                short random suffix.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-200">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Short marketing description shown to users."
                rows={2}
                className="bg-slate-950/60 border-slate-700 text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-200">
                  {tab === 'SUBJECT_PACK' ? 'Subject *' : 'Category (Exam) *'}
                </Label>

                {tab === 'SUBJECT_PACK' ? (
                  // -------- Subject Pack: dropdown of subjects --------
                  // Renders as "Category › Subject" so duplicate subject names
                  // across categories don't get confused.
                  <Select
                    value={form.refId}
                    onValueChange={(v) => setForm({ ...form, refId: v })}
                  >
                    <SelectTrigger className="bg-slate-950/60 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          optionsLoading
                            ? 'Loading subjects…'
                            : subjects.length === 0
                              ? 'No subjects found'
                              : 'Select a subject…'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-72">
                      {subjects.map((s) => {
                        const cat = categories.find(
                          (c) => c.id === s.categoryId,
                        );
                        return (
                          <SelectItem key={s.id} value={s.id}>
                            {cat ? (
                              <span className="text-slate-400">{cat.name} › </span>
                            ) : null}
                            <span className="text-slate-100">
                              {s.icon ? `${s.icon} ` : ''}
                              {s.name}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  // -------- Exam Pack: dropdown of categories --------
                  <Select
                    value={form.refId}
                    onValueChange={(v) =>
                      // Switching category invalidates previously-picked
                      // subjects (they belonged to the old category).
                      setForm({ ...form, refId: v, subjectIds: '' })
                    }
                  >
                    <SelectTrigger className="bg-slate-950/60 border-slate-700 text-white">
                      <SelectValue
                        placeholder={
                          optionsLoading
                            ? 'Loading categories…'
                            : categories.length === 0
                              ? 'No categories found'
                              : 'Select a category…'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-72">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon ? `${c.icon} ` : ''}
                          <span className="text-slate-100">{c.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Show the resolved Firestore doc ID so admins can still
                    verify what's selected. */}
                {form.refId ? (
                  <p className="text-[11px] text-slate-500">
                    Firestore ID:{' '}
                    <code className="text-emerald-300 bg-emerald-950/40 px-1 py-0.5 rounded">
                      {form.refId}
                    </code>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    {tab === 'SUBJECT_PACK'
                      ? 'Pick the subject this pack unlocks.'
                      : 'Pick the exam category this pack unlocks.'}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-200">Price (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <Input
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="e.g. 99"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9 bg-slate-950/60 border-slate-700 text-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  In rupees; stored as paise internally.
                </p>
              </div>
            </div>

            {tab === 'EXAM_PACK' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-200">Subjects included</Label>
                  <span className="text-[11px] text-slate-500">
                    {selectedSubjectIds.length} selected
                  </span>
                </div>

                {!form.refId ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-950/40 border border-dashed border-slate-700 text-[12px] text-amber-300/80">
                    <ChevronsUpDown className="w-3.5 h-3.5 shrink-0" />
                    Select a category above to see its subjects here.
                  </div>
                ) : examPackSubjects.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-950/40 border border-dashed border-slate-700 text-[12px] text-slate-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    No subjects found in this category. Add subjects first.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            subjectIds: examPackSubjects
                              .map((s) => s.id)
                              .join(', '),
                          })
                        }
                        className="text-[11px] text-emerald-300 hover:text-emerald-200 underline-offset-2 hover:underline"
                      >
                        Select all
                      </button>
                      <span className="text-slate-600">·</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, subjectIds: '' })}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/60">
                      {examPackSubjects.map((s) => {
                        const checked = selectedSubjectIds.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-800/40"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const next = v
                                  ? [...selectedSubjectIds, s.id]
                                  : selectedSubjectIds.filter(
                                      (id) => id !== s.id,
                                    );
                                setForm({
                                  ...form,
                                  subjectIds: next.join(', '),
                                });
                              }}
                            />
                            <span className="text-sm text-slate-200">
                              {s.icon ? `${s.icon} ` : ''}
                              {s.name}
                            </span>
                            <code className="ml-auto text-[10px] text-slate-600 font-mono">
                              {s.id.slice(0, 8)}…
                            </code>
                          </label>
                        );
                      })}
                    </div>
                  </>
                )}

                <p className="text-[11px] text-slate-500">
                  Stored as a JSON array — grants access to all of these
                  subjects and their tests. Subjects outside this category can
                  still be added via comma-separated IDs if needed (advanced).
                </p>
                {/* Hidden helper: an advanced raw-input toggle so power users
                    can still paste IDs for subjects that live outside the
                    selected category. Collapsed by default. */}
                <details className="text-[11px] text-slate-500">
                  <summary className="cursor-pointer hover:text-slate-300">
                    Advanced: raw subject IDs
                  </summary>
                  <Input
                    value={form.subjectIds}
                    onChange={(e) =>
                      setForm({ ...form, subjectIds: e.target.value })
                    }
                    placeholder="subject1, subject2, subject3"
                    className="mt-2 bg-slate-950/60 border-slate-700 text-white font-mono text-xs"
                  />
                </details>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <p className="text-sm text-slate-200 font-medium">Active</p>
                <p className="text-[11px] text-slate-500">
                  Inactive products are hidden from the purchase screen but
                  existing entitlements remain valid.
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditorOpen(false)}
              disabled={saving}
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : editing ? (
                'Save changes'
              ) : (
                'Create product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete &ldquo;{deleteTarget?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This permanently removes the product from the catalog. The backend
              will refuse if there are existing purchases linked to this product
              — in that case, deactivate it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Form state type ------------------------------------------------------
interface ProductForm {
  name: string;
  description: string;
  refId: string;
  price: string;
  isActive: boolean;
  subjectIds: string;
}
