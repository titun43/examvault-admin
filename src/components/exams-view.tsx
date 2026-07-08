'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const categoryConfig: Record<string, { emoji: string; gradient: string; color: string }> = {
  'SSC': { emoji: '📋', gradient: 'from-blue-500 to-cyan-500', color: '#2563EB' },
  'Banking': { emoji: '🏦', gradient: 'from-emerald-500 to-teal-500', color: '#059669' },
  'Railway': { emoji: '🚂', gradient: 'from-red-500 to-orange-500', color: '#EF4444' },
  'UPSC': { emoji: '🏛️', gradient: 'from-blue-600 to-indigo-500', color: '#7C3AED' },
  'ADRE': { emoji: '🎯', gradient: 'from-amber-500 to-orange-500', color: '#D97706' },
  'State Exams': { emoji: '🏛️', gradient: 'from-rose-500 to-pink-500', color: '#DC2626' },
};
const defaultConfig = { emoji: '📚', gradient: 'from-gray-500 to-slate-500', color: '#6B7280' };

export default function ExamsView() {
  const { setSelectedCategoryId, setCurrentView } = useAppStore();
  const [search, setSearch] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()).then((d) => d.categories),
  });

  const filteredCategories = categories?.filter((cat: any) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('subject-list');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('home')}
          className="flex-shrink-0 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Exam Categories</h1>
          <p className="text-sm text-muted-foreground">Choose a category to explore subjects</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl border-blue-200 dark:border-blue-800 focus:ring-blue-500"
        />
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCategories?.map((cat: any) => {
            const config = categoryConfig[cat.name] || defaultConfig;
            return (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer border-0 shadow-md hover:shadow-xl transition-all h-full overflow-hidden"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <div className={`bg-gradient-to-br ${config.gradient} p-5 text-white relative`}>
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
                    <div className="relative flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0">
                        {config.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight">{cat.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {cat._count?.subjects || 0} Subjects
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Explore subjects & mock tests for {cat.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!isLoading && filteredCategories?.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">No categories found</p>
        </div>
      )}
    </div>
  );
}
