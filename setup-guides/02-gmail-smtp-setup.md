# 📧 Gmail SMTP Setup Guide

PDUAM NOTIFY sends emails via Gmail SMTP using an **App Password** — a 16-character code that allows the app to send email without using your real password.

---

## Prerequisites

- A Gmail account dedicated to sending notices (e.g., `pduamnotify@gmail.com`)
- 2-Step Verification must be enabled (required by Google for App Passwords)

---

## Step 1 — Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under **"How you sign in to Google"**, click **2-Step Verification**
3. Follow the setup wizard → **Turn On**

---

## Step 2 — Create an App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   *(You must be signed in and have 2FA enabled to see this page)*
2. In the **"App name"** field, type `pduam-notify`
3. Click **Create**
4. Google shows a **16-character password** (e.g., `abcd efgh ijkl mnop`)
5. Copy it immediately — it's only shown once

> ⚠️ Remove the spaces when saving. Store: `abcdefghijklmnop`

---

## Step 3 — Set the Environment Variables

| Variable | Value |
|---|---|
| `GMAIL_USER` | Your Gmail address (e.g., `pduamnotify@gmail.com`) |
| `GMAIL_APP_PASSWORD` | The 16-character App Password (no spaces) |
| `CUSTOM_FROM_EMAIL` | *(optional)* Display sender address (e.g., `notices@yourdomain.com`) |
| `REPLY_TO_EMAIL` | *(optional)* Reply-to address (e.g., `hello@yourdomain.com`) |

---

## How the Email Sender Works

```
From: "PDUAM Notice Alerts" <notices@yourdomain.com>  ← CUSTOM_FROM_EMAIL
Sender: pduamnotify@gmail.com                          ← GMAIL_USER (actual SMTP sender)
Reply-To: hello@yourdomain.com                        ← REPLY_TO_EMAIL
```

If `CUSTOM_FROM_EMAIL` is not set, it falls back to `GMAIL_USER`.

---

## Gmail Sending Limits

| Plan | Daily Limit |
|---|---|
| Free Gmail | 500 emails/day |
| Google Workspace | 2,000 emails/day |

For a college notice service with ~200 subscribers, the free Gmail limit is more than sufficient.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Invalid login` error | Ensure 2FA is enabled and App Password is correct |
| Emails going to spam | Use a custom domain via `CUSTOM_FROM_EMAIL` |
| `Username and Password not accepted` | Re-generate the App Password — old ones don't work after reset |
| Emails not arriving | Check recipient's spam/junk folder first |

---

## ✅ Checklist

- [ ] Gmail account created/chosen for sending
- [ ] 2-Step Verification enabled
- [ ] App Password generated and copied
- [ ] `GMAIL_USER` set in environment variables
- [ ] `GMAIL_APP_PASSWORD` set (no spaces, 16 chars)
