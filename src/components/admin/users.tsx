'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDateTime } from '@/lib/admin-firestore';
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

function subscriptionBadge(status?: string) {
  switch (status) {
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
  const [form, setForm] = useState<{ role: string; subscriptionStatus: string; isActive: boolean }>({
    role: 'user',
    subscriptionStatus: 'free',
    isActive: true,
  });

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
    });
    setEditingId(user.id);
    setDialogOpen(true);
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
                      <TableCell>{subscriptionBadge(user.subscriptionStatus)}</TableCell>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="w-3 h-3 mr-1" /> Manage
                        </Button>
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
    </div>
  );
}
