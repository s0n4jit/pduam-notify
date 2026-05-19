import NoticeList from '@/components/NoticeList';

export const metadata = {
  title: 'Notice History',
  description: 'Browse all notices from PDUAM Amjonga. Complete history of college announcements.',
};

function getNotices() {
  try {
    const { getAllNotices } = require('@/lib/notices');
    return getAllNotices();
  } catch (err) {
    console.error('[notices] Failed to read:', err.message);
    return [];
  }
}

export const revalidate = 300;

export default function NoticesPage() {
  const notices = getNotices();
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
