# 🔔 PDUAM NOTIFY

> Automated email & Telegram notification platform for college notices from [Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga](https://pduamamjonga.ac.in/notice).

**Live:** [notify.pduam.dpdns.org](https://notify.pduam.dpdns.org)

---

## What It Does

Students subscribe with their email → when a new notice is posted on the college website, they receive an instant email alert. New notices are also broadcast to a Telegram channel. No login required, always free.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | [Next.js](https://nextjs.org) 16 (App Router) · Tailwind CSS |
| Scraper | [Node.js](https://nodejs.org) · [Cheerio](https://cheerio.js.org) |
| Email | Nodemailer · Gmail SMTP |
| Database | Google Sheets API |
| Automation | [GitHub Actions](https://github.com/features/actions) (cron every 30 min) |
| Hosting | [Vercel](https://vercel.com) |
| Notifications | Telegram Bot API |

---

## Features

- ✅ **Email subscription** with double opt-in verification
- ✅ **1-hour token expiry** with resend verification link
- ✅ **Telegram channel** broadcast for instant updates
- ✅ **SHA-256 dedup** — never sends duplicate alerts
- ✅ **One-click unsubscribe** via email link or web form
- ✅ **Live subscriber count** on homepage
- ✅ **Notice history** — full archive with search
- ✅ **Dark / Light theme** — auto-detects system preference
- ✅ **Rate limiting** — sliding window per IP
- ✅ **Anti-bot honeypot** — blocks spam subscriptions
- ✅ **Hashed IPs** — never stores plain IP addresses
- ✅ **Custom 404 page** + sitemap + robots.txt
- ✅ **Full SEO** — Open Graph, Twitter cards, canonical URLs

---

## How It Works

```
GitHub Actions (every 30 min)
        ↓
Fetch pduamamjonga.ac.in/notice HTML
        ↓
Parse notices with Cheerio
        ↓
SHA-256 hash each notice title+URL
        ↓
Compare hashes with Google Sheets history
        ↓
If new notices found:
  → Store in Google Sheets
  → Send branded HTML emails to verified subscribers
  → Post to Telegram channel
        ↓
Next.js frontend reads notices from Google Sheets
```

---

## Project Structure

```
pduam-notify/
├── .github/
│   └── workflows/
│       └── scrape.yml              ← GitHub Actions cron job
├── frontend/                       ← Next.js app (deployed to Vercel)
│   ├── app/
│   │   ├── layout.js               ← Root layout + full SEO metadata
│   │   ├── page.js                 ← Home (hero, subscribe, notices)
│   │   ├── not-found.js            ← Custom 404 page
│   │   ├── sitemap.js              ← Dynamic sitemap.xml
│   │   ├── globals.css             ← Design system (dark/light)
│   │   ├── api/
│   │   │   ├── subscribe/          ← POST: subscribe + send verification
│   │   │   ├── verify-email/       ← GET: verify email token
│   │   │   ├── resend-verification/← POST: resend 1-hour link
│   │   │   ├── unsubscribe/        ← POST/GET: unsubscribe
│   │   │   └── subscriber-count/   ← GET: live subscriber count
│   │   ├── notices/                ← Notice history page
│   │   ├── about/                  ← About page
│   │   ├── privacy-policy/         ← Privacy policy
│   │   ├── terms-of-service/       ← Terms of service
│   │   └── unsubscribe/            ← Unsubscribe form
│   ├── components/
│   │   ├── ThemeProvider.js        ← System theme detection + manual toggle
│   │   ├── Navbar.js               ← Sticky pill navbar
│   │   ├── Footer.js               ← Footer with tech links
│   │   ├── SubscribeForm.js        ← Email subscription form + modal
│   │   ├── NoticeList.js           ← Notice list with search
│   │   ├── LiveSubscriberCount.js  ← Animated live count
│   │   ├── AnimatedBell.js         ← Bell animation
│   │   └── PageTransition.js       ← Page enter animation
│   ├── lib/
│   │   ├── sheets.js               ← Google Sheets CRUD
│   │   ├── email.js                ← Email templates + Nodemailer
│   │   ├── crypto.js               ← SHA-256, tokens, hashing
│   │   ├── notices.js              ← Notice data reader
│   │   └── rate-limit.js           ← In-memory rate limiter
│   ├── public/
│   │   ├── icon.svg                ← Favicon
│   │   ├── og-image.png            ← Open Graph social preview
│   │   └── robots.txt              ← Search crawler config
│   └── next.config.js              ← Security headers, env loading
├── scraper/
│   ├── scrape.js                   ← Main scraper + email + Telegram
│   └── package.json
├── setup-guides/                   ← 📚 Step-by-step setup docs
│   ├── 01-google-sheets-setup.md
│   ├── 02-gmail-smtp-setup.md
│   ├── 03-environment-variables.md
│   ├── 04-telegram-setup.md
│   ├── 05-vercel-deployment.md
│   ├── 06-github-actions-setup.md
│   └── 07-local-development.md
├── .env.example                    ← Environment variable template
├── .gitignore
├── .gitattributes                  ← LF line endings (fixes Windows CRLF)
├── package.json                    ← Workspace root scripts
└── README.md
```

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/your-username/pduam-notify.git
cd pduam-notify
```

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Install & Run

```bash
cd frontend && npm install && npm run dev
# → http://localhost:3000
```

### 4. Run Scraper Once

```bash
cd scraper && npm install && node scrape.js
```

---

## Setup Guides

Full step-by-step instructions for each component:

| Guide | Description |
|---|---|
| [01 — Google Sheets Setup](./setup-guides/01-google-sheets-setup.md) | Create Service Account, Spreadsheet, share access |
| [02 — Gmail SMTP Setup](./setup-guides/02-gmail-smtp-setup.md) | Enable App Password for email sending |
| [03 — Environment Variables](./setup-guides/03-environment-variables.md) | Full reference for every variable |
| [04 — Telegram Setup](./setup-guides/04-telegram-setup.md) | Create bot, channel, get IDs |
| [05 — Vercel Deployment](./setup-guides/05-vercel-deployment.md) | Deploy frontend to Vercel |
| [06 — GitHub Actions](./setup-guides/06-github-actions-setup.md) | Configure secrets, cron, manual runs |
| [07 — Local Development](./setup-guides/07-local-development.md) | Run the full stack locally |

---

## Google Sheets Schema

### `subscribers`
| Column | Type | Description |
|---|---|---|
| `email` | string | Subscriber's email |
| `verified` | `"true"` / `"false"` | Email verified status |
| `subscribed_at` | ISO timestamp | Subscription time |
| `ip_hash` | string | SHA-256 hash of IP |
| `user_agent_hash` | string | SHA-256 hash of User-Agent |

### `notices`
| Column | Type | Description |
|---|---|---|
| `title` | string | Notice title |
| `url` | string | Direct URL to notice |
| `hash` | string | SHA-256 for dedup |
| `date` | string | Publish date |
| `detected_at` | ISO timestamp | When scraper found it |

### `verification_tokens`
| Column | Type | Description |
|---|---|---|
| `email` | string | Email to verify |
| `token` | string | 64-char hex token |
| `created_at` | ISO timestamp | Creation time |
| `expires_at` | ISO timestamp | Expires after **1 hour** |

### `unsubscribe_tokens`
| Column | Type | Description |
|---|---|---|
| `email` | string | Subscriber email |
| `token` | string | 64-char hex token |
| `created_at` | ISO timestamp | Creation time |
| `expires_at` | ISO timestamp | Expires after 7 days |

---

## Security

| Feature | Implementation |
|---|---|
| IP Hashing | SHA-256 with secret salt — no plain IPs stored |
| Rate Limiting | Sliding window: 5 req / 15 min per IP |
| Subscription Cooldown | 60-second cooldown between attempts |
| Honeypot | Hidden form field blocks bots |
| Double Opt-in | Email verification required before alerts |
| Token Expiry | Verification: 1h · Unsubscribe: 7d |
| Input Sanitization | HTML stripping, regex validation, length limits |
| Security Headers | X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Secrets | All credentials in env vars, never in code |

---

## Scalability

| Subscriber Count | Recommended Setup |
|---|---|
| < 500 | Google Sheets (current) — works perfectly |
| 500–5,000 | Migrate to Supabase or PlanetScale |
| 5,000+ | Dedicated email service (Resend, SendGrid) |
| High traffic | Add Upstash Redis for distributed rate limiting |

---

## License

MIT — freely adapt for any institution's notice board.
