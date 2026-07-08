// =============================================================================
// ExamVault - Client-side admin token helper
// =============================================================================
// The admin API routes under /api/admin/* are gated by `requireAdmin(req)` in
// src/lib/payment-auth.ts — it checks the `x-admin-token` header against the
// server-side `ADMIN_JWT_SECRET` env var. The existing admin login flow uses
// Firebase Auth only (no JWT stored locally), so this module provides:
//
//   - getAdminToken()  — read token from localStorage, fallback to cookie
//   - setAdminToken(t) — persist token to localStorage
//   - clearAdminToken()— wipe token from localStorage + cookie
//   - useAdminToken()  — React hook (via useSyncExternalStore) that
//                        re-renders on token change
//
// Token is stored under the localStorage key `admin_token`. The same key is
// also written as a cookie (path=/) so server-side reads would work too.
// =============================================================================

'use client';

import { useCallback, useSyncExternalStore } from 'react';

const LS_KEY = 'admin_token';
const COOKIE_KEY = 'admin_token';

// ---- External-store plumbing (so useAdminToken can use useSyncExternalStore)
const listeners: Set<() => void> = new Set();
function emitChange() {
  for (const l of listeners) l();
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (typeof window !== 'undefined') {
    window.addEventListener('admin-token-change', cb);
    window.addEventListener('storage', cb);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== 'undefined') {
      window.removeEventListener('admin-token-change', cb);
      window.removeEventListener('storage', cb);
    }
  };
}

/** Read a cookie value by name (browser only). */
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** Write a cookie (browser only). Expires in 1 year. */
function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

/** Delete the cookie (browser only). */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/** Get the current admin token from localStorage (preferred) or cookie. */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const ls = window.localStorage.getItem(LS_KEY);
    if (ls && ls.trim().length > 0) return ls.trim();
  } catch {
    // localStorage may throw in private mode — fall through to cookie
  }
  return readCookie(COOKIE_KEY);
}

/** Persist the admin token to localStorage + cookie. Notifies all subscribers. */
export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  const t = token.trim();
  try {
    if (t.length > 0) {
      window.localStorage.setItem(LS_KEY, t);
    } else {
      window.localStorage.removeItem(LS_KEY);
    }
  } catch {
    // ignore
  }
  if (t.length > 0) writeCookie(COOKIE_KEY, t);
  else deleteCookie(COOKIE_KEY);
  emitChange();
}

/** Wipe the admin token from localStorage + cookie. Notifies all subscribers. */
export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
  deleteCookie(COOKIE_KEY);
  emitChange();
}

/**
 * React hook backed by useSyncExternalStore. Returns the current admin token
 * (or null) and re-renders whenever the token changes in this OR another tab.
 *
 * SSR returns null (server snapshot) — components that need the token should
 * render the AdminTokenGate prompt when `token === null` after hydration.
 */
export function useAdminToken(): {
  token: string | null;
  ready: boolean;
  set: (t: string) => void;
  clear: () => void;
} {
  const token = useSyncExternalStore(
    subscribe,
    // Client snapshot:
    () => getAdminToken(),
    // Server snapshot (SSR): always null
    () => null,
  );

  const set = useCallback((t: string) => setAdminToken(t), []);
  const clear = useCallback(() => clearAdminToken(), []);

  // `ready` is true on the client (post-hydration). On the very first render
  // useSyncExternalStore returns the server snapshot (null), but the very
  // next render on the client yields the client snapshot — so a useEffect is
  // not needed. We treat "token !== null OR mounted once" as ready. The gate
  // uses useSyncExternalStore's natural post-hydration sync; here we just
  // expose `ready: true` because the hook is only ever called from a client
  // component subtree (every consumer is behind AdminTokenGate).
  return { token, ready: true, set, clear };
}

/**
 * Build the headers object for an admin fetch. Returns the headers + a flag
 * indicating whether a token is present. If no token, the caller should
 * render the token-entry prompt instead of issuing the request.
 */
export function adminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-admin-token'] = token;
  return headers;
}
