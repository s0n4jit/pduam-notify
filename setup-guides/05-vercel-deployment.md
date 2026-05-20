# 🚀 Vercel Deployment Guide

This guide covers deploying the PDUAM NOTIFY frontend to Vercel.

---

## Prerequisites

- GitHub account with the repository pushed
- [Vercel account](https://vercel.com) (free tier is sufficient)
- All environment variables ready (see [03-environment-variables.md](./03-environment-variables.md))

---

## Step 1 — Push Code to GitHub

```bash
cd pduam-notify
git add .
git commit -m "Initial setup"
git push origin main
```

---

## Step 2 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Connect your GitHub account if not already connected
4. Find `pduam-notify` → **Import**

---

## Step 3 — Configure Root Directory

> ⚠️ This is critical. Without this, Vercel won't detect Next.js.

In the **Configure Project** screen:
1. Expand **Root Directory**
2. Click **Edit** → type `frontend`
3. Vercel will now auto-detect **Next.js** and set correct build commands

Leave **Build Command** and **Output Directory** as auto-detected (blank).

---

## Step 4 — Add Environment Variables

In the **Configure Project** screen, scroll to **Environment Variables**:

| Name | Value | Environment |
|---|---|---|
| `GMAIL_USER` | `your-gmail@gmail.com` | Production, Preview, Development |
| `GMAIL_APP_PASSWORD` | `your16charpassword` | Production, Preview, Development |
| `GOOGLE_SHEET_ID` | `your_sheet_id` | Production, Preview, Development |
| `GOOGLE_SERVICE_JSON` | `{"type":"service_account",...}` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://notify-pduam.vercel.app` | Production |
| `HASH_SALT` | `your-random-secret` | Production, Preview, Development |
| `CUSTOM_FROM_EMAIL` | *(optional)* | Production |
| `REPLY_TO_EMAIL` | *(optional)* | Production |

> For `NEXT_PUBLIC_SITE_URL` in Preview environments, use the Vercel preview URL or leave blank to use `localhost`.

---

## Step 5 — Deploy

Click **Deploy**. Vercel will:
1. Clone the `frontend/` directory
2. Run `npm install`
3. Run `npm run build` (Next.js build)
4. Deploy to a `.vercel.app` URL

First deployment takes ~2 minutes.

---

## Step 6 — Add Custom Domain (Optional)

1. In your project dashboard → **Settings → Domains**
2. Add your domain (e.g., `notify-pduam.vercel.app`)
3. Follow the DNS instructions to add a **CNAME** record pointing to `cname.vercel-dns.com`

## Step 7 — Enable Vercel Analytics & Speed Insights (Optional but Recommended)

PDUAM NOTIFY comes pre-configured with Vercel Web Analytics and Speed Insights to track real-time traffic, visitor demographics, and page performance without compromising user privacy.

To enable them:
1. In your Vercel project dashboard, click on the **Analytics** tab at the top.
2. Click **Enable** to turn on Web Analytics.
3. Next, click on the **Speed Insights** tab at the top.
4. Click **Enable** to turn on real-time Core Web Vitals monitoring.
5. Once enabled, Vercel will automatically start collecting anonymized data from users visiting your site!

---

## Redeployment

Every `git push` to the `main` branch automatically triggers a new Vercel deployment.

To manually redeploy:
- Vercel Dashboard → **Deployments** → **Redeploy**

---

## Environment Variables After Deployment

To update variables after initial deployment:
1. Vercel Dashboard → Project → **Settings → Environment Variables**
2. Add or edit variables → **Save**
3. Go to **Deployments** → **Redeploy** to apply changes

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails with "Module not found" | Ensure Root Directory is set to `frontend` |
| API routes return 500 | Check environment variables are correctly set |
| `GOOGLE_SERVICE_JSON` parse error | Ensure it's a single-line JSON string (no line breaks) |
| Emails not sending on production | Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` in Vercel env vars |
| OG image 404 | Confirm `og-image.png` is in `frontend/public/` |
| Custom domain not working | Check DNS propagation (can take up to 48 hours) |

---

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked
- [ ] Root Directory set to `frontend`
- [ ] All environment variables added
- [ ] Deployment successful
- [ ] Custom domain configured (optional)
- [ ] Vercel Analytics & Speed Insights enabled in dashboard (optional)
