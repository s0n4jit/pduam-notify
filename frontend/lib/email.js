/**
 * Email Service — Gmail SMTP via Nodemailer
 * Templates: verification, notice alerts, unsubscribe confirmation
 */

const nodemailer = require('nodemailer');

const COLLEGE_NAME = 'Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga';
const COLLEGE_SHORT = 'PDUAM';
const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://pduam-notify.vercel.app';
const NOTICE_URL = 'https://pduamamjonga.ac.in/notice';

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

function emailWrapper(body, preheader) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px 32px;text-align:center;">
<p style="margin:0 0 2px;font-size:11px;color:#93c5fd;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">${COLLEGE_SHORT} Notice Alerts</p>
<p style="margin:0;font-size:12px;color:#bfdbfe;">${COLLEGE_NAME}</p>
</td></tr>
${body}
<tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
<p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;text-align:center;">
<a href="${SITE_URL()}/unsubscribe" style="color:#64748b;">Unsubscribe</a> · <a href="${SITE_URL()}/privacy" style="color:#64748b;">Privacy</a> · <a href="${NOTICE_URL}" style="color:#64748b;">Notice Board</a>
</p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildVerificationEmail(email, token) {
  const url = `${SITE_URL()}/api/verify-email?token=${token}`;
  const html = emailWrapper(`<tr><td style="padding:32px;text-align:center;">
<h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Verify Your Email</h1>
<p style="margin:0 0 24px;font-size:14px;color:#64748b;">Click below to start receiving notice alerts.</p>
<a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">✓ Verify Email</a>
<p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">Link expires in 24 hours.</p>
</td></tr>`);
  const text = `Verify your email for ${COLLEGE_SHORT} Notice Alerts:\n${url}\n\nExpires in 24 hours.`;
  return { html, text };
}

function buildNoticeEmail(notices, unsubToken) {
  const unsubUrl = unsubToken ? `${SITE_URL()}/api/unsubscribe?token=${unsubToken}` : `${SITE_URL()}/unsubscribe`;
  const rows = notices.map(n => `<tr><td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;">
<span style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:800;padding:2px 10px;border-radius:20px;">NEW</span>
<p style="margin:6px 0 4px;font-size:14px;color:#1e293b;font-weight:600;">${n.title}</p>
${n.date ? `<p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">📅 ${n.date}</p>` : ''}
<a href="${n.url}" style="font-size:13px;color:#2563eb;font-weight:600;text-decoration:none;">View Notice →</a>
</td></tr>`).join('');

  const html = emailWrapper(`<tr><td style="padding:28px 32px 16px;">
<h1 style="margin:0;font-size:20px;color:#1e293b;">🔔 ${notices.length} New Notice${notices.length > 1 ? 's' : ''}</h1>
</td></tr><tr><td style="padding:8px 12px;"><table width="100%" style="background:#f8fafc;border-radius:12px;">${rows}</table></td></tr>
<tr><td style="padding:24px 32px;text-align:center;">
<a href="${NOTICE_URL}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;">View All Notices →</a>
<p style="margin:12px 0 0;font-size:11px;"><a href="${unsubUrl}" style="color:#94a3b8;">Unsubscribe</a></p>
</td></tr>`);

  const text = notices.map(n => `• ${n.date ? `[${n.date}] ` : ''}${n.title}\n  ${n.url}`).join('\n') + `\n\nAll notices: ${NOTICE_URL}\nUnsubscribe: ${unsubUrl}`;
  return { html, text };
}

function buildUnsubConfirmEmail() {
  const html = emailWrapper(`<tr><td style="padding:32px;text-align:center;">
<div style="font-size:48px;margin-bottom:16px;">👋</div>
<h1 style="margin:0 0 8px;font-size:22px;color:#1e293b;">Unsubscribed</h1>
<p style="margin:0 0 24px;font-size:14px;color:#64748b;">You won't receive any more alerts.</p>
<a href="${SITE_URL()}" style="display:inline-block;background:#f1f5f9;color:#475569;padding:12px 24px;border-radius:10px;font-weight:600;text-decoration:none;border:1px solid #e2e8f0;">Re-subscribe →</a>
</td></tr>`);
  const text = `Unsubscribed from ${COLLEGE_SHORT} Notice Alerts.\nRe-subscribe: ${SITE_URL()}`;
  return { html, text };
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();

  // Use CUSTOM_FROM_EMAIL if set, otherwise fall back to GMAIL_USER
  const fromEmail = process.env.CUSTOM_FROM_EMAIL || process.env.GMAIL_USER;
  const replyTo = process.env.REPLY_TO_EMAIL || process.env.GMAIL_USER;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await transporter.sendMail({
        from: `"${COLLEGE_SHORT} Notice Alerts" <${fromEmail}>`,
        sender: process.env.GMAIL_USER,  // Actual SMTP sender (Gmail requires this)
        replyTo: replyTo,
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

async function sendVerificationEmail(email, token) {
  const { html, text } = buildVerificationEmail(email, token);
  return sendEmail({ to: email, subject: `Verify your email — ${COLLEGE_SHORT} Notice Alerts`, html, text });
}

async function sendNoticeAlerts(subscribers, notices, getUnsubToken) {
  let sent = 0, failed = 0;
  for (const sub of subscribers) {
    const token = getUnsubToken ? await getUnsubToken(sub.email) : null;
    const { html, text } = buildNoticeEmail(notices, token);
    const subj = `[${COLLEGE_SHORT}] ${notices.length} New Notice${notices.length > 1 ? 's' : ''} – ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    const r = await sendEmail({ to: sub.email, subject: subj, html, text });
    if (r.success) { sent++; console.log(`[email] ✓ ${sub.email}`); }
    else { failed++; console.error(`[email] ✗ ${sub.email}`); }
  }
  console.log(`[email] Sent: ${sent}, Failed: ${failed}`);
  return { sent, failed };
}

async function sendUnsubscribeConfirmation(email) {
  const { html, text } = buildUnsubConfirmEmail();
  return sendEmail({ to: email, subject: `Unsubscribed — ${COLLEGE_SHORT} Notice Alerts`, html, text });
}

module.exports = { sendVerificationEmail, sendNoticeAlerts, sendUnsubscribeConfirmation, sendEmail };
