# 🚀 Vercel Deployment Guide

## Environment Variables Setup

Your Spin & Win app requires environment variables to work on Vercel. Follow these steps:

### Step 1: Add Environment Variables to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: **NextJS-Spining-Web-App**
3. Click **Settings** → **Environment Variables**
4. Add the following variables:

| Variable              | Value                           | Example                                                      |
| --------------------- | ------------------------------- | ------------------------------------------------------------ |
| `MONGODB_URI`         | Your MongoDB connection string  | `mongodb+srv://username:password@cluster.mongodb.net/dbname` |
| `NEXTAUTH_SECRET`     | A secret key for authentication | `your-random-secret-key-here`                                |
| `NEXTAUTH_URL`        | Your production URL             | `https://your-app.vercel.app`                                |
| `NEXT_PUBLIC_API_URL` | Your production API URL         | `https://your-app.vercel.app`                                |

### Step 2: MongoDB Connection String

If you don't have MongoDB Atlas set up:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string:
   - Click **Connect**
   - Choose **Drivers**
   - Copy the connection string
   - Replace `<password>` with your database password

### Step 3: Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

### Step 4: Redeploy Your Application

After adding environment variables:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **3-dot menu** → **Redeploy**
4. Wait for the build to complete

## ✅ Verification

After deployment, your app should be live at:

- **Production URL**: https://your-app.vercel.app
- **Login Page**: https://your-app.vercel.app/login
- **Game Page**: https://your-app.vercel.app/game (after login)

## 🔍 Troubleshooting

### Error: "Please define the MONGODB_URI environment variable"

**Solution**: Add `MONGODB_URI` to Vercel environment variables (see Step 1)

### Error: "NEXTAUTH_SECRET is not set"

**Solution**: Add `NEXTAUTH_SECRET` to Vercel environment variables

### Blank Page or 500 Error

1. Check Vercel deployment logs for errors
2. Verify all environment variables are set
3. Check that MongoDB connection string is correct
4. Ensure `NEXTAUTH_URL` matches your deployed domain

### Socket.IO Connection Issues

Make sure:

- Your production domain is in `NEXTAUTH_URL`
- CORS is properly configured in your API
- WebSocket connections are enabled on Vercel (they are by default)

## 📋 Environment Variables Checklist

- [ ] `MONGODB_URI` - MongoDB connection string from Atlas
- [ ] `NEXTAUTH_SECRET` - Random secret key (32+ characters)
- [ ] `NEXTAUTH_URL` - Your Vercel domain (e.g., https://app.vercel.app)
- [ ] `NEXT_PUBLIC_API_URL` - Same as NEXTAUTH_URL

## 🎯 Your Current Setup

**Repository**: https://github.com/amalkbiju/NextJS-Spining-Web-App
**Vercel Project**: NextJS-Spining-Web-App
**Branch**: main (auto-deploys on push)

## 📞 Need Help?

1. Check Vercel logs: Dashboard → Deployments → Click deployment → Logs
2. Review `.env.example` for required variables
3. Verify MongoDB Atlas connection string format
4. Test locally with `.env.local` before deploying

---

**Status**: ✅ Ready to deploy once environment variables are configured
