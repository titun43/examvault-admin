'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  BookOpen, Trophy, Clock, Users, Flame, ArrowRight,
  GraduationCap, Zap, Globe, Star, Bell, AlertTriangle,
  ChevronRight, Sparkles, Target, Award, TrendingUp,
  Crown, Rocket, Brain, Bookmark,
  Crown as PremiumIcon, Newspaper, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const categoryConfig: Record<string, { emoji: string; gradient: string; bg: string }> = {
  'SSC': { emoji: '📋', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  'Banking': { emoji: '🏦', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  'Railway': { emoji: '🚂', gradient: 'from-red-500 to-orange-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  'UPSC': { emoji: '🏛️', gradient: 'from-blue-600 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  'ADRE': { emoji: '🎯', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  'State Exams': { emoji: '🏛️', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
};

const defaultCategory = { emoji: '📚', gradient: 'from-gray-500 to-slate-500', bg: 'bg-gray-50 dark:bg-gray-950/30' };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function HomeView() {
  const { setCurrentView, setSelectedCategoryId, setSelectedSubjectId, user, setShowAuthModal } = useAppStore();

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()).then((d) => d.categories),
  });

  const { data: upcomingExams, isLoading: upLoading } = useQuery({
    queryKey: ['upcoming-exams'],
    queryFn: () => fetch('/api/upcoming-exams').then((r) => r.json()).then((d) => d.upcomingExams),
  });

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => fetch('/api/announcements').then((r) => r.json()).then((d) => d.announcements),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects-popular'],
    queryFn: () => fetch('/api/subjects').then((r) => r.json()).then((d) => d.subjects),
  });

  const { data: currentAffairs } = useQuery({
    queryKey: ['current-affairs-latest'],
    queryFn: () => fetch('/api/current-affairs?limit=3').then((r) => r.json()).then((d) => d.affairs || d.currentAffairs || []),
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => fetch(`/api/subscriptions?userId=${user?.id}`).then((r) => r.json()).then((d) => d.subscription),
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => fetch(`/api/user/stats?userId=${user?.id}`).then((r) => r.json()).then((d) => d.stats),
    enabled: !!user?.id,
  });

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('subject-list');
  };

  const handleSubjectClick = (subjectId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedSubjectId(subjectId);
    setCurrentView('test-list');
  };

  const handleAnnouncementClick = (link: string | null | undefined) => {
    if (!link) return;
    if (link.startsWith('http')) window.open(link, '_blank');
    else setCurrentView(link as any);
  };

  const urgentAnnouncements = announcements?.filter((a: any) => a.priority === 'urgent');
  const importantAnnouncements = announcements?.filter((a: any) => a.priority === 'important');

  const level = Math.floor((stats?.xp || 0) / 500) + 1;
  const xpInLevel = (stats?.xp || 0) % 500;
  const xpPercent = (xpInLevel / 500) * 100;

  const isPremium = subscription?.status === 'active';

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* ===== STREAK & GAMIFICATION BAR (Logged in) ===== */}
      {user && (
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white px-4 md:px-8 py-5">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-10 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute top-8 left-40 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-4 right-20 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-4 right-60 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
            
            <div className="max-w-7xl mx-auto relative">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Flame className="h-7 w-7 text-orange-300" />
                      </motion.div>
                      <span className="text-3xl font-black">{stats?.streak || 0}</span>
                    </div>
                    <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Day Streak</p>
                  </div>

                  <div className="w-px h-12 bg-white/20 rounded-full" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-yellow-400/30 flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-300" />
                      </div>
                      <span className="text-sm font-bold">Level {level}</span>
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">{xpInLevel}/500 XP</span>
                    </div>
                    <Progress value={xpPercent} className="h-2 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-yellow-300 [&>div]:to-amber-400" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-center bg-white/10 rounded-xl px-3 py-2">
                      <p className="text-lg font-black">{stats?.totalAttempts || 0}</p>
                      <p className="text-[9px] text-white/70 uppercase tracking-wider">Tests</p>
                    </div>
                    <div className="text-center bg-white/10 rounded-xl px-3 py-2">
                      <p className="text-lg font-black">{stats?.bestScore || 0}</p>
                      <p className="text-[9px] text-white/70 uppercase tracking-wider">Best</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm text-xs font-bold"
                    onClick={() => setCurrentView('profile')}
                  >
                    <Award className="mr-1.5 h-3.5 w-3.5" /> My Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ===== THIN SCROLLING TEXT TICKER ===== */}
      {(() => {
        const tickerItems = announcements?.filter((a: any) => a.type === 'ticker' && a.isPublished) || [];
        const defaultTickers = [
          { emoji: '🎉', title: 'New SSC CGL 2025 Mock Tests Available Now!' },
          { emoji: '🏆', title: 'Weekly Leaderboard Challenge — Compete & Win!' },
          { emoji: '📚', title: 'Banking Study Materials Just Updated!' },
          { emoji: '🔥', title: 'Daily Quiz Streak — Don\'t Break Your Chain!' },
          { emoji: '🎯', title: 'Railway Practice Set Added — Start Practicing!' },
          { emoji: '✨', title: 'Earn XP & Badges — Level Up Your Prep!' },
          { emoji: '📰', title: 'Daily Current Affairs — Stay Updated!' },
        ];
        const items = tickerItems.length > 0 ? tickerItems : defaultTickers;
        return (
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
            <div className="flex items-center h-8">
              <div className="flex-shrink-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-3 h-full flex items-center gap-1.5 uppercase tracking-wider relative z-20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                Live
              </div>
              <div className="flex-1 overflow-hidden relative z-10">
                <div className="animate-announcement-scroll flex whitespace-nowrap items-center h-8">
                  {[1, 2].map((set) => (
                    <span key={set} className="flex items-center">
                      {items.map((item: any, idx: number) => (
                        <span key={idx} className="flex items-center">
                          <span
                            className="mx-6 text-xs font-medium cursor-pointer hover:text-yellow-300 transition-colors inline-block"
                            onClick={() => {
                              const link = item.link;
                              if (link) {
                                if (link.startsWith('http')) window.open(link, '_blank');
                                else setCurrentView(link as any);
                              }
                            }}
                          >
                            {item.emoji || '📢'} {item.title}
                          </span>
                          <span className="text-white/20">•</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== BIG ANNOUNCEMENT BANNER CAROUSEL ===== */}
      {(() => {
        const bannerItems = announcements?.filter((a: any) => a.type === 'banner' && a.isPublished) || [];
        const defaultBanners = [
          { title: 'SSC CGL 2025 Mock Tests Live!', message: 'Practice with latest pattern questions, detailed solutions & performance analytics.', gradient: 'from-blue-600 via-blue-500 to-sky-500', emoji: '📋', badgeText: '🔥 Trending', buttonText: 'Start Practicing', link: 'exams' },
          { title: 'Weekly Leaderboard Challenge!', message: 'Compete with thousands of aspirants, climb the ranks & win exciting prizes!', gradient: 'from-amber-500 via-orange-500 to-red-500', emoji: '🏆', badgeText: '⚔️ Competition', buttonText: 'Join Battle', link: 'leaderboard' },
          { title: "Daily Quiz — Don't Break It!", message: 'Keep your streak alive! Daily quizzes with XP rewards, badges & leaderboard points.', gradient: 'from-sky-500 via-blue-500 to-indigo-500', emoji: '🔥', badgeText: '🔥 Streak', buttonText: 'Play Quiz', link: 'daily-quiz' },
          { title: 'Current Affairs Daily Digest!', message: 'Stay updated with the latest national & international news for competitive exams.', gradient: 'from-blue-600 via-blue-500 to-sky-500', emoji: '📰', badgeText: '📰 News', buttonText: 'Read Now', link: 'current-affairs' },
        ];
        const banners = bannerItems.length > 0 ? bannerItems : defaultBanners;

        const handleBannerClick = (link: string | null | undefined) => {
          if (!link) return;
          if (link.startsWith('http')) window.open(link, '_blank');
          else setCurrentView(link as any);
        };

        return (
          <section className="px-4 md:px-8 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl mt-4">
              <Carousel
                opts={{ align: 'start', loop: true }}
                plugins={[Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]}
                className="w-full"
              >
                <CarouselContent>
                  {banners.map((banner: any, i: number) => (
                    <CarouselItem key={banner.id || i}>
                      <div
                        className={`relative overflow-hidden rounded-2xl min-h-[220px] md:min-h-[300px] bg-gradient-to-br ${banner.gradient || 'from-blue-600 via-blue-500 to-sky-500'} text-white cursor-pointer group`}
                        onClick={() => handleBannerClick(banner.link)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBannerClick(banner.link); }}
                      >
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
                          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-white/5 rounded-full" />
                        </div>
                        <div className="relative flex items-center min-h-[220px] md:min-h-[300px] p-6 md:p-10">
                          <div className="flex-1">
                            {banner.badgeText && (
                              <Badge className="bg-white/20 text-white border-0 text-[10px] mb-3 backdrop-blur-sm">{banner.badgeText}</Badge>
                            )}
                            <h2 className="font-black text-2xl md:text-4xl mb-2 leading-tight">{banner.title}</h2>
                            <p className="text-sm md:text-base text-white/80 mb-5 max-w-sm">{banner.message}</p>
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleBannerClick(banner.link); }}
                              className="bg-white text-gray-800 hover:bg-white/90 font-bold shadow-lg rounded-xl group-hover:scale-105 transition-transform"
                            >
                              {banner.buttonText || 'Learn More'} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                          <div className="hidden md:flex items-center justify-center w-48 lg:w-64">
                            <div className="text-[120px] lg:text-[160px] leading-none drop-shadow-2xl group-hover:scale-110 transition-transform">{banner.emoji || '📢'}</div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 md:left-4 border-white/30 bg-white/20 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm" />
                <CarouselNext className="right-2 md:right-4 border-white/30 bg-white/20 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm" />
              </Carousel>
            </div>
          </section>
        );
      })()}

      {/* ===== QUICK ACTION BUTTONS ===== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Zap, label: 'Daily Quiz', desc: 'Play & earn XP', view: 'daily-quiz' as const, gradient: 'from-yellow-400 to-amber-500', bgGrad: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30', iconColor: 'text-yellow-600 dark:text-yellow-400', emoji: '⚡', border: 'border-yellow-200 dark:border-yellow-800/40' },
            { icon: Target, label: 'Practice', desc: 'Topic-wise prep', view: 'practice' as const, gradient: 'from-pink-400 to-rose-500', bgGrad: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30', iconColor: 'text-pink-600 dark:text-pink-400', emoji: '🎯', border: 'border-pink-200 dark:border-pink-800/40' },
            { icon: Newspaper, label: 'Current Affairs', desc: 'Daily news digest', view: 'current-affairs' as const, gradient: 'from-blue-400 to-blue-600', bgGrad: 'from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30', iconColor: 'text-blue-600 dark:text-blue-400', emoji: '📰', border: 'border-blue-200 dark:border-blue-800/40' },
            { icon: PremiumIcon, label: 'Premium', desc: 'Unlock all features', view: 'premium' as const, gradient: 'from-amber-400 to-orange-500', bgGrad: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30', iconColor: 'text-amber-600 dark:text-amber-400', emoji: '👑', border: 'border-amber-200 dark:border-amber-800/40' },
            { icon: Bookmark, label: 'Bookmarks', desc: 'Saved questions', view: 'bookmarks' as const, gradient: 'from-blue-400 to-blue-600', bgGrad: 'from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30', iconColor: 'text-blue-600 dark:text-blue-400', emoji: '🔖', border: 'border-blue-200 dark:border-blue-800/40' },
            { icon: Trophy, label: 'Leaderboard', desc: 'Top performers', view: 'leaderboard' as const, gradient: 'from-amber-400 to-yellow-500', bgGrad: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30', iconColor: 'text-amber-600 dark:text-amber-400', emoji: '🏆', border: 'border-amber-200 dark:border-amber-800/40' },
            { icon: Brain, label: 'Exam Categories', desc: 'All subjects', view: 'exams' as const, gradient: 'from-blue-500 to-cyan-500', bgGrad: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30', iconColor: 'text-blue-600 dark:text-blue-400', emoji: '📚', border: 'border-blue-200 dark:border-blue-800/40' },
            { icon: Sparkles, label: 'More Features', desc: 'Explore all', view: 'settings' as const, gradient: 'from-emerald-400 to-green-500', bgGrad: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30', iconColor: 'text-emerald-600 dark:text-emerald-400', emoji: '✨', border: 'border-emerald-200 dark:border-emerald-800/40' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCurrentView(action.view)}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.bgGrad} border ${action.border} p-4 md:p-5 shadow-sm hover:shadow-lg transition-all text-left group cursor-pointer`}
              >
                <div className="absolute -right-2 -bottom-2 text-5xl md:text-6xl opacity-10 group-hover:opacity-20 transition-opacity select-none pointer-events-none">
                  {action.emoji}
                </div>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient} rounded-t-2xl`} />
                <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow-sm" />
                </div>
                <h3 className="font-bold text-sm md:text-base text-gray-800 dark:text-gray-100 relative z-10">{action.label}</h3>
                <p className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 relative z-10">{action.desc}</p>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                  <ArrowRight className={`h-4 w-4 ${action.iconColor}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ===== ANNOUNCEMENTS ===== */}
      {urgentAnnouncements?.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-8 max-w-7xl mx-auto"
        >
          {urgentAnnouncements.map((a: any) => (
            <div
              key={a.id}
              className={`bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 border border-red-200 dark:border-red-800/50 rounded-xl p-4 flex items-start gap-3 ${a.link ? 'cursor-pointer hover:shadow-md hover:border-red-300 dark:hover:border-red-700 transition-all active:scale-[0.99]' : ''}`}
              onClick={() => handleAnnouncementClick(a.link)}
              role={a.link ? 'button' : undefined}
              tabIndex={a.link ? 0 : undefined}
              onKeyDown={a.link ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleAnnouncementClick(a.link); } : undefined}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/25">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {/* LIVE pulsing badge */}
                  <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    Live
                  </span>
                  {a.badgeText && (
                    <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-0 text-[9px] font-bold">{a.badgeText}</Badge>
                  )}
                  <p className="font-bold text-red-700 dark:text-red-400 text-sm">{a.title}</p>
                </div>
                {a.message && <p className="text-red-600 dark:text-red-500 text-xs mt-1">{a.message}</p>}
              </div>
              {a.link && <ArrowRight className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />}
            </div>
          ))}
        </motion.section>
      )}

      {importantAnnouncements?.length > 0 && (
        <section className="px-4 md:px-8 max-w-7xl mx-auto">
          {importantAnnouncements.map((a: any) => (
            <div
              key={a.id}
              className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3 ${a.link ? 'cursor-pointer hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all active:scale-[0.99]' : ''}`}
              onClick={() => handleAnnouncementClick(a.link)}
              role={a.link ? 'button' : undefined}
              tabIndex={a.link ? 0 : undefined}
              onKeyDown={a.link ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleAnnouncementClick(a.link); } : undefined}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/25">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {/* LIVE pulsing badge */}
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    Live
                  </span>
                  {a.badgeText && (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 text-[9px] font-bold">{a.badgeText}</Badge>
                  )}
                  <p className="font-bold text-amber-700 dark:text-amber-400 text-sm">{a.title}</p>
                </div>
                {a.message && <p className="text-amber-600 dark:text-amber-500 text-xs mt-1">{a.message}</p>}
              </div>
              {a.link && <ArrowRight className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />}
            </div>
          ))}
        </section>
      )}

      {/* ===== UPCOMING EXAMS ===== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">Upcoming Exams</h2>
          </div>
          <button
            onClick={() => setCurrentView('exams')}
            className="text-primary text-sm font-semibold flex items-center hover:underline"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {upLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="min-w-[280px] h-40 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {upcomingExams?.map((exam: any, idx: number) => {
                const gradients = [
                  'from-blue-500 to-cyan-500',
                  'from-blue-500 to-sky-500',
                  'from-emerald-500 to-teal-500',
                  'from-orange-500 to-amber-500',
                  'from-red-500 to-orange-500',
                  'from-sky-500 to-blue-500',
                ];
                const gradient = gradients[idx % gradients.length];
                const diff = new Date(exam.examDate).getTime() - Date.now();
                const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                
                return (
                  <CarouselItem key={exam.id} className="basis-[280px]">
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                      <div className={`bg-gradient-to-br ${gradient} p-4 text-white relative`}>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
                        <Badge className="bg-white/20 text-white border-0 mb-2 text-[10px] backdrop-blur-sm">
                          {exam.category?.name}
                        </Badge>
                        <h3 className="font-bold text-lg">{exam.name}</h3>
                        <p className="text-white/80 text-sm mt-1">
                          {new Date(exam.examDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <CardContent className="p-4 flex items-center justify-between bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{days} days</p>
                            <p className="text-[10px] text-muted-foreground">remaining</p>
                          </div>
                        </div>
                        <Button size="sm" className={`bg-gradient-to-r ${gradient} text-white border-0 shadow-sm hover:shadow-md text-xs`}>
                          Remind Me
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        )}
      </section>

      {/* ===== EXAM CATEGORIES - SUBJECT-CENTRIC GRID ===== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Exam Categories</h2>
        </div>
        {catLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
          >
            {categories?.map((cat: any) => {
              const config = categoryConfig[cat.name] || defaultCategory;
              return (
                <motion.div key={cat.id} variants={fadeUp}>
                  <Card
                    className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-0 shadow-md h-full overflow-hidden group"
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <CardContent className="p-0">
                      <div className={`bg-gradient-to-br ${config.gradient} p-4 md:p-5 text-white text-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
                        <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white/5 rounded-full" />
                        <div className="relative">
                          <div className="text-4xl md:text-5xl mb-2 drop-shadow-lg">{config.emoji}</div>
                          <h3 className="font-bold text-sm md:text-base drop-shadow-sm">{cat.name}</h3>
                        </div>
                      </div>
                      <div className="p-2 text-center bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                        <p className="text-xs text-muted-foreground font-medium">{cat._count?.subjects || 0} Subjects</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ===== POPULAR SUBJECTS ===== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">Popular Subjects</h2>
          </div>
          <button
            onClick={() => setCurrentView('exams')}
            className="text-primary text-sm font-semibold flex items-center hover:underline"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects?.slice(0, 6).map((subject: any) => {
            const config = categoryConfig[subject.category?.name] || defaultCategory;
            return (
              <motion.div
                key={subject.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="border-0 shadow-md hover:shadow-xl transition-all h-full overflow-hidden">
                  <div className={`bg-gradient-to-r ${config.gradient} p-3 flex items-center justify-between relative overflow-hidden`}>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/10 rounded-full" />
                    <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
                      {subject.category?.name}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur-sm">
                      {subject._count?.tests || 0} Tests
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-sm md:text-base mb-2">{subject.name}</h3>
                    {subject.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{subject.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-md">
                          Free Tests
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className={`bg-gradient-to-r ${config.gradient} text-white border-0 shadow-sm hover:shadow-md text-xs h-8 font-bold`}
                        onClick={() => handleSubjectClick(subject.id)}
                      >
                        Start <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== CURRENT AFFAIRS SECTION ===== */}
      {currentAffairs && currentAffairs.length > 0 && (
        <section className="px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Newspaper className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold">Current Affairs</h2>
            </div>
            <button
              onClick={() => setCurrentView('current-affairs')}
              className="text-primary text-sm font-semibold flex items-center hover:underline"
            >
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {currentAffairs.map((affair: any) => (
              <motion.div
                key={affair.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                  onClick={() => setCurrentView('current-affairs')}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-1.5 bg-gradient-to-b from-blue-500 to-blue-600 flex-shrink-0" />
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </Badge>
                          {affair.isImportant && (
                            <Badge className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-0 text-[10px] font-bold">
                              Important
                            </Badge>
                          )}
                          {affair.category && (
                            <Badge className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-0 text-[10px]">
                              {affair.category}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-sm">{affair.title}</h3>
                        {affair.summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{affair.summary}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ===== PREMIUM CTA BANNER (if not premium) ===== */}
      {!isPremium && (
        <section className="px-4 md:px-8 max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="cursor-pointer"
            onClick={() => setCurrentView('premium')}
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-5 md:p-6 text-white relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <PremiumIcon className="h-7 w-7 text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg md:text-xl">Unlock NEXTEXAM Premium</h3>
                    <p className="text-white/80 text-sm">Get unlimited tests, detailed solutions & more starting at just ₹99/month</p>
                  </div>
                  <Button className="bg-white text-blue-600 hover:bg-white/90 font-bold shadow-lg rounded-xl hidden sm:flex">
                    Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </section>
      )}

      {/* ===== LEADERBOARD PREVIEW ===== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-200" />
                  <h2 className="text-lg md:text-xl font-bold">Top Performers</h2>
                </div>
                <button
                  onClick={() => setCurrentView('leaderboard')}
                  className="text-white/90 text-sm font-semibold flex items-center hover:text-white hover:underline"
                >
                  View All <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-end justify-center gap-5 md:gap-8">
                <div className="text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl md:text-2xl mb-2 mx-auto ring-2 ring-white/40">
                    🥈
                  </div>
                  <p className="text-xs font-bold">Top Scorer</p>
                  <p className="text-[10px] text-white/70">98/100</p>
                </div>
                <div className="text-center -mt-4">
                  <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }}>
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-2xl md:text-3xl mb-2 mx-auto ring-4 ring-yellow-300/60 shadow-lg shadow-yellow-400/30">
                      🥇
                    </div>
                  </motion.div>
                  <p className="text-sm font-black">Champion</p>
                  <p className="text-xs text-white/70">100/100</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl md:text-2xl mb-2 mx-auto ring-2 ring-white/40">
                    🥉
                  </div>
                  <p className="text-xs font-bold">Performer</p>
                  <p className="text-[10px] text-white/70">95/100</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
          Why Choose <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">NEXTEXAM</span>?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: <GraduationCap className="h-6 w-6" />, title: 'Learn from Best', desc: 'Expert-curated questions', gradient: 'from-blue-500 to-cyan-500' },
            { icon: <Brain className="h-6 w-6" />, title: 'AI Analysis', desc: 'Smart performance insights', gradient: 'from-blue-600 to-sky-500' },
            { icon: <Flame className="h-6 w-6" />, title: 'Live Tests', desc: 'Real exam experience', gradient: 'from-orange-500 to-red-500' },
            { icon: <Globe className="h-6 w-6" />, title: 'Multi-language', desc: '10+ languages available', gradient: 'from-emerald-500 to-teal-500' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all text-center h-full group hover:-translate-y-1">
                <CardContent className="p-4 md:p-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
