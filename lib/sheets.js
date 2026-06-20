/**
 * Google Sheets Database Layer
 * 
 * Uses Google Sheets for subscribers and tokens only.
 * Notices are stored in data/notices.json for simplicity.
 * 
 * Sheets required:
 * 1. subscribers         — verified email subscribers
 * 2. verification_tokens — pending email verifications
 * 3. unsubscribe_tokens  — pending unsubscribe requests
 * 
 * Environment variables:
 * - GOOGLE_SERVICE_JSON  — stringified JSON of the service account key
 * - GOOGLE_SHEET_ID      — the Google Spreadsheet ID
 */

const { google } = require('googleapis');

// ─── Auth ─────────────────────────────────────────────────────────────────────

let sheetsClient = null;

async function getSheets() {
  if (sheetsClient) return sheetsClient;

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID;

// ─── Generic Helpers ──────────────────────────────────────────────────────────

/** Read all rows from a sheet tab. Returns array of objects keyed by headers. */
async function readSheet(sheetName) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `${sheetName}!A:Z`,
  });

  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] || ''; });
    return obj;
  });
}

/** Append a single row to a sheet. */
async function appendRow(sheetName, data, columns) {
  const sheets = await getSheets();
  const row = columns.map((col) => data[col] || '');

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(),
    range: `${sheetName}!A:Z`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

/** Delete a row by matching a value in a specific column. */
async function deleteRowByValue(sheetName, columnIndex, value) {
  const sheets = await getSheets();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID() });
  const sheet = spreadsheet.data.sheets.find((s) => s.properties.title === sheetName);
  if (!sheet) return false;

  const sheetId = sheet.properties.sheetId;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: `${sheetName}!A:Z`,
  });

  const rows = res.data.values || [];
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][columnIndex] === value) { rowIndex = i; break; }
  }

  if (rowIndex === -1) return false;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID(),
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
        },
      }],
    },
  });

  return true;
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

const SUB_COLS = ['email', 'verified', 'subscribed_at', 'ip_hash', 'user_agent_hash'];

async function getVerifiedSubscribers() {
  const rows = await readSheet('subscribers');
  return rows.filter((r) => r.verified === 'true');
}

async function getAllSubscribers() {
  return readSheet('subscribers');
}

async function subscriberExists(email) {
  const rows = await readSheet('subscribers');
  return rows.some((r) => r.email === email);
}

async function addSubscriber({ email, ipHash, userAgentHash }) {
  await appendRow('subscribers', {
    email,
    verified: 'false',
    subscribed_at: new Date().toISOString(),
    ip_hash: ipHash,
    user_agent_hash: userAgentHash,
  }, SUB_COLS);
}

async function verifySubscriber(email) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID(),
    range: 'subscribers!A:Z',
  });

  const rows = res.data.values || [];
  const headers = rows[0] || [];
  const emailCol = headers.indexOf('email');
  const verifiedCol = headers.indexOf('verified');
  if (emailCol === -1 || verifiedCol === -1) return false;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][emailCol] === email) {
      const colLetter = String.fromCharCode(65 + verifiedCol);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID(),
        range: `subscribers!${colLetter}${i + 1}`,
        valueInputOption: 'RAW',
        requestBody: { values: [['true']] },
      });
      return true;
    }
  }
  return false;
}

async function removeSubscriber(email) {
  return deleteRowByValue('subscribers', 0, email);
}

// ─── Verification Tokens ──────────────────────────────────────────────────────

const VER_COLS = ['email', 'token', 'created_at', 'expires_at'];

async function addVerificationToken({ email, token, expiresAt }) {
  await deleteRowByValue('verification_tokens', 0, email);
  await appendRow('verification_tokens', {
    email, token, created_at: new Date().toISOString(), expires_at: expiresAt,
  }, VER_COLS);
}

async function findVerificationToken(token) {
  const rows = await readSheet('verification_tokens');
  return rows.find((r) => r.token === token) || null;
}

async function deleteVerificationToken(token) {
  return deleteRowByValue('verification_tokens', 1, token);
}

// ─── Unsubscribe Tokens ───────────────────────────────────────────────────────

const UNSUB_COLS = ['email', 'token', 'created_at', 'expires_at'];

async function addUnsubscribeToken({ email, token, expiresAt }) {
  await deleteRowByValue('unsubscribe_tokens', 0, email);
  await appendRow('unsubscribe_tokens', {
    email, token, created_at: new Date().toISOString(), expires_at: expiresAt,
  }, UNSUB_COLS);
}

async function findUnsubscribeToken(token) {
  const rows = await readSheet('unsubscribe_tokens');
  return rows.find((r) => r.token === token) || null;
}

async function deleteUnsubscribeToken(token) {
  return deleteRowByValue('unsubscribe_tokens', 1, token);
}

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
  getVerifiedSubscribers, getAllSubscribers, subscriberExists,
  addSubscriber, verifySubscriber, removeSubscriber,
  addVerificationToken, findVerificationToken, deleteVerificationToken,
  addUnsubscribeToken, findUnsubscribeToken, deleteUnsubscribeToken,
};
