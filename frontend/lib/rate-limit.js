/**
 * In-memory Rate Limiter
 * Prevents abuse on API routes. Uses sliding window per IP.
 * On Vercel serverless, the cache resets per cold start — acceptable tradeoff.
 */

const rateMap = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15-minute window
const MAX_REQUESTS = 10;           // max requests per window
const COOLDOWN_MS = 60 * 1000;     // 1-minute cooldown between subscribe attempts

/**
 * Check if a request should be rate limited.
 * Returns { allowed: boolean, remaining: number, retryAfter?: number }
 */
function checkRateLimit(key, { windowMs = WINDOW_MS, maxRequests = MAX_REQUESTS } = {}) {
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateMap.set(key, { windowStart: now, count: 1, lastRequest: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count++;
  entry.lastRequest = now;
  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Check subscription cooldown — prevents rapid repeated subscribes.
 */
function checkCooldown(key) {
  const now = Date.now();
  const entry = rateMap.get(`cooldown:${key}`);

  if (entry && now - entry.lastRequest < COOLDOWN_MS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - (now - entry.lastRequest)) / 1000);
    return { allowed: false, retryAfter };
  }

  rateMap.set(`cooldown:${key}`, { lastRequest: now });
  return { allowed: true };
}

/** Clean up old entries periodically (prevents memory leaks) */
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateMap.entries()) {
    if (now - (entry.windowStart || entry.lastRequest) > WINDOW_MS * 2) {
      rateMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 5 * 60 * 1000);
}

module.exports = { checkRateLimit, checkCooldown };
