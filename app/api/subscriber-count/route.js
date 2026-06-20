/**
 * GET /api/subscriber-count
 * Returns the count of verified subscribers from Google Sheets.
 * Cached for 60 seconds via Next.js route segment config.
 */

import { NextResponse } from 'next/server';

// Cache the response for 60 seconds on the server — avoids hitting Sheets on every page load
export const revalidate = 60;

const API_URL = process.env.API_URL;

export async function GET() {
  try {
    const headers = {};
    if (process.env.API_SECRET_KEY) {
      headers['Authorization'] = `Bearer ${process.env.API_SECRET_KEY}`;
    }
    const res = await fetch(`${API_URL}/stats/subscribers`, {
      headers,
      next: { revalidate: 60 }
    });
    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({ count: data.count }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
    });
  } catch (err) {
    console.error('[subscriber-count] Failed:', err.message);
    return NextResponse.json({ count: null }, { status: 200 });
  }
}
