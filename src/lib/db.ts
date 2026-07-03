// =============================================================================
// ExamVault - Prisma Database Client (singleton)
// =============================================================================
// Server-only. Never import this from a client component.
// Payment/transaction data lives in SQLite via Prisma. Content (categories,
// subjects, tests) lives in Firestore and is referenced by ID here.
// =============================================================================

import { PrismaClient } from '@prisma/client';

// Resolve the DATABASE_URL. In the sandbox, .env sets it to a file:// SQLite
// path. We also fall back to .env.local for local dev overrides.
function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL ?? '';
  if (envUrl) return envUrl;
  // Last resort: empty (Prisma will throw a clear error)
  return '';
}

const databaseUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    ...(databaseUrl
      ? { datasources: { db: { url: databaseUrl } } }
      : {}),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
