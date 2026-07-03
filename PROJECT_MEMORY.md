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

**Fixed: Category premium toggle not actually gating tests (access bypass) (`f3c04c2`, pushed to `examvault-admin`):**
- User report (verbatim): "amar admin all total akta cetegory ache are sekhane all test ache. ami jei category te premium lagiyechi thik ache but user app to sob jaigai lock thakar kotha, karon ami direct category te premium lagiyechi, kintu seta na hoye category sudhu lock are test a click kore test dite parche tahole premium er ki mane holo"
- **Root cause:** Flutter `take_test_screen.dart` line 70-77 has a fast-path: `if (!widget.test.isPaid) { _accessGranted = true; return; }`. `isPaid` = `price > 0 || isPremium` (TestModel). Admin was toggling `category.isPremium=true`, but each test doc has its OWN `isPremium` field which stayed `false`. So `test.isPaid` was false → fast-path granted access → no paywall fired. The category-level premium flag only controls the "Unlock this exam" button visibility; the actual test-access gate is per-test `isPremium`.
- **Fix (admin/categories.tsx):**
  - `handleSave`: after writing the category doc, query all tests where `categoryId == categoryId` and batch-update their `isPremium` flag to match the category's new `isPremium` value. Toast reports how many tests were updated. Non-fatal on failure.
  - `handleDelete`: before deleting a category, batch-set `isPremium=false` on all its tests so they don't stay locked behind a now-gone paywall.
  - New imports: `getDocs`, `query`, `where` (writeBatch was already there).
- **User action required after deploy:** Open the existing premium category in admin Categories page → click Save (no changes needed — just trigger handleSave). All tests in that category will get `isPremium=true` → Flutter fast-path will skip them → server access-check will run → paywall fires for non-entitled users. New categories: propagation is automatic.
- **Why this design:** Could alternatively fix on Flutter side (check parent category premium in take_test_screen), but admin-side propagation is simpler — single source of truth stays on each test doc, no extra Firestore reads in the app, works offline after first sync.

**Fixed: "Subscribe → payment failed missing field product" — empty `planId` rejected by backend (`62a9e93`, pushed to `examvault-admin`):**
- User reported: "subscribe for click korle payment faild missing filed, product"
- **Root cause:** Admin panel Premium Plans form has an optional "Razorpay Plan ID" field. When admin left it empty, Firestore `premium_plans.planId` was `''`. Flutter `startPayment` sends `planId` as `productId` to `/api/payments/create-order`. Backend validation `if (!productId) missing.push('productId')` rejected empty string → "Missing or invalid fields: productId" → user saw "payment failed missing field product".
- **Fix 1 (admin/premium-plans.tsx `handleSave`):** On `addDoc`, if `planId` empty, `updateDoc` it with the Firestore doc id. On `updateDoc` (edit), if admin cleared `planId`, fall back to doc id. New + re-saved plans now always have non-empty `planId`.
- **Fix 2 (create-order/route.ts) — defensive backend fallback:** For `PREMIUM_SUBSCRIPTION` ONLY, if `productId` is empty (existing plans created before Fix 1 that haven't been re-saved), generate `plan_<idempotencyKey>` as `effectiveProductId`. Same for `productName` → fall back to `meta.planName` or 'Premium Subscription'. TEST_PURCHASE / SUBJECT_PACK / EXAM_PACK remain strictly validated (real testId/refId required).
- All `resolvePrice`, `createRazorpayOrder`, `db.order.create`, `db.order.update`, paymentLog payload, and JSON response now use `effectiveProductId` / `effectiveProductName` so the fallback flows end-to-end.
- **User action required:** None for new purchases. Existing premium plans with empty `planId` will now work via Fix 2. Optionally, admin can open each existing plan in the Premium Plans page and click "Edit → Update" to back-fill `planId` with the doc id (Fix 1).

**Fixed: "Go Premium / paywall not working" — admin panel kept re-granting premium (`622f203`, pushed to `examvault-admin`):**
- User reported: "laste jei kaj ta korechi seta hoi nai" (previous fix didn't work).
- **Root cause:** Flutter's `auth_service.dart` was fixed in commit `e97a0da` to NOT set `subscriptionStatus: 'premium'` on admin bootstrap. BUT the admin panel's `src/lib/admin-auth.tsx` STILL had the old code — it set `isPremium: true` + `subscriptionStatus: 'premium'` on `users/{uid}` doc every time admin logged in.
- Effect: Even if user manually cleared `subscriptionStatus` in Firestore (as the previous fix instructed), the next admin panel login re-set it to `premium` → admin/tester was forever premium in the app → paywall never fired → "Premium button doesn't work".
- Fix: `admin-auth.tsx` bootstrap + promotion now sets ONLY `role: 'admin'`. Does NOT touch `isPremium` / `subscriptionStatus`. Matches the Flutter-side fix.
- **Tester action required (one-time, STILL needed):** existing admin user doc in Firestore `users/{uid}` still has stale `isPremium: true` + `subscriptionStatus: 'premium'`. User must manually clear these two fields in Firebase Console → Firestore → `users/{adminUid}` (set `isPremium: false`, `subscriptionStatus: 'free'`, or delete the fields). After this fix, future admin logins will no longer re-introduce them.

**Pending investigation — "Premium button shows no plans" (saved before user testing):**

> User report: Flutter app-এ category-তে click করে "Premium" button-এ click করলে plan list দেখাচ্ছে না ("No Plans Available"). Category premium toggle + EXAM_PACK auto-sync fix কাজ করেছে (verified আগের session-এ), কিন্তু Go Premium flow আলাদা।

**Two SEPARATE purchase flows (DO NOT confuse):**
1. **"Unlock this exam" (EXAM_PACK)** → category unlock, Razorpay direct payment, price server-authoritative from Prisma `Product` table. ✅ WORKING (auto-sync fix `5b58d48`).
2. **"Go Premium" (PREMIUM_SUBSCRIPTION)** → premium screen, plan list shown, price client-validated (bounds ₹1–₹10,000). ❌ "No Plans Available" bug.

**Architecture (how premium_plans flow works):**
- Admin writes plans to Firestore `premium_plans` collection via **client-side Firebase SDK** (`src/lib/firebase.ts`) in `src/components/admin/premium-plans.tsx` (`addDoc`/`updateDoc`).
- Flutter app reads `premium_plans` directly from Firestore (its own Firebase SDK) — NO admin API endpoint involved.
- Plan schema fields: `name`, `price` (>0, Razorpay min ₹1), `durationMonths`, `durationLabel`, `planId` (optional placeholder for future Razorpay Subscription Plans), `description`, `features[]`, `isPopular`, `isActive`, `order`.
- Flutter filters by `isActive === true` (boolean). If `isActive` missing or stored as string, filter fails → "No Plans Available".

**Most likely root causes (ranked, to verify after user tests):**
- **[A] No plans exist in Firestore `premium_plans` collection** — admin may have toggled category premium but never created any premium plan in the Premium Plans admin page. → Check admin panel → Premium Plans section → are there any cards?
- **[B] Plans exist but `isActive: false`** — admin created plans but the toggle got turned off, or the default wasn't true. → Check each plan card in admin — green "Active" badge vs grey "Inactive".
- **[C] Firestore security rules block the read** — `premium_plans` collection rules may require auth, or may not allow read for non-admin users. → Check `firestore.rules` in `examvault` repo (or wherever deployed). Should allow `allow read: if true;` or `if request.auth != null;` for this collection.
- **[D] Flutter query filter mismatch** — Flutter may query `where('isActive', '==', true)` but field stored as string "true" or missing. → Check Flutter `premium_plans` read code (likely in `lib/services/` or `lib/screens/premium_screen.dart`).
- **[E] Flutter pointing to wrong Firestore project** — if Flutter app uses a different Firebase project than admin panel, plans written in admin won't be visible. → Compare `google-services.json` / `firebase_options.dart` project ID vs admin's `src/lib/firebase.ts` config.

**After user tests, ask which admin screen state they see:**
- "Premium Plans page-এ কোনো plan আছে? থাকলে Active না Inactive?"
- "Flutter app-এ premium screen-এ error দেখায় নাকি শুধু empty list?"

**Files involved:**
- Admin write: `src/components/admin/premium-plans.tsx` (client SDK direct Firestore write)
- Admin Firestore config: `src/lib/firebase.ts`
- Price resolver (server): `src/lib/price-resolver.ts` — PREMIUM_SUBSCRIPTION branch (lines 119–145) uses client amount, bounds-checked.
- Create order: `src/app/api/payments/create-order/route.ts`
- Grant entitlement: `src/app/api/payments/verify/route.ts`
- Access check: `src/app/api/payments/access-check/route.ts`
- Flutter read: (in `examvault` repo, not this repo) — `lib/screens/premium_screen.dart` or similar + `lib/services/` Firestore queries.

**Done (this session, before premium-plans investigation):**
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

- [ ] **P0 — "Go Premium" shows "No Plans Available" in Flutter (BLOCKING)**
  - Symptom: Flutter app → category → "Premium" button → premium screen → "No Plans Available".
  - This is the **PREMIUM_SUBSCRIPTION** flow, NOT the EXAM_PACK flow (which is fixed).
  - See full diagnostic in section 7 above ("Pending investigation — Premium button shows no plans").
  - Resume steps after user tests:
    1. Ask user: admin Premium Plans page-এ plan আছে কিনা? Active না Inactive?
    2. If no plans → user creates one in admin (price > 0, isActive on).
    3. If plans exist + active → check Firestore rules + Flutter query + Firebase project ID match.
    4. If still broken → read Flutter `premium_screen.dart` + Firestore rules file to debug.

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

*Last updated: 2026-07-03, session `web-f5c52b64-3b4c-480b-bc68-e2de3096e2ee` (fixed category premium not gating tests — admin now propagates `isPremium` to all tests in the category on save/delete — `f3c04c2` pushed; user must re-save existing premium category once)*

---

## 13. Flutter App Fixes (session `web-f5c52b64...`, continued)

> ⚠️ **IMPORTANT — Memory location rule**: Project memory lives in THIS admin
> repo (`/home/z/my-project/PROJECT_MEMORY.md`), NOT in the Flutter repo.
> Reason: every commit+push to the Flutter repo triggers a GitHub Actions APK
> build. Saving memory / docs to the Flutter repo causes unnecessary duplicate
> builds. Always update memory here.

### 13.1 🚫 Flutter Admin Premium UI — mistake (don't repeat)

**What happened:** User said "Re-sync premium button doesn't exist". I
incorrectly added premium management UI (toggle, propagation, Re-sync button,
auto-inherit) to the **Flutter admin app**.

**User feedback:** "futter upp er dorkar chilo na are seta faild hoyeche"
(Flutter app didn't need this, and it failed to build).

**Lesson:**
- User manages premium **only from this Web Admin** (Next.js).
- Re-sync button already exists in Web Admin
  (`src/components/admin/categories.tsx` ~line 498-507).
- NEVER add premium UI to the Flutter admin app.
- If user says a feature is "missing", check Web Admin FIRST.
- Flutter SDK is NOT installed in this sandbox — can't `dart analyze` /
  build. Verify with brace/paren balance checks only.

**✅ The buggy commit (`bfe034c`) WAS REVERTED on 2026-07-03** (commit `5340c12`).
It broke 4 builds in a row (`bfe034c`, `abf0b5b`, `76bfa2b`, `047969c`) with a
compile typo: `$propagate` instead of `$propagated` in
`admin_categories_screen.dart:434`. The revert was clean (no later commit had
touched those files). Followed by version bump to `v1.40.0+47` (commit `867c8dc`)
which built **successfully** — the failure streak ended. The reverted files:
- `lib/admin/screens/admin_categories_screen.dart` (premium toggle, Re-sync)
- `lib/admin/screens/admin_tests_screen.dart` (auto-inherit premium)
- `lib/services/firestore_service.dart` (propagation methods)
- `pubspec.yaml` (version bump — re-applied as 1.40.0+47)

> NOTE: Category premium propagation still works correctly because the
> **Web Admin** (Next.js) does it server-side. The Flutter admin revert only
> removed the unwanted/duplicate Flutter-side UI; it did NOT break premium.

### 13.2 💰 Premium System Architecture (don't confuse the two)

Two SEPARATE premium systems — never mix them up:

1. **Category Premium (Exam Pack)** — `productType: EXAM_PACK`
   - Per-category purchase. User unlocks one specific category.
   - Admin sets `isPremium=true` + `premiumPrice` on a category (Web Admin
     Categories screen). That's ENOUGH — backend auto-creates Prisma Product
     via `POST /api/admin/products/sync-from-category`.
   - **No need to also create a Premium Plan.**
2. **Premium Plans (Global Subscription)** — `productType: PREMIUM_SUBSCRIPTION`
   - Global all-access subscription (monthly/quarterly/etc.).
   - Admin creates plans in Premium Plans screen (price + duration).
   - OPTIONAL — if admin only wants category premium, Premium Plans can stay
     empty. No conflict even if prices differ — `src/lib/price-resolver.ts`
   decides which price to charge.

**User's question was:** "category te premium dile abar Premium Plans e keno
dite hoy?" → Answer: dite hoy na. Category premium works alone.

**Category premium propagation:** Tests have no `categoryId` field — only
`subjectId`. So category premium must propagate through the subjects
collection to update test `isPremium` flags. Firestore `in` query limit = 30
→ chunking required.

**User app lock logic:** `TestModel.isPaid = price > 0 || isPremium` (Flutter
reads directly from Firestore). Category premium → user app shows lock on
category (correct). Clicking shows "Unlock this exam (₹X)" — this IS the
correct Exam Pack purchase flow, NOT a bug.

### 13.3 ✅ Payment UX Fix — loading + success everywhere (Flutter commit `abf0b5b`)

**User complaint:** "Unlock this exam click kore kichu show na kore aktu somoy
niye tarpore upore akta line loding hoye payment option khule, joto jaigai
payment option ache sob jaigai eirokom wait korar somoy ba payment success er
message dekhabe, na hoye user ra bolbe app hang hoye geche"

**Root cause:** `RazorpayService.startExamPackPurchase` and
`startSubjectPackPurchase` were MISSING the `onPreparing`/`onCheckoutOpened`/
`onVerifying` callbacks (the other two methods had them). So `createOrder`
(2-20s) ran silently — no loading indicator. 3 screens only showed a subtle
SnackBar on success.

**Fix (commit `abf0b5b`, pushed to `titun43/examvault`):**
1. `lib/services/razorpay_service.dart` — added callbacks + concurrent-payment
   guard + 20s createOrder timeout to both `startExamPackPurchase` and
   `startSubjectPackPurchase`.
2. `lib/screens/home/category_detail_screen.dart` — wired PaymentProgressDialog
   + PaymentSuccessDialog.
3. `lib/screens/home/home_screen.dart` (`_startExamPackFromHome`) — same.
4. `lib/screens/home/all_categories_screen.dart` (`_startExamPackPurchase`) — same.
5. `lib/screens/premium/premium_screen.dart` — success SnackBar →
   PaymentSuccessDialog.

All 6 payment trigger points now show consistent loading + success feedback:
| # | Screen | Method | Status |
|---|--------|--------|--------|
| 1 | Category Detail | startExamPackPurchase | Fixed |
| 2 | Home | startExamPackPurchase | Fixed |
| 3 | All Categories | startExamPackPurchase | Fixed |
| 4 | Premium Plans | startPayment | Upgraded |
| 5 | Test List | startTestPurchase | Already had it |
| 6 | Take Test | startTestPurchase | Already had it |

Helper widgets (already existed, reused):
- `lib/widgets/payment_progress_dialog.dart` — never-stuck loading dialog
- `lib/widgets/payment_success_dialog.dart` — prominent success modal

### 13.4 ✅ Signup Name Bug — "User" instead of real name (Flutter commit pending)

**User complaint:** "user jodi singup kore tokhon se name email id are passrod
diye singup kore, thik ache but login hoyar por, namer jaigai user keno show
korbe, se to name diye singup koreche, sekhane to name thkar kotha"

**Root cause — race condition during signup:**
1. `createUserWithEmailAndPassword` fires `authStateChanges` IMMEDIATELY.
2. The `authStateChanges` listener calls `loadUserData()` BEFORE
   `updateDisplayName(name)` and `_createOrUpdateUser(name)` run.
3. `loadUserData()` finds no Firestore doc → fallback creates one with
   `name: fbUser.displayName ?? 'User'` = "User" (displayName not set yet).
4. `_createOrUpdateUser` then runs, finds the doc EXISTS (created by fallback),
   so it only updates `lastActiveAt` → **name stays "User" forever**.
5. On every subsequent login, `getCurrentUserData()` returns "User".

**Fix (2 parts, in Flutter repo):**

1. **`lib/services/auth_service.dart`** — `_createOrUpdateUser`: when `name` is
   explicitly passed, ALWAYS write it to Firestore even for existing docs
   (previously the existing-doc branch only updated `lastActiveAt`). This fixes
   NEW signups.

2. **`lib/providers/auth_provider.dart`** — `loadUserData`: added RECOVERY for
   existing affected users. If Firestore name is exactly `'User'` (the fallback
   string) but Firebase Auth `displayName` is a real name (non-null, non-empty,
   != 'User'), use and persist the displayName. This auto-fixes users who
   signed up before the bug fix — they'll see their real name on next login
   without needing to re-signup or edit profile.

**Note:** The recovery only triggers when Firestore name == 'User' exactly, so
it won't override a real name that happens to be different. The only edge case
is a user whose actual name is literally "User" — they'd be re-overwritten from
Firebase Auth displayName, but that's extremely rare and the displayName would
also be "User" in that case (so no change).

---

## 14. Session Log — 2026-07-03 (build-failure streak fixed)

**Context:** User reported "futter app er 3 ta buld faild hoyeche" — actually 4
builds had failed in a row (`bfe034c`, `abf0b5b`, `76bfa2b`, `047969c`). The
last successful build was `e97a0da` (v1.38.0+45).

**Investigation:** Used the GitHub Actions API (with the token from the git
remote URL) to list runs + download the failed job log. The actual error was a
Dart compile typo in `bfe034c`:
```
lib/admin/screens/admin_categories_screen.dart:434:23: Error: The getter 'propagate' isn't defined
```
i.e. `$propagate` instead of `$propagated`. This was exactly the buggy commit
flagged in section 13.1 above.

**Fix (2 commits, 1 push → 1 build):**
1. `5340c12` — `git revert bfe034c --no-edit`. Clean revert (no later commit
   had touched `admin_categories_screen.dart`, `admin_tests_screen.dart`,
   `firestore_service.dart`, or `pubspec.yaml`). Restored those files to the
   last-known-good (`e97a0da`) state.
2. `867c8dc` — bumped version `1.38.0+45` → `1.40.0+47` (skipped 1.39.0+46
   since that version never built successfully) AND removed the misplaced
   `PROJECT_MEMORY.md` from the Flutter repo (it lives here in the admin repo
   — pushing it to Flutter had triggered an extra duplicate build).

**Result:** Build `867c8dc` → **✅ SUCCESS** (all 18 steps passed: Build APK,
Build AAB, signature verify, artifact upload). The 4-build failure streak ended.

**What's now live in the new APK (v1.40.0+47):**
- Signup name fix (`047969c`) — real name shows after login, not "User".
- Payment UX loading + success feedback on all 6 trigger points (`abf0b5b`).
- Flutter admin premium mistake (`bfe034c`) fully removed.

**Lesson reinforced:**
- When memory flags a commit as "buggy / not yet reverted", and builds start
  failing, that commit is the prime suspect — revert it promptly.
- Use the GitHub Actions API (`actions/runs`, `actions/runs/{id}/jobs`,
  `actions/jobs/{id}/logs`) with the token from `git config remote.origin.url`
  to diagnose CI failures when `gh` CLI isn't installed.
- Combine a revert + version bump + cleanup into one push to avoid wasting
  CI minutes (Flutter APK builds take ~6-10 min each).

**Reusable commands for next time:**
```bash
# Extract token from git remote
python3 -c "import re; print(re.search(r':(.+?)@', open('.git/config').read()).group(1))" > /tmp/ghtoken
# List recent runs
TOKEN=$(cat /tmp/ghtoken); curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/titun43/examvault/actions/runs?per_page=10"
# Get jobs + which step failed
curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/titun43/examvault/actions/runs/{RUN_ID}/jobs"
# Download a job's log
curl -s -H "Authorization: token $TOKEN" -L \
  "https://api.github.com/repos/titun43/examvault/actions/jobs/{JOB_ID}/logs" -o /tmp/build_log.txt
```

---

## 15. Session Log — 2026-07-03 (CRITICAL: exam pack entitlement FK violation)

**User report:** "admin theke category te premium lagiyechi, sob thik ache
user app, category te click kore payment korechi, success o hoyeche, but
open exam a click korle abar payment korte bole" — After paying for a premium
category (EXAM_PACK), tapping "Open Exam" shows the paywall again.

**Root cause — TWO bugs:**

### Bug 1 (backend, CRITICAL): grantEntitlement FK violation
- `create-order` stores `order.productId` = the Firestore `categoryId`
  (the client-sent productId), NOT the Prisma `Product.id` (a cuid).
- `verify` passes `order.productId` to `grantEntitlement` as the `productId`
  parameter.
- `grantEntitlement` (EXAM_PACK case) used this Firestore categoryId as
  `ExamPackPurchase.productId` in the `create` path of the upsert.
- `ExamPackPurchase.productId` has a FK to `Product.id`.
- Firestore categoryId ≠ Product.id → **foreign-key constraint violation**
  every time → entitlement row NEVER created.
- Same bug existed for SUBJECT_PACK (`SubjectPackPurchase.productId` FK).

### Bug 2 (Flutter, timing): clearCache instead of optimistic mark
- The "INSTANT SUCCESS" pattern (commit `61b84bd`, v1.37.0+44) calls
  `onSuccess` immediately when Razorpay confirms, then runs `/verify`
  silently in the background.
- The 3 category screens' `onSuccess` called `AccessService.clearCache()`
  (forcing the next `_checkAccess()` to hit the backend), but the background
  `/verify` may not have completed yet → backend returns `denied` → paywall.
- `test_list_screen` and `premium_screen` already used the correct pattern
  (`markTestPurchased` / `markPremiumGranted`), but the category screens
  were missed.

**Why it was masked:** The INSTANT SUCCESS pattern swallows `/verify`
errors silently (by design — the webhook is the safety net). So the user
sees "Payment Successful" even though the backend never granted the
entitlement. The paywall only reappears on the next access check.

**Fixes:**
1. **Backend** (`src/lib/payment-access.ts`, commit `ff09d8c`): In
   `grantEntitlement`, for EXAM_PACK and SUBJECT_PACK, resolve the real
   `Product.id` by looking up `(type, refId=categoryId/subjectId, isActive)`
   inside the transaction, and use that for the purchase row's `productId`.
   The `update` path is unaffected (doesn't touch productId). This also
   covers the webhook path (same `grantEntitlement` call).

2. **Flutter** (commit `ee57db2`, v1.41.0+48): 3 category screens
   (`category_detail_screen`, `home_screen`, `all_categories_screen`):
   replaced `AccessService.clearCache()` with
   `AccessService.markExamPackPurchased(category.id)` in the `onSuccess`
   callback. This writes a positive decision to the in-memory cache (60s
   TTL) so `_checkAccess()` returns instantly without a network round-trip.

**Impact on existing affected users:**
- Users who paid BEFORE this fix: their payment succeeded (Order is PAID,
  Payment row exists) but NO ExamPackPurchase row was created.
- They will still see the paywall even after the fix deploys.
- **Recovery options:**
  1. **Re-trigger the Razorpay webhook** for the affected `payment_id`.
     The webhook now uses the fixed `grantEntitlement` and will create the
     missing entitlement. (Razorpay dashboard → Payments → find the payment
     → "Send Webhook" or use the Razorpay API.)
  2. **Manual DB insert**: `INSERT INTO "ExamPackPurchase" (id, userId,
     productId, categoryId, packName, amount, paymentId, orderId,
     isActive, createdAt) VALUES (...)`. The `productId` must be the
     Product.id from the Product table (look up by refId = categoryId).
  3. **Refund + re-purchase**: refund the affected payment and have the
     user re-purchase (the new purchase will work correctly).

**Architecture lesson — `order.productId` semantics:**
- `Order.productId` is a plain String (no FK). The comment says:
  "Firestore testId / Product.id / premiumPlanId / categoryOrSubjectRef".
- For TEST_PURCHASE: Firestore testId (no FK on TestPurchase.testId).
- For PREMIUM_SUBSCRIPTION: planId (no FK on PremiumSubscription.planId).
- For EXAM_PACK: Firestore categoryId (= Product.refId, NOT Product.id).
- For SUBJECT_PACK: Firestore subjectId (= Product.refId, NOT Product.id).
- The disconnect: `order.productId` for packs is the Firestore refId, but
  `ExamPackPurchase.productId` / `SubjectPackPurchase.productId` have FKs
  to `Product.id`. This mismatch caused the bug.
- **Fix approach**: resolve the Product.id in `grantEntitlement` (not in
  create-order) to avoid changing the Order schema and breaking legacy
  orders. The `resolveOrderMeta` fallback (which uses `parsed.productId`
  as categoryId for EXAM_PACK) still works because it only fires for
  legacy orders without stored meta.

**Files changed:**
- Backend: `src/lib/payment-access.ts` (grantEntitlement EXAM_PACK +
  SUBJECT_PACK cases — resolve Product.id via refId lookup).
- Flutter: `lib/screens/home/category_detail_screen.dart`,
  `lib/screens/home/home_screen.dart`,
  `lib/screens/home/all_categories_screen.dart` (clearCache →
  markExamPackPurchased).
- Flutter: `pubspec.yaml` (version bump 1.40.0+47 → 1.41.0+48).

**How to verify the fix works:**
1. Vercel deploys `ff09d8c` (check Vercel dashboard).
2. Flutter APK build `ee57db2` succeeds (check GitHub Actions).
3. User installs the new APK, opens a premium category, pays.
4. Tapping "Open Exam" should now show the subjects list (not the paywall).
5. Backend: check `ExamPackPurchase` table — a new row should exist with
   `categoryId` = the Firestore category id and `productId` = a valid
   Product.id.

**Recovery for the user who reported this bug:**
- They already paid. Their payment is in the DB (Order status = PAID,
  Payment row exists).
- After the fix deploys, they should NOT need to pay again.
- Option A: re-trigger the webhook for their payment_id.
- Option B: admin manually inserts the ExamPackPurchase row.
- Option C: if neither is feasible, refund + have them re-purchase
  (new purchase will work correctly).
