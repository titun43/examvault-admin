'use client';

import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  ArrowLeft, User, Lock, Mail, Palette, Moon, Type,
  Bell, BellRing, AlertCircle, Clock, Globe, BarChart3,
  HelpCircle, Bug, Star, Trash2, LogOut, ChevronRight,
  Shield, Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
}

function SettingRow({ icon, label, subtitle, rightElement, onClick }: SettingRowProps) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.99 }}
      className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-muted/30 rounded-xl transition-colors"
      onClick={onClick}
    >
      <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {rightElement || <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />}
    </motion.div>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  gradient?: string;
}

function ToggleSwitch({ enabled, onToggle, gradient = 'from-blue-500 to-blue-600' }: ToggleSwitchProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
        enabled ? `bg-gradient-to-r ${gradient}` : 'bg-muted'
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ left: enabled ? 'calc(100% - 22px)' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

interface SectionCardProps {
  title: string;
  gradient: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ title, gradient, icon, children }: SectionCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className={`w-1 self-stretch bg-gradient-to-b ${gradient} absolute left-0 top-0 bottom-0`} />
          <div className="relative">
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm`}>
                {icon}
              </div>
              <h3 className="font-bold text-sm">{title}</h3>
            </div>
            <div className="px-4 pb-2">
              {children}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SettingsView() {
  const { setCurrentView } = useAppStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const darkMode = mounted ? (resolvedTheme === 'dark') : false;
  const toggleDarkMode = () => setTheme(darkMode ? 'light' : 'dark');

  // Toggle states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [testReminders, setTestReminders] = useState(true);
  const [emailPreferences, setEmailPreferences] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timerSetting, setTimerSetting] = useState<'on' | 'off' | 'flexible'>('on');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-4 pb-20 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('home')}
          className="flex-shrink-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Settings ⚙️</h1>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
        {/* Account Section */}
        <SectionCard title="Account" gradient="from-blue-500" icon={<Shield className="h-3.5 w-3.5" />}>
          <SettingRow icon={<User className="h-4 w-4" />} label="Edit Profile" subtitle="Update your name and avatar" />
          <SettingRow icon={<Lock className="h-4 w-4" />} label="Change Password" subtitle="Update your security credentials" />
          <SettingRow
            icon={<Mail className="h-4 w-4" />}
            label="Email Preferences"
            subtitle="Manage email notifications"
            rightElement={
              <ToggleSwitch enabled={emailPreferences} onToggle={() => setEmailPreferences(!emailPreferences)} gradient="from-blue-500 to-blue-600" />
            }
          />
        </SectionCard>

        {/* Appearance Section */}
        <SectionCard title="Appearance" gradient="from-blue-500" icon={<Palette className="h-3.5 w-3.5" />}>
          <SettingRow
            icon={darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            label="Dark Mode"
            subtitle={darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
            rightElement={
              <ToggleSwitch enabled={darkMode} onToggle={toggleDarkMode} gradient="from-blue-500 to-blue-600" />
            }
          />
          <div className="py-3 px-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 text-muted-foreground">
                <Type className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Font Size</p>
              </div>
            </div>
            <div className="flex gap-2 ml-12">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <motion.button
                  key={size}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    fontSize === size
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Notifications Section */}
        <SectionCard title="Notifications" gradient="from-blue-500" icon={<Bell className="h-3.5 w-3.5" />}>
          <SettingRow
            icon={<BellRing className="h-4 w-4" />}
            label="Push Notifications"
            subtitle="Get instant alerts on your device"
            rightElement={
              <ToggleSwitch enabled={pushNotifications} onToggle={() => setPushNotifications(!pushNotifications)} gradient="from-blue-500 to-blue-600" />
            }
          />
          <SettingRow
            icon={<Mail className="h-4 w-4" />}
            label="Email Alerts"
            subtitle="Receive important updates via email"
            rightElement={
              <ToggleSwitch enabled={emailAlerts} onToggle={() => setEmailAlerts(!emailAlerts)} gradient="from-blue-500 to-blue-600" />
            }
          />
          <SettingRow
            icon={<AlertCircle className="h-4 w-4" />}
            label="Test Reminders"
            subtitle="Never miss a scheduled test"
            rightElement={
              <ToggleSwitch enabled={testReminders} onToggle={() => setTestReminders(!testReminders)} gradient="from-blue-500 to-blue-600" />
            }
          />
        </SectionCard>

        {/* Study Section */}
        <SectionCard title="Study" gradient="from-blue-500" icon={<BarChart3 className="h-3.5 w-3.5" />}>
          <SettingRow icon={<Globe className="h-4 w-4" />} label="Default Language" subtitle="English" />
          <div className="py-3 px-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Difficulty Level</p>
              </div>
            </div>
            <div className="flex gap-2 ml-12">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    difficulty === level
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="py-3 px-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 text-muted-foreground">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Timer Settings</p>
              </div>
            </div>
            <div className="flex gap-2 ml-12">
              {(['on', 'off', 'flexible'] as const).map((setting) => (
                <motion.button
                  key={setting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimerSetting(setting)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    timerSetting === setting
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {setting}
                </motion.button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Support Section */}
        <SectionCard title="Support" gradient="from-pink-500" icon={<HelpCircle className="h-3.5 w-3.5" />}>
          <SettingRow icon={<HelpCircle className="h-4 w-4" />} label="Help Center" subtitle="FAQs and guides" />
          <SettingRow icon={<Bug className="h-4 w-4" />} label="Report Bug" subtitle="Help us improve the app" />
          <SettingRow icon={<Star className="h-4 w-4" />} label="Rate App" subtitle="Share your feedback" />
        </SectionCard>

        {/* Danger Zone Section */}
        <SectionCard title="Danger Zone" gradient="from-red-500" icon={<Trash2 className="h-3.5 w-3.5" />}>
          <SettingRow
            icon={<Trash2 className="h-4 w-4 text-red-500" />}
            label="Delete Account"
            subtitle="Permanently delete your account and data"
          />
          <div className="py-2 px-1">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white border-0 shadow-lg shadow-red-500/20 font-bold h-10 rounded-xl"
                onClick={() => setCurrentView('home')}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </motion.div>
          </div>
        </SectionCard>
      </motion.div>

      {/* App Version */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-4 pb-2"
      >
        <p className="text-xs text-muted-foreground/50">NEXTEXAM v1.0.0</p>
      </motion.div>
    </div>
  );
}
