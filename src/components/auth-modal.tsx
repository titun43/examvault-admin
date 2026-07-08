'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GraduationCap, Mail, Lock, User, Loader2, Phone,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, setUser } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email?: string; phone?: string; password: string }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }
      return res.json();
    },
    onSuccess: async (data) => {
      // After registration, sign in using whichever identifier was provided
      const identifier = email || phone;
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      });
      if (result?.ok) {
        setUser(data.user);
        setShowAuthModal(false);
        toast.success('Account created successfully! 🎉');
        resetForm();
      } else {
        toast.success('Account created! Please sign in.');
        setAuthMode('login');
        resetForm();
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed');
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { identifier: string; password: string }) => {
      const result = await signIn('credentials', {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      });
      if (!result?.ok) {
        throw new Error('Invalid credentials. Please check and try again.');
      }
      return result;
    },
    onSuccess: async () => {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (session?.user) {
        setUser(session.user);
      }
      setShowAuthModal(false);
      toast.success('Welcome back! 👋');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      if (!name.trim()) {
        toast.error('Please enter your name');
        return;
      }
      if (!email && !phone) {
        toast.error('Please provide email or mobile number');
        return;
      }
      if (phone && !/^\d{10}$/.test(phone)) {
        toast.error('Mobile number must be 10 digits');
        return;
      }
      registerMutation.mutate({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
      });
    } else {
      const identifier = loginMethod === 'email' ? email.trim() : phone.trim();
      if (!identifier) {
        toast.error(loginMethod === 'email' ? 'Please enter your email' : 'Please enter your mobile number');
        return;
      }
      loginMutation.mutate({ identifier, password });
    }
  };

  const isLoading = registerMutation.isPending || loginMutation.isPending;

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 p-6 pb-12 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div className="relative">
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <GraduationCap className="h-8 w-8" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-black">
              {authMode === 'login' ? 'Welcome Back!' : 'Join NEXTEXAM'}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-white/80 mt-1">
              {authMode === 'login'
                ? 'Sign in to continue your preparation'
                : 'Start your exam preparation journey'}
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 -mt-6">
          {/* Login method tabs (only for login mode) */}
          {authMode === 'login' && (
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('mobile')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  loginMethod === 'mobile'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Phone className="h-3.5 w-3.5" /> Mobile
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 rounded-xl border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500/30"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            {((authMode === 'login' && loginMethod === 'email') || authMode === 'register') && (
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-sm">
                  Email {authMode === 'register' && <span className="text-muted-foreground font-normal">(or use mobile below)</span>}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 rounded-xl border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500/30"
                    required={authMode === 'login' && loginMethod === 'email'}
                  />
                </div>
              </div>
            )}

            {/* Mobile field */}
            {((authMode === 'login' && loginMethod === 'mobile') || authMode === 'register') && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold text-sm">
                  Mobile Number {authMode === 'register' && <span className="text-muted-foreground font-normal">(10 digits)</span>}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="pl-9 rounded-xl border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500/30"
                    required={authMode === 'login' && loginMethod === 'mobile'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 rounded-xl border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500/30"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-bold rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-blue-500/25 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Demo credentials hint */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-3 text-xs text-muted-foreground border border-amber-200/50 dark:border-amber-800/30">
              <p className="font-bold mb-1 text-amber-700 dark:text-amber-400">🔑 Demo Credentials:</p>
              <p>Student: student@nextexam.com / Student@123</p>
              <p>Admin: admin@nextexam.com / Admin@123</p>
              <p className="mt-1 text-muted-foreground">Mobile login: register with your 10-digit number first</p>
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            {authMode === 'login' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setAuthMode('register'); resetForm(); }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => { setAuthMode('login'); resetForm(); }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
