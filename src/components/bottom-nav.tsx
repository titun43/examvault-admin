'use client';

import { useAppStore } from '@/lib/store';
import { Home, BookOpen, Zap, Newspaper, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { view: 'home' as const, label: 'Home', icon: Home, gradient: 'from-blue-600 to-blue-500', color: 'text-blue-600' },
  { view: 'exams' as const, label: 'Exams', icon: BookOpen, gradient: 'from-blue-500 to-sky-500', color: 'text-blue-500' },
  { view: 'daily-quiz' as const, label: 'Quiz', icon: Zap, gradient: 'from-sky-500 to-blue-500', color: 'text-sky-500' },
  { view: 'current-affairs' as const, label: 'Current Affairs', icon: Newspaper, gradient: 'from-blue-600 to-sky-400', color: 'text-blue-600' },
  { view: 'profile' as const, label: 'Profile', icon: User, gradient: 'from-blue-500 to-indigo-500', color: 'text-blue-500' },
];

export default function BottomNav() {
  const { currentView, setCurrentView, setSelectedCategoryId } = useAppStore();

  const handleNav = (view: string) => {
    if (view === 'exams') {
      setSelectedCategoryId(null);
    }
    setCurrentView(view as any);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-blue-100 dark:border-blue-900/30 shadow-[0_-4px_30px_rgba(59,130,246,0.08)]">
        <div className="flex items-center justify-around h-16 px-0.5">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.view)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-all min-w-[48px] relative ${
                  isActive ? 'scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className={`absolute -top-0.5 w-8 h-1 rounded-full bg-gradient-to-r ${item.gradient}`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative">
                  {isActive && (
                    <div className={`absolute -inset-2 bg-gradient-to-br ${item.gradient} rounded-xl opacity-15`} />
                  )}
                  <Icon
                    className={`h-5 w-5 relative z-10 transition-all duration-200 ${isActive ? item.color : ''}`}
                    style={isActive ? { strokeWidth: 2.5 } : {}}
                  />
                </div>
                <span className={`text-[9px] leading-tight ${isActive ? `font-bold ${item.color}` : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
