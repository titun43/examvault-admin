'use client';

import { useAppStore, View } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import {
  Bell, Search, GraduationCap, LogOut, User, ChevronDown,
  BookOpen, Trophy, TrendingUp, BarChart3, Menu, X,
  Home, Zap, Target, Bookmark, FileText,
  Newspaper, Crown, RotateCcw, Settings, HelpCircle, Share2, Sparkles, Flame,
  Sun, Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sidebar nav items with sections
interface NavItem {
  view: View;
  label: string;
  icon: React.ElementType;
  gradient: string;
  section: number;
}

const navItems: NavItem[] = [
  { view: 'home', label: 'Home', icon: Home, gradient: 'from-blue-600 to-blue-500', section: 1 },
  { view: 'exams', label: 'Exams', icon: BookOpen, gradient: 'from-blue-500 to-sky-500', section: 1 },
  { view: 'daily-quiz', label: 'Daily Quiz', icon: Zap, gradient: 'from-sky-500 to-blue-500', section: 2 },
  { view: 'practice', label: 'Practice', icon: Target, gradient: 'from-blue-600 to-indigo-500', section: 2 },
  { view: 'bookmarks', label: 'Bookmarks', icon: Bookmark, gradient: 'from-sky-500 to-blue-600', section: 3 },
  { view: 'leaderboard', label: 'Leaderboard', icon: Trophy, gradient: 'from-blue-500 to-sky-400', section: 3 },
  { view: 'current-affairs', label: 'Current Affairs', icon: Newspaper, gradient: 'from-blue-600 to-blue-400', section: 3 },
  { view: 'premium', label: 'Premium', icon: Crown, gradient: 'from-sky-500 to-blue-600', section: 4 },
  { view: 'notifications', label: 'Notifications', icon: Bell, gradient: 'from-blue-400 to-sky-500', section: 4 },
  { view: 'settings', label: 'Settings', icon: Settings, gradient: 'from-gray-400 to-slate-500', section: 4 },
  { view: 'settings', label: 'Help', icon: HelpCircle, gradient: 'from-blue-400 to-indigo-500', section: 4 },
  { view: 'home', label: 'Share App', icon: Share2, gradient: 'from-sky-500 to-blue-500', section: 4 },
];

const sectionLabels: Record<number, string> = {
  1: 'MAIN',
  2: 'PRACTICE',
  3: 'LEARN',
  4: 'MORE',
};

export default function Header() {
  const { currentView, setCurrentView, user, setUser, setShowAuthModal, setSelectedCategoryId, sidebarOpen, setSidebarOpen, setAuthMode } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === 'dark' ? 'light' : 'dark');
  };

  // Hidden admin access: triple-click on logo
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = useCallback(() => {
    clickCountRef.current += 1;
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      setCurrentView('admin-login');
      return;
    }
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current < 3) {
        setCurrentView('home');
      }
      clickCountRef.current = 0;
    }, 500);
  }, [setCurrentView]);

  // Hidden admin access: keyboard shortcut Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setCurrentView('admin-login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView]);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () =>
      fetch(`/api/notifications?userId=${user.id}`)
        .then((r) => r.json())
        .then((d) => d.notifications || []),
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => fetch(`/api/user/stats?userId=${user?.id}`).then((r) => r.json()).then((d) => d.stats),
    enabled: !!user?.id,
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
  };

  const handleNav = (view: View) => {
    if (view === 'exams') {
      setSelectedCategoryId(null);
    }
    setCurrentView(view);
    setSidebarOpen(false); // close sidebar on nav
  };

  const sections = [1, 2, 3, 4];
  const getItemsBySection = (section: number) => navItems.filter((item) => item.section === section);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-blue-100/50 dark:border-blue-900/30 bg-white/90 backdrop-blur-xl dark:bg-gray-900/90 shadow-sm">
        <div className="flex h-14 items-center justify-between px-3 md:px-4">
          {/* Left side: Menu button + Logo */}
          <div className="flex items-center gap-2">
            {/* Menu Button - opens left sidebar */}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 h-9 w-9 flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo - triple click for admin access */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 shadow-lg shadow-blue-500/25">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 bg-clip-text text-transparent hidden sm:inline">NEXTEXAM</span>
            </button>
          </div>

          {/* Center: Current page title (mobile) / Streak info (logged in) */}
          {user && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 px-3 py-1.5 rounded-xl">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{stats?.streak || 0} Day Streak</span>
              </div>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="rounded-xl h-9 w-9 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Dark/Light theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="rounded-xl h-9 w-9 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={mounted ? (resolvedTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark') : 'Toggle theme'}
            >
              {mounted ? (
                resolvedTheme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-600" />
                )
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="relative rounded-xl h-9 w-9 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={() => setCurrentView('notifications')}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-[8px] font-bold text-white px-1 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" type="button" className="flex items-center gap-1.5 px-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 h-9">
                    <Avatar className="h-7 w-7 ring-2 ring-blue-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-sky-500 text-white text-[10px] font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => setCurrentView('profile')} className="rounded-lg">
                    <User className="mr-2 h-4 w-4 text-blue-500" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('bookmarks')} className="rounded-lg">
                    <Bookmark className="mr-2 h-4 w-4 text-sky-500" /> Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCurrentView('settings')} className="rounded-lg">
                    <Settings className="mr-2 h-4 w-4 text-gray-500" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-700 hover:via-blue-600 hover:to-sky-600 text-white shadow-lg shadow-blue-500/25 font-bold rounded-xl h-9 text-xs"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exams, tests, topics..."
                    className="pl-9 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 rounded-xl focus:ring-blue-500/30"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===== LEFT SIDEBAR DRAWER (opens from header menu button) ===== */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar drawer */}
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-[70] w-[300px] bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white shadow-2xl flex flex-col"
            >
              {/* Decorative glow */}
              <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.4) 0%, rgba(59,130,246,0.15) 40%, transparent 70%)',
                  }}
                />
              </div>

              {/* Header with close button */}
              <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-white via-blue-200 to-sky-200 bg-clip-text text-transparent">NEXTEXAM</h1>
                    <p className="text-[10px] text-white/40 tracking-wider uppercase">Ace Your Exams</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User info in sidebar */}
              {user && (
                <div className="relative z-10 mx-4 mb-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-sm font-bold shadow-md">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  {stats && (
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1 text-xs">
                        <Flame className="h-3 w-3 text-orange-400" />
                        <span className="font-bold">{stats.streak || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Sparkles className="h-3 w-3 text-yellow-400" />
                        <span className="font-bold">Lv {Math.floor((stats.xp || 0) / 500) + 1}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Trophy className="h-3 w-3 text-amber-400" />
                        <span className="font-bold">{stats.bestScore || 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scrollable nav buttons */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {sections.map((section, sectionIndex) => (
                  <div key={section}>
                    {sectionIndex > 0 && (
                      <div className="relative my-3 mx-2">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                      </div>
                    )}

                    {/* Section label */}
                    <div className="px-3 pt-2 pb-1.5">
                      <span className="text-[10px] font-semibold tracking-[0.15em] text-white/30 uppercase">
                        {sectionLabels[section]}
                      </span>
                    </div>

                    {getItemsBySection(section).map((item, itemIndex) => {
                      const isActive = currentView === item.view && item.label !== 'Help' && item.label !== 'Share App';
                      const Icon = item.icon;

                      return (
                        <button
                          key={`${item.view}-${itemIndex}`}
                          onClick={() => handleNav(item.view)}
                          className={`
                            group relative w-full flex items-center gap-3 rounded-xl 
                            transition-all duration-200 ease-out cursor-pointer px-3 py-2.5
                            ${isActive
                              ? 'scale-[1.02] bg-gradient-to-r ' + item.gradient + ' shadow-lg'
                              : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                            }
                          `}
                          style={isActive ? { boxShadow: `0 4px 15px ${item.gradient.includes('blue') ? 'rgba(59,130,246,0.4)' : item.gradient.includes('sky') ? 'rgba(14,165,233,0.4)' : item.gradient.includes('indigo') ? 'rgba(99,102,241,0.4)' : item.gradient.includes('slate') ? 'rgba(100,116,139,0.4)' : 'rgba(59,130,246,0.4)'}` } : undefined}
                        >
                          {/* Active left indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                          )}

                          {/* Icon */}
                          <div className="relative flex-shrink-0">
                            {!isActive && (
                              <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-200`} />
                            )}
                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                              ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}
                            `}>
                              <Icon className={`w-[18px] h-[18px] transition-all duration-200 ${isActive ? 'text-white drop-shadow-sm' : 'text-white/60 group-hover:text-white'}`} />
                            </div>
                          </div>

                          {/* Label */}
                          <span className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                            {item.label}
                          </span>

                          {/* Active indicator */}
                          {isActive && (
                            <div className="ml-auto flex-shrink-0">
                              <Sparkles className="w-3.5 h-3.5 text-white/70" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer - Login if not logged in */}
              {!user && (
                <div className="relative z-10 p-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Login / Register
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
