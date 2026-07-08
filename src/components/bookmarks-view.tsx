'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bookmark, BookOpen, FileText,
  Sparkles, Heart, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function BookmarksView() {
  const { setCurrentView, user, setShowAuthModal } = useAppStore();

  const { data: bookmarks, isLoading, refetch } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: () => fetch(`/api/bookmarks?userId=${user?.id}`).then((r) => r.json()).then((d) => d.bookmarks || []),
    enabled: !!user?.id,
  });

  const removeBookmarkMutation = useMutation({
    mutationFn: async ({ userId, questionId }: { userId: string; questionId: string }) => {
      const res = await fetch('/api/bookmarks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionId }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success('Bookmark removed');
      refetch();
    },
    onError: () => {
      toast.error('Failed to remove bookmark');
    },
  });

  const handleRemove = (questionId: string) => {
    if (!user) return;
    removeBookmarkMutation.mutate({ userId: user.id, questionId });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-950/30 dark:to-sky-950/30 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold mb-2">Sign in to view bookmarks</h2>
          <Button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold rounded-xl"
          >
            Login / Register
          </Button>
        </div>
      </div>
    );
  }

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
              <Bookmark className="h-4 w-4 text-white" />
            </div>
            Bookmarks
          </h1>
          <p className="text-sm text-muted-foreground">{bookmarks?.length || 0} saved questions</p>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : bookmarks && bookmarks.length > 0 ? (
        <div className="space-y-4">
          {bookmarks.map((bookmark: any, i: number) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-1.5 bg-gradient-to-b from-blue-500 to-blue-600 flex-shrink-0" />
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Context tags */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {bookmark.question?.test?.subject?.name && (
                              <Badge className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-0 text-[10px] font-semibold">
                                <BookOpen className="h-2.5 w-2.5 mr-1" />
                                {bookmark.question.test.subject.name}
                              </Badge>
                            )}
                            {bookmark.question?.test?.title && (
                              <Badge variant="outline" className="text-[10px] font-semibold">
                                <FileText className="h-2.5 w-2.5 mr-1" />
                                {bookmark.question.test.title}
                              </Badge>
                            )}
                          </div>
                          {/* Question text */}
                          <p className="text-sm font-medium leading-relaxed line-clamp-3">
                            {bookmark.question?.text || 'Question not available'}
                          </p>
                          {/* Options preview */}
                          {bookmark.question && (
                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                              {['A', 'B', 'C', 'D'].map((opt) => {
                                const optText = bookmark.question[`option${opt}`];
                                if (!optText) return null;
                                const isCorrect = bookmark.question.correctAnswer === opt;
                                return (
                                  <div key={opt} className={`text-xs p-1.5 rounded-md ${
                                    isCorrect ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-medium' : 'bg-muted/30 text-muted-foreground'
                                  }`}>
                                    {opt}. {optText.substring(0, 40)}{optText.length > 40 ? '...' : ''}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                          onClick={() => handleRemove(bookmark.questionId)}
                          disabled={removeBookmarkMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-950/30 dark:via-blue-950/30 dark:to-sky-950/30 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
                  >
                    <Bookmark className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">No bookmarks yet!</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Start saving questions you want to revisit. Tap the heart icon on any question during a test to save it here.
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full mx-auto mb-6" />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 px-8 h-12 font-bold rounded-xl"
                  onClick={() => setCurrentView('exams')}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Browse Subjects
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
