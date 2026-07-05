'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FolderTree,
  BookOpen,
  FileText,
  FileQuestion,
  Users,
  Newspaper,
  CalendarClock,
  Image,
  ClipboardList,
  Loader2,
  TrendingUp,
} from 'lucide-react';

interface Stats {
  categories: number;
  subjects: number;
  tests: number;
  previousPapers: number;
  questions: number;
  users: number;
  announcements: number;
  upcomingExams: number;
  banners: number;
  currentAffairs: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
            {loading ? (
              <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
            ) : (
              <p className="text-3xl font-bold text-white">{value}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    categories: 0, subjects: 0, tests: 0, previousPapers: 0, questions: 0,
    users: 0, announcements: 0, upcomingExams: 0, banners: 0, currentAffairs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collections = [
      { key: 'categories' as const, name: 'categories' },
      { key: 'subjects' as const, name: 'subjects' },
      { key: 'tests' as const, name: 'tests' },
      { key: 'questions' as const, name: 'questions' },
      { key: 'users' as const, name: 'users' },
      { key: 'announcements' as const, name: 'announcements' },
      { key: 'upcomingExams' as const, name: 'upcoming_exams' },
      { key: 'banners' as const, name: 'banners' },
      { key: 'currentAffairs' as const, name: 'current_affairs' },
    ];

    const unsubs = collections.map((c) =>
      onSnapshot(
        collection(db, c.name),
        (snap) => {
          setStats((prev) => {
            const next = { ...prev, [c.key]: snap.size };
            // Calculate previousPapers from tests where type=previousYear
            if (c.key === 'tests') {
              const ppCount = snap.docs.filter((d) => d.data()?.type === 'previousYear').length;
              next.previousPapers = ppCount;
            }
            return next;
          });
        },
        () => {},
      ),
    );

    // Small delay to ensure all counts come in
    const timer = setTimeout(() => setLoading(false), 800);

    return () => {
      unsubs.forEach((u) => u());
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Categories" value={stats.categories} icon={FolderTree} color="bg-blue-950/50 text-blue-400" loading={loading} />
        <StatCard label="Subjects" value={stats.subjects} icon={BookOpen} color="bg-purple-950/50 text-purple-400" loading={loading} />
        <StatCard label="Tests" value={stats.tests} icon={FileText} color="bg-emerald-950/50 text-emerald-400" loading={loading} />
        <StatCard label="Prev. Papers" value={stats.previousPapers} icon={ClipboardList} color="bg-amber-950/50 text-amber-400" loading={loading} />
        <StatCard label="Questions" value={stats.questions} icon={FileQuestion} color="bg-pink-950/50 text-pink-400" loading={loading} />
        <StatCard label="Users" value={stats.users} icon={Users} color="bg-cyan-950/50 text-cyan-400" loading={loading} />
        <StatCard label="Announcements" value={stats.announcements} icon={Newspaper} color="bg-orange-950/50 text-orange-400" loading={loading} />
        <StatCard label="Upcoming Exams" value={stats.upcomingExams} icon={CalendarClock} color="bg-red-950/50 text-red-400" loading={loading} />
        <StatCard label="Banners" value={stats.banners} icon={Image} color="bg-indigo-950/50 text-indigo-400" loading={loading} />
        <StatCard label="Current Affairs" value={stats.currentAffairs} icon={TrendingUp} color="bg-teal-950/50 text-teal-400" loading={loading} />
      </div>

      {/* Quick Tips */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              How content flows to users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-400">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <p>You add content here (categories, tests, banners, etc.)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <p>Data is saved to Firestore (cloud database)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
              <p>Flutter app listens via real-time streams</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">4</span>
              <p>Users see new content instantly — no app update needed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Content hierarchy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-400">
            <p><span className="text-emerald-400 font-semibold">Category</span> &rarr; e.g. SSC, Railway, UPSC</p>
            <p className="pl-4">&darr;</p>
            <p><span className="text-emerald-400 font-semibold">Subject</span> &rarr; e.g. GK, Math, English (linked to Category)</p>
            <p className="pl-4">&darr;</p>
            <p><span className="text-emerald-400 font-semibold">Test</span> &rarr; Mock / Previous Year / Daily Quiz (linked to Subject)</p>
            <p className="pl-4">&darr;</p>
            <p><span className="text-emerald-400 font-semibold">Questions</span> &rarr; MCQs (linked to Test)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
