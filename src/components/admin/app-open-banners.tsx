'use client';

// =============================================================================
// ExamVault Admin - App Open Banners Management
// =============================================================================
// Full-screen promotional banners shown ONCE per app launch (between splash
// and home). Admin can:
//   - Upload a full-screen image (Storage)
//   - Set optional overlay title/subtitle
//   - Configure a CTA button (external URL or in-app screen)
//   - Set priority (higher = shown first when multiple qualify)
//   - Set frequency cap (once_per_day / once_per_session / every_open)
//   - Mark as urgent (bypasses frequency cap)
//   - Target audience (all / guest / free / premium)
//   - Schedule start/end datetime
//   - Toggle active/inactive
//   - View impression + click analytics
//
// Collection: app_open_banners (separate from `banners` which is the
// home-screen carousel).
//
// The CTA button reuses the same ActionButton shape as the home banner so
// the Flutter side can share the ActionButton model + InAppNavigator.
// =============================================================================

import { useEffect, useState, useRef } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  uploadImage,
  toDateTimeInputValue,
  formatDateTime,
  deleteItems,
} from '@/lib/admin-firestore';
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
  Calendar,
  ImageUp,
  Smartphone,
  Flame,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import { toast } from 'sonner';

// ---- ActionButton (must match Flutter lib/models/action_button.dart) ----
interface ActionButton {
  label: string;
  type: 'external' | 'inApp';
  url: string | null;
  screen: string | null;
  params: Record<string, any> | null;
}

const IN_APP_SCREENS: {
  value: string;
  label: string;
  paramKey?: string;
  paramLabel?: string;
}[] = [
  { value: 'testSeries', label: 'Test Series' },
  { value: 'dailyQuiz', label: 'Daily Quiz' },
  { value: 'upcomingExams', label: 'Upcoming Exams' },
  { value: 'currentAffairs', label: 'Current Affairs' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'leaderboard', label: 'Leaderboard (Ranks)' },
  { value: 'premium', label: 'Premium / Upgrade' },
  {
    value: 'category',
    label: 'Specific Category',
    paramKey: 'categoryId',
    paramLabel: 'Category ID',
  },
  {
    value: 'subject',
    label: "Specific Subject's Tests",
    paramKey: 'subjectId',
    paramLabel: 'Subject ID',
  },
  {
    value: 'test',
    label: 'Specific Test',
    paramKey: 'testId',
    paramLabel: 'Test ID',
  },
];

interface BannerButtonForm {
  label: string;
  type: 'external' | 'inApp';
  url: string;
  screen: string;
  paramValue: string;
}

interface AppOpenBannerFormState {
  imageUrl: string;
  title: string;
  subtitle: string;
  primaryButton: BannerButtonForm;
  priority: number;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  frequency: 'once_per_day' | 'once_per_session' | 'every_open';
  isUrgent: boolean;
  targetAudience: 'all' | 'guest' | 'free' | 'premium';
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

function buttonFormFromAction(
  btn: ActionButton | null | undefined,
): BannerButtonForm {
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

interface AppOpenBannerDoc {
  id: string;
  imageUrl?: string;
  title?: string | null;
  subtitle?: string | null;
  primaryButton?: ActionButton | null;
  priority?: number;
  isActive?: boolean;
  startsAt?: any;
  endsAt?: any;
  frequency?: string;
  isUrgent?: boolean;
  targetAudience?: string;
  impressionCount?: number;
  clickCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

const emptyForm: AppOpenBannerFormState = {
  imageUrl: '',
  title: '',
  subtitle: '',
  primaryButton: { ...emptyButtonForm },
  priority: 0,
  isActive: true,
  startsAt: '',
  endsAt: '',
  frequency: 'once_per_session',
  isUrgent: false,
  targetAudience: 'all',
};

function formFromDoc(d: AppOpenBannerDoc): AppOpenBannerFormState {
  return {
    imageUrl: d.imageUrl || '',
    title: d.title || '',
    subtitle: d.subtitle || '',
    primaryButton: buttonFormFromAction(d.primaryButton),
    priority: typeof d.priority === 'number' ? d.priority : 0,
    isActive: d.isActive ?? true,
    startsAt: toDateTimeInputValue(d.startsAt),
    endsAt: toDateTimeInputValue(d.endsAt),
    frequency:
      (d.frequency as AppOpenBannerFormState['frequency']) ||
      'once_per_session',
    isUrgent: d.isUrgent ?? false,
    targetAudience:
      (d.targetAudience as AppOpenBannerFormState['targetAudience']) || 'all',
  };
}

function buildFirestorePayload(form: AppOpenBannerFormState) {
  // Convert datetime-local strings → Date or null.
  const startsAt = form.startsAt ? new Date(form.startsAt) : null;
  const endsAt = form.endsAt ? new Date(form.endsAt) : null;
  return {
    imageUrl: form.imageUrl.trim(),
    title: form.title.trim() || null,
    subtitle: form.subtitle.trim() || null,
    primaryButton: buildButtonFirestoreMap(form.primaryButton),
    priority: Number(form.priority) || 0,
    isActive: form.isActive,
    startsAt,
    endsAt,
    frequency: form.frequency,
    isUrgent: form.isUrgent,
    targetAudience: form.targetAudience,
  };
}

// =============================================================================
// Button editor sub-component (mirrors the home banners editor).
// =============================================================================
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
            onValueChange={(v: 'external' | 'inApp') =>
              onChange({ ...button, type: v })
            }
          >
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="external">External URL</SelectItem>
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
            placeholder="https://example.com/apply"
            className="bg-slate-800 border-slate-700"
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Destination Screen</Label>
            <Select
              value={button.screen}
              onValueChange={(v) => onChange({ ...button, screen: v })}
            >
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select a screen" />
              </SelectTrigger>
              <SelectContent>
                {IN_APP_SCREENS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {needsParam && (
            <div className="space-y-2">
              <Label>{paramLabel}</Label>
              <Input
                value={button.paramValue}
                onChange={(e) =>
                  onChange({ ...button, paramValue: e.target.value })
                }
                placeholder={`Enter ${paramLabel}`}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// Main component
// =============================================================================
export default function AppOpenBanners() {
  const [banners, setBanners] = useState<AppOpenBannerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AppOpenBannerDoc | null>(null);
  const [form, setForm] = useState<AppOpenBannerFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'app_open_banners'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AppOpenBannerDoc[];
        // Sort: higher priority first, then newest createdAt.
        list.sort((a, b) => {
          const byPriority = (b.priority || 0) - (a.priority || 0);
          if (byPriority !== 0) return byPriority;
          const aT = a.createdAt?.toDate?.()?.getTime() ?? 0;
          const bT = b.createdAt?.toDate?.()?.getTime() ?? 0;
          return bT - aT;
        });
        setBanners(list);
        setLoading(false);
      },
      (err) => {
        console.error('app_open_banners snapshot error:', err);
        toast.error('Failed to load app-open banners');
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, primaryButton: { ...emptyButtonForm } });
    setDialogOpen(true);
  }

  function openEdit(b: AppOpenBannerDoc) {
    setEditing(b);
    setForm(formFromDoc(b));
    setDialogOpen(true);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadImage('app_open_banners', file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success('Image uploaded');
    } catch (e: any) {
      toast.error('Image upload failed: ' + (e?.message || 'unknown error'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.imageUrl.trim()) {
      toast.error('Please upload a banner image first.');
      return;
    }
    setSaving(true);
    try {
      const payload = buildFirestorePayload(form);
      if (editing) {
        await updateDoc(doc(db, 'app_open_banners', editing.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        toast.success('Banner updated');
      } else {
        await addDoc(collection(db, 'app_open_banners'), {
          ...payload,
          impressionCount: 0,
          clickCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success('Banner created');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error('Save failed: ' + (e?.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(b: AppOpenBannerDoc, next: boolean) {
    try {
      await updateDoc(doc(db, 'app_open_banners', b.id), {
        isActive: next,
        updatedAt: serverTimestamp(),
      });
      toast.success(next ? 'Banner activated' : 'Banner deactivated');
    } catch (e: any) {
      toast.error('Update failed: ' + (e?.message || 'unknown error'));
    }
  }

  async function handleBulkDelete() {
    if (deleteIds.length === 0) return;
    setSaving(true);
    try {
      await deleteItems('app_open_banners', deleteIds);
      toast.success(`Deleted ${deleteIds.length} banner(s)`);
      setDeleteIds([]);
      setDeleteOpen(false);
    } catch (e: any) {
      toast.error('Delete failed: ' + (e?.message || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(id: string) {
    setDeleteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-400" />
            App Open Banners
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Full-screen promotional banners shown once per app launch (splash →
            home).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {deleteIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({deleteIds.length})
            </Button>
          )}
          <Button
            onClick={openCreate}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Banner
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No app-open banners yet.</p>
            <p className="text-slate-500 text-sm mt-1">
              Click <span className="text-emerald-400">New Banner</span> to
              create your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <BannerCard
              key={b.id}
              banner={b}
              selected={deleteIds.includes(b.id)}
              onSelectToggle={() => toggleSelect(b.id)}
              onEdit={() => openEdit(b)}
              onToggleActive={(next) => handleToggleActive(b, next)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing ? 'Edit App Open Banner' : 'New App Open Banner'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Banner Image (full-screen)</Label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-56 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(f);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ImageUp className="w-4 h-4 mr-2" />
                    )}
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-slate-500">
                    Recommended: 1080×1920 (9:16 portrait) for full-screen
                    impact.
                  </p>
                  {form.imageUrl && (
                    <Input
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, imageUrl: e.target.value }))
                      }
                      placeholder="Or paste image URL"
                      className="bg-slate-800 border-slate-700 text-xs"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Title + subtitle */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Title (optional overlay)</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Big Sale! 50% off"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Subtitle (optional)</Label>
                <Input
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subtitle: e.target.value }))
                  }
                  placeholder="e.g. Limited time only"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            {/* CTA button */}
            <ButtonEditor
              title="CTA Button (optional — opens on tap)"
              button={form.primaryButton}
              onChange={(next) =>
                setForm((f) => ({ ...f, primaryButton: next }))
              }
              onClear={() =>
                setForm((f) => ({
                  ...f,
                  primaryButton: { ...emptyButtonForm },
                }))
              }
            />

            {/* Priority + frequency + audience */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: parseInt(e.target.value || '0', 10),
                    }))
                  }
                  placeholder="0"
                  className="bg-slate-800 border-slate-700"
                />
                <p className="text-xs text-slate-500">
                  Higher = shown first.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, frequency: v as any }))
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once_per_session">
                      Once per session
                    </SelectItem>
                    <SelectItem value="once_per_day">
                      Once per day
                    </SelectItem>
                    <SelectItem value="every_open">Every open</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={form.targetAudience}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, targetAudience: v as any }))
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="guest">Guests only</SelectItem>
                    <SelectItem value="free">Free (signed-in)</SelectItem>
                    <SelectItem value="premium">Premium only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Urgent + active */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-700 p-3">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Urgent
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Bypass frequency cap (always show).
                  </p>
                </div>
                <Switch
                  checked={form.isUrgent}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isUrgent: v }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-700 p-3">
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Inactive banners are never shown.
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Start (optional)
                </Label>
                <Input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startsAt: e.target.value }))
                  }
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  End (optional)
                </Label>
                <Input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endsAt: e.target.value }))
                  }
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || uploading || !form.imageUrl.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? 'Update' : 'Create'} Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete {deleteIds.length} banner(s)?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The banners will be removed from the
              app_open_banners collection immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =============================================================================
// Banner card sub-component
// =============================================================================
function BannerCard({
  banner,
  selected,
  onSelectToggle,
  onEdit,
  onToggleActive,
}: {
  banner: AppOpenBannerDoc;
  selected: boolean;
  onSelectToggle: () => void;
  onEdit: () => void;
  onToggleActive: (next: boolean) => void;
}) {
  const impressionCount = banner.impressionCount ?? 0;
  const clickCount = banner.clickCount ?? 0;
  const ctr =
    impressionCount > 0
      ? ((clickCount / impressionCount) * 100).toFixed(1)
      : '0.0';

  return (
    <Card
      className={`bg-slate-900 border-slate-800 overflow-hidden transition-all ${
        selected ? 'ring-2 ring-red-500' : ''
      }`}
    >
      {/* Image preview */}
      <div className="relative aspect-[9/16] bg-slate-800">
        {banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={banner.title || 'banner'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-slate-600" />
          </div>
        )}
        {/* Top-right badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {banner.isUrgent && (
            <Badge className="bg-orange-600 hover:bg-orange-600 text-white">
              <Flame className="w-3 h-3 mr-1" /> URGENT
            </Badge>
          )}
          <Badge
            className={
              banner.isActive
                ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-700 text-slate-300'
            }
          >
            {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </div>
        {/* Bottom overlay with title */}
        {(banner.title || banner.subtitle) && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            {banner.title && (
              <p className="text-white font-semibold text-sm line-clamp-2">
                {banner.title}
              </p>
            )}
            {banner.subtitle && (
              <p className="text-slate-300 text-xs line-clamp-1">
                {banner.subtitle}
              </p>
            )}
          </div>
        )}
      </div>
      <CardContent className="p-3 space-y-3">
        {/* CTA info */}
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          {banner.primaryButton ? (
            <>
              <Link2 className="w-3 h-3" />
              <span className="truncate">
                {banner.primaryButton.label}
                {banner.primaryButton.type === 'inApp'
                  ? ` → ${banner.primaryButton.screen}`
                  : ' (URL)'}
              </span>
            </>
          ) : (
            <span>No CTA button</span>
          )}
        </div>
        {/* Frequency + audience badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className="border-slate-600 text-slate-300 text-[10px]"
          >
            {(banner.frequency || 'once_per_session').replace(/_/g, ' ')}
          </Badge>
          <Badge
            variant="outline"
            className="border-slate-600 text-slate-300 text-[10px]"
          >
            {(banner.targetAudience || 'all').toUpperCase()}
          </Badge>
          <Badge
            variant="outline"
            className="border-slate-600 text-slate-300 text-[10px]"
          >
            P:{banner.priority ?? 0}
          </Badge>
        </div>
        {/* Schedule */}
        {(banner.startsAt || banner.endsAt) && (
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {banner.startsAt ? formatDateTime(banner.startsAt) : '—'} →{' '}
              {banner.endsAt ? formatDateTime(banner.endsAt) : '—'}
            </span>
          </div>
        )}
        {/* Analytics */}
        <div className="grid grid-cols-3 gap-1 text-[11px] pt-1 border-t border-slate-800">
          <div className="flex flex-col items-center">
            <Eye className="w-3 h-3 text-slate-500 mb-0.5" />
            <span className="text-slate-300 font-semibold">
              {impressionCount}
            </span>
            <span className="text-slate-500">impr.</span>
          </div>
          <div className="flex flex-col items-center">
            <MousePointerClick className="w-3 h-3 text-slate-500 mb-0.5" />
            <span className="text-slate-300 font-semibold">{clickCount}</span>
            <span className="text-slate-500">clicks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-500 mb-0.5">CTR</span>
            <span className="text-emerald-400 font-semibold">{ctr}%</span>
            <span className="text-slate-500">&nbsp;</span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelectToggle}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800"
            title="Select for delete"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500">Active</span>
            <Switch
              checked={banner.isActive ?? false}
              onCheckedChange={onToggleActive}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
