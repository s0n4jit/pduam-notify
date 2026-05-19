# 🔔 PDUAM NOTIFY

Automated email notification platform for new notices from [PDUAM Amjonga](https://pduamamjonga.ac.in/notice).

**Stack:** Next.js (App Router) · Tailwind CSS · GitHub Actions · Axios + Cheerio · Nodemailer · Google Sheets · Vercel

---

## Features

- ✅ **Email Subscription** with verification flow
- ✅ **SHA256 Duplicate Detection** — never sends duplicate alerts
- ✅ **Automated Monitoring** — checks every 30 minutes via GitHub Actions
- ✅ **Email Verification** — double opt-in to prevent spam
- ✅ **One-Click Unsubscribe** — via email link or web form
- ✅ **Google Sheets Database** — lightweight, free, zero-maintenance storage
- ✅ **Dark/Light Theme** — with system preference detection
- ✅ **Notice History** — browse full archive of detected notices
- ✅ **Rate Limiting** — prevents API abuse
- ✅ **Anti-Bot Protection** — honeypot field blocks spam subscriptions
- ✅ **Security First** — hashed IPs, CSRF protection, input sanitization
- ✅ **Mobile Responsive** — works on all screen sizes
- ✅ **Privacy & Terms** pages included

---

## How It Works

```
GitHub Actions (every 30 min)
        ↓
Fetch pduamamjonga.ac.in/notice HTML
        ↓
Parse notices with Cheerio
        ↓
Generate SHA256 hash for each notice
        ↓
Compare with hashes in Google Sheets
        ↓
If new notices found:
  → Store in Google Sheets
  → Generate per-subscriber unsubscribe tokens
  → Send branded HTML emails via Gmail SMTP
        ↓
Next.js frontend reads from Google Sheets API
```

---

## Project Structure

```
pduam-notify/
├── .github/
│   └── workflows/
│       └── scrape.yml              ← GitHub Actions cron job
├── frontend/
│   ├── app/
│   │   ├── layout.js               ← Root layout (theme, navbar, footer)
│   │   ├── page.js                 ← Home page (hero, subscribe, notices)
│   │   ├── globals.css             ← Design system (dark/light themes)
│   │   ├── api/
│   │   │   ├── subscribe/route.js  ← POST: subscribe with verification
│   │   │   ├── verify-email/route.js ← GET: verify email token
│   │   │   ├── unsubscribe/route.js ← POST/GET: unsubscribe
│   │   │   └── latest-notices/route.js ← GET: fetch notices
│   │   ├── notices/page.js         ← Notice history page
│   │   ├── unsubscribe/page.js     ← Unsubscribe form page
│   │   ├── privacy/page.js         ← Privacy policy
│   │   └── terms/page.js           ← Terms of service
│   ├── components/
│   │   ├── ThemeProvider.js        ← Dark/light theme context
│   │   ├── Navbar.js               ← Navigation bar
│   │   ├── Footer.js               ← Footer with links
│   │   ├── SubscribeForm.js        ← Email subscription form
│   │   ├── NoticeList.js           ← Notice list with search
│   │   └── Toast.js                ← Toast notification system
│   ├── lib/
│   │   ├── sheets.js               ← Google Sheets CRUD operations
│   │   ├── email.js                ← Email templates + Nodemailer
│   │   ├── crypto.js               ← SHA256, tokens, sanitization
│   │   └── rate-limit.js           ← In-memory rate limiter
│   ├── next.config.js              ← Security headers, CORS
│   ├── tailwind.config.js          ← Theme config
│   ├── postcss.config.js
│   ├── jsconfig.json               ← Path aliases
│   └── package.json
├── scraper/
│   ├── scrape.js                   ← Main scraper + notifier
│   └── package.json
├── vercel.json                     ← Vercel deployment config
├── .env.example                    ← Environment variable template
├── .gitignore
├── package.json                    ← Workspace root
└── README.md
```

---

## Setup Guide

### 1. Clone and Install

```bash
git clone https://github.com/your-username/pduam-notify.git
cd pduam-notify
cd frontend && npm install
cd ../scraper && npm install
```

### 2. Set Up Google Sheets

#### Create a Google Cloud Service Account:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Sheets API**:
   - Navigate to **APIs & Services → Library**
   - Search for "Google Sheets API" → Enable it
4. Create a **Service Account**:
   - Go to **IAM & Admin → Service Accounts**
   - Click **Create Service Account**
   - Name it `pduam-notify`
   - Skip optional permissions
   - Click **Done**
5. Create a **JSON Key**:
   - Click on the service account → **Keys** tab
   - **Add Key → Create new key → JSON**
   - Download the JSON file

#### Create the Google Spreadsheet:

1. Go to [Google Sheets](https://sheets.google.com) → Create new spreadsheet
2. Name it `PDUAM Notify Database`
3. Create **4 sheet tabs** (at the bottom):

| Sheet Name | Column Headers (Row 1) |
|---|---|
| `subscribers` | `email`, `verified`, `subscribed_at`, `ip_hash`, `user_agent_hash` |
| `notices` | `title`, `url`, `hash`, `date`, `detected_at` |
| `verification_tokens` | `email`, `token`, `created_at`, `expires_at` |
| `unsubscribe_tokens` | `email`, `token`, `created_at`, `expires_at` |

4. **Share the spreadsheet** with the service account email (found in the JSON key file, e.g., `pduam-notify@project-id.iam.gserviceaccount.com`) → Give **Editor** access.

5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_SHEET_ID]/edit
   ```

### 3. Set Up Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (required)
3. Search for **"App passwords"** in account settings
4. Create one → Name it `pduam-notify`
5. Copy the 16-character password

### 4. Configure Environment Variables

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

**For Vercel** (frontend):

| Variable | Description |
|---|---|
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | 16-char App Password |
| `GOOGLE_SHEET_ID` | Spreadsheet ID from step 2.5 |
| `GOOGLE_SERVICE_JSON` | Stringified JSON of service account key |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL |
| `HASH_SALT` | Random string for IP hashing |

**For GitHub Secrets** (scraper):

Same variables as above. Add them in:
- Repository → **Settings → Secrets and variables → Actions → New repository secret**

### 5. Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Add all environment variables from step 4
6. Deploy

### 6. Enable GitHub Actions

The workflow runs automatically every 30 minutes after being pushed to the `main` branch.

**Manual test:** Repository → **Actions** → **PDUAM Notice Scraper** → **Run workflow**

---

## Local Development

```bash
# Create .env file in frontend directory
cp .env.example frontend/.env

# Also create .env in scraper directory
cp .env.example scraper/.env

# Run frontend
cd frontend && npm run dev
# → http://localhost:3000

# Run scraper manually
cd scraper && node scrape.js
```

---

## Google Sheets Schema

### `subscribers`
| Column | Type | Description |
|---|---|---|
| `email` | string | Subscriber's email address |
| `verified` | string | `"true"` or `"false"` |
| `subscribed_at` | ISO timestamp | When they subscribed |
| `ip_hash` | string | SHA256 hash of IP (never plain IP) |
| `user_agent_hash` | string | SHA256 hash of User-Agent |

### `notices`
| Column | Type | Description |
|---|---|---|
| `title` | string | Notice title |
| `url` | string | Direct URL to notice/PDF |
| `hash` | string | SHA256 hash for dedup |
| `date` | string | Publish date (YYYY-MM-DD) |
| `detected_at` | ISO timestamp | When scraper detected it |

### `verification_tokens`
| Column | Type | Description |
|---|---|---|
| `email` | string | Email to verify |
| `token` | string | 64-char hex token |
| `created_at` | ISO timestamp | Token creation time |
| `expires_at` | ISO timestamp | Expires after 24 hours |

### `unsubscribe_tokens`
| Column | Type | Description |
|---|---|---|
| `email` | string | Subscriber email |
| `token` | string | 64-char hex token |
| `created_at` | ISO timestamp | Token creation time |
| `expires_at` | ISO timestamp | Expires after 7 days |

---

## Security Features

| Feature | Implementation |
|---|---|
| **IP Hashing** | SHA-256 with secret salt — never stores plain IPs |
| **Rate Limiting** | Sliding window per IP (5 requests / 15 min) |
| **Subscription Cooldown** | 60-second cooldown between attempts |
| **Honeypot Anti-Bot** | Hidden form field catches automated submissions |
| **Email Verification** | Double opt-in — must click verification link |
| **Input Sanitization** | HTML stripping, email validation, length limits |
| **Security Headers** | X-Frame-Options, CSP, X-Content-Type-Options |
| **CORS Policy** | Restricted to site URL |
| **Token Expiry** | Verification: 24h, Unsubscribe: 7d |
| **Secret Management** | All secrets in env vars, never in code |

---

## Customization

### Change scrape frequency
Edit `.github/workflows/scrape.yml`:
```yaml
- cron: "*/30 * * * *"   # every 30 min (default)
- cron: "*/15 * * * *"   # every 15 min
- cron: "0 * * * *"      # every hour
```

> **Note:** GitHub free tier minimum is 5 minutes. Actual execution may be delayed.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Emails not sending | Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` in secrets |
| Google Sheets 403 | Ensure spreadsheet is shared with service account email |
| "Invalid credentials" | Re-stringify JSON key — must be single-line, no line breaks |
| Action not running | Check Actions are enabled in repo → Settings → Actions |
| Frontend shows no notices | Run scraper at least once to populate Google Sheets |
| Rate limited | Wait 15 minutes, or test from a different IP |
| Verification email missing | Check spam folder; ensure Gmail App Password is correct |

---

## Scalability Recommendations

- **Under 500 subscribers:** Google Sheets works perfectly
- **500-5000 subscribers:** Consider Supabase or PlanetScale
- **5000+ subscribers:** Use a dedicated email service (SendGrid, Resend)
- **High traffic:** Add Redis for rate limiting (Upstash)
- **Better scraping:** Add Puppeteer for JavaScript-rendered pages

---

## License

MIT — feel free to adapt for any college notice board.
