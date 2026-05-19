import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';

// ── Viewport (separate export required by Next.js 13+) ───────────────────────
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#070b14' },
  ],
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  // Only load the weights we actually use
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  metadataBase: new URL('https://notify.pduam.dpdns.org'),
  title: {
    default: 'PDUAM NOTIFY — College Notice Notifications',
    template: '%s | PDUAM NOTIFY',
  },
  description:
    'Get instant email alerts for new notices from Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga. Never miss an important college announcement.',
  keywords: ['PDUAM', 'notice alerts', 'college notices', 'Amjonga', 'PDUAM Amjonga', 'email alerts'],
  authors: [{ name: 'PDUAM NOTIFY' }],
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'PDUAM NOTIFY',
    description: 'Subscribe for instant college notice alerts from PDUAM Amjonga',
    siteName: 'PDUAM NOTIFY',
    url: 'https://notify.pduam.dpdns.org',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/*
          Inline theme script: runs before paint to prevent flash of wrong theme.
          Uses matchMedia for system preference detection.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {/*
          This wrapper clips horizontal overflow WITHOUT using overflow-x: hidden on
          <body>, which breaks position: sticky in Safari/iOS WebKit.
        */}
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'clip' }}>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
