'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { deleteItems } from '@/lib/admin-firestore';
import { Checkbox } from '@/components/ui/checkbox';
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
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Gem,
  Crown,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface PremiumPlan {
  id: string;
  name?: string;
  price?: number;
  durationMonths?: number;
  durationLabel?: string;
  planId?: string;
  description?: string;
  features?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  order?: number;
  createdAt?: any;
  updatedAt?: any;
}

const emptyForm = {
  name: '',
  price: 0,
  durationMonths: 1,
  durationLabel: '',
  planId: '',
  description: '',
  features: '',
  isPopular: false,
  isActive: true,
  order: 0,
};

export default function PremiumPlans() {
  const [items, setItems] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  // Seeding default plans (one-click fix for "No Plans Available" in the
  // Flutter app — the premium_plans collection is empty until the admin
  // either adds plans manually or clicks this button).
  const [seeding, setSeeding] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);

  /// The three standard ExamVault premium plans. Mirror the AppConfig.pricing
  /// defaults documented in the Flutter app (₹99/mo, ₹249/qtr, ₹799/yr).
  /// `planId` is filled with the Firestore doc id after addDoc (see handleSave
  /// for the same pattern) — the Flutter app sends this as `productId` to the
  /// create-order API, so it MUST be non-empty.
  const DEFAULT_PLANS = [
    {
      name: 'Monthly',
      price: 99,
      durationMonths: 1,
      durationLabel: '1 Month',
      description: 'Best for short-term prep',
      features: [
        'Unlimited Mock Tests',
        'Detailed Solutions',
        'Performance Analytics',
        'Previous Year Papers',
        'Priority Support',
      ],
      isPopular: false,
      isActive: true,
      order: 1,
    },
    {
      name: 'Quarterly',
      price: 249,
      durationMonths: 3,
      durationLabel: '3 Months',
      description: 'Save 16% vs monthly',
      features: [
        'Unlimited Mock Tests',
        'Detailed Solutions',
        'Performance Analytics',
        'Previous Year Papers',
        'Priority Support',
        'Download PDFs',
      ],
      isPopular: true,
      isActive: true,
      order: 2,
    },
    {
      name: 'Yearly',
      price: 799,
      durationMonths: 12,
      durationLabel: '12 Months',
      description: 'Best value — save 33%',
      features: [
        'Unlimited Mock Tests',
        'Detailed Solutions',
        'Performance Analytics',
        'Previous Year Papers',
        'Priority Support',
        'Download PDFs',
        'AI Insights',
      ],
      isPopular: false,
      isActive: true,
      order: 3,
    },
  ];

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'premium_plans'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as PremiumPlan)
          .sort((a, b) => {
            const ordA = a.order ?? 0;
            const ordB = b.order ?? 0;
            if (ordA !== ordB) return ordA - ordB;
            const pA = a.price ?? 0;
            const pB = b.price ?? 0;
            return pA - pB;
          });
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

  const openEdit = (item: PremiumPlan) => {
    setForm({
      name: item.name || '',
      price: item.price ?? 0,
      durationMonths: item.durationMonths ?? 1,
      durationLabel: item.durationLabel || '',
      planId: item.planId || '',
      description: item.description || '',
      features: Array.isArray(item.features) ? item.features.join('\n') : '',
      isPopular: !!item.isPopular,
      isActive: item.isActive !== false,
      order: item.order ?? 0,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (!form.price || form.price <= 0) {
      toast.error('Price must be greater than 0. Razorpay minimum is ₹1.');
      return;
    }
    setSaving(true);
    try {
      const featuresArr = form.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const data: Record<string, any> = {
        name: form.name.trim(),
        price: Number(form.price) || 0,
        durationMonths: Number(form.durationMonths) || 1,
        durationLabel: form.durationLabel.trim(),
        planId: form.planId.trim(),
        description: form.description.trim(),
        features: featuresArr,
        isPopular: !!form.isPopular,
        isActive: !!form.isActive,
        order: Number(form.order) || 0,
      };

      if (editingId) {
        // Ensure planId is never empty — if admin cleared it (or it was never
        // set), fall back to the Firestore doc id. This is CRITICAL because
        // the Flutter app sends `planId` as `productId` to the create-order
        // API, and the backend rejects empty `productId` with
        // "Missing or invalid fields: productId" — which surfaces in the UI
        // as "payment failed missing field product".
        const finalData = {
          ...data,
          planId: data.planId?.trim() ? data.planId.trim() : editingId,
        };
        await updateDoc(doc(db, 'premium_plans', editingId), {
          ...finalData,
          updatedAt: serverTimestamp(),
        });
        toast.success('Plan updated');
      } else {
        const docRef = await addDoc(collection(db, 'premium_plans'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        // Auto-fill planId with the Firestore doc id if the admin didn't
        // provide a Razorpay Plan ID. The Flutter app uses this as the
        // `productId` for the create-order API call — it MUST be non-empty.
        if (!data.planId?.trim()) {
          await updateDoc(docRef, { planId: docRef.id });
        }
        toast.success('Plan added');
      }
      setDialogOpen(false);
    } catch (err: any) {
      const msg = err?.message || '';
      // Detect Firestore permission-denied errors and show a helpful message
      // explaining that the Firestore rules need to be deployed.
      if (msg.includes('permission') || msg.includes('insufficient') || msg.includes('PERMISSION_DENIED')) {
        toast.error('Permission denied. Deploy the Firestore rules: run "firebase deploy --only firestore:rules,storage" in the examvault-work folder (requires firebase login).');
      } else {
        toast.error(msg || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'premium_plans', deleteId));
      toast.success('Plan deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((p) => p.id);
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
      await deleteItems('premium_plans', ids);
      toast.success(`${ids.length} plan${ids.length === 1 ? '' : 's'} deleted`);
      setBulkDeleteOpen(false);
      clearSelection();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  /// Seeds the three default ExamVault premium plans (Monthly ₹99 /
  /// Quarterly ₹249 / Yearly ₹799) — idempotent: skips any plan whose
  /// `name` already exists in the collection. This is the one-click fix
  /// for the Flutter app showing "No Plans Available" when the
  /// `premium_plans` Firestore collection is empty.
  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      // Fetch existing plan names so we can skip duplicates.
      const existingSnap = await getDocs(collection(db, 'premium_plans'));
      const existingNames = new Set(
        existingSnap.docs.map(
          (d) => ((d.data()?.name as string) || '').trim().toLowerCase()
        )
      );

      let created = 0;
      let skipped = 0;
      for (const plan of DEFAULT_PLANS) {
        if (existingNames.has(plan.name.toLowerCase())) {
          skipped++;
          continue;
        }
        const docRef = await addDoc(collection(db, 'premium_plans'), {
          ...plan,
          // Auto-fill planId with the Firestore doc id — the Flutter app
          // sends this as `productId` to the create-order API.
          planId: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await updateDoc(docRef, { planId: docRef.id });
        created++;
      }

      if (created > 0 && skipped > 0) {
        toast.success(
          `Seeded ${created} plan${created === 1 ? '' : 's'}. ${skipped} already existed (skipped).`
        );
      } else if (created > 0) {
        toast.success(
          `Seeded ${created} default plan${created === 1 ? '' : 's'}. Users will see them in the app now.`
        );
      } else {
        toast.info('All default plans already exist — nothing to seed.');
      }
      setSeedOpen(false);
    } catch (err: any) {
      const msg = err?.message || '';
      if (
        msg.includes('permission') ||
        msg.includes('insufficient') ||
        msg.includes('PERMISSION_DENIED')
      ) {
        toast.error(
          'Permission denied. Deploy the Firestore rules to allow admin writes.'
        );
      } else {
        toast.error(msg || 'Seed failed');
      }
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Gem className="w-5 h-5 text-emerald-400" /> Premium Plans
          </h3>
          <p className="text-slate-500 text-sm">Manage subscription plans shown to users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setSeedOpen(true)}
            variant="outline"
            className="border-emerald-700/60 text-emerald-300 hover:bg-emerald-950/40"
            title="One-click: create Monthly ₹99, Quarterly ₹249, Yearly ₹799 (skips existing names)"
          >
            <Sparkles className="w-4 h-4 mr-1" /> Seed Default Plans
          </Button>
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Plan
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
            <Gem className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No premium plans yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-5">
              Users are seeing <span className="text-amber-300">&quot;No Plans Available&quot;</span> in the app.
              Add a custom plan or seed the 3 defaults in one click.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                onClick={() => setSeedOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-1" /> Seed Default Plans
              </Button>
              <Button
                onClick={openAdd}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Custom Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="flex items-center gap-3 flex-wrap rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all premium plans"
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
            const popular = !!item.isPopular;
            const active = item.isActive !== false;
            const isSelected = selectedIds.has(item.id);
            return (
              <Card
                key={item.id}
                className={`hover:border-slate-700 transition-colors group relative ${isSelected ? 'border-red-800 bg-red-950/20' : popular ? 'border-emerald-700/60 bg-slate-900' : 'bg-slate-900 border-slate-800'}`}
              >
                {popular && (
                  <div className="absolute -top-2.5 left-4">
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-md">
                      <Crown className="w-3 h-3 mr-1" /> POPULAR
                    </Badge>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectOne(item.id)}
                        aria-label={`Select ${item.name}`}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-base truncate">{item.name || 'Untitled Plan'}</h4>
                        {item.durationLabel && (
                          <p className="text-slate-500 text-xs mt-0.5">{item.durationLabel}</p>
                        )}
                      </div>
                    </div>
                    {active ? (
                      <Badge variant="outline" className="bg-emerald-950/40 text-emerald-400 border-emerald-800/50 shrink-0">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 shrink-0">
                        Inactive
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-emerald-400 font-bold text-2xl">₹{item.price ?? 0}</span>
                    {item.durationMonths ? (
                      <span className="text-slate-500 text-xs">/ {item.durationMonths} mo</span>
                    ) : null}
                  </div>

                  {item.description && (
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2">{item.description}</p>
                  )}

                  {Array.isArray(item.features) && item.features.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {item.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                      {item.features.length > 5 && (
                        <li className="text-slate-500 text-[10px] pl-5">
                          +{item.features.length - 5} more
                        </li>
                      )}
                    </ul>
                  )}

                  {item.planId && (
                    <p className="text-slate-600 text-[10px] mt-3 font-mono truncate">
                      Razorpay: {item.planId}
                    </p>
                  )}
                  <p className="text-slate-600 text-[10px] mt-1">Order: {item.order ?? 0}</p>

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
            <DialogTitle>{editingId ? 'Edit Plan' : 'Add Premium Plan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Plan Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Pro Monthly"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (INR) *</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="299"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  placeholder="0"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  value={form.durationMonths}
                  onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                  placeholder="1"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration Label</Label>
                <Input
                  value={form.durationLabel}
                  onChange={(e) => setForm({ ...form, durationLabel: e.target.value })}
                  placeholder="1 Month"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Razorpay Plan ID</Label>
              <Input
                value={form.planId}
                onChange={(e) => setForm({ ...form, planId: e.target.value })}
                placeholder="plan_xxxxxxxx"
                className="bg-slate-800 border-slate-700 font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short marketing line for this plan..."
                className="bg-slate-800 border-slate-700"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder={'Unlimited mock tests\nDetailed solutions\nNo ads'}
                className="bg-slate-800 border-slate-700"
                rows={5}
              />
              <p className="text-slate-500 text-[10px]">Each line becomes one feature bullet.</p>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPopular}
                  onCheckedChange={(v) => setForm({ ...form, isPopular: v })}
                />
                <Label className="cursor-pointer flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Mark as Popular
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label className="cursor-pointer flex items-center gap-1">
                  {form.isActive ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  Active
                </Label>
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
            <AlertDialogTitle>Delete this premium plan?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The plan will be removed from Firestore and will no longer be shown to users.
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} plan{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} premium plan{selectedIds.size === 1 ? '' : 's'} from Firestore.
              They will no longer be shown to users.
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
              Delete {selectedIds.size} plan{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Seed Default Plans Confirmation */}
      <AlertDialog open={seedOpen} onOpenChange={setSeedOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" /> Seed default premium plans?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This creates the three standard ExamVault plans in Firestore so users stop seeing
              <span className="text-amber-300"> "No Plans Available"</span> in the app:
              <span className="block mt-2 text-slate-300">
                • <span className="font-semibold">Monthly</span> — ₹99 / 1 month<br/>
                • <span className="font-semibold">Quarterly</span> — ₹249 / 3 months <span className="text-amber-400">(Popular)</span><br/>
                • <span className="font-semibold">Yearly</span> — ₹799 / 12 months
              </span>
              <span className="block mt-2 text-slate-500 text-xs">
                Idempotent — any plan with a matching name is skipped. Safe to click multiple times.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {seeding && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              <Sparkles className="w-4 h-4 mr-1" />
              Seed Plans
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
