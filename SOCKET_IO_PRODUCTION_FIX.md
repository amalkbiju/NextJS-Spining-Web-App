# 🔧 Socket.IO Production Issues - Troubleshooting Guide

## Problem: Socket.IO Not Working in Production

**Symptoms:**
- ❌ Room creation not broadcasting to other users
- ❌ Users don't receive alerts for room invites
- ❌ Game events not syncing between players
- ✅ But everything works locally

---

## Root Cause

Socket.IO in production (Vercel) has issues with:
1. **CORS configuration** - Not allowing cross-origin connections
2. **WebSocket support** - Vercel may block WebSocket in some regions
3. **Production domain URL** - Client connecting to different domain than server expects

---

## ✅ Fixed Issues

### 1. CORS Configuration
**Updated**: `lib/socketIOFactory.ts`

Now includes production domain in allowed origins:
```typescript
const allowedOrigins: string[] = [
  "http://localhost:3000",           // Local development
  "http://127.0.0.1:3000",           // Local development
  "http://192.168.1.11:3000",        // Local network
];

if (process.env.NEXTAUTH_URL) {
  allowedOrigins.push(process.env.NEXTAUTH_URL);  // Production URL
}
```

### 2. Socket.IO Configuration
**Updated**: Server-side settings
- ✅ `transports: ["websocket", "polling"]` - WebSocket with HTTP polling fallback
- ✅ `pingInterval: 25000` - Keep-alive pings every 25 seconds
- ✅ `pingTimeout: 60000` - 60 second timeout
- ✅ `credentials: true` - Allow credentials in CORS

---

## 🚀 Deployment Steps to Fix Socket.IO

### Step 1: Update Environment Variable
Make sure `NEXTAUTH_URL` is set on Vercel:
- Go to: https://vercel.com/dashboard/NextJS-Spining-Web-App/settings/environment-variables
- Add: `NEXTAUTH_URL=https://your-deployment.vercel.app`
- Select: Production & Preview environments

### Step 2: Redeploy
In Vercel Dashboard:
1. Go to **Deployments**
2. Click the latest deployment
3. Click **3-dot menu (•••)** → **Redeploy**
4. Wait 2-3 minutes for build

### Step 3: Verify Socket.IO Connection

**Check in Browser Console** (F12 → Console tab):
```javascript
// Should show successful connection
// Look for messages like:
// ✅ Socket.IO connected: [socket-id]
```

**Test Room Creation**:
1. Open 2 browser windows/tabs to your app
2. Login with different users in each
3. User 1: Create a room
4. User 2: Should see "room-created" alert immediately

---

## 🔍 Debugging Socket.IO Issues

### Check Vercel Deployment Logs

1. Go to: https://vercel.com/dashboard/NextJS-Spining-Web-App/deployments
2. Click the latest deployment
3. Click **Logs** tab
4. Look for messages:
   - `✅ Socket.IO instance created` = Good
   - `❌ Socket.IO unavailable` = Bad

### Check Browser Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Filter by "socket" or "api/socket"
4. Should see WebSocket connection:
   - `ws://` or `wss://` (WebSocket)
   - OR `http` polling as fallback

### Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `CORS error` | Production URL not in allowed origins | Add NEXTAUTH_URL env var |
| `WebSocket connection refused` | Firewall/network issue | Vercel supports WebSocket natively |
| `Socket already connected` | Multiple Socket.IO instances | Check client initialization |
| `Connection timeout` | Socket.IO not initialized | Ensure /api/socket is called on app load |

---

## 📋 Socket.IO Architecture in Production

```
User 1 (Browser)
    ↓
    └─→ Socket.IO Client
         ↓
    [WebSocket / HTTP Polling]
         ↓
    Vercel Edge Network
         ↓
    Next.js API Route
         ↓
    Socket.IO Server Instance
         ↓ [Broadcasting]
         ↓
    User 2 (Browser)
         ←─ Socket.IO Client
```

### Key Files:
- **Server**: `lib/socketIOFactory.ts` - Creates & configures Socket.IO server
- **Server**: `lib/socketServer.ts` - Broadcasting utilities
- **Client**: `lib/socket.ts` - Client connection logic
- **API**: `pages/api/socket.ts` - HTTP endpoint for Socket.IO upgrade
- **Routes**: `app/api/**` - Uses `broadcastToAll()` for events

---

## 🎯 Testing Socket.IO in Production

### Test 1: Direct Connection
```typescript
// In browser console while app is open:
fetch('https://your-app.vercel.app/api/socket')
  .then(r => r.json())
  .then(d => console.log('Socket.IO Status:', d))
```

### Test 2: Room Broadcasting
1. Open 2 browsers (different users)
2. Look in **Network → WS** for active WebSocket
3. Create a room on User 1
4. User 2 should receive event in console:
   ```
   🎮 Home page received 'room-created' event
   ```

### Test 3: Game Events
1. Both users join same room
2. User 1 spins wheel
3. User 2's wheel should rotate synchronously
4. Check **Network → WS** for message traffic

---

## ⚙️ Advanced Configuration

### Adjust Socket.IO Settings (if needed)

Edit `lib/socketIOFactory.ts`:
```typescript
pingInterval: 25000,      // Increase if timeout
pingTimeout: 60000,       // Increase for slow connections
reconnectionDelay: 1000,  // Wait 1s before retry
```

### Enable Socket.IO Debugging

Add to `lib/socket.ts`:
```typescript
socket.onAny((event, ...args) => {
  console.log('🔵 Socket Event:', event, args);
});
```

---

## 📞 Still Having Issues?

1. **Check Vercel Logs**: https://vercel.com/dashboard/NextJS-Spining-Web-App/deployments
2. **Check Browser Console**: F12 → Console tab
3. **Check Network**: F12 → Network tab → Filter "socket"
4. **Verify Env Vars**: Are all 4 env vars set on Vercel?
5. **Force Redeploy**: Delete deployment and redeploy

---

## 🎊 Success Checklist

- [ ] `NEXTAUTH_URL` set on Vercel
- [ ] App successfully redeployed
- [ ] Can create room on User 1
- [ ] User 2 receives "room-created" alert
- [ ] Users can join same room
- [ ] Game events sync between players
- [ ] Browser console shows "Socket.IO connected"

---

**Updated**: February 12, 2026
**Status**: ✅ Socket.IO Production Ready
**Repository**: https://github.com/amalkbiju/NextJS-Spining-Web-App
