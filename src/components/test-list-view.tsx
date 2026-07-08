'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Star, Users, Lock, Play, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

const filterTabs = [
  { id: 'all', label: 'All', gradient: 'from-blue-500 to-blue-600' },
  { id: 'free', label: 'Free', gradient: 'from-green-500 to-emerald-500' },
  { id: 'premium', label: 'Premium', gradient: 'from-amber-500 to-orange-500' },
  { id: 'previous_year', label: 'Previous Year', gradient: 'from-blue-600 to-indigo-500' },
  { id: 'mock', label: 'Mock', gradient: 'from-purple-500 to-pink-500' },
];

const typeBadgeConfig: Record<string, { className: string; label: string; icon?: React.ReactNode }> = {
  free: { className: 'bg-gradient-to-r from-green-400 to-emerald-400 text-white', label: '✨ FREE' },
  premium: { className: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white', label: '👑 PREMIUM', icon: <Lock className="h-3 w-3 ml-1" /> },
  previous_year: { className: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white', label: '📄 PREV YEAR' },
  mock: { className: 'bg-gradient-to-r from-purple-400 to-pink-400 text-white', label: '🎯 MOCK' },
};

export default function TestListView() {
  const { selectedSubjectId, setCurrentView, user, setShowAuthModal, setSelectedTestId } = useAppStore();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then((r) => r.json()).then((d) => d.subjects),
  });

  const currentSubject = subjects?.find((e: any) => e.id === selectedSubjectId);

  const { data: allTests, isLoading } = useQuery({
    queryKey: ['tests', selectedSubjectId],
    queryFn: () => fetch(`/api/tests?subjectId=${selectedSubjectId}`).then((r) => r.json()).then((d) => d.tests),
    enabled: !!selectedSubjectId,
  });

  const isPremiumUser = user && (user as any).subscription?.status === 'active';

  // Filter tests based on active filter
  const tests = activeFilter === 'all'
    ? allTests
    : allTests?.filter((t: any) => (t.type || 'free') === activeFilter);

  const handleStartTest = (testId: string, isPremiumTest: boolean) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (isPremiumTest && !isPremiumUser) {
      setShowAuthModal(true);
      return;
    }
    setSelectedTestId(testId);
    setCurrentView('take-test');
  };

  const getTestType = (test: any): string => {
    // Only tests explicitly marked as 'premium' are paid.
    // 'free', 'mock', 'previous_year', 'dailyQuiz' are all accessible to everyone.
    return test.type || 'free';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('subject-list')}
          className="flex-shrink-0 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{currentSubject?.name || 'Tests'}</h1>
          {currentSubject?.category && (
            <p className="text-sm text-muted-foreground">{currentSubject.category.name}</p>
          )}
        </div>
      </div>

      {/* Subject Info Card */}
      {currentSubject && (
        <Card className="border-0 shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 p-5 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{currentSubject.name}</h2>
                <div className="flex items-center gap-3 text-xs text-white/80 mt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {currentSubject._count?.tests || 0} Tests Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 custom-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                  : 'bg-blue-50 dark:bg-blue-950/30 text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-950/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests?.map((test: any) => {
            const testType = getTestType(test);
            const badgeConfig = typeBadgeConfig[testType] || typeBadgeConfig.free;
            const isPremiumTest = testType === 'premium';
            const isLocked = isPremiumTest && !isPremiumUser;

            return (
              <motion.div
                key={test.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`border-0 shadow-md hover:shadow-xl transition-all h-full flex flex-col overflow-hidden ${isLocked ? 'opacity-90' : ''}`}>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-sm md:text-base flex-1">{test.title}</h3>
                      <Badge
                        className={`${badgeConfig.className} border-0 text-[10px] font-bold flex-shrink-0 ml-2 shadow-sm flex items-center`}
                      >
                        {badgeConfig.label}
                        {badgeConfig.icon}
                      </Badge>
                    </div>

                    {/* Test details */}
                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          {test.duration} min
                        </span>
                        <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-medium">
                          <Star className="h-3 w-3" />
                          {test.totalMarks} marks
                        </span>
                        <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg text-xs font-medium">
                          <Users className="h-3 w-3" />
                          {test._count?.testAttempts || 0}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        📝 {test._count?.questions || 0} Questions
                        {test.negativeMarking && test.negativeMarks > 0 && (
                          <span className="text-red-500 ml-1">• -{test.negativeMarks} negative</span>
                        )}
                      </p>
                      {test.year && (
                        <p className="text-xs text-muted-foreground">
                          📅 Year: {test.year}
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <Button
                      className={`w-full font-bold ${
                        isLocked
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      }`}
                      onClick={() => handleStartTest(test.id, isPremiumTest)}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Unlock with Premium
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Test
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && tests?.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">No tests available for this filter</p>
        </div>
      )}
    </div>
  );
}
