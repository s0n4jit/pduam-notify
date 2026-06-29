/**
 * POST /api/resend-verification
 * Resends a verification email for an unverified subscriber.
 *
 * Body: { email: string }
 * - Checks the subscriber exists and is unverified
 * - Deletes old token, generates a fresh one (1 hour expiry)
 * - Sends a new verification email
 * - Rate-limited per IP (3 resends per 15 min)
 */

import { NextResponse } from 'next/server';
import { getAllSubscribers, addVerificationToken, deleteVerificationToken, findVerificationToken } from '@/lib/sheets';
import { sendVerificationEmail } from '@/lib/email';
import { generateToken, hashIP, isValidEmail } from '@/lib/crypto';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // Rate limit by IP — stricter than subscribe (3 per 15 min)
    const ip    = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipKey = hashIP(ip);

    const rateCheck = checkRateLimit(`resend:${ipKey}`, { maxRequests: 3, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many resend attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }

    const body  = await req.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Find the subscriber and ensure they're unverified
    const all = await getAllSubscribers();
    const subscriber = all.find((s) => s.email === email);

    if (!subscriber) {
      // Return generic message to avoid email enumeration
      return NextResponse.json({ status: 'sent' });
    }

    if (subscriber.verified === 'true') {
      return NextResponse.json({ error: 'This email is already verified.' }, { status: 409 });
    }

    // Delete any existing token for this email
    const existing = await findVerificationToken(email); // not by token — sheets.js finds by email
    // deleteVerificationToken operates by token value; we look up via readSheet instead
    // The addVerificationToken helper already calls deleteRowByValue(email) first
    // so just calling addVerificationToken is safe.

    // Generate new token (5 minutes)
    const token     = generateToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await addVerificationToken({ email, token, expiresAt });

    const result = await sendVerificationEmail(email, token);
    if (!result.success) {
      console.error('[resend-verification] Email failed:', result.error);
      return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ status: 'sent' });
  } catch (err) {
    console.error('[resend-verification] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
