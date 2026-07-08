'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Clock, Flag, X, CheckCircle2,
  AlertTriangle, Loader2, ChevronDown, ChevronUp, Heart,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface UserAnswer {
  questionId: string;
  selectedOption: string | null;
  isMarked: boolean;
  timeTaken: number;
  visited: boolean;
  isBookmarked: boolean;
}

export default function TakeTestView() {
  const {
    selectedTestId, setCurrentView, currentAttemptId, setCurrentAttemptId,
    setLastResult, user
  } = useAppStore();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const autoSubmittedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentQTime, setCurrentQTime] = useState(0);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());

  // Fetch test data
  const { data: testData, isLoading } = useQuery({
    queryKey: ['test', selectedTestId],
    queryFn: () => fetch(`/api/tests/${selectedTestId}`).then((r) => r.json()).then((d) => d.test),
    enabled: !!selectedTestId,
  });

  // Start attempt
  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tests/${selectedTestId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.attempt) {
        setCurrentAttemptId(data.attempt.id);
      }
    },
    onError: () => {
      toast.error('Failed to start test. Please try again.');
      setCurrentView('test-list');
    },
  });

  // Submit attempt
  const submitMutation = useMutation({
    mutationFn: async () => {
      const answersArray = Object.values(answers).map((a) => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        timeTaken: a.timeTaken,
        isMarked: a.isMarked,
      }));

      const totalTime = testData?.duration ? testData.duration * 60 - timeLeft : 0;

      const res = await fetch(`/api/tests/${selectedTestId}/attempt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: currentAttemptId,
          userId: user?.id,
          answers: answersArray,
          timeTaken: totalTime,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      setLastResult({ ...data.result, bookmarkedQuestions: Array.from(bookmarkedQuestions) });
      setCurrentView('result');
      toast.success('Test submitted successfully! 🎉');
    },
    onError: () => {
      toast.error('Failed to submit test. Please try again.');
    },
  });

  // Initialize test - using ref to avoid synchronous setState in effect
  const initializedRef = useRef(false);
  useEffect(() => {
    if (testData && !currentAttemptId && !startAttemptMutation.isPending && !initializedRef.current) {
      initializedRef.current = true;
      // Schedule in a microtask to avoid synchronous setState in effect
      setTimeout(() => {
        const initialAnswers: Record<string, UserAnswer> = {};
        testData.questions?.forEach((q: any, i: number) => {
          initialAnswers[q.id] = {
            questionId: q.id,
            selectedOption: null,
            isMarked: false,
            timeTaken: 0,
            visited: i === 0,
            isBookmarked: false,
          };
        });
        setAnswers(initialAnswers);
        setTimeLeft(testData.duration * 60);
        startAttemptMutation.mutate();
      }, 0);
    }
  }, [testData, currentAttemptId, startAttemptMutation.isPending]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || !currentAttemptId) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Trigger auto-submit once when the timer hits zero. Uses a ref
          // guard so we never double-submit, and the side-effect lives in
          // the interval callback (not inside a state updater or effect
          // body) to avoid React cascading-render warnings.
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            setAutoSubmitted(true);
            submitMutation.mutate();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentAttemptId, timeLeft === 0]);

  // Question timer
  const prevQRef = useRef(currentQ);
  useEffect(() => {
    if (prevQRef.current !== currentQ) {
      prevQRef.current = currentQ;
    }
    questionTimerRef.current = setInterval(() => {
      setCurrentQTime((prev) => prev + 1);
    }, 1000);
    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentQ]);

  // Save time on question change
  useEffect(() => {
    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentQ]);

  const questions = testData?.questions || [];
  const currentQuestion = questions[currentQ];

  // Guard: no test selected → go home
  useEffect(() => {
    if (!selectedTestId) {
      setCurrentView('home');
    }
  }, [selectedTestId, setCurrentView]);

  // Guard: not logged in → prompt login instead of failing silently
  useEffect(() => {
    if (!user && !isLoading) {
      toast.error('Please log in to start a test.');
      setCurrentView('home');
    }
  }, [user, isLoading, setCurrentView]);

  const handleSelectOption = (option: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: option,
        visited: true,
      },
    }));
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: null,
      },
    }));
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        isMarked: !prev[currentQuestion.id].isMarked,
        visited: true,
      },
    }));
  };

  const handleBookmark = () => {
    if (!currentQuestion || !user) return;
    const qId = currentQuestion.id;
    if (bookmarkedQuestions.has(qId)) {
      setBookmarkedQuestions((prev) => {
        const next = new Set(prev);
        next.delete(qId);
        return next;
      });
      // Remove bookmark from API
      fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, questionId: qId }),
      }).catch(() => {});
    } else {
      setBookmarkedQuestions((prev) => new Set(prev).add(qId));
      // Add bookmark via API
      fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, questionId: qId }),
      }).catch(() => {});
    }
    setAnswers((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], isBookmarked: !prev[qId]?.isBookmarked },
    }));
  };

  const handleNavigate = (index: number) => {
    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          timeTaken: (prev[currentQuestion.id]?.timeTaken || 0) + currentQTime,
          visited: true,
        },
      }));
    }
    setCurrentQ(index);
    setShowQuestionNav(false);
  };

  const handleSubmit = () => {
    const answered = Object.values(answers).filter((a) => a.selectedOption).length;
    if (answered === 0) {
      toast.error('Please answer at least one question before submitting.');
      return;
    }
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    setTimeout(() => {
      submitMutation.mutate();
    }, 100);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.values(answers).filter((a) => a.selectedOption).length;
  const markedCount = Object.values(answers).filter((a) => a.isMarked).length;
  const visitedCount = Object.values(answers).filter((a) => a.visited).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (isLoading || startAttemptMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-lg font-bold">Loading your test...</p>
          <p className="text-sm text-muted-foreground">Please wait while we prepare your questions</p>
        </div>
      </div>
    );
  }

  // Guard: test loaded but has no questions → show error instead of crashing
  if (!testData || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-bold mb-2">Test Not Available</p>
          <p className="text-sm text-muted-foreground mb-4">
            This test has no questions yet or failed to load. Please try another test.
          </p>
          <Button onClick={() => setCurrentView('test-list')} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  if (autoSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-bold">Time&apos;s Up!</p>
          <p className="text-sm text-muted-foreground">Your test has been auto-submitted</p>
          <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Test Header Bar */}
      <div className="sticky top-14 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-blue-100 dark:border-blue-900/50 shadow-sm -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
                  setCurrentView('test-list');
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{testData?.title}</p>
              <p className="text-xs text-muted-foreground">
                Q {currentQ + 1} of {questions.length}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold ${
            timeLeft < 300 
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse shadow-lg shadow-red-500/30' 
              : timeLeft < 600 
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-500/25' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
          }`}>
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercent} className="mt-2 h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-blue-600" />
      </div>

      {/* Question Navigation Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mb-4 flex items-center justify-between rounded-xl border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30"
        onClick={() => setShowQuestionNav(!showQuestionNav)}
      >
        <span className="text-xs font-medium">
          {answeredCount} answered • {markedCount} marked • {questions.length - visitedCount} not visited
        </span>
        {showQuestionNav ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {/* Question Navigation Panel */}
      <AnimatePresence>
        {showQuestionNav && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <Card className="border-0 shadow-md">
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-2">
                  {questions.map((q: any, i: number) => {
                    const a = answers[q.id];
                    const isAnswered = a?.selectedOption;
                    const isMarked = a?.isMarked;
                    const isVisited = a?.visited;
                    const isBookmarked = a?.isBookmarked;

                    let bgClass = 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
                    if (isMarked && isAnswered) bgClass = 'bg-blue-100 text-blue-700 ring-2 ring-blue-400 dark:bg-blue-950/40 dark:text-blue-400';
                    else if (isMarked) bgClass = 'bg-red-100 text-red-600 ring-2 ring-red-400 dark:bg-red-950/40 dark:text-red-400';
                    else if (isAnswered) bgClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
                    else if (isVisited) bgClass = 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400';

                    return (
                      <button
                        key={q.id}
                        onClick={() => handleNavigate(i)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all relative ${bgClass} ${
                          i === currentQ ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        }`}
                      >
                        {i + 1}
                        {isBookmarked && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/40 inline-block" /> Answered</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 dark:bg-red-950/40 inline-block" /> Marked</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950/40 inline-block" /> Visited</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 inline-block" /> Not Visited</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Card */}
      {currentQuestion && (
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-0 shadow-lg mb-4 overflow-hidden">
            <CardContent className="p-5 md:p-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs font-bold">
                    Q {currentQ + 1}
                  </Badge>
                  {currentQuestion.topic && (
                    <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">
                      {currentQuestion.topic}
                    </Badge>
                  )}
                  <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-0 text-[10px] font-bold">
                    +{currentQuestion.marks} {currentQuestion.negativeMarks > 0 && `/ -${currentQuestion.negativeMarks}`}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {/* Bookmark Button */}
                  <button
                    onClick={handleBookmark}
                    className={`p-1.5 rounded-lg transition-all ${
                      answers[currentQuestion.id]?.isBookmarked
                        ? 'text-pink-500 bg-pink-50 dark:bg-pink-950/30'
                        : 'text-muted-foreground hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/30'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${answers[currentQuestion.id]?.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  {answers[currentQuestion.id]?.isMarked && (
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-[10px] font-bold">
                      <Flag className="h-3 w-3 mr-1" /> Marked
                    </Badge>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-sm md:text-base leading-relaxed font-medium">
                  {currentQuestion.text}
                </p>
                {currentQuestion.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question image"
                      className="max-w-full rounded-xl border"
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <RadioGroup
                value={answers[currentQuestion.id]?.selectedOption || ''}
                onValueChange={handleSelectOption}
                className="space-y-3"
              >
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optionText = currentQuestion[`option${opt}` as keyof typeof currentQuestion];
                  if (!optionText) return null;
                  const isSelected = answers[currentQuestion.id]?.selectedOption === opt;
                  const optionColors: Record<string, string> = {
                    A: 'from-blue-500 to-cyan-500',
                    B: 'from-emerald-500 to-teal-500',
                    C: 'from-blue-500 to-sky-500',
                    D: 'from-orange-500 to-amber-500',
                  };
                  return (
                    <div
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? `border-blue-500 bg-blue-50 dark:bg-blue-950/70 shadow-md shadow-blue-500/10`
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleSelectOption(opt)}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${isSelected ? `bg-gradient-to-br ${optionColors[opt]} shadow-sm text-white` : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100'}`}>
                        {opt}
                      </div>
                      <Label htmlFor={`option-${opt}`} className="cursor-pointer flex-1 text-sm text-gray-900 dark:text-gray-50 font-medium">
                        {optionText}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkForReview}
          className={`rounded-xl ${answers[currentQuestion?.id]?.isMarked ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-sm' : 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30'}`}
        >
          <Flag className="h-4 w-4 mr-1" />
          {answers[currentQuestion?.id]?.isMarked ? 'Unmark' : 'Mark for Review'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClearResponse}
          disabled={!answers[currentQuestion?.id]?.selectedOption}
          className="rounded-xl"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleBookmark}
          className={`rounded-xl ${
            answers[currentQuestion?.id]?.isBookmarked
              ? 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800'
              : 'border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950/30'
          }`}
        >
          <Heart className={`h-4 w-4 mr-1 ${answers[currentQuestion?.id]?.isBookmarked ? 'fill-current' : ''}`} />
          {answers[currentQuestion?.id]?.isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </Button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pb-24 md:pb-6">
        <Button
          variant="outline"
          onClick={() => handleNavigate(currentQ - 1)}
          disabled={currentQ === 0}
          className="rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        {currentQ === questions.length - 1 ? (
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 font-bold rounded-xl"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-1" />
            )}
            Submit Test
          </Button>
        ) : (
          <Button
            onClick={() => handleNavigate(currentQ + 1)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 font-bold rounded-xl"
          >
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between font-medium">
              <span>Total Questions</span>
              <span className="font-bold">{questions.length}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>✅ Answered</span>
              <span className="font-bold">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-red-500">
              <span>🚩 Marked for Review</span>
              <span className="font-bold">{markedCount}</span>
            </div>
            <div className="flex justify-between text-pink-500">
              <span>❤️ Bookmarked</span>
              <span className="font-bold">{bookmarkedQuestions.size}</span>
            </div>
            <div className="flex justify-between text-amber-500">
              <span>❌ Not Answered</span>
              <span className="font-bold">{questions.length - answeredCount}</span>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Continue Test</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl font-bold"
            >
              Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
