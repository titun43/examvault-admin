'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft, LayoutDashboard, FolderOpen, BookOpen, FileText, Calendar,
  Megaphone, Users, Plus, Pencil, Trash2, Save, X, Upload,
  ChevronRight, Loader2, Menu, GraduationCap, LogOut, Shield,
  Newspaper, CreditCard, Crown, CheckCircle, XCircle, Clock, IndianRupee,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'tests', label: 'Tests', icon: FileText },
  { id: 'daily-quiz', label: 'Daily Quiz', icon: Zap },
  { id: 'questions', label: 'Questions', icon: FileText },
  { id: 'upcoming-exams', label: 'Upcoming Exams', icon: Calendar },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'current-affairs', label: 'Current Affairs', icon: Newspaper },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'users', label: 'Users', icon: Users },
];

export default function AdminPanel() {
  const { setCurrentView, setIsAdminMode, adminView, setAdminView, user } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 h-14 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-white/60 hover:text-white hover:bg-white/10 rounded-xl h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 flex items-center justify-center shadow-md">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white hidden sm:inline">NEXTEXAM</span>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] px-1.5 py-0">
              <Shield className="h-2.5 w-2.5 mr-0.5" /> ADMIN
            </Badge>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40 hidden sm:block">
            {user?.email || 'Admin'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitAdmin}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl text-xs"
          >
            <LogOut className="h-4 w-4 mr-1" /> Exit Admin
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
              A
            </div>
            <div>
              <span className="font-bold text-white text-sm">Admin Panel</span>
              <p className="text-[10px] text-white/30">Management Console</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-white/10 pt-4 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitAdmin}
              className="w-full justify-start text-white/40 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to App
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="md:hidden fixed left-0 top-0 bottom-0 z-[70] w-72 bg-gray-900 border-r border-white/10 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                    A
                  </div>
                  <span className="font-bold text-white">Admin Panel</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = adminView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setAdminView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-white/10 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExitAdmin}
                  className="w-full justify-start text-white/40 hover:text-white hover:bg-white/5 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to App
                </Button>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {adminView === 'dashboard' && <DashboardSection />}
          {adminView === 'categories' && <CategoriesSection />}
          {adminView === 'subjects' && <SubjectsSection />}
          {adminView === 'tests' && <TestsSection />}
          {adminView === 'daily-quiz' && <DailyQuizSection />}
          {adminView === 'questions' && <QuestionsSection />}
          {adminView === 'upcoming-exams' && <UpcomingExamsSection />}
          {adminView === 'announcements' && <AnnouncementsSection />}
          {adminView === 'current-affairs' && <CurrentAffairsSection />}
          {adminView === 'subscriptions' && <SubscriptionsSection />}
          {adminView === 'users' && <UsersSection />}
        </main>
      </div>
    </div>
  );
}

// ============ Dashboard Section ============
function DashboardSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => fetch('/api/admin/dashboard').then((r) => r.json()),
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-40" /></div>;

  const stats = [
    { label: 'Total Users', value: data?.stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Premium Users', value: data?.stats?.premiumUsers || 0, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Total Revenue', value: `₹${data?.stats?.totalRevenue || 0}`, icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Tests Created', value: data?.stats?.totalTests || 0, icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Subjects', value: data?.stats?.totalSubjects || 0, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Questions Added', value: data?.stats?.totalQuestions || 0, icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  const recentActivity = data?.recentActivity || [];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-white">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="bg-gray-900/50 border-white/10 hover:border-blue-500/30 transition-colors">
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/40 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/60">Recent Test Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white/80">{a.user?.name || a.user?.email}</p>
                    <p className="text-xs text-white/40">{a.test?.title} ({a.test?.subject?.name})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-400">{a.score}%</p>
                    <p className="text-[10px] text-white/30">{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============ Generic CRUD Section ============
function CrudSection({
  title,
  queryKey,
  apiUrl,
  columns,
  renderForm,
  createBody,
  itemName,
  initialData,
  filterFn,
}: {
  title: string;
  queryKey: string;
  apiUrl: string;
  columns: { key: string; label: string; render?: (v: any, item: any) => React.ReactNode }[];
  renderForm: (item: any, setItem: (v: any) => void) => React.ReactNode;
  createBody: (item: any) => any;
  itemName: string;
  initialData?: any;
  filterFn?: (item: any) => boolean;
}) {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => fetch(apiUrl).then((r) => r.json()).then((d) => {
      // Try the queryKey first, then common response keys, then the raw
      // response. This lets sections like DailyQuiz use a unique cache key
      // while still extracting the `tests` array from the API response.
      const extracted = d[queryKey] || d.tests || d.items || d.subjects || d.questions || d;
      return Array.isArray(extracted) ? extracted : (extracted ? [extracted] : []);
    }),
  });

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setShowDialog(false);
      setFormData({});
      toast.success(`${itemName} created successfully`);
    },
    onError: () => toast.error(`Failed to create ${itemName}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setShowDialog(false);
      setEditItem(null);
      setFormData({});
      toast.success(`${itemName} updated successfully`);
    },
    onError: () => toast.error(`Failed to update ${itemName}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setDeleteId(null);
      toast.success(`${itemName} deleted successfully`);
    },
    onError: () => toast.error(`Failed to delete ${itemName}`),
  });

  const handleOpenCreate = () => {
    setEditItem(null);
    setFormData(initialData ? { ...initialData } : {});
    setShowDialog(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditItem(item);
    setFormData(item);
    setShowDialog(true);
  };

  const handleSave = () => {
    const body = createBody(formData);
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...body });
    } else {
      createMutation.mutate(body);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Apply optional client-side filter (e.g. DailyQuiz only shows tests where
  // type === 'dailyQuiz').
  const filteredData = filterFn && Array.isArray(data) ? data.filter(filterFn) : data;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <Button size="sm" onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-500 text-white">
          <Plus className="h-4 w-4 mr-1" /> Add {itemName}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="text-left p-3 font-medium text-white/50">
                    {col.label}
                  </th>
                ))}
                <th className="text-right p-3 font-medium text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData?.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/5">
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 text-white/80">
                      {col.render ? col.render(item[col.key], item) : String(item[col.key] || '-')}
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10 text-white/60" onClick={() => handleOpenEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/10" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!filteredData || filteredData.length === 0) && (
                <tr><td colSpan={columns.length + 1} className="p-6 text-center text-white/30">No data found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{editItem ? `Edit ${itemName}` : `Add ${itemName}`}</DialogTitle>
          </DialogHeader>
          {renderForm(formData, setFormData)}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-white/20 text-white/60">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white">
              {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete {itemName}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white/60">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ Categories Section ============
function CategoriesSection() {
  return (
    <CrudSection
      title="Categories"
      queryKey="categories"
      apiUrl="/api/admin/categories"
      itemName="Category"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'order', label: 'Order', render: (v) => v || 0 },
        { key: 'icon', label: 'Icon', render: (v) => v || '-' },
      ]}
      renderForm={(data, setData) => (
        <div className="space-y-4">
          <div><Label className="text-white/60">Name</Label><Input value={data.name || ''} onChange={(e) => setData({ ...data, name: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
          <div><Label className="text-white/60">Order</Label><Input type="number" value={data.order || 0} onChange={(e) => setData({ ...data, order: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
          <div><Label className="text-white/60">Icon (emoji)</Label><Input value={data.icon || ''} onChange={(e) => setData({ ...data, icon: e.target.value })} placeholder="📋" className="bg-white/5 border-white/10 text-white" /></div>
          <div><Label className="text-white/60">Description</Label><Textarea value={data.description || ''} onChange={(e) => setData({ ...data, description: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
        </div>
      )}
      createBody={(data) => ({ name: data.name, slug: data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), order: data.order, icon: data.icon, description: data.description })}
    />
  );
}

// ============ Subjects Section ============
function SubjectsSection() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()).then((d) => d.categories),
  });

  return (
    <CrudSection
      title="Subjects"
      queryKey="subjects"
      apiUrl="/api/admin/subjects"
      itemName="Subject"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'categoryId', label: 'Category', render: (_, item) => item.category?.name || '-' },
        { key: 'tests', label: 'Test Count', render: (_, item) => item._count?.tests || 0 },
      ]}
      renderForm={(data, setData) => (
        <div className="space-y-4">
          <div>
            <Label className="text-white/60">Name</Label>
            <Input
              value={data.name || ''}
              onChange={(e) => {
                const name = e.target.value;
                setData({
                  ...data,
                  name,
                  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                });
              }}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white/60">Slug (auto-generated)</Label>
            <Input
              value={data.slug || ''}
              onChange={(e) => setData({ ...data, slug: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="auto-generated-from-name"
            />
          </div>
          <div>
            <Label className="text-white/60">Category</Label>
            <Select value={data.categoryId || ''} onValueChange={(v) => setData({ ...data, categoryId: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-white/60">Icon (emoji)</Label><Input value={data.icon || ''} onChange={(e) => setData({ ...data, icon: e.target.value })} placeholder="📚" className="bg-white/5 border-white/10 text-white" /></div>
          <div><Label className="text-white/60">Description</Label><Textarea value={data.description || ''} onChange={(e) => setData({ ...data, description: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
          <div><Label className="text-white/60">Order</Label><Input type="number" value={data.order || 0} onChange={(e) => setData({ ...data, order: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
        </div>
      )}
      createBody={(data) => ({
        name: data.name,
        slug: data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        categoryId: data.categoryId,
        icon: data.icon || null,
        description: data.description || null,
        order: data.order || 0,
      })}
    />
  );
}

// ============ Tests Section ============
function TestsSection() {
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/admin/subjects').then((r) => r.json()).then((d) => d.subjects || d),
  });

  return (
    <CrudSection
      title="Tests"
      queryKey="tests"
      apiUrl="/api/admin/tests"
      itemName="Test"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'subjectId', label: 'Subject', render: (_, item) => item.subject?.name || '-' },
        { key: 'type', label: 'Type', render: (v) => (
          <Badge className={
            v === 'free' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
            v === 'premium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
            v === 'previous_year' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
            v === 'mock' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
            v === 'dailyQuiz' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
            'bg-gray-500/20 text-gray-400 border-gray-500/30'
          } variant="secondary">
            {v === 'previous_year' ? 'Previous Year' : v === 'mock' ? 'Mock' : v === 'dailyQuiz' ? 'Daily Quiz' : v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Free'}
          </Badge>
        )},
        { key: 'isPublished', label: 'Status', render: (v) => (
          <Badge className={v ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'} variant="secondary">
            {v ? 'Published' : 'Draft'}
          </Badge>
        )},
      ]}
      renderForm={(data, setData) => (
        <div className="space-y-4">
          <div><Label className="text-white/60">Title</Label><Input value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
          <div>
            <Label className="text-white/60">Subject</Label>
            <Select value={data.subjectId || ''} onValueChange={(v) => setData({ ...data, subjectId: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.category?.name || 'No Category'})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/60">Type</Label>
            <Select value={data.type || 'free'} onValueChange={(v) => setData({ ...data, type: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="previous_year">Previous Year</SelectItem>
                <SelectItem value="mock">Mock</SelectItem>
                <SelectItem value="dailyQuiz">⚡ Daily Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-white/60">Duration (min)</Label><Input type="number" value={data.duration || 30} onChange={(e) => setData({ ...data, duration: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-white/60">Total Marks</Label><Input type="number" value={data.totalMarks || 100} onChange={(e) => setData({ ...data, totalMarks: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-white/60">Year</Label><Input type="number" value={data.year || ''} onChange={(e) => setData({ ...data, year: parseInt(e.target.value) || undefined })} placeholder="e.g. 2024" className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-white/60">Exam Session</Label><Input value={data.examSession || ''} onChange={(e) => setData({ ...data, examSession: e.target.value })} placeholder="e.g. Morning" className="bg-white/5 border-white/10 text-white" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-white/60">Negative Marking</Label><Input type="number" step="0.25" value={data.negativeMarks || 0} onChange={(e) => setData({ ...data, negativeMarks: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-white/60">Difficulty</Label>
              <Select value={data.difficulty || 'medium'} onValueChange={(v) => setData({ ...data, difficulty: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Switch checked={data.isPublished || false} onCheckedChange={(v) => setData({ ...data, isPublished: v })} /><Label className="text-white/60">Published</Label></div>
          </div>
          <div><Label className="text-white/60">Instructions</Label><Textarea value={data.instructions || ''} onChange={(e) => setData({ ...data, instructions: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
        </div>
      )}
      createBody={(data) => ({
        title: data.title, slug: data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        subjectId: data.subjectId, type: data.type || 'free', duration: data.duration,
        totalMarks: data.totalMarks, negativeMarks: data.negativeMarks,
        difficulty: data.difficulty, isPublished: data.isPublished,
        instructions: data.instructions, year: data.year || null, examSession: data.examSession || null,
      })}
    />
  );
}

// ============ Daily Quiz Section ============
// Shows only tests with type='dailyQuiz'. The admin creates daily quizzes
// here (they appear in the user app's Daily Quiz screen). Pre-fills the
// type field so the admin doesn't have to remember to set it.
function DailyQuizSection() {
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/admin/subjects').then((r) => r.json()).then((d) => d.subjects || d),
  });

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
        <Zap className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-200 font-bold text-sm">Daily Quiz Management</p>
          <p className="text-yellow-200/70 text-xs mt-1">
            Tests created here appear in the user app&apos;s <b>Daily Quiz</b> screen. Set the type to
            <span className="text-yellow-300 font-bold"> ⚡ Daily Quiz</span> and mark as <b>Published</b>.
            Add questions via the Questions tab after creating the test.
          </p>
        </div>
      </div>
      <CrudSection
        title="Daily Quizzes"
        queryKey="daily-quizzes"
        apiUrl="/api/admin/tests"
        itemName="Daily Quiz"
        initialData={{ type: 'dailyQuiz', duration: 10, totalMarks: 10, isPublished: true, difficulty: 'easy' }}
        filterFn={(item: any) => item.type === 'dailyQuiz'}
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'subjectId', label: 'Subject', render: (_, item) => item.subject?.name || '-' },
          { key: 'duration', label: 'Duration', render: (v) => `${v} min` },
          { key: 'isPublished', label: 'Status', render: (v) => (
            <Badge className={v ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'} variant="secondary">
              {v ? 'Published' : 'Draft'}
            </Badge>
          )},
        ]}
        renderForm={(data, setData) => (
          <div className="space-y-4">
            <div><Label className="text-white/60">Title</Label><Input value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="e.g. Daily Quiz — 30 June 2025" /></div>
            <div>
              <Label className="text-white/60">Subject</Label>
              <Select value={data.subjectId || ''} onValueChange={(v) => setData({ ...data, subjectId: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.category?.name || 'No Category'})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Type is locked to dailyQuiz — hidden from the form */}
            <input type="hidden" value="dailyQuiz" readOnly />
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-white/60">Duration (min)</Label><Input type="number" value={data.duration || 10} onChange={(e) => setData({ ...data, duration: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/60">Total Marks</Label><Input type="number" value={data.totalMarks || 10} onChange={(e) => setData({ ...data, totalMarks: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={data.isPublished ?? true} onCheckedChange={(v) => setData({ ...data, isPublished: v })} /><Label className="text-white/60">Published</Label></div>
            </div>
            <div><Label className="text-white/60">Instructions (optional)</Label><Textarea value={data.instructions || ''} onChange={(e) => setData({ ...data, instructions: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
          </div>
        )}
        createBody={(data) => ({
          title: data.title, slug: (data.slug || data.title || 'daily-quiz').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36),
          subjectId: data.subjectId, type: 'dailyQuiz', duration: data.duration || 10,
          totalMarks: data.totalMarks || 10, negativeMarks: 0,
          difficulty: data.difficulty || 'easy', isPublished: data.isPublished ?? true,
          instructions: data.instructions, year: null, examSession: null,
        })}
      />
    </div>
  );
}

// ============ Questions Section ============
function QuestionsSection() {
  const queryClient = useQueryClient();
  const [selectedTestId, setSelectedTestId] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: tests } = useQuery({
    queryKey: ['admin-tests'],
    queryFn: () => fetch('/api/admin/tests').then((r) => r.json()).then((d) => d.tests || d),
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['admin-questions', selectedTestId],
    queryFn: () => fetch(`/api/admin/questions?testId=${selectedTestId}`).then((r) => r.json()).then((d) => d.questions || d),
    enabled: !!selectedTestId,
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      const questions = JSON.parse(bulkJson);
      const res = await fetch('/api/admin/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, testId: selectedTestId }),
      });
      if (!res.ok) throw new Error('Failed to upload');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions', selectedTestId] });
      setShowBulkDialog(false);
      setBulkJson('');
      toast.success('Questions uploaded successfully');
    },
    onError: () => toast.error('Failed to upload questions. Check JSON format.'),
  });

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions', selectedTestId] });
      setShowForm(false);
      setFormData({});
      toast.success('Question created');
    },
    onError: () => toast.error('Failed to create question'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions', selectedTestId] });
      toast.success('Question deleted');
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Questions</h2>
        <div className="flex gap-2">
          {selectedTestId && (
            <>
              <Button size="sm" variant="outline" onClick={() => setShowBulkDialog(true)} className="border-white/20 text-white/60">
                <Upload className="h-4 w-4 mr-1" /> Bulk Upload
              </Button>
              <Button size="sm" onClick={() => { setFormData({}); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-500 text-white">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Test selector */}
      <div className="mb-4">
        <Select value={selectedTestId} onValueChange={setSelectedTestId}>
          <SelectTrigger className="w-full sm:w-72 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select a test to view questions" />
          </SelectTrigger>
          <SelectContent>
            {tests?.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>}

      {questions && (
        <div className="space-y-2">
          {questions.map((q: any, i: number) => (
            <Card key={q.id} className="bg-gray-900/50 border-white/10 shadow-none">
              <CardContent className="p-3 flex items-start gap-3">
                <Badge variant="secondary" className="text-xs flex-shrink-0 bg-blue-500/20 text-blue-400 border-blue-500/30">Q{i + 1}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 line-clamp-2">{q.text}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-white/40">Ans: {q.correctAnswer}</span>
                    <span className="text-[10px] text-white/40">Marks: {q.marks}</span>
                    {q.topic && <span className="text-[10px] text-white/40">Topic: {q.topic}</span>}
                    {q.imageUrl && <span className="text-[10px] text-blue-400">📷 Image</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/10 flex-shrink-0" onClick={() => deleteMutation.mutate(q.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {questions.length === 0 && <p className="text-center text-white/30 py-8">No questions found for this test</p>}
        </div>
      )}

      {/* Create Question Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-gray-900 border-white/10">
          <DialogHeader><DialogTitle className="text-white">Add Question</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-white/60">Question Text</Label><Textarea value={formData.text || ''} onChange={(e) => setFormData({ ...formData, text: e.target.value })} rows={3} className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-white/60">Image URL</Label><Input value={formData.imageUrl || ''} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." className="bg-white/5 border-white/10 text-white" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-white/60">Option A</Label><Input value={formData.optionA || ''} onChange={(e) => setFormData({ ...formData, optionA: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/60">Option B</Label><Input value={formData.optionB || ''} onChange={(e) => setFormData({ ...formData, optionB: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/60">Option C</Label><Input value={formData.optionC || ''} onChange={(e) => setFormData({ ...formData, optionC: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/60">Option D</Label><Input value={formData.optionD || ''} onChange={(e) => setFormData({ ...formData, optionD: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60">Correct Answer</Label>
                <Select value={formData.correctAnswer || ''} onValueChange={(v) => setFormData({ ...formData, correctAnswer: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/60">Marks</Label><Input type="number" value={formData.marks || 1} onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-white/60">Negative Marks</Label><Input type="number" step="0.25" value={formData.negativeMarks || 0} onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" /></div>
              <div><Label className="text-white/60">Topic</Label><Input value={formData.topic || ''} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} placeholder="e.g. Algebra, History" className="bg-white/5 border-white/10 text-white" /></div>
            </div>
            <div><Label className="text-white/60">Explanation</Label><Textarea value={formData.explanation || ''} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} rows={2} className="bg-white/5 border-white/10 text-white" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/20 text-white/60">Cancel</Button>
            <Button onClick={() => createMutation.mutate({ ...formData, testId: selectedTestId })} disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="sm:max-w-lg bg-gray-900 border-white/10">
          <DialogHeader><DialogTitle className="text-white">Bulk Upload Questions</DialogTitle></DialogHeader>
          <p className="text-xs text-white/40 mb-2">
            Paste JSON array of questions. Each question should have: text, optionA, optionB, optionC, optionD, correctAnswer, marks, negativeMarks, topic, explanation, imageUrl
          </p>
          <Textarea
            value={bulkJson}
            onChange={(e) => setBulkJson(e.target.value)}
            rows={10}
            placeholder='[{"text":"Q1?","optionA":"A","optionB":"B","optionC":"C","optionD":"D","correctAnswer":"A","marks":1,"negativeMarks":0.25}]'
            className="font-mono text-xs bg-white/5 border-white/10 text-white"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowBulkDialog(false)} className="border-white/20 text-white/60">Cancel</Button>
            <Button onClick={() => bulkMutation.mutate()} disabled={bulkMutation.isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
              {bulkMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              <Upload className="h-4 w-4 mr-1" /> Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Upcoming Exams Section ============
function UpcomingExamsSection() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()).then((d) => d.categories),
  });

  return (
    <CrudSection
      title="Upcoming Exams"
      queryKey="upcomingExams"
      apiUrl="/api/admin/upcoming-exams"
      itemName="Upcoming Exam"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'examDate', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
        { key: 'isActive', label: 'Active', render: (v) => v ? '✅' : '❌' },
      ]}
      renderForm={(data, setData) => (
        <div className="space-y-4">
          <div><Label className="text-white/60">Name</Label><Input value={data.name || ''} onChange={(e) => setData({ ...data, name: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
          <div>
            <Label className="text-white/60">Category</Label>
            <Select value={data.categoryId || ''} onValueChange={(v) => setData({ ...data, categoryId: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-white/60">Exam Date</Label><Input type="date" value={data.examDate ? data.examDate.split('T')[0] : ''} onChange={(e) => setData({ ...data, examDate: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
          <div><Label className="text-white/60">Description</Label><Textarea value={data.description || ''} onChange={(e) => setData({ ...data, description: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
          <div><Label className="text-white/60">Notification Link</Label><Input value={data.notificationLink || ''} onChange={(e) => setData({ ...data, notificationLink: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
          <div className="flex items-center gap-2"><Switch checked={data.isActive !== false} onCheckedChange={(v) => setData({ ...data, isActive: v })} /><Label className="text-white/60">Active</Label></div>
        </div>
      )}
      createBody={(data) => ({
        name: data.name, categoryId: data.categoryId, examDate: data.examDate,
        description: data.description, notificationLink: data.notificationLink, isActive: data.isActive,
      })}
    />
  );
}

// ============ Announcements Section ============
function AnnouncementsSection() {
  return (
    <CrudSection
      title="Announcements"
      queryKey="announcements"
      apiUrl="/api/admin/announcements"
      itemName="Announcement"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type', render: (v) => (
          <Badge className={v === 'ticker' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : v === 'banner' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'} variant="secondary">
            {v || 'info'}
          </Badge>
        )},
        { key: 'priority', label: 'Priority', render: (v) => (
          <Badge className={v === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' : v === 'important' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'} variant="secondary">
            {v || 'info'}
          </Badge>
        )},
        { key: 'isPublished', label: 'Published', render: (v) => v ? '✅' : '❌' },
      ]}
      renderForm={(data, setData) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-white/60">Title</Label><Input placeholder="e.g. IBPS PO Notification Released!" value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            <div>
              <Label className="text-white/60">Type</Label>
              <Select value={data.type || 'info'} onValueChange={(v) => setData({ ...data, type: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="ticker">Ticker</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-white/60">Message</Label><Textarea placeholder="Detailed description..." value={data.message || ''} onChange={(e) => setData({ ...data, message: e.target.value })} rows={3} className="bg-white/5 border-white/10 text-white" /></div>

          {/* Banner-specific fields */}
          {(data.type === 'banner' || data.type === 'ticker') && (
            <div className="space-y-4 p-4 bg-blue-950/20 rounded-xl border border-blue-500/20">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Display Settings</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60">Emoji / Icon</Label>
                  <Input placeholder="🔥" value={data.emoji || ''} onChange={(e) => setData({ ...data, emoji: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-white/60">Gradient Color</Label>
                  <Select value={data.gradient || ''} onValueChange={(v) => setData({ ...data, gradient: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select gradient" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="from-blue-600 via-blue-500 to-sky-500">Blue-Sky</SelectItem>
                      <SelectItem value="from-amber-500 via-orange-500 to-red-500">Orange-Red</SelectItem>
                      <SelectItem value="from-cyan-500 via-teal-500 to-emerald-500">Teal-Emerald</SelectItem>
                      <SelectItem value="from-sky-500 via-blue-500 to-indigo-500">Sky-Indigo</SelectItem>
                      <SelectItem value="from-blue-700 via-blue-600 to-indigo-600">Blue-Indigo</SelectItem>
                      <SelectItem value="from-yellow-500 via-amber-500 to-orange-500">Yellow-Orange</SelectItem>
                      <SelectItem value="from-emerald-500 via-green-500 to-teal-500">Emerald-Green</SelectItem>
                      <SelectItem value="from-red-500 via-rose-500 to-pink-500">Red-Rose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60">Button Text</Label>
                  <Input placeholder="e.g. Start Practicing" value={data.buttonText || ''} onChange={(e) => setData({ ...data, buttonText: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-white/60">Badge Text</Label>
                  <Input placeholder="e.g. Trending" value={data.badgeText || ''} onChange={(e) => setData({ ...data, badgeText: e.target.value })} className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-white/60">Click Link</Label>
                <Input placeholder="e.g. exams, daily-quiz" value={data.link || ''} onChange={(e) => setData({ ...data, link: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <Label className="text-white/60">Display Order</Label>
                <Input type="number" placeholder="0" value={data.order || 0} onChange={(e) => setData({ ...data, order: parseInt(e.target.value) || 0 })} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60">Priority</Label>
              <Select value={data.priority || 'info'} onValueChange={(v) => setData({ ...data, priority: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/60">Target Audience</Label>
              <Select value={data.target || 'all'} onValueChange={(v) => setData({ ...data, target: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="guest">Guest Only</SelectItem>
                  <SelectItem value="student">Students Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2"><Switch checked={data.isPublished !== undefined ? data.isPublished : true} onCheckedChange={(v) => setData({ ...data, isPublished: v })} /><Label className="text-white/60">Published</Label></div>
        </div>
      )}
      createBody={(data) => ({
        title: data.title, message: data.message, priority: data.priority, isPublished: data.isPublished,
        type: data.type || 'info', gradient: data.gradient || null, emoji: data.emoji || null,
        link: data.link || null, buttonText: data.buttonText || null, badgeText: data.badgeText || null,
        image: data.image || null, target: data.target || 'all', order: data.order || 0,
      })}
    />
  );
}

// ============ Current Affairs Section ============
function CurrentAffairsSection() {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()).then((d) => d.categories),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-current-affairs'],
    queryFn: () => fetch('/api/admin/current-affairs').then((r) => r.json()).then((d) => d.currentAffairs || d),
  });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch('/api/admin/current-affairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-current-affairs'] });
      setShowDialog(false);
      setFormData({});
      toast.success('Current affair created');
    },
    onError: () => toast.error('Failed to create current affair'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: any) => {
      const res = await fetch(`/api/admin/current-affairs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-current-affairs'] });
      setShowDialog(false);
      setEditItem(null);
      setFormData({});
      toast.success('Current affair updated');
    },
    onError: () => toast.error('Failed to update current affair'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/current-affairs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-current-affairs'] });
      setDeleteId(null);
      toast.success('Current affair deleted');
    },
  });

  const handleOpenCreate = () => {
    setEditItem(null);
    setFormData({ isImportant: false });
    setShowDialog(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      ...item,
      date: item.date ? item.date.split('T')[0] : '',
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    const body = {
      date: formData.date,
      title: formData.title,
      content: formData.content,
      summary: formData.summary || null,
      pdfUrl: formData.pdfUrl || null,
      category: formData.category || null,
      categoryId: formData.categoryId || null,
      isImportant: formData.isImportant || false,
      tags: formData.tags || null,
    };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...body });
    } else {
      createMutation.mutate(body);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Current Affairs</h2>
        <Button size="sm" onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-500 text-white">
          <Plus className="h-4 w-4 mr-1" /> Add Current Affair
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3 font-medium text-white/50">Date</th>
                <th className="text-left p-3 font-medium text-white/50">Title</th>
                <th className="text-left p-3 font-medium text-white/50">Category</th>
                <th className="text-left p-3 font-medium text-white/50">Important</th>
                <th className="text-right p-3 font-medium text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.map((item: any) => (
                <tr key={item.id} className="hover:bg-white/5">
                  <td className="p-3 text-white/80">{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-white/80 max-w-xs truncate">{item.title}</td>
                  <td className="p-3 text-white/60">{item.categoryRef?.name || item.category || '-'}</td>
                  <td className="p-3">{item.isImportant ? <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30" variant="secondary">Important</Badge> : <span className="text-white/30">-</span>}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/10 text-white/60" onClick={() => handleOpenEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-500/10" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data || data.length === 0) && (
                <tr><td colSpan={5} className="p-6 text-center text-white/30">No current affairs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{editItem ? 'Edit Current Affair' : 'Add Current Affair'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-white/60">Date</Label><Input type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-white/60">Title</Label><Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-white/60">Content</Label><Textarea value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-white/60">Summary</Label><Textarea value={formData.summary || ''} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} rows={2} className="bg-white/5 border-white/10 text-white" /></div>
            <div><Label className="text-white/60">PDF URL</Label><Input value={formData.pdfUrl || ''} onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })} placeholder="https://..." className="bg-white/5 border-white/10 text-white" /></div>
            <div>
              <Label className="text-white/60">Category (text)</Label>
              <Select value={formData.category || ''} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                  <SelectItem value="Economy">Economy</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/60">Category (link)</Label>
              <Select value={formData.categoryId || ''} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Link to category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.isImportant || false} onCheckedChange={(v) => setFormData({ ...formData, isImportant: v })} />
              <Label className="text-white/60">Mark as Important</Label>
            </div>
            <div><Label className="text-white/60">Tags (comma-separated)</Label><Input value={formData.tags || ''} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g. RBI, Economy, Banking" className="bg-white/5 border-white/10 text-white" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-white/20 text-white/60">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white">
              {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Current Affair?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white/60">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ Subscriptions Section ============
function SubscriptionsSection() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => fetch('/api/admin/subscriptions').then((r) => r.json()).then((d) => d.subscriptions || d),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Subscription updated');
    },
    onError: () => toast.error('Failed to update subscription'),
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-white">Subscriptions</h2>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3 font-medium text-white/50">User</th>
                <th className="text-left p-3 font-medium text-white/50">Plan</th>
                <th className="text-left p-3 font-medium text-white/50">Price</th>
                <th className="text-left p-3 font-medium text-white/50">Status</th>
                <th className="text-left p-3 font-medium text-white/50">Start Date</th>
                <th className="text-left p-3 font-medium text-white/50">Expiry Date</th>
                <th className="text-right p-3 font-medium text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-white/5">
                  <td className="p-3 text-white/80">
                    <div>
                      <p className="font-medium">{sub.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-white/40">{sub.user?.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30" variant="secondary">
                      {sub.plan}
                    </Badge>
                  </td>
                  <td className="p-3 text-white/80">₹{sub.price}</td>
                  <td className="p-3">
                    {sub.isActive ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30" variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" /> Expired
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-white/60 text-xs">{sub.startedAt ? new Date(sub.startedAt).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-white/60 text-xs">{sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!sub.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                          onClick={() => updateMutation.mutate({ id: sub.id, action: 'activate' })}
                          disabled={updateMutation.isPending}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Activate
                        </Button>
                      )}
                      {sub.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-red-400 hover:bg-red-500/10 text-xs"
                          onClick={() => updateMutation.mutate({ id: sub.id, action: 'deactivate' })}
                          disabled={updateMutation.isPending}
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Deactivate
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-blue-400 hover:bg-blue-500/10 text-xs"
                        onClick={() => updateMutation.mutate({ id: sub.id, action: 'extend' })}
                        disabled={updateMutation.isPending}
                      >
                        <Clock className="h-3 w-3 mr-1" /> Extend
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data || data.length === 0) && (
                <tr><td colSpan={7} className="p-6 text-center text-white/30">No subscriptions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ Users Section ============
function UsersSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetch('/api/admin/users').then((r) => r.json()),
  });

  const users = data?.users || data || [];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-white">Users</h2>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3 font-medium text-white/50">Name</th>
                <th className="text-left p-3 font-medium text-white/50">Email</th>
                <th className="text-left p-3 font-medium text-white/50">Role</th>
                <th className="text-left p-3 font-medium text-white/50">Subscription</th>
                <th className="text-left p-3 font-medium text-white/50">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="p-3 font-medium text-white/80">
                    <div className="flex items-center gap-2">
                      {u.name || 'Unknown'}
                      {u.subscription?.isActive && (
                        <Crown className="h-3.5 w-3.5 text-amber-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-white/60">{u.email}</td>
                  <td className="p-3">
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className={`text-[10px] ${u.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'}`}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {u.subscription?.isActive ? (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30" variant="secondary">
                        <Crown className="h-3 w-3 mr-1" /> {u.subscription.plan}
                      </Badge>
                    ) : u.subscription ? (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30" variant="secondary">
                        Expired
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30" variant="secondary">
                        Free
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-white/80">{u.xp || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
