# 🔔 PDUAM NOTIFY (v3.0.0)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&logoColor=white)](https://notify-pduam.vercel.app/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Active-orange?logo=cloudflare&logoColor=white)](https://api.sonajit.in/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **PDUAM Notify** is an automated, high-performance notification platform designed to monitor the official notice board of [Pandit Deendayal Upadhyaya Adarsha Mahavidyalaya, Amjonga](https://pduamamjonga.ac.in/notice) and immediately broadcast new announcements to subscribers via email and Telegram.

---

## 🌟 Key Features

*   **Serverless Notice Scraper:** Periodically checks the college notice board HTML using Cloudflare Workers (every 5 minutes) with zero maintenance overhead.
*   **Git-backed Version Control:** Uses `data/notices.json` inside this repository as a flat-file database to track notices and hashes.
*   **Opt-in Subscriber Verification:** Clean, secure subscriber verification flow to eliminate spam and invalid sign-ups.
*   **SMTP Email Broadcasts:** Automatically fires beautifully styled HTML email notifications to verified subscribers.
*   **Telegram Channel Broadcasts:** Sends instant notification updates to the official Telegram channel.
*   **Sleek Modern Frontend:** An elegant, responsive web interface built with Next.js featuring light/dark themes, notice searching, and live subscriber statistics.

---

## ⚙️ Architecture

```
                       ┌─────────────────────────────────────┐
                       │   Cloudflare Workers (Notice Cron)   │
                       └──────────────────┬──────────────────┘
                                          │ Scrapes notice board HTML & checks hashes
                                          ▼
                       ┌─────────────────────────────────────┐
                       │ Commit updates to data/notices.json │
                       └──────────────────┬──────────────────┘
                                          │ Triggers GitHub Actions workflow
                                          ▼
                       ┌─────────────────────────────────────┐
                       │   GitHub Actions (scripts/notify)   │
                       └──────────────────┬──────────────────┘
                                          ├─► Reads verified subs from Google Sheets
                                          ├─► Broadcasts HTML emails via Gmail SMTP
                                          └─► Broadcasts message to Telegram Channel
```

---

## 🛠️ Tech Stack

*   **Web App:** Next.js 16 (App Router), React 19, Tailwind CSS (Glassmorphic design system)
*   **API & Scheduler:** Cloudflare Workers (Private API with bearer token authentication)
*   **Storage & database:** GitHub Repository (`data/notices.json`) & Google Sheets API
*   **Notification Agents:** Nodemailer (Gmail SMTP) & Telegram Bot API

---

## 📂 Project Structure

```
pduam-notify/
├── .github/
│   └── workflows/
│       └── notify.yml          # GitHub Actions notifier (runs on data/notices.json pushes)
├── app/                        # Next.js App Router (pages & components)
│   ├── api/                    # Serverless Next.js API routes (verification, unsubscribe, stats)
│   ├── notices/                # Notices history and search archive
│   ├── globals.css             # Light/dark responsive theme variables
│   └── layout.js               # Global layouts and SEO metadata
├── components/                 # Reusable UI elements (animated bell, pill nav, forms)
├── data/
│   └── notices.json            # flat-file notice repository (updated by Worker)
├── lib/                        # Utility services (Google Sheets integration, Nodemailer configuration)
├── scripts/
│   ├── notify.js               # Core notification dispatcher script
│   └── generate-secret.py      # Cryptographically secure random API secret generator
├── SETUP.md                    # Detailed deployment & operations manual
├── next.config.js              # Next.js build-time config
└── package.json                # Single root project configurations
```

---

## 🚀 Setup & Local Development

Please refer to the comprehensive [SETUP.md](./SETUP.md) for full step-by-step deployment instructions for Vercel, Google Sheets, Gmail SMTP, and Cloudflare Workers.

### Quick Start (Local Run)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/pduam-notify.git
    cd pduam-notify
    ```

2.  **Configure environment variables:**
    Copy `.env.example` to `.env` in the root:
    ```bash
    cp .env.example .env
    ```
    Fill in the credentials according to [SETUP.md](./SETUP.md).

3.  **Install dependencies and run Next.js locally:**
    ```bash
    npm install
    npm run dev
    ```

4.  **Run notifications locally (for testing):**
    Ensure your `.env` contains local Gmail and Sheets credentials, then run:
    ```bash
    node scripts/notify.js
    ```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE). Feel free to adapt and deploy this for any educational institution.
