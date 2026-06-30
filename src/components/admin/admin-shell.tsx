'use client';

import { useEffect } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { useAppStore, AdminSection } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  GraduationCap,
  LayoutDashboard,
  FolderTree,
  BookOpen,
  FileText,
  FileQuestion,
  ClipboardList,
  CalendarClock,
  Image,
  Newspaper,
  Users,
  LogOut,
  Menu,
  Cloud,
} from 'lucide-react';

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Content',
    items: [
      { id: 'categories', label: 'Categories', icon: FolderTree },
      { id: 'subjects', label: 'Subjects', icon: BookOpen },
      { id: 'tests', label: 'Tests', icon: FileText },
      { id: 'previous-papers', label: 'Previous Papers', icon: ClipboardList },
      { id: 'questions', label: 'Questions', icon: FileQuestion },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { id: 'announcements', label: 'Announcements', icon: Newspaper },
      { id: 'upcoming-exams', label: 'Upcoming Exams', icon: CalendarClock },
      { id: 'banners', label: 'Banners', icon: Image },
      { id: 'current-affairs', label: 'Current Affairs', icon: Newspaper },
    ],
  },
  {
    title: 'Users',
    items: [
      { id: 'users', label: 'Users', icon: Users },
    ],
  },
];

function SidebarContent() {
  const { currentSection, setCurrentSection, setSidebarOpen } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">ExamVault</h1>
          <p className="text-emerald-400/70 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-emerald-500/20 to-green-600/10 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-400' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sync indicator */}
      <div className="px-4 py-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/30">
          <Cloud className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-300">Cloud Sync Active</p>
            <p className="text-[10px] text-emerald-500/60 truncate">Changes push to user app instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuth();
  const { sidebarOpen, setSidebarOpen, currentSection } = useAppStore();

  // Find current section label for header
  const currentLabel = NAV_GROUPS
    .flatMap((g) => g.items)
    .find((i) => i.id === currentSection)?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-slate-900 border-r border-slate-800 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-slate-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-white font-semibold text-base sm:text-lg leading-tight">{currentLabel}</h2>
              <p className="text-slate-500 text-xs hidden sm:block">Manage your app content</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-white text-sm font-medium leading-tight">{user?.email}</p>
              <p className="text-emerald-400 text-xs">Administrator</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-red-400 hover:bg-red-950/40"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
