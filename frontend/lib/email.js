/**
 * Email Service — Gmail SMTP via Nodemailer
 * Templates: verification, notice alerts, unsubscribe confirmation
 *
 * Sender: "PDUAM NOTIFY" <from-address>
 */

const nodemailer = require('nodemailer');

const COLLEGE_NAME  = 'Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga';
const SENDER_NAME   = 'PDUAM NOTIFY';
const NOTICE_URL    = 'https://pduamamjonga.ac.in/notice';
const SITE_URL      = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';

// ─── Transporter ─────────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

// ─── Shared Shell ─────────────────────────────────────────────────────────────
// Dark-mode-aware, table-based HTML email (Gmail/Outlook compatible)

function emailShell(preheader, body) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <title>${SENDER_NAME}</title>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse !important; }
    body { margin:0; padding:0; width:100% !important; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    a { color:inherit; }

    /* ── Dark mode overrides ── */
    @media (prefers-color-scheme: dark) {
      .email-bg   { background-color:#070b14 !important; }
      .email-card { background-color:#0f1629 !important; border-color:#1e3a5f !important; }
      .email-header-bg { background:linear-gradient(135deg,#0a1628,#1a2d5a) !important; }
      .email-body { background-color:#0f1629 !important; }
      .email-footer-bg { background-color:#0a111e !important; }
      .text-dark  { color:#f1f5f9 !important; }
      .text-muted { color:#94a3b8 !important; }
      .text-subtle { color:#64748b !important; }
      .divider    { border-color:#1e2d45 !important; }
      .badge-bg   { background-color:#1e3a5f !important; }
      .notice-row { background-color:#0a1628 !important; border-color:#1e2d45 !important; }
      .btn-primary { background:linear-gradient(135deg,#2563eb,#1d4ed8) !important; }
      .btn-secondary { background-color:#1e3a5f !important; color:#93c5fd !important; }
    }

    @media only screen and (max-width: 600px) {
      .email-card { width:100% !important; border-radius:0 !important; }
      .email-pad  { padding:20px !important; }
      .email-pad-sm { padding:16px !important; }
      .notice-title { font-size:13px !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (invisible preview text) -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;" class="email-bg">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
          class="email-card"
          style="background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;max-width:600px;width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td class="email-header-bg" style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:28px 40px;" class="email-pad">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td width="36" valign="middle" style="padding-right:12px;">
                    <img src="https://notify-pduam.vercel.app/icon.svg" width="32" height="32" alt="🔔" style="display:block;">
                  </td>
                  <td valign="middle">
                    <p style="margin:0;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.05em;">${SENDER_NAME}</p>
                    <p style="margin:2px 0 0;font-size:11px;color:#93c5fd;font-weight:500;">${COLLEGE_NAME}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td class="email-body email-pad" style="background-color:#ffffff;padding:32px 40px;">
              ${body}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td class="email-footer-bg email-pad-sm"
              style="background-color:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;" class="divider">
              <p style="margin:0;font-size:11px;line-height:1.7;text-align:center;" class="text-subtle">
                <span style="color:#94a3b8;">You're receiving this because you subscribed at </span>
                <a href="${SITE_URL()}" style="color:#2563eb;text-decoration:none;">${SITE_URL().replace('https://', '')}</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;text-align:center;">
                <a href="${SITE_URL()}/unsubscribe" style="color:#64748b;text-decoration:underline;">Unsubscribe</a>
                <span style="color:#cbd5e1;padding:0 8px;">·</span>
                <a href="${SITE_URL()}/privacy-policy" style="color:#64748b;text-decoration:underline;">Privacy Policy</a>
                <span style="color:#cbd5e1;padding:0 8px;">·</span>
                <a href="${NOTICE_URL}" style="color:#64748b;text-decoration:underline;">Notice Board</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Copyright -->
        <p style="margin:16px 0 0;font-size:10px;color:#94a3b8;text-align:center;">
          © ${new Date().getFullYear()} PDUAM Amjonga, Goalpara, Assam. An independent, open-source service.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Verification Email ───────────────────────────────────────────────────────

function buildVerificationEmail(email, token) {
  const url = `${SITE_URL()}/api/verify-email?token=${token}`;

  const body = `
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:rgba(37,99,235,0.1);border:1.5px solid rgba(37,99,235,0.25);">
        <span style="font-size:24px;">📬</span>
      </div>
    </div>

    <h1 class="text-dark" style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;text-align:center;">
      Verify your email
    </h1>
    <p class="text-muted" style="margin:0 0 28px;font-size:14px;color:#64748b;text-align:center;line-height:1.6;">
      One click and you're all set to receive instant notice alerts from ${COLLEGE_NAME}.
    </p>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-bottom:24px;">
          <a href="${url}" class="btn-primary"
            style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.01em;">
            ✓ Verify Email Address
          </a>
        </td>
      </tr>
    </table>

    <!-- Amber tip -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;" class="badge-bg">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#92400e;" class="text-muted">
            <strong style="color:#d97706;">⚠️ Can't find this email?</strong>
            Check your <strong>Spam</strong> or <strong>Junk</strong> folder.
            This link expires in <strong>1 hour</strong>.
          </p>
        </td>
      </tr>
    </table>

    <!-- Fallback URL -->
    <p class="text-subtle" style="margin:20px 0 0;font-size:11px;color:#94a3b8;line-height:1.6;word-break:break-all;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${url}" style="color:#2563eb;text-decoration:underline;">${url}</a>
    </p>`;

  const text = `Verify your email for ${SENDER_NAME}\n\nClick this link to confirm:\n${url}\n\nLink expires in 1 hour.\n\nIf you didn't subscribe, ignore this email.`;
  const html = emailShell(`Confirm your email to start receiving PDUAM notice alerts.`, body);

  return { html, text };
}

// ─── Notice Alert Email ───────────────────────────────────────────────────────

function buildNoticeEmail(notices, unsubToken) {
  const unsubUrl = unsubToken
    ? `${SITE_URL()}/api/unsubscribe?token=${unsubToken}`
    : `${SITE_URL()}/unsubscribe`;

  const count = notices.length;

  const noticeRows = notices.map(n => `
    <tr>
      <td class="notice-row" style="padding:14px 16px;border-bottom:1px solid #f1f5f9;border-radius:8px;" class="divider">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td>
              <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">NEW</span>
              <p class="notice-title text-dark" style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0f172a;line-height:1.4;">${n.title}</p>
              ${n.date ? `<p class="text-muted" style="margin:0 0 8px;font-size:11px;color:#94a3b8;">📅 ${n.date}</p>` : ''}
              <a href="${n.url}" style="display:inline-block;font-size:12px;font-weight:600;color:#2563eb;text-decoration:none;">
                View Notice →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const body = `
    <!-- Header row -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
      <tr>
        <td>
          <p style="margin:0;font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.1em;">Notice Alert</p>
          <h1 class="text-dark" style="margin:4px 0 0;font-size:22px;font-weight:800;color:#0f172a;">
            🔔 ${count} New Notice${count > 1 ? 's' : ''}
          </h1>
          <p class="text-muted" style="margin:6px 0 0;font-size:13px;color:#64748b;">
            ${count > 1 ? 'The following notices were' : 'A new notice was'} just posted on the college notice board.
          </p>
        </td>
      </tr>
    </table>

    <!-- Notice list -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;" class="email-card">
      ${noticeRows}
    </table>

    <!-- Primary CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding-bottom:16px;">
          <a href="${NOTICE_URL}" class="btn-primary"
            style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:700;font-size:14px;">
            View All Notices →
          </a>
        </td>
      </tr>
    </table>

    <!-- Unsubscribe nudge -->
    <p class="text-subtle" style="margin:0;font-size:11px;text-align:center;color:#94a3b8;">
      Don't want these alerts?
      <a href="${unsubUrl}" style="color:#64748b;text-decoration:underline;">Unsubscribe instantly</a>
    </p>`;

  const text = notices.map(n =>
    `• ${n.date ? `[${n.date}] ` : ''}${n.title}\n  ${n.url}`
  ).join('\n') + `\n\nView all notices: ${NOTICE_URL}\nUnsubscribe: ${unsubUrl}`;

  const preheader = `${count} new notice${count > 1 ? 's' : ''} from PDUAM Amjonga — ${notices[0]?.title || 'check the notice board'}`;
  const html = emailShell(preheader, body);

  return { html, text };
}

// ─── Unsubscribe Confirmation ─────────────────────────────────────────────────

function buildUnsubConfirmEmail() {
  const body = `
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:rgba(100,116,139,0.1);border:1.5px solid rgba(100,116,139,0.25);">
        <span style="font-size:24px;">👋</span>
      </div>
    </div>

    <h1 class="text-dark" style="margin:0 0 8px;font-size:22px;font-weight:800;color:#0f172a;text-align:center;">
      You're unsubscribed
    </h1>
    <p class="text-muted" style="margin:0 0 28px;font-size:14px;color:#64748b;text-align:center;line-height:1.6;">
      You won't receive any more notice alerts. We're sorry to see you go!
    </p>

    <!-- Re-subscribe CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <a href="${SITE_URL()}" class="btn-secondary"
            style="display:inline-block;background-color:#f1f5f9;color:#475569;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;border:1px solid #e2e8f0;">
            ← Re-subscribe anytime
          </a>
        </td>
      </tr>
    </table>`;

  const text = `You've unsubscribed from ${SENDER_NAME}.\n\nYou won't receive any more notice alerts.\nRe-subscribe anytime: ${SITE_URL()}`;
  const html = emailShell(`You've been unsubscribed from ${SENDER_NAME}.`, body);

  return { html, text };
}

// ─── Core Send Fn ─────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();
  const fromEmail   = process.env.CUSTOM_FROM_EMAIL || process.env.GMAIL_USER;
  const replyTo     = process.env.REPLY_TO_EMAIL    || process.env.GMAIL_USER;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await transporter.sendMail({
        from:    `"${SENDER_NAME}" <${fromEmail}>`,
        sender:  process.env.GMAIL_USER,  // Actual SMTP sender required by Gmail
        replyTo,
        to, subject, html, text,
      });
      return { success: true };
    } catch (err) {
      console.error(`[email] Attempt ${attempt}/3 failed for ${to}:`, err.message);
      if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      else return { success: false, error: err.message };
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function sendVerificationEmail(email, token) {
  const { html, text } = buildVerificationEmail(email, token);
  return sendEmail({
    to: email,
    subject: `Verify your email — ${SENDER_NAME}`,
    html, text,
  });
}

async function sendNoticeAlerts(subscribers, notices, getUnsubToken) {
  let sent = 0, failed = 0;
  for (const sub of subscribers) {
    const token       = getUnsubToken ? await getUnsubToken(sub.email) : null;
    const { html, text } = buildNoticeEmail(notices, token);
    const dateStr     = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const subj        = `[${dateStr}] ${notices.length} New Notice${notices.length > 1 ? 's' : ''} — ${SENDER_NAME}`;
    const r           = await sendEmail({ to: sub.email, subject: subj, html, text });
    if (r.success) { sent++;   console.log(`[email] ✓ ${sub.email}`); }
    else           { failed++; console.error(`[email] ✗ ${sub.email}`); }
  }
  console.log(`[email] Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}

async function sendUnsubscribeConfirmation(email) {
  const { html, text } = buildUnsubConfirmEmail();
  return sendEmail({
    to: email,
    subject: `Unsubscribed — ${SENDER_NAME}`,
    html, text,
  });
}

module.exports = { sendVerificationEmail, sendNoticeAlerts, sendUnsubscribeConfirmation, sendEmail };
