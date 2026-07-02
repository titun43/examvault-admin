// =============================================================================
// ExamVault - Prisma Database Client (singleton)
// =============================================================================
// Server-only. Never import this from a client component.
// Payment/transaction data lives in SQLite via Prisma. Content (categories,
// subjects, tests) lives in Firestore and is referenced by ID here.
// =============================================================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
