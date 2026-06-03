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
const { buildNoticeEmail, sendEmail } = require('../frontend/lib/email');
const config = require('../frontend/lib/config');


// ─── Config ───────────────────────────────────────────────────────────────────

const NOTICE_URL = config.noticeUrl;
const COLLEGE_NAME = config.collegeName;
const COLLEGE_SHORT = config.collegeShort;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://notify-pduam.vercel.app';
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

  $(config.scrapeRowSelector).each((_, el) => {
    const text = $(el).text().trim();
    const link = $(el).find('a').attr('href');
    const dateMatch = text.match(new RegExp(config.scrapeDateRegex));
    if (!dateMatch || !link) return;

    const date = dateMatch[1];
    let title = text.replace(date, '').replace(/\bNew\b/gi, '').replace(/Click Here/gi, '').replace(/\s+/g, ' ').trim();
    if (!title || title.length < 5) return;

    let baseUrl;
    try {
      const parsedUrl = new URL(config.noticeUrl);
      baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch {
      baseUrl = 'https://pduamamjonga.ac.in';
    }
    const url = link.startsWith('http') ? link : `${baseUrl}${link.startsWith('/') ? '' : '/'}${link}`;
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

// ─── Email ────────────────────────────────────────────────────────────────────

async function sendAlerts(subscribers, notices) {
  if (!subscribers.length) { log('email', 'No verified subscribers'); return; }

  let sent = 0, failed = 0;

  for (const sub of subscribers) {
    try {
      const { html, text } = buildNoticeEmail(notices, null, sub.email);
      const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const subject = `[${config.siteName}] ${notices.length} New Notice board update${notices.length > 1 ? 's' : ''} - ${dateStr}`;

      const r = await sendEmail({
        to: sub.email,
        subject,
        html,
        text,
      });

      if (r.success) {
        sent++;
        log('email', `✓ Sent to ${sub.email}`);
      } else {
        throw new Error(r.error);
      }
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

  // Read telegram alert template
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
