'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Users, ChevronRight, Sparkles, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const categoryConfig: Record<string, { emoji: string; gradient: string }> = {
  'SSC': { emoji: '📋', gradient: 'from-blue-500 to-cyan-500' },
  'Banking': { emoji: '🏦', gradient: 'from-emerald-500 to-teal-500' },
  'Railway': { emoji: '🚂', gradient: 'from-red-500 to-orange-500' },
  'UPSC': { emoji: '🏛️', gradient: 'from-blue-600 to-indigo-500' },
  'ADRE': { emoji: '🎯', gradient: 'from-amber-500 to-orange-500' },
  'State Exams': { emoji: '🏛️', gradient: 'from-rose-500 to-pink-500' },
};
const defaultConfig = { emoji: '📚', gradient: 'from-blue-500 to-sky-500' };

const subjectIconMap: Record<string, string> = {
  'General Knowledge': '🌍',
  'Mathematics': '🔢',
  'Reasoning': '🧩',
  'English': '📝',
  'General Science': '🔬',
  'History': '📜',
  'Geography': '🗺️',
  'Polity': '⚖️',
  'Economy': '💰',
  'Computer Knowledge': '💻',
  'Assam GK': '🏔️',
  'Language': '🗣️',
  'Banking Awareness': '🏦',
  'Current Affairs': '📰',
  'Quantitative Aptitude': '📊',
  'Verbal Reasoning': '💬',
  'Non-Verbal Reasoning': '🔷',
  'Clerical Aptitude': '📋',
  'General Awareness': '🌐',
  'Indian Economy': '💹',
  'Physics': '⚛️',
  'Chemistry': '🧪',
  'Biology': '🧬',
  'Indian History': '🏺',
  'Indian Geography': '🇮🇳',
  'Indian Polity': '📜',
};

export default function SubjectListView() {
  const { selectedCategoryId, setSelectedCategoryId, setSelectedSubjectId, setCurrentView } = useAppStore();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()).then((d) => d.categories),
  });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', selectedCategoryId],
    queryFn: () => {
      const params = selectedCategoryId ? `?categoryId=${selectedCategoryId}` : '';
      return fetch(`/api/subjects${params}`).then((r) => r.json()).then((d) => d.subjects);
    },
  });

  const currentCategory = categories?.find((c: any) => c.id === selectedCategoryId);
  const catConfig = currentCategory ? (categoryConfig[currentCategory.name] || defaultConfig) : defaultConfig;

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setCurrentView('test-list');
  };

  const getSubjectIcon = (name: string) => {
    return subjectIconMap[name] || '📘';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('exams')}
          className="flex-shrink-0 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catConfig.gradient} flex items-center justify-center text-xl shadow-lg`}>
            {catConfig.emoji}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{currentCategory?.name || 'All Subjects'}</h1>
            <p className="text-sm text-muted-foreground">Choose a subject to start practicing</p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 custom-scrollbar">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            !selectedCategoryId
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'bg-blue-50 dark:bg-blue-950/30 text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-950/50'
          }`}
        >
          All
        </button>
        {categories?.map((cat: any) => {
          const config = categoryConfig[cat.name] || defaultConfig;
          const isActive = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                  : 'bg-blue-50 dark:bg-blue-950/30 text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-950/50'
              }`}
            >
              <span>{config.emoji}</span>
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Subjects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {subjects?.map((subject: any) => {
            const config = categoryConfig[subject.category?.name] || defaultConfig;
            const icon = subject.icon || getSubjectIcon(subject.name);
            const freeTests = subject._count?.tests || 0;

            return (
              <motion.div
                key={subject.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer border-0 shadow-md hover:shadow-xl transition-all h-full overflow-hidden"
                  onClick={() => handleSubjectClick(subject.id)}
                >
                  <div className={`bg-gradient-to-br ${config.gradient} p-4 text-white relative`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
                    <div className="relative flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl flex-shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm mb-1">
                          {subject.category?.name}
                        </Badge>
                        <h3 className="font-bold text-sm md:text-base leading-tight">{subject.name}</h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    {subject.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{subject.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-md">
                          <Unlock className="h-3 w-3" />
                          {freeTests} Free
                        </span>
                        <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md">
                          <Lock className="h-3 w-3" />
                          Premium
                        </span>
                      </div>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!isLoading && subjects?.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">No subjects found for this category</p>
        </div>
      )}
    </div>
  );
}
