'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, GraduationCap, ShieldCheck, AlertCircle, Smartphone, Download } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error || 'Login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-emerald-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ExamVault</h1>
          <p className="text-emerald-400/80 text-sm mt-1">Admin Control Panel</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <CardTitle className="text-white">Admin Sign In</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Manage categories, tests, questions, announcements & more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@examvault.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/60 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/60 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Admin Panel'
                )}
              </Button>
            </form>

            <div className="mt-6 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300/80">
              <p className="font-semibold mb-1">First time setup?</p>
              <p>1. Create admin user in Firebase Console &rarr; Authentication &rarr; Add user</p>
              <p>2. Sign in here with <code className="text-emerald-400">admin@examvault.com</code></p>
              <p>3. The admins doc is auto-created on first login.</p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-xs mt-6">
          ExamVault Admin &middot; Content syncs to Flutter user app in real-time
        </p>

        {/* APK download — opens the GitHub Actions page in a new tab so the
            owner can grab the latest signed release APK without logging in. */}
        <a
          href="https://github.com/titun43/examvault/actions/workflows/build.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 group flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-medium shadow-lg shadow-emerald-900/40 transition-all hover:shadow-emerald-700/40"
        >
          <Smartphone className="w-5 h-5 shrink-0" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold">Download ExamVault APK</span>
            <span className="text-[11px] text-emerald-100/80">latest signed release &middot; opens GitHub Actions</span>
          </div>
          <Download className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-y-0.5 transition" />
        </a>
      </div>
    </div>
  );
}
