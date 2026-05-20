# ⚙️ GitHub Actions Setup Guide

PDUAM NOTIFY uses GitHub Actions to run the scraper on a schedule and send alerts.

---

## How It Works

```
Every 30 minutes (cron) → GitHub Actions runner → scraper/scrape.js
  → Fetches pduamamjonga.ac.in/notice
  → Detects new notices via SHA-256 dedup
  → Sends emails + Telegram message
  → Updates Google Sheets
```

---

## Step 1 — Enable Actions

Repository → **Settings → Actions → General** → **Allow all actions** → Save

---

## Step 2 — Add Repository Secrets

Repository → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|---|---|
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | 16-char App Password |
| `GOOGLE_SHEET_ID` | Google Spreadsheet ID |
| `GOOGLE_SERVICE_JSON` | Stringified JSON key (one line) |
| `NEXT_PUBLIC_SITE_URL` | `https://notify-pduam.vercel.app` |
| `HASH_SALT` | Random secret string |
| `TELEGRAM_BOT_TOKEN` | *(optional)* |
| `TELEGRAM_CHANNEL_ID` | *(optional)* |

---

## Step 3 — Manual Test Run

Repository → **Actions** → **PDUAM Notice Scraper** → **Run workflow** → **Run workflow**

Watch logs in real-time. A successful run shows:
```
✓ 2 new notices detected
✓ Email sent to subscriber@example.com
✓ Telegram message sent
✓ Google Sheets updated
```

---

## Changing Schedule

Edit `.github/workflows/scrape.yml`:
```yaml
on:
  schedule:
    - cron: "*/30 * * * *"   # every 30 min (default)
    # - cron: "0 * * * *"    # every hour
  workflow_dispatch:           # keeps manual trigger
```

> GitHub free tier minimum is 5 minutes. Runs may be delayed by up to 15 minutes.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Workflow not running | Check Actions are enabled in Settings |
| `GOOGLE_SERVICE_JSON` error | Re-stringify — must be one line |
| Gmail auth failed | Regenerate the App Password |
| No emails sent | Ensure at least one verified subscriber exists |
| Sheets 403 error | Re-share spreadsheet with service account email |

---

## ✅ Checklist

- [ ] Actions enabled
- [ ] All secrets added
- [ ] Manual test run succeeded
- [ ] Emails received by test subscriber
- [ ] Cron schedule running
