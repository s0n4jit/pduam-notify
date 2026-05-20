const SITE_URL = 'https://notify-pduam.vercel.app';

export const metadata = {
  title:       'About',
  description: 'Learn how PDUAM NOTIFY automatically monitors and delivers college notices from Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga straight to your inbox.',
  keywords:    ['PDUAM NOTIFY', 'about', 'college notice automation', 'PDUAM Amjonga'],
  alternates:  { canonical: `${SITE_URL}/about` },
  openGraph: {
    title:       'About PDUAM NOTIFY',
    description: 'How the automated notice monitoring system works for PDUAM Amjonga students.',
    url:         `${SITE_URL}/about`,
    images:      [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'PDUAM NOTIFY' }],
  },
  twitter: {
    card:   'summary_large_image',
    title:  'About PDUAM NOTIFY',
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 gold-text text-center">About PDUAM NOTIFY</h1>
      
      <div className="card p-6 sm:p-8 mb-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>What is this project?</h2>
          <p className="leading-relaxed text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            PDUAM NOTIFY is an automated notification platform designed specifically for the students and staff of Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga. Our goal is to ensure you never miss an important announcement, exam schedule, or college update by delivering them instantly to your inbox and our Telegram channel.
          </p>
        </section>

        <hr style={{ borderColor: 'var(--border)' }} />

        <section>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>How does it work?</h2>
          <p className="mb-6 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            We've built a robust, entirely automated system that monitors the official college notice board 24/7 so you don't have to. Here is the process broken down:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl p-4 border transition-all hover:shadow-md" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-bold text-[15px] mb-1" style={{ color: 'var(--text)' }}>1. Automated Checks</h3>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Every 30 minutes, our automated scripts (powered by GitHub Actions) wake up to scan the official PDUAM website.</p>
            </div>
            
            <div className="rounded-xl p-4 border transition-all hover:shadow-md" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-bold text-[15px] mb-1" style={{ color: 'var(--text)' }}>2. Smart Scraping</h3>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>The system reads the latest notices on the board and extracts the titles, dates, and direct document links.</p>
            </div>
            
            <div className="rounded-xl p-4 border transition-all hover:shadow-md" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-2">🆕</div>
              <h3 className="font-bold text-[15px] mb-1" style={{ color: 'var(--text)' }}>3. Hash Detection</h3>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>We use SHA-256 cryptographic hashing to compare the scanned notices against our database to instantly detect anything new.</p>
            </div>
            
            <div className="rounded-xl p-4 border transition-all hover:shadow-md" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-2">📧</div>
              <h3 className="font-bold text-[15px] mb-1" style={{ color: 'var(--text)' }}>4. Instant Delivery</h3>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>If a new notice is found, an email is immediately crafted and dispatched to all verified subscribers, and a broadcast is sent to Telegram.</p>
            </div>
          </div>
        </section>
        
        <hr style={{ borderColor: 'var(--border)' }} />
        
        <section>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>Collaboration & Open Source</h2>
          <p className="leading-relaxed text-[15px] mb-5" style={{ color: 'var(--text-secondary)' }}>
            This project is proudly developed in collaboration with the <strong>Department of Computer Science (CSC), PDUAM Amjonga</strong>. It is fully open-source and community-driven. We strictly respect your privacy — your email addresses are heavily encrypted and only used to send you notifications. We never share your data.
          </p>
          
          <a 
            href="https://github.com/s0n4jit/pduam-notify" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all hover:shadow-md border"
            style={{ 
              background: 'var(--bg-alt)', 
              borderColor: 'var(--border)', 
              color: 'var(--text)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="font-semibold text-[14px]">View Source on GitHub</span>
          </a>
        </section>

        <hr style={{ borderColor: 'var(--border)' }} />

        <section className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-center mt-4">
          <h2 className="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">Get in Touch</h2>
          <p className="text-[15px] mb-3" style={{ color: 'var(--text-secondary)' }}>
            Have feedback, suggestions, or want to contribute? Reach out to the developer directly:
          </p>
          <a href="mailto:hello@sonajit.in" className="inline-flex items-center gap-2 font-bold text-lg text-blue-600 hover:text-blue-500 transition-colors">
            ✉️ hello@sonajit.in
          </a>
        </section>
      </div>
    </div>
  );
}
