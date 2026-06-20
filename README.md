# 🔔 PDUAM NOTIFY v3

> Automated email & Telegram notification platform for college notices from [Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga](https://pduamamjonga.ac.in/notice).

**Live:** [notify-pduam.vercel.app](https://notify-pduam.vercel.app/)

---

## What It Does (v3 Architecture)

PDUAM Notify v3 separates concerns between scraping scheduler, database storage, and notifications:

```
Cloudflare Cron (every 5 min)
        ↓
Scrapes notice board HTML & compares hashes
        ↓
If new notices are detected:
  → Worker commits updates directly to GitHub data/notices.json
        ↓
GitHub Actions (triggered instantly on push to data/notices.json)
        ↓
Runs scraper/notify.js
  → Performs git diff (HEAD vs HEAD~1) to extract new notices
  → Reads subscribers from Google Sheets
  → Sends branded HTML emails (Gmail SMTP)
  → Sends Telegram alert to channel
        ↓
Next.js Frontend (Vercel)
  → Fetches notices and subscriber stats from private Cloudflare Worker API (api.sonajit.in)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Next.js](https://nextjs.org) 16 (App Router) · Tailwind CSS |
| API & Scraper | [Cloudflare Workers](https://workers.cloudflare.com) (Deployed at `api.sonajit.in`) |
| DB / Storage | GitHub Repository (`data/notices.json`) · Google Sheets (Subscribers) |
| Email Delivery | Nodemailer · Gmail SMTP (runs inside GitHub Actions) |
| Broadcast | Telegram Bot API |

---

## Project Structure

```
pduam-notify/
├── .github/
│   └── workflows/
│       └── notify.yml              ← GitHub Actions triggered on push to notices.json
├── data/
│   └── notices.json                ← JSON file acting as notices database
├── app/                            ← Next.js App Router pages
│   ├── layout.js                   ← Root layout + full SEO metadata
│   ├── page.js                     ← Home (hero, subscribe, notices via API)
│   ├── not-found.js                ← Custom 404 page
│   ├── sitemap.js                  ← Dynamic sitemap.xml
│   ├── globals.css                 ← Design system (dark/light)
│   ├── api/
│   │   ├── subscribe/              ← POST: subscribe + send verification
│   │   ├── verify-email/           ← GET: verify email token
│   │   ├── resend-verification/    ← POST: resend 1-hour link
│   │   ├── unsubscribe/            ← POST/GET: unsubscribe
│   │   └── subscriber-count/       ← GET: live subscriber count (proxies Worker API)
│   └── notices/                    ← Notice history page (fetches Worker API)
├── components/                     ← React components
│   ├── ThemeProvider.js            ← System theme detection + manual toggle
│   ├── Navbar.js                   ← Sticky pill navbar
│   ├── SubscribeForm.js            ← Email subscription form + modal
│   ├── NoticeList.js               ← Notice list with search
│   └── LiveSubscriberCount.js      ← Animated live count
├── lib/                            ← Services and helper libraries
│   ├── sheets.js                   ← Google Sheets CRUD
│   ├── email.js                    ← Email templates + Nodemailer
│   ├── crypto.js                   ← SHA-256, tokens, hashing
│   └── notices.js                  ← Notice API fetcher client
├── scripts/
│   └── notify.js                   ← Notification dispatcher (runs inside GitHub Actions)
├── .env.example                    ← Environment variable template
├── .gitignore
├── package.json                    ← Unified scripts & dependencies
├── SETUP.md                        ← 📚 Comprehensive Setup Guide
└── README.md
```

For full installation and deployment steps, please read the [SETUP.md](./SETUP.md) guide.

---

## Setup & Local Development

### 1. Clone

```bash
git clone https://github.com/your-username/pduam-notify.git
cd pduam-notify
```

### 2. Configure Environment
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Fill in all variables including `API_URL` (points to your Cloudflare Worker) and `API_SECRET_KEY` (secret key shared between Vercel and the Worker).

To test locally with Vercel/Next.js:
1. Copy the `.env` to `frontend/.env.local`:
   ```bash
   cp .env frontend/.env.local
   ```
2. Run Next.js:
   ```bash
   cd frontend && npm install && npm run dev
   ```

### 3. Run Notifications Locally
If you want to manually run a notification test using Git changes:
```bash
cd scraper && npm install && node notify.js
```

---

## License

MIT — freely adapt for any institution's notice board.
