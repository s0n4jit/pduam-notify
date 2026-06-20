import NoticeList from '@/components/NoticeList';

const SITE_URL = 'https://notify-pduam.vercel.app';

export const metadata = {
  title:       'Notice History',
  description: 'Browse all college notices from Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga. Complete history of announcements, exam schedules, and updates.',
  keywords:    ['PDUAM notices', 'college announcements', 'PDUAM Amjonga notices', 'exam schedule'],
  alternates:  { canonical: `${SITE_URL}/notices` },
  openGraph: {
    title:       'College Notice History — PDUAM NOTIFY',
    description: 'All notices from PDUAM Amjonga in one place.',
    url:         `${SITE_URL}/notices`,
    images:      [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'PDUAM NOTIFY' }],
  },
  twitter: {
    card:   'summary_large_image',
    title:  'College Notice History — PDUAM NOTIFY',
    images: [`${SITE_URL}/og-image.png`],
  },
};


async function getNotices() {
  try {
    const { getAllNotices } = require('@/lib/notices');
    return await getAllNotices();
  } catch (err) {
    console.error('[notices] Failed to read:', err.message);
    return [];
  }
}

export const revalidate = 300;

export default async function NoticesPage() {
  const notices = await getNotices();
  const withFlags = notices.map((n, i) => ({ ...n, isNew: i < 4 }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>📋 Notice History</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Complete archive of all detected notices from PDUAM Amjonga.
        </p>
      </div>
      <NoticeList notices={withFlags} showSearch={true} />
    </div>
  );
}
