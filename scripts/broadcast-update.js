/**
 * scripts/broadcast-update.js
 * 
 * Run manually using Node.js to broadcast a system upgrade/apology notification
 * to both the Telegram channel and all verified email subscribers.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');
const { getVerifiedSubscribers } = require('../lib/sheets');
const { sendEmail, emailShell } = require('../lib/email');
const config = require('../lib/config');

const SENDER_NAME = config.siteName;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

// ─── Broadcast Messages ──────────────────────────────────────────────────────

const updateSubject = `[${SENDER_NAME}] System Upgrade Notice & Maintenance Update`;

const updateEmailBody = `
<div style="font-family: sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <h2 style="color: #2563eb; margin-top: 0; font-size: 20px; border-bottom: 2px solid #eff6ff; padding-bottom: 10px;">System Upgrade Notice (v3.0)</h2>
  <p>Hello subscriber,</p>
  <p>We recently rolled out a major system upgrade (v3.0) to improve the performance, encoding, and reliability of the PDUAM Notice Alert system.</p>
  <p><strong>Apology for Notice Spam:</strong> During this transition, a few duplicate and older notice alerts (from 2024) were accidentally re-sent to your inbox. We sincerely apologize for any confusion or email spam this may have caused.</p>
  <p><strong>What was updated?</strong></p>
  <ul style="padding-left: 20px;">
    <li>Implemented strict unicode/charset encoding to display Assamese notice titles perfectly.</li>
    <li>Added a date filter safeguard that guarantees you will never receive notifications for notices older than 7 days, even if they are re-published or modified on the official college website.</li>
    <li>Faster notice tracking and verification pipelines.</li>
  </ul>
  <p>The system is now fully stable, and you will only receive alerts for brand new notice posts going forward.</p>
  <p>Thank you for your continued patience and support!</p>
</div>
`;

const updateEmailText = `
[${SENDER_NAME}] System Upgrade Notice (v3.0)

Hello subscriber,

We recently rolled out a major system upgrade (v3.0) to improve the performance, encoding, and reliability of the PDUAM Notice Alert system.

Apology for Notice Spam: During this transition, a few duplicate and older notice alerts (from 2024) were accidentally re-sent to your inbox. We sincerely apologize for any confusion or email spam this may have caused.

What was updated:
- Implemented strict unicode/charset encoding to display Assamese notice titles perfectly.
- Added a date filter safeguard that guarantees you will never receive notifications for notices older than 7 days.
- Faster notice tracking and verification pipelines.

The system is now fully stable, and you will only receive alerts for brand new notice posts going forward.

Thank you for your continued patience and support!

Best regards,
The ${SENDER_NAME} Team
`;

const updateTelegramMessage = `
📢 *PDUAM NOTIFY SYSTEM UPDATE (v3.0)*

Hello everyone,

We have successfully deployed a major system upgrade (v3.0) to improve the notice alert platform:

✅ *Fixed Assamese/Unicode Encoding:* Notice titles in Assamese will now render perfectly.
🛡️ *Notice Spam Safeguard:* Added a date filter that automatically filters out older notices to prevent duplicate alerts.
⚡ *Performance Upgrades:* Faster scraper and verification response times.

⚠️ *Apology:* During this transition, some older notices (from 2024) were re-sent to the channel and email. We apologize for any confusion or notification spam this caused.

Everything is now fully stable. Thank you for your patience!

🌐 *Website:* [notify-pduam.vercel.app](${process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app'})
`;

// ─── Broadcast Runners ───────────────────────────────────────────────────────

async function broadcastToTelegram() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.log("[telegram] Skipped: credentials not set.");
    return;
  }

  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const res = await axios.post(apiUrl, {
      chat_id: TELEGRAM_CHANNEL_ID,
      text: updateTelegramMessage,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    });

    if (res.data.ok) {
      console.log("✓ Broadcasted update message to Telegram channel");
    } else {
      throw new Error(`Telegram error: ${JSON.stringify(res.data)}`);
    }
  } catch (err) {
    console.error("✗ Failed to send to Telegram:", err.message);
  }
}

async function broadcastToEmails() {
  try {
    const subscribers = await getVerifiedSubscribers();
    console.log(`[email] Found ${subscribers.length} verified subscribers to email.`);
    
    if (subscribers.length === 0) return;

    const fromEmail = process.env.CUSTOM_FROM_EMAIL || process.env.GMAIL_USER;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';
    const unsubscribeUrl = `${siteUrl}/unsubscribe`;

    const formattedHtml = emailShell(
      `System Upgrade Notice & Maintenance Update`,
      updateEmailBody,
      { unsubscribeUrl }
    );

    const BATCH_SIZE = 90;
    let sent = 0, failed = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const bccList = batch.map(s => s.email);

      const res = await sendEmail({
        bcc: bccList,
        subject: updateSubject,
        html: formattedHtml,
        text: updateEmailText + `\n\nUnsubscribe: ${unsubscribeUrl}`,
      });

      if (res.success) {
        sent += batch.length;
        console.log(`[email] ✓ Sent batch of ${batch.length} emails via BCC`);
      } else {
        failed += batch.length;
        console.error(`[email] ✗ Failed for batch of ${batch.length}: ${res.error}`);
      }
    }
    console.log(`[email] Broadcast finished. Sent: ${sent}, Failed: ${failed}`);
  } catch (err) {
    console.error("✗ Failed to fetch subscribers or send emails:", err.message);
  }
}

async function main() {
  console.log("Starting update broadcast...");
  await broadcastToTelegram();
  await broadcastToEmails();
  console.log("Broadcast complete.");
}

main().catch(console.error);
