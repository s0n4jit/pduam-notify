/**
 * GET /api/verify-email?token=xxx
 * Verifies a subscriber's email using the token sent via email.
 */

import { NextResponse } from 'next/server';
import { findVerificationToken, deleteVerificationToken, verifySubscriber } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(errorHtml('Missing verification token.'), {
        status: 400, headers: { 'Content-Type': 'text/html' },
      });
    }

    // Look up the token
    const record = await findVerificationToken(token);
    if (!record) {
      return new Response(errorHtml('Invalid or expired verification link.'), {
        status: 404, headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check expiry
    if (new Date(record.expires_at) < new Date()) {
      await deleteVerificationToken(token);
      return new Response(errorHtml('This verification link has expired. Please subscribe again.'), {
        status: 410, headers: { 'Content-Type': 'text/html' },
      });
    }

    // Mark subscriber as verified
    const verified = await verifySubscriber(record.email);
    if (!verified) {
      return new Response(errorHtml('Could not verify email. Subscriber not found.'), {
        status: 404, headers: { 'Content-Type': 'text/html' },
      });
    }

    // Clean up token
    await deleteVerificationToken(token);

    // Return success HTML page
    return new Response(successHtml(record.email), {
      status: 200, headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('[verify-email] Error:', err);
    return new Response(errorHtml('Something went wrong. Please try again.'), {
      status: 500, headers: { 'Content-Type': 'text/html' },
    });
  }
}

function successHtml(email) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Email Verified — PDUAM NOTIFY</title>
<style>*{margin:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f1f5f9;padding:1rem}
.card{background:#fff;border-radius:1rem;padding:2.5rem;max-width:400px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
.icon{font-size:3rem;margin-bottom:1rem}.title{font-size:1.5rem;font-weight:700;color:#059669;margin-bottom:0.5rem}
.text{font-size:0.875rem;color:#64748b;margin-bottom:1.5rem;line-height:1.6}
.btn{display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:600;font-size:0.875rem}
</style></head><body><div class="card"><div class="icon">✅</div>
<h1 class="title">Email Verified!</h1>
<p class="text">Your email <strong>${email}</strong> has been verified. You'll now receive alerts when new notices are posted.</p>
<a href="${siteUrl}" class="btn">← Back to PDUAM NOTIFY</a></div></body></html>`;
}

function errorHtml(message) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verification Failed — PDUAM NOTIFY</title>
<style>*{margin:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f1f5f9;padding:1rem}
.card{background:#fff;border-radius:1rem;padding:2.5rem;max-width:400px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
.icon{font-size:3rem;margin-bottom:1rem}.title{font-size:1.5rem;font-weight:700;color:#dc2626;margin-bottom:0.5rem}
.text{font-size:0.875rem;color:#64748b;margin-bottom:1.5rem;line-height:1.6}
.btn{display:inline-block;background:#f1f5f9;color:#475569;text-decoration:none;padding:0.75rem 1.5rem;border-radius:0.5rem;font-weight:600;font-size:0.875rem;border:1px solid #e2e8f0}
</style></head><body><div class="card"><div class="icon">❌</div>
<h1 class="title">Verification Failed</h1>
<p class="text">${message}</p>
<a href="${siteUrl}" class="btn">← Back to PDUAM NOTIFY</a></div></body></html>`;
}
