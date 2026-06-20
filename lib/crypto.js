/**
 * Crypto & Security Utilities
 * 
 * SHA256 hashing, HMAC-SHA256 for IP hashing (keyed),
 * token generation, input sanitization, email validation
 */

const crypto = require('crypto');

/** Generate SHA256 hash of a string */
function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/** Generate a secure random token (URL-safe, 64 hex chars) */
function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/** Hash a notice for duplicate detection — normalizes title + URL */
function hashNotice(title, url) {
  const normalized = `${title.trim().toLowerCase()}|${url.trim().toLowerCase().replace(/\/$/, '')}`;
  return sha256(normalized);
}

/**
 * Hash an IP address using HMAC-SHA256 with a secret salt.
 * HMAC is stronger than plain SHA256(salt+ip) because it prevents
 * length-extension attacks and ensures the salt is cryptographically bound.
 * 
 * The HASH_SALT should be a cryptographically random string (48+ bytes).
 * Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
 */
function hashIP(ip) {
  if (!ip) return '';
  const salt = process.env.HASH_SALT;
  if (!salt || salt === 'change-this-to-a-random-string-abc123') {
    console.warn('[security] HASH_SALT is not set or is the default. Generate a strong salt!');
  }
  // HMAC-SHA256: cryptographically proper keyed hash
  return crypto.createHmac('sha256', salt || 'fallback-salt').update(ip).digest('hex');
}

/** Hash a User-Agent string (salted HMAC) */
function hashUserAgent(ua) {
  if (!ua) return '';
  const salt = process.env.HASH_SALT || 'fallback-salt';
  return crypto.createHmac('sha256', salt).update(ua).digest('hex');
}

/** Sanitize HTML — strip all tags */
function sanitizeHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

/** Validate email format (RFC 5321 simplified) */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email) && email.length <= 254;
}

module.exports = { sha256, generateToken, hashNotice, hashIP, hashUserAgent, sanitizeHtml, isValidEmail };
