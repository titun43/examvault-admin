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
import { uploadImage, deleteItems, deleteDocWithFiles, deleteItemsWithFiles } from '@/lib/admin-firestore';
import { adminAuthHeaders } from '@/lib/admin-token';
import { useAppStore } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BulkTextarea } from './bulk-textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, FolderTree, Image as ImageIcon, X, Layers, Crown, IndianRupee, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { downloadJson, downloadCsv, parseCsv } from '@/lib/download';

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
  isPremium?: boolean;
  premiumPrice?: number;
  premiumDurationMonths?: number;
}

const emptyForm = { name: '', slug: '', icon: '', description: '', image: '', color: '#10b981', order: 0, isPremium: false, premiumPrice: 99, premiumDurationMonths: 1 };

// =============================================================================
// propagateCategoryPremiumToTests — THE ROOT-CAUSE FIX for the
// "category premium করা আছে কিন্তু category-র ভেতরের tests-গুলো access
// হয়ে যাচ্ছে" bug.
// =============================================================================
// PREVIOUS (BROKEN): queried `tests.where('categoryId','==',categoryId)`. But
// the Test model only stores `subjectId` (test → subject → category); tests
// have NO `categoryId` field. The query always returned 0 docs, so tests inside
// a premium category NEVER had their `isPremium` flag set. The Flutter
// `take_test_screen` fast-path (`if (!test.isPaid) grant`) then let users take
// those tests for free — completely bypassing the category paywall.
//
// FIX: resolve the category's tests through the SUBJECTS collection:
//   1. subjects.where('categoryId','==',categoryId) → subjectIds
//   2. tests.where('subjectId','in',[...subjectIds]) → test docs
//      (Firestore `in` supports max 30 values → chunk automatically)
//   3. batch.update each test's `isPremium` flag.
//
// Returns the number of tests updated so callers can toast an accurate count.
// =============================================================================
async function propagateCategoryPremiumToTests(
  categoryId: string,
  isPremium: boolean,
): Promise<number> {
  // Step 1: find all subjects belonging to this category.
  const subjectsSnap = await getDocs(
    query(collection(db, 'subjects'), where('categoryId', '==', categoryId)),
  );
  const subjectIds = subjectsSnap.docs.map((d) => d.id);
  if (subjectIds.length === 0) return 0;

  // Step 2: find tests for those subjects, chunking to respect Firestore's
  // 30-value limit on the `in` operator.
  const CHUNK_SIZE = 30;
  let totalUpdated = 0;
  for (let i = 0; i < subjectIds.length; i += CHUNK_SIZE) {
    const chunk = subjectIds.slice(i, i + CHUNK_SIZE);
    const testsSnap = await getDocs(
      query(collection(db, 'tests'), where('subjectId', 'in', chunk)),
    );
    if (testsSnap.empty) continue;
    const batch = writeBatch(db);
    testsSnap.forEach((d) => {
      batch.update(d.ref, { isPremium, updatedAt: serverTimestamp() });
    });
    await batch.commit();
    totalUpdated += testsSnap.size;
  }
  return totalUpdated;
}

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
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // Re-sync premium flags across all categories (repairs legacy broken data).
  const [resyncing, setResyncing] = useState(false);
  const [resyncOpen, setResyncOpen] = useState(false);
  // Live subject count per category. Computed from the subjects collection so
  // the number is always accurate (manual add, bulk import, seed — all count).
  // Also written back to each category doc's `subjectCount` field so the
  // Flutter app (which reads `category.subjectCount`) stays in sync.
  const [subjectCountMap, setSubjectCountMap] = useState<Record<string, number>>({});
  const itemsRef = useRef<Category[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const BULK_SAMPLE = '[{"name":"SSC","description":"Staff Selection Commission exams","icon":"📋","image":"https://example.com/ssc-banner.png","color":"#10b981","order":1,"isActive":true},{"name":"Banking","description":"Bank PO/Clerk exams","icon":"🏦","image":"https://example.com/banking-banner.png","color":"#f59e0b","order":2,"isActive":true}]';

  const CSV_HEADERS = ['name', 'description', 'icon', 'image', 'color', 'order', 'isPremium', 'premiumPrice', 'isActive'];
  const CSV_SAMPLE_ROWS: (string | number | boolean)[][] = [
    ['SSC', 'Staff Selection Commission exams', '📋', 'https://example.com/ssc-banner.png', '#10b981', 1, false, 0, true],
    ['Banking', 'Bank PO/Clerk exams', '🏦', 'https://example.com/banking-banner.png', '#f59e0b', 2, false, 0, true],
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
            if ('premiumPrice' in obj) obj.premiumPrice = Number(obj.premiumPrice) || 0;
            if ('isPremium' in obj) obj.isPremium = String(obj.isPremium).toLowerCase() === 'true';
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
    // Validate: a premium category MUST have premiumPrice > 0, otherwise the
    // user app shows a lock with no "Unlock this exam" button (broken state).
    // Auto-fix: if isPremium=true but premiumPrice is missing/0, force a
    // sane default (₹99) so the import doesn't create broken categories.
    // We warn the admin about each auto-fix.
    const autoFixed: string[] = [];
    parsed.forEach((item: any, idx: number) => {
      const isPrem = item.isPremium === true ||
        String(item.isPremium).toLowerCase() === 'true';
      let price = Number(item.premiumPrice) || 0;
      if (isPrem && price <= 0) {
        price = 99;
        item.premiumPrice = price;
        autoFixed.push(`row ${idx + 1}${item.name ? ` (${item.name})` : ''}`);
      }
      if (!isPrem) {
        item.premiumPrice = null;
      }
    });
    if (autoFixed.length > 0) {
      toast.warning(
        `${autoFixed.length} premium categor${autoFixed.length === 1 ? 'y' : 'ies'} had no price — auto-set to ₹99: ${autoFixed.slice(0, 3).join(', ')}${autoFixed.length > 3 ? '...' : ''}`,
      );
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
    const unsub = onSnapshot(collection(db, 'categories'), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Category)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setItems(list);
      setLoading(false);
    }, () => setLoading(false));

    // Live subject counts → { categoryId: count }. Kept in state for instant
    // display AND any stale `subjectCount` values are written back to the
    // category docs so the Flutter app shows the right number.
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      const map: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const catId = (d.data() as any)?.categoryId;
        if (catId) map[catId] = (map[catId] || 0) + 1;
      });
      setSubjectCountMap(map);
      const batch = writeBatch(db);
      let needsCommit = false;
      itemsRef.current.forEach((cat) => {
        const correct = map[cat.id] || 0;
        if ((cat.subjectCount || 0) !== correct) {
          batch.update(doc(db, 'categories', cat.id), { subjectCount: correct, updatedAt: serverTimestamp() });
          needsCommit = true;
        }
      });
      if (needsCommit) batch.commit().catch(() => {});
    });

    return () => { unsub(); unsubSubjects(); };
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
      isPremium: !!item.isPremium,
      premiumPrice: item.premiumPrice ?? 99,
      premiumDurationMonths: item.premiumDurationMonths ?? 1,
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
    // CRITICAL: A premium category MUST have a price > 0. Without it:
    //   - The Flutter app hides the "Unlock this exam" button (it only shows
    //     when premiumPrice > 0), so users see a lock with NO way to pay.
    //   - The sync-from-category API rejects the request (premiumPrice <= 0),
    //     so no EXAM_PACK Product is created → purchase is impossible even if
    //     the button somehow showed.
    // Razorpay's minimum is ₹1, so enforce at least that.
    if (form.isPremium && (!form.premiumPrice || Number(form.premiumPrice) <= 0)) {
      toast.error('Premium price is required when "Premium Category" is ON. Enter at least ₹1 — this is the amount users pay to unlock this exam.');
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
        isPremium: !!form.isPremium,
        premiumPrice: form.isPremium ? (Number(form.premiumPrice) || 0) : null,
        premiumDurationMonths: form.isPremium ? (Number(form.premiumDurationMonths) || 1) : null,
      };
      let categoryId: string | null = null;
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), { ...data, updatedAt: serverTimestamp() });
        categoryId = editingId;
        toast.success('Category updated');
      } else {
        const ref = await addDoc(collection(db, 'categories'), { ...data, subjectCount: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        categoryId = ref.id;
        toast.success('Category added');
      }

      // ---- Propagate premium flag to all tests in this category ----
      // CRITICAL: When admin marks a category as premium, all tests inside it
      // must also have their `isPremium` flag set to match — otherwise the
      // Flutter `take_test_screen.dart` fast-path (`if (!test.isPaid) grant`)
      // will let users take the tests without any access check, completely
      // bypassing the category paywall. The category-level premium flag only
      // controls the "Unlock this exam" button visibility; the test-level
      // `isPremium` flag is what actually gates test access.
      // `isPaid` in the Flutter model = `price > 0 || isPremium`, so setting
      // `isPremium=true` on each test makes `isPaid=true` → access check runs
      // → paywall fires for non-entitled users.
      //
      // Tests are resolved through SUBJECTS (test → subject → category)
      // because the Test model has no `categoryId` field. See
      // `propagateCategoryPremiumToTests` for the full rationale.
      if (categoryId) {
        try {
          const n = await propagateCategoryPremiumToTests(categoryId, !!data.isPremium);
          if (n > 0) {
            toast.success(
              `${n} test${n === 1 ? '' : 's'} ${data.isPremium ? 'marked premium' : 'marked free'} (category premium ${data.isPremium ? 'ON' : 'OFF'})`,
            );
          }
        } catch (propagateErr: any) {
          console.warn('[categories] test isPremium propagation failed:', propagateErr);
          toast.warning(
            `Category saved, but could not update ${data.isPremium ? 'premium flag on' : 'free flag on'} tests. Use "Re-sync premium flags" to retry.`,
          );
        }
      }

      // ---- Sync EXAM_PACK Product with premium settings ----
      // After Firestore write, idempotently create/update/deactivate the
      // Prisma EXAM_PACK Product so the Flutter app can actually purchase
      // this category. Failure here is non-fatal — the Firestore write already
      // succeeded. We warn the admin so they can fix it manually if needed.
      if (categoryId) {
        try {
          const syncRes = await fetch('/api/admin/products/sync-from-category', {
            method: 'POST',
            headers: adminAuthHeaders(),
            body: JSON.stringify({
              categoryId,
              categoryName: data.name,
              isPremium: !!data.isPremium,
              premiumPrice: data.isPremium ? Number(data.premiumPrice) || 0 : 0,
              premiumDurationMonths: data.isPremium ? Number(data.premiumDurationMonths) || 1 : null,
            }),
          });
          if (!syncRes.ok) {
            const errJson = await syncRes.json().catch(() => ({}));
            console.warn('[categories] product sync failed:', errJson);
            toast.warning(
              `Category saved, but EXAM_PACK product sync failed: ${errJson.error || syncRes.statusText}. Please create it manually on the Products page.`,
            );
          } else {
            const syncJson = await syncRes.json().catch(() => ({}));
            if (syncJson.action === 'created') {
              toast.success(`EXAM_PACK product auto-created (₹${data.premiumPrice})`);
            } else if (syncJson.action === 'updated') {
              toast.success(`EXAM_PACK product synced (₹${data.premiumPrice})`);
            } else if (syncJson.action === 'deactivated') {
              toast.info('EXAM_PACK product deactivated (category no longer premium)');
            }
          }
        } catch (syncErr: any) {
          console.warn('[categories] product sync error:', syncErr);
          toast.warning(
            'Category saved, but EXAMPACK product sync errored. Please verify on the Products page.',
          );
        }
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
      // Before deleting the category, propagate `isPremium=false` to all its
      // tests so they don't stay locked behind a now-nonexistent paywall.
      // Non-fatal if this fails — the category is still deleted below.
      // Tests are resolved through subjects (test → subject → category).
      try {
        await propagateCategoryPremiumToTests(deleteId, false);
      } catch (propagateErr) {
        console.warn('[categories] test isPremium clear on delete failed:', propagateErr);
      }

      await deleteDocWithFiles('categories', deleteId, ['image']);
      toast.success('Category deleted');

      // Best-effort: deactivate the linked EXAM_PACK Product so users can't
      // purchase a now-deleted category. Non-fatal if this fails.
      try {
        await fetch('/api/admin/products/sync-from-category', {
          method: 'POST',
          headers: adminAuthHeaders(),
          body: JSON.stringify({
            categoryId: deleteId,
            categoryName: '(deleted)',
            isPremium: false,
          }),
        });
      } catch {
        // ignore — category is already deleted in Firestore
      }

      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Re-sync premium flags across ALL categories ----
  // Repairs legacy data broken by the old (buggy) propagation that queried a
  // non-existent `tests.categoryId` field. For every category this re-runs the
  // (now-correct) propagation: premium categories mark their tests premium,
  // free categories mark their tests free. Safe to run repeatedly — it only
  // writes the correct value. Also re-syncs the EXAM_PACK Product for each
  // premium category so prices stay consistent.
  const handleResyncPremium = async () => {
    setResyncing(true);
    try {
      let totalTests = 0;
      let catCount = 0;
      for (const cat of items) {
        try {
          const n = await propagateCategoryPremiumToTests(cat.id, !!cat.isPremium);
          totalTests += n;
          if (cat.isPremium) catCount++;
        } catch (e) {
          console.warn(`[categories] resync failed for ${cat.id}:`, e);
        }
      }
      toast.success(
        `Re-synced ${totalTests} test${totalTests === 1 ? '' : 's'} across ${catCount} premium categor${catCount === 1 ? 'y' : 'ies'}.`,
      );
      setResyncOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Re-sync failed');
    } finally {
      setResyncing(false);
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
      await deleteItemsWithFiles('categories', ids, ['image']);
      toast.success(`${ids.length} categor${ids.length === 1 ? 'y' : 'ies'} deleted`);
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
          <Button
            variant="outline"
            onClick={() => setResyncOpen(true)}
            disabled={resyncing || items.length === 0}
            title="Re-mark all tests inside premium categories as premium. Fixes tests that were left free by a previous bug."
            className="border-amber-700/60 text-amber-300 hover:bg-amber-950/40"
          >
            {resyncing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Re-sync premium
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
        <>
        <div className="flex items-center gap-3 flex-wrap rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all categories"
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
            <Card key={item.id} className={`bg-slate-900 hover:border-slate-700 transition-colors group relative ${isSelected ? 'border-red-800 bg-red-950/20' : 'border-slate-800'}`}>
              <div className="absolute top-2 right-2 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSelectOne(item.id)}
                  aria-label={`Select ${item.name}`}
                />
              </div>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-medium truncate">{item.name}</h4>
                      {item.isPremium ? (
                        <Badge variant="outline" className="bg-amber-950/60 text-amber-400 border-amber-800/50 shrink-0">
                          <Crown className="w-3 h-3 mr-1" /> ₹{item.premiumPrice || 0}
                        </Badge>
                      ) : null}
                      <Badge variant="outline" className="text-slate-500 border-slate-700 shrink-0">{subjectCountMap[item.id] || 0} subjects</Badge>
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
            );
          })}
        </div>
        </>
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
            {/* Premium toggle */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <Label className="cursor-pointer font-semibold text-white">Premium Category</Label>
                </div>
                <Switch
                  checked={form.isPremium}
                  onCheckedChange={(v) => setForm({ ...form, isPremium: v })}
                />
              </div>
              <p className="text-xs text-slate-500">
                Premium categories require a subscription to access their tests & content.
              </p>
              {form.isPremium && (
                <div className="space-y-3 pt-1 border-t border-slate-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Price (₹) *</Label>
                      <Input
                        type="number"
                        value={form.premiumPrice}
                        onChange={(e) => setForm({ ...form, premiumPrice: Number(e.target.value) })}
                        placeholder="99"
                        min="1"
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (months)</Label>
                      <Select
                        value={String(form.premiumDurationMonths)}
                        onValueChange={(v) => setForm({ ...form, premiumDurationMonths: Number(v) })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="1">1 month</SelectItem>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="120">Lifetime (10 years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-amber-400/80 bg-amber-950/30 border border-amber-900/40 rounded px-2 py-1.5">
                    💡 This price is what users pay to unlock THIS exam. It shows as
                    "Unlock this exam (₹{form.premiumPrice || 0})" in the user app.
                    Must be at least ₹1 (Razorpay minimum). Without a valid price,
                    the lock shows but users can't buy.
                  </p>
                </div>
              )}
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
                Paste a JSON array of category objects below, or paste CSV rows (first row = column headers).
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJson('categories-template', JSON.parse(BULK_SAMPLE))}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv('categories-template', CSV_HEADERS, CSV_SAMPLE_ROWS)}
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
              placeholder='[{"name":"SSC","description":"...","icon":"📋","color":"#10b981","order":1,"isActive":true}]'
            />
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">name</span>,{' '}
              <span className="text-slate-400">description</span>,{' '}
              <span className="text-slate-400">icon</span> (emoji),{' '}
              <span className="text-slate-400">image</span> (URL string — banner image),{' '}
              <span className="text-slate-400">color</span> (hex),{' '}
              <span className="text-slate-400">order</span> (number),{' '}
              <span className="text-slate-400">isPremium</span> (boolean),{' '}
              <span className="text-slate-400">premiumPrice</span> (number, INR),{' '}
              <span className="text-slate-400">isActive</span> (boolean)
            </p>
            <p className="text-xs text-slate-500">
              Tip: <code className="text-emerald-300">image</code> accepts a
              direct URL (e.g. https://example.com/banner.png). Categories are
              the root of the hierarchy — add them first, then bulk-add
              subjects by <code className="text-emerald-300">categoryName</code>.
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

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} categor{selectedIds.size === 1 ? 'y' : 'ies'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} categor{selectedIds.size === 1 ? 'y' : 'ies'} from Firestore.
              Subjects and tests under these categories will remain but lose their category link.
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
              Delete {selectedIds.size} categor{selectedIds.size === 1 ? 'y' : 'ies'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Re-sync Premium Flags Confirmation */}
      <AlertDialog open={resyncOpen} onOpenChange={setResyncOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" /> Re-sync premium flags?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This re-marks every test's <b>isPremium</b> flag to match its
              category's premium setting (resolved via subjects). Premium
              categories → tests become premium; free categories → tests become
              free.
              <span className="block mt-2 text-slate-300">
                Use this to repair tests that were left free inside premium
                categories by a previous bug. Safe to run repeatedly.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResyncPremium}
              disabled={resyncing}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {resyncing && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Re-sync all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
