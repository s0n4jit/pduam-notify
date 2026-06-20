/**
 * POST /api/subscribe
 * Subscribes a new email — sends verification email, stores in Google Sheets.
 * 
 * Security: rate limiting, honeypot check, input validation, IP hashing
 */

import { NextResponse } from 'next/server';
import { subscriberExists, addSubscriber, addVerificationToken } from '@/lib/sheets';
import { sendVerificationEmail } from '@/lib/email';
import { generateToken, hashIP, hashUserAgent, isValidEmail } from '@/lib/crypto';
import { checkRateLimit, checkCooldown } from '@/lib/rate-limit';

export async function POST(req) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipKey = hashIP(ip);

    const rateCheck = checkRateLimit(ipKey, { maxRequests: 5, windowMs: 15 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.', retryAfter: rateCheck.retryAfter },
        { status: 429 }
      );
    }

    // Cooldown check
    const cooldownCheck = checkCooldown(ipKey);
    if (!cooldownCheck.allowed) {
      return NextResponse.json(
        { error: `Please wait ${cooldownCheck.retryAfter}s before trying again.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();

    // Input validation
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Check for existing subscriber
    const exists = await subscriberExists(email);
    if (exists) {
      return NextResponse.json({ status: 'already_subscribed' });
    }

    // Generate verification token (expires in 1 hour)
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store subscriber as unverified
    const ua = req.headers.get('user-agent') || '';
    await addSubscriber({
      email,
      ipHash: ipKey,
      userAgentHash: hashUserAgent(ua),
    });

    // Store verification token
    await addVerificationToken({ email, token, expiresAt });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, token);
    if (!emailResult.success) {
      console.error('[subscribe] Failed to send verification email:', emailResult.error);
      return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ status: 'verification_sent' }, { status: 201 });
  } catch (err) {
    console.error('[subscribe] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
