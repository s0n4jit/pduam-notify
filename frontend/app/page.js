import Link from 'next/link';
import SubscribeForm from '@/components/SubscribeForm';
import NoticeList from '@/components/NoticeList';
import AnimatedBell from '@/components/AnimatedBell';
import LiveSubscriberCount from '@/components/LiveSubscriberCount';

function getNotices() {
  try {
    const { getAllNotices } = require('@/lib/notices');
    return getAllNotices();
  } catch (err) {
    console.error('[homepage] Failed to read notices:', err.message);
    return [];
  }
}

export const revalidate = 300;

export default function HomePage() {
  const notices = getNotices();
  const noticesWithFlag = notices.map((n, i) => ({ ...n, isNew: i < 4 }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 relative">
      {/* Decorative blobs — pointer-events-none, aria-hidden, use radial-gradient
          instead of a div + blur filter to reduce paint cost */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none -z-10"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle at 30% 30%, rgba(37,99,235,0.07) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-1/4 right-0 pointer-events-none -z-10"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle at 70% 30%, rgba(245,158,11,0.07) 0%, transparent 65%)',
        }}
      />

      {/* Hero */}
      <section className="text-center mb-8 sm:mb-10" id="hero">
        <div className="inline-flex items-center justify-center mb-2">
          <div className="w-16 h-16">
            <AnimatedBell className="w-16 h-16" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 gold-text">
          PDUAM NOTIFY
        </h1>
        <p className="text-sm leading-relaxed max-w-md mx-auto px-2" style={{ color: 'var(--text-secondary)' }}>
          Never miss an important notice from{' '}
          <span className="font-semibold">Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga</span>.
          <br />Get instant email alerts — completely free.
        </p>

        <div className="mt-5 flex flex-col items-center gap-3">
          <a
            href="https://t.me/pduam_amjonga_notices"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[14px] font-bold text-white transition-all active:scale-95 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #0088cc, #0099e5)',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              minHeight: '44px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a5.8 5.8 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            For Fast Updates Join the Telegram Channel
          </a>

          <a
            href="https://pduamamjonga.ac.in/notice"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium transition-colors flex items-center gap-1 py-2 px-3 rounded-lg active:opacity-70"
            style={{ color: 'var(--text-secondary)', touchAction: 'manipulation', minHeight: '40px' }}
          >
            Visit the Official College Notice Board ↗
          </a>
        </div>
      </section>

      {/* Subscribe Form */}
      <section className="mb-8 relative z-10" id="subscribe">
        <SubscribeForm />
      </section>

      <section className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-8 sm:mb-10 relative z-10" id="stats">
        {/* Static stats */}
        {[
          { icon: '📋', value: notices.length, label: 'Total Notices' },
          { icon: '✨', value: notices.filter((_, i) => i < 4).length, label: 'Latest', gold: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-5 text-center shadow-lg ${stat.gold ? '' : 'glass'}`}
            style={stat.gold ? { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' } : {}}
          >
            <div className="text-xl sm:text-3xl mb-1.5" aria-hidden="true">{stat.icon}</div>
            <div
              className={`text-xl sm:text-3xl font-bold mb-0.5 ${stat.gold ? 'text-amber-500' : ''}`}
              style={stat.gold ? {} : { color: 'var(--text)' }}
            >
              {stat.value}
            </div>
            <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}

        {/* Live subscriber count — client component (fetches from API) */}
        <div
          className="glass rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-5 text-center shadow-lg"
          style={{ border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.05)' }}
        >
          <div className="text-xl sm:text-3xl mb-1.5" aria-hidden="true">👥</div>
          <div className="text-xl sm:text-3xl font-bold mb-0.5" style={{ color: '#10b981' }}>
            <LiveSubscriberCount />
          </div>
          <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Subscribers
          </div>
        </div>
      </section>

      {/* Latest Notices */}
      <section id="latest-notices" className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text)' }}>Latest Notices</h2>
          <Link
            href="/notices"
            className="text-[13px] font-semibold text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            See all
            <span className="text-lg leading-none">→</span>
          </Link>
        </div>
        <NoticeList notices={noticesWithFlag} limit={4} showSearch={false} />
      </section>
    </div>
  );
}
