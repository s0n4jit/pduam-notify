/**
 * PDUAM Notice Scraper v2.2
 * 
 * - Fetches notices from pduamamjonga.ac.in/notice
 * - SHA256 hash duplicate detection
 * - Stores notices in data/notices.json (committed by GitHub Actions)
 * - Broadcasts new notices to Telegram channel
 * - Reads subscribers from Google Sheets
 * - Sends branded HTML emails
 * - Supports CUSTOM_FROM_EMAIL and REPLY_TO_EMAIL
 * - Per-subscriber unsubscribe tokens
 * - Retry logic and structured logging
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// ─── Config ───────────────────────────────────────────────────────────────────

const NOTICE_URL = 'https://pduamamjonga.ac.in/notice';
const COLLEGE_NAME = 'Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga';
const COLLEGE_SHORT = 'PDUAM';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pduam-notify.vercel.app';
const MAX_RETRIES = 3;

// Telegram channel link (derived from @username)
function getTelegramLink() {
  const id = process.env.TELEGRAM_CHANNEL_ID || '';
  if (id.startsWith('@')) return `https://t.me/${id.slice(1)}`;
  return '';
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'data');
const NOTICES_FILE = path.join(DATA_DIR, 'notices.json');

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(tag, msg) { console.log(`[${new Date().toISOString()}] [${tag}] ${msg}`); }
function logError(tag, msg, err) { console.error(`[${new Date().toISOString()}] [${tag}] ${msg}`, err?.message || err); }

// ─── Crypto ───────────────────────────────────────────────────────────────────

function sha256(str) { return crypto.createHash('sha256').update(str).digest('hex'); }

function hashNotice(title, url) {
  const normalized = `${title.trim().toLowerCase()}|${url.trim().toLowerCase().replace(/\/$/, '')}`;
  return sha256(normalized);
}

function generateToken() { return crypto.randomBytes(32).toString('hex'); }

// ─── JSON Storage (Notices) ───────────────────────────────────────────────────

function readNotices() {
  try {
    return JSON.parse(fs.readFileSync(NOTICES_FILE, 'utf8'));
  } catch {
    return { lastChecked: '', notices: [] };
  }
}

function writeNotices(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(NOTICES_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── Google Sheets (Subscribers + Tokens) ─────────────────────────────────────

let sheetsClient = null;

async function getSheets() {
  if (sheetsClient) return sheetsClient;
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

async function readSheet(name) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID, range: `${name}!A:Z`,
  });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });
}

async function appendRows(name, rows, columns) {
  const sheets = await getSheets();
  const values = rows.map(r => columns.map(c => r[c] || ''));
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${name}!A:Z`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values },
  });
}

// ─── Scraper ──────────────────────────────────────────────────────────────────

async function scrapeNotices() {
  log('scraper', `Fetching ${NOTICE_URL} ...`);

  let html;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.get(NOTICE_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PDUAMNotifyBot/2.1)' },
        timeout: 20000,
      });
      html = res.data;
      break;
    } catch (err) {
      logError('scraper', `Fetch attempt ${attempt}/${MAX_RETRIES} failed`, err);
      if (attempt === MAX_RETRIES) throw err;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }

  const $ = cheerio.load(html);
  const notices = [];

  $('li').each((_, el) => {
    const text = $(el).text().trim();
    const link = $(el).find('a').attr('href');
    const dateMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch || !link) return;

    const date = dateMatch[1];
    let title = text.replace(date, '').replace(/\bNew\b/gi, '').replace(/Click Here/gi, '').replace(/\s+/g, ' ').trim();
    if (!title || title.length < 5) return;

    const url = link.startsWith('http') ? link : `https://pduamamjonga.ac.in${link}`;
    notices.push({ date, title, url, hash: hashNotice(title, url) });
  });

  // Deduplicate by hash
  const seen = new Set();
  const unique = notices.filter(n => { if (seen.has(n.hash)) return false; seen.add(n.hash); return true; });
  unique.sort((a, b) => new Date(b.date) - new Date(a.date));

  log('scraper', `Found ${unique.length} unique notices`);
  return unique;
}

// ─── Email ────────────────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

function buildEmailHtml(notices, unsubUrl) {
  const rows = notices.map(n => `<tr><td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;">
<span style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:800;padding:2px 10px;border-radius:20px;">NEW</span>
<p style="margin:6px 0 4px;font-size:14px;color:#1e293b;font-weight:600;">${n.title}</p>
<p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">📅 ${n.date}</p>
<a href="${n.url}" style="font-size:13px;color:#2563eb;font-weight:600;text-decoration:none;">View Notice →</a>
</td></tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px 32px;">
<p style="margin:0 0 2px;font-size:11px;color:#93c5fd;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">${COLLEGE_SHORT} Notice Alerts</p>
<h1 style="margin:0;font-size:20px;color:#fff;font-weight:700;">🔔 ${notices.length} New Notice${notices.length > 1 ? 's' : ''}</h1>
<p style="margin:6px 0 0;font-size:12px;color:#bfdbfe;">${COLLEGE_NAME}</p>
</td></tr>
<tr><td style="padding:8px 12px;"><table width="100%" style="background:#f8fafc;border-radius:12px;">${rows}</table></td></tr>
<tr><td style="padding:24px 32px;text-align:center;">
<a href="${NOTICE_URL}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;">View All Notices →</a>
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;text-align:center;">
<p style="margin:0;font-size:11px;color:#94a3b8;"><a href="${unsubUrl}" style="color:#64748b;">Unsubscribe</a> · <a href="${NOTICE_URL}" style="color:#64748b;">Notice Board</a>${getTelegramLink() ? ` · <a href="${getTelegramLink()}" style="color:#0088cc;font-weight:600;">✈️ Telegram Channel</a>` : ''}</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function buildEmailText(notices, unsubUrl) {
  const tgLine = getTelegramLink() ? '\nTelegram: ' + getTelegramLink() : '';
  const items = notices.map(n => '• [' + n.date + '] ' + n.title + '\n  ' + n.url).join('\n');
  return items + '\n\nAll: ' + NOTICE_URL + '\nUnsub: ' + unsubUrl + tgLine;
}

async function sendAlerts(subscribers, notices) {
  if (!subscribers.length) { log('email', 'No verified subscribers'); return; }

  const transporter = createTransporter();
  const fromEmail = process.env.CUSTOM_FROM_EMAIL || process.env.GMAIL_USER;
  const replyTo = process.env.REPLY_TO_EMAIL || process.env.GMAIL_USER;
  let sent = 0, failed = 0;

  for (const sub of subscribers) {
    try {
      const unsubToken = generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await appendRows('unsubscribe_tokens', [{
        email: sub.email, token: unsubToken,
        created_at: new Date().toISOString(), expires_at: expiresAt,
      }], ['email', 'token', 'created_at', 'expires_at']);

      const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${unsubToken}`;
      const subject = `[${COLLEGE_SHORT}] ${notices.length} New Notice${notices.length > 1 ? 's' : ''} – ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;

      await transporter.sendMail({
        from: `"${COLLEGE_SHORT} Notice Alerts" <${fromEmail}>`,
        sender: process.env.GMAIL_USER,
        replyTo: replyTo,
        to: sub.email,
        subject,
        html: buildEmailHtml(notices, unsubUrl),
        text: buildEmailText(notices, unsubUrl),
      });

      sent++;
      log('email', `✓ Sent to ${sub.email}`);
    } catch (err) {
      failed++;
      logError('email', `✗ Failed for ${sub.email}`, err);
    }
  }

  log('email', `Done. Sent: ${sent}, Failed: ${failed}`);
}

// ─── Telegram Bot ─────────────────────────────────────────────────────────────

/**
 * Send new notices to a Telegram channel.
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID in env.
 * The bot must be an admin of the channel.
 */
async function sendToTelegram(notices) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    log('telegram', 'Skipped — TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID not set');
    return;
  }

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  // Build a single message with all new notices
  const header = `🔔 *${notices.length} New Notice${notices.length > 1 ? 's' : ''} — ${COLLEGE_SHORT}*\n`;
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const subheader = `📅 _${date}_\n\n`;

  const body = notices.map((n, i) => {
    const emoji = n.url.endsWith('.pdf') ? '📄' : '📎';
    return `${emoji} *${i + 1}.* [${escapeMarkdown(n.title)}](${n.url})\n   └ ${n.date}`;
  }).join('\n\n');

  const tgLink = getTelegramLink();
  const footer = `\n\n🌐 [View All Notices](${NOTICE_URL}) · [Subscribe for Email](${SITE_URL})${tgLink ? ` · [✈️ Join Telegram](${tgLink})` : ''}`;

  const message = header + subheader + body + footer;

  try {
    const res = await axios.post(apiUrl, {
      chat_id: channelId,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }, { timeout: 15000 });

    if (res.data.ok) {
      log('telegram', `✓ Sent ${notices.length} notice(s) to channel`);
    } else {
      logError('telegram', 'API returned error', res.data);
    }
  } catch (err) {
    logError('telegram', 'Failed to send to channel', err);
  }
}

/** Escape Markdown special characters for Telegram */
function escapeMarkdown(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('run', '====== PDUAM Notice Scraper v2.2 ======');

  // 1. Scrape
  let freshNotices;
  try {
    freshNotices = await scrapeNotices();
  } catch (err) {
    logError('scraper', 'Fatal: could not fetch notices', err);
    process.exit(1);
  }

  if (freshNotices.length === 0) {
    log('scraper', 'No notices found. Exiting.');
    process.exit(0);
  }

  // 2. Load stored hashes from JSON
  const stored = readNotices();
  const storedHashes = new Set(stored.notices.map(n => n.hash));
  log('storage', `Loaded ${storedHashes.size} stored notice hashes from JSON`);

  // 3. Diff
  const newNotices = freshNotices.filter(n => !storedHashes.has(n.hash));
  log('diff', `New notices found: ${newNotices.length}`);

  if (newNotices.length === 0) {
    log('diff', 'No new notices since last run.');
    // Update lastChecked even if no new notices
    stored.lastChecked = new Date().toISOString();
    writeNotices(stored);
    process.exit(0);
  }

  // 4. Add new notices with detected_at timestamp
  const withTimestamp = newNotices.map(n => ({
    ...n,
    detected_at: new Date().toISOString(),
  }));

  // Merge: new on top, keep max 500
  stored.notices = [...withTimestamp, ...stored.notices].slice(0, 500);
  stored.lastChecked = new Date().toISOString();
  writeNotices(stored);
  log('storage', `Saved ${newNotices.length} new notices to JSON (total: ${stored.notices.length})`);

  // 5. Send to Telegram channel (broadcast)
  try {
    await sendToTelegram(newNotices);
  } catch (err) {
    logError('telegram', 'Failed to broadcast to Telegram', err);
  }

  // 6. Send email alerts to verified subscribers (from Google Sheets)
  try {
    const allSubs = await readSheet('subscribers');
    const verified = allSubs.filter(s => s.verified === 'true');
    log('email', `Verified subscribers: ${verified.length}`);

    if (verified.length > 0) {
      await sendAlerts(verified, newNotices);
    }
  } catch (err) {
    logError('email', 'Failed to send alerts', err);
  }

  log('run', `Finished at ${new Date().toISOString()}`);
}

main().catch(err => {
  logError('fatal', 'Unhandled error', err);
  process.exit(1);
});
