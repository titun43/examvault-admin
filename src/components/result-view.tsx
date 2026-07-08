'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Trophy, CheckCircle2, XCircle, MinusCircle,
  Clock, BarChart3, Brain, ArrowRight, RotateCcw, Users, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useEffect, useState } from 'react';

export default function ResultView() {
  const { lastResult, setCurrentView, setSelectedTestId, setSelectedSubjectId, selectedTestId, user } = useAppStore();
  const [animatedScore, setAnimatedScore] = useState(0);

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard-result', selectedTestId],
    queryFn: () => fetch(`/api/leaderboard?testId=${selectedTestId}`).then((r) => r.json()).then((d) => d.leaderboard),
    enabled: !!selectedTestId,
  });

  const result = lastResult;
  const test = result?.test;
  const questions = test?.questions || [];
  const answers = result?.answers || [];
  const bookmarkedQuestions: string[] = result?.bookmarkedQuestions || [];

  // Calculate score percentage
  const totalMarks = questions.reduce((sum: number, q: any) => sum + q.marks, 0);
  const scorePercent = totalMarks > 0 ? Math.round((result?.score || 0) / totalMarks * 100) : 0;

  // Animate score counter
  useEffect(() => {
    const target = result?.score || 0;
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [result?.score]);

  // Topic-wise breakdown
  const topicMap: Record<string, { correct: number; wrong: number; skipped: number; total: number }> = {};
  questions.forEach((q: any) => {
    const topic = q.topic || 'General';
    if (!topicMap[topic]) topicMap[topic] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
    topicMap[topic].total++;
    const answer = answers.find((a: any) => a.questionId === q.id);
    if (!answer?.selectedOption) topicMap[topic].skipped++;
    else if (answer.isCorrect) topicMap[topic].correct++;
    else topicMap[topic].wrong++;
  });

  const topicData = Object.entries(topicMap).map(([name, data]) => ({
    name,
    ...data,
    percent: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));

  // Find user rank in leaderboard
  const userRank = leaderboard?.findIndex((l: any) => l.userId === result?.userId) + 1;

  const getScoreGradient = (pct: number) => {
    if (pct >= 80) return 'from-blue-500 via-blue-400 to-sky-400';
    if (pct >= 50) return 'from-amber-500 via-orange-500 to-red-400';
    return 'from-red-500 via-rose-500 to-pink-500';
  };

  const getPerformanceRemark = (pct: number) => {
    if (pct >= 90) return 'Outstanding Performance! 🏆';
    if (pct >= 80) return 'Excellent Work! 🌟';
    if (pct >= 60) return 'Good Job! 👍';
    if (pct >= 40) return 'Keep Practicing! 📖';
    return 'Never Give Up! 💪';
  };

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg font-bold">No result data found</p>
          <Button onClick={() => setCurrentView('home')} className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')} className="rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Test Result</h1>
      </div>

      {/* Score Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden mb-6">
          <div className={`bg-gradient-to-br ${getScoreGradient(scorePercent)} text-white p-6 md:p-8 text-center relative`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
            <div className="relative">
              <div className="text-5xl md:text-6xl mb-2">{scorePercent >= 80 ? '🏆' : scorePercent >= 50 ? '🌟' : '💪'}</div>
              <div className="text-4xl md:text-5xl font-black mb-1">
                {animatedScore}
                <span className="text-xl font-normal opacity-70">/{totalMarks}</span>
              </div>
              <p className="text-lg font-bold opacity-90">{getPerformanceRemark(scorePercent)}</p>
              <p className="text-sm opacity-70 mt-1">{test?.title || 'Test Completed'}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm font-bold">
                  Score: {scorePercent}%
                </Badge>
                {userRank > 0 && (
                  <Badge className="bg-yellow-400/30 text-yellow-100 border-0 backdrop-blur-sm font-bold">
                    <Trophy className="h-3 w-3 mr-1" /> Rank #{userRank}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <CardContent className="p-5 md:p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30">
                <CheckCircle2 className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-blue-600">{result.correctCount}</p>
                <p className="text-xs text-muted-foreground font-medium">Correct</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30">
                <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-red-600">{result.wrongCount}</p>
                <p className="text-xs text-muted-foreground font-medium">Wrong</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <MinusCircle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-amber-600">{result.skippedCount}</p>
                <p className="text-xs text-muted-foreground font-medium">Skipped</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-black text-blue-600">
                  {Math.floor((result.timeTaken || 0) / 60)}m
                </p>
                <p className="text-xs text-muted-foreground font-medium">Time</p>
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold">Accuracy</span>
                <span className={`font-black ${scorePercent >= 80 ? 'text-blue-600' : scorePercent >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{scorePercent}%</span>
              </div>
              <Progress value={scorePercent} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Topic-wise Analysis */}
      {topicData.length > 0 && (
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              Topic-wise Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="correct" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Correct" />
                  <Bar dataKey="wrong" fill="#ef4444" radius={[4, 4, 0, 0]} name="Wrong" />
                  <Bar dataKey="skipped" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Skipped" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {topicData.map((topic) => (
                <div key={topic.name} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                  <span className="font-semibold">{topic.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 font-bold">{topic.correct}✓</span>
                    <span className="text-red-500 font-bold">{topic.wrong}✗</span>
                    <span className="text-amber-500 font-bold">{topic.skipped}—</span>
                    <Badge variant="outline" className="text-[10px] w-12 justify-center font-bold">
                      {topic.percent}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insight */}
      <Card className="border-0 shadow-lg mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-4 text-white">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h3 className="font-bold text-sm">Performance Insight</h3>
          </div>
        </div>
        <CardContent className="p-5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {scorePercent >= 80
              ? `🔥 Excellent performance! You scored ${scorePercent}% — you're among the top performers! Keep up the great work and focus on the few areas where you made mistakes.`
              : scorePercent >= 50
              ? `💪 Good effort! You scored ${scorePercent}%. Review the topics where you made mistakes and try to strengthen those areas. Practice more questions from your weak topics.`
              : `🌱 You scored ${scorePercent}%. Don't worry — every expert was once a beginner! Focus on understanding the concepts behind the questions you got wrong and practice regularly.`}
          </p>
        </CardContent>
      </Card>

      {/* Solutions */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            📝 Detailed Solutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {questions.map((q: any, i: number) => {
              const answer = answers.find((a: any) => a.questionId === q.id);
              const isCorrect = answer?.isCorrect;
              const wasSkipped = !answer?.selectedOption;
              const isBookmarked = bookmarkedQuestions.includes(q.id);

              return (
                <AccordionItem key={q.id} value={q.id}>
                  <AccordionTrigger className="text-left text-sm hover:no-underline">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-3 w-3 text-blue-600" />
                        </div>
                      ) : wasSkipped ? (
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <MinusCircle className="h-3 w-3 text-amber-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <XCircle className="h-3 w-3 text-red-600" />
                        </div>
                      )}
                      <span className="text-xs font-medium">Q{i + 1}. {q.text?.substring(0, 60)}...</span>
                      {isBookmarked && <Heart className="h-3 w-3 text-pink-500 fill-current flex-shrink-0" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-6">
                      <p className="text-sm">{q.text}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const optionText = q[`option${opt}`];
                          if (!optionText) return null;
                          const isCorrectOpt = q.correctAnswer === opt;
                          const isSelectedOpt = answer?.selectedOption === opt;
                          return (
                            <div key={opt} className={`p-2 rounded-lg font-medium ${
                              isCorrectOpt ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200' 
                              : isSelectedOpt ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200' 
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                              {opt}. {optionText}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40 rounded-xl p-3 text-xs">
                          <p className="font-bold text-blue-600 dark:text-blue-400 mb-1">💡 Explanation:</p>
                          <p className="text-foreground/80 dark:text-gray-200">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pb-24 md:pb-6">
        <Button
          onClick={() => {
            setSelectedTestId(selectedTestId);
            setCurrentView('take-test');
          }}
          variant="outline"
          className="flex-1 rounded-xl font-bold"
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Retake Test
        </Button>
        {bookmarkedQuestions.length > 0 && (
          <Button
            onClick={() => setCurrentView('bookmarks')}
            variant="outline"
            className="flex-1 rounded-xl font-bold border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/30"
          >
            <Heart className="h-4 w-4 mr-2" /> Review Bookmarks ({bookmarkedQuestions.length})
          </Button>
        )}
        <Button
          onClick={() => setCurrentView('leaderboard')}
          variant="outline"
          className="flex-1 rounded-xl font-bold"
        >
          <Users className="h-4 w-4 mr-2" /> Leaderboard
        </Button>
        <Button
          onClick={() => setCurrentView('home')}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 font-bold rounded-xl"
        >
          <ArrowRight className="h-4 w-4 mr-2" /> Back to Home
        </Button>
      </div>
    </div>
  );
}
