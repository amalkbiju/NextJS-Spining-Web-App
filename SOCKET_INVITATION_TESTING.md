# Socket Invitation System - Current State & Testing Guide

## Current Implementation Status ✅

### What's Been Fixed

1. **Socket.IO 400 Bad Request** ✅
   - Using Pages Router (`/pages/api/socket.ts`) for Socket.IO protocol
   - Proper httpServer access and initialization
   - Socket.IO engine handling all protocol requests

2. **Socket Connections Staying Alive** ✅
   - Event listeners attached in protected layout
   - Socket reference maintained across page navigation
   - Keep-alive mechanism prevents garbage collection

3. **Socket Room Joining** ✅
   - Client emits `user-join` event on socket connect
   - Server receives and joins socket to `user-{userId}` room
   - Confirmation event sent back to client

4. **Invitation Emission** ✅
   - API endpoint `/api/rooms/[roomId]` calls `emitToUser()`
   - `emitToUser()` emits to `user-{userId}` room
   - Retry logic with exponential backoff (5 attempts)

### What Needs Testing

The invitation delivery chain is now instrumented with comprehensive logging. The issue (popup not showing) can now be diagnosed by following the logs.

## Architecture Overview

```
User A creates room (opposite user = User B)
    ↓
PUT /api/rooms/[roomId]
    ↓
emitToUser(User B's userId, "user-invited", {...})
    ↓
Socket.IO emits to `user-{User B's userId}` room
    ↓
User B's socket receives event
    ↓
InvitationNotifications component listener receives event
    ↓
Email match check: data.invitedUser.email === user?.email
    ↓
If match → Popup displayed
If no match → Event ignored (logged as "❌ Email mismatch")
```

## How to Test & Debug

### Setup

1. Open two browser windows/tabs (or different browsers)
2. Log User A into one, User B into another
3. Make sure you have the same users defined in MongoDB (or create test users)

### Test Scenario

1. **User A**: Create a room
2. **User A**: Find "Invite User" button and search for User B
3. **User A**: Click to invite User B
4. **User B**: Watch for popup

### Reading the Logs

**User B's Browser Console** (F12 → Console):

```
✅ Socket.IO connected: ...          ← Socket connected
📤 Emitted user-join event for userId: ... ← User join sent
📡 Listening for event: user-invited {    ← Listener attached
  socketConnected: true,
  socketId: "..."
}
✅ Confirmed: User joined socket room ... ← Room join confirmed

[After User A invites]

📨 Received user-invited event: {    ← Event received!
  invitedUserEmail: "...",
  currentUserEmail: "...",
  eventData: {...}
}
✅ Email match! Displaying invitation popup ← Popup shown!
```

**Server Console/Logs**:

```
✓ User <ID> joined room 'user-<ID>' with socket <ID>

[After User A invites]

📨 About to emit user-invited with data: {...}
📤 Emitting 'user-invited' to room 'user-<ID>' for user <ID> (1 socket(s) connected)
✅ Event 'user-invited' successfully emitted to user-<ID>'
```

## Key Diagnostic Points

### Critical Checks

1. **Socket Connected?** → Check first log group
2. **Socket in Room?** → Check "joined socket room" message
3. **Listener Attached?** → Check "Listening for event" with `socketConnected: true`
4. **Event Emitted?** → Check server logs for "Emitting 'user-invited'"
5. **Socket in Room (Server side)?** → Check "N socket(s) connected" - if 0, user offline
6. **Event Received?** → Check "Received user-invited event"
7. **Email Match?** → Check if "Email match" or "Email mismatch" is logged

### If Popup Still Doesn't Show

**Most Likely Causes (in order of probability):**

1. **Email Mismatch**
   - User B's browser shows: `❌ Email mismatch - invitation not for this user`
   - Compare `invitedUserEmail` vs `currentUserEmail` in the log
   - Solution: Verify user data in MongoDB, check for case differences or whitespace

2. **Socket Not in Room When Invitation Sent**
   - Server shows: `(0 socket(s) connected)` when emitting invitation
   - User B connected too late or connection dropped
   - Solution: Ensure User B's socket is fully connected before User A invites

3. **Event Listener Not Attached**
   - User B's console doesn't show `📡 Listening for event: user-invited`
   - Or shows it with `socketConnected: false`
   - Solution: Force page refresh for User B, wait for all connection logs

4. **Socket Not Connected**
   - User B's console doesn't show initial connection logs
   - Could be CORS issue or socket path mismatch
   - Solution: Check network tab, look for `/api/socket` requests

## Deployment Checklist

Before deploying to production:

- [ ] Test invitation flow with two separate users
- [ ] Verify both browser consoles show all expected logs
- [ ] Verify server logs show successful emission
- [ ] Check that email matching works correctly
- [ ] Test with different email casing (if applicable)
- [ ] Test disconnection and reconnection scenarios
- [ ] Verify popup displays correctly on mobile browsers
- [ ] Test with slow network connections (browser DevTools throttle)

## Files Modified for Diagnostics

1. **components/room/InvitationNotifications.tsx**
   - Enhanced logging for event reception and email matching

2. **lib/socket.ts**
   - Improved onEvent logging to show connection status

3. **lib/socketIOFactory.ts**
   - Added detailed user-join logging with room info

4. **app/api/rooms/[roomId]/route.ts**
   - Added detailed invitation emission logging

## Next Steps If Issues Persist

1. **Check Browser Network Tab**
   - Look for WebSocket or polling connections to `/api/socket`
   - Verify no 400/404 errors

2. **Check Server Network Logs**
   - Add packet sniffing if needed (tcpdump, Charles Proxy)
   - Verify event actually transmitted

3. **Add Event Validation**
   - Create a test endpoint that returns last emitted events
   - Verify event structure and content

4. **Test Socket.IO Directly**
   - Use Socket.IO test client to emit events manually
   - Verify room mechanics work as expected

5. **Check Auth Issues**
   - Verify user tokens are valid
   - Ensure userId is correctly extracted from token
   - Check if different auth contexts cause issues
