# 🗂️ Google Sheets Setup Guide

This guide walks you through creating the Google Cloud Service Account and Google Spreadsheet required by PDUAM NOTIFY.

---

## Step 1 — Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown → **New Project**
3. Name it `pduam-notify` → **Create**

---

## Step 2 — Enable the Google Sheets API

1. In your project, navigate to **APIs & Services → Library**
2. Search for **"Google Sheets API"**
3. Click it → **Enable**

---

## Step 3 — Create a Service Account

1. Go to **IAM & Admin → Service Accounts**
2. Click **Create Service Account**
3. Fill in:
   - **Name:** `pduam-notify`
   - **ID:** auto-fills (leave as-is)
4. Skip optional permissions → **Done**

---

## Step 4 — Create a JSON Key

1. Click on the new service account → **Keys** tab
2. **Add Key → Create new key → JSON**
3. Download the `.json` file — keep it safe, you'll need it later

> ⚠️ Never commit this JSON file to Git. It's a private credential.

The key file looks like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n",
  "client_email": "pduam-notify@your-project-id.iam.gserviceaccount.com",
  ...
}
```

Note down the `client_email` — you'll use it to share the spreadsheet.

---

## Step 5 — Create the Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) → **Blank Spreadsheet**
2. Rename it to `PDUAM Notify Database`
3. Create **4 sheet tabs** by clicking `+` at the bottom:

### `subscribers` tab
| Column A | Column B | Column C | Column D | Column E |
|---|---|---|---|---|
| `email` | `verified` | `subscribed_at` | `ip_hash` | `user_agent_hash` |

### `notices` tab
| Column A | Column B | Column C | Column D | Column E |
|---|---|---|---|---|
| `title` | `url` | `hash` | `date` | `detected_at` |

### `verification_tokens` tab
| Column A | Column B | Column C | Column D |
|---|---|---|---|
| `email` | `token` | `created_at` | `expires_at` |

### `unsubscribe_tokens` tab
| Column A | Column B | Column C | Column D |
|---|---|---|---|
| `email` | `token` | `created_at` | `expires_at` |

> **Important:** Row 1 of each tab must be the header row exactly as shown above (case-sensitive).

---

## Step 6 — Share the Spreadsheet with the Service Account

1. Click **Share** (top-right of the spreadsheet)
2. Paste the `client_email` from your JSON key file
3. Set permission to **Editor**
4. Uncheck "Notify people" → **Share**

---

## Step 7 — Copy the Spreadsheet ID

Look at the URL of your spreadsheet:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
```
The long string between `/d/` and `/edit` is your **Spreadsheet ID**.

Copy it — this is your `GOOGLE_SHEET_ID` environment variable.

---

## Step 8 — Stringify the JSON Key

The `GOOGLE_SERVICE_JSON` environment variable must be a **single-line JSON string** (no line breaks).

**On Linux/macOS:**
```bash
cat your-key-file.json | tr -d '\n'
```

**On Windows PowerShell:**
```powershell
(Get-Content "your-key-file.json" -Raw) -replace "`r`n","\n" -replace "`n","\n"
```

**Or use an online tool:** Paste JSON into [jsonformatter.org](https://jsonformatter.org/json-stringify-online) → Stringify → copy the result.

> The value should start with `{"type":"service_account",...}` — all on one line.

---

## ✅ Checklist

- [ ] Google Sheets API enabled
- [ ] Service account created with JSON key downloaded
- [ ] Spreadsheet created with all 4 tabs + correct headers
- [ ] Spreadsheet shared (Editor) with service account email
- [ ] `GOOGLE_SHEET_ID` noted
- [ ] `GOOGLE_SERVICE_JSON` stringified and ready
