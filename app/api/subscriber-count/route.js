/**
 * GET /api/subscriber-count
 * Returns the count of verified subscribers from the database.
 * Force dynamic to ensure real-time consistency.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_URL = process.env.API_URL
  ? process.env.API_URL.replace(/\/notices\/?$/, '').replace(/\/$/, '')
  : '';

export async function GET() {
  try {
    const headers = {};
    if (process.env.API_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${process.env.API_SECRET_KEY}`;
    }
    const res = await fetch(`${API_URL}/stats/subscribers`, {
      headers,
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({ count: data.count }, {
      headers: { 
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (err) {
    console.error('[subscriber-count] Failed:', err.message);
    return NextResponse.json({ count: null }, { status: 200 });
  }
}
