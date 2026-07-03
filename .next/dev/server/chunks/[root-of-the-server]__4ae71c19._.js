module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
// =============================================================================
// ExamVault - Prisma Database Client (singleton)
// =============================================================================
// Server-only. Never import this from a client component.
// Payment/transaction data lives in SQLite via Prisma. Content (categories,
// subjects, tests) lives in Firestore and is referenced by ID here.
// =============================================================================
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
// Resolve the DATABASE_URL. In the sandbox, .env sets it to a file:// SQLite
// path. We also fall back to .env.local for local dev overrides.
function resolveDatabaseUrl() {
    const envUrl = process.env.DATABASE_URL ?? '';
    if (envUrl) return envUrl;
    // Last resort: empty (Prisma will throw a clear error)
    return '';
}
const databaseUrl = resolveDatabaseUrl();
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'warn',
        'error'
    ] : "TURBOPACK unreachable",
    ...databaseUrl ? {
        datasources: {
            db: {
                url: databaseUrl
            }
        }
    } : {}
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/razorpay-server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRazorpayOrder",
    ()=>createRazorpayOrder,
    "fetchRazorpayPayment",
    ()=>fetchRazorpayPayment,
    "paiseToRupees",
    ()=>paiseToRupees,
    "refundRazorpayPayment",
    ()=>refundRazorpayPayment,
    "rupeesToPaise",
    ()=>rupeesToPaise,
    "verifyPaymentSignature",
    ()=>verifyPaymentSignature,
    "verifyWebhookSignature",
    ()=>verifyWebhookSignature
]);
// =============================================================================
// ExamVault - Server-side Razorpay integration
// =============================================================================
// Uses the official Razorpay REST API via fetch (no extra deps).
// All payment creation + verification happens HERE, never on the client.
// Client only receives the Razorpay orderId and opens the checkout modal.
// =============================================================================
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const RAZORPAY_BASE = 'https://api.razorpay.com/v1';
function getCredentials() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId.includes('XXXX')) {
        throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local');
    }
    return {
        keyId,
        keySecret
    };
}
function authHeader() {
    const { keyId, keySecret } = getCredentials();
    const token = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    return `Basic ${token}`;
}
async function createRazorpayOrder(opts) {
    const res = await fetch(`${RAZORPAY_BASE}/orders`, {
        method: 'POST',
        headers: {
            Authorization: authHeader(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: opts.amount,
            currency: opts.currency ?? 'INR',
            receipt: opts.receipt,
            payment_capture: 1,
            notes: opts.notes ?? {}
        })
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Razorpay order creation failed (${res.status}): ${err}`);
    }
    return res.json();
}
function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    const { keySecret } = getCredentials();
    const expected = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac('sha256', keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
    // timing-safe compare
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(razorpaySignature, 'hex');
    if (a.length !== b.length) return false;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].timingSafeEqual(a, b);
}
function verifyWebhookSignature(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return false;
    const expected = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac('sha256', secret).update(rawBody).digest('hex');
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(signature, 'hex');
    if (a.length !== b.length) return false;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].timingSafeEqual(a, b);
}
async function fetchRazorpayPayment(paymentId) {
    const res = await fetch(`${RAZORPAY_BASE}/payments/${paymentId}`, {
        headers: {
            Authorization: authHeader()
        }
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to fetch payment ${paymentId} (${res.status}): ${err}`);
    }
    return res.json();
}
async function refundRazorpayPayment(paymentId, amount) {
    const res = await fetch(`${RAZORPAY_BASE}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
            Authorization: authHeader(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(amount ? {
            amount
        } : {})
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Refund failed for payment ${paymentId} (${res.status}): ${err}`);
    }
    return res.json();
}
function rupeesToPaise(rupees) {
    return Math.round(rupees * 100);
}
function paiseToRupees(paise) {
    return paise / 100;
}
}),
"[project]/src/lib/payment-auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireAdmin",
    ()=>requireAdmin,
    "requireUser",
    ()=>requireUser,
    "upsertUser",
    ()=>upsertUser
]);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
function requireAdmin(req) {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
        return {
            ok: false,
            response: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Admin secret not configured'
            }, {
                status: 500
            })
        };
    }
    if (!token || token !== secret) {
        return {
            ok: false,
            response: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            })
        };
    }
    return {
        ok: true
    };
}
async function requireUser(req) {
    const auth = req.headers.get('authorization') ?? '';
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    // Path A: Firebase ID token
    if (bearer && bearer.length > 40) {
        try {
            const verified = await verifyFirebaseToken(bearer);
            return {
                ok: true,
                user: verified
            };
        } catch  {
        // fall through to gateway header
        }
    }
    // Path B: trusted internal gateway header (x-user-id set by admin/gateway)
    const trustedUid = req.headers.get('x-user-id');
    if (trustedUid) {
        return {
            ok: true,
            user: {
                firebaseUid: trustedUid
            }
        };
    }
    return {
        ok: false,
        response: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Authentication required'
        }, {
            status: 401
        })
    };
}
async function verifyFirebaseToken(token) {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) throw new Error('Firebase API key missing');
    // Firebase identitytoolkit: verify a custom token / ID token by posting it
    // and reading the response. This is the lightweight approach without the
    // Admin SDK.
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idToken: token
        })
    });
    if (!res.ok) throw new Error(`Firebase token verify failed (${res.status})`);
    const data = await res.json();
    const u = data?.users?.[0];
    if (!u) throw new Error('No user for token');
    return {
        firebaseUid: u.localId,
        email: u.email,
        phone: u.phoneNumber,
        displayName: u.displayName
    };
}
async function upsertUser(u) {
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
        where: {
            firebaseUid: u.firebaseUid
        }
    });
    if (existing) {
        // refresh denormalized fields if changed
        if (existing.email !== (u.email ?? null) || existing.phone !== (u.phone ?? null) || existing.displayName !== (u.displayName ?? null)) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.update({
                where: {
                    id: existing.id
                },
                data: {
                    email: u.email,
                    phone: u.phone,
                    displayName: u.displayName
                }
            });
        }
        return existing.id;
    }
    const created = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.create({
        data: {
            firebaseUid: u.firebaseUid,
            email: u.email,
            phone: u.phone,
            displayName: u.displayName
        }
    });
    return created.id;
}
}),
"[project]/src/app/api/payments/_lib.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// Shared helpers for /api/payments/* routes
// =============================================================================
__turbopack_context__.s([
    "formatDate",
    ()=>formatDate,
    "formatINR",
    ()=>formatINR,
    "generateOrderRef",
    ()=>generateOrderRef,
    "getClientMeta",
    ()=>getClientMeta
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
function generateOrderRef() {
    const ts = Date.now().toString(36);
    const rand = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(3).toString('hex'); // 6 hex chars
    return `EV-${ts}-${rand}`;
}
function getClientMeta(req) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    return {
        ip,
        userAgent
    };
}
function formatINR(paise) {
    const rupees = paise / 100;
    return `₹${rupees.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}
function formatDate(d) {
    return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata'
    });
}
}),
"[project]/src/app/api/payments/create-order/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// POST /api/payments/create-order
// =============================================================================
// Creates a Razorpay order for a product purchase. Idempotent on the client
// `idempotencyKey`: a duplicate request for a PAID/CREATED/ATTEMPTED order
// returns the existing Razorpay order id; a FAILED/EXPIRED order is recreated.
// =============================================================================
__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$razorpay$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/razorpay-server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payment$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/payment-auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$payments$2f$_lib$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/payments/_lib.ts [app-route] (ecmascript)");
const dynamic = 'force-dynamic';
const runtime = 'nodejs';
;
;
;
;
;
async function POST(req) {
    const clientMeta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$payments$2f$_lib$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClientMeta"])(req);
    try {
        // ---- Auth ----
        const auth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payment$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireUser"])(req);
        if (!auth.ok) return auth.response;
        const prismaUserId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payment$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["upsertUser"])(auth.user);
        // ---- Parse body ----
        let body;
        try {
            body = await req.json();
        } catch  {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid JSON body'
            }, {
                status: 400
            });
        }
        const { productType, productId, productName, amount, idempotencyKey, meta } = body;
        // ---- Validate ----
        // Razorpay minimum is ₹1 (100 paise). We validate here so we return a
        // clear error instead of forwarding Razorpay's "missing/invalid field".
        const missing = [];
        if (!productType) missing.push('productType');
        if (!productId) missing.push('productId');
        if (!productName) missing.push('productName');
        if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
            missing.push('amount (must be > 0, Razorpay minimum is ₹1)');
        }
        if (!idempotencyKey) missing.push('idempotencyKey');
        if (missing.length > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Missing or invalid fields: ${missing.join(', ')}`,
                missing
            }, {
                status: 400
            });
        }
        const validTypes = [
            'TEST_PURCHASE',
            'SUBJECT_PACK',
            'EXAM_PACK',
            'PREMIUM_SUBSCRIPTION'
        ];
        if (!validTypes.includes(productType)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Invalid productType. Must be one of: ${validTypes.join(', ')}`
            }, {
                status: 400
            });
        }
        const amountPaise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$razorpay$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rupeesToPaise"])(amount);
        // ---- Idempotency check ----
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].order.findUnique({
            where: {
                idempotencyKey
            }
        });
        if (existing) {
            // Ownership check: the order must belong to this user
            if (existing.userId !== prismaUserId) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Order ownership mismatch'
                }, {
                    status: 403
                });
            }
            if (existing.status === 'PAID') {
                // Already paid — return the existing order
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    orderId: existing.id,
                    orderRef: existing.orderRef,
                    razorpayOrderId: existing.razorpayOrderId,
                    amount: existing.amount,
                    currency: existing.currency,
                    productType: existing.productType,
                    productId: existing.productId,
                    productName: existing.productName,
                    keyId: process.env.RAZORPAY_KEY_ID,
                    reused: true,
                    status: 'PAID'
                });
            }
            if (existing.status === 'CREATED' || existing.status === 'ATTEMPTED') {
                // Let the user retry the same Razorpay order
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    orderId: existing.id,
                    orderRef: existing.orderRef,
                    razorpayOrderId: existing.razorpayOrderId,
                    amount: existing.amount,
                    currency: existing.currency,
                    productType: existing.productType,
                    productId: existing.productId,
                    productName: existing.productName,
                    keyId: process.env.RAZORPAY_KEY_ID,
                    reused: true,
                    status: existing.status
                });
            }
            // FAILED or EXPIRED — recreate the Razorpay order on the existing row
            const orderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$payments$2f$_lib$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOrderRef"])();
            const rzpOrder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$razorpay$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRazorpayOrder"])({
                amount: amountPaise,
                receipt: orderRef,
                notes: {
                    userId: prismaUserId,
                    productType,
                    productId,
                    idempotencyKey
                }
            });
            const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].order.update({
                where: {
                    id: existing.id
                },
                data: {
                    orderRef,
                    razorpayOrderId: rzpOrder.id,
                    amount: amountPaise,
                    status: 'CREATED',
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
                }
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].paymentLog.create({
                data: {
                    orderId: updated.id,
                    userId: prismaUserId,
                    event: 'ORDER_CREATED',
                    level: 'INFO',
                    message: `Order recreated after ${existing.status}: ${orderRef}`,
                    payload: JSON.stringify({
                        productType,
                        productId,
                        amount: amountPaise,
                        razorpayOrderId: rzpOrder.id,
                        previousStatus: existing.status
                    }),
                    ...clientMeta
                }
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                orderId: updated.id,
                orderRef: updated.orderRef,
                razorpayOrderId: updated.razorpayOrderId,
                amount: updated.amount,
                currency: updated.currency,
                productType: updated.productType,
                productId: updated.productId,
                productName: updated.productName,
                keyId: process.env.RAZORPAY_KEY_ID,
                reused: false,
                status: updated.status
            });
        }
        // ---- Fresh order ----
        const orderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$payments$2f$_lib$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateOrderRef"])();
        const rzpOrder = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$razorpay$2d$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createRazorpayOrder"])({
            amount: amountPaise,
            receipt: orderRef,
            notes: {
                userId: prismaUserId,
                productType,
                productId,
                idempotencyKey
            }
        });
        const order = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].order.create({
            data: {
                orderRef,
                userId: prismaUserId,
                productType: productType,
                productId,
                productName,
                amount: amountPaise,
                currency: 'INR',
                idempotencyKey,
                razorpayOrderId: rzpOrder.id,
                status: 'CREATED',
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            }
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].paymentLog.create({
            data: {
                orderId: order.id,
                userId: prismaUserId,
                event: 'ORDER_CREATED',
                level: 'INFO',
                message: `Order created: ${orderRef}`,
                payload: JSON.stringify({
                    productType,
                    productId,
                    productName,
                    amount: amountPaise,
                    razorpayOrderId: rzpOrder.id,
                    meta: meta ?? null
                }),
                ...clientMeta
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            orderId: order.id,
            orderRef: order.orderRef,
            razorpayOrderId: order.razorpayOrderId,
            amount: order.amount,
            currency: order.currency,
            productType: order.productType,
            productId: order.productId,
            productName: order.productName,
            keyId: process.env.RAZORPAY_KEY_ID,
            reused: false,
            status: order.status
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        // Best-effort log
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].paymentLog.create({
                data: {
                    event: 'ORDER_CREATE_FAILED',
                    level: 'ERROR',
                    message: `Failed to create order: ${message}`,
                    payload: JSON.stringify({
                        error: message
                    }),
                    ...clientMeta
                }
            });
        } catch  {
        // swallow logging failure
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create order'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4ae71c19._.js.map