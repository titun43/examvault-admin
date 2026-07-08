// =============================================================================
// POST /api/admin/payments/[id]/refund
// =============================================================================
// Issue a Razorpay refund for a captured payment.
//
// Body:
//   amount? : number (rupees) — omit for full refund
//   reason? : string — admin note (stored in PaymentLog payload)
//
// Logic:
//   1. Load Payment. If status !== 'CAPTURED', return 400.
//   2. Call refundRazorpayPayment(razorpayPaymentId, amountPaise?).
//   3. In a transaction:
//      - Update Payment: status -> REFUNDED (full) or keep CAPTURED (partial),
//        refundedAt = now, refundAmount += amount (or full).
//      - Create Transaction { type:'REFUND', status:'PENDING',
//        razorpayRefundId, amount }.
//      - Create PaymentLog { event:'REFUND_ISSUED', level:'AUDIT' }.
//   4. Return the refund details.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/payment-auth';
import { refundRazorpayPayment, rupeesToPaise } from '@/lib/razorpay-server';
import { getClientMeta } from '../../../_lib';

interface RefundBody {
  amount?: number; // rupees
  reason?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;
  const clientMeta = getClientMeta(req);

  try {
    const { id } = await params;

    // ---- Parse body ----
    let body: RefundBody = {};
    try {
      body = (await req.json()) as RefundBody;
    } catch {
      // empty body is OK — treat as full refund
    }

    // ---- Load payment ----
    const payment = await db.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 },
      );
    }

    if (payment.status !== 'CAPTURED') {
      return NextResponse.json(
        {
          error: `Cannot refund payment with status ${payment.status}. Only CAPTURED payments can be refunded.`,
        },
        { status: 400 },
      );
    }

    if (!payment.razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Payment has no razorpayPaymentId; cannot refund.' },
        { status: 400 },
      );
    }

    // ---- Determine refund amount (paise) ----
    let refundPaise: number | undefined;
    let partial = false;
    if (typeof body.amount === 'number' && body.amount > 0) {
      refundPaise = rupeesToPaise(body.amount);
      if (refundPaise > payment.amount) {
        return NextResponse.json(
          {
            error: `Refund amount (₹${body.amount}) exceeds payment amount (₹${(payment.amount / 100).toFixed(2)}).`,
          },
          { status: 400 },
        );
      }
      if (refundPaise < payment.amount) partial = true;
    }

    // ---- Call Razorpay ----
    const rzpRefund = await refundRazorpayPayment(
      payment.razorpayPaymentId,
      refundPaise,
    );

    // ---- Persist locally ----
    const refundAmountRecorded = rzpRefund.amount ?? refundPaise ?? payment.amount;

    const updated = await db.$transaction(async (tx) => {
      const newRefundTotal = payment.refundAmount + refundAmountRecorded;
      const fullyRefunded = newRefundTotal >= payment.amount;

      const upd = await tx.payment.update({
        where: { id: payment.id },
        data: {
          // Full refund -> REFUNDED. Partial -> keep CAPTURED.
          status: fullyRefunded ? 'REFUNDED' : 'CAPTURED',
          refundedAt: new Date(),
          refundAmount: newRefundTotal,
        },
      });

      await tx.transaction.create({
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          userId: payment.userId,
          type: 'REFUND',
          amount: refundAmountRecorded,
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpayRefundId: rzpRefund.id,
          status:
            rzpRefund.status === 'processed'
              ? 'SUCCESS'
              : rzpRefund.status === 'pending'
                ? 'PENDING'
                : 'FAILED',
          description: body.reason ?? `Admin refund (${partial ? 'partial' : 'full'})`,
        },
      });

      await tx.paymentLog.create({
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          userId: payment.userId,
          event: 'REFUND_ISSUED',
          level: 'AUDIT',
          message: `Refund issued: ₹${(refundAmountRecorded / 100).toFixed(2)} (${partial ? 'partial' : 'full'}) — Razorpay refund id ${rzpRefund.id}`,
          payload: JSON.stringify({
            refundId: rzpRefund.id,
            razorpayPaymentId: payment.razorpayPaymentId,
            amountPaise: refundAmountRecorded,
            reason: body.reason ?? null,
            partial,
            rzpStatus: rzpRefund.status,
          }),
          ...clientMeta,
        },
      });

      return upd;
    });

    return NextResponse.json({
      refund: rzpRefund,
      payment: updated,
      partial,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/payments/[id]/refund POST] error:', message);

    // Best-effort error log
    try {
      const { id } = await params;
      await db.paymentLog.create({
        data: {
          paymentId: id,
          event: 'REFUND_FAILED',
          level: 'ERROR',
          message: `Refund failed: ${message}`,
          payload: JSON.stringify({ error: message }),
          ...clientMeta,
        },
      });
    } catch {
      // swallow
    }

    return NextResponse.json(
      { error: `Refund failed: ${message}` },
      { status: 500 },
    );
  }
}
