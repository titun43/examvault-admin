'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

const periodTabs = [
  { id: 'daily' as const, label: 'Daily' },
  { id: 'weekly' as const, label: 'Weekly' },
  { id: 'monthly' as const, label: 'Monthly' },
];

export default function LeaderboardView() {
  const { setCurrentView, leaderboardPeriod, setLeaderboardPeriod, user } = useAppStore();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', leaderboardPeriod],
    queryFn: () => fetch(`/api/leaderboard?period=${leaderboardPeriod}`).then((r) => r.json()).then((d) => d.leaderboard),
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || '?';
  };

  const podiumAvatarBg = [
    'bg-gradient-to-br from-yellow-300 to-amber-400 ring-yellow-400 text-amber-800',
    'bg-gradient-to-br from-gray-200 to-slate-300 ring-gray-300 text-gray-600',
    'bg-gradient-to-br from-amber-300 to-orange-400 ring-amber-400 text-amber-700',
  ];

  const podiumBarBg = [
    'bg-gradient-to-t from-yellow-500 to-amber-400',
    'bg-gradient-to-t from-gray-400 to-slate-300',
    'bg-gradient-to-t from-orange-500 to-amber-400',
  ];

  const rankBadges = [
    { emoji: '🥇', label: 'Gold', gradient: 'from-yellow-400 to-amber-400' },
    { emoji: '🥈', label: 'Silver', gradient: 'from-gray-300 to-slate-300' },
    { emoji: '🥉', label: 'Bronze', gradient: 'from-amber-600 to-orange-500' },
  ];

  // Find user's rank
  const userEntry = leaderboard?.find((entry: any) => entry.userId === user?.id);
  const userRank = userEntry ? leaderboard.indexOf(userEntry) + 1 : null;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">Top performers across all tests</p>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-6">
        {periodTabs.map((tab) => {
          const isActive = leaderboardPeriod === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setLeaderboardPeriod(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-50 dark:bg-blue-950/30 text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-950/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* User's Rank Card */}
      {user && userRank && (
        <Card className="border-0 shadow-lg mb-6 overflow-hidden">
          <CardContent className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                #{userRank}
              </div>
              <div>
                <p className="font-bold text-sm">Your Ranking</p>
                <p className="text-xs text-muted-foreground">
                  {userEntry?.score || 0} points • {leaderboardPeriod} leaderboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Podium for Top 3 */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="mb-8">
          <div className="flex items-end justify-center gap-4 md:gap-6 mb-8">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <Avatar className={`h-14 w-14 md:h-16 md:w-16 mx-auto ring-3 mb-2 ${podiumAvatarBg[1]}`}>
                  <AvatarFallback className="font-bold text-lg bg-transparent">
                    {getInitials(leaderboard[1].user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-bold truncate max-w-20 md:max-w-28">{leaderboard[1].user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground font-semibold">{leaderboard[1].score} pts</p>
                <div className={`mt-2 ${podiumBarBg[1]} rounded-t-xl h-16 md:h-20 flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">🥈</span>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {leaderboard[0] && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center -mt-4"
              >
                <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Avatar className={`h-16 w-16 md:h-20 md:w-20 mx-auto ring-4 mb-2 ${podiumAvatarBg[0]} shadow-xl`}>
                    <AvatarFallback className="font-black text-xl bg-transparent">
                      {getInitials(leaderboard[0].user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <p className="text-sm font-black truncate max-w-24 md:max-w-32">{leaderboard[0].user?.name || 'User'}</p>
                <p className="text-xs font-bold text-amber-600">{leaderboard[0].score} pts</p>
                <div className={`mt-2 ${podiumBarBg[0]} rounded-t-xl h-24 md:h-28 flex items-center justify-center shadow-xl`}>
                  <span className="text-3xl">🥇</span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {leaderboard[2] && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <Avatar className={`h-14 w-14 md:h-16 md:w-16 mx-auto ring-3 mb-2 ${podiumAvatarBg[2]}`}>
                  <AvatarFallback className="font-bold text-lg bg-transparent">
                    {getInitials(leaderboard[2].user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs font-bold truncate max-w-20 md:max-w-28">{leaderboard[2].user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground font-semibold">{leaderboard[2].score} pts</p>
                <div className={`mt-2 ${podiumBarBg[2]} rounded-t-xl h-12 md:h-16 flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">🥉</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Full List */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="divide-y divide-blue-100 dark:divide-blue-900/50">
                {leaderboard.map((entry: any, i: number) => {
                  const isCurrentUser = entry.userId === user?.id;
                  const rankGradients = [
                    'from-yellow-400 to-amber-400',
                    'from-gray-300 to-slate-300',
                    'from-amber-600 to-orange-500',
                  ];
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 px-4 py-3 ${
                        isCurrentUser ? 'bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30' : ''
                      }`}
                    >
                      <div className="w-8 flex-shrink-0 flex items-center justify-center">
                        {i < 3 ? (
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${rankGradients[i]} flex items-center justify-center`}>
                            <span className="text-white text-xs font-black">{i + 1}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                        )}
                      </div>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className={`text-xs ${isCurrentUser ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold' : 'bg-muted'}`}>
                          {getInitials(entry.user?.name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                          {entry.user?.name || 'User'}
                          {isCurrentUser && <span className="text-xs ml-1 font-bold">(You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.correctCount || 0}/{(entry.correctCount || 0) + (entry.wrongCount || 0) + (entry.skippedCount || 0)} correct
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black">{entry.score}</p>
                        <p className="text-[10px] text-muted-foreground">points</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!leaderboard || leaderboard.length === 0) && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-950/30 dark:to-sky-950/30 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-muted-foreground font-medium">No leaderboard data for this period</p>
        </div>
      )}
    </div>
  );
}
