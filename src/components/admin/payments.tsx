'use client';

// =============================================================================
// ExamVault - Admin > Payments
// =============================================================================
// Full Razorpay-backed payment management screen. Replaces the previous
// Firestore placeholder viewer. Talks exclusively to /api/admin/* routes.
//
// Features:
//   - Dashboard stats strip (revenue, active subs, today's payments)
//   - Filter bar: search (debounced 400ms), status, method, productType,
//     date range (from/to)
//   - Table: Date, Order Ref, User, Product, Amount, Method, Status,
//     Verified (sig + webhook icons), Actions
//   - Row click -> detail Dialog with metadata, order, user, transactions,
//     payment logs (timeline), entitlement row, and a Refund action
//     (with optional amount input for partial refunds)
//   - Pagination controls
//   - CSV export (filtered) via /api/admin/payments/export
//
// All admin API calls send the x-admin-token header (read from localStorage
// via useAdminToken). If no token is present, AdminTokenGate renders a prompt.
// =============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard,
  Download,
  Search,
  Eye,
  RefreshCw,
  IndianRupee,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminToken, clearAdminToken } from '@/lib/admin-token';
import AdminTokenGate from './admin-token-gate';

// ---- Types (mirror Prisma payloads; kept loose to avoid coupling) ----------
type PaymentStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PENDING';

type PurchaseType =
  | 'TEST_PURCHASE'
  | 'SUBJECT_PACK'
  | 'EXAM_PACK'
  | 'PREMIUM_SUBSCRIPTION';

interface ListPayment {
  id: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  amount: number; // paise
  currency: string;
  method: string | null;
  status: PaymentStatus;
  signatureVerified: boolean;
  webhookVerified: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  refundAmount: number;
  createdAt: string;
  order: {
    id: string;
    orderRef: string;
    productType: PurchaseType;
    productName: string;
    productId: string;
    amount: number;
    currency: string;
    status: string;
  } | null;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    displayName: string | null;
  } | null;
}

interface PaymentListResponse {
  payments: ListPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DashboardStats {
  totalRevenue: number; // paise
  revenueLast30Days: number;
  activeSubscriptions: number;
  totalTestPurchases: number;
  totalSubjectPackPurchases: number;
  totalExamPackPurchases: number;
  paymentsToday: number;
  failedPayments: number;
  refundsCount: number;
  refundsAmount: number;
}

interface TransactionRow {
  id: string;
  type: 'PAYMENT' | 'REFUND';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  razorpayPaymentId: string | null;
  razorpayRefundId: string | null;
  description: string | null;
  createdAt: string;
}

interface PaymentLogRow {
  id: string;
  event: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';
  message: string;
  payload: string;
  createdAt: string;
}

interface EntitlementRow {
  kind: string;
  row: {
    id: string;
    isActive?: boolean;
    status?: string;
    [k: string]: unknown;
  };
}

interface PaymentDetail {
  payment: ListPayment & {
    razorpaySignature: string | null;
    fee: number | null;
    tax: number | null;
    verifiedAt: string | null;
    capturedAt: string | null;
    refundedAt: string | null;
    updatedAt: string;
    transactions: TransactionRow[];
    paymentLogs: PaymentLogRow[];
    user: {
      id: string;
      email: string | null;
      phone: string | null;
      displayName: string | null;
      firebaseUid: string;
      isPremium: boolean;
      premiumExpiry: string | null;
    } | null;
  };
  entitlement: EntitlementRow | null;
}

// ---- Helpers ---------------------------------------------------------------
function paiseToRupeesStr(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

function statusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case 'CAPTURED':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'FAILED':
      return 'bg-red-500/15 text-red-300 border-red-500/30';
    case 'REFUNDED':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'PENDING':
    case 'AUTHORIZED':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    case 'CREATED':
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }
}

function productTypeBadgeClass(pt: PurchaseType): string {
  switch (pt) {
    case 'PREMIUM_SUBSCRIPTION':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    case 'SUBJECT_PACK':
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    case 'EXAM_PACK':
      return 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30';
    case 'TEST_PURCHASE':
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'CAPTURED', label: 'Captured' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'AUTHORIZED', label: 'Authorized' },
  { value: 'CREATED', label: 'Created' },
];

const METHOD_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Methods' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'netbanking', label: 'Netbanking' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'emi', label: 'EMI' },
];

const PRODUCT_TYPE_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Products' },
  { value: 'TEST_PURCHASE', label: 'Test' },
  { value: 'SUBJECT_PACK', label: 'Subject Pack' },
  { value: 'EXAM_PACK', label: 'Exam Pack' },
  { value: 'PREMIUM_SUBSCRIPTION', label: 'Premium Sub' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Payments() {
  return (
    <AdminTokenGate title="Payments">
      <PaymentsInner />
    </AdminTokenGate>
  );
}

function PaymentsInner() {
  const { token } = useAdminToken();
  // ---- Filters ----
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [method, setMethod] = useState('ALL');
  const [productType, setProductType] = useState('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // ---- Pagination ----
  const [page, setPage] = useState(1);
  const limit = 20;

  // ---- Data ----
  const [data, setData] = useState<PaymentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ---- Detail dialog ----
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<PaymentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ---- Refund dialog (nested inside detail) ----
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundBusy, setRefundBusy] = useState(false);

  // ---- Debounce search 400ms ----
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page to 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, method, productType, from, to]);

  // ---- Build query string ----
  const queryStr = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set('page', String(page));
    sp.set('limit', String(limit));
    if (debouncedSearch) sp.set('search', debouncedSearch);
    if (status !== 'ALL') sp.set('status', status);
    if (method !== 'ALL') sp.set('method', method);
    if (productType !== 'ALL') sp.set('productType', productType);
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    return sp.toString();
  }, [page, debouncedSearch, status, method, productType, from, to]);

  // ---- Fetch list ----
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments?${queryStr}`, {
        headers: { 'x-admin-token': token ?? '' },
      });
      if (res.status === 401) {
        setError('Admin token rejected. Clear and re-enter the token.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as PaymentListResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [queryStr, token]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ---- Fetch stats ----
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard/stats', {
        headers: { 'x-admin-token': token ?? '' },
      });
      if (res.ok) {
        setStats((await res.json()) as DashboardStats);
      }
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ---- CSV export ----
  const handleExport = useCallback(async () => {
    try {
      toast.info('Preparing CSV export…');
      const res = await fetch(`/api/admin/payments/export?${queryStr}`, {
        headers: { 'x-admin-token': token ?? '' },
      });
      if (res.status === 401) {
        toast.error('Admin token rejected.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers.get('Content-Disposition') || '';
      const m = cd.match(/filename="([^"]+)"/);
      a.download = m?.[1] || `examvault-payments-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Export failed');
    }
  }, [queryStr, token]);

  // ---- Open detail ----
  const openDetail = useCallback(
    async (id: string) => {
      setDetailOpen(true);
      setDetail(null);
      setDetailLoading(true);
      setRefundAmount('');
      setRefundReason('');
      try {
        const res = await fetch(`/api/admin/payments/${id}`, {
          headers: { 'x-admin-token': token ?? '' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as PaymentDetail;
        setDetail(json);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load detail');
        setDetailOpen(false);
      } finally {
        setDetailLoading(false);
      }
    },
    [token],
  );

  // ---- Issue refund ----
  const handleRefund = useCallback(async () => {
    if (!detail) return;
    const rzpId = detail.payment.razorpayPaymentId;
    if (!rzpId) {
      toast.error('Payment has no Razorpay payment id; cannot refund.');
      return;
    }
    setRefundBusy(true);
    try {
      const body: { amount?: number; reason?: string } = {};
      if (refundAmount.trim()) {
        const n = Number(refundAmount);
        if (!Number.isFinite(n) || n <= 0) {
          toast.error('Refund amount must be a positive number');
          setRefundBusy(false);
          return;
        }
        body.amount = n;
      }
      if (refundReason.trim()) body.reason = refundReason.trim();

      const res = await fetch(`/api/admin/payments/${detail.payment.id}/refund`, {
        method: 'POST',
        headers: {
          'x-admin-token': token ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      toast.success(
        `Refund issued: ₹${(json.refund.amount / 100).toFixed(2)} (${json.partial ? 'partial' : 'full'})`,
      );
      // Refresh detail + list
      await openDetail(detail.payment.id);
      await fetchList();
      await fetchStats();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refund failed');
    } finally {
      setRefundBusy(false);
    }
  }, [detail, refundAmount, refundReason, token, openDetail, fetchList, fetchStats]);

  // ---- Revoke entitlement (from inside detail dialog) ----
  const handleRevokeEntitlement = useCallback(async () => {
    if (!detail?.entitlement) return;
    const kind = detail.entitlement.kind;
    const rowId = detail.entitlement.row.id;
    let endpoint = '';
    if (kind === 'premium_subscription') {
      endpoint = `/api/admin/subscriptions/${rowId}/cancel`;
    } else if (kind === 'test_purchase') {
      endpoint = `/api/admin/test-purchases/${rowId}/revoke`;
    } else if (kind === 'subject_pack_purchase') {
      endpoint = `/api/admin/subject-pack-purchases/${rowId}/revoke`;
    } else if (kind === 'exam_pack_purchase') {
      endpoint = `/api/admin/exam-pack-purchases/${rowId}/revoke`;
    } else {
      toast.error('Unknown entitlement kind; cannot revoke.');
      return;
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-admin-token': token ?? '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Revoked from admin payment detail' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      toast.success('Entitlement revoked');
      await openDetail(detail.payment.id);
      await fetchStats();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Revoke failed');
    }
  }, [detail, token, openDetail, fetchStats]);

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
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Payments</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Server-verified Razorpay transactions, refunds, and entitlements.
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
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
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

      {/* Dashboard stats strip */}
      <StatsStrip stats={stats} loading={statsLoading} />

      {/* Filters */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 space-y-1.5">
              <Label className="text-xs text-slate-400">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Payment ID, order ref, or user email"
                  className="pl-9 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-slate-950/60 border-slate-700 text-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  {STATUS_FILTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="bg-slate-950/60 border-slate-700 text-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  {METHOD_FILTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">Product</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger className="bg-slate-950/60 border-slate-700 text-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  {PRODUCT_TYPE_FILTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">From</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-slate-950/60 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-400">To</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-slate-950/60 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          {error ? (
            <div className="flex items-center gap-2 p-6 text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 pl-4">Date</TableHead>
                  <TableHead className="text-slate-400">Order Ref</TableHead>
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">Product</TableHead>
                  <TableHead className="text-slate-400 text-right">Amount</TableHead>
                  <TableHead className="text-slate-400">Method</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Verified</TableHead>
                  <TableHead className="text-slate-400 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`s${i}`} className="border-slate-800">
                      <TableCell className="pl-4">
                        <Skeleton className="h-4 w-28 bg-slate-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-slate-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40 bg-slate-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-slate-800" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-16 bg-slate-800 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-slate-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 bg-slate-800 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 bg-slate-800" />
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Skeleton className="h-8 w-16 bg-slate-800 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data && data.payments.length > 0 ? (
                  data.payments.map((p) => (
                    <TableRow
                      key={p.id}
                      onClick={() => openDetail(p.id)}
                      className="border-slate-800 cursor-pointer hover:bg-slate-800/40"
                    >
                      <TableCell className="pl-4 text-slate-300 text-xs">
                        {formatDate(p.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-200">
                        {p.order?.orderRef ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-200">
                          {p.user?.email ?? (
                            <span className="text-slate-500 italic">no email</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.user?.phone ?? '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.order ? (
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={`w-fit text-[10px] ${productTypeBadgeClass(p.order.productType)}`}
                            >
                              {p.order.productType.replace(/_/g, ' ')}
                            </Badge>
                            <span className="text-xs text-slate-300 line-clamp-1 max-w-[200px]">
                              {p.order.productName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5 text-slate-100 font-semibold">
                          <IndianRupee className="w-3 h-3 text-slate-400" />
                          {paiseToRupeesStr(p.amount)}
                        </div>
                        {p.refundAmount > 0 && (
                          <div className="text-[10px] text-amber-400">
                            refunded ₹{paiseToRupeesStr(p.refundAmount)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-300 uppercase">
                          {p.method ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusBadgeClass(p.status)}`}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {p.signatureVerified ? (
                            <ShieldCheck
                              className="w-4 h-4 text-emerald-400"
                              aria-label="Signature verified"
                            />
                          ) : (
                            <XCircle
                              className="w-4 h-4 text-slate-600"
                              aria-label="Signature not verified"
                            />
                          )}
                          {p.webhookVerified ? (
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-400"
                              aria-label="Webhook verified"
                            />
                          ) : (
                            <XCircle
                              className="w-4 h-4 text-slate-600"
                              aria-label="Webhook not verified"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(p.id);
                          }}
                          className="text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <CreditCard className="w-8 h-8 opacity-40" />
                        <p className="text-sm">No payments match these filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Showing{' '}
            <span className="text-slate-200 font-medium">
              {(data.page - 1) * data.limit + (data.payments.length > 0 ? 1 : 0)}
            </span>
            –
            <span className="text-slate-200 font-medium">
              {(data.page - 1) * data.limit + data.payments.length}
            </span>{' '}
            of <span className="text-slate-200 font-medium">{data.total}</span>{' '}
            payments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <span className="text-xs text-slate-400 px-2">
              Page <span className="text-slate-200">{data.page}</span> /{' '}
              {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Payment Detail
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Razorpay payment record, linked order, transactions, logs, and the
              entitlement row granted by this payment.
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          ) : detail ? (
            <PaymentDetailBody
              detail={detail}
              onRevoke={handleRevokeEntitlement}
              onRefund={handleRefund}
              refundAmount={refundAmount}
              setRefundAmount={setRefundAmount}
              refundReason={refundReason}
              setRefundReason={setRefundReason}
              refundBusy={refundBusy}
            />
          ) : (
            <div className="text-slate-400 text-sm">No detail loaded.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// Stats strip
// ============================================================================
function StatsStrip({
  stats,
  loading,
}: {
  stats: DashboardStats | null;
  loading: boolean;
}) {
  const items = [
    {
      label: 'Total Revenue',
      value: stats ? `₹${paiseToRupeesStr(stats.totalRevenue)}` : '—',
      sub: stats ? `₹${paiseToRupeesStr(stats.revenueLast30Days)} last 30d` : '',
      icon: IndianRupee,
      tone: 'text-emerald-400',
    },
    {
      label: 'Active Subs',
      value: stats ? String(stats.activeSubscriptions) : '—',
      sub: stats ? `${stats.totalTestPurchases} test · ${stats.totalSubjectPackPurchases} subj · ${stats.totalExamPackPurchases} exam` : '',
      icon: TrendingUp,
      tone: 'text-purple-400',
    },
    {
      label: 'Payments Today',
      value: stats ? String(stats.paymentsToday) : '—',
      sub: stats ? `${stats.failedPayments} failed all-time` : '',
      icon: CalendarDays,
      tone: 'text-sky-400',
    },
    {
      label: 'Refunds',
      value: stats ? String(stats.refundsCount) : '—',
      sub: stats ? `₹${paiseToRupeesStr(stats.refundsAmount)} total` : '',
      icon: RotateCcw,
      tone: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card
            key={it.label}
            className="bg-slate-900/60 border-slate-800"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    {it.label}
                  </p>
                  {loading ? (
                    <Skeleton className="h-6 w-20 bg-slate-800 mt-1" />
                  ) : (
                    <p className="text-lg font-bold text-white truncate">
                      {it.value}
                    </p>
                  )}
                  {it.sub && (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {it.sub}
                    </p>
                  )}
                </div>
                <Icon className={`w-5 h-5 shrink-0 ${it.tone}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// Payment detail body (inside dialog)
// ============================================================================
function PaymentDetailBody({
  detail,
  onRevoke,
  onRefund,
  refundAmount,
  setRefundAmount,
  refundReason,
  setRefundReason,
  refundBusy,
}: {
  detail: PaymentDetail;
  onRevoke: () => void;
  onRefund: () => void;
  refundAmount: string;
  setRefundAmount: (v: string) => void;
  refundReason: string;
  setRefundReason: (v: string) => void;
  refundBusy: boolean;
}) {
  const p = detail.payment;
  const ent = detail.entitlement;

  const canRefund = p.status === 'CAPTURED' && !!p.razorpayPaymentId;

  return (
    <div className="space-y-5">
      {/* Top: status + amount + actions */}
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 rounded-lg bg-slate-950/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={`text-xs ${statusBadgeClass(p.status)}`}
            >
              {p.status}
            </Badge>
            {p.order && (
              <Badge
                variant="outline"
                className={`text-xs ${productTypeBadgeClass(p.order.productType)}`}
              >
                {p.order.productType.replace(/_/g, ' ')}
              </Badge>
            )}
            {p.signatureVerified && (
              <Badge
                variant="outline"
                className="text-xs bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              >
                <ShieldCheck className="w-3 h-3" /> sig
              </Badge>
            )}
            {p.webhookVerified && (
              <Badge
                variant="outline"
                className="text-xs bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              >
                <CheckCircle2 className="w-3 h-3" /> webhook
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ₹{paiseToRupeesStr(p.amount)}{' '}
            <span className="text-sm text-slate-500 font-normal">
              {p.currency}
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(p.createdAt)}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {p.razorpayPaymentId && (
            <a
              href={`https://dashboard.razorpay.com/app/payments/${p.razorpayPaymentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
            >
              <ExternalLink className="w-3 h-3" />
              Razorpay dashboard
            </a>
          )}
          {canRefund && (
            <Button
              size="sm"
              onClick={onRefund}
              disabled={refundBusy}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              {refundBusy ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-1" />
              )}
              {refundBusy ? 'Processing…' : 'Issue refund'}
            </Button>
          )}
        </div>
      </div>

      {/* Refund inputs (only when captured) */}
      {canRefund && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-amber-950/20 border border-amber-900/40">
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-200">
              Refund amount (₹) — leave blank for full refund
            </Label>
            <Input
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={`Max ${paiseToRupeesStr(p.amount)}`}
              type="number"
              step="0.01"
              min="0"
              className="bg-slate-950/60 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-200">Reason (optional)</Label>
            <Input
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. User cancelled subscription"
              className="bg-slate-950/60 border-slate-700 text-white"
            />
          </div>
        </div>
      )}

      {/* Metadata grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailSection title="Payment Metadata">
          <DetailRow label="Payment ID" value={p.id} mono />
          <DetailRow
            label="Razorpay Payment ID"
            value={p.razorpayPaymentId ?? '—'}
            mono
          />
          <DetailRow
            label="Razorpay Order ID"
            value={p.razorpayOrderId ?? '—'}
            mono
          />
          <DetailRow label="Method" value={(p.method ?? '—').toUpperCase()} />
          <DetailRow label="Fee" value={p.fee ? `₹${paiseToRupeesStr(p.fee)}` : '—'} />
          <DetailRow label="Tax" value={p.tax ? `₹${paiseToRupeesStr(p.tax)}` : '—'} />
          <DetailRow
            label="Refunded"
            value={
              p.refundAmount > 0
                ? `₹${paiseToRupeesStr(p.refundAmount)} on ${p.refundedAt ? formatDate(p.refundedAt) : '—'}`
                : 'No'
            }
          />
          {p.errorCode && (
            <DetailRow
              label="Error"
              value={`${p.errorCode}: ${p.errorMessage ?? ''}`}
              tone="text-red-300"
            />
          )}
        </DetailSection>

        <DetailSection title="Order">
          {p.order ? (
            <>
              <DetailRow label="Order Ref" value={p.order.orderRef} mono />
              <DetailRow
                label="Product Type"
                value={p.order.productType.replace(/_/g, ' ')}
              />
              <DetailRow label="Product Name" value={p.order.productName} />
              <DetailRow label="Product ID" value={p.order.productId} mono />
              <DetailRow
                label="Order Amount"
                value={`₹${paiseToRupeesStr(p.order.amount)}`}
              />
              <DetailRow label="Order Status" value={p.order.status} />
            </>
          ) : (
            <p className="text-slate-500 text-sm">No linked order.</p>
          )}
        </DetailSection>

        <DetailSection title="User">
          {p.user ? (
            <>
              <DetailRow label="User ID" value={p.user.id} mono />
              <DetailRow label="Email" value={p.user.email ?? '—'} />
              <DetailRow label="Phone" value={p.user.phone ?? '—'} />
              <DetailRow
                label="Display Name"
                value={p.user.displayName ?? '—'}
              />
              <DetailRow
                label="Is Premium"
                value={p.user.isPremium ? 'Yes' : 'No'}
              />
              {p.user.premiumExpiry && (
                <DetailRow
                  label="Premium Until"
                  value={formatDate(p.user.premiumExpiry)}
                />
              )}
            </>
          ) : (
            <p className="text-slate-500 text-sm">No user linked.</p>
          )}
        </DetailSection>

        <DetailSection
          title="Entitlement"
          action={
            ent &&
            (ent.row.isActive === true ||
              ent.row.status === 'ACTIVE') ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onRevoke}
                className="border-red-700 text-red-300 hover:bg-red-950/40 h-7 text-xs"
              >
                Revoke / Cancel
              </Button>
            ) : undefined
          }
        >
          {ent ? (
            <div className="space-y-1.5 text-sm">
              <DetailRow label="Kind" value={ent.kind.replace(/_/g, ' ')} />
              <DetailRow label="ID" value={ent.row.id} mono />
              {ent.kind === 'premium_subscription' && (
                <>
                  <DetailRow
                    label="Plan"
                    value={String(ent.row.planName ?? '—')}
                  />
                  <DetailRow
                    label="Tier"
                    value={String(ent.row.planTier ?? '—')}
                  />
                  <DetailRow
                    label="Status"
                    value={String(ent.row.status ?? '—')}
                  />
                  <DetailRow
                    label="End Date"
                    value={
                      ent.row.endDate
                        ? formatDate(String(ent.row.endDate))
                        : '—'
                    }
                  />
                </>
              )}
              {ent.kind === 'test_purchase' && (
                <>
                  <DetailRow
                    label="Test Title"
                    value={String(ent.row.testTitle ?? '—')}
                  />
                  <DetailRow
                    label="Test ID"
                    value={String(ent.row.testId ?? '—')}
                    mono
                  />
                  <DetailRow
                    label="Active"
                    value={ent.row.isActive ? 'Yes' : 'No (revoked)'}
                  />
                </>
              )}
              {(ent.kind === 'subject_pack_purchase' ||
                ent.kind === 'exam_pack_purchase') && (
                <>
                  <DetailRow
                    label="Pack Name"
                    value={String(ent.row.packName ?? '—')}
                  />
                  <DetailRow
                    label="Product ID"
                    value={String(ent.row.productId ?? '—')}
                    mono
                  />
                  <DetailRow
                    label={ent.kind === 'subject_pack_purchase' ? 'Subject ID' : 'Category ID'}
                    value={String(
                      ent.kind === 'subject_pack_purchase'
                        ? (ent.row.subjectId ?? '—')
                        : (ent.row.categoryId ?? '—'),
                    )}
                    mono
                  />
                  <DetailRow
                    label="Active"
                    value={ent.row.isActive ? 'Yes' : 'No (revoked)'}
                  />
                </>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              No entitlement row found for this payment.
            </p>
          )}
        </DetailSection>
      </div>

      {/* Transactions list */}
      <DetailSection title="Transactions">
        {p.transactions.length === 0 ? (
          <p className="text-slate-500 text-sm">No transactions recorded.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400 text-right">Amount</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Razorpay Ref</TableHead>
                <TableHead className="text-slate-400">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {p.transactions.map((tx) => (
                <TableRow key={tx.id} className="border-slate-800">
                  <TableCell className="text-xs text-slate-300">
                    {formatDate(tx.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        tx.type === 'REFUND'
                          ? 'text-xs bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'text-xs bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-100">
                    ₹{paiseToRupeesStr(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        tx.status === 'SUCCESS'
                          ? 'text-emerald-300 text-xs'
                          : tx.status === 'PENDING'
                            ? 'text-sky-300 text-xs'
                            : 'text-red-300 text-xs'
                      }
                    >
                      {tx.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-300">
                    {tx.razorpayRefundId ?? tx.razorpayPaymentId ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {tx.description ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DetailSection>

      {/* Payment logs timeline */}
      <DetailSection title="Audit Log">
        {p.paymentLogs.length === 0 ? (
          <p className="text-slate-500 text-sm">No log entries.</p>
        ) : (
          <ol className="relative border-l border-slate-800 pl-4 space-y-3">
            {p.paymentLogs.map((log) => {
              const tone =
                log.level === 'ERROR'
                  ? 'text-red-300 bg-red-500/10 border-red-500/30'
                  : log.level === 'WARN'
                    ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                    : log.level === 'AUDIT'
                      ? 'text-purple-300 bg-purple-500/10 border-purple-500/30'
                      : 'text-slate-300 bg-slate-500/10 border-slate-500/30';
              return (
                <li key={log.id} className="relative">
                  <span
                    className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border ${tone}`}
                  />
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${tone}`}
                    >
                      {log.level}
                    </Badge>
                    <span className="text-xs font-mono text-emerald-300">
                      {log.event}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mt-0.5">{log.message}</p>
                  {log.payload && log.payload !== '{}' && (
                    <pre className="mt-1 text-[10px] text-slate-500 bg-slate-950/60 border border-slate-800 rounded p-2 overflow-x-auto">
                      {(() => {
                        try {
                          return JSON.stringify(JSON.parse(log.payload), null, 2);
                        } catch {
                          return log.payload;
                        }
                      })()}
                    </pre>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </DetailSection>

      <DialogFooter>
        <p className="text-[11px] text-slate-500 text-left w-full">
          Payment records are immutable Razorpay data. Refunds are issued via
          the Razorpay API and recorded as new Transactions.
        </p>
      </DialogFooter>
    </div>
  );
}

// ---- Small presentational helpers -----------------------------------------
function DetailSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span
        className={`text-xs text-right ${tone ?? 'text-slate-200'} ${mono ? 'font-mono break-all' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
