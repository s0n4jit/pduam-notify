/**
 * Database/Storage Client Layer calling the Cloudflare Worker D1 and KV API
 */

const API_URL = process.env.API_URL
  ? process.env.API_URL.replace(/\/$/, '')
  : '';

async function callWorker(path, body = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (process.env.API_SECRET_KEY) {
    headers['Authorization'] = `Bearer ${process.env.API_SECRET_KEY}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Worker API error: ${res.status} ${errText}`);
  }

  return res.json();
}

async function getVerifiedSubscribers() {
  const all = await getAllSubscribers();
  return all.filter((r) => r.verified === 'true');
}

async function getAllSubscribers() {
  const data = await callWorker('/subscribers/all');
  return data.subscribers || [];
}

async function subscriberExists(email) {
  const data = await callWorker('/subscribers/exists', { email });
  return !!data.exists;
}

async function addSubscriber({ email, ipHash, userAgentHash }) {
  await callWorker('/subscribers/add', { email, ipHash, userAgentHash });
}

async function verifySubscriber(email) {
  const data = await callWorker('/subscribers/verify', { email });
  return !!data.success;
}

async function removeSubscriber(email) {
  const data = await callWorker('/subscribers/unsubscribe', { email });
  return !!data.success;
}

async function addVerificationToken({ email, token, expiresAt }) {
  await callWorker('/subscribers/token/add', { type: 'verification', email, token });
}

async function findVerificationToken(token) {
  const data = await callWorker('/subscribers/token/find', { type: 'verification', token });
  return data.record || null;
}

async function deleteVerificationToken(token) {
  await callWorker('/subscribers/token/delete', { type: 'verification', token });
}

async function addUnsubscribeToken({ email, token, expiresAt }) {
  await callWorker('/subscribers/token/add', { type: 'unsubscribe', email, token });
}

async function findUnsubscribeToken(token) {
  const data = await callWorker('/subscribers/token/find', { type: 'unsubscribe', token });
  return data.record || null;
}

async function deleteUnsubscribeToken(token) {
  await callWorker('/subscribers/token/delete', { type: 'unsubscribe', token });
}

module.exports = {
  getVerifiedSubscribers, getAllSubscribers, subscriberExists,
  addSubscriber, verifySubscriber, removeSubscriber,
  addVerificationToken, findVerificationToken, deleteVerificationToken,
  addUnsubscribeToken, findUnsubscribeToken, deleteUnsubscribeToken,
};
