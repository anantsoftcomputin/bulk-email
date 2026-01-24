# Bulk Email Sender - Complete Setup Guide

## 🚀 Quick Start

### 1. Frontend Setup (React + Vite)

```bash
# Install frontend dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend will run on: **http://localhost:5173**

### 2. Backend Setup (Node.js + Nodemailer)

```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Copy environment file
cp .env.example .env

# Start backend server
npm run dev
```

Backend API will run on: **http://localhost:3001**

### 3. Configure SMTP

Edit `server/.env` with your SMTP credentials:

**For Gmail:**
```env
DEFAULT_SMTP_HOST=smtp.gmail.com
DEFAULT_SMTP_PORT=587
DEFAULT_SMTP_SECURE=false
DEFAULT_SMTP_USER=your-email@gmail.com
DEFAULT_SMTP_PASS=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
DEFAULT_FROM_NAME=Your Name
```

> **Important for Gmail:** Use [App Passwords](https://support.google.com/accounts/answer/185833), not your regular password.

## 📋 Features

### Enterprise-Level Features Implemented:

✅ **Email Queue System**
- Rate limiting (configurable emails per hour)
- Retry logic with configurable attempts
- Priority queue processing
- Real-time queue monitoring

✅ **SMTP Management**
- Multiple SMTP configuration support
- Test email functionality via backend
- Connection verification
- Support for Gmail, Outlook, custom SMTP

✅ **Data Management**
- IndexedDB for client-side persistence
- Clear demo data functionality
- Export/import data
- Database statistics

✅ **Campaign Management**
- Campaign wizard
- Recipient management
- Template variables ({{first_name}}, {{email}}, etc.)
- Campaign statistics

✅ **Settings Persistence**
- All settings saved to database
- No demo data re-initialization
- Configurable email queue settings

## 🔧 Testing SMTP

1. Go to **SMTP Settings** page
2. Click **"Add Configuration"**
3. Fill in your SMTP details:
   - Name: "My Gmail SMTP"
   - Host: smtp.gmail.com
   - Port: 587
   - Username: your-email@gmail.com
   - Password: your-app-password
   - From Email: your-email@gmail.com
   - From Name: Your Name
4. Check "Set as default"
5. Click **"Add Configuration"**
6. Click **"Test"** button
7. Enter your email address
8. Click **"Send Test Email"**

You should receive a test email if everything is configured correctly!

## 📧 Sending Campaigns

1. Create contacts in **Contacts** page
2. Create a template in **Templates** page
3. Create a campaign in **Campaigns** page
4. Click **"Send"** to start the campaign
5. Emails are added to the queue
6. Monitor progress in **Email Queue** page

## 🛠️ Architecture

```
Frontend (React + Vite)
  ├── Dexie.js (IndexedDB)
  ├── Zustand (State Management)
  └── API Client → Backend API

Backend (Node.js + Express)
  ├── Nodemailer (SMTP)
  ├── Email Queue Processing
  └── Rate Limiting
```

## 🔐 Security Notes

- Never commit `.env` files
- Use app-specific passwords for email providers
- Backend validates all SMTP configurations
- Rate limiting prevents SMTP abuse
- CORS configured for frontend only

## 📊 Monitoring

- **Dashboard**: Overview of all statistics
- **Email Queue**: Real-time queue status
- **Analytics**: Campaign performance
- **Settings**: Database statistics

## 🚨 Troubleshooting

### "Backend Server Not Running"
```bash
cd server
npm run dev
```

### "SMTP Authentication Failed"
- For Gmail: Enable 2FA and create App Password
- For Outlook: Enable "Less secure app access"
- Verify credentials in `.env` file

### "Rate Limit Exceeded"
- Adjust `maxEmailsPerHour` in Settings
- Check your SMTP provider's limits
- Gmail: 500/day for free accounts
- Outlook: 300/day for free accounts

### "Port Already in Use"
Change ports in `.env` files:
```env
# Backend
PORT=3002

# Frontend vite.config.js
server: { port: 5174 }
```

## 📦 Production Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to hosting (Vercel, Netlify, etc.)
```

### Backend
```bash
cd server
# Deploy to Node.js hosting (Heroku, Railway, DigitalOcean, etc.)
# Set environment variables in hosting platform
```

## 🎯 Next Steps

1. Test SMTP configuration
2. Clear demo data (Settings > Database Management)
3. Import your contacts
4. Create email templates
5. Launch your first campaign!

## 📝 License

MIT License - Feel free to use for personal and commercial projects.

## 🤝 Support

If you encounter issues:
1. Check backend server is running
2. Verify SMTP credentials
3. Check console logs (F12)
4. Review server logs in terminal
