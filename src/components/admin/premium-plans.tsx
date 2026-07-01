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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    if (form.price < 0) {
      toast.error('Price cannot be negative');
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
        await updateDoc(doc(db, 'premium_plans', editingId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        toast.success('Plan updated');
      } else {
        await addDoc(collection(db, 'premium_plans'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Plan added');
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
      await deleteDoc(doc(db, 'premium_plans', deleteId));
      toast.success('Plan deleted');
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
            <Gem className="w-5 h-5 text-emerald-400" /> Premium Plans
          </h3>
          <p className="text-slate-500 text-sm">Manage subscription plans shown to users</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <Gem className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No premium plans yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const popular = !!item.isPopular;
            const active = item.isActive !== false;
            return (
              <Card
                key={item.id}
                className={`bg-slate-900 hover:border-slate-700 transition-colors group relative ${
                  popular ? 'border-emerald-700/60' : 'border-slate-800'
                }`}
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
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-base truncate">{item.name || 'Untitled Plan'}</h4>
                      {item.durationLabel && (
                        <p className="text-slate-500 text-xs mt-0.5">{item.durationLabel}</p>
                      )}
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
    </div>
  );
}
