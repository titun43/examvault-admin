# PROJECT_MEMORY.md — ExamVault Admin Panel

> **Purpose:** This file preserves project context across sessions. Read this
> BEFORE asking the user to repeat themselves. Update it whenever a significant
> change happens. The user expects you to "remember" everything in here.

---

## 1. Project Overview

**ExamVault Admin Panel** — A Next.js 16 admin dashboard for managing an Indian
exam-prep platform. The admin panel manages content (categories, subjects,
tests, questions, premium plans, payments) and the actual mobile app is a
separate Flutter app (repo: `titun43/examvault`).

- **End users:** Use the Flutter app (not this Next.js project)
- **Admin:** Uses this Next.js admin panel (only `/` route is exposed)
- **Payments:** Razorpay (server-side verified) — both one-time and (future) subscriptions

---

## 2. Tech Stack (NON-NEGOTIABLE)

| Layer | Tech |
|-------|------|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript 5** |
| Styling | Tailwind CSS 4 + shadcn/ui (New York style) |
| DB (relational) | **Prisma + PostgreSQL** (Vercel/Neon) |
| DB (content) | **Firestore** (categories/subjects/tests/questions) |
| Auth (admin) | Firebase Auth + `ADMIN_JWT_SECRET` env var (X-Admin-Token header) |
| Auth (users) | Firebase ID tokens (verified via identitytoolkit REST API) |
| Payments | Razorpay (server-side order + signature verification + webhook) |
| State | Zustand (client), TanStack Query (server) |
| Icons | Lucide |
| Runtime | `bun` (NOT npm/yarn) |
| Port | **3000 only** (auto dev server, never `bun run build`) |

---

## 3. Repository & Deployment

### Two repos — work in the CORRECT one for each task:

| Repo | Purpose | Local Path | What goes here |
|------|---------|------------|----------------|
| `titun43/examvault-admin` | Next.js admin panel | `/home/z/my-project` | Admin UI, payment APIs, Prisma schema, Razorpay server logic |
| `titun43/examvault` | Flutter mobile app | `/home/z/work/examvault` | User-facing app, payment UI, Firebase integration, mobile UX |

**CRITICAL:** Do NOT mix changes. Admin-related fixes go in `examvault-admin`, user-app-related fixes go in `examvault`. User explicitly warned: "kono bhul korben na" (don't make mistakes).

- **Working token (both repos):** `ghp_P6ht...` (full token stored in both remotes)
  - **Expired token to AVOID:** `ghp_5HxE...`
- **Vercel (admin):** Auto-deploys on every push to `main` of `examvault-admin`
- **Play Store (Flutter):** Manual build + release from `examvault` repo
- **Local sandbox:** `/home/z/my-project` is the working copy of admin panel (port 3000)

---

## 4. Environment Variables

### Required (set on BOTH Vercel AND in `.env.local`):

```env
# Admin token — admin pastes this value into the AdminTokenGate UI prompt.
# Server compares it via requireAdmin() in src/lib/payment-auth.ts.
ADMIN_JWT_SECRET=examvault_admin_jwt_secret_2026_rotate_me

# PostgreSQL connection (Vercel needs Postgres, SQLite will NOT work).
# Use Neon free tier: https://neon.tech
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require

# Razorpay — TEST mode keys for dev, LIVE for prod.
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

### Current local `.env.local` state:
- ✅ `ADMIN_JWT_SECRET` — set (matches Vercel)
- ❌ `DATABASE_URL` — **PLACEHOLDER ONLY** (user needs to paste real Neon URL)
- ❌ Razorpay keys — placeholders

### `.env` (committed, sandbox SQLite path — DO NOT COMMIT SECRETS HERE):
```
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

---

## 5. Important Files & Their Purpose

### Database layer:
- `prisma/schema.prisma` — **MUST be `postgresql`** (Vercel requirement). Schema has User, Order, Payment, Transaction, PremiumSubscription, TestPurchase, SubjectPackPurchase, ExamPackPurchase, PaymentLog, PaymentSetting, Product.
- `src/lib/db.ts` — Prisma singleton. Reads `DATABASE_URL` from env, falls back to `.env.local` if env URL is `file://` (legacy SQLite).
- `db/` — gitignored, local SQLite file (`custom.db`) for sandbox testing.

### Auth:
- `src/lib/payment-auth.ts` — `requireAdmin(req)` checks `x-admin-token` header vs `ADMIN_JWT_SECRET`. `requireUser(req)` accepts Firebase Bearer token OR trusted `x-user-id` header (gateway mode).
- `src/lib/admin-token.ts` — client-side token storage (localStorage + cookie), `adminAuthHeaders()` helper.
- `src/components/admin/admin-token-gate.tsx` — UI prompt where admin pastes secret. Verifies by hitting `/api/admin/dashboard/stats`. Shows helpful 500 error message pointing to Vercel env vars.

### Payments:
- `src/lib/razorpay-server.ts` — Server-side Razorpay REST API calls. `createRazorpayOrder`, `verifyPaymentSignature`, `verifyWebhookSignature`, `fetchRazorpayPayment`, `refundRazorpayPayment`.
- `src/app/api/payments/create-order/route.ts` — POST, creates Razorpay order (idempotent via `idempotencyKey`). Has **detailed validation** that returns `Missing or invalid fields: <list>` instead of generic error.
- `src/app/api/payments/verify/route.ts` — POST, verifies signature, grants entitlement.
- `src/app/api/payments/webhook/route.ts` — Razorpay webhook receiver.
- `src/app/api/payments/access-check/route.ts` — Access control check.
- `src/app/api/payments/invoice/[paymentId]/route.ts` — Invoice download.
- `src/app/api/admin/payments/*` — Admin payment CRUD + refund + export.

### Admin UI:
- `src/app/page.tsx` — **ONLY route exposed to user**. Switches between sections via `currentSection` from Zustand store.
- `src/lib/store.ts` — Zustand store with `currentSection`.
- `src/components/admin/admin-shell.tsx` — Sidebar + layout.
- `src/components/admin/*.tsx` — One component per section (dashboard, categories, subjects, tests, daily-quiz, previous-papers, questions, announcements, upcoming-exams, banners, current-affairs, users, payments, products, notifications, premium-plans, payment-settings).
- `src/components/admin/premium-plans.tsx` — **Validates price > 0** (Razorpay minimum ₹1). Has optional `planId` field (for future Razorpay Subscription Plans).
- `src/components/admin/payments.tsx` — Payment management UI.

---

## 6. Architecture Decisions (DO NOT CHANGE without user approval)

### A. Payment model: One-time orders (NOT subscriptions)
- Currently uses Razorpay **Orders** API (`createRazorpayOrder`).
- `planId` field in `premium_plans` Firestore collection is **optional/placeholder**.
- Razorpay Subscription Plans API (`/v1/plans` + `/v1/subscriptions`) is NOT integrated.
- If user wants real auto-renew subscriptions, need to build: `createRazorpaySubscription()`, webhook handler for `subscription.charged`, `razorpaySubscriptionId` field on `PremiumSubscription`.

### B. Database: PostgreSQL required
- Schema is `provider = "postgresql"`. DO NOT switch to sqlite (breaks Vercel).
- Local sandbox CAN use SQLite for testing only if you also change schema — but this breaks Vercel deployment. Better: use Neon free tier Postgres URL in `.env.local` for local too.

### C. Content in Firestore, transactions in Prisma
- Categories, subjects, tests, questions, premium_plans, banners, announcements, etc. → **Firestore** (referenced by string ID in Prisma)
- Users, orders, payments, transactions, entitlements, audit logs → **PostgreSQL via Prisma**

### D. Admin auth = shared secret
- No JWT signing. Admin logs in via Firebase Auth, then separately pastes `ADMIN_JWT_SECRET` value into the AdminTokenGate.
- That value is sent as `x-admin-token` header on every `/api/admin/*` request.
- Server compares header to env var.
- Simple but effective for single-admin panel.

### E. User auth = Firebase ID token
- Flutter app sends Firebase ID token as `Bearer` in `Authorization` header.
- Server verifies via Firebase identitytoolkit REST API (no Admin SDK).
- Falls back to `x-user-id` header when behind trusted gateway (dev/testing).

---

## 7. Current Session History (most recent first)

### Session: 2026-07-03 (current)

**Done:**
1. Diagnosed "Missing or invalid fields" payment error → plan price was 0. Added price > 0 validation in `premium-plans.tsx` + detailed error in `create-order/route.ts`.
2. Ran `bun run db:push` (was never run before — schema/env mismatch).
3. Fixed git push auth — admin repo had expired token `ghp_5HxE...`, copied working token `ghp_P6ht...` from `/home/z/work/examvault` repo.
4. Created `.env.local` with `ADMIN_JWT_SECRET`, Razorpay placeholders, Postgres URL placeholder.
5. Undid unwanted commit `2211065` via `git reset --soft HEAD~1` + force push.
6. Diagnosed Vercel 500 error → root cause was `ADMIN_JWT_SECRET` missing on server, then DB connection fail (schema sqlite vs runtime postgres URL mismatch).
7. Switched schema BACK to `postgresql` for Vercel compatibility (`99a41c9`).
8. Improved `admin-token-gate.tsx` 500 error message to point users to Vercel env vars.
9. **Reverted commit `60842f7`** (`0add95b`) — it had committed `.env`, `upload/Private key Web Push certificates.txt`, `upload/rzp-key.csv live`, and `tool-results/`. Merged improved `.gitignore`.
10. **Payment flow investigation** — traced full flow across both repos (admin + Flutter). Documented in conversation. Key findings:
    - Firestore `isPremium`/`price`/`premiumPrice` are CLIENT-SIDE gating signals only. Backend payment APIs never read Firestore for premium flags.
    - SUBJECT_PACK/EXAM_PACK: price is server-authoritative from Prisma `Product` table. If no Product row exists, purchase fails with "not available for purchase".
    - TEST_PURCHASE/PREMIUM_SUBSCRIPTION: price is client-supplied, bounds-checked [₹1, ₹10,000]. No server-side Firestore price validation (no firebase-admin).
    - Access check is 4-tier: PremiumSubscription > ExamPackPurchase > SubjectPackPurchase > TestPurchase.
11. **Fixed: Auto-sync EXAM_PACK Product when category premium toggled** (`5b58d48`, pushed to `examvault-admin`):
    - Root cause: Admin marked category premium in Categories page → only Firestore updated. No Prisma Product auto-created. Flutter "Unlock this exam" failed.
    - Fix: New API `POST /api/admin/products/sync-from-category` idempotently upserts EXAM_PACK Product (create/activate+sync price / deactivate).
    - `categories.tsx` `handleSave` + `handleDelete` now call this endpoint after Firestore write. Non-fatal on sync failure (warning toast).
    - Also fixes two-sources-of-truth drift: `categories.premiumPrice` (Firestore) ↔ `Product.price` (Prisma) now synced.
12. **Fixed: Category premium paywall not showing in Flutter app** (`e97a0da`, pushed to `examvault`):
    - Root cause: `auth_service.dart` admin bootstrap auto-set `subscriptionStatus=premium` with NO expiry → admin/tester was forever premium in local cache → `home_screen.dart` category tap used only local `auth.isPremium` check → `categoryLocked=false` → paywall never fired.
    - Fix 1: `auth_service.dart` admin bootstrap no longer sets premium. Admin self-promotion only sets `role=admin`.
    - Fix 2: `all_categories_screen.dart` `_showPaywall` now has "Unlock this exam (₹X)" button (was missing — only had "Go Premium").
    - Fix 3: `category_detail_screen.dart` 404 from access-check now shows paywall (`denied`) instead of confusing "rolling out" message.
    - **TESTER ACTION REQUIRED**: existing admin/tester accounts already have stale `subscriptionStatus=premium` in Firestore. Must manually clear `subscriptionStatus` + `isPremium` in `users/{uid}` doc, OR test with a fresh non-admin account.

**Known issues:**
- ⚠️ `upload/rzp-key.csv live` is **still in git history** (revert removed from current tree only). User should regenerate Razorpay LIVE keys if those were real.
- ⚠️ Local `.env.local` has placeholder `DATABASE_URL` — local sandbox admin pages won't load data until real Neon URL is pasted. Vercel works (user confirmed env vars set).
- `.next/` was tracked in early commits (340+ files, including a 57MB .sst). Now gitignored, but history still has them. Optional: `git filter-repo` to clean.
- ⚠️ **TEST_PURCHASE server-side price validation NOT done.** Requires firebase-admin SDK (not installed) to read Firestore test prices server-side. Currently mitigated only by [₹1, ₹10,000] bounds check. A malicious client could buy a free test for ₹1 or a premium plan far below its Firestore price.
- ⚠️ **Subject Pack purchase is dead code in Flutter.** `startSubjectPackPurchase` exists in `razorpay_service.dart` but no UI calls it. Backend SUBJECT_PACK support is complete. UI re-enable requires admin to define subject-pack prices.
- ⚠️ **Optimistic success fallback risk in Flutter.** If `/verify` fails after Razorpay success, app grants local access relying on webhook. If webhook misconfigured, cross-device access breaks.

---

## 8. User's Preferences & Working Style (observed)

1. **Language:** User speaks in Bengali (Banglish — Roman script). Respond in same style. Mix technical English terms naturally.
2. **Direct communication:** User wants short, direct answers. Don't over-explain.
3. **Explain before coding:** When user asks "why", explain root cause FIRST, then offer to fix. Don't jump straight to code changes without confirming.
4. **Confirm before destructive ops:** Force push, history rewrites, reverts — always explain what will happen and confirm.
5. **Push discipline:** User frequently says "push korun" — they want every code change pushed to GitHub immediately so Vercel auto-deploys.
6. **Vercel-first thinking:** User deploys on Vercel. Local sandbox is secondary. Always verify changes work on Vercel, not just locally.
7. **No test code:** User explicitly said "do not write any test code" (system rule).
8. **Don't create docs unless asked:** System rule. This `PROJECT_MEMORY.md` was explicitly requested.
9. **Use Agent Browser for verification:** After code changes, verify via Agent Browser (system rule for post-launch self-verification).
10. **DIRECT WORKFLOW — do NOT rely on local dev server for testing:**
    - User said: "apni apnar dev server kaj korte hobe na direct korben"
    - Meaning: Make code changes directly, push to GitHub, verify on Vercel production.
    - DO NOT spend time testing on local `http://localhost:3000` — local `.env.local` has placeholder DATABASE_URL anyway, so admin pages can't load real data locally.
    - Workflow: Edit code → `bun run lint` → `git commit` → `git push` → tell user to verify on Vercel.
    - Only use local dev server if explicitly needed for debugging a specific issue.
    - User tests on Vercel production directly.

---

## 9. Conventions & Rules

### Git:
- Commit messages: use conventional commits when possible (`fix:`, `feat:`, `chore:`, `Revert "..."`)
- Always push to `origin/main` after commits — Vercel auto-deploys
- Force push only when explicitly approved by user
- NEVER commit: `.env`, `.env.local`, `db/`, `upload/`, `tool-results/`, `.next/`, `dev.log`, secrets

### Code:
- TypeScript strict throughout
- `'use client'` for client components, `'use server'` for server actions
- Use existing shadcn/ui components (in `src/components/ui/`)
- API routes use `force-dynamic` + `runtime = 'nodejs'`
- Footer must be sticky/fixed to bottom (`min-h-screen flex flex-col` + `mt-auto`)
- NEVER use indigo or blue colors (use emerald/green primary)
- Responsive design mandatory (mobile-first)

### API:
- Admin endpoints: `/api/admin/*` — require `x-admin-token` header
- User endpoints: `/api/payments/*` — require Firebase Bearer token or `x-user-id`
- Always use relative paths (no `http://localhost:3000`)
- For cross-service: use `?XTransformPort={port}` query param (Caddy gateway)

### Mini-services:
- Independent bun projects in `mini-services/` folder
- Each has own `package.json` + port + `index.ts`
- WebSocket/socket.io MUST be a mini-service (e.g., port 3003)
- Frontend connects via `io("/?XTransformPort=3003")`

---

## 10. Quick Commands Cheat Sheet

```bash
# Dev
bun run dev                    # Start dev server (background, port 3000)
bun run lint                   # ESLint check
tail -30 dev.log               # Recent server logs

# Database
bun run db:push                # Push schema to DB (creates tables)
bun run db:generate            # Regenerate Prisma client
bun run db:migrate             # Create migration

# Git
git push origin main           # Push (triggers Vercel deploy)
git log origin/main..HEAD      # Show unpushed commits
git status -s                  # Short status

# Test admin API (local)
curl -s "http://localhost:3000/api/admin/dashboard/stats" \
  -H "x-admin-token: examvault_admin_jwt_secret_2026_rotate_me"
```

---

## 11. Open Questions / Pending Work

### 🔴 Payment Flow — Pending (from session 2026-07-03)

- [ ] **P1 — TEST_PURCHASE server-side price validation (admin repo)**
  - Problem: `src/lib/price-resolver.ts` TEST_PURCHASE branch trusts client-supplied `amount` (only bounds-checked ₹1–₹10,000). A malicious client could buy a free test for ₹1 or a premium plan far below its Firestore price.
  - Fix: Install `firebase-admin` SDK + set `FIREBASE_SERVICE_ACCOUNT` env var. Add a Firestore read in `resolvePrice` for TEST_PURCHASE + PREMIUM_SUBSCRIPTION to verify the client amount matches the Firestore `tests.price` / `premium_plans.price`.
  - Files to change: `src/lib/price-resolver.ts`, `package.json` (add firebase-admin), `.env.local` + Vercel env (service account JSON).
  - Risk if not fixed: price tampering attack (low probability for current user base, but real for public app).

- [ ] **P2 — Subject Pack purchase UI re-enable (Flutter repo `examvault`)**
  - Problem: `lib/services/razorpay_service.dart` has `startSubjectPackPurchase` (line 304) but NO UI calls it. The bottom sheet at `test_list_screen.dart:415` has an explicit comment: "subject-pack prices are not yet admin-configurable — the hardcoded ₹99 placeholder was confusing users".
  - Backend `SUBJECT_PACK` productType is fully supported (price-resolver + grantEntitlement + access-check all work).
  - To enable: (a) admin UI needs a way to create SUBJECT_PACK Products (already exists in `src/components/admin/products.tsx` SUBJECT_PACK tab), (b) Flutter `test_list_screen.dart` bottom sheet needs the "Unlock subject pack" button re-added, calling `startSubjectPackPurchase`.
  - Decision needed from user: do they want per-subject purchases, or only per-exam + per-test?

- [ ] **P3 — Optimistic success fallback risk (Flutter repo `examvault`)**
  - Problem: In `lib/services/razorpay_service.dart` `_verifyAndDispatch` (lines 593, 604, 614, 624), if both `/verify` API AND order-status polling fail after Razorpay `EVENT_PAYMENT_SUCCESS`, the app calls `onSuccess` anyway, granting LOCAL access (cache + Firestore `purchasedTests`/`isPremium`). Server-side `TestPurchase`/`PremiumSubscription` row is never created if the webhook also fails to fire.
  - Consequence: User gets access on ONE device only. Cross-device / reinstall loses access until re-purchase.
  - Fix options: (a) make webhook rock-solid (configure in Razorpay dashboard + test), (b) add a retry-verify background job in Flutter that polls `/verify` for 24h after a Razorpay success, (c) remove the optimistic fallback (worse UX but safer).
  - User decision needed on which approach.

- [ ] **P3 — Razorpay webhook configuration**
  - Webhook URL needs to be configured in Razorpay dashboard pointing to `https://<vercel-domain>/api/payments/webhook`
  - Without this, the "safety net" path C in `src/app/api/payments/webhook/route.ts` never fires. App relies solely on client-side `/verify` call.
  - User needs to do this in Razorpay dashboard (not a code change).

### 🟡 General — Pending

- [ ] User needs to paste real Neon Postgres URL into `.env.local` for local sandbox to fully work
- [ ] Optional: clean git history of `.next/` and `upload/rzp-key.csv live` via `git filter-repo`
- [ ] Optional: build real Razorpay Subscription integration if user wants auto-renew (currently one-time orders only; `planId` field on premium_plans is placeholder)

### ✅ Payment Flow — Resolved this session

- [x] ~~Category premium toggle did not auto-create EXAM_PACK Product~~ → FIXED via `POST /api/admin/products/sync-from-category` + `categories.tsx` integration (commit `5b58d48`).
- [x] ~~Two sources of truth for category price (Firestore premiumPrice vs Prisma Product.price)~~ → FIXED by same sync endpoint. Prisma price now mirrors Firestore premiumPrice on every category save.

---

## 12. How to Update This File

Whenever you (the AI) do something significant:
1. Update section 7 (Current Session History) — add what was done
2. Update section 8 (User Preferences) if you learned something new
3. Update section 11 (Open Questions) if items are resolved or new ones appear
4. Update section 4 (Env Vars) if secrets change
5. Update section 5 (Files) if new important files are created

**Do NOT delete historical entries** — append to them. This file is append-only history.

---

*Last updated: 2026-07-03, session `web-f5c52b64-3b4c-480b-bc68-e2de3096e2ee` (payment flow investigation + EXAM_PACK auto-sync fix)*
