# 💻 Local Development Guide

---

## Prerequisites

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **Git**
- All environment variables configured (see [03-environment-variables.md](./03-environment-variables.md))

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/pduam-notify.git
cd pduam-notify
```

---

## Step 2 — Create the `.env` File

```bash
cp .env.example .env
```

Open `.env` and fill in all values. For local dev, set:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 3 — Install Dependencies

```bash
# Frontend
cd frontend && npm install && cd ..

# Scraper
cd scraper && npm install && cd ..

# Or from root (runs both)
npm run install:all
```

---

## Step 4 — Run the Frontend

```bash
npm run dev
# or
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5 — Run the Scraper Manually

```bash
npm run scrape
# or
cd scraper && node scrape.js
```

This will:
1. Fetch the college notice board
2. Detect new notices
3. Send email alerts to verified subscribers
4. Update Google Sheets

---

## Project Scripts (Root `package.json`)

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build Next.js for production |
| `npm run start` | Start production server |
| `npm run scrape` | Run the scraper once |
| `npm run install:all` | Install all workspace dependencies |

---

## Hot Reload

The frontend supports hot reload — changes to `frontend/` are reflected instantly in the browser without restart.

The scraper is a one-shot Node.js script — re-run it manually each time.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port 3000 in use | `npx kill-port 3000` or use `npm run dev -- -p 3001` |
| Google Sheets auth error | Check `GOOGLE_SERVICE_JSON` is valid JSON in `.env` |
| No notices showing | Run the scraper once to populate Sheets |
| Email not sending locally | Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` |
| Module not found | Run `npm install` in the correct directory |
