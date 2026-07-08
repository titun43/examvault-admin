'use client';

import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Clock, Zap, Trophy, Calendar,
  CheckCircle2, Play, ChevronRight, Flame, Star, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DailyQuizView() {
  const { setCurrentView, setSelectedTestId, user, setShowAuthModal } = useAppStore();

  // Fetch real daily quiz tests from the API (type=dailyQuiz)
  const { data: dailyQuizzes, isLoading } = useQuery({
    queryKey: ['daily-quizzes'],
    queryFn: () => fetch('/api/tests?type=dailyQuiz').then((r) => r.json()).then((d) => d.tests || []),
  });

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const streakDays = [true, true, true, true, false, false, false];
  streakDays[todayIndex] = true;

  const todaysQuiz = dailyQuizzes?.find((q: any) => q.isPublished);
  const hasQuizzes = dailyQuizzes && dailyQuizzes.length > 0;

  const handleStartQuiz = (testId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedTestId(testId);
    setCurrentView('take-test');
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
          <h1 className="text-xl md:text-2xl font-bold">Daily Quiz ⚡</h1>
          <p className="text-sm text-muted-foreground">New quiz every day!</p>
        </div>
      </motion.div>

      {/* Today's Challenge / No Quiz State */}
      {isLoading ? (
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-6 md:p-8 text-white h-48 animate-pulse" />
        </Card>
      ) : hasQuizzes && todaysQuiz ? (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-6 md:p-8 text-white relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4" />
              <div className="absolute bottom-0 left-10 w-24 h-24 bg-white/10 rounded-full translate-y-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-white/80" />
                  <span className="text-sm font-medium text-white/90">
                    {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2">{todaysQuiz.title}</h2>
                <p className="text-white/80 text-sm md:text-base">
                  {todaysQuiz.instructions || 'A fresh set of questions picked just for you!'}
                </p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm flex items-center gap-1">
                    <Zap className="h-3 w-3" /> {todaysQuiz._count?.questions || 0} Questions
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {todaysQuiz.duration} Minutes
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm flex items-center gap-1">
                    <Star className="h-3 w-3" /> {todaysQuiz.totalMarks} Marks
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        /* No daily quiz available */
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">No Daily Quiz Yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The admin hasn&apos;t published a daily quiz yet. Check back soon!
              </p>
              <Button onClick={() => setCurrentView('exams')} variant="outline" className="rounded-xl">
                Browse All Tests <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Start Quiz Button */}
      {hasQuizzes && todaysQuiz && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 hover:from-blue-600 hover:via-blue-700 hover:to-sky-600 text-white border-0 shadow-xl shadow-blue-500/30 rounded-2xl"
            onClick={() => handleStartQuiz(todaysQuiz.id)}
            disabled={(todaysQuiz._count?.questions || 0) === 0}
          >
            <Play className="mr-2 h-6 w-6" />
            {(todaysQuiz._count?.questions || 0) === 0 ? 'No Questions Added Yet' : "Start Today's Quiz"}
          </Button>
        </motion.div>
      )}

      {/* Weekly Streak Tracker */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-base">Weekly Streak</h3>
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-[10px] ml-auto">
                {streakDays.filter(Boolean).length} Day Streak 🔥
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              {weekDays.map((day, index) => {
                const isFilled = streakDays[index];
                const isToday = index === todayIndex;
                return (
                  <motion.div key={day} className="flex flex-col items-center gap-2" whileHover={{ scale: 1.1 }}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isFilled
                        ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : isToday
                          ? 'border-2 border-dashed border-blue-400 text-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      {isFilled ? <CheckCircle2 className="h-5 w-5" /> : day.charAt(0)}
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                      {day}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Daily Quizzes List */}
      {hasQuizzes && dailyQuizzes.length > 1 && (
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-bold text-lg">All Daily Quizzes</h3>
          </div>
          <div className="space-y-3">
            {dailyQuizzes.map((quiz: any) => (
              <motion.div key={quiz.id} variants={fadeUp}>
                <motion.div whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.99 }}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer" onClick={() => handleStartQuiz(quiz.id)}>
                    <CardContent className="p-0">
                      <div className="flex items-center">
                        <div className="w-2 self-stretch bg-gradient-to-b from-yellow-400 to-amber-500" />
                        <div className="flex-1 p-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm">{quiz.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {quiz._count?.questions || 0} Questions • {quiz.duration} min • {quiz.totalMarks} marks
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge variant="outline" className="text-[10px]">
                              {quiz._count?.testAttempts || 0} attempts
                            </Badge>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
