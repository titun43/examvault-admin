'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Zap, Timer, TimerOff,
  ChevronRight, Play, Target, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const quickPracticeOptions = [
  { label: '10 Questions', value: 10, gradient: 'from-blue-500 to-blue-600' },
  { label: '25 Questions', value: 25, gradient: 'from-blue-500 to-cyan-500' },
  { label: '50 Questions', value: 50, gradient: 'from-blue-600 to-sky-500' },
];

export default function PracticeView() {
  const { setCurrentView, setSelectedCategoryId, setSelectedSubjectId } = useAppStore();
  const [isTimed, setIsTimed] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(10);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()).then((d) => d.categories),
  });

  const handleStartPractice = () => {
    if (selectedCategory) {
      setSelectedCategoryId(selectedCategory);
      setCurrentView('subject-list');
    } else {
      setCurrentView('exams');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('home')}
          className="flex-shrink-0 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Practice 🎯</h1>
          <p className="text-sm text-muted-foreground">Sharpen your skills</p>
        </div>
      </motion.div>

      {/* Timed / Untimed Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${isTimed ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-slate-400 to-gray-500'} flex items-center justify-center text-white shadow-md transition-all`}>
                  {isTimed ? <Timer className="h-5 w-5" /> : <TimerOff className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm">{isTimed ? 'Timed Mode' : 'Untimed Mode'}</p>
                  <p className="text-xs text-muted-foreground">
                    {isTimed ? 'Race against the clock' : 'Practice at your own pace'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTimed(!isTimed)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  isTimed ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-muted'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                  animate={{ left: isTimed ? 'calc(100% - 26px)' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Cards */}
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-bold text-lg">Choose a Category</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {categories?.map((cat: any) => {
            const isSelected = selectedCategory === cat.id;
            const config: Record<string, { emoji: string; gradient: string }> = {
              'SSC': { emoji: '📋', gradient: 'from-blue-500 to-cyan-500' },
              'Banking': { emoji: '🏦', gradient: 'from-emerald-500 to-teal-500' },
              'Railway': { emoji: '🚂', gradient: 'from-red-500 to-orange-500' },
              'UPSC': { emoji: '🏛️', gradient: 'from-blue-600 to-indigo-500' },
              'ADRE': { emoji: '🎯', gradient: 'from-amber-500 to-orange-500' },
              'State Exams': { emoji: '🏛️', gradient: 'from-rose-500 to-pink-500' },
            };
            const cfg = config[cat.name] || { emoji: '📚', gradient: 'from-blue-500 to-sky-500' };
            return (
              <motion.div key={cat.id} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Card
                    className={`cursor-pointer border-0 shadow-md hover:shadow-xl transition-all h-full overflow-hidden ${
                      isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  >
                    <CardContent className="p-0">
                      <div className={`bg-gradient-to-br ${cfg.gradient} p-4 md:p-5 text-white text-center relative`}>
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors" />
                        <div className="relative">
                          <div className="text-3xl md:text-4xl mb-1.5 drop-shadow-lg">{cfg.emoji}</div>
                          <h3 className="font-bold text-sm md:text-base drop-shadow-sm">{cat.name}</h3>
                        </div>
                      </div>
                      <div className="p-3 text-center space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">{cat._count?.subjects || 0} Subjects</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Practice Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-base">Quick Practice</h3>
              {!selectedCategory && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-0 text-[10px] ml-2">
                  All Categories
                </Badge>
              )}
              {selectedCategory && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-0 text-[10px] ml-2">
                  {categories?.find((c: any) => c.id === selectedCategory)?.name}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {quickPracticeOptions.map((opt) => {
                const isSelected = selectedCount === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCount(opt.value)}
                    className={`relative py-3 px-2 rounded-xl text-center transition-all font-bold text-sm ${
                      isSelected
                        ? `bg-gradient-to-r ${opt.gradient} text-white shadow-lg`
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-xl shadow-blue-500/25 rounded-xl"
                onClick={handleStartPractice}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Practice
                <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Practice Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-5 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
            <div className="relative">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-white/80" />
                Your Practice Stats
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black">47</p>
                  <p className="text-[10px] text-white/70 uppercase tracking-wider">Sessions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black">82%</p>
                  <p className="text-[10px] text-white/70 uppercase tracking-wider">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black">630</p>
                  <p className="text-[10px] text-white/70 uppercase tracking-wider">Questions</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
