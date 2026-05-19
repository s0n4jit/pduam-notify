import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Analytics } from '@vercel/analytics/next';

const SITE_URL  = 'https://notify.pduam.dpdns.org';
const SITE_NAME = 'PDUAM NOTIFY';
const COLLEGE   = 'Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga';

// ── Viewport ─────────────────────────────────────────────────────────────────
export const viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit:  'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#070b14' },
  ],
};

// ── Root Metadata ─────────────────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  `${SITE_NAME} — Instant College Notice Alerts`,
    template: `%s | ${SITE_NAME}`,
  },

  description:
    `Get instant email alerts for new notices from ${COLLEGE}. Subscribe free — never miss an exam schedule, admission update, or college announcement.`,

  keywords: [
    'PDUAM', 'PDUAM Amjonga', 'Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya',
    'college notices', 'notice alerts', 'email alerts', 'Amjonga college',
    'PDUAM NOTIFY', 'college notifications', 'Assam college notices',
  ],

  authors:  [{ name: SITE_NAME, url: SITE_URL }],
  creator:  SITE_NAME,
  publisher: SITE_NAME,

  // Canonical + alternate
  alternates: { canonical: SITE_URL },

  // Favicon / icons
  icons: {
    icon:      [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut:  '/icon.svg',
    apple:     '/icon.svg',
  },

  // Open Graph — Discord, WhatsApp, Facebook, Telegram previews
  openGraph: {
    title:       `${SITE_NAME} — Instant College Notice Alerts`,
    description: `Subscribe free and get instant email alerts for notices from ${COLLEGE}.`,
    siteName:    SITE_NAME,
    url:         SITE_URL,
    type:        'website',
    locale:      'en_IN',
    images: [
      {
        url:    `${SITE_URL}/og-image.png`,
        width:  1200,
        height: 630,
        alt:    `${SITE_NAME} — College Notice Notifications`,
      },
    ],
  },

  // Twitter / X card
  twitter: {
    card:        'summary_large_image',
    site:        '@pduam_amjonga',
    title:       `${SITE_NAME} — Instant College Notice Alerts`,
    description: `Subscribe free and get instant email alerts for notices from ${COLLEGE}.`,
    images:      [`${SITE_URL}/og-image.png`],
  },

  // Crawler
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:             true,
      follow:            true,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  // Verification placeholders (fill in if you connect Search Console etc.)
  // verification: { google: 'XXXX', yandex: 'XXXX' },

  category: 'education',
};

// ── Font ──────────────────────────────────────────────────────────────────────
const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
  weight:   ['400', '500', '600', '700', '800'],
});

// ── Layout ────────────────────────────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/*
          Inline theme script — executes synchronously BEFORE first paint.
          Reads localStorage → falls back to system preference.
          Prevents flash of wrong theme (FOWT) on every page load.
          No-JS fallback: defaults to system preference via CSS media query.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(s===null&&d)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {/*
          Wrapper clips horizontal overflow WITHOUT overflow-x:hidden on <body>,
          which would break position:sticky in Safari/iOS WebKit.
        */}
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'clip' }}>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1" id="main-content">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </ThemeProvider>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
