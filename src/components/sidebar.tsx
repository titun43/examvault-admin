'use client';

import { useAppStore, View } from '@/lib/store';
import {
  Home,
  BookOpen,
  Zap,
  Target,
  Bookmark,
  GraduationCap,
  Newspaper,
  Crown,
  Trophy,
  Bell,
  Settings,
  HelpCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
} from 'lucide-react';

interface NavItem {
  view: View;
  label: string;
  icon: React.ElementType;
  gradient: string;
  shadowColor: string;
  section: number;
}

const navItems: NavItem[] = [
  // Section 1 - MAIN
  { view: 'home', label: 'Home', icon: Home, gradient: 'from-blue-600 to-blue-500', shadowColor: 'rgba(37,99,235,0.4)', section: 1 },
  { view: 'exams', label: 'Exams', icon: BookOpen, gradient: 'from-blue-500 to-sky-500', shadowColor: 'rgba(59,130,246,0.4)', section: 1 },

  // Section 2 - PRACTICE
  { view: 'daily-quiz', label: 'Daily Quiz', icon: Zap, gradient: 'from-sky-500 to-blue-500', shadowColor: 'rgba(14,165,233,0.4)', section: 2 },
  { view: 'practice', label: 'Practice', icon: Target, gradient: 'from-blue-600 to-indigo-500', shadowColor: 'rgba(37,99,235,0.4)', section: 2 },

  // Section 3 - LEARN
  { view: 'bookmarks', label: 'Bookmarks', icon: Bookmark, gradient: 'from-blue-400 to-blue-600', shadowColor: 'rgba(96,165,250,0.4)', section: 3 },
  { view: 'leaderboard', label: 'Leaderboard', icon: Trophy, gradient: 'from-blue-500 to-sky-400', shadowColor: 'rgba(59,130,246,0.4)', section: 3 },
  { view: 'current-affairs', label: 'Current Affairs', icon: Newspaper, gradient: 'from-blue-600 to-blue-400', shadowColor: 'rgba(37,99,235,0.4)', section: 3 },

  // Section 4 - MORE
  { view: 'premium', label: 'Premium', icon: Crown, gradient: 'from-sky-500 to-blue-600', shadowColor: 'rgba(14,165,233,0.4)', section: 4 },
  { view: 'notifications', label: 'Notifications', icon: Bell, gradient: 'from-blue-400 to-sky-500', shadowColor: 'rgba(96,165,250,0.4)', section: 4 },
  { view: 'settings', label: 'Settings', icon: Settings, gradient: 'from-gray-400 to-slate-500', shadowColor: 'rgba(156,163,175,0.4)', section: 4 },
  { view: 'settings', label: 'Help', icon: HelpCircle, gradient: 'from-blue-400 to-indigo-500', shadowColor: 'rgba(96,165,250,0.4)', section: 4 },
  { view: 'home', label: 'Share', icon: Share2, gradient: 'from-sky-500 to-blue-500', shadowColor: 'rgba(14,165,233,0.4)', section: 4 },
];

const sectionLabels: Record<number, string> = {
  1: 'MAIN',
  2: 'PRACTICE',
  3: 'LEARN',
  4: 'MORE',
};

export default function Sidebar() {
  const { currentView, setCurrentView, setSelectedCategoryId, sidebarOpen, setSidebarOpen, user, setShowAuthModal, setAuthMode } = useAppStore();

  const handleNav = (view: View) => {
    if (view === 'exams') {
      setSelectedCategoryId(null);
    }
    setCurrentView(view);
  };

  const sections = [1, 2, 3, 4];
  const getItemsBySection = (section: number) => navItems.filter((item) => item.section === section);

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 
        bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white
        transition-all duration-300 ease-in-out
        ${!sidebarOpen ? 'w-20' : 'w-64'}
        border-r border-white/5
      `}
    >
      {/* Decorative glow at top */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% -20%, rgba(37,99,235,0.4) 0%, rgba(59,130,246,0.15) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* Logo area */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-5 pb-4 min-h-[72px]">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-blue-200 to-sky-200 bg-clip-text text-transparent whitespace-nowrap">
              NEXTEXAM
            </h1>
            <p className="text-[10px] text-white/40 -mt-0.5 tracking-wider uppercase">Ace Your Exams</p>
          </div>
        )}
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {sections.map((section, sectionIndex) => (
          <div key={section}>
            {/* Section divider */}
            {sectionIndex > 0 && (
              <div className="relative my-3 mx-2">
                <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              </div>
            )}

            {/* Section label */}
            {!sidebarOpen && (
              <div className="px-3 pt-2 pb-1.5">
                <span className="text-[10px] font-semibold tracking-[0.15em] text-white/30 uppercase">
                  {sectionLabels[section]}
                </span>
              </div>
            )}

            {getItemsBySection(section).map((item, itemIndex) => {
              const isActive = currentView === item.view && item.label !== 'Help' && item.label !== 'Share';
              const Icon = item.icon;

              return (
                <button
                  key={`${item.view}-${itemIndex}`}
                  onClick={() => handleNav(item.view)}
                  className={`
                    group relative w-full flex items-center gap-3 rounded-xl 
                    transition-all duration-200 ease-out cursor-pointer
                    ${!sidebarOpen ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                    ${isActive
                      ? 'scale-[1.02] bg-gradient-to-r ' + item.gradient + ' shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                    }
                  `}
                  style={isActive ? { boxShadow: `0 4px 20px ${item.shadowColor}, 0 0 0 1px rgba(255,255,255,0.1)` } : undefined}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {/* Active left indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  )}

                  {/* Icon container */}
                  <div className="relative flex-shrink-0">
                    {!isActive && (
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-200`} />
                    )}
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-white/20'
                        : 'bg-white/5 group-hover:bg-white/10'
                      }
                    `}>
                      <Icon className={`w-[18px] h-[18px] transition-all duration-200 ${isActive ? 'text-white drop-shadow-sm' : 'text-white/60 group-hover:text-white'}`} />
                    </div>
                  </div>

                  {/* Label text */}
                  {!sidebarOpen && (
                    <span className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                  )}

                  {/* Active sparkles indicator */}
                  {isActive && !sidebarOpen && (
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

      {/* Collapse toggle + footer */}
      <div className="relative z-10 mt-auto border-t border-white/10">
        {/* User info / Login */}
        <div className="px-3 pt-3 pb-2">
          {user ? (
            <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/20">
                {user.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              {!sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
                  <p className="text-[11px] text-white/40 truncate">{user.email || ''}</p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className={`
                w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-gradient-to-r from-blue-600 to-sky-500 
                hover:from-blue-500 hover:to-sky-400
                text-white text-sm font-semibold
                shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                transition-all duration-200 cursor-pointer
                ${!sidebarOpen ? 'px-2' : 'px-4'}
              `}
            >
              <User className="w-4 h-4" />
              {!sidebarOpen && <span>Login</span>}
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center gap-2 py-3 text-white/40 hover:text-white/80 transition-colors duration-200 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors duration-200">
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
          {!sidebarOpen && (
            <span className="text-xs font-medium">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
