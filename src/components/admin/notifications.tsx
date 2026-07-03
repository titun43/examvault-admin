'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDateTime, timestampToDate, deleteItems } from '@/lib/admin-firestore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Loader2,
  Bell,
  Users as UsersIcon,
  User as UserIcon,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type NotificationType =
  | 'general'
  | 'newTest'
  | 'announcement'
  | 'premium'
  | 'dailyQuiz'
  | 'currentAffair'
  | 'leaderboard'
  | 'testResult';

interface AppNotification {
  id: string;
  title?: string;
  body?: string;
  message?: string;
  type?: NotificationType;
  userId?: string;
  isRead?: boolean;
  createdAt?: any;
}

interface AppUser {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
}

const TYPE_STYLES: Record<NotificationType, { badge: string; dot: string; label: string }> = {
  general: { badge: 'bg-slate-800 text-slate-300 border-slate-700', dot: 'bg-slate-400', label: 'General' },
  newTest: { badge: 'bg-blue-950/60 text-blue-400 border-blue-800/50', dot: 'bg-blue-400', label: 'New Test' },
  announcement: { badge: 'bg-purple-950/60 text-purple-400 border-purple-800/50', dot: 'bg-purple-400', label: 'Announcement' },
  premium: { badge: 'bg-amber-950/60 text-amber-400 border-amber-800/50', dot: 'bg-amber-400', label: 'Premium' },
  dailyQuiz: { badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50', dot: 'bg-emerald-400', label: 'Daily Quiz' },
  currentAffair: { badge: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/50', dot: 'bg-cyan-400', label: 'Current Affair' },
  leaderboard: { badge: 'bg-pink-950/60 text-pink-400 border-pink-800/50', dot: 'bg-pink-400', label: 'Leaderboard' },
  testResult: { badge: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50', dot: 'bg-indigo-400', label: 'Test Result' },
};

const emptyForm = {
  title: '',
  body: '',
  type: 'general' as NotificationType,
  targetMode: 'all' as 'all' | 'specific',
  userId: '',
};

export default function Notifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Bulk delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Users for the "Specific User" picker
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'notifications'),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as AppNotification)
          .sort((a, b) => {
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

  const loadUsers = async () => {
    if (usersLoaded) return;
    setUsersLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser);
      setUsers(list);
      setUsersLoaded(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const openAdd = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleTargetChange = (v: 'all' | 'specific') => {
    setForm((f) => ({ ...f, targetMode: v, userId: v === 'all' ? '' : f.userId }));
    if (v === 'specific') {
      loadUsers();
    }
  };

  const handleSend = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.body.trim()) {
      toast.error('Message is required');
      return;
    }
    if (form.targetMode === 'specific' && !form.userId) {
      toast.error('Please select a user');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type,
        userId: form.targetMode === 'all' ? 'all' : form.userId,
        isRead: false,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'notifications'), payload);
      toast.success('Notification sent');
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Send failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'notifications', deleteId));
      toast.success('Notification deleted');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  // ---- Bulk selection helpers ----
  const filteredIds = items.map((n) => n.id);
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
      await deleteItems('notifications', ids);
      toast.success(`${ids.length} notification${ids.length === 1 ? '' : 's'} deleted`);
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
            <Bell className="w-5 h-5 text-emerald-400" /> Notifications
          </h3>
          <p className="text-slate-500 text-sm">Send push-style notifications to user devices</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Send Notification
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No notifications sent yet. Send your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="flex items-center gap-3 flex-wrap rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allFilteredSelected ? true : someFilteredSelected ? 'indeterminate' : false}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all notifications"
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
            const type = (item.type || 'general') as NotificationType;
            const style = TYPE_STYLES[type];
            const isBroadcast = !item.userId || item.userId === 'all';
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
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-medium truncate">{item.title}</h4>
                        {item.isRead ? (
                          <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 shrink-0">
                            Read
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-950/40 text-emerald-400 border-emerald-800/50 shrink-0">
                            Unread
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2">
                        {item.body || item.message}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <Badge variant="outline" className={style.badge}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1`} />
                          {style.label}
                        </Badge>
                        {isBroadcast ? (
                          <Badge variant="outline" className="bg-blue-950/40 text-blue-400 border-blue-800/50">
                            <UsersIcon className="w-3 h-3 mr-1" /> All Users
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-purple-950/40 text-purple-400 border-purple-800/50">
                            <UserIcon className="w-3 h-3 mr-1" /> Specific User
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 text-[10px] mt-1.5">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Send Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. New mock test available!"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Notification body..."
                className="bg-slate-800 border-slate-700"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as NotificationType })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="newTest">New Test</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="dailyQuiz">Daily Quiz</SelectItem>
                  <SelectItem value="currentAffair">Current Affair</SelectItem>
                  <SelectItem value="leaderboard">Leaderboard</SelectItem>
                  <SelectItem value="testResult">Test Result</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target</Label>
              <Select
                value={form.targetMode}
                onValueChange={(v) => handleTargetChange(v as 'all' | 'specific')}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Users (Broadcast)</SelectItem>
                  <SelectItem value="specific">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.targetMode === 'specific' && (
              <div className="space-y-2">
                <Label>Select User *</Label>
                {usersLoading ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-slate-500 text-xs">No users found in the users collection.</p>
                ) : (
                  <Select
                    value={form.userId}
                    onValueChange={(v) => setForm({ ...form, userId: v })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Pick a user..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name || u.email || u.phoneNumber || u.id}
                          {u.email && u.name ? ` (${u.email})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notification?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. The notification will be removed from Firestore immediately.
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
              <Trash2 className="w-5 h-5 text-red-400" /> Delete {selectedIds.size} notification{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete {selectedIds.size} notification{selectedIds.size === 1 ? '' : 's'} from Firestore.
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
              Delete {selectedIds.size} notification{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
