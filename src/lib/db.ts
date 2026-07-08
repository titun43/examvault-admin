// =============================================================================
// ExamVault - Prisma Database Client (singleton)
// =============================================================================
// Server-only. Never import this from a client component.
// Payment/transaction data lives in PostgreSQL via Prisma. Content (categories,
// subjects, tests) lives in Firestore and is referenced by ID here.
// =============================================================================

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// -----------------------------------------------------------------------------
// Resolve the correct DATABASE_URL.
// In the local sandbox, the shell env may set DATABASE_URL=file:./dev.db
// (legacy SQLite) which would break the PostgreSQL PrismaClient. We read the
// value from .env.local directly as a fallback when the env var is missing or
// points at a file:// URL.
// -----------------------------------------------------------------------------
function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL ?? '';
  if (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://')) {
    return envUrl;
  }
  // Fall back to .env.local — read it ourselves (Next.js dotenv wouldn't have
  // run yet when this module is first imported in some contexts).
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/^DATABASE_URL=(.+)$/m);
    if (match) {
      // Strip surrounding quotes if present
      let v = match[1].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (v.startsWith('postgresql://') || v.startsWith('postgres://')) return v;
    }
  } catch {
    // ignore — fall through
  }
  // Last resort: return whatever is there (will fail with a clear Prisma error)
  return envUrl;
}

const databaseUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: { url: databaseUrl },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
