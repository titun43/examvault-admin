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
import { uploadImage, toDateTimeInputValue, formatDateTime, timestampToDate, deleteItems } from '@/lib/admin-firestore';
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
  Clock,
  Layers,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadJson } from '@/lib/download';

type AnnouncementType = 'info' | 'success' | 'warning' | 'error' | 'promo';

interface Announcement {
  id: string;
  title: string;
  message?: string;
  type?: AnnouncementType;
  imageUrl?: string;
  link?: string;
  linkLabel?: string;
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

const emptyForm = {
  title: '',
  message: '',
  type: 'info' as AnnouncementType,
  imageUrl: '',
  link: '',
  linkLabel: '',
  isPinned: false,
  isPublished: true,
  order: 0,
  expiresAt: '',
};

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

  const BULK_SAMPLE = '[{"title":"Welcome!","message":"Welcome to ExamVault","type":"info","isPinned":false,"isPublished":true,"order":1},{"title":"New Tests Added","message":"Check out new mock tests","type":"success","isPinned":true,"isPublished":true,"order":2}]';

  const handleBulkImport = async () => {
    let parsed: any;
    try {
      parsed = JSON.parse(bulkText);
    } catch (e: any) {
      toast.error('Invalid JSON: ' + (e?.message || 'parse error'));
      return;
    }
    if (!Array.isArray(parsed)) {
      toast.error('JSON must be an array of items');
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
      toast.success(`Imported ${parsed.length} items successfully`);
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
    setForm({
      title: item.title || '',
      message: item.message || '',
      type: (item.type as AnnouncementType) || 'info',
      imageUrl: item.imageUrl || '',
      link: item.link || '',
      linkLabel: item.linkLabel || '',
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
      const data: Record<string, any> = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        imageUrl: form.imageUrl || null,
        link: form.link.trim() || null,
        linkLabel: form.linkLabel.trim() || null,
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
      await deleteDoc(doc(db, 'announcements', deleteId));
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
      await deleteItems('announcements', ids);
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
                        {item.link && (
                          <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Link Label</Label>
                <Input
                  value={form.linkLabel}
                  onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
                  placeholder="Apply Now"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
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
                Paste a JSON array of announcement objects below.
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
                  onClick={() => setBulkText(BULK_SAMPLE)}
                  className="border-slate-700 text-slate-300 h-8"
                >
                  Load Sample
                </Button>
              </div>
            </div>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={15}
              placeholder='[{"title":"...","message":"...","type":"info","isPinned":false}]'
              className="bg-slate-800 border-slate-700 font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              Fields: <span className="text-slate-400">title</span>,{' '}
              <span className="text-slate-400">message</span>,{' '}
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
