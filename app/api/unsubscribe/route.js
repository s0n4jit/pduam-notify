/**
 * POST /api/unsubscribe — via form submission
 * GET  /api/unsubscribe?token=xxx — via email link (one-click)
 * 
 * Removes subscriber and sends confirmation email.
 */

import { NextResponse } from 'next/server';
import { removeSubscriber, subscriberExists, findUnsubscribeToken, deleteUnsubscribeToken } from '@/lib/sheets';
import { sendUnsubscribeConfirmation } from '@/lib/email';
import { checkRateLimit, checkCooldown } from '@/lib/rate-limit';
import { hashIP, isValidEmail } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

// One-click unsubscribe via email link
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
    }

    const record = await findUnsubscribeToken(token);
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired unsubscribe link.' }, { status: 404 });
    }

    // Check expiry (7 days)
    if (new Date(record.expires_at) < new Date()) {
      await deleteUnsubscribeToken(token);
      return NextResponse.json({ error: 'This unsubscribe link has expired.' }, { status: 410 });
    }

    await removeSubscriber(record.email);
    await deleteUnsubscribeToken(token);

    // Send confirmation (best-effort)
    try {
      await sendUnsubscribeConfirmation(record.email);
    } catch {}

    // Redirect to success page
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';
    return NextResponse.redirect(`${siteUrl}/unsubscribe?success=true`);
  } catch (err) {
    console.error('[unsubscribe] GET error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Form-based unsubscribe
export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipKey = hashIP(ip);

    const rateCheck = checkRateLimit(ipKey, { maxRequests: 5, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
    }

    const exists = await subscriberExists(email);
    if (!exists) {
      return NextResponse.json({ status: 'not_found' }, { status: 404 });
    }

    await removeSubscriber(email);

    try {
      await sendUnsubscribeConfirmation(email);
    } catch {}

    return NextResponse.json({ status: 'unsubscribed' });
  } catch (err) {
    console.error('[unsubscribe] POST error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
