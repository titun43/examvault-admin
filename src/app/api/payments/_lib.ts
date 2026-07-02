// =============================================================================
// Shared helpers for /api/payments/* routes
// =============================================================================

import { NextRequest } from 'next/server';
import crypto from 'crypto';

/** Generate a human-friendly unique order reference: EV-{ts}-{rand6} */
export function generateOrderRef(): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(3).toString('hex'); // 6 hex chars
  return `EV-${ts}-${rand}`;
}

/** Extract IP + user-agent for audit logs. Returns Prisma-shaped fragment. */
export function getClientMeta(req: NextRequest): {
  ip?: string;
  userAgent?: string;
} {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    undefined;
  const userAgent = req.headers.get('user-agent') || undefined;
  return { ip, userAgent };
}

/** Format a paise amount as INR currency string, e.g. 1900 -> "₹19.00" */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Pretty-print a Date in IST-ish locale string. */
export function formatDate(d: Date): string {
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
}
