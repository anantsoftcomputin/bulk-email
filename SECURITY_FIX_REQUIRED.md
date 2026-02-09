# 🚨 CRITICAL SECURITY ACTION REQUIRED

## Problem
Firebase API keys were committed to your Git repository and are publicly exposed.

## Exposed Keys (NOW REMOVED FROM CODE)
- API Key: AIzaSyB9spE_tHCa-Ph96DDnYxQX_7GzHSbGBGQ
- Project: mados-7cc5b
- App ID: 1:969407470784:web:894637ccb2066f7677a125

---

## IMMEDIATE ACTIONS REQUIRED

### 1. Regenerate Firebase API Keys (DO THIS FIRST!)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `mados-7cc5b`
3. Go to **Project Settings** → **General**
4. Under **Your apps**, click on your web app
5. **Delete the old app** and create a new one with new credentials
   - OR regenerate the API key if that option is available
6. Copy the new Firebase configuration

### 2. Update Your Local .env File

1. Open `.env` file in your project root
2. Add your NEW Firebase credentials:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Firebase Configuration - ADD YOUR NEW KEYS HERE
VITE_FIREBASE_API_KEY=your-new-api-key
VITE_FIREBASE_AUTH_DOMAIN=mados-7cc5b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mados-7cc5b
VITE_FIREBASE_STORAGE_BUCKET=mados-7cc5b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-new-sender-id
VITE_FIREBASE_APP_ID=your-new-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-new-measurement-id
```

### 3. Remove Keys from Git History

The old keys are still in your Git commit history. You need to remove them:

**Option A: If you haven't pushed to a shared repository yet:**
```bash
# This will rewrite history - be careful!
git filter-branch --tree-filter 'rm -f src/config/firebase.js' HEAD
```

**Option B: If this is on GitHub (RECOMMENDED):**
```bash
# Install BFG Repo-Cleaner
brew install bfg  # macOS

# Clone a fresh copy
cd ~/Desktop
git clone --mirror https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Remove the sensitive data
cd YOUR_REPO.git
bfg --replace-text ../replacements.txt

# Create replacements.txt with:
# AIzaSyB9spE_tHCa-Ph96DDnYxQX_7GzHSbGBGQ

# Clean up and push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Option C: If it's a new project (EASIEST):**
```bash
# Delete the .git folder and start fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit with environment variables"
```

### 4. Set Up Netlify Environment Variables

If you're deploying to Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add all your `VITE_FIREBASE_*` variables
4. Redeploy your site

### 5. Configure Firebase Security Rules

Since your keys were exposed, also check your Firebase security rules:

1. Go to **Firestore Database** → **Rules**
2. Make sure you have proper authentication checks
3. Never allow public read/write access

Example secure rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## What Was Fixed in This Commit

✅ Moved Firebase keys to environment variables  
✅ Updated `.gitignore` to exclude `.env` files  
✅ Updated `.env.example` with Firebase variable placeholders  
✅ Modified `src/config/firebase.js` to use `import.meta.env`  

## Next Steps After You Complete Above Actions

1. Delete this file: `SECURITY_FIX_REQUIRED.md`
2. Test your application with new keys
3. Commit and push the changes
4. Monitor your Firebase console for any suspicious activity

---

## Need Help?

- [Firebase API Key Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [How to Remove Sensitive Data from Git](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
