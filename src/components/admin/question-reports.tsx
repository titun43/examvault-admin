'use client';

// =============================================================================
// ExamVault Admin — Question Reports
// Shows all user-reported questions from the Flutter app in real-time.
// Admin can view details, filter by status/reason, and update status.
// Reads/writes the `questionReports` Firestore collection.
// =============================================================================

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Flag,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Clock,
  Filter,
  Loader2,
  MessageSquare,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';

// ---- Types ----
type ReportStatus = 'open' | 'resolved' | 'dismissed';

interface QuestionReport {
  id: string;
  testId: string;
  testTitle: string;
  questionId: string;
  questionText: string;
  reason: string;
  comment: string | null;
  userId: string | null;
  status: ReportStatus;
  reportedAt: Timestamp | null;
}

// ---- Helpers ----
function tsToDate(ts: Timestamp | null | undefined): Date | null {
  if (!ts) return null;
  try {
    if (typeof (ts as any).toDate === 'function') return (ts as any).toDate();
    if (ts instanceof Date) return ts;
    if (typeof ts === 'string') return new Date(ts);
  } catch {
    /* ignore */
  }
  return null;
}

function timeAgo(d: Date | null): string {
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function formatFullDate(d: Date | null): string {
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const REASON_COLORS: Record<string, string> = {
  'Wrong Answer Key': 'bg-red-500/15 text-red-300 border-red-500/30',
  'Wrong / Confusing Question': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Typo or Formatting Issue': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  'Duplicate Question': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Other': 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const STATUS_CONFIG: Record<
  ReportStatus,
  { color: string; icon: React.ElementType; label: string }
> = {
  open: {
    color: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    icon: AlertTriangle,
    label: 'Open',
  },
  resolved: {
    color: 'bg-green-500/15 text-green-300 border-green-500/30',
    icon: CheckCircle2,
    label: 'Resolved',
  },
  dismissed: {
    color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    icon: XCircle,
    label: 'Dismissed',
  },
};

const REASONS = [
  'Wrong Answer Key',
  'Wrong / Confusing Question',
  'Typo or Formatting Issue',
  'Duplicate Question',
  'Other',
];

export default function QuestionReports() {
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<QuestionReport | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Subscribe to questionReports in real-time
  useEffect(() => {
    const q = query(
      collection(db, 'questionReports'),
      orderBy('reportedAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: QuestionReport[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            testId: data.testId ?? '',
            testTitle: data.testTitle ?? 'Unknown Test',
            questionId: data.questionId ?? '',
            questionText: data.questionText ?? '',
            reason: data.reason ?? 'Other',
            comment: data.comment ?? null,
            userId: data.userId ?? null,
            status:
              data.status === 'resolved'
                ? 'resolved'
                : data.status === 'dismissed'
                  ? 'dismissed'
                  : 'open',
            reportedAt: data.reportedAt ?? null,
          };
        });
        setReports(list);
        setLoading(false);
      },
      (err) => {
        console.error('questionReports snapshot error', err);
        toast.error('Could not load question reports.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Update report status
  const updateStatus = async (reportId: string, newStatus: ReportStatus) => {
    setUpdating(reportId);
    try {
      await updateDoc(doc(db, 'questionReports', reportId), {
        status: newStatus,
      });
      const labels: Record<ReportStatus, string> = {
        open: 'Reopened',
        resolved: 'Marked as resolved',
        dismissed: 'Dismissed',
      };
      toast.success(`${labels[newStatus]}.`);
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not update report status.');
    } finally {
      setUpdating(null);
    }
  };

  // Filtered reports
  const filtered = reports.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchReason = reasonFilter === 'all' || r.reason === reasonFilter;
    return matchStatus && matchReason;
  });

  // Counts
  const openCount = reports.filter((r) => r.status === 'open').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const dismissedCount = reports.filter((r) => r.status === 'dismissed').length;

  // Unique reasons present in data
  const activeReasons = [...new Set(reports.map((r) => r.reason))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flag className="w-6 h-6 text-orange-400" />
            Question Reports
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Review and manage question reports from users. Real-time sync with the user app.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/30">
            {openCount} Open
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30">
            {resolvedCount} Resolved
          </Badge>
          <Badge variant="outline" className="bg-slate-500/10 text-slate-300 border-slate-500/30">
            {dismissedCount} Dismissed
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <Flag className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{reports.length}</p>
                <p className="text-xs text-slate-500">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-300">{openCount}</p>
                <p className="text-xs text-slate-500">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-300">{resolvedCount}</p>
                <p className="text-xs text-slate-500">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-300">{dismissedCount}</p>
                <p className="text-xs text-slate-500">Dismissed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Row */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400 font-medium">Filters:</span>

            {/* Status filter */}
            <div className="flex gap-1.5">
              {(['all', 'open', 'resolved', 'dismissed'] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={statusFilter === f ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(f)}
                  className={
                    statusFilter === f
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-700 hidden sm:block" />

            {/* Reason filter */}
            <div className="flex gap-1.5 flex-wrap">
              <Button
                size="sm"
                variant={reasonFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setReasonFilter('all')}
                className={
                  reasonFilter === 'all'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }
              >
                All Reasons
              </Button>
              {activeReasons.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={reasonFilter === r ? 'default' : 'outline'}
                  onClick={() => setReasonFilter(r)}
                  className={
                    reasonFilter === r
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-900 border-slate-800">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-5 w-48 bg-slate-800" />
                    <Skeleton className="h-6 w-20 bg-slate-800" />
                  </div>
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-4 w-3/4 bg-slate-800" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24 bg-slate-800" />
                    <Skeleton className="h-4 w-20 bg-slate-800" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-12 text-center">
              <Flag className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400 text-sm font-medium">
                {statusFilter !== 'all' || reasonFilter !== 'all'
                  ? 'No reports match the selected filters.'
                  : 'No question reports yet.'}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Reports will appear here when users flag questions during tests.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((report) => {
            const statusCfg = STATUS_CONFIG[report.status];
            const StatusIcon = statusCfg.icon;
            const reasonColor = REASON_COLORS[report.reason] || REASON_COLORS['Other'];
            const d = tsToDate(report.reportedAt);

            return (
              <Card
                key={report.id}
                className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Left: Report content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={reasonColor}>
                          {report.reason}
                        </Badge>
                        <Badge variant="outline" className={statusCfg.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusCfg.label}
                        </Badge>
                      </div>

                      {/* Question text */}
                      <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">
                        {report.questionText || 'No question text'}
                      </p>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {report.testTitle}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(d)}
                        </span>
                        {report.userId && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {report.userId.slice(0, 8)}...
                          </span>
                        )}
                        {report.comment && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <MessageSquare className="w-3 h-3" />
                            Has comment
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Action buttons */}
                    <div className="flex sm:flex-col gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {report.status !== 'resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(report.id, 'resolved')}
                          disabled={updating === report.id}
                          className="border-green-500/30 text-green-300 hover:bg-green-500/10 text-xs h-8"
                        >
                          {updating === report.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          <span className="ml-1">Resolve</span>
                        </Button>
                      )}
                      {report.status !== 'dismissed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(report.id, 'dismissed')}
                          disabled={updating === report.id}
                          className="border-slate-500/30 text-slate-300 hover:bg-slate-500/10 text-xs h-8"
                        >
                          {updating === report.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span className="ml-1">Dismiss</span>
                        </Button>
                      )}
                      {report.status !== 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(report.id, 'open')}
                          disabled={updating === report.id}
                          className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 text-xs h-8"
                        >
                          {updating === report.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          <span className="ml-1">Reopen</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Flag className="w-5 h-5 text-orange-400" />
                  Question Report Details
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Full details of the reported question
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Status & Reason */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={REASON_COLORS[selectedReport.reason] || REASON_COLORS['Other']}>
                    {selectedReport.reason}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={STATUS_CONFIG[selectedReport.status].color}
                  >
                    {STATUS_CONFIG[selectedReport.status].label}
                  </Badge>
                </div>

                {/* Test Info */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Test
                  </p>
                  <p className="text-sm text-slate-200">{selectedReport.testTitle}</p>
                </div>

                {/* Question Text */}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Question
                  </p>
                  <div className="bg-slate-800/60 rounded-lg p-3">
                    <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                      {selectedReport.questionText || 'No question text available'}
                    </p>
                  </div>
                </div>

                {/* Comment */}
                {selectedReport.comment && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                      User Comment
                    </p>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                      <p className="text-sm text-slate-200 whitespace-pre-wrap italic">
                        &quot;{selectedReport.comment}&quot;
                      </p>
                    </div>
                  </div>
                )}

                {/* IDs & Meta */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Test ID</p>
                    <p className="text-slate-300 font-mono mt-0.5 break-all">
                      {selectedReport.testId}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Question ID</p>
                    <p className="text-slate-300 font-mono mt-0.5 break-all">
                      {selectedReport.questionId}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">User ID</p>
                    <p className="text-slate-300 font-mono mt-0.5 break-all">
                      {selectedReport.userId || 'Guest (not signed in)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Reported At</p>
                    <p className="text-slate-300 mt-0.5">
                      {formatFullDate(tsToDate(selectedReport.reportedAt))}
                    </p>
                  </div>
                </div>

                {/* Actions in dialog */}
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  {selectedReport.status !== 'resolved' && (
                    <Button
                      onClick={() => updateStatus(selectedReport.id, 'resolved')}
                      disabled={updating === selectedReport.id}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      {updating === selectedReport.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span className="ml-1.5">Resolve</span>
                    </Button>
                  )}
                  {selectedReport.status !== 'dismissed' && (
                    <Button
                      onClick={() => updateStatus(selectedReport.id, 'dismissed')}
                      disabled={updating === selectedReport.id}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 flex-1"
                    >
                      {updating === selectedReport.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="ml-1.5">Dismiss</span>
                    </Button>
                  )}
                  {selectedReport.status !== 'open' && (
                    <Button
                      onClick={() => updateStatus(selectedReport.id, 'open')}
                      disabled={updating === selectedReport.id}
                      variant="outline"
                      className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 flex-1"
                    >
                      {updating === selectedReport.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      <span className="ml-1.5">Reopen</span>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

