# 🚀 Netlify Deployment Guide

## How It Works

Your app now works in **both environments**:

### 🏠 Local Development
- **Frontend**: Vite dev server (`npm run dev`)
- **Backend**: Node.js Express server (`cd server && npm start`)
- **API calls go to**: `http://localhost:3001/api`

### ☁️ Netlify Production
- **Frontend**: Static files served from Netlify CDN
- **Backend**: Netlify Serverless Functions
- **API calls go to**: `/.netlify/functions`

The code automatically detects the environment using `import.meta.env.DEV`.

---

## 📋 Deployment Steps

### 1. Push Your Code to GitHub

```bash
# If not already initialized
git init
git add .
git commit -m "Ready for Netlify deployment"

# Push to GitHub
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Connect to Netlify

1. Go to [https://netlify.com](https://netlify.com) and log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Netlify will auto-detect the settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### 3. Configure Environment Variables

In Netlify dashboard → **Site settings** → **Environment variables**, add:

```plaintext
# Firebase Configuration (Use NEW regenerated keys!)
VITE_FIREBASE_API_KEY=your-new-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Node Version (already in netlify.toml, but can set here too)
NODE_VERSION=18
```

⚠️ **IMPORTANT**: Use your **NEW regenerated Firebase keys**, not the exposed ones!

### 4. Deploy

Click **"Deploy site"** and Netlify will:
1. Install dependencies (`npm install`)
2. Install function dependencies (`cd netlify/functions && npm install`)
3. Build your frontend (`npm run build`)
4. Bundle serverless functions
5. Deploy everything

---

## ✅ What Happens After Deployment

### Functions Available:
- `https://your-site.netlify.app/.netlify/functions/email-test` - Test SMTP
- `https://your-site.netlify.app/.netlify/functions/email-verify` - Verify SMTP
- `https://your-site.netlify.app/.netlify/functions/email-send` - Send single email
- `https://your-site.netlify.app/.netlify/functions/email-send-bulk` - Send bulk emails
- `https://your-site.netlify.app/.netlify/functions/track-open` - Track email opens
- `https://your-site.netlify.app/.netlify/functions/track-click` - Track clicks
- `https://your-site.netlify.app/.netlify/functions/enquiry-submit` - Contact form

### Your App Will:
- ✅ Automatically use Netlify Functions (no manual config needed)
- ✅ Work exactly like in development
- ✅ Handle CORS automatically

---

## 🔧 Local Testing with Netlify Functions (Optional)

If you want to test Netlify Functions locally:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Run Netlify Dev (serves both frontend and functions)
netlify dev
```

This will:
- Start frontend on `http://localhost:8888`
- Make functions available at `http://localhost:8888/.netlify/functions`
- Simulate the production environment

---

## 🐛 Troubleshooting

### "Function not found" error
- Check `netlify.toml` has `functions = "netlify/functions"`
- Ensure functions have proper exports: `exports.handler = async (event) => {...}`

### CORS errors in production
- Netlify Functions need proper CORS headers (already included in your functions)
- Check the headers object in each function file

### Environment variables not working
- Make sure they're prefixed with `VITE_` for frontend access
- Redeploy after adding new environment variables

### Slow function startup (cold starts)
- First request after inactivity may take 1-2 seconds
- This is normal for serverless functions on free tier

---

## 📊 Monitoring

After deployment:
1. Check **Netlify Functions logs** in the dashboard
2. Monitor **Firebase Console** for authentication events
3. Use **Netlify Analytics** (if enabled) for traffic insights

---

## 🔄 Continuous Deployment

Once connected, every push to your main branch will:
1. Trigger automatic build
2. Run tests (if configured)
3. Deploy to production if successful

To deploy manually:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

---

## 💰 Pricing Notes

**Netlify Free Tier includes:**
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ 125,000 function requests/month
- ✅ Automatic HTTPS
- ✅ Forms (100 submissions/month)

Perfect for testing and small-scale use!

---

## 🔐 Security Checklist

Before deploying:
- ✅ Regenerated Firebase API keys (see SECURITY_FIX_REQUIRED.md)
- ✅ `.env` file is gitignored
- ✅ Environment variables set in Netlify dashboard
- ✅ Firebase security rules configured properly
- ✅ SMTP credentials never committed to Git

---

## 🆘 Need Help?

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Netlify Support](https://answers.netlify.com/)
- Check your function logs in Netlify dashboard

**Your app is now ready to deploy!** 🎉
