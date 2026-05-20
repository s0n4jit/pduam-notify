# 🔑 Environment Variables Reference

All configuration for PDUAM NOTIFY lives in environment variables. This file documents every variable, its purpose, where to get the value, and which components use it.

---

## Quick Setup

**Local development:** Create a `.env` file in the project root:
```bash
cp .env.example .env
# Then fill in each value
```

**Production (Vercel):** Add each variable in  
Vercel Dashboard → Project → Settings → Environment Variables

**GitHub Actions (scraper):** Add each variable in  
Repository → Settings → Secrets and variables → Actions → New repository secret

---

## All Variables

### 🔴 Required — Core

| Variable | Example | Description |
|---|---|---|
| `GMAIL_USER` | `pduamnotify@gmail.com` | Gmail address used as SMTP sender |
| `GMAIL_APP_PASSWORD` | `abcdefghijklmnop` | 16-char Gmail App Password (no spaces) |
| `GOOGLE_SHEET_ID` | `1BxiMVs0XRA5nFM...` | ID from the Google Sheets URL |
| `GOOGLE_SERVICE_JSON` | `{"type":"service_account",...}` | Stringified service account JSON key |
| `NEXT_PUBLIC_SITE_URL` | `https://notify-pduam.vercel.app` | Full URL of the deployed site (no trailing slash) |
| `HASH_SALT` | `any-random-secret-string` | Secret salt for SHA-256 IP hashing |

---

### 🟡 Optional — Email Branding

| Variable | Default | Description |
|---|---|---|
| `CUSTOM_FROM_EMAIL` | `GMAIL_USER` | Display sender address (can be custom domain) |
| `REPLY_TO_EMAIL` | `GMAIL_USER` | Reply-to address shown to recipients |

---

### 🟢 Optional — Telegram Integration

| Variable | Example | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | `7012345678:AAHxxx...` | Bot token from @BotFather |
| `TELEGRAM_CHANNEL_ID` | `@pduam_notices` or `-1001234567890` | Channel username or numeric ID |

See [03-telegram-setup.md](./03-telegram-setup.md) for how to get these.

---

## Variable Details

### `GOOGLE_SERVICE_JSON`
Must be the **entire JSON key file**, stringified to a single line.

❌ Wrong (multi-line):
```
{
  "type": "service_account",
  ...
}
```

✅ Correct (single line):
```
{"type":"service_account","project_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\nMIIE..."}
```

See [01-google-sheets-setup.md](./01-google-sheets-setup.md) for how to stringify it.

---

### `HASH_SALT`
Any random string. Used as a salt when hashing IP addresses.

Generate one:
```bash
# Linux/macOS
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### `NEXT_PUBLIC_SITE_URL`
- Used to build absolute URLs for email links (verify, unsubscribe)
- Must **not** have a trailing slash
- During local dev: `http://localhost:3000`
- Production: `https://notify-pduam.vercel.app`

---

## `.env.example` Template

```env
# ── Core (Required) ────────────────────────────────────────────────────────────
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your16charpassword

GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_JSON={"type":"service_account","project_id":"..."}

NEXT_PUBLIC_SITE_URL=https://notify-pduam.vercel.app
HASH_SALT=generate-a-random-secret-here

# ── Optional: Email Branding ───────────────────────────────────────────────────
CUSTOM_FROM_EMAIL=notices@yourdomain.com
REPLY_TO_EMAIL=hello@yourdomain.com

# ── Optional: Telegram ─────────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=@your_channel
```

---

## Which Component Uses What

| Component | Variables Used |
|---|---|
| `frontend/app/api/subscribe` | `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_JSON`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, `HASH_SALT` |
| `frontend/app/api/verify-email` | `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_JSON`, `NEXT_PUBLIC_SITE_URL` |
| `frontend/app/api/unsubscribe` | `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_JSON` |
| `frontend/app/api/subscriber-count` | `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_JSON` |
| `scraper/scrape.js` | All of the above + `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` |
