/**
 * Notices Storage — API Fetch Client with Local Fallback
 * 
 * Fetches notices from the public Cloudflare Worker API.
 * Falls back to reading from local data/notices.json if the API is unavailable.
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const API_URL = process.env.API_URL;

// Resolve path for local fallback
function getLocalNoticesPath() {
  const candidates = [
    path.join(process.cwd(), '..', 'data', 'notices.json'),  // from frontend/ or scraper/
    path.join(process.cwd(), 'data', 'notices.json'),         // from repo root
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

function readLocalNoticesData() {
  try {
    const raw = fs.readFileSync(getLocalNoticesPath(), 'utf8');
    return JSON.parse(raw);
  } catch {
    return { lastChecked: '', notices: [] };
  }
}

/** Get all notices (sorted newest first) - Async API Call with local fallback */
async function getAllNotices() {
  try {
    const headers = {};
    if (process.env.API_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${process.env.API_SECRET_KEY}`;
    }
    const res = await fetch(`${API_URL}/notices/history?limit=500`, {
      headers,
      next: { revalidate: 300 } // Next.js cache for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('[notices-lib] Failed to fetch notices from API, using local fallback:', err.message);
    const local = readLocalNoticesData();
    return local.notices || [];
  }
}

/** Get last checked timestamp */
async function getLastChecked() {
  try {
    const headers = {};
    if (process.env.API_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${process.env.API_SECRET_KEY}`;
    }
    const res = await fetch(`${API_URL}/notices/latest`, {
      headers,
      next: { revalidate: 300 }
    });
    // Since latest returns a list, lastChecked can be derived or we can use fallback
    const local = readLocalNoticesData();
    return local.lastChecked || new Date().toISOString();
  } catch (err) {
    const local = readLocalNoticesData();
    return local.lastChecked || null;
  }
}

module.exports = { getAllNotices, getLastChecked };
