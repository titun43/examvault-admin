// =============================================================================
// ExamVault - Server-side Razorpay integration
// =============================================================================
// Uses the official Razorpay REST API via fetch (no extra deps).
// All payment creation + verification happens HERE, never on the client.
// Client only receives the Razorpay orderId and opens the checkout modal.
// =============================================================================

import crypto from 'crypto';

const RAZORPAY_BASE = 'https://api.razorpay.com/v1';

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes('XXXX')) {
    throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local');
  }
  return { keyId, keySecret };
}

function authHeader() {
  const { keyId, keySecret } = getCredentials();
  const token = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  return `Basic ${token}`;
}

export interface RazorpayOrderOptions {
  amount: number;       // paise
  currency?: string;    // default INR
  receipt: string;      // our orderRef
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid' | 'expired';
  notes: Record<string, string>;
  created_at: number;
}

// ==================== CREATE ORDER ====================
export async function createRazorpayOrder(
  opts: RazorpayOrderOptions,
): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_BASE}/orders`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: opts.amount,
      currency: opts.currency ?? 'INR',
      receipt: opts.receipt,
      payment_capture: 1, // auto-capture on success
      notes: opts.notes ?? {},
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${err}`);
  }
  return res.json();
}

// ==================== VERIFY PAYMENT SIGNATURE ====================
// Razorpay signs: ${razorpayOrderId}|${razorpayPaymentId}
// with HMAC-SHA256 using the key secret. We must verify this server-side
// BEFORE unlocking any content.
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
): boolean {
  const { keySecret } = getCredentials();
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  // timing-safe compare
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(razorpaySignature, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ==================== VERIFY WEBHOOK SIGNATURE ====================
// Razorpay sends X-Razorpay-Signature = HMAC-SHA256(webhook_secret, rawBody)
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ==================== FETCH PAYMENT ====================
export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  method: string | null;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  created_at: number;
}

export async function fetchRazorpayPayment(
  paymentId: string,
): Promise<RazorpayPayment> {
  const res = await fetch(`${RAZORPAY_BASE}/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch payment ${paymentId} (${res.status}): ${err}`);
  }
  return res.json();
}

// ==================== REFUND ====================
export interface RazorpayRefund {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
}

export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number, // paise; omit for full refund
): Promise<RazorpayRefund> {
  const res = await fetch(`${RAZORPAY_BASE}/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(amount ? { amount } : {}),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Refund failed for payment ${paymentId} (${res.status}): ${err}`);
  }
  return res.json();
}

// ==================== UTILITIES ====================
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
