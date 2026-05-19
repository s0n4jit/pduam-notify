/**
 * GET /api/subscriber-count
 * Returns the count of verified subscribers from Google Sheets.
 * Cached for 60 seconds via Next.js route segment config.
 */

import { NextResponse } from 'next/server';
import { getVerifiedSubscribers } from '@/lib/sheets';

// Cache the response for 60 seconds on the server — avoids hitting Sheets on every page load
export const revalidate = 60;

export async function GET() {
  try {
    const subscribers = await getVerifiedSubscribers();
    return NextResponse.json({ count: subscribers.length }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
    });
  } catch (err) {
    console.error('[subscriber-count] Failed:', err.message);
    // Return null so the UI can show a fallback gracefully
    return NextResponse.json({ count: null }, { status: 200 });
  }
}
