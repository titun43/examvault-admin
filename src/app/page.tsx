'use client';

import { useAdminAuth } from '@/lib/admin-auth';
import { AdminAuthProvider } from '@/lib/admin-auth';
import { useAppStore } from '@/lib/store';
import AdminLogin from '@/components/admin/login';
import AdminShell from '@/components/admin/admin-shell';
import Dashboard from '@/components/admin/dashboard';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy-load CRUD pages to keep initial bundle small
const Categories = dynamic(() => import('@/components/admin/categories'), { ssr: false });
const Subjects = dynamic(() => import('@/components/admin/subjects'), { ssr: false });
const Tests = dynamic(() => import('@/components/admin/tests'), { ssr: false });
const PreviousPapers = dynamic(() => import('@/components/admin/previous-papers'), { ssr: false });
const Questions = dynamic(() => import('@/components/admin/questions'), { ssr: false });
const Announcements = dynamic(() => import('@/components/admin/announcements'), { ssr: false });
const UpcomingExams = dynamic(() => import('@/components/admin/upcoming-exams'), { ssr: false });
const Banners = dynamic(() => import('@/components/admin/banners'), { ssr: false });
const CurrentAffairs = dynamic(() => import('@/components/admin/current-affairs'), { ssr: false });
const Users = dynamic(() => import('@/components/admin/users'), { ssr: false });

function AdminContent() {
  const { currentSection } = useAppStore();

  switch (currentSection) {
    case 'dashboard': return <Dashboard />;
    case 'categories': return <Categories />;
    case 'subjects': return <Subjects />;
    case 'tests': return <Tests />;
    case 'previous-papers': return <PreviousPapers />;
    case 'questions': return <Questions />;
    case 'announcements': return <Announcements />;
    case 'upcoming-exams': return <UpcomingExams />;
    case 'banners': return <Banners />;
    case 'current-affairs': return <CurrentAffairs />;
    case 'users': return <Users />;
    default: return <Dashboard />;
  }
}

function AppInner() {
  const { user, loading, isAdmin } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading ExamVault Admin...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  return (
    <AdminShell>
      <AdminContent />
    </AdminShell>
  );
}

export default function Home() {
  return (
    <AdminAuthProvider>
      <AppInner />
    </AdminAuthProvider>
  );
}
