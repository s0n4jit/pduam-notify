# 📱 Telegram Channel Setup Guide

PDUAM NOTIFY can broadcast new notices to a Telegram channel the moment they're detected, in addition to email alerts.

---

## Step 1 — Create a Telegram Channel

1. Open Telegram → tap the **pencil / compose** icon
2. Select **New Channel**
3. Set a name (e.g., `PDUAM NOTIFY`) and description
4. Choose **Public** channel
5. Set a username (e.g., `@pduam_notices`) — this is your `TELEGRAM_CHANNEL_ID`

---

## Step 2 — Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name: `PDUAM NOTIFY Bot`
4. Choose a username (must end in `bot`): `pduam_notify_bot`
5. BotFather replies with a **token** like:
   ```
   7012345678:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   This is your `TELEGRAM_BOT_TOKEN`.

---

## Step 3 — Add the Bot to Your Channel

1. Open your channel → tap the channel name → **Administrators**
2. **Add Administrator** → search for your bot username → select it
3. Enable **Post Messages** permission → **Save**

---

## Step 4 — Get the Channel ID (for private channels)

For **public channels**, you can use the username directly:
```
TELEGRAM_CHANNEL_ID=@pduam_notices
```

For **private channels**, you need the numeric ID:
1. Forward a message from the private channel to [@userinfobot](https://t.me/userinfobot)
2. It will reply with the channel ID (e.g., `-1001234567890`)
```
TELEGRAM_CHANNEL_ID=-1001234567890
```

---

## Step 5 — Set Environment Variables

| Variable | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | The token from BotFather |
| `TELEGRAM_CHANNEL_ID` | `@username` or `-1001234567890` |

---

## How It Works

When the scraper detects new notices, it sends a formatted message to the channel:

```
🔔 *2 New Notice(s) from PDUAM Amjonga*

📋 *Merit list-2 for admission into HS First Year*
🔗 View Notice

📋 *Notice regarding BA & BSc Fourth Semester Examination 2026*
📅 2026-05-19 | 🔗 View Notice
```

---

## Testing

After setting the variables, run the scraper manually:
```bash
cd scraper
node scrape.js
```

Or trigger the GitHub Actions workflow manually from the **Actions** tab.

---

## ✅ Checklist

- [ ] Telegram channel created (public or private)
- [ ] Bot created via @BotFather
- [ ] Bot added as administrator of the channel with post permissions
- [ ] `TELEGRAM_BOT_TOKEN` set in environment variables
- [ ] `TELEGRAM_CHANNEL_ID` set (username or numeric ID)
