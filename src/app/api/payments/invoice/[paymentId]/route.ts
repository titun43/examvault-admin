// =============================================================================
// GET /api/payments/invoice/[paymentId]
// =============================================================================
// Returns an HTML invoice for the given Prisma Payment id, rendered with
// inline CSS for printing. Only the owning user (or an admin) may view it.
// The Flutter app opens this URL in a webview / browser.
// =============================================================================

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser, upsertUser, requireAdmin } from '@/lib/payment-auth';
import { getClientMeta, formatINR, formatDate } from '../../_lib';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ paymentId: string }> },
) {
  const clientMeta = getClientMeta(req);
  const { paymentId } = await ctx.params;

  try {
    // ---- Load payment (with order + user) ----
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, user: true },
    });
    if (!payment) {
      return new NextResponse(htmlNotFound(paymentId), {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    // ---- Authorization: user (owner) OR admin ----
    let authorized = false;
    let viewerLabel = 'User';

    // Admin path
    const adminAuth = requireAdmin(req);
    if (adminAuth.ok) {
      authorized = true;
      viewerLabel = 'Admin';
    } else {
      // User path
      const userAuth = await requireUser(req);
      if (userAuth.ok) {
        const prismaUserId = await upsertUser(userAuth.user);
        if (payment.userId === prismaUserId) {
          authorized = true;
          viewerLabel = 'User';
        }
      }
    }

    if (!authorized) {
      return new NextResponse(htmlForbidden(), {
        status: 403,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    // ---- Build invoice ----
    const invoiceNumber = `INV-${payment.id.slice(-8).toUpperCase()}`;
    const dateStr = formatDate(payment.capturedAt ?? payment.createdAt);
    const amountStr = formatINR(payment.amount);
    const statusStr = payment.status;
    const methodStr = payment.method ?? '—';
    const txIdStr = payment.razorpayPaymentId ?? '—';
    const orderRefStr = payment.order?.orderRef ?? '—';
    const productName = payment.order?.productName ?? '—';
    const productType = payment.order?.productType ?? '—';
    const userEmail = payment.user?.email ?? '—';
    const userPhone = payment.user?.phone ?? '—';
    const userName = payment.user?.displayName ?? '—';

    const html = renderInvoice({
      invoiceNumber,
      dateStr,
      amountStr,
      statusStr,
      methodStr,
      txIdStr,
      orderRefStr,
      productName,
      productType,
      userEmail,
      userPhone,
      userName,
      viewerLabel,
    });

    // ---- Audit log ----
    try {
      await db.paymentLog.create({
        data: {
          paymentId: payment.id,
          orderId: payment.orderId,
          userId: payment.userId,
          event: 'INVOICE_DOWNLOADED',
          level: 'AUDIT',
          message: `Invoice ${invoiceNumber} viewed by ${viewerLabel}`,
          payload: JSON.stringify({
            invoiceNumber,
            viewerLabel,
          }),
          ...clientMeta,
        },
      });
    } catch {
      // swallow
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    try {
      await db.paymentLog.create({
        data: {
          event: 'INVOICE_ERROR',
          level: 'ERROR',
          message: `Invoice endpoint error: ${message}`,
          payload: JSON.stringify({ error: message, paymentId }),
          ...clientMeta,
        },
      });
    } catch {
      // swallow
    }
    return new NextResponse(htmlError(message), {
      status: 500,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
}

// ----------------------------------------------------------------------------
// HTML templates (inline CSS — printable)
// ----------------------------------------------------------------------------

interface InvoiceData {
  invoiceNumber: string;
  dateStr: string;
  amountStr: string;
  statusStr: string;
  methodStr: string;
  txIdStr: string;
  orderRefStr: string;
  productName: string;
  productType: string;
  userEmail: string;
  userPhone: string;
  userName: string;
  viewerLabel: string;
}

function renderInvoice(d: InvoiceData): string {
  const statusColor =
    d.statusStr === 'CAPTURED' || d.statusStr === 'AUTHORIZED'
      ? '#16a34a'
      : d.statusStr === 'FAILED'
        ? '#dc2626'
        : d.statusStr === 'REFUNDED'
          ? '#d97706'
          : '#475569';
  const prettyProductType = d.productType
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ExamVault Invoice ${escapeHtml(d.invoiceNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #1e293b;
      background: #f8fafc;
    }
    .invoice {
      max-width: 720px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%);
      color: #ffffff;
      padding: 28px 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .logo-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #ffffff;
      color: #0f766e;
      border-radius: 8px;
      font-weight: 800;
      font-size: 18px;
    }
    .invoice-meta {
      text-align: right;
      font-size: 13px;
      opacity: 0.92;
    }
    .invoice-meta .num {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .body { padding: 28px 36px; }
    .row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .row:last-child { border-bottom: none; }
    .row .label { color: #64748b; min-width: 140px; }
    .row .value { color: #0f172a; font-weight: 500; text-align: right; word-break: break-word; }
    .section-title {
      font-size: 11px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #94a3b8;
      margin: 20px 0 4px;
      font-weight: 600;
    }
    .total {
      margin-top: 18px;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 10px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: 700;
      color: #0f766e;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
      background: ${statusColor};
      letter-spacing: 0.4px;
    }
    .footer {
      padding: 16px 36px 28px;
      font-size: 12px;
      color: #94a3b8;
      text-align: center;
      border-top: 1px solid #f1f5f9;
    }
    .print-btn {
      display: block;
      margin: 0 auto 20px;
      padding: 10px 22px;
      background: #0f766e;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .print-btn:hover { background: #115e59; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .print-btn { display: none; }
      .invoice { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  <div class="invoice">
    <div class="header">
      <div class="logo">
        <span class="logo-mark">EV</span>
        ExamVault
      </div>
      <div class="invoice-meta">
        <div class="num">${escapeHtml(d.invoiceNumber)}</div>
        <div>${escapeHtml(d.dateStr)}</div>
      </div>
    </div>

    <div class="body">
      <div class="section-title">Billed To</div>
      <div class="row"><span class="label">Name</span><span class="value">${escapeHtml(d.userName)}</span></div>
      <div class="row"><span class="label">Email</span><span class="value">${escapeHtml(d.userEmail)}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${escapeHtml(d.userPhone)}</span></div>

      <div class="section-title">Purchase Details</div>
      <div class="row"><span class="label">Product</span><span class="value">${escapeHtml(d.productName)}</span></div>
      <div class="row"><span class="label">Type</span><span class="value">${escapeHtml(prettyProductType)}</span></div>
      <div class="row"><span class="label">Order Reference</span><span class="value">${escapeHtml(d.orderRefStr)}</span></div>
      <div class="row"><span class="label">Payment Method</span><span class="value">${escapeHtml(d.methodStr)}</span></div>
      <div class="row"><span class="label">Transaction ID</span><span class="value">${escapeHtml(d.txIdStr)}</span></div>
      <div class="row"><span class="label">Status</span><span class="value"><span class="badge">${escapeHtml(d.statusStr)}</span></span></div>

      <div class="total">
        <span>Total Paid</span>
        <span>${escapeHtml(d.amountStr)}</span>
      </div>
    </div>

    <div class="footer">
      This is a computer-generated invoice from ExamVault and does not require a signature.<br/>
      Viewed by: ${escapeHtml(d.viewerLabel)} · Generated ${escapeHtml(d.dateStr)}<br/>
      For support, contact support@examvault.app
    </div>
  </div>
</body>
</html>`;
}

function htmlNotFound(paymentId: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Invoice not found</title>
<style>body{font-family:system-ui,sans-serif;text-align:center;padding:60px;color:#475569;background:#f8fafc}
h1{color:#dc2626;font-size:20px}p{margin:8px 0}</style></head>
<body><h1>Invoice not found</h1><p>No payment record exists for id <code>${escapeHtml(paymentId)}</code>.</p>
<p><a href="javascript:history.back()">Go back</a></p></body></html>`;
}

function htmlForbidden(): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Access denied</title>
<style>body{font-family:system-ui,sans-serif;text-align:center;padding:60px;color:#475569;background:#f8fafc}
h1{color:#dc2626;font-size:20px}</style></head>
<body><h1>Access denied</h1><p>You are not authorized to view this invoice.</p></body></html>`;
}

function htmlError(message: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Server error</title>
<style>body{font-family:system-ui,sans-serif;text-align:center;padding:60px;color:#475569;background:#f8fafc}
h1{color:#dc2626;font-size:20px}</style></head>
<body><h1>Something went wrong</h1><p>We could not generate the invoice right now.</p>
<!-- ${escapeHtml(message)} --></body></html>`;
}

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
