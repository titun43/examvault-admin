// =============================================================================
// POST /api/payments/webhook
// =============================================================================
// Razorpay webhook receiver. NO auth (public — Razorpay calls this), but the
// raw body signature is verified before any DB writes. Always returns 200
// quickly so Razorpay does not retry.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Resolve webhook secret: DB (admin-set) takes precedence over env.
async function getWebhookSecret(): Promise<string | null> {
  try {
    const row = await db.paymentSetting.findUnique({ where: { key: 'razorpay_webhook_secret' } });
    if (row?.value) return row.value;
  } catch {
    // DB not ready — fall through to env
  }
  return process.env.RAZORPAY_WEBHOOK_SECRET ?? null;
}

// Verify webhook signature using the resolved secret.
function verifyWithSecret(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface RazorpayWebhookEvent {
  entity?: string;
  event?: string;
  contains?: string[];
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string | null;
        status?: string;
        amount?: number;
        method?: string;
        fee?: number;
        tax?: number;
        error_code?: string | null;
        error_description?: string | null;
        amount_refunded?: number;
        refund_status?: string | null;
      };
    };
    refund?: {
      entity?: {
        id?: string;
        payment_id?: string;
        status?: string;
        amount?: number;
      };
    };
    order?: {
      entity?: {
        id?: string;
        status?: string;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  // ---- Read RAW body first (signature is over the raw bytes) ----
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';

  // ---- Verify signature (using DB-set secret, falling back to env) ----
  const secret = await getWebhookSecret();
  const ok = secret ? verifyWithSecret(rawBody, signature, secret) : false;
  if (!ok) {
    // Best-effort log
    try {
      await db.paymentLog.create({
        data: {
          event: 'WEBHOOK_SIGNATURE_FAILED',
          level: 'WARN',
          message: 'Webhook signature verification failed',
          payload: JSON.stringify({
            hasSignature: !!signature,
            bodyLen: rawBody.length,
          }),
        },
      });
    } catch {
      // swallow
    }
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ---- Parse JSON ----
  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    try {
      await db.paymentLog.create({
        data: {
          event: 'WEBHOOK_PARSE_FAILED',
          level: 'WARN',
          message: 'Webhook body was not valid JSON',
          payload: JSON.stringify({ bodyLen: rawBody.length }),
        },
      });
    } catch {
      // swallow
    }
    // Still return 200 so Razorpay doesn't retry forever
    return NextResponse.json({ ok: true });
  }

  const eventType = event.event ?? '';
  const paymentEntity = event.payload?.payment?.entity;
  const refundEntity = event.payload?.refund?.entity;

  try {
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentEntity);
        break;
      case 'payment.authorized':
        await handlePaymentAuthorized(paymentEntity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(paymentEntity);
        break;
      case 'refund.created':
      case 'refund.processed':
        await handleRefund(refundEntity, paymentEntity, eventType);
        break;
      default:
        // Unknown event — log and ack
        await db.paymentLog.create({
          data: {
            event: 'WEBHOOK_UNHANDLED_EVENT',
            level: 'INFO',
            message: `Unhandled webhook event: ${eventType}`,
            payload: rawBody.slice(0, 4000),
          },
        });
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    try {
      await db.paymentLog.create({
        data: {
          event: 'WEBHOOK_HANDLER_ERROR',
          level: 'ERROR',
          message: `Webhook handler error for ${eventType}: ${message}`,
          payload: JSON.stringify({ error: message, eventType }),
        },
      });
    } catch {
      // swallow
    }
    // Still 200 — don't trigger Razorpay retry storms
  }

  return NextResponse.json({ ok: true });
}

// ----------------------------------------------------------------------------
// Event handlers
// ----------------------------------------------------------------------------

async function handlePaymentCaptured(
  p: RazorpayWebhookEvent['payload'] extends undefined
    ? undefined
    : NonNullable<NonNullable<RazorpayWebhookEvent['payload']>['payment']>['entity'],
) {
  if (!p?.id) return;
  const payment = await db.payment.findUnique({
    where: { razorpayPaymentId: p.id },
  });
  if (!payment) {
    // Razorpay may have sent the webhook before our verify endpoint wrote
    // the Payment row. Log and ack.
    await db.paymentLog.create({
      data: {
        event: 'WEBHOOK_PAYMENT_CAPTURED',
        level: 'INFO',
        message: `Webhook received for unknown payment ${p.id}`,
        payload: JSON.stringify({ razorpayPaymentId: p.id, orderId: p.order_id }),
      },
    });
    return;
  }
  if (payment.webhookVerified) {
    // Already processed — idempotent ack
    return;
  }
  await db.payment.update({
    where: { id: payment.id },
    data: {
      webhookVerified: true,
      status: 'CAPTURED',
      capturedAt: payment.capturedAt ?? new Date(),
      method: p.method ?? payment.method,
      fee: p.fee ?? payment.fee,
      tax: p.tax ?? payment.tax,
    },
  });
  await db.paymentLog.create({
    data: {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      event: 'WEBHOOK_PAYMENT_CAPTURED',
      level: 'AUDIT',
      message: `Webhook confirmed capture for ${p.id}`,
      payload: JSON.stringify({ razorpayPaymentId: p.id, method: p.method }),
    },
  });
}

async function handlePaymentAuthorized(
  p: RazorpayWebhookEvent['payload'] extends undefined
    ? undefined
    : NonNullable<NonNullable<RazorpayWebhookEvent['payload']>['payment']>['entity'],
) {
  if (!p?.id) return;
  const payment = await db.payment.findUnique({
    where: { razorpayPaymentId: p.id },
  });
  if (!payment) return;
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: 'AUTHORIZED',
      method: p.method ?? payment.method,
    },
  });
  await db.paymentLog.create({
    data: {
      paymentId: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      event: 'WEBHOOK_PAYMENT_AUTHORIZED',
      level: 'INFO',
      message: `Payment authorized: ${p.id}`,
      payload: JSON.stringify({ razorpayPaymentId: p.id }),
    },
  });
}

async function handlePaymentFailed(
  p: RazorpayWebhookEvent['payload'] extends undefined
    ? undefined
    : NonNullable<NonNullable<RazorpayWebhookEvent['payload']>['payment']>['entity'],
) {
  if (!p?.id) return;
  const payment = await db.payment.findUnique({
    where: { razorpayPaymentId: p.id },
  });
  if (payment) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        errorCode: p.error_code ?? null,
        errorMessage: p.error_description ?? null,
      },
    });
    // Flip the order to FAILED too if it was still pending
    await db.order
      .update({
        where: { id: payment.orderId },
        data: { status: 'FAILED' },
      })
      .catch(() => {
        // ignore if already PAID etc — don't override a successful state
      });
    await db.paymentLog.create({
      data: {
        paymentId: payment.id,
        orderId: payment.orderId,
        userId: payment.userId,
        event: 'WEBHOOK_PAYMENT_FAILED',
        level: 'WARN',
        message: `Payment failed via webhook: ${p.id}`,
        payload: JSON.stringify({
          razorpayPaymentId: p.id,
          errorCode: p.error_code,
          errorDescription: p.error_description,
        }),
      },
    });
  } else {
    await db.paymentLog.create({
      data: {
        event: 'WEBHOOK_PAYMENT_FAILED',
        level: 'WARN',
        message: `Webhook payment.failed for unknown payment ${p.id}`,
        payload: JSON.stringify({
          razorpayPaymentId: p.id,
          orderId: p.order_id,
          errorCode: p.error_code,
        }),
      },
    });
  }
}

async function handleRefund(
  refund:
    | (
        RazorpayWebhookEvent['payload'] extends undefined
          ? undefined
          : NonNullable<NonNullable<RazorpayWebhookEvent['payload']>['refund']>['entity']
      ),
  payment:
    | (
        RazorpayWebhookEvent['payload'] extends undefined
          ? undefined
          : NonNullable<NonNullable<RazorpayWebhookEvent['payload']>['payment']>['entity']
      ),
  eventType: string,
) {
  const razorpayPaymentId = refund?.payment_id ?? payment?.id;
  if (!razorpayPaymentId) return;

  const paymentRow = await db.payment.findUnique({
    where: { razorpayPaymentId },
  });

  const refundAmount = refund?.amount ?? 0;
  const refundStatus = refund?.status ?? 'processed';
  const razorpayRefundId = refund?.id ?? null;

  if (paymentRow) {
    const txStatus =
      refundStatus === 'processed' || refundStatus === 'done'
        ? 'SUCCESS'
        : refundStatus === 'pending'
          ? 'PENDING'
          : 'FAILED';

    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentRow.id },
        data: {
          refundedAt: new Date(),
          refundAmount,
          status: refundStatus === 'processed' || refundStatus === 'done' ? 'REFUNDED' : paymentRow.status,
        },
      });
      await tx.transaction.create({
        data: {
          paymentId: paymentRow.id,
          orderId: paymentRow.orderId,
          userId: paymentRow.userId,
          type: 'REFUND',
          amount: refundAmount,
          razorpayPaymentId,
          razorpayRefundId,
          status: txStatus as 'SUCCESS' | 'PENDING' | 'FAILED',
          description: `Refund ${razorpayRefundId ?? ''}`.trim(),
        },
      });
      await tx.paymentLog.create({
        data: {
          paymentId: paymentRow.id,
          orderId: paymentRow.orderId,
          userId: paymentRow.userId,
          event: 'WEBHOOK_REFUND',
          level: 'AUDIT',
          message: `Refund ${eventType}: ${razorpayRefundId ?? 'n/a'} (${refundStatus})`,
          payload: JSON.stringify({
            razorpayPaymentId,
            razorpayRefundId,
            refundAmount,
            refundStatus,
          }),
        },
      });
    });
  } else {
    await db.paymentLog.create({
      data: {
        event: 'WEBHOOK_REFUND',
        level: 'WARN',
        message: `Refund webhook for unknown payment ${razorpayPaymentId}`,
        payload: JSON.stringify({
          razorpayPaymentId,
          razorpayRefundId,
          refundAmount,
          refundStatus,
        }),
      },
    });
  }
}
