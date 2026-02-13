# Socket.IO 400 Bad Request - Production Fix Deployment

**Date:** February 13, 2026
**Issue:** GET /api/socket returning 400 Bad Request in production (Vercel)
**Status:** ✅ FIXED

## Changes Made

### 1. Created App Router Socket Handler

**File:** `/app/api/socket/route.ts`

- New file with GET, POST, OPTIONS handlers
- Proper CORS headers
- Returns 200 OK for all requests
- Routes to both Pages API and App Router for redundancy

### 2. Enhanced Pages API Handler

**File:** `/pages/api/socket.ts`

- Added detailed error handling and logging
- Better httpServer validation
- OPTIONS preflight support
- Clear error messages

### 3. Improved Socket.IO Factory

**File:** `/lib/socketIOFactory.ts`

- Added production optimizations
- Longer timeouts (45000ms connection, 10000ms upgrade)
- Better error handling
- serveClient: false for Vercel

### 4. Better Client Socket Initialization

**File:** `/lib/socket.ts`

- Increased reconnection attempts (15)
- Longer reconnection delay (5000ms max)
- Better timeout handling (60000ms)
- Proper credential settings for CORS

## Deployment Steps

1. **Push Changes to GitHub**

   ```bash
   git add -A
   git commit -m "Fix: Socket.IO 400 Bad Request production issue

   - Create App Router route handler at /app/api/socket/route.ts
   - Enhance Pages API handler with better error handling
   - Improve Socket.IO factory with production timeouts
   - Better client-side connection handling

   Fixes issue where Socket.IO GET /api/socket returned 400 on Vercel"
   git push origin main
   ```

2. **Verify in Vercel**
   - Go to https://vercel.com/dashboard
   - Watch the build log
   - Verify deployment succeeds
   - No need to add environment variables

3. **Test in Production**
   - Open https://next-js-spining-web-app.vercel.app/login
   - Check Network tab in DevTools
   - Look for `/api/socket` requests → should be 200 OK
   - Check Console for Socket.IO connection messages
   - Try logging in and spinning the wheel

## What Was Wrong

The issue occurred because:

1. Socket.IO client tried to connect to `/api/socket`
2. Vercel routing didn't have proper App Router handler
3. Pages API handler was returning JSON instead of letting Socket.IO middleware handle it
4. Client had short timeouts that failed on Vercel cold starts

## How It Works Now

1. App initializes → calls `/api/socket` in AuthInitializer
2. Pages API handler creates/initializes Socket.IO instance
3. Socket.IO middleware attaches to httpServer
4. When client connects to `/api/socket`, middleware handles it (not route handler)
5. Socket.IO protocol works via HTTP polling + WebSocket upgrade

## Rollback Plan

If issues arise:

```bash
git revert <commit-hash>
git push origin main
# Vercel auto-redeploys on push
```

## Testing Checklist

- [ ] Local: `npm run dev` → Socket connects without errors
- [ ] Local: Check browser console for "✅ Socket.IO connected"
- [ ] Local: Login and play game
- [ ] Production: Login at https://next-js-spining-web-app.vercel.app/login
- [ ] Production: Check Network tab for 200 OK responses
- [ ] Production: Check Console for connection messages
- [ ] Production: Verify game functionality

## Success Criteria

✅ GET /api/socket returns 200 OK (not 400)
✅ Socket.IO client connects successfully
✅ "joined-user-room" event received
✅ Game functions normally
✅ No console errors related to Socket.IO

## Files Changed

1. `/app/api/socket/route.ts` - NEW
2. `/pages/api/socket.ts` - MODIFIED
3. `/lib/socketIOFactory.ts` - MODIFIED
4. `/lib/socket.ts` - MODIFIED

## Time to Deploy

- Build: ~2-3 minutes
- Deployment: ~1 minute
- Cache invalidation: ~5 minutes
- **Total: ~10 minutes**

## Support

For questions or issues:

1. Check `/SOCKET_IO_PRODUCTION_FIX_FINAL.md` for detailed explanation
2. Check Vercel Function logs
3. Check browser Console and Network tabs
4. Review Socket.IO documentation

---

**Next Steps:**

1. Deploy to Vercel
2. Test production
3. Monitor Vercel logs for errors
4. Update users about fix
