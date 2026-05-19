import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-10 w-full relative z-10" style={{ borderTop: '1px solid var(--glass-border)' }}>
      {/* Background blobs — pointer-events-none ensures they never block clicks */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-72 h-72 rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/*
          Mobile layout:  Brand (full) → [Quick Links | Legal] side by side → Collaboration (full)
          Desktop layout: 4-column grid
        */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 text-sm" style={{ color: 'var(--text-muted)' }}>

          {/* Brand — full width on mobile, 1 col on desktop */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-bold mb-3 text-base tracking-wide" style={{ color: 'var(--text)' }}>
              PDUAM NOTIFY
            </h3>
            <p className="leading-relaxed mb-4 text-[13px]">
              Automated notice monitoring service for Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga.
            </p>
            <div
              className="inline-block rounded-lg p-1.5"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
            >
              <iframe
                src="https://ghbtns.com/github-btn.html?user=s0n4jit&repo=pduam-notify&type=star&count=true&size=large"
                frameBorder="0"
                scrolling="0"
                width="170"
                height="30"
                title="Star pduam-notify on GitHub"
                loading="lazy"
                className="block"
              />
            </div>
          </div>

          {/* Quick Links — col 1 on mobile */}
          <div className="col-span-1">
            <h3 className="font-bold mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span className="text-[9px]">▶</span> Home</Link></li>
              <li><Link href="/about" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span className="text-[9px]">▶</span> About</Link></li>
              <li><Link href="/notices" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span className="text-[9px]">▶</span> Notice History</Link></li>
              <li>
                <a href="https://pduamamjonga.ac.in/notice" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors flex items-center gap-2">
                  <span className="text-[9px]">▶</span> Official Board ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Legal — col 2 on mobile */}
          <div className="col-span-1">
            <h3 className="font-bold mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Legal
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/privacy-policy" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span className="text-[9px]">▶</span> Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-blue-500 transition-colors flex items-center gap-2"><span className="text-[9px]">▶</span> Terms of Service</Link></li>
              <li>
                <Link href="/unsubscribe" className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2 font-medium">
                  <span className="text-[9px]">▶</span> Unsubscribe
                </Link>
              </li>
            </ul>
          </div>

          {/* Collaboration — full width on mobile, 1 col on desktop */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-bold mb-3 text-xs uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Collaboration
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              <li className="rounded-lg p-2.5" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <div className="font-bold mb-1 text-[13px]" style={{ color: 'var(--text)' }}>CSC Dept, PDUAM</div>
                <div className="flex items-center gap-2 text-[11px] font-medium">
                  <a href="https://csc.pduam.dpdns.org/" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors text-blue-500">Website</a>
                  <span className="opacity-30">•</span>
                  <a href="https://github.com/cscpduam-alt" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
                </div>
              </li>
              <li className="rounded-lg p-2.5" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
                <div className="font-bold mb-1 text-[13px]" style={{ color: 'var(--text)' }}>Developed by Sonajit</div>
                <div className="flex items-center gap-2 text-[11px] font-medium">
                  <a href="https://sonajit.in" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors text-blue-500">Website</a>
                  <span className="opacity-30">•</span>
                  <a href="https://github.com/s0n4jit" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">GitHub</a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div
          className="mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px]"
          style={{ borderTop: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}
        >
          <p
            className="text-center sm:text-left px-2.5 py-1 rounded-md"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}
          >
            Not officially affiliated with PDUAM, Amjonga.
          </p>
          <div className="flex flex-col sm:items-end gap-1">
            <p className="text-center sm:text-right font-medium">
              Built with Next.js, Node.js, cheerio &amp; GitHub Actions
            </p>
            <p className="flex items-center justify-center sm:justify-end gap-1.5">
              Powered by <span className="text-red-500 text-xs">♥</span> Open Source © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
