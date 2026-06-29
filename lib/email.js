/**
 * Email Service — Gmail SMTP via Nodemailer
 * Templates loaded from templates/email directory
 *
 * Sender: "PDUAM NOTIFY" <from-address>
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const COLLEGE_NAME  = config.collegeName;
const SENDER_NAME   = config.siteName;
const NOTICE_URL    = config.noticeUrl;
const SITE_URL      = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';

// Helper to find and read templates safely across different runtimes (Next.js serverless, scraper, etc.)
function getTemplatePath(subPath) {
  const possiblePaths = [
    path.join(process.cwd(), 'templates', subPath),
    path.join(process.cwd(), '..', 'templates', subPath),
    path.join(__dirname, 'templates', subPath),
    path.join(__dirname, '..', 'templates', subPath),
    path.join(__dirname, '..', '..', 'templates', subPath),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  throw new Error(`Template not found: ${subPath}`);
}

function readTemplate(subPath) {
  const p = getTemplatePath(subPath);
  return fs.readFileSync(p, 'utf8');
}

function replacePlaceholders(template, data) {
  let result = template;
  for (const key in data) {
    const val = data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), val);
  }
  return result;
}

// ─── Transporter ─────────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

function getTelegramLink() {
  const id = process.env.TELEGRAM_CHANNEL_ID || '';
  if (id.startsWith('@')) return `https://t.me/${id.slice(1)}`;
  return '';
}

function getTelegramButtonHtml() {
  const tgLink = getTelegramLink();
  if (!tgLink) return '';
  return `
<!-- Telegram CTA Button -->
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
  <tr>
    <td align="center" style="padding-bottom:20px;">
      <a href="${tgLink}" class="btn-secondary"
        style="display:inline-block;background-color:#0088cc;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:12px;font-weight:700;font-size:14px;box-shadow: 0 4px 10px rgba(0, 136, 204, 0.25);">
        <img src="https://img.icons8.com/ios-filled/50/ffffff/telegram-app.png" width="18" height="18" alt="Telegram" style="margin-right:8px; vertical-align:middle; display:inline-block;">
        Join Telegram Channel
      </a>
    </td>
  </tr>
</table>`;
}

// ─── Shared Shell ─────────────────────────────────────────────────────────────

function emailShell(preheader, body, { unsubscribeUrl } = {}) {
  const unsubscribeLink = unsubscribeUrl || `${SITE_URL()}/unsubscribe`;
  const shellTemplate = readTemplate('email/shell.html');

  return replacePlaceholders(shellTemplate, {
    SENDER_NAME,
    COLLEGE_NAME,
    PREHEADER: preheader,
    BODY: body,
    SITE_URL: SITE_URL(),
    SITE_URL_DISPLAY: SITE_URL().replace('https://', ''),
    UNSUBSCRIBE_LINK: unsubscribeLink,
    NOTICE_URL,
    YEAR: new Date().getFullYear().toString()
  });
}

// ─── Verification Email ───────────────────────────────────────────────────────

function buildVerificationEmail(email, token) {
  const url = `${SITE_URL()}/api/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  const verificationTemplate = readTemplate('email/verification.html');

  const body = replacePlaceholders(verificationTemplate, {
    VERIFY_URL: url,
    COLLEGE_NAME,
    TELEGRAM_BUTTON_HTML: getTelegramButtonHtml(),
    SITE_URL: SITE_URL()
  });

  const text = `Verify your email for ${SENDER_NAME}\n\nClick this link to confirm:\n${url}\n\nLink expires in 5 minutes.\n\nIf you didn't subscribe, ignore this email.`;
  const html = emailShell(
    `Confirm your email to start receiving PDUAM notice alerts.`,
    body,
    { unsubscribeUrl: `${SITE_URL()}/unsubscribe?email=${encodeURIComponent(email)}` }
  );

  return { html, text };
}

// ─── Notice Alert Email ───────────────────────────────────────────────────────

function buildNoticeEmail(notices, unsubToken, email) {
  const unsubUrl = `${SITE_URL()}/unsubscribe?email=${encodeURIComponent(email)}`;
  const count = notices.length;

  const rowTemplate = readTemplate('email/notice_row.html');
  const noticeRows = notices.map(n => {
    const dateHtml = n.date ? `<p class="text-muted" style="margin:0 0 8px;font-size:11px;color:#94a3b8;">📅 ${n.date}</p>` : '';
    return replacePlaceholders(rowTemplate, {
      TITLE: n.title,
      DATE_HTML: dateHtml,
      URL: n.url
    });
  }).join('');

  const alertTemplate = readTemplate('email/notice_alert.html');
  const body = replacePlaceholders(alertTemplate, {
    COUNT: count,
    PLURAL_S: count > 1 ? 's' : '',
    COLLEGE_MESSAGE_INTRO: count > 1 
      ? 'The following notices were just posted on the college notice board.' 
      : 'A new notice was just posted on the college notice board.',
    NOTICE_ROWS: noticeRows,
    NOTICE_URL,
    UNSUBSCRIBE_URL: unsubUrl,
    TELEGRAM_BUTTON_HTML: getTelegramButtonHtml(),
    SITE_URL: SITE_URL()
  });

  const text = notices.map(n =>
    `• ${n.date ? `[${n.date}] ` : ''}${n.title}\n  ${n.url}`
  ).join('\n') + `\n\nView all notices: ${NOTICE_URL}\nUnsubscribe: ${unsubUrl}` + (email ? `\nManage subscription: ${SITE_URL()}/unsubscribe?email=${encodeURIComponent(email)}` : '');

  const preheader = `${count} new notice${count > 1 ? 's' : ''} from PDUAM Amjonga — ${notices[0]?.title || 'check the notice board'}`;
  const html = emailShell(
    preheader,
    body,
    { unsubscribeUrl: unsubUrl }
  );

  return { html, text };
}

// ─── Unsubscribe Confirmation ─────────────────────────────────────────────────

function buildUnsubConfirmEmail() {
  const unsubTemplate = readTemplate('email/unsubscribed.html');
  const body = replacePlaceholders(unsubTemplate, {
    SITE_URL: SITE_URL()
  });

  const text = `You've unsubscribed from ${SENDER_NAME}.\n\nYou won't receive any more notice alerts.\nRe-subscribe anytime: ${SITE_URL()}`;
  const html = emailShell(`You've been unsubscribed from ${SENDER_NAME}.`, body);

  return { html, text };
}

// ─── Core Send Fn ─────────────────────────────────────────────────────────────

async function sendEmail({ to, bcc, subject, html, text }) {
  const transporter = createTransporter();
  const fromEmail   = process.env.CUSTOM_FROM_EMAIL || process.env.GMAIL_USER;
  const replyTo     = process.env.REPLY_TO_EMAIL    || process.env.GMAIL_USER;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await transporter.sendMail({
        from:    `"${SENDER_NAME}" <${fromEmail}>`,
        sender:  process.env.GMAIL_USER,  // Actual SMTP sender required by Gmail
        replyTo,
        to, bcc, subject, html, text,
      });
      return { success: true };
    } catch (err) {
      console.error(`[email] Attempt ${attempt}/3 failed:`, err.message);
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
    const { html, text } = buildNoticeEmail(notices, token, sub.email);
    const dateStr     = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const subj        = `[${SENDER_NAME}] ${notices.length} New Notice board update${notices.length > 1 ? 's' : ''} - ${dateStr}`;
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

module.exports = { sendVerificationEmail, sendNoticeAlerts, sendUnsubscribeConfirmation, sendEmail, buildVerificationEmail, buildNoticeEmail, buildUnsubConfirmEmail, emailShell };
