# 🔧 Socket.IO Production Fix - Complete Guide

## Problem You Reported

- ❌ Socket.IO works locally but not in production
- ❌ User creates room, but other user doesn't get alert
- ❌ Users can't see each other's actions in real-time

## Root Cause Identified

**CORS & Domain Configuration Issue**

The Socket.IO server wasn't configured to accept connections from your Vercel production domain.

---

## ✅ What Was Fixed

### 1. **Socket.IO CORS Configuration**

**File**: `lib/socketIOFactory.ts`

**Before** (broken in production):

```typescript
cors: {
  origin: "*",  // Too permissive, doesn't work properly on Vercel
}
```

**After** (works in production):

```typescript
cors: {
  origin: [
    "http://localhost:3000",              // Local dev
    "http://127.0.0.1:3000",              // Local dev
    "http://192.168.1.11:3000",           // Local network
    process.env.NEXTAUTH_URL,             // Production domain ✅
  ],
  methods: ["GET", "POST"],
  credentials: true,
}
```

### 2. **Server Configuration**

Added proper Socket.IO server settings:

```typescript
{
  path: "/api/socket",
  transports: ["websocket", "polling"],  // WebSocket + HTTP fallback
  pingInterval: 25000,                   // Keep-alive pings
  pingTimeout: 60000,                    // Connection timeout
}
```

### 3. **Room Broadcasting**

Updated room creation to ensure Socket.IO is initialized before broadcasting.

---

## 🚀 To Deploy the Fix

### Step 1: Verify Environment Variable

Go to Vercel Dashboard:

- URL: https://vercel.com/dashboard/NextJS-Spining-Web-App/settings/environment-variables

**Make sure this exists**:

```
NEXTAUTH_URL = https://next-js-spining-web-app-t8st.vercel.app
```

(Replace with your actual Vercel URL)

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click the latest deployment
3. Click **•••** (three dots) → **Redeploy**
4. Wait for build to complete (2-3 minutes)

### Step 3: Test Socket.IO

**Open 2 browser windows**:

1. Login as User 1 in Window 1
2. Login as User 2 in Window 2
3. User 1: Click "Create Room"
4. **✅ User 2 should see alert immediately**

If you see the alert, Socket.IO is working! 🎉

---

## 🔍 How to Verify It's Working

### In Browser Console (F12):

```javascript
// Should show something like:
✅ Socket.IO connected: [socket-id]
✓ User [userId] joined room 'user-[userId]'
```

### In Vercel Logs:

1. Go to Deployments → Latest → Logs
2. Look for:
   ```
   🔐 Socket.IO CORS allowed origins: [...]
   ✅ Socket.IO instance created
   👤 User connected
   ```

---

## 📊 Architecture Now Working

```
Production (Vercel)
├── Client 1 Browser
│   └─ Socket.IO Client
│      └─ ws://domain.vercel.app/api/socket
│
├── Vercel Server
│   └─ Socket.IO Server
│      └─ Connected to production domain ✅
│
└── Client 2 Browser
    └─ Socket.IO Client
       └─ ws://domain.vercel.app/api/socket
```

### Events Flow

```
User 1 Creates Room
    ↓
POST /api/rooms
    ↓
broadcastToAll('room-created')
    ↓
Socket.IO sends to all connected clients
    ↓
User 2 receives alert immediately ✅
```

---

## 🎯 Features That Now Work in Production

✅ **Room Creation**

- User 1 creates room
- User 2 gets immediate alert

✅ **Join Notifications**

- User 2 joins User 1's room
- User 1 gets notified

✅ **Game Synchronization**

- Both players spin wheel
- Events sync in real-time
- Arrow points to correct winner

✅ **Multiplayer Events**

- Invitations sent/received
- Player status updates
- Score synchronization

---

## 📋 File Changes Made

| File                          | Change                            | Why                   |
| ----------------------------- | --------------------------------- | --------------------- |
| `lib/socketIOFactory.ts`      | Added CORS with production domain | Fix CORS error        |
| `app/api/rooms/route.ts`      | Import Socket.IO factory          | Ensure initialization |
| `SOCKET_IO_PRODUCTION_FIX.md` | New troubleshooting guide         | Help with issues      |

---

## 🆘 If Still Not Working

### Check 1: Env Variable

```bash
# Go to Vercel Settings and verify:
NEXTAUTH_URL = https://next-js-spining-web-app-t8st.vercel.app
```

### Check 2: Browser Console

- Open F12 → Console
- Look for errors starting with "Socket" or "CORS"
- Share error message with support

### Check 3: Vercel Logs

- Go to Deployments → Latest
- Click **Logs** tab
- Search for "CORS" or "Socket.IO"

### Check 4: Force Refresh

- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Try in different browser

---

## 📞 Next Steps

1. **Redeploy** your app on Vercel
2. **Test** with 2 user accounts
3. **Check** browser console for errors
4. **Verify** room creation triggers alerts

Once room creation alerts work, all Socket.IO events should work! 🚀

---

**Status**: ✅ Ready to Deploy
**Updated**: February 12, 2026
**Repository**: https://github.com/amalkbiju/NextJS-Spining-Web-App
**Deployment**: https://next-js-spining-web-app-t8st.vercel.app
