'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Trophy, Flame, Star, Award,
  Clock, Target, TrendingUp, Crown, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileView() {
  const { user, setCurrentView, setShowAuthModal } = useAppStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => fetch(`/api/user/stats?userId=${user?.id}`).then((r) => r.json()).then((d) => d.stats),
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-950/30 dark:to-sky-950/30 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold mb-2">Sign in to view your profile</h2>
          <p className="text-sm text-muted-foreground mb-4">Track your progress and achievements</p>
          <Button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 font-bold rounded-xl"
          >
            Login / Register
          </Button>
        </div>
      </div>
    );
  }

  const level = Math.floor((stats?.xp || 0) / 500) + 1;
  const xpInLevel = (stats?.xp || 0) % 500;
  const xpPercent = (xpInLevel / 500) * 100;

  const subscriptionPlan = stats?.subscription?.plan || 'Free';
  const isPremium = stats?.subscription?.status === 'active';
  const planBadgeClass = {
    'Free': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    'Basic': 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    'Pro': 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
    'Elite': 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
  }[subscriptionPlan] || 'bg-gray-100 text-gray-600';

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">My Profile</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 h-28 relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
              </div>
              <CardContent className="p-5 -mt-12">
                <div className="flex items-end gap-4 mb-4">
                  <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-gray-900 shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-black">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pb-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg">{user.name}</h2>
                      <Badge className={`${planBadgeClass} border-0 text-[10px] font-bold`}>
                        {isPremium && <Crown className="h-3 w-3 mr-1" />}
                        {subscriptionPlan}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {/* Subscription & Rank Row */}
                <div className="flex items-center gap-3 mb-4">
                  {stats?.leaderboardRank && (
                    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-amber-600">Rank #{stats.leaderboardRank}</p>
                        <p className="text-[10px] text-muted-foreground">Leaderboard</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-950/30 rounded-xl px-3 py-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <div>
                      <p className="text-xs font-bold text-pink-600">{stats?.bookmarkCount || 0} Bookmarks</p>
                      <p className="text-[10px] text-muted-foreground">Saved questions</p>
                    </div>
                  </div>
                </div>

                {/* XP & Level */}
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-bold">Level {level}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{xpInLevel}/500 XP</span>
                  </div>
                  <Progress value={xpPercent} className="h-2.5 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-600" />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Total XP: <span className="font-bold text-blue-600">{stats?.xp || 0}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <BookOpen className="h-5 w-5" />, value: stats?.totalAttempts || 0, label: 'Tests Taken', gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20' },
              { icon: <Target className="h-5 w-5" />, value: `${stats?.avgScore?.toFixed(1) || 0}%`, label: 'Avg Score', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20' },
              { icon: <Trophy className="h-5 w-5" />, value: stats?.bestScore || 0, label: 'Best Score', gradient: 'from-amber-500 to-orange-500', bg: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20' },
              { icon: <Flame className="h-5 w-5" />, value: stats?.streak || 0, label: 'Day Streak', gradient: 'from-red-500 to-rose-500', bg: 'from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Card className="border-0 shadow-md text-center overflow-hidden">
                  <CardContent className={`p-4 bg-gradient-to-br ${stat.bg}`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Upgrade to Premium */}
          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="cursor-pointer"
              onClick={() => setCurrentView('premium')}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Crown className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Upgrade to Premium</h3>
                      <p className="text-sm text-white/80">Unlock unlimited tests, detailed solutions & more</p>
                    </div>
                    <Button className="bg-white text-blue-600 hover:bg-white/90 font-bold rounded-xl shadow-lg">
                      Upgrade
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity */}
          {stats?.recentAttempts && stats.recentAttempts.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentAttempts.slice(0, 10).map((attempt: any) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between py-2 border-b border-blue-100 dark:border-blue-900/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-semibold">{attempt.test?.title || 'Test'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-blue-600">{attempt.score}</p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.correctCount}/{attempt.correctCount + attempt.wrongCount + attempt.skippedCount} correct
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category-wise Performance */}
          {stats?.testsByCategory && stats.testsByCategory.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.testsByCategory.map((cat: any, i: number) => (
                    <div key={cat.name || i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{cat.name}</span>
                        <span className="font-bold text-blue-600">{cat.avgScore?.toFixed(0) || 0}%</span>
                      </div>
                      <Progress value={cat.avgScore || 0} className="h-2.5 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
