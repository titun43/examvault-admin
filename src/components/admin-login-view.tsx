'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Shield, Mail, Lock, Loader2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminLoginView() {
  const { setCurrentView, setUser, setIsAdminMode, user, isAdminMode } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If user is already logged in as admin, redirect directly to admin panel
  useEffect(() => {
    if (isAdminMode && user) {
      setCurrentView('admin');
      return;
    }
    // Also check session on mount in case page was refreshed
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        const session = await res.json();
        if (session?.user) {
          setUser(session.user);
          if ((session.user as any).role === 'admin' || (session.user as any).role === 'ADMIN') {
            setIsAdminMode(true);
            setCurrentView('admin');
          }
        }
      } catch {
        // Session check failed, show login form
      }
    };
    if (!user) {
      checkSession();
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      // Step 1: Verify credentials via our custom API
      const verifyRes = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Invalid email or password');
      }

      // Step 2: Also establish NextAuth session so the cookie is set
      const signInResult = await signIn('credentials', {
        identifier: data.email,
        password: data.password,
        redirect: false,
      });

      // Even if signIn has issues, our custom API already verified the user
      // The signIn call is just to set the session cookie for future requests
      if (signInResult?.error && !signInResult?.ok) {
        // Session cookie may fail in some cases, but login is verified
        console.warn('NextAuth signIn warning:', signInResult.error);
      }

      return verifyData.user;
    },
    onSuccess: (userData) => {
      // We already have the verified user data from our API
      // No need to fetch session again - just set it directly
      setUser(userData);
      setIsAdminMode(true);
      setCurrentView('admin');
      toast.success('Welcome, Admin! 🛡️');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Invalid email or password');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>

      {/* Back to app button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentView('home')}
        className="absolute top-4 left-4 text-white/60 hover:text-white hover:bg-white/10 rounded-xl z-10"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to App
      </Button>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">NEXTEXAM Admin</h1>
          <p className="text-sm text-white/40">Dashboard Control Center</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Admin Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-sky-500/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-1">Admin Login</h2>
          <p className="text-sm text-white/40 text-center mb-6">Enter your credentials to access the dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm font-medium text-white/70">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@nextexam.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 rounded-xl bg-gray-800/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-sm font-medium text-white/70">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 rounded-xl bg-gray-800/50 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 font-bold rounded-xl h-11 transition-all duration-200"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Access Dashboard
                </>
              )}
            </Button>
          </form>

          {/* Credentials hint */}
          <div className="mt-6 bg-gray-800/50 border border-white/5 rounded-xl p-4">
            <p className="font-bold mb-1 text-blue-400 text-xs uppercase tracking-wider">🔑 Demo Credentials</p>
            <p className="text-xs text-white/40">admin@nextexam.com / Admin@123</p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-white/20 mt-6">
          NEXTEXAM Admin Dashboard • Secure Access Only
        </p>
      </div>
    </div>
  );
}
