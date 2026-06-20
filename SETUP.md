# PDUAM Notify - Comprehensive Setup Guide

This guide details the complete end-to-end setup process for **PDUAM Notify**. Follow these steps to configure the Google Sheets database, Gmail SMTP mailer, Telegram Channel Bot, Cloudflare Worker API, Vercel Frontend, and GitHub Actions workflow.

---

## Table of Contents
1. [Google Sheets Database Setup](#1-google-sheets-database-setup)
2. [Gmail SMTP Email Mailer Setup](#2-gmail-smtp-email-mailer-setup)
3. [Telegram Bot & Channel Setup](#3-telegram-bot--channel-setup)
4. [Cloudflare Worker notice-service Setup](#4-cloudflare-worker-notice-service-setup)
5. [Vercel Frontend Deployment](#5-vercel-frontend-deployment)
6. [GitHub Actions Workflow Setup](#6-github-actions-workflow-setup)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Local Development](#8-local-development)

---

## 1. Google Sheets Database Setup

Instead of a database, PDUAM Notify uses a single Google Spreadsheet.

### Step 1: Create the Spreadsheet
1. Open [Google Sheets](https://sheets.google.com) and create a blank spreadsheet.
2. Create three sheets (tabs) with the exact names and column headers (row 1) as follows:
   * **`subscribers`**:
     * Column A: `email`
     * Column B: `verified`
     * Column C: `subscribed_at`
     * Column D: `ip_hash`
     * Column E: `user_agent_hash`
   * **`verification_tokens`**:
     * Column A: `email`
     * Column B: `token`
     * Column C: `created_at`
     * Column D: `expires_at`
   * **`unsubscribe_tokens`**:
     * Column A: `email`
     * Column B: `token`
     * Column C: `created_at`
     * Column D: `expires_at`
3. Copy the **Spreadsheet ID** from the browser URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

### Step 2: Create a Service Account
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `pduam-notify`).
3. Enable the **Google Sheets API** for the project.
4. Go to **IAM & Admin -> Service Accounts** and click **Create Service Account**.
5. Give it a name and click **Create**.
6. Once created, click on the service account, go to the **Keys** tab, click **Add Key -> Create new key**, select **JSON**, and click **Create**. Save this JSON file securely.
7. Open the JSON file and copy the `client_email` value.
8. Go back to your Google Spreadsheet, click **Share**, paste the service account email, assign it the **Editor** role, and click **Share**.

---

## 2. Gmail SMTP Email Mailer Setup

Email notifications are sent via Google's secure SMTP using a Gmail App Password.

1. Go to your [Google Account Settings](https://myaccount.google.com/).
2. Enable **2-Step Verification** under the Security tab.
3. Once enabled, search for **App Passwords** in the search bar.
4. Create a new App Password (name it `PDUAM Notify`).
5. Copy the generated **16-character code** (e.g., `xxxx xxxx xxxx xxxx`). Use this as `GMAIL_APP_PASSWORD`.

---

## 3. Telegram Bot & Channel Setup

Notice broadcasts are posted to a public Telegram channel.

1. Message `@BotFather` on Telegram and run `/newbot` to create your bot. Copy the **HTTP API Token** (`TELEGRAM_BOT_TOKEN`).
2. Create a new public Telegram channel.
3. Add your newly created bot as an **Administrator** in the channel with permissions to post messages.
4. Note your channel's username (including the `@` prefix, e.g., `@pduam_notices`). Use this as `TELEGRAM_CHANNEL_ID`.

---

## 4. Cloudflare Worker notice-service Setup

The worker acts as the scheduler for scraping and maintains Google Sheets. It is deployed under your `api.sonajit.in` repository (under `workers/notice-service`).

1. Open a terminal in your `api.sonajit.in` repository and navigate to `workers/notice-service`.
2. Configure local environment secrets inside `.dev.vars` (never committed to git):
   ```ini
   GITHUB_TOKEN="your_github_token_with_repo_write_permissions"
   GOOGLE_SERVICE_JSON='{"type":"service_account", ...}'
   GOOGLE_SHEET_ID="your_google_sheets_id"
   API_SECRET_KEY="dev-secret-key-123"
   ```
3. Upload these secrets securely to Cloudflare:
   ```bash
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler secret put GOOGLE_SERVICE_JSON
   npx wrangler secret put GOOGLE_SHEET_ID
   npx wrangler secret put API_SECRET_KEY
   ```
4. Deploy the worker to production:
   ```bash
   npm run deploy
   ```

---

## 5. Vercel Frontend Deployment

The Next.js user interface is deployed to Vercel.

1. Push your `pduam-notify` project code to a private GitHub repository.
2. Link the repository to [Vercel](https://vercel.com).
3. Configure the following environment variables in Vercel settings (Project Settings -> Environment Variables):
   * `GOOGLE_SERVICE_JSON` (Paste the entire stringified service account JSON)
   * `GOOGLE_SHEET_ID` (Your Google Sheets ID)
   * `HASH_SALT` (A random salt for hashing IPs, generate using `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`)
   * `API_URL` (Your deployed Cloudflare Worker API URL: `https://api.sonajit.in` or `https://api.sonajit.in/notices`)
   * `API_SECRET_KEY` (The private auth key matching your worker's secret)
   * `GMAIL_USER` (Your Gmail address)
   * `GMAIL_APP_PASSWORD` (Your 16-character Gmail App Password)
   * `CUSTOM_FROM_EMAIL` (Custom sender email, e.g., `notifications@yourdomain.com`)
   * `REPLY_TO_EMAIL` (Reply-to address, e.g., `contact@yourdomain.com`)
   * `NEXT_PUBLIC_SITE_URL` (Your Vercel site URL)
4. Trigger the deploy.

---

## 6. GitHub Actions Workflow Setup

When the Cloudflare Worker commits updates to `data/notices.json`, a push-triggered GitHub Action runs the notifier script:

1. Open your `pduam-notify` repository on GitHub.
2. Go to **Settings -> Secrets and variables -> Actions** and create the following Repository Secrets:
   * `GMAIL_USER` (Your Gmail address)
   * `GMAIL_APP_PASSWORD` (Your 16-character Gmail App Password)
   * `CUSTOM_FROM_EMAIL` (Custom sender email, e.g., `notifications@yourdomain.com`)
   * `REPLY_TO_EMAIL` (Reply-to address, e.g., `contact@yourdomain.com`)
   * `GOOGLE_SERVICE_JSON` (Google service account JSON)
   * `GOOGLE_SHEET_ID` (Your Spreadsheet ID)
   * `TELEGRAM_BOT_TOKEN` (Telegram Bot API Token)
   * `TELEGRAM_CHANNEL_ID` (Your Telegram Channel username)
   * `NEXT_PUBLIC_SITE_URL` (Your Vercel site URL)

The workflow (`.github/workflows/notify.yml`) will automatically run and send emails/Telegram alerts whenever `data/notices.json` changes.

---

## 7. Environment Variables Reference

| Variable Name | Required In | Description |
|---|---|---|
| `GMAIL_USER` | Actions, Vercel | Your Google account email address. |
| `GMAIL_APP_PASSWORD` | Actions, Vercel | 16-character Gmail app password. |
| `CUSTOM_FROM_EMAIL` | Actions, Vercel | The display sender address. |
| `REPLY_TO_EMAIL` | Actions, Vercel | The reply-to address for emails. |
| `GOOGLE_SHEET_ID` | Actions, Worker, Vercel | The ID of your Google Spreadsheet database. |
| `GOOGLE_SERVICE_JSON` | Actions, Worker, Vercel | Entire contents of Google JSON credentials file. |
| `HASH_SALT` | Vercel | Random hash salt used to hash subscriber IPs securely. |
| `TELEGRAM_BOT_TOKEN` | Actions | HTTP API bot token from `@BotFather`. |
| `TELEGRAM_CHANNEL_ID` | Actions | Channel username (e.g. `@pduam_notices`). |
| `API_URL` | Vercel | Deployed Cloudflare Worker base domain URL. |
| `API_SECRET_KEY` | Worker, Vercel | Private key used for API Authorization headers. |
| `NEXT_PUBLIC_SITE_URL` | Actions, Vercel | Your Vercel site URL. |

---

## 8. Local Development

To run the Next.js frontend locally:

1. Copy `.env.example` to `.env` in the root:
   ```bash
   cp .env.example .env
   ```
   Fill in all variables in `.env`.
2. Run the Next.js application:
   ```bash
   npm install
   npm run dev
   ```
   The site will be running at `http://localhost:3000`.
