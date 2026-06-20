/**
 * PDUAM Notify v3 - Notification Delivery Script
 * 
 * - Executed in GitHub Actions when data/notices.json changes.
 * - Reads current and previous commit data/notices.json to identify new notices.
 * - Broadcasts alerts via Telegram channel (failsafe: does not block email).
 * - Broadcasts alerts via Gmail SMTP to verified subscribers from Google Sheets (failsafe: does not block Telegram).
 * - Implements retry logic and structured logging.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { execSync } = require('child_process');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { buildNoticeEmail, sendEmail } = require('../lib/email');
const { getVerifiedSubscribers } = require('../lib/sheets');
const config = require('../lib/config');

// ─── Config ───────────────────────────────────────────────────────────────────
const NOTICE_URL = config.noticeUrl;
const COLLEGE_SHORT = config.collegeShort;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';
const NOTICES_FILE = path.join(__dirname, '..', 'data', 'notices.json');

// ─── Logging ──────────────────────────────────────────────────────────────────
function log(tag, msg) { console.log(`[${new Date().toISOString()}] [${tag}] ${msg}`); }
function logError(tag, msg, err) { console.error(`[${new Date().toISOString()}] [${tag}] ${msg}`, err?.message || err); }

// ─── Telegram Bot ─────────────────────────────────────────────────────────────
function getTelegramLink() {
  const id = process.env.TELEGRAM_CHANNEL_ID || '';
  if (id.startsWith('@')) return `https://t.me/${id.slice(1)}`;
  return '';
}

function escapeMarkdown(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

async function sendToTelegram(notices) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    log('telegram', 'Skipped — TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set');
    return;
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const templatePath = path.join(__dirname, '..', 'templates', 'telegram', 'notice_alert.txt');
  
  if (!fs.existsSync(templatePath)) {
    log('telegram', `Skipped — Telegram template not found at ${templatePath}`);
    return;
  }
  
  const template = fs.readFileSync(templatePath, 'utf8');
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const count = notices.length;
  const pluralS = count > 1 ? 's' : '';

  const noticesText = notices.map((n, i) => {
    const emoji = n.url.endsWith('.pdf') ? '📄' : '📎';
    return `${emoji} *${i + 1}.* [${escapeMarkdown(n.title)}](${n.url})\n   └ ${n.date}`;
  }).join('\n\n');

  const tgLink = getTelegramLink();
  const tgLinkMd = tgLink ? ` · [✈️ Join Telegram](${tgLink})` : '';

  const message = template
    .replace(/{{COUNT}}/g, count)
    .replace(/{{PLURAL_S}}/g, pluralS)
    .replace(/{{COLLEGE_SHORT}}/g, COLLEGE_SHORT)
    .replace(/{{DATE}}/g, date)
    .replace(/{{NOTICES}}/g, noticesText)
    .replace(/{{NOTICE_URL}}/g, NOTICE_URL)
    .replace(/{{SITE_URL}}/g, SITE_URL)
    .replace(/{{TELEGRAM_LINK_MD}}/g, tgLinkMd);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await axios.post(apiUrl, {
        chat_id: channelId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }, { timeout: 15000 });

      if (res.data.ok) {
        log('telegram', `✓ Sent ${notices.length} notice(s) to channel`);
        return;
      } else {
        throw new Error(`Telegram API error: ${JSON.stringify(res.data)}`);
      }
    } catch (err) {
      logError('telegram', `Attempt ${attempt}/3 failed`, err);
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 2000 * attempt));
      } else {
        throw err;
      }
    }
  }
}

// ─── Email Delivery ───────────────────────────────────────────────────────────
async function sendEmailAlerts(subscribers, notices) {
  if (!subscribers.length) {
    log('email', 'No verified subscribers to notify');
    return;
  }

  const fromEmail = process.env.CUSTOM_FROM_EMAIL || process.env.GMAIL_USER;
  const { html, text } = buildNoticeEmail(notices, null, null);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const subject = `[${config.siteName}] ${notices.length} New Notice board update${notices.length > 1 ? 's' : ''} - ${dateStr}`;

  const BATCH_SIZE = 90;
  let sent = 0, failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const bccList = batch.map(s => s.email);

    try {
      const res = await sendEmail({
        bcc: bccList,
        subject,
        html,
        text,
      });

      if (res.success) {
        sent += batch.length;
        log('email', `✓ Sent batch of ${batch.length} emails via BCC`);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      failed += batch.length;
      logError('email', `✗ Failed to send batch of ${batch.length}`, err);
    }
  }

  log('email', `Broadcast complete. Sent: ${sent}, Failed: ${failed}`);
}

// ─── Git Diff Logic ───────────────────────────────────────────────────────────
function getNewNotices() {
  log('diff', 'Detecting new notices using git diff...');
  
  if (!fs.existsSync(NOTICES_FILE)) {
    log('diff', 'No notices.json file found.');
    return [];
  }

  const currentNoticesData = JSON.parse(fs.readFileSync(NOTICES_FILE, 'utf8'));
  const currentNotices = currentNoticesData.notices || [];

  let previousNotices = [];
  try {
    const beforeSha = process.env.BEFORE_SHA;
    // If BEFORE_SHA exists and is not the empty/zero commit hash, compare against it.
    // Otherwise, default to HEAD~1 (the immediate previous commit).
    const baseCommit = (beforeSha && beforeSha !== '0000000000000000000000000000000000000000') ? beforeSha : 'HEAD~1';
    log('diff', `Comparing current notices against base commit: ${baseCommit}`);

    const previousContent = execSync(`git show ${baseCommit}:data/notices.json`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    const previousNoticesData = JSON.parse(previousContent);
    previousNotices = previousNoticesData.notices || [];
    log('diff', `Loaded ${previousNotices.length} notices from commit ${baseCommit}.`);
  } catch (err) {
    log('diff', 'Could not load previous notices.json from git (likely first run or commit history unavailable). Stalling notification delivery.');
    // In case of error (e.g. first commit or no history), fallback to all fresh notices that are detected within the last 15 minutes
    const now = Date.now();
    const recent = currentNotices.filter(n => {
      if (!n.detected_at || !n.date) return false;
      const detectedTime = new Date(n.detected_at).getTime();
      const noticeTime = new Date(n.date).getTime();
      const ageInDays = (now - noticeTime) / (1000 * 60 * 60 * 24);
      return (now - detectedTime) < 15 * 60 * 1000 && ageInDays <= 7;
    });
    log('diff', `Fallback found ${recent.length} recently detected fresh notices.`);
    return recent;
  }

  const previousHashes = new Set(previousNotices.map(n => n.hash));
  let newNotices = currentNotices.filter(n => !previousHashes.has(n.hash));
  
  // Safeguard: Filter out notices older than 7 days to prevent old notice spam
  const now = Date.now();
  newNotices = newNotices.filter(n => {
    if (!n.date) return false;
    const noticeTime = new Date(n.date).getTime();
    const ageInDays = (now - noticeTime) / (1000 * 60 * 60 * 24);
    if (ageInDays > 7) {
      log('diff', `Skipping old notice notification: "${n.title}" (${n.date})`);
      return false;
    }
    return true;
  });

  log('diff', `Detected ${newNotices.length} new notices by comparing hashes.`);
  return newNotices;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log('run', '====== PDUAM Notice Notification Delivery ======');

  const newNotices = getNewNotices();
  if (newNotices.length === 0) {
    log('run', 'No new notices detected. Exiting.');
    process.exit(0);
  }

  // 1. Send Telegram alerts
  try {
    await sendToTelegram(newNotices);
  } catch (err) {
    logError('telegram', 'Broadcast to Telegram failed. Continuing with email notifications...', err);
  }

  // 2. Send Email alerts
  try {
    const allSubs = await getVerifiedSubscribers();
    log('email', `Found ${allSubs.length} verified subscribers`);
    if (allSubs.length > 0) {
      await sendEmailAlerts(allSubs, newNotices);
    }
  } catch (err) {
    logError('email', 'Broadcast to Emails failed.', err);
  }

  log('run', 'Finished notification delivery process.');
}

main().catch(err => {
  logError('fatal', 'Unhandled error in notifier', err);
  process.exit(1);
});
