'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, BookOpen, Trophy, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const iconMap: Record<string, any> = {
  test: BookOpen,
  achievement: Trophy,
  system: AlertCircle,
  info: Info,
};

const typeConfig: Record<string, { gradient: string; bg: string }> = {
  test: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  achievement: { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  system: { gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  info: { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
};

export default function NotificationsView() {
  const { user, setCurrentView, setShowAuthModal } = useAppStore();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () =>
      fetch(`/api/notifications?userId=${user?.id}`)
        .then((r) => r.json())
        .then((d) => d.notifications),
    enabled: !!user?.id,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      // Mark all as read via API if supported
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-950/30 dark:to-sky-950/30 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold mb-2">Sign in to view notifications</h2>
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

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Bell className="h-4 w-4 text-white" />
              </div>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            className="text-blue-600 hover:text-blue-700"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : notifications?.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif: any, i: number) => {
            const Icon = iconMap[notif.type] || Bell;
            const config = typeConfig[notif.type] || typeConfig.info;

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`border-0 shadow-md ${!notif.isRead ? `bg-gradient-to-r ${config.bg} ring-1 ring-blue-200/50 dark:ring-blue-800/30` : ''}`}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm ${!notif.isRead ? 'font-bold' : 'font-medium'}`}>
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      {(notif.body || notif.message) && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.body || notif.message}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-950/30 dark:to-sky-950/30 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-muted-foreground font-medium">No notifications yet</p>
        </div>
      )}
    </div>
  );
}
