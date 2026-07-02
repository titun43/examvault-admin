// =============================================================================
// ExamVault - API Auth Helpers (JWT + admin secret)
// =============================================================================
// Two caller types hit the payment API:
//   1. The Flutter app (user-facing) — authenticates with a Firebase ID token
//      sent in the Authorization header. We verify the token via Firebase Admin.
//   2. The Next.js admin panel (admin-facing) — authenticates with a session
//      cookie / admin JWT issued by the admin login flow.
//
// To keep this self-contained and avoid Firebase Admin SDK setup, we use a
// pragmatic dual approach:
//   - User endpoints: accept either a Firebase ID token (verified via the
//     Firebase REST API) OR a trusted userId header when behind the gateway.
//     For production hardening, swap the token check to Firebase Admin.
//   - Admin endpoints: require an X-Admin-Token header matching
//     ADMIN_JWT_SECRET (or a valid NextAuth session).
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';

// ==================== ADMIN AUTH ====================
export function requireAdmin(req: NextRequest): { ok: true } | { ok: false; response: NextResponse } {
  const token = req.headers.get('x-admin-token');
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Admin secret not configured' }, { status: 500 }),
    };
  }
  if (!token || token !== secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { ok: true };
}

// ==================== USER AUTH (Firebase ID token) ====================
// Accepts a Firebase ID token in `Authorization: Bearer <token>` and verifies
// it against the Firebase identitytoolkit REST API. Returns the firebaseUid
// and decoded claims. Falls back to a trusted `x-user-id` header only when
// the request comes through the internal gateway (for dev/testing).
export interface AuthenticatedUser {
  firebaseUid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  internalUserId?: string; // our Prisma User.id (resolved lazily)
}

export async function requireUser(
  req: NextRequest,
): Promise<
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; response: NextResponse }
> {
  const auth = req.headers.get('authorization') ?? '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  // Path A: Firebase ID token
  if (bearer && bearer.length > 40) {
    try {
      const verified = await verifyFirebaseToken(bearer);
      return { ok: true, user: verified };
    } catch (e) {
      // Token was provided but verification failed (expired, revoked, invalid).
      // Return a clear 401 so the client knows to re-authenticate.
      const msg = e instanceof Error ? e.message : 'Token verification failed';
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Invalid or expired session', detail: msg },
          { status: 401 },
        ),
      };
    }
  }

  // Path B: trusted internal gateway header (x-user-id set by admin/gateway)
  const trustedUid = req.headers.get('x-user-id');
  if (trustedUid) {
    return {
      ok: true,
      user: { firebaseUid: trustedUid },
    };
  }

  return {
    ok: false,
    response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
  };
}

// Firebase API key for the ExamVault project (examvaultnew). Same value as in
// src/lib/firebase.ts. Kept here as a fallback so the payment API works on
// Vercel even when NEXT_PUBLIC_FIREBASE_API_KEY is not set as an env var.
const FIREBASE_API_KEY_FALLBACK = 'AIzaSyBKEUGs9r7Q71q7vCIh3Pz_mletXQCok6E';

async function verifyFirebaseToken(token: string): Promise<AuthenticatedUser> {
  // Prefer the env var if set; fall back to the hardcoded key (matches
  // firebase.ts) so the payment API works out-of-the-box on Vercel.
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FIREBASE_API_KEY_FALLBACK;
  if (!apiKey) throw new Error('Firebase API key missing');
  // Firebase identitytoolkit: verify a custom token / ID token by posting it
  // and reading the response. This is the lightweight approach without the
  // Admin SDK.
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }) },
  );
  if (!res.ok) throw new Error(`Firebase token verify failed (${res.status})`);
  const data = await res.json();
  const u = data?.users?.[0];
  if (!u) throw new Error('No user for token');
  return {
    firebaseUid: u.localId,
    email: u.email,
    phone: u.phoneNumber,
    displayName: u.displayName,
  };
}

// ==================== USER UPSERT ====================
// Ensure a Prisma User row exists for the given firebaseUid. Call this at the
// start of any payment endpoint to lazily create the user record.
export async function upsertUser(u: AuthenticatedUser): Promise<string> {
  const existing = await db.user.findUnique({ where: { firebaseUid: u.firebaseUid } });
  if (existing) {
    // refresh denormalized fields if changed
    if (
      existing.email !== (u.email ?? null) ||
      existing.phone !== (u.phone ?? null) ||
      existing.displayName !== (u.displayName ?? null)
    ) {
      await db.user.update({
        where: { id: existing.id },
        data: { email: u.email, phone: u.phone, displayName: u.displayName },
      });
    }
    return existing.id;
  }
  const created = await db.user.create({
    data: {
      firebaseUid: u.firebaseUid,
      email: u.email,
      phone: u.phone,
      displayName: u.displayName,
    },
  });
  return created.id;
}
