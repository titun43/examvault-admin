// =============================================================================
// /api/admin/payment-settings
// =============================================================================
// GET  — returns current payment configuration (key_id masked, webhook URL,
//        webhook secret masked, recent webhook delivery logs).
// PUT  — updates the webhook secret (admin-entered from Razorpay dashboard).
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';

// Keys we store in the PaymentSetting table.
const SETTING_KEYS = {
  WEBHOOK_SECRET: 'razorpay_webhook_secret',
} as const;

function maskSecret(s: string | null | undefined): string {
  if (!s) return '';
  if (s.length <= 8) return '••••';
  return s.slice(0, 4) + '••••••••' + s.slice(-4);
}

function maskKeyId(s: string | null | undefined): string {
  if (!s) return '';
  if (s.length <= 8) return '••••';
  return s.slice(0, 8) + '••••' + s.slice(-4);
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    // Read all settings from DB
    const settings = await db.paymentSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;

    const webhookSecretDb = settingsMap[SETTING_KEYS.WEBHOOK_SECRET] ?? '';
    const envKeyId = process.env.RAZORPAY_KEY_ID ?? '';
    const envWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';

    // Determine app URL for the webhook endpoint
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://examvault-admin.vercel.app';
    const webhookUrl = `${appUrl}/api/payments/webhook`;

    // Recent webhook delivery logs (last 20 WEBHOOK_* events)
    const recentWebhooks = await db.paymentLog.findMany({
      where: {
        event: { startsWith: 'WEBHOOK' },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Payment counts for a quick health summary
    const [capturedCount, failedCount, refundedCount] = await Promise.all([
      db.payment.count({ where: { status: 'CAPTURED' } }),
      db.payment.count({ where: { status: 'FAILED' } }),
      db.payment.count({ where: { status: 'REFUNDED' } }),
    ]);

    return NextResponse.json({
      // Razorpay API key_id — read-only, comes from env (server-only).
      // Masked so admin can verify it's set without seeing the full key.
      razorpayKeyId: maskKeyId(envKeyId),
      razorpayKeyIdSet: !!envKeyId,
      razorpayKeySecretSet: !!process.env.RAZORPAY_KEY_SECRET,

      // Webhook configuration
      webhookUrl,
      webhookSecretMasked: maskSecret(webhookSecretDb || envWebhookSecret),
      webhookSecretSource: webhookSecretDb ? 'admin' : envWebhookSecret ? 'env' : 'unset',
      webhookSecretSet: !!(webhookSecretDb || envWebhookSecret),

      // Health summary
      stats: {
        capturedPayments: capturedCount,
        failedPayments: failedCount,
        refundedPayments: refundedCount,
      },

      // Recent webhook deliveries
      recentWebhooks: recentWebhooks.map((w) => ({
        id: w.id,
        event: w.event,
        message: w.message,
        level: w.level,
        createdAt: w.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/payment-settings GET] error:', message);
    return NextResponse.json(
      { error: 'Failed to load payment settings' },
      { status: 500 },
    );
  }
}

// =============================================================================
// PUT — update the webhook secret
// =============================================================================
export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { webhookSecret } = body as { webhookSecret?: string };

    if (!webhookSecret || webhookSecret.trim().length < 8) {
      return NextResponse.json(
        { error: 'Webhook secret must be at least 8 characters' },
        { status: 400 },
      );
    }

    const trimmed = webhookSecret.trim();

    // Upsert the webhook secret in the DB
    const existing = await db.paymentSetting.findUnique({
      where: { key: SETTING_KEYS.WEBHOOK_SECRET },
    });

    if (existing) {
      await db.paymentSetting.update({
        where: { key: SETTING_KEYS.WEBHOOK_SECRET },
        data: { value: trimmed, updatedBy: 'admin' },
      });
    } else {
      await db.paymentSetting.create({
        data: { key: SETTING_KEYS.WEBHOOK_SECRET, value: trimmed, updatedBy: 'admin' },
      });
    }

    // Audit log
    await db.paymentLog.create({
      data: {
        event: 'WEBHOOK_SECRET_UPDATED',
        level: 'AUDIT',
        message: 'Admin updated the Razorpay webhook secret',
        payload: JSON.stringify({ source: 'admin-ui' }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/payment-settings PUT] error:', message);
    return NextResponse.json(
      { error: 'Failed to update webhook secret' },
      { status: 500 },
    );
  }
}
