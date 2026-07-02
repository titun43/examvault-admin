'use client';

// =============================================================================
// Payment Settings — admin configuration page for the Razorpay integration.
// =============================================================================
// Lets the admin:
//   1. See the webhook URL they must paste into the Razorpay dashboard.
//   2. Enter / update the webhook secret (from the Razorpay dashboard).
//   3. Verify that the Razorpay API key_id & key_secret are set (masked).
//   4. View recent webhook delivery logs.
//   5. See a quick payment health summary.
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import {
  Settings,
  Copy,
  Check,
  Shield,
  ExternalLink,
  KeyRound,
  Webhook,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Save,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAdminToken } from '@/lib/admin-token';
import AdminTokenGate from './admin-token-gate';

interface SettingsData {
  razorpayKeyId: string;
  razorpayKeyIdSet: boolean;
  razorpayKeySecretSet: boolean;
  webhookUrl: string;
  webhookSecretMasked: string;
  webhookSecretSource: 'admin' | 'env' | 'unset';
  webhookSecretSet: boolean;
  stats: {
    capturedPayments: number;
    failedPayments: number;
    refundedPayments: number;
  };
  recentWebhooks: Array<{
    id: string;
    event: string;
    message: string;
    level: string;
    createdAt: string;
  }>;
}

export default function PaymentSettingsPage() {
  return (
    <AdminTokenGate title="Payment Settings">
      <PaymentSettingsInner />
    </AdminTokenGate>
  );
}

function PaymentSettingsInner() {
  const { token } = useAdminToken();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webhookSecret, setWebhookSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/payment-settings', {
        headers: { 'x-admin-token': token },
      });
      if (!res.ok) throw new Error('Failed to load settings');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!token || !webhookSecret.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: {
          'x-admin-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookSecret }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to save');
      }
      setSaved(true);
      setWebhookSecret('');
      setTimeout(() => setSaved(false), 3000);
      fetchSettings();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <p className="text-slate-400">{error}</p>
        <Button variant="outline" onClick={fetchSettings}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-500" />
            Payment Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure the Razorpay integration and webhook verification.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSettings}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Step 1: Razorpay API Keys */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start gap-3 mb-4">
          <KeyRound className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Step 1 — Razorpay API Keys</h2>
            <p className="text-sm text-slate-400 mt-1">
              These are configured server-side in <code className="text-emerald-400 text-xs">.env.local</code> for
              security. They are never exposed to the browser.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">Key ID</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-slate-300 font-mono">
                {data?.razorpayKeyId || 'Not set'}
              </code>
              {data?.razorpayKeyIdSet ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>
          <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">Key Secret</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-slate-300 font-mono">
                {data?.razorpayKeySecretSet ? '••••••••••••' : 'Not set'}
              </code>
              {data?.razorpayKeySecretSet ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              )}
            </div>
          </div>
        </div>
        {(!data?.razorpayKeyIdSet || !data?.razorpayKeySecretSet) && (
          <div className="mt-4 rounded-lg bg-amber-950/30 border border-amber-800 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-200">
              API keys are missing. Set <code className="text-amber-400">RAZORPAY_KEY_ID</code> and{' '}
              <code className="text-amber-400">RAZORPAY_KEY_SECRET</code> in the server environment.
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Webhook Configuration */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Webhook className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Step 2 — Webhook Configuration</h2>
            <p className="text-sm text-slate-400 mt-1">
              Create a webhook in the Razorpay dashboard so payment events are verified server-side.
            </p>
          </div>
        </div>

        {/* Webhook URL */}
        <div className="mb-4">
          <Label className="text-slate-300 text-sm">Webhook URL</Label>
          <p className="text-xs text-slate-500 mb-2">
            Copy this URL and paste it into Razorpay Dashboard → Settings → Webhooks → Create Webhook.
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={data?.webhookUrl ?? ''}
              className="bg-slate-950/50 border-slate-700 text-slate-300 font-mono text-sm"
            />
            <Button variant="outline" size="sm" onClick={copyWebhookUrl} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Razorpay Dashboard link */}
        <a
          href="https://dashboard.razorpay.com/app/webhooks"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 mb-4"
        >
          Open Razorpay Webhooks Dashboard
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Webhook Secret */}
        <div className="mt-4">
          <Label className="text-slate-300 text-sm">Webhook Secret</Label>
          <p className="text-xs text-slate-500 mb-2">
            When you create the webhook in Razorpay, you'll set a <strong>secret</strong>. Paste that
            secret here. It's used to verify that incoming webhook events genuinely come from Razorpay.
          </p>
          <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-3 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Current secret:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm text-slate-300 font-mono">
                  {data?.webhookSecretMasked || 'Not set'}
                </code>
                <Badge
                  variant="outline"
                  className={
                    data?.webhookSecretSource === 'admin'
                      ? 'border-emerald-700 text-emerald-400'
                      : data?.webhookSecretSource === 'env'
                        ? 'border-blue-700 text-blue-400'
                        : 'border-amber-700 text-amber-400'
                  }
                >
                  {data?.webhookSecretSource === 'admin'
                    ? 'Admin-set'
                    : data?.webhookSecretSource === 'env'
                      ? 'Env default'
                      : 'Not set'}
                </Badge>
              </div>
            </div>
          </div>
          <Textarea
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="Paste your Razorpay webhook secret here..."
            className="bg-slate-950/50 border-slate-700 text-slate-200 font-mono text-sm min-h-[80px]"
          />
          <div className="flex items-center gap-3 mt-3">
            <Button
              onClick={handleSave}
              disabled={!webhookSecret.trim() || saving}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Webhook Secret'}
            </Button>
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-lg bg-slate-950/50 border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            Setup Instructions
          </h3>
          <ol className="text-sm text-slate-400 space-y-1.5 list-decimal list-inside">
            <li>
              Click <strong>"Open Razorpay Webhooks Dashboard"</strong> above.
            </li>
            <li>
              Click <strong>"Create Webhook"</strong>.
            </li>
            <li>
              Paste the <strong>Webhook URL</strong> (copied above) into the URL field.
            </li>
            <li>
              In the <strong>Secret</strong> field, enter a strong secret (or use the one Razorpay
              generates). Copy it.
            </li>
            <li>
              Select the events to subscribe to:{' '}
              <code className="text-emerald-400 text-xs">payment.captured</code>,{' '}
              <code className="text-emerald-400 text-xs">payment.failed</code>,{' '}
              <code className="text-emerald-400 text-xs">refund.processed</code>.
            </li>
            <li>
              Save the webhook in Razorpay, then paste the <strong>secret</strong> into the field
              above and click <strong>"Save Webhook Secret"</strong>.
            </li>
          </ol>
        </div>
      </div>

      {/* Step 3: Payment Health */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Activity className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Step 3 — Payment Health</h2>
            <p className="text-sm text-slate-400 mt-1">
              Quick summary of processed payments.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {data?.stats.capturedPayments ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Captured Payments</p>
          </div>
          <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {data?.stats.failedPayments ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Failed Payments</p>
          </div>
          <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {data?.stats.refundedPayments ?? 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Refunded Payments</p>
          </div>
        </div>
      </div>

      {/* Recent Webhook Deliveries */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Webhook className="w-5 h-5 text-emerald-500" />
          Recent Webhook Deliveries
        </h2>
        {data?.recentWebhooks && data.recentWebhooks.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {data.recentWebhooks.map((w) => (
              <div
                key={w.id}
                className="rounded-lg bg-slate-950/50 border border-slate-800 p-3 text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <code className="text-emerald-400 text-xs font-mono">{w.event}</code>
                  <span className="text-xs text-slate-500">
                    {new Date(w.createdAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                    })}
                  </span>
                </div>
                <p className="text-slate-400 text-xs">{w.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Webhook className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              No webhook deliveries yet. Create a webhook in Razorpay to start receiving events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
