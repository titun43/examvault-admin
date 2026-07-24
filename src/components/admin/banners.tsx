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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage, toDateTimeInputValue, formatDateTime, deleteItems, deleteDocWithFiles, deleteItemsWithFiles } from '@/lib/admin-firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Image as ImageIcon,
  X,
  Link2,
  ArrowRight,
  Calendar,
  ImageUp,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

// ---- Banner action-button model (matches Flutter lib/models/action_button.dart) ----
// Each banner can have up to TWO CTA buttons. Each button is either an
// "external" link (opens a URL in the browser) or an "inApp" navigation
// (navigates inside the app to a named screen, optionally with params).
interface ActionButton {
  label: string;
  type: 'external' | 'inApp';
  url: string | null;     // for type='external'
  screen: string | null;  // for type='inApp' — one of IN_APP_SCREENS values
  params: Record<string, any> | null; // for type='inApp' — e.g. {testId: 'xxx'}
}

// Supported in-app screens (kept in sync with the Flutter ActionButton model).
const IN_APP_SCREENS: { value: string; label: string; paramKey?: string; paramLabel?: string }[] = [
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

// Form-state shape for a single button editor (flat, editable strings).
interface BannerButtonForm {
  label: string;
  type: 'external' | 'inApp';
  url: string;
  screen: string;
  paramValue: string; // ID entered for category/subject/test screens
}

interface BannerFormState {
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;        // legacy, kept for backward-compat (mirrored from primaryButton on save)
  linkLabel: string;   // legacy, kept for backward-compat (mirrored from primaryButton on save)
  primaryButton: BannerButtonForm;
  secondaryButton: BannerButtonForm;
  order: number;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

const emptyButtonForm: BannerButtonForm = {
  label: '',
  type: 'external',
  url: '',
  screen: '',
  paramValue: '',
};

function extractParamValue(
  params: Record<string, any> | null | undefined,
  screen: string | null | undefined,
): string {
  if (!params || !screen) return '';
  const def = IN_APP_SCREENS.find((s) => s.value === screen);
  if (!def?.paramKey) return '';
  return params[def.paramKey] != null ? String(params[def.paramKey]) : '';
}

function buttonFormFromAction(btn: ActionButton | null | undefined): BannerButtonForm {
  if (!btn) return { ...emptyButtonForm };
  return {
    label: btn.label || '',
    type: btn.type === 'inApp' ? 'inApp' : 'external',
    url: btn.url || '',
    screen: btn.screen || '',
    paramValue: extractParamValue(btn.params, btn.screen),
  };
}

function buildButtonFirestoreMap(btn: BannerButtonForm): ActionButton | null {
  const label = btn.label.trim();
  if (!label) return null;
  if (btn.type === 'inApp') {
    const screen = btn.screen;
    const def = IN_APP_SCREENS.find((s) => s.value === screen);
    let params: Record<string, any> | null = null;
    const paramValue = btn.paramValue.trim();
    if (def?.paramKey && paramValue) {
      params = { [def.paramKey]: paramValue };
    }
    return {
      label,
      type: 'inApp',
      url: null,
      screen: screen || null,
      params,
    };
  }
  return {
    label,
    type: 'external',
    url: btn.url.trim() || null,
    screen: null,
    params: null,
  };
}

function ButtonEditor({
  title,
  button,
  onChange,
  onClear,
}: {
  title: string;
  button: BannerButtonForm;
  onChange: (next: BannerButtonForm) => void;
  onClear: () => void;
}) {
  const screenDef = IN_APP_SCREENS.find((s) => s.value === button.screen);
  const needsParam = button.type === 'inApp' && !!screenDef?.paramKey;
  const paramLabel = screenDef?.paramLabel || 'ID';

  return (
    <div className="rounded-lg border border-slate-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-slate-200 font-medium">{title}</Label>
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
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={button.label}
            onChange={(e) => onChange({ ...button, label: e.target.value })}
            placeholder="e.g. Apply Now"
            className="bg-slate-800 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label>Action Type</Label>
          <Select
            value={button.type}
            onValueChange={(v) => onChange({ ...button, type: v as 'external' | 'inApp' })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="external">External Link</SelectItem>
              <SelectItem value="inApp">In-App Screen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {button.type === 'external' ? (
        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={button.url}
            onChange={(e) => onChange({ ...button, url: e.target.value })}
            placeholder="https://..."
            className="bg-slate-800 border-slate-700"
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Screen</Label>
            <Select
              value={button.screen}
              onValueChange={(v) => onChange({ ...button, screen: v, paramValue: '' })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 w-full">
                <SelectValue placeholder="Select a screen" />
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
          {needsParam ? (
            <div className="space-y-2">
              <Label>{paramLabel}</Label>
              <Input
                value={button.paramValue}
                onChange={(e) => onChange({ ...button, paramValue: e.target.value })}
                placeholder={`Enter ${paramLabel.toLowerCase()}`}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500">No parameters needed</p>
          )}
        </>
      )}
    </div>
  );
}

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  link?: string;
  linkLabel?: string;
  primaryButton?: ActionButton | null;
  secondaryButton?: ActionButton | null;
  order?: number;
  isActive?: boolean;
  startsAt?: any;
  endsAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

const emptyForm: BannerFormState = {
  title: '',
  subtitle: '',
  imageUrl: '',
  link: '',
  linkLabel: '',
  primaryButton: { ...emptyButtonForm },
  secondaryButton: { ...emptyButtonForm },
  order: 0,
  isActive: true,
  startsAt: '',
  endsAt: '',
};

export default function Banners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'banners'),
      (snap) => {
        setError(null);
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Banner)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error('[banners] onSnapshot error:', err);
        setError(err?.message || 'Failed to load banners. Check Firestore permissions and network connection.');
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (item: Banner) => {
    // Read new primaryButton/secondaryButton into form state. If primaryButton
    // is absent but a legacy link exists, prefill the primary editor from the
    // legacy link/linkLabel so editing an old banner shows the existing link
    // as Button 1.
    const primaryButton: BannerButtonForm = item.primaryButton
      ? buttonFormFromAction(item.primaryButton)
      : item.link
        ? { ...emptyButtonForm, label: item.linkLabel || '', type: 'external', url: item.link }
        : { ...emptyButtonForm };
    const secondaryButton: BannerButtonForm = item.secondaryButton
      ? buttonFormFromAction(item.secondaryButton)
      : { ...emptyButtonForm };
    setForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      imageUrl: item.imageUrl || '',
      link: item.link || '',
      linkLabel: item.linkLabel || '',
      primaryButton,
      secondaryButton,
      order: item.order || 0,
      isActive: item.isActive !== false,
      startsAt: item.startsAt ? toDateTimeInputValue(item.startsAt) : '',
      endsAt: item.endsAt ? toDateTimeInputValue(item.endsAt) : '',
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage('banner_images', file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Banner image uploaded');
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
    if (!form.imageUrl) {
      toast.error('Banner image is required');
      return;
    }
    setSaving(true);
    try {
      const primaryButton = buildButtonFirestoreMap(form.primaryButton);
      const secondaryButton = buildButtonFirestoreMap(form.secondaryButton);
      // Mirror the primary external button into the legacy link/linkLabel
      // fields so old app builds that still read `link`/`linkLabel` keep
      // working. If the primary button is empty or is an in-app button,
      // clear the legacy fields.
      const legacyLink =
        primaryButton && primaryButton.type === 'external' ? primaryButton.url : null;
      const legacyLinkLabel =
        primaryButton && primaryButton.type === 'external' ? primaryButton.label : null;
      const data: Record<string, any> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        imageUrl: form.imageUrl,
        link: legacyLink,
        linkLabel: legacyLinkLabel,
        primaryButton,
        secondaryButton,
        order: Number(form.order) || 0,
        isActive: !!form.isActive,
        startsAt: form.startsAt ? new Date(form.startsAt) : null,
        endsAt: form.endsAt ? new Date(form.endsAt) : null,
      };
      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        toast.success('Banner updated');
      } else {
        await addDoc(collection(db, 'banners'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Banner added');
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
      await deleteDocWithFiles('banners', deleteId, ['imageUrl']);
      toast.success('Banner deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((b) => b.id);
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
      await deleteItemsWithFiles('banners', ids, ['imageUrl']);
      toast.success(`${ids.length} banner${ids.length === 1 ? '' : 's'} deleted`);
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
            <ImageIcon className="w-5 h-5 text-emerald-400" /> Banners
          </h3>
          <p className="text-slate-500 text-sm">Carousel banners shown on home screen</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 text-red-300 text-sm rounded-lg bg-red-950/40 border border-red-800/40 mb-4">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 underline shrink-0">Dismiss</button>
        </div>
      )}
      {items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No banners yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="flex items-center gap-3 flex-wrap rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all banners"
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
            const isSelected = selectedIds.has(item.id);
            return (
            <Card
              key={item.id}
              className={`hover:border-slate-700 transition-colors group overflow-hidden relative ${isSelected ? 'border-red-800 bg-red-950/20' : 'bg-slate-900 border-slate-800'}`}
            >
              <div className="relative aspect-video bg-slate-800">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-slate-700" />
                  </div>
                )}
                <div className="absolute top-2 left-2 z-10 bg-slate-900/80 rounded backdrop-blur p-0.5">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelectOne(item.id)}
                    aria-label={`Select ${item.title}`}
                  />
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {item.isActive ? (
                    <Badge variant="outline" className="bg-emerald-950/80 text-emerald-400 border-emerald-800/60 backdrop-blur">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-900/80 text-slate-400 border-slate-700 backdrop-blur">
                      Inactive
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-slate-900/80 text-slate-400 border-slate-700 backdrop-blur">
                    #{item.order || 0}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="text-white font-medium truncate">{item.title}</h4>
                {item.subtitle && (
                  <p className="text-slate-500 text-xs mt-1 line-clamp-1">{item.subtitle}</p>
                )}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {item.primaryButton && (
                    <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                      {item.primaryButton.type === 'external' ? (
                        <Link2 className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowRight className="w-3 h-3 mr-1" />
                      )}{' '}
                      {item.primaryButton.label}
                    </Badge>
                  )}
                  {item.secondaryButton && (
                    <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                      {item.secondaryButton.type === 'external' ? (
                        <Link2 className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowRight className="w-3 h-3 mr-1" />
                      )}{' '}
                      {item.secondaryButton.label}
                    </Badge>
                  )}
                  {!item.primaryButton && item.link && (
                    <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                      <Link2 className="w-3 h-3 mr-1" /> {item.linkLabel || 'Link'}
                    </Badge>
                  )}
                  {item.startsAt && (
                    <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
                      <Calendar className="w-3 h-3 mr-1" /> {formatDateTime(item.startsAt)}
                    </Badge>
                  )}
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
      </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Banner Image * (recommended 16:9)</Label>
              {form.imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700">
                  <img src={form.imageUrl} alt="preview" className="w-full aspect-video object-cover" />
                  <button
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 flex flex-col items-center justify-center gap-2 hover:border-emerald-600 hover:bg-slate-800 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                  ) : (
                    <ImageUp className="w-8 h-8 text-slate-500" />
                  )}
                  <span className="text-sm text-slate-400">
                    {uploading ? 'Uploading...' : 'Click to upload banner image'}
                  </span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 50% off Premium!"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Short tagline"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-3">
              <ButtonEditor
                title="Button 1 (Primary)"
                button={form.primaryButton}
                onChange={(next) => setForm({ ...form, primaryButton: next })}
                onClear={() => setForm({ ...form, primaryButton: { ...emptyButtonForm } })}
              />
              <ButtonEditor
                title="Button 2 (Secondary)"
                button={form.secondaryButton}
                onChange={(next) => setForm({ ...form, secondaryButton: next })}
                onClear={() => setForm({ ...form, secondaryButton: { ...emptyButtonForm } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Starts At</Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Ends At</Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label className="cursor-pointer">Active</Label>
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
            <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The banner will be removed from the home carousel immediately.
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} banner{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} banner{selectedIds.size === 1 ? '' : 's'} from Firestore.
              They will be removed from the home carousel immediately.
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
              Delete {selectedIds.size} banner{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
