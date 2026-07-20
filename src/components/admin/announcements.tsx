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
import { uploadImage, toDateTimeInputValue, formatDateTime, timestampToDate, deleteItems, deleteDocWithFiles, deleteItemsWithFiles } from '@/lib/admin-firestore';
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
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Newspaper,
  Image as ImageIcon,
  X,
  Pin,
  Eye,
  EyeOff,
  Link2,
  ArrowRight,
  Clock,
  Layers,
  Download,
  FileSpreadsheet,
  Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadJson, downloadCsv, parseCsv } from '@/lib/download';

type AnnouncementType = 'info' | 'success' | 'warning' | 'error' | 'promo';

type ButtonType = 'external' | 'inApp';

type InAppScreen =
  | 'testSeries'
  | 'dailyQuiz'
  | 'upcomingExams'
  | 'currentAffairs'
  | 'announcements'
  | 'leaderboard'
  | 'premium'
  | 'category'
  | 'subject'
  | 'test';

// Firestore shape for an announcement action button (matches Flutter `lib/models/action_button.dart`).
interface ActionButton {
  label: string;
  type: ButtonType;
  url: string | null;
  screen: string | null;
  params: Record<string, any> | null;
}

// Flat form-state shape for a button being edited (strings are easier to bind to inputs).
interface AnnouncementButtonFormState {
  label: string;
  type: ButtonType;
  url: string;
  screen: string;
  params: Record<string, string>;
}

interface Announcement {
  id: string;
  title: string;
  message?: string;
  type?: AnnouncementType;
  imageUrl?: string;
  link?: string;
  linkLabel?: string;
  primaryButton?: ActionButton | null;
  secondaryButton?: ActionButton | null;
  isPinned?: boolean;
  isPublished?: boolean;
  order?: number;
  expiresAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

const TYPE_STYLES: Record<AnnouncementType, { badge: string; dot: string; label: string }> = {
  info: { badge: 'bg-blue-950/60 text-blue-400 border-blue-800/50', dot: 'bg-blue-400', label: 'Info' },
  success: { badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50', dot: 'bg-emerald-400', label: 'Success' },
  warning: { badge: 'bg-amber-950/60 text-amber-400 border-amber-800/50', dot: 'bg-amber-400', label: 'Warning' },
  error: { badge: 'bg-red-950/60 text-red-400 border-red-800/50', dot: 'bg-red-400', label: 'Error' },
  promo: { badge: 'bg-purple-950/60 text-purple-400 border-purple-800/50', dot: 'bg-purple-400', label: 'Promo' },
};

// In-app screen options shown in the button editor's Screen dropdown.
// paramKey/paramLabel are only set for screens that need a parameter.
const IN_APP_SCREENS: {
  value: InAppScreen;
  label: string;
  paramKey?: 'categoryId' | 'subjectId' | 'testId';
  paramLabel?: string;
}[] = [
  { value: 'testSeries', label: 'Test Series' },
  { value: 'dailyQuiz', label: 'Daily Quiz' },
  { value: 'upcomingExams', label: 'Upcoming Exams' },
  { value: 'currentAffairs', label: 'Current Affairs' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'leaderboard', label: 'Leaderboard (Ranks)' },
  { value: 'premium', label: 'Premium / Upgrade' },
  { value: 'category', label: 'Specific Category', paramKey: 'categoryId', paramLabel: 'Category ID' },
  { value: 'subject', label: "Specific Subject's Tests", paramKey: 'subjectId', paramLabel: 'Subject ID' },
  { value: 'test', label: 'Specific Test', paramKey: 'testId', paramLabel: 'Test ID' },
];

const emptyButtonForm: AnnouncementButtonFormState = {
  label: '',
  type: 'external',
  url: '',
  screen: '',
  params: {},
};

// Convert a stored ActionButton (Firestore shape) → flat form-state shape.
const buttonToFormState = (b?: ActionButton | null): AnnouncementButtonFormState => {
  if (!b) return { ...emptyButtonForm, params: {} };
  const storedParams: Record<string, any> =
    b.params && typeof b.params === 'object' ? { ...b.params } : {};
  const params: Record<string, string> = {};
  Object.keys(storedParams).forEach((k) => {
    const v = storedParams[k];
    params[k] = v == null ? '' : String(v);
  });
  return {
    label: b.label || '',
    type: b.type === 'inApp' ? 'inApp' : 'external',
    url: b.url || '',
    screen: b.screen || '',
    params,
  };
};

// Build an ActionButton Firestore map from form state. Returns null if label is empty (= no button).
const buildButtonPayload = (b: AnnouncementButtonFormState): ActionButton | null => {
  const label = b.label.trim();
  if (!label) return null;
  if (b.type === 'external') {
    return { label, type: 'external', url: b.url.trim(), screen: null, params: null };
  }
  // inApp
  const screen = b.screen || '';
  let params: Record<string, any> | null = null;
  const meta = IN_APP_SCREENS.find((s) => s.value === screen);
  if (meta?.paramKey) {
    const v = (b.params[meta.paramKey] || '').trim();
    params = v ? { [meta.paramKey]: v } : null;
  }
  return { label, type: 'inApp', url: null, screen: screen || null, params };
};

const emptyForm = {
  title: '',
  message: '',
  type: 'info' as AnnouncementType,
  imageUrl: '',
  link: '',
  linkLabel: '',
  primaryButton: { ...emptyButtonForm, params: {} } as AnnouncementButtonFormState,
  secondaryButton: { ...emptyButtonForm, params: {} } as AnnouncementButtonFormState,
  isPinned: false,
  isPublished: true,
  order: 0,
  expiresAt: '',
};

// Reusable single-button editor used for both Button 1 (primary) and Button 2 (secondary).
function ButtonEditor({
  title,
  button,
  onChange,
  onClear,
}: {
  title: string;
  button: AnnouncementButtonFormState;
  onChange: (next: AnnouncementButtonFormState) => void;
  onClear: () => void;
}) {
  const isExternal = button.type === 'external';
  const screenMeta = IN_APP_SCREENS.find((s) => s.value === button.screen);
  const paramKey = screenMeta?.paramKey;
  const paramLabel = screenMeta?.paramLabel;
  const needsParam = !!paramKey && !!paramLabel;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-slate-300 font-medium">{title}</Label>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-slate-400 hover:bg-slate-800"
          onClick={onClear}
        >
          <X className="w-3.5 h-3.5 mr-1" /> Clear
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Label</Label>
          <Input
            value={button.label}
            onChange={(e) => onChange({ ...button, label: e.target.value })}
            placeholder="e.g. Apply Now"
            className="bg-slate-800 border-slate-700"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Action Type</Label>
          <Select
            value={button.type}
            onValueChange={(v) => onChange({ ...button, type: v as ButtonType })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="external">External Link</SelectItem>
              <SelectItem value="inApp">In-App Screen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isExternal ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">URL</Label>
          <Input
            value={button.url}
            onChange={(e) => onChange({ ...button, url: e.target.value })}
            placeholder="https://..."
            className="bg-slate-800 border-slate-700"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Screen</Label>
            <Select
              value={button.screen || undefined}
              onValueChange={(v) => onChange({ ...button, screen: v })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select a screen..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {IN_APP_SCREENS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {needsParam && paramKey && paramLabel ? (
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">{paramLabel}</Label>
              <Input
                value={button.params[paramKey] || ''}
                onChange={(e) =>
                  onChange({
                    ...button,
                    params: { ...button.params, [paramKey]: e.target.value },
                  })
                }
                placeholder={`Enter ${paramLabel.toLowerCase()}...`}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No parameters needed.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
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

  // Bilingual template: English (primary) + Assamese (As suffix). Optional.
  const BULK_SAMPLE = '[{"title":"Welcome!","titleAs":"স্বাগতম!","message":"Welcome to ExamVault","messageAs":"এক্সামভল্টলৈ স্বাগতম","type":"info","imageUrl":"https://example.com/welcome-banner.png","isPinned":false,"isPublished":true,"order":1},{"title":"New Tests Added","titleAs":"নতুন পৰীক্ষা যোগ কৰা হ’ল","message":"Check out new mock tests","messageAs":"নতুন মক পৰীক্ষাবোৰ চাওক","type":"success","imageUrl":"https://example.com/new-tests-banner.png","isPinned":true,"isPublished":true,"order":2}]';

  const CSV_HEADERS = ['title', 'titleAs', 'message', 'messageAs', 'type', 'imageUrl', 'link', 'linkLabel', 'order', 'isPinned', 'isPublished'];
  const CSV_SAMPLE_ROWS: (string | number | boolean)[][] = [
    ['Welcome!', 'স্বাগতম!', 'Welcome to ExamVault', 'এক্সামভল্টলৈ স্বাগতম', 'info', 'https://example.com/welcome-banner.png', '', '', 1, false, true],
    ['New Tests Added', 'নতুন পৰীক্ষা যোগ কৰা হ’ল', 'Check out new mock tests', 'নতুন মক পৰীক্ষাবোৰ চাওক', 'success', 'https://example.com/new-tests-banner.png', '', '', 2, true, true],
  ];

  const handleBulkImport = async () => {
    let parsed: any;
    const text = bulkText.trim();
    if (!text) {
      toast.error('Please paste JSON or CSV data first');
      return;
    }
    // Try JSON first
    let isCsv = false;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Not JSON — try CSV
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
            // Cast known fields
            if ('order' in obj) obj.order = Number(obj.order) || 0;
            if ('isPinned' in obj) obj.isPinned = String(obj.isPinned).toLowerCase() === 'true';
            if ('isPublished' in obj) obj.isPublished = String(obj.isPublished).toLowerCase() === 'true';
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
      const colRef = collection(db, 'announcements');
      parsed.forEach((item) => {
        const ref = doc(colRef);
        const payload = { ...item };
        if (typeof payload.expiresAt === 'string') payload.expiresAt = new Date(payload.expiresAt);
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
    const unsub = onSnapshot(
      collection(db, 'announcements'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Announcement)
          .sort((a, b) => {
            // Pinned first, then by order, then by createdAt desc
            if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
            const ordA = a.order || 0;
            const ordB = b.order || 0;
            if (ordA !== ordB) return ordA - ordB;
            const tA = a.createdAt ? timestampToDate(a.createdAt)?.getTime() || 0 : 0;
            const tB = b.createdAt ? timestampToDate(b.createdAt)?.getTime() || 0 : 0;
            return tB - tA;
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

  const openEdit = (item: Announcement) => {
    const hasPrimary = item.primaryButton !== undefined && item.primaryButton !== null;
    const hasSecondary = item.secondaryButton !== undefined && item.secondaryButton !== null;
    // Backward-compat: if no primaryButton map is set but a legacy link exists,
    // prefill Button 1 from the legacy link/linkLabel so editing an old announcement
    // surfaces the existing link as a primary external button.
    const primaryForm: AnnouncementButtonFormState = hasPrimary
      ? buttonToFormState(item.primaryButton)
      : item.link
        ? {
            label: item.linkLabel || '',
            type: 'external',
            url: item.link,
            screen: '',
            params: {},
          }
        : { ...emptyButtonForm, params: {} };
    setForm({
      title: item.title || '',
      message: item.message || '',
      type: (item.type as AnnouncementType) || 'info',
      imageUrl: item.imageUrl || '',
      link: item.link || '',
      linkLabel: item.linkLabel || '',
      primaryButton: primaryForm,
      secondaryButton: hasSecondary
        ? buttonToFormState(item.secondaryButton)
        : { ...emptyButtonForm, params: {} },
      isPinned: !!item.isPinned,
      isPublished: item.isPublished !== false,
      order: item.order || 0,
      expiresAt: item.expiresAt ? toDateTimeInputValue(item.expiresAt) : '',
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage('announcement_images', file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.message.trim()) {
      toast.error('Message is required');
      return;
    }
    setSaving(true);
    try {
      const primaryPayload = buildButtonPayload(form.primaryButton);
      const secondaryPayload = buildButtonPayload(form.secondaryButton);
      // Mirror the primary external button into legacy `link` + `linkLabel` so older
      // app builds (which fall back to those fields when no `primaryButton` map exists)
      // keep working. If primary is empty or in-app, clear the legacy fields.
      let legacyLink: string | null = null;
      let legacyLabel: string | null = null;
      if (primaryPayload && primaryPayload.type === 'external') {
        legacyLink = primaryPayload.url || null;
        legacyLabel = primaryPayload.label || null;
      }
      const data: Record<string, any> = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        imageUrl: form.imageUrl || null,
        link: legacyLink,
        linkLabel: legacyLabel,
        primaryButton: primaryPayload,
        secondaryButton: secondaryPayload,
        isPinned: !!form.isPinned,
        isPublished: !!form.isPublished,
        order: Number(form.order) || 0,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      };
      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        toast.success('Announcement updated');
      } else {
        await addDoc(collection(db, 'announcements'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Announcement added');
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
      await deleteDocWithFiles('announcements', deleteId, ['image']);
      toast.success('Announcement deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((a) => a.id);
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
      await deleteItemsWithFiles('announcements', ids, ['image']);
      toast.success(`${ids.length} announcement${ids.length === 1 ? '' : 's'} deleted`);
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
            <Newspaper className="w-5 h-5 text-emerald-400" /> Announcements
          </h3>
          <p className="text-slate-500 text-sm">Notifications & updates shown to users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add Announcement
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
            <p className="text-slate-500">No announcements yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="flex items-center gap-3 flex-wrap rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all announcements"
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
            const type = (item.type || 'info') as AnnouncementType;
            const style = TYPE_STYLES[type];
            const isExpired =
              item.expiresAt &&
              timestampToDate(item.expiresAt) &&
              timestampToDate(item.expiresAt)!.getTime() < Date.now();
            const isSelected = selectedIds.has(item.id);
            return (
              <Card
                key={item.id}
                className={`hover:border-slate-700 transition-colors group relative ${isSelected ? 'border-red-800 bg-red-950/20' : 'bg-slate-900 border-slate-800'}`}
              >
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelectOne(item.id)}
                    aria-label={`Select ${item.title}`}
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                        <Newspaper className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-medium truncate">{item.title}</h4>
                        {item.isPinned && (
                          <Badge variant="outline" className="bg-amber-950/40 text-amber-400 border-amber-800/50 shrink-0">
                            <Pin className="w-3 h-3 mr-1" /> Pinned
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <Badge variant="outline" className={style.badge}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1`} />
                          {style.label}
                        </Badge>
                        {item.isPublished ? (
                          <Badge variant="outline" className="bg-emerald-950/40 text-emerald-400 border-emerald-800/50">
                            <Eye className="w-3 h-3 mr-1" /> Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                            <EyeOff className="w-3 h-3 mr-1" /> Draft
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="outline" className="bg-red-950/40 text-red-400 border-red-800/50">
                            <Clock className="w-3 h-3 mr-1" /> Expired
                          </Badge>
                        )}
                        {item.primaryButton && (
                          <Badge
                            variant="outline"
                            className="bg-slate-800 text-slate-300 border-slate-700 max-w-[160px]"
                            title={item.primaryButton.label}
                          >
                            {item.primaryButton.type === 'external' ? (
                              <Link2 className="w-3 h-3 mr-1 shrink-0" />
                            ) : (
                              <ArrowRight className="w-3 h-3 mr-1 shrink-0" />
                            )}
                            <span className="truncate">
                              {item.primaryButton.label ||
                                (item.primaryButton.type === 'external' ? 'Link' : 'Screen')}
                            </span>
                          </Badge>
                        )}
                        {item.secondaryButton && (
                          <Badge
                            variant="outline"
                            className="bg-slate-800/60 text-slate-400 border-slate-700 max-w-[160px]"
                            title={item.secondaryButton.label}
                          >
                            {item.secondaryButton.type === 'external' ? (
                              <Link2 className="w-3 h-3 mr-1 shrink-0" />
                            ) : (
                              <ArrowRight className="w-3 h-3 mr-1 shrink-0" />
                            )}
                            <span className="truncate">
                              {item.secondaryButton.label ||
                                (item.secondaryButton.type === 'external' ? 'Link' : 'Screen')}
                            </span>
                          </Badge>
                        )}
                        {!item.primaryButton && !item.secondaryButton && item.link && (
                          <Badge
                            variant="outline"
                            className="bg-slate-800 text-slate-400 border-slate-700"
                          >
                            <Link2 className="w-3 h-3 mr-1" /> Link
                          </Badge>
                        )}
                      </div>
                      {item.expiresAt && (
                        <p className="text-slate-600 text-[10px] mt-1.5">
                          Expires: {formatDateTime(item.expiresAt)}
                        </p>
                      )}
                    </div>
                  </div>
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
            <DialogTitle>{editingId ? 'Edit Announcement' : 'Add Announcement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. New test series added!"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Announcement body..."
                className="bg-slate-800 border-slate-700"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as AnnouncementType })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  <div className="relative">
                    <img src={form.imageUrl} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
                    <button
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="border-slate-700 text-slate-300"
                >
                  {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-1" />}
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Action Buttons</Label>
              <p className="text-xs text-slate-500 -mt-1">
                Up to 2 CTA buttons. External links open in the browser; in-app screens navigate inside the app.
              </p>
              <ButtonEditor
                title="Button 1 (Primary)"
                button={form.primaryButton}
                onChange={(next) => setForm({ ...form, primaryButton: next })}
                onClear={() =>
                  setForm({ ...form, primaryButton: { ...emptyButtonForm, params: {} } })
                }
              />
              <ButtonEditor
                title="Button 2 (Secondary)"
                button={form.secondaryButton}
                onChange={(next) => setForm({ ...form, secondaryButton: next })}
                onClear={() =>
                  setForm({ ...form, secondaryButton: { ...emptyButtonForm, params: {} } })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Expires At</Label>
                <Input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPinned}
                  onCheckedChange={(v) => setForm({ ...form, isPinned: v })}
                />
                <Label className="cursor-pointer">Pinned at top</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
                />
                <Label className="cursor-pointer">Published</Label>
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

      {/* Bulk Add Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Add Announcements</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Paste a JSON array of announcement objects below, or paste CSV rows (first row = column headers).
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadJson('announcements-template', JSON.parse(BULK_SAMPLE))}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv('announcements-template', CSV_HEADERS, CSV_SAMPLE_ROWS)}
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
              placeholder='[{"title":"...","titleAs":"...","message":"...","messageAs":"...","type":"info","isPinned":false}]'
            />
            <div className="rounded-md border border-amber-800/40 bg-amber-950/20 px-3 py-2">
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 mb-1">
                <Languages className="w-3.5 h-3.5" /> Bilingual support (English + Assamese)
              </p>
              <p className="text-xs text-amber-200/70">
                Add <code className="text-amber-300">titleAs</code> and <code className="text-amber-300">messageAs</code> alongside the English fields to show announcements in both languages. The <code className="text-amber-300">*As</code> fields are optional.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">title</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">titleAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">message</span> (English),{' '}
              <span className="text-slate-400 text-amber-300">messageAs</span> (Assamese — optional),{' '}
              <span className="text-slate-400">type</span> (info | success | warning | error | promo),{' '}
              <span className="text-slate-400">isPinned</span> (boolean),{' '}
              <span className="text-slate-400">isPublished</span> (boolean),{' '}
              <span className="text-slate-400">order</span> (number)
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
            <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The announcement will be removed from all user apps immediately.
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} announcement{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} announcement{selectedIds.size === 1 ? '' : 's'} from Firestore.
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
              Delete {selectedIds.size} announcement{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
