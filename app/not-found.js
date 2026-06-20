import Link from 'next/link';

// Server component — enables metadata export for correct tab title
export const metadata = {
  title: { absolute: '404 | PDUAM NOTIFY' },
  description: 'Page not found — head back to PDUAM NOTIFY.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center"
      style={{ animation: 'notFoundRise 0.4s cubic-bezier(0,0,0.21,1) both' }}
    >
      {/* Glowing 404 number */}
      <div
        aria-hidden="true"
        style={{
          fontSize: 'clamp(7rem, 20vw, 10rem)',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #fef3c7, #f59e0b, #d97706)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1.5rem',
          filter: 'drop-shadow(0 0 32px rgba(245,158,11,0.3))',
          userSelect: 'none',
        }}
      >
        404
      </div>

      <h1
        className="font-bold mb-3"
        style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', color: 'var(--text)', lineHeight: 1.2 }}
      >
        Page Not Found
      </h1>

      <p
        className="max-w-sm mb-8 leading-relaxed"
        style={{ fontSize: '15px', color: 'var(--text-secondary)' }}
      >
        This page doesn't exist or has been moved.
        Head back home to catch the latest notices.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="btn-primary"
          style={{ paddingLeft: '1.75rem', paddingRight: '1.75rem', textDecoration: 'none' }}
        >
          ← Back to Home
        </Link>
        <Link
          href="/notices"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            padding: '0.625rem 1rem',
          }}
        >
          View All Notices ↗
        </Link>
      </div>

      {/* Entrance animation — CSS only (server component, no JS state) */}
      <style>{`
        @keyframes notFoundRise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
