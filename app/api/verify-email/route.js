/**
 * GET /api/verify-email?token=xxx
 * Renders the subscription confirmation page to prevent spam filter auto-verification (GET requests).
 * 
 * POST /api/verify-email
 * Performs the actual subscriber email verification and D1/KV database update.
 */

import { NextResponse } from 'next/server';
import { findVerificationToken, deleteVerificationToken, verifySubscriber } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

// 1. GET: Renders confirmation UI
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response(invalidRedirectHtml('Missing verification token.'), {
        status: 400, headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check if token format is invalid (must be 64 characters of hex)
    const isValidTokenFormat = /^[0-9a-f]{64}$/i.test(token);
    if (!isValidTokenFormat) {
      return new Response(invalidRedirectHtml('This verification link is invalid.'), {
        status: 400, headers: { 'Content-Type': 'text/html' },
      });
    }

    const record = await findVerificationToken(token);
    if (!record) {
      return new Response(errorHtml('This verification link has expired (links are valid for 5 minutes).', { showResend: true }), {
        status: 404, headers: { 'Content-Type': 'text/html' },
      });
    }

    // Render the confirmation page requiring a user interaction (button click)
    return new Response(confirmHtml(record.email, token), {
      status: 200, headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    console.error('[verify-email] GET Error:', err);
    return new Response(errorHtml('Something went wrong. Please try again.'), {
      status: 500, headers: { 'Content-Type': 'text/html' },
    });
  }
}

// 2. POST: Performs the actual DB verification
export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
    }

    // Check if token format is invalid
    const isValidTokenFormat = /^[0-9a-f]{64}$/i.test(token);
    if (!isValidTokenFormat) {
      return NextResponse.json({ error: 'Invalid verification link format.' }, { status: 400 });
    }

    const record = await findVerificationToken(token);
    if (!record) {
      return NextResponse.json({ error: 'This verification link has expired (links are valid for 5 minutes).' }, { status: 404 });
    }

    const verified = await verifySubscriber(record.email);
    if (!verified) {
      return NextResponse.json({ error: 'Could not verify email. Subscriber not found.' }, { status: 404 });
    }

    // Delete the token since verification is complete
    await deleteVerificationToken(token);

    return NextResponse.json({ success: true, email: record.email }, { status: 200 });
  } catch (err) {
    console.error('[verify-email] POST Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── Shared page shell ────────────────────────────────────────────────────────

function pageShell({ title, bodyContent, siteUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <link rel="icon" href="${siteUrl}/icon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      /* Dark gradient background */
      background: #070b14;
      background-image:
        radial-gradient(ellipse at 20% 20%, rgba(37,99,235,0.18) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 70%, rgba(16,185,129,0.12) 0%, transparent 50%);
      -webkit-font-smoothing: antialiased;
    }

    .card {
      max-width: 420px;
      width: 100%;
      text-align: center;
      padding: 2.5rem 2rem;
      border-radius: 1.5rem;
      /* Glassmorphism */
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
      animation: rise 0.45s cubic-bezier(0,0,0.21,1) both;
    }

    @keyframes rise {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Brand pill at top */
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 999px;
      padding: 5px 14px 5px 10px;
      font-size: 12px;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1.75rem;
      text-decoration: none;
    }
    .brand span { font-size: 15px; }

    /* Icon ring */
    .icon-ring {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      font-size: 2rem;
    }
    .icon-ring.success {
      background: rgba(16,185,129,0.12);
      border: 1.5px solid rgba(16,185,129,0.3);
      box-shadow: 0 0 32px rgba(16,185,129,0.15);
    }
    .icon-ring.error {
      background: rgba(239,68,68,0.12);
      border: 1.5px solid rgba(239,68,68,0.3);
      box-shadow: 0 0 32px rgba(239,68,68,0.15);
    }

    .title-success { font-size: 1.5rem; font-weight: 800; color: #10b981; margin-bottom: 0.6rem; }
    .title-error   { font-size: 1.5rem; font-weight: 800; color: #f87171; margin-bottom: 0.6rem; }

    .email-badge {
      display: inline-block;
      background: rgba(37,99,235,0.12);
      border: 1px solid rgba(37,99,235,0.25);
      border-radius: 8px;
      padding: 2px 10px;
      font-size: 13px;
      font-weight: 600;
      color: #93c5fd;
      margin: 0.25rem 0 0.75rem;
    }

    .text {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      line-height: 1.65;
      margin-bottom: 1.5rem;
    }

    /* Countdown ring */
    .countdown-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-bottom: 1.5rem;
    }
    .countdown-ring {
      position: relative;
      width: 56px;
      height: 56px;
    }
    .countdown-ring svg {
      transform: rotate(-90deg);
    }
    .countdown-ring .track {
      fill: none;
      stroke: rgba(255,255,255,0.06);
      stroke-width: 4;
    }
    .countdown-ring .fill {
      fill: none;
      stroke: #10b981;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-dasharray: 138.2; /* 2π × 22 */
      stroke-dashoffset: 0;
      transition: stroke-dashoffset 1s linear;
    }
    .countdown-ring .num {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      color: #10b981;
    }
    .countdown-label {
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      letter-spacing: 0.05em;
    }

    /* Buttons */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      text-decoration: none;
      padding: 0.75rem 1.75rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 14px;
      width: 100%;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(37,99,235,0.3);
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-primary:active { transform: scale(0.97); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      padding: 0.75rem 1.75rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 14px;
      width: 100%;
      border: 1px solid rgba(255,255,255,0.08);
      transition: opacity 0.15s;
    }
    .btn-ghost:hover { opacity: 0.8; }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

// ─── Confirmation page ─────────────────────────────────────────────────────────

function confirmHtml(email, token) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';
  const body = `
  <div class="card" id="card-content">
    <a href="${siteUrl}" class="brand">
      <span>🔔</span> PDUAM NOTIFY
    </a>

    <div class="icon-ring success" style="background:rgba(37,99,235,0.12);border:1.5px solid rgba(37,99,235,0.3);box-shadow:0 0 32px rgba(37,99,235,0.15)">📧</div>

    <h1 class="title-success" style="color:#60a5fa;margin-bottom:0.8rem">Confirm Subscription</h1>
    <div class="email-badge">${email}</div>
    <p class="text">
      Please confirm that you want to subscribe to instant notice alerts from PDUAM Amjonga.
    </p>

    <button class="btn-primary" id="verify-btn">
      ✓ Confirm Subscription
    </button>
  </div>

  <script>
    document.getElementById('verify-btn').addEventListener('click', async function() {
      const btn = document.getElementById('verify-btn');
      btn.disabled = true;
      btn.textContent = 'Verifying...';

      try {
        const res = await fetch('/api/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: '${token}' }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          document.getElementById('card-content').innerHTML = successBody(data.email, '${siteUrl}');
          startCountdown('${siteUrl}');
        } else {
          document.getElementById('card-content').innerHTML = \`
            <div class="icon-ring error">❌</div>
            <h1 class="title-error">Verification Failed</h1>
            <p class="text">\${data.error || 'Something went wrong. Please try again.'}</p>
            <a href="${siteUrl}" class="btn-ghost" style="margin-top:1rem;">← Back to home</a>
          \`;
        }
      } catch (err) {
        document.getElementById('card-content').innerHTML = \`
          <div class="icon-ring error">❌</div>
          <h1 class="title-error">Verification Failed</h1>
          <p class="text">Network error. Please check your connection and try again.</p>
          <a href="${siteUrl}" class="btn-ghost" style="margin-top:1rem;">← Back to home</a>
        \`;
      }
    });

    function successBody(email, siteUrl) {
      return \`
        <div class="icon-ring success">✅</div>
        <h1 class="title-success">Email Verified!</h1>
        <div class="email-badge">\${email}</div>
        <p class="text">
          Your email has been confirmed. You'll now receive instant alerts
          whenever a new notice is posted on the college notice board.
        </p>
        <div class="countdown-wrap">
          <div class="countdown-ring">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle class="track" cx="28" cy="28" r="22"/>
              <circle class="fill" id="ring-fill" cx="28" cy="28" r="22"/>
            </svg>
            <div class="num" id="countdown-num">10</div>
          </div>
          <span class="countdown-label">Redirecting to home…</span>
        </div>
        <a href="\${siteUrl}" class="btn-primary" id="home-btn">
          ← Back to PDUAM NOTIFY
        </a>
      \`;
    }

    function startCountdown(siteUrl) {
      var total = 10;
      var left = total;
      var circumference = 2 * Math.PI * 22;
      var fill = document.getElementById('ring-fill');
      var numEl = document.getElementById('countdown-num');

      if (fill) fill.style.strokeDashoffset = '0';

      var timer = setInterval(function() {
        left--;
        if (left <= 0) {
          clearInterval(timer);
          window.location.href = siteUrl;
          return;
        }
        if (numEl) numEl.textContent = left;
        if (fill) {
          var offset = circumference * (1 - left / total);
          fill.style.strokeDashoffset = offset;
        }
      }, 1000);
    }
  </script>`;

  return pageShell({ title: 'Confirm Subscription — PDUAM NOTIFY', bodyContent: body, siteUrl });
}

// ─── Error page ───────────────────────────────────────────────────────────────

function errorHtml(message, { showResend = false } = {}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';

  const resendSection = showResend ? `
    <div style="margin-top:1.5rem;">
      <p style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:0.75rem;">
        Enter your email to get a new verification link:
      </p>
      <form id="resend-form" style="display:flex;flex-direction:column;gap:10px;">
        <input
          id="resend-email"
          type="email"
          placeholder="your@email.com"
          required
          autocomplete="email"
          style="
            background:rgba(255,255,255,0.06);
            border:1px solid rgba(255,255,255,0.12);
            border-radius:0.625rem;
            padding:0.625rem 1rem;
            font-size:14px;
            color:#f1f5f9;
            outline:none;
            font-family:inherit;
            width:100%;
          "
        />
        <button
          type="submit"
          id="resend-btn"
          style="
            background:linear-gradient(135deg,#2563eb,#1d4ed8);
            color:#fff;
            border:none;
            border-radius:0.75rem;
            padding:0.75rem 1.5rem;
            font-weight:700;
            font-size:14px;
            cursor:pointer;
            width:100%;
            font-family:inherit;
          "
        >
          Resend Verification Email
        </button>
        <div id="resend-msg" style="font-size:12px;text-align:center;min-height:18px;"></div>
      </form>

      <script>
        document.getElementById('resend-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          var btn = document.getElementById('resend-btn');
          var msg = document.getElementById('resend-msg');
          var email = document.getElementById('resend-email').value.trim();

          btn.disabled = true;
          btn.textContent = 'Sending…';
          msg.style.color = 'rgba(255,255,255,0.4)';
          msg.textContent = '';

          try {
            var res = await fetch('/api/resend-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email }),
            });
            var data = await res.json();

            if (res.ok) {
              msg.style.color = '#10b981';
              msg.textContent = '✓ Verification email sent! Check your inbox.';
              btn.textContent = 'Sent!';
            } else {
              msg.style.color = '#f87171';
              msg.textContent = data.error || 'Something went wrong. Please try again.';
              btn.disabled = false;
              btn.textContent = 'Resend Verification Email';
            }
          } catch {
            msg.style.color = '#f87171';
            msg.textContent = 'Network error. Please try again.';
            btn.disabled = false;
            btn.textContent = 'Resend Verification Email';
          }
        });
      </script>
    </div>
  ` : `
    <a href="${siteUrl}" class="btn-ghost" style="margin-top:1rem;">← Back to PDUAM NOTIFY</a>
  `;

  const body = `
  <div class="card">
    <a href="${siteUrl}" class="brand">
      <span>🔔</span> PDUAM NOTIFY
    </a>

    <div class="icon-ring error">❌</div>

    <h1 class="title-error">Verification Failed</h1>
    <p class="text">${message}</p>

    ${resendSection}

    ${showResend ? `<a href="${siteUrl}" class="btn-ghost" style="margin-top:0.75rem;display:block;text-align:center;font-size:13px;color:rgba(255,255,255,0.3);text-decoration:none;">← Back to home</a>` : ''}
  </div>`;

  return pageShell({ title: 'Verification Failed — PDUAM NOTIFY', bodyContent: body, siteUrl });
}

// ─── Invalid Redirect helper for safety auto-redirects ─────────────────────────

function invalidRedirectHtml(message) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';
  const body = `
  <div class="card">
    <a href="${siteUrl}" class="brand">
      <span>🔔</span> PDUAM NOTIFY
    </a>

    <div class="icon-ring error">❌</div>

    <h1 class="title-error">Invalid Link</h1>
    <p class="text">${message}</p>
    
    <div class="countdown-wrap">
      <div class="countdown-ring">
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle class="track" cx="28" cy="28" r="22"/>
          <circle class="fill" id="ring-fill" cx="28" cy="28" r="22"/>
        </svg>
        <div class="num" id="countdown-num">3</div>
      </div>
      <span class="countdown-label">Redirecting to home…</span>
    </div>
  </div>
  <script>
    var left = 3;
    var circumference = 2 * Math.PI * 22;
    var fill = document.getElementById('ring-fill');
    var numEl = document.getElementById('countdown-num');
    if (fill) fill.style.strokeDashoffset = '0';
    var timer = setInterval(function() {
      left--;
      if (left <= 0) {
        clearInterval(timer);
        window.location.href = "${siteUrl}";
        return;
      }
      if (numEl) numEl.textContent = left;
      if (fill) {
        fill.style.strokeDashoffset = circumference * (1 - left / 3);
      }
    }, 1000);
  </script>`;

  return pageShell({ title: 'Invalid Link — PDUAM NOTIFY', bodyContent: body, siteUrl });
}
