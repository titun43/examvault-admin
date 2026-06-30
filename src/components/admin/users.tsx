'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDateTime, timestampToDate, toDateTimeInputValue } from '@/lib/admin-firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users as UsersIcon,
  Loader2,
  Search,
  Pencil,
  Crown,
  Shield,
  User as UserIcon,
  Flame,
  Trophy,
  Star,
  Activity,
  Gift,
  CalendarClock,
} from 'lucide-react';
import { toast } from 'sonner';

interface AppUser {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  role?: string;
  subscriptionStatus?: string;
  isPremium?: boolean;
  subscriptionExpiryDate?: any;
  subscriptionStartDate?: any;
  totalTestsAttempted?: number;
  averageScore?: number;
  totalXp?: number;
  level?: number;
  streak?: number;
  lastActiveAt?: any;
  createdAt?: any;
  isActive?: boolean;
}

function roleBadge(role?: string) {
  if (role === 'admin') {
    return (
      <Badge variant="outline" className="bg-amber-950/60 text-amber-400 border-amber-800/50">
        <Shield className="w-3 h-3 mr-1" /> Admin
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
      <UserIcon className="w-3 h-3 mr-1" /> User
    </Badge>
  );
}

function subscriptionBadge(status?: string, expiry?: any) {
  const expiryDate = timestampToDate(expiry);
  const isExpired = expiryDate && expiryDate.getTime() < Date.now();
  const effectiveStatus = isExpired && status === 'premium' ? 'expired' : status;
  switch (effectiveStatus) {
    case 'premium':
      return (
        <Badge variant="outline" className="bg-emerald-950/60 text-emerald-400 border-emerald-800/50">
          <Crown className="w-3 h-3 mr-1" /> Premium
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="outline" className="bg-red-950/60 text-red-400 border-red-800/50">
          Expired
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
          Free
        </Badge>
      );
  }
}

export default function Users() {
  const [items, setItems] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{ role: string; subscriptionStatus: string; isActive: boolean; subscriptionExpiryDate: string }>({
    role: 'user',
    subscriptionStatus: 'free',
    isActive: true,
    subscriptionExpiryDate: '',
  });
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantUserId, setGrantUserId] = useState<string | null>(null);
  const [grantUserName, setGrantUserName] = useState<string>('');
  const [grantMonths, setGrantMonths] = useState<number>(1);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser);
        setItems(list);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  const totalUsers = items.length;
  const premiumUsers = items.filter(
    (u) => u.subscriptionStatus === 'premium' || u.isPremium === true,
  ).length;
  const adminCount = items.filter((u) => u.role === 'admin').length;
  const activeUsers = items.filter((u) => u.isActive !== false).length;

  const filtered = items.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phoneNumber || '').toLowerCase().includes(q)
    );
  });

  const openEdit = (user: AppUser) => {
    setForm({
      role: user.role || 'user',
      subscriptionStatus: user.subscriptionStatus || 'free',
      isActive: user.isActive !== false,
      subscriptionExpiryDate: user.subscriptionExpiryDate ? toDateTimeInputValue(user.subscriptionExpiryDate) : '',
    });
    setEditingId(user.id);
    setDialogOpen(true);
  };

  const openGrant = (user: AppUser) => {
    setGrantUserId(user.id);
    setGrantUserName(user.name || user.email || user.phoneNumber || 'this user');
    setGrantMonths(1);
    setGrantOpen(true);
  };

  const handleGrantPremium = async () => {
    if (!grantUserId) return;
    setGranting(true);
    try {
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + grantMonths);
      await updateDoc(doc(db, 'users', grantUserId), {
        isPremium: true,
        subscriptionStatus: 'premium',
        subscriptionStartDate: startDate,
        subscriptionExpiryDate: expiryDate,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Premium granted for ${grantMonths} month${grantMonths === 1 ? '' : 's'}!`);
      setGrantOpen(false);
      setGrantUserId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to grant premium');
    } finally {
      setGranting(false);
    }
  };

  const handleRevokePremium = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isPremium: false,
        subscriptionStatus: 'expired',
        updatedAt: serverTimestamp(),
      });
      toast.success('Premium revoked');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke premium');
    }
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {
        role: form.role,
        subscriptionStatus: form.subscriptionStatus,
        isPremium: form.subscriptionStatus === 'premium',
        isActive: form.isActive,
      };
      if (form.subscriptionStatus === 'premium' && form.subscriptionExpiryDate) {
        updates.subscriptionExpiryDate = new Date(form.subscriptionExpiryDate);
        if (!updates.subscriptionStartDate) updates.subscriptionStartDate = new Date();
      } else if (form.subscriptionStatus !== 'premium') {
        updates.subscriptionExpiryDate = null;
      }
      await updateDoc(doc(db, 'users', editingId), updates);
      toast.success('User updated');
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
  }: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-emerald-400" /> Users
        </h3>
        <p className="text-slate-500 text-sm">Manage user roles, subscription status & active flag</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={totalUsers} icon={UsersIcon} color="bg-emerald-950/60 text-emerald-400" />
        <StatCard label="Premium" value={premiumUsers} icon={Crown} color="bg-amber-950/60 text-amber-400" />
        <StatCard label="Admins" value={adminCount} icon={Shield} color="bg-purple-950/60 text-purple-400" />
        <StatCard label="Active" value={activeUsers} icon={Activity} color="bg-cyan-950/60 text-cyan-400" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="bg-slate-900 border-slate-800 pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800 border-dashed">
          <CardContent className="py-16 text-center">
            <UsersIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">
              {items.length === 0 ? 'No users yet. Users will appear here when they sign up.' : 'No users match your search.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400 hidden md:table-cell">Phone</TableHead>
                    <TableHead className="text-slate-400">Role</TableHead>
                    <TableHead className="text-slate-400">Subscription</TableHead>
                    <TableHead className="text-slate-400 hidden lg:table-cell">Stats</TableHead>
                    <TableHead className="text-slate-400 hidden sm:table-cell">Last Active</TableHead>
                    <TableHead className="text-slate-400 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.photoUrl ? (
                            <img
                              src={user.photoUrl}
                              alt={user.name || 'avatar'}
                              className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {(user.name || user.email || 'U')[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">
                              {user.name || 'Unnamed'}
                              {user.isActive === false && (
                                <span className="ml-2 text-[10px] text-red-400">(inactive)</span>
                              )}
                            </p>
                            <p className="text-slate-500 text-xs truncate">{user.email || '—'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-400 text-sm">
                        {user.phoneNumber || '—'}
                      </TableCell>
                      <TableCell>{roleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {subscriptionBadge(user.subscriptionStatus, user.subscriptionExpiryDate)}
                          {user.subscriptionExpiryDate && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <CalendarClock className="w-2.5 h-2.5" />
                              {formatDateTime(user.subscriptionExpiryDate)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="inline-flex items-center text-slate-400" title="Tests attempted">
                            <Trophy className="w-3 h-3 mr-1 text-amber-400" />
                            {user.totalTestsAttempted || 0}
                          </span>
                          <span className="inline-flex items-center text-slate-400" title="Average score">
                            <Star className="w-3 h-3 mr-1 text-emerald-400" />
                            {user.averageScore ? `${Math.round(user.averageScore)}%` : '—'}
                          </span>
                          <span className="inline-flex items-center text-slate-400" title="Streak">
                            <Flame className="w-3 h-3 mr-1 text-orange-400" />
                            {user.streak || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-slate-400 text-xs">
                        {user.lastActiveAt ? formatDateTime(user.lastActiveAt) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.subscriptionStatus !== 'premium' ? (
                            <Button
                              size="sm"
                              className="h-8 bg-amber-600 hover:bg-amber-700 text-white"
                              onClick={() => openGrant(user)}
                              title="Grant Premium"
                            >
                              <Gift className="w-3 h-3 mr-1" /> Grant Premium
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-red-400 hover:bg-red-950/40"
                              onClick={() => handleRevokePremium(user.id)}
                              title="Revoke Premium"
                            >
                              Revoke
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Admins can access this admin panel. Grant only to trusted staff.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Subscription Status</Label>
              <Select
                value={form.subscriptionStatus}
                onValueChange={(v) => setForm({ ...form, subscriptionStatus: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Premium unlocks all tests & ad-free experience.
              </p>
            </div>
            {form.subscriptionStatus === 'premium' && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <CalendarClock className="w-3.5 h-3.5" /> Premium Expiry Date
                </Label>
                <Input
                  type="datetime-local"
                  value={form.subscriptionExpiryDate}
                  onChange={(e) => setForm({ ...form, subscriptionExpiryDate: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
                <p className="text-xs text-slate-500">
                  User will lose premium access after this date.
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2 pb-1 border-t border-slate-800">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label className="cursor-pointer">Account active</Label>
              <span className="text-xs text-slate-500 ml-auto">
                Disabling blocks sign-in for this user.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Premium Dialog */}
      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" /> Grant Premium
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Grant premium access to <span className="text-white font-semibold">{grantUserName}</span>.
              This will unlock all premium tests & content.
            </p>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={String(grantMonths)}
                onValueChange={(v) => setGrantMonths(Number(v))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="1">1 month</SelectItem>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">1 year (12 months)</SelectItem>
                  <SelectItem value="120">Lifetime (10 years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-amber-950/30 border border-amber-800/40 p-3 text-xs text-amber-300/80">
              <p className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>
                  Premium will be active from <span className="font-semibold">now</span> until{' '}
                  <span className="font-semibold">
                    {new Date(new Date().setMonth(new Date().getMonth() + grantMonths)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantOpen(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button
              onClick={handleGrantPremium}
              disabled={granting}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
            >
              {granting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Crown className="w-4 h-4 mr-1" />}
              Grant Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
