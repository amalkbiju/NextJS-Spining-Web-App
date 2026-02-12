# 🚀 Spin & Win - Vercel Deployment Guide

## 📍 Current Status

**Deployment URL**: https://next-js-spining-web-app-t8st.vercel.app
**Status**: 🔴 500 Error - Missing Environment Variables
**Issue**: `MONGODB_URI` not configured on Vercel

---

## ⚡ Quick Fix (3 Steps - 5 Minutes)

### 1️⃣ Get MongoDB Connection String

**Option A: Using Existing MongoDB Atlas**

- Go to https://cloud.mongodb.com → Your Cluster
- Click **Connect** → **Drivers**
- Copy the connection string
- Example: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

**Option B: Create Free MongoDB Cluster**

- Go to https://www.mongodb.com/cloud/atlas
- Sign up with Google (free)
- Create new project → Create free cluster
- Get connection string

### 2️⃣ Add Environment Variables to Vercel

**Go to**: https://vercel.com/dashboard/NextJS-Spining-Web-App/settings/environment-variables

Add these 4 variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname
NEXTAUTH_SECRET = [generate at https://generate-secret.vercel.app/32]
NEXTAUTH_URL = https://next-js-spining-web-app-t8st.vercel.app
NEXT_PUBLIC_API_URL = https://next-js-spining-web-app-t8st.vercel.app
```

**Important**: Select "Production" and "Preview" environments for each variable!

### 3️⃣ Redeploy

**In Vercel Dashboard**:

1. Go to **Deployments**
2. Click the failed deployment (red X)
3. Click **3-dot menu** (•••) → **Redeploy**
4. Wait 1-2 minutes for build to complete

---

## ✅ Verification

After redeploying, test these:

1. **Login Page**
   - URL: https://next-js-spining-web-app-t8st.vercel.app/login
   - Should load without errors

2. **Test Login**
   - Email: test@example.com
   - Password: Test@123456
   - Should redirect to home page

3. **Play Game**
   - URL: https://next-js-spining-web-app-t8st.vercel.app/game
   - Spin the wheel and verify it works

---

## 📚 Documentation

| File                         | Purpose                           |
| ---------------------------- | --------------------------------- |
| `VERCEL_500_ERROR_FIX.md`    | Step-by-step fix for 500 error    |
| `VERCEL_DEPLOYMENT_GUIDE.md` | Complete deployment documentation |
| `DEPLOYMENT_NEXT_STEPS.md`   | Deployment checklist              |
| `.env.example`               | Environment variables template    |

---

## 🔗 Important Links

| Link                                                                               | Purpose                  |
| ---------------------------------------------------------------------------------- | ------------------------ |
| https://vercel.com/dashboard                                                       | Vercel Dashboard         |
| https://vercel.com/dashboard/NextJS-Spining-Web-App/settings/environment-variables | Add Env Variables        |
| https://cloud.mongodb.com                                                          | MongoDB Atlas            |
| https://generate-secret.vercel.app/32                                              | Generate NEXTAUTH_SECRET |
| https://github.com/amalkbiju/NextJS-Spining-Web-App                                | GitHub Repository        |

---

## 🎯 Features Included

✅ **Spinning Wheel Game**

- 2-player multiplayer
- Real-time arrow pointing to winner
- Smooth 3.5s animation
- Confetti celebration

✅ **Real-time Multiplayer**

- Socket.IO integration
- Live game state sync
- Player notifications

✅ **User Authentication**

- Login/Register system
- JWT tokens
- Password security

✅ **Room Management**

- Create/join rooms
- Invite system
- Player management

✅ **Modern UI**

- Dark theme
- Glassmorphism design
- Responsive layout
- Smooth animations

---

## 🆘 Troubleshooting

### Still Getting 500 Error?

1. **Check environment variables are set**
   - Go to Vercel Settings → Environment Variables
   - Verify all 4 variables exist
   - Check "Production" is selected

2. **Check MongoDB connection string**
   - Ensure format is: `mongodb+srv://username:password@...`
   - Verify password is URL-encoded (if special characters)
   - Test locally first with `.env.local`

3. **Clear Vercel cache**
   - Go to Deployments
   - Click failed deployment
   - Click "Redeploy"

### Login Not Working?

1. MongoDB might not be connected
2. Check deployment logs:
   - Deployments → Latest → Logs
   - Look for connection errors

3. Try registering new account instead of login

### Game Page Blank?

1. Make sure you're logged in
2. Check browser console for errors (F12)
3. Verify Socket.IO is connecting

---

## 🎊 Success Checklist

- [ ] MongoDB URI obtained from MongoDB Atlas
- [ ] All 4 environment variables added to Vercel
- [ ] Variables set for Production environment
- [ ] App redeployed successfully
- [ ] Login page loads without errors
- [ ] Can login with credentials
- [ ] Game page accessible
- [ ] Spinning wheel works
- [ ] Arrow points to correct winner

---

## 📞 Support

**Issues?** Check:

1. `VERCEL_500_ERROR_FIX.md` - Detailed troubleshooting
2. Deployment logs in Vercel Dashboard
3. Browser console errors (F12)

**Need help setting up MongoDB?**

- Video: https://www.youtube.com/watch?v=rPP_jXHkgTM
- Tutorial: https://docs.mongodb.com/atlas/tutorial/deploy-free-tier-cluster/

---

**Last Updated**: February 12, 2026
**Status**: 🔴 Waiting for environment variables → 🟢 Ready once env vars set
**Repository**: https://github.com/amalkbiju/NextJS-Spining-Web-App
