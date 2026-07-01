'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDateTime, timestampToDate, deleteItems } from '@/lib/admin-firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge';
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
  CreditCard,
  Loader2,
  Search,
  Wallet,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  IndianRupee,
  TrendingUp,
  RefreshCw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type PaymentStatus =
  | 'created'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'pending';

interface Payment {
  id: string;
  userId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount?: number; // paise
  currency?: string;
  status?: PaymentStatus;
  method?: 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi' | string;
  planId?: string;
  planName?: string;
  durationMonths?: number;
  createdAt?: any;
  completedAt?: any;
  rawResponse?: Record<string, any>;
}

const STATUS_BADGES: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  created: {
    label: 'Created',
    className: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
  },
  authorized: {
    label: 'Authorized',
    className: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
  },
  captured: {
    label: 'Captured',
    className: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-950/60 text-red-400 border-red-800/50',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-slate-800 text-slate-300 border-slate-700',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
  },
};

function formatAmount(paise?: number): string {
  if (typeof paise !== 'number' || Number.isNaN(paise)) return '—';
  return `₹${(paise / 100).toFixed(2)}`;
}

function truncateId(id?: string, len = 12): string {
  if (!id) return '—';
  if (id.length <= len) return id;
  return `${id.slice(0, len)}…`;
}

export default function Payments() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewing, setViewing] = useState<Payment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    let unsub: () => void = () => {};
    try {
      const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      unsub = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as Payment,
          );
          setItems(list);
          setLoading(false);
        },
        (err) => {
          console.error('payments onSnapshot error:', err);
          // Fallback: read without ordering in case createdAt index missing
          const fallback = onSnapshot(
            collection(db, 'payments'),
            (snap) => {
              const list = snap.docs
                .map((d) => ({ id: d.id, ...d.data() }) as Payment)
                .sort((a, b) => {
                  const tA = timestampToDate(a.createdAt)?.getTime() || 0;
                  const tB = timestampToDate(b.createdAt)?.getTime() || 0;
                  return tB - tA;
                });
              setItems(list);
              setLoading(false);
            },
            () => setLoading(false),
          );
          unsub = fallback;
        },
      );
    } catch (e) {
      console.error('payments subscribe error:', e);
      setLoading(false);
    }
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const captured = items.filter((p) => p.status === 'captured');
    const failed = items.filter((p) => p.status === 'failed');
    const revenuePaise = captured.reduce(
      (sum, p) => sum + (typeof p.amount === 'number' ? p.amount : 0),
      0,
    );
    return {
      total,
      successful: captured.length,
      failed: failed.length,
      revenueRupees: revenuePaise / 100,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (p.userId || '').toLowerCase().includes(q) ||
        (p.razorpayOrderId || '').toLowerCase().includes(q) ||
        (p.planName || '').toLowerCase().includes(q)
      );
    });
  }, [items, search, statusFilter]);

  const handleStatusChange = async (payment: Payment, newStatus: PaymentStatus) => {
    setUpdatingStatusId(payment.id);
    setStatusSaving(true);
    try {
      const updates: Record<string, any> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
      };
      if (newStatus === 'captured' && !payment.completedAt) {
        updates.completedAt = serverTimestamp();
      }
      await updateDoc(doc(db, 'payments', payment.id), updates);
      toast.success(`Payment marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setStatusSaving(false);
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'payments', deleteId));
      toast.success('Payment record deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = filtered.map((p) => p.id);
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
      await deleteItems('payments', ids);
      toast.success(`${ids.length} payment${ids.length === 1 ? '' : 's'} deleted`);
      setBulkDeleteOpen(false);
      clearSelection();
    } catch (err: any) {
      toast.error(err?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  };

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
  }: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1 truncate">
            {label}
          </p>
          <p className="text-2xl font-bold text-white truncate">{value}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" /> Payments
        </h3>
        <p className="text-slate-500 text-sm">
          Razorpay transactions, refunds & revenue overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Payments"
          value={stats.total}
          icon={Wallet}
          color="bg-slate-800 text-slate-300"
        />
        <StatCard
          label="Successful"
          value={stats.successful}
          icon={CheckCircle2}
          color="bg-emerald-950/60 text-emerald-400"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          icon={XCircle}
          color="bg-red-950/60 text-red-400"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${stats.revenueRupees.toFixed(2)}`}
          icon={IndianRupee}
          color="bg-amber-950/60 text-amber-400"
        />
      </div>

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, order ID or plan..."
            className="bg-slate-900 border-slate-800 pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-slate-900 border-slate-800 sm:w-48 w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="authorized">Authorized</SelectItem>
            <SelectItem value="captured">Captured</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <Wallet className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">
              {items.length === 0
                ? 'No payments yet. Payments will appear here when users subscribe.'
                : 'No payments match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <div className="max-h-[65vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 w-[44px]">
                      <Checkbox
                        checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all payments"
                      />
                    </TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">
                      Plan
                    </TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400 hidden sm:table-cell">
                      Method
                    </TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const status = (p.status || 'pending') as PaymentStatus;
                    const badge = STATUS_BADGES[status] || STATUS_BADGES.pending;
                    const isSelected = selectedIds.has(p.id);
                    return (
                      <TableRow
                        key={p.id}
                        className={`border-slate-800 hover:bg-slate-800/40 ${isSelected ? 'bg-red-950/20' : ''}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectOne(p.id)}
                            aria-label={`Select payment ${p.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-slate-300 text-xs whitespace-nowrap">
                          {formatDateTime(p.createdAt)}
                        </TableCell>
                        <TableCell>
                          <p className="text-white text-xs font-mono">
                            {truncateId(p.userId, 10)}
                          </p>
                          {p.razorpayOrderId && (
                            <p className="text-slate-600 text-[10px] font-mono truncate max-w-[140px]">
                              {p.razorpayOrderId}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-slate-200 text-sm truncate max-w-[180px]">
                            {p.planName || '—'}
                          </p>
                          {p.durationMonths ? (
                            <p className="text-slate-500 text-xs">
                              {p.durationMonths} month{p.durationMonths === 1 ? '' : 's'}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-emerald-400 font-semibold whitespace-nowrap">
                          {formatAmount(p.amount)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {p.method ? (
                            <Badge
                              variant="outline"
                              className="border-slate-700 text-slate-300 bg-slate-800 capitalize"
                            >
                              {p.method}
                            </Badge>
                          ) : (
                            <span className="text-slate-600 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={badge.className}
                          >
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Select
                              value={p.status || 'pending'}
                              onValueChange={(v) =>
                                handleStatusChange(p, v as PaymentStatus)
                              }
                              disabled={
                                statusSaving && updatingStatusId === p.id
                              }
                            >
                              <SelectTrigger className="h-8 w-[120px] bg-slate-800 border-slate-700 text-xs">
                                <RefreshCw className="w-3 h-3 mr-1 text-slate-400" />
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="created">Created</SelectItem>
                                <SelectItem value="authorized">Authorized</SelectItem>
                                <SelectItem value="captured">Captured</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                              onClick={() => setViewing(p)}
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-400 hover:bg-red-950/40"
                              onClick={() => setDeleteId(p.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* View Detail Dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Payment Details
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-500 text-xs">Amount</Label>
                  <p className="text-emerald-400 font-bold text-lg">
                    {formatAmount(viewing.amount)}
                  </p>
                  {viewing.currency && (
                    <p className="text-slate-500 text-xs">{viewing.currency}</p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Status</Label>
                  <Badge
                    variant="outline"
                    className={
                      STATUS_BADGES[
                        (viewing.status || 'pending') as PaymentStatus
                      ]?.className || STATUS_BADGES.pending.className
                    }
                  >
                    {STATUS_BADGES[(viewing.status || 'pending') as PaymentStatus]
                      ?.label || 'Pending'}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div>
                  <Label className="text-slate-500 text-xs">User ID</Label>
                  <p className="text-slate-200 font-mono text-xs break-all">
                    {viewing.userId || '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Plan</Label>
                  <p className="text-slate-200">
                    {viewing.planName || '—'}
                    {viewing.durationMonths
                      ? ` · ${viewing.durationMonths} month${viewing.durationMonths === 1 ? '' : 's'}`
                      : ''}
                  </p>
                </div>
                {viewing.planId && (
                  <div>
                    <Label className="text-slate-500 text-xs">Plan ID</Label>
                    <p className="text-slate-200 font-mono text-xs break-all">
                      {viewing.planId}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-slate-500 text-xs">Method</Label>
                  <p className="text-slate-200 capitalize">
                    {viewing.method || '—'}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div>
                  <Label className="text-slate-500 text-xs">
                    Razorpay Order ID
                  </Label>
                  <p className="text-slate-200 font-mono text-xs break-all">
                    {viewing.razorpayOrderId || '—'}
                  </p>
                </div>
                {viewing.razorpayPaymentId && (
                  <div>
                    <Label className="text-slate-500 text-xs">
                      Razorpay Payment ID
                    </Label>
                    <p className="text-slate-200 font-mono text-xs break-all">
                      {viewing.razorpayPaymentId}
                    </p>
                  </div>
                )}
                {viewing.razorpaySignature && (
                  <div>
                    <Label className="text-slate-500 text-xs">
                      Razorpay Signature
                    </Label>
                    <p className="text-slate-200 font-mono text-[10px] break-all">
                      {viewing.razorpaySignature}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-500 text-xs">Created At</Label>
                  <p className="text-slate-200 text-xs">
                    {formatDateTime(viewing.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Completed At</Label>
                  <p className="text-slate-200 text-xs">
                    {formatDateTime(viewing.completedAt)}
                  </p>
                </div>
              </div>

              {viewing.rawResponse && (
                <div className="border-t border-slate-800 pt-3">
                  <Label className="text-slate-500 text-xs">Raw Response</Label>
                  <pre className="mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] text-slate-400 max-h-48 overflow-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(viewing.rawResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewing(null)}
              className="border-slate-700 text-slate-300"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this payment record?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently remove the payment entry from Firestore.
              Make sure this is intentional — it cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} payment{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} payment record{selectedIds.size === 1 ? '' : 's'} from Firestore.
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
              Delete {selectedIds.size} payment{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
