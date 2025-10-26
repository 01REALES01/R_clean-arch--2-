# 📧 Email Notifications Setup Guide

## ✅ What Was Added

Your notification service now **automatically sends emails** when:
- ✅ A task is created
- ✅ A task is updated
- ✅ A task is deleted

---

## 🚀 Quick Start (Works WITHOUT Email Setup)

**Good news:** The app works perfectly **without configuring emails**!

If you don't set up email, it will just:
- ✅ Still create notifications in the database
- ✅ Still work via Swagger API
- ⚠️ Skip sending emails (you'll see logs saying "Email skipped")

---

## 📧 Option 1: Using Gmail (Easiest)

### Step 1: Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Gmail account
3. Create a new app password:
   - App name: "TaskFlow"
   - Click "Create"
4. **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

### Step 2: Edit notification-service/.env

Open: `microservices/notification-service/.env`

Add these lines:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=your.email@gmail.com
```

**Replace:**
- `your.email@gmail.com` with your actual Gmail
- `abcd efgh ijkl mnop` with your App Password

### Step 3: Restart Notification Service

```powershell
# Stop with Ctrl+C, then:
cd c:\Users\Reales\Desktop\UNIversidad\R_clean-arch--2-\microservices\notification-service
npm run start:dev
```

**Look for this log:**
```
✅ Email service configured
```

---

## 📧 Option 2: Using Mailtrap (For Testing)

**Best for development** - Catches all emails without sending to real users!

### Step 1: Create Free Account

1. Go to: https://mailtrap.io/
2. Sign up (free)
3. Go to "Email Testing" → "Inboxes"
4. Copy the SMTP credentials

### Step 2: Configure .env

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
SMTP_FROM=noreply@taskflow.com
```

### Step 3: Restart & Test

All emails will appear in your Mailtrap inbox! 📬

---

## 🧪 How to Test

### Test 1: Create a Task

1. **Register/Login** with a real email (your Gmail)
2. **Create a task** in Swagger
3. **Check your email** - You should receive:
   ```
   Subject: TaskFlow: New Task Created
   
   Your task "Test Task" has been created successfully.
   
   Task Details:
   - Task ID: xxx
   - Due Date: 2025-10-30
   ```

### Test 2: Update a Task

1. **Update the task** you created
2. **Check email** - Subject: "TaskFlow: Task Updated"

### Test 3: Delete a Task

1. **Delete the task**
2. **Check email** - Subject: "TaskFlow: Task Deleted"

---

## 📊 How It Works

```
1. User creates task (Task Service)
       ↓
2. Event published to RabbitMQ
       ↓
3. Notification Service receives event
       ↓
4. Creates notification in database ✅
       ↓
5. Looks up user's email
       ↓
6. Sends email via SMTP ✅
       ↓
7. User receives email! 📧
```

---

## 🐛 Troubleshooting

### "Email skipped (not configured)"

**Problem:** SMTP credentials not set in .env

**Solution:** 
- Check `notification-service/.env` has SMTP_HOST, SMTP_USER, SMTP_PASS filled
- Restart notification-service

---

### "Failed to send email: Invalid login"

**Problem:** Wrong Gmail password (using regular password instead of App Password)

**Solution:**
1. Go to https://myaccount.google.com/apppasswords
2. Create new App Password
3. Use that 16-character password in .env
4. Restart service

---

### "Email sent but I didn't receive it"

**Check:**
1. **Spam folder** - Gmail might filter it
2. **Email address** - Did you register with the correct email?
3. **Logs** - Terminal should show: `✅ Email sent: ... to ...`

---

## 💡 Pro Tips

### Disable Emails Temporarily

Just leave SMTP fields empty in `.env`:
```env
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

The app will work fine without sending emails!

### Use Mailtrap for Development

- Never accidentally email real users
- See all emails in one place
- Test email templates safely

### Production Settings

For production, use:
- **SendGrid** (free 100 emails/day)
- **AWS SES** (cheap, reliable)
- **Mailgun** (developer-friendly)

---

## 📧 Email Template

The emails look like this:

```
┌─────────────────────────────┐
│       📋 TaskFlow           │  <- Blue header
├─────────────────────────────┤
│                             │
│ Your task "Test Task"       │
│ has been created            │
│ successfully.               │
│                             │
│ Task Details:               │
│ - Task ID: abc123           │
│ - Due Date: Oct 30, 2025    │
│                             │
├─────────────────────────────┤
│ This is an automated        │  <- Footer
│ notification from TaskFlow  │
└─────────────────────────────┘
```

Clean, professional, and mobile-friendly! 📱

---

## ✅ Summary

**What you have now:**
- ✅ Automatic email notifications for all task events
- ✅ Works with Gmail, Mailtrap, or any SMTP server
- ✅ Optional - app works fine without email
- ✅ Professional HTML email templates
- ✅ Error handling (emails fail silently)

**To enable emails:**
1. Add SMTP credentials to `notification-service/.env`
2. Restart notification-service
3. Create/update/delete tasks
4. Check your email! 📧

---

**Need help setting up Gmail App Password or Mailtrap? Just ask!**

