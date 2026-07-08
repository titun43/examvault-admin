'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Download, Star, Globe, TrendingUp,
  Landmark, Dumbbell, FlaskConical, Filter, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

const categoryTabs = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'National', label: 'National', icon: Landmark },
  { id: 'International', label: 'International', icon: Globe },
  { id: 'Economy', label: 'Economy', icon: TrendingUp },
  { id: 'Sports', label: 'Sports', icon: Dumbbell },
  { id: 'Science', label: 'Science', icon: FlaskConical },
];

const dateFilters = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

export default function CurrentAffairsView() {
  const { setCurrentView } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDateFilter, setActiveDateFilter] = useState('week');

  const getDateParams = () => {
    const now = new Date();
    switch (activeDateFilter) {
      case 'today': {
        const today = now.toISOString().split('T')[0];
        return `&from=${today}&to=${today}`;
      }
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return `&from=${weekAgo.toISOString().split('T')[0]}&to=${now.toISOString().split('T')[0]}`;
      }
      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return `&from=${monthAgo.toISOString().split('T')[0]}&to=${now.toISOString().split('T')[0]}`;
      }
      default:
        return '';
    }
  };

  const { data: affairs, isLoading } = useQuery({
    queryKey: ['current-affairs', activeCategory, activeDateFilter],
    queryFn: () => {
      let params = `?limit=50${getDateParams()}`;
      if (activeCategory !== 'all') params += `&category=${activeCategory}`;
      return fetch(`/api/current-affairs${params}`).then((r) => r.json()).then((d) => d.affairs || d.currentAffairs || []);
    },
  });

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
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Globe className="h-4 w-4 text-white" />
            </div>
            Current Affairs
          </h1>
          <p className="text-sm text-muted-foreground">Stay updated with latest news & events</p>
        </div>
      </motion.div>

      {/* Date Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {dateFilters.map((filter) => {
          const isActive = activeDateFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveDateFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-50 dark:bg-blue-950/30 text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-950/50'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar"
      >
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-50 dark:bg-blue-950/30 text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-950/50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : affairs?.length > 0 ? (
        <div className="space-y-4">
          {affairs.map((affair: any, i: number) => (
            <motion.div
              key={affair.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Left accent bar */}
                    <div className="w-1.5 bg-gradient-to-b from-blue-500 to-blue-600 flex-shrink-0" />
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-semibold flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(affair.date).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </Badge>
                            {affair.category && (
                              <Badge className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-0 text-[10px] font-semibold">
                                {affair.category}
                              </Badge>
                            )}
                            {affair.isImportant && (
                              <Badge className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-0 text-[10px] font-bold flex items-center gap-1">
                                <Star className="h-2.5 w-2.5" />
                                Important
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-bold text-sm md:text-base mb-1.5 leading-snug">{affair.title}</h3>
                          {affair.summary && (
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{affair.summary}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {affair.pdfUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs rounded-lg border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                            onClick={() => window.open(affair.pdfUrl, '_blank')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        )}
                        {affair.tags && affair.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {affair.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-[9px] py-0 px-1.5 font-normal">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-4">
            <Globe className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-muted-foreground font-medium">No current affairs found</p>
          <p className="text-xs text-muted-foreground mt-1">Try changing the date range or category filter</p>
        </div>
      )}
    </div>
  );
}
