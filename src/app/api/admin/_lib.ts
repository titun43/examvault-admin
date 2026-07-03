// =============================================================================
// ExamVault - Shared helpers for /api/admin/* routes
// =============================================================================
// Server-only. Re-uses getClientMeta / formatINR / formatDate from the
// payments _lib so behavior stays consistent across user + admin surfaces.
// =============================================================================

import { NextRequest } from 'next/server';

export { getClientMeta, formatINR, formatDate } from '../payments/_lib';

/** Parse a positive int query param; returns undefined if missing/invalid. */
export function parsePositiveInt(
  v: string | null,
  fallback?: number,
): number | undefined {
  if (v == null || v === '') return fallback;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

/** Build a UTC start-of-day Date for a YYYY-MM-DD string. */
export function startOfDay(v: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(`${v}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

/** Build a UTC end-of-day Date for a YYYY-MM-DD string. */
export function endOfDay(v: string | null): Date | undefined {
  if (!v) return undefined;
  const d = new Date(`${v}T23:59:59.999Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

/** Quick slug generator: lowercase + hyphenated + random suffix for uniqueness. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base || 'product'}-${rand}`;
}

// Silence unused-import warning for NextRequest (kept for future expansion).
export type _NextRequest = NextRequest;
