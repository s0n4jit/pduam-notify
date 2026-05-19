/**
 * GET /api/latest-notices
 * Returns notices from data/notices.json.
 * Query params: ?limit=20 (default 50)
 */

import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { getAllNotices, getLastChecked } = require('@/lib/notices');
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const notices = getAllNotices();
    const limited = notices.slice(0, Math.min(limit, 500));

    return NextResponse.json({
      notices: limited,
      total: notices.length,
      lastChecked: getLastChecked(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    console.error('[latest-notices] Error:', err);
    return NextResponse.json({ notices: [], total: 0, error: 'Failed to fetch notices.' }, { status: 500 });
  }
}
