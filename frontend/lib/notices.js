/**
 * Notices Storage — JSON File
 * 
 * Reads/writes notices from data/notices.json at the repo root.
 * The scraper updates this file, and GitHub Actions commits the changes.
 * The frontend reads it via Next.js server components.
 * 
 * Schema:
 * {
 *   "lastChecked": "ISO timestamp",
 *   "notices": [
 *     { "title": "...", "url": "...", "hash": "sha256", "date": "YYYY-MM-DD", "detected_at": "ISO" }
 *   ]
 * }
 */

const fs = require('fs');
const path = require('path');

// Resolve path: in frontend (Next.js), cwd is /frontend; in scraper, cwd is /scraper
function getNoticesPath() {
  // Try multiple paths to handle both contexts
  const candidates = [
    path.join(process.cwd(), '..', 'data', 'notices.json'),  // from frontend/ or scraper/
    path.join(process.cwd(), 'data', 'notices.json'),         // from repo root
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  // Default to the first candidate (create if needed)
  return candidates[0];
}

/** Read the full notices data object */
function readNoticesData() {
  try {
    const raw = fs.readFileSync(getNoticesPath(), 'utf8');
    return JSON.parse(raw);
  } catch {
    return { lastChecked: '', notices: [] };
  }
}

/** Get all notices (sorted newest first) */
function getAllNotices() {
  const data = readNoticesData();
  return data.notices || [];
}

/** Get the set of existing notice hashes for dedup */
function getNoticeHashes() {
  const notices = getAllNotices();
  return new Set(notices.map((n) => n.hash));
}

/** Get last checked timestamp */
function getLastChecked() {
  const data = readNoticesData();
  return data.lastChecked || null;
}

/**
 * Add new notices to the file and update lastChecked.
 * Merges new notices at the top, keeps max 500.
 */
function addNotices(newNotices) {
  const data = readNoticesData();
  const existingHashes = new Set(data.notices.map((n) => n.hash));

  // Only add truly new ones
  const toAdd = newNotices.filter((n) => !existingHashes.has(n.hash));

  if (toAdd.length === 0) return 0;

  // Merge: new at top, existing below, cap at 500
  data.notices = [...toAdd, ...data.notices].slice(0, 500);
  data.lastChecked = new Date().toISOString();

  const filePath = getNoticesPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

  return toAdd.length;
}

/** Write the entire notices data (used by scraper for full updates) */
function writeNoticesData(data) {
  const filePath = getNoticesPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { getAllNotices, getNoticeHashes, getLastChecked, addNotices, readNoticesData, writeNoticesData };
