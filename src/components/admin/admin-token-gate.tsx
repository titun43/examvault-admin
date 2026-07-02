'use client';

// =============================================================================
// ExamVault - AdminTokenGate
// =============================================================================
// Wraps a section that needs the `x-admin-token` header for /api/admin/*
// requests. If the admin has not yet entered the admin secret, shows a prompt
// to paste it (stored in localStorage['admin_token'] on submit).
//
// The gate is intentionally lightweight: the admin only enters the token once
// per browser. After that, every mounted AdminTokenGate passes through.
// =============================================================================

import { useState } from 'react';
import { useAdminToken, setAdminToken } from '@/lib/admin-token';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTokenGate({
  children,
  title = 'Payments',
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { token, ready } = useAdminToken();
  const [value, setValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyErr, setVerifyErr] = useState<string | null>(null);

  // While the hook is hydrating from localStorage, show nothing.
  if (!ready) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // Have a token — render the children (the section itself will surface 401s
  // if the token is wrong; we don't pre-verify here to avoid an extra hop).
  if (token) {
    return <>{children}</>;
  }

  // No token — show the entry prompt.
  const handleSave = async () => {
    if (!value.trim()) {
      setVerifyErr('Please paste the admin secret.');
      return;
    }
    setVerifying(true);
    setVerifyErr(null);
    // Quick verify: hit the dashboard stats endpoint with the candidate token.
    try {
      const res = await fetch('/api/admin/dashboard/stats', {
        headers: { 'x-admin-token': value.trim() },
      });
      if (res.status === 401) {
        setVerifyErr('Token rejected by server. Double-check the value.');
        setVerifying(false);
        return;
      }
      if (!res.ok) {
        setVerifyErr(`Server returned ${res.status}. Try again.`);
        setVerifying(false);
        return;
      }
      setAdminToken(value.trim());
      toast.success('Admin token saved');
      setValue('');
    } catch (e) {
      setVerifyErr(
        e instanceof Error ? e.message : 'Network error verifying token.',
      );
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="border-slate-700/60 bg-slate-900/60">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
              <KeyRound className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">
                Admin token required
              </h2>
              <p className="text-slate-400 text-xs">
                The {title} section makes authenticated calls to{' '}
                <code className="text-emerald-300">/api/admin/*</code>.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-token-input" className="text-slate-200">
              Admin secret
            </Label>
            <Input
              id="admin-token-input"
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste the ADMIN_JWT_SECRET value"
              className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !verifying) handleSave();
              }}
              autoFocus
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The token is stored only in this browser (localStorage + cookie)
              and is sent as the <code>x-admin-token</code> header on every
              admin API request. Clear it anytime from the section header.
            </p>
          </div>

          {verifyErr && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-200 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{verifyErr}</span>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={verifying || !value.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Save & verify
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
