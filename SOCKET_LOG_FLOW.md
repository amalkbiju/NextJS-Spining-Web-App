# Socket.IO Invitation - Expected Log Flow

This document shows exactly what you should see in the logs when the invitation system works correctly.

## Complete Happy Path Log Sequence

### Phase 1: User B Loads Page & Initializes Socket

**User B's Browser Console:**

```
🔌 Initializing Socket.IO client...
📡 Connecting to: https://yourapp.com (or http://localhost:3000)
✅ Socket.IO connected: <socket-id-like-123abc>
📤 Emitted user-join event for userId: <user-id-like-user_456def>
📡 Listening for event: user-invited {
  socketConnected: true,
  socketId: "123abc"
}
```

**Server Console (if visible):**

```
🔌 Creating new Socket.IO instance
📡 Socket.IO server initialized with options
[Socket] POST /api/socket  [Socket.IO protocol request]
👤 User connected with socket ID: 123abc
✓ User user_456def joined room 'user-user_456def' with socket 123abc {
  totalUsersTracked: 1,
  usersInRoom: ["123abc"]
}
✅ Confirmed: User user_456def joined socket room 'user-user_456def'
```

---

### Phase 2: User A Creates Room & Invites User B

User A fills the form:

- Room name: "My Game"
- Select User B from search/dropdown
- Click invite button

**Server Console:**

```
PUT /api/rooms/<roomId>  [Room update request]
📨 About to emit user-invited with data: {
  "roomId": "room_123xyz",
  "invitedUser": {
    "userId": "user_456def",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "creator": {
    "userId": "user_789ghi",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
🔍 Attempting to retrieve Socket.IO instance
✅ Retrieved Socket.IO instance from global storage
📨 Attempting to emit 'user-invited' to user user_456def, retries left: 5
📤 Emitting 'user-invited' to room 'user-user_456def' for user user_456def (1 socket(s) connected)
✅ Event 'user-invited' successfully emitted to user-user_456def
✓ Invitation emitted to user user_456def, result: true
```

---

### Phase 3: User B Receives & Displays Invitation

**User B's Browser Console:**

```
📨 Received user-invited event: {
  invitedUserEmail: "john@example.com",
  currentUserEmail: "john@example.com",
  eventData: {
    roomId: "room_123xyz",
    invitedUser: {
      userId: "user_456def",
      name: "John Doe",
      email: "john@example.com"
    },
    creator: {
      userId: "user_789ghi",
      name: "Jane Smith",
      email: "jane@example.com"
    }
  }
}
✅ Email match! Displaying invitation popup
```

**User B's Screen:**

- ✨ **Popup appears!**
- Shows: "Jane Smith invited you to join a spinning wheel game!"
- Buttons: [Accept] [Decline]

---

## Diagnostic: Finding Where It Breaks

### Issue: No Connection Logs

**User B's Console is Empty**

`❌ Socket not initializing at all`

**Check:**

1. Is JavaScript enabled?
2. Network tab → Is `/api/socket` request being made?
3. Is there a console error before socket logs?

**Fix:**

- Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check browser console for any errors
- Verify Socket.IO is installed: `npm ls socket.io-client`

---

### Issue: Socket Connects But Never Joins Room

**User B's Console shows:**

```
✅ Socket.IO connected: 123abc
📤 Emitted user-join event for userId: user_456def
❌ [MISSING] ✅ Confirmed: User joined socket room
❌ [MISSING] 📡 Listening for event: user-invited
```

**Problem:** Server never received `user-join` event

**Check Server Logs:**

- Should show `👤 User connected with socket ID: 123abc`
- Should show `✓ User user_456def joined room 'user-user_456def'`
- If missing, `user-join` event not reaching server

**Likely Cause:**

- Server didn't attach user-join listener (code issue)
- Event lost in transit (network issue)

**Fix:**

- Restart server: `npm run dev`
- Hard refresh client: Cmd+Shift+R

---

### Issue: Room Joined But No Listener Attached

**User B's Console shows:**

```
✅ Socket.IO connected: 123abc
📤 Emitted user-join event for userId: user_456def
✅ Confirmed: User joined socket room 'user-user_456def'
❌ [MISSING] 📡 Listening for event: user-invited
```

**Problem:** InvitationNotifications component didn't attach listener

**Check:**

- Is InvitationNotifications component mounted?
- Is it in the protected layout?
- Is useEffect running?

**Fix:**

- Verify InvitationNotifications is in `/app/(protected)/layout.tsx`
- Check for any React errors in console
- Hard refresh page

---

### Issue: Listener Attached But No Event Received

**User B's Console shows:**

```
✅ Socket.IO connected: 123abc
📤 Emitted user-join event for userId: user_456def
✅ Confirmed: User joined socket room 'user-user_456def'
📡 Listening for event: user-invited { socketConnected: true }
❌ [MISSING] 📨 Received user-invited event
```

**Server Shows:**

```
📤 Emitting 'user-invited' to room 'user-user_456def' for user user_456def (0 socket(s) connected)
⚠️ No sockets connected to room 'user-user_456def'
```

**Problem:** User B's socket was in room, then disconnected or left

**Check:**

- User B's network connection stable?
- Did browser tab lose focus? (some browsers throttle)
- Check for "disconnect" logs in User B's console

**Fix:**

- Keep both tabs/windows visible and in focus
- Ensure User B's socket is still connected when User A invites
- Check for connection warnings/errors in console

---

### Issue: Event Received But Email Doesn't Match

**User B's Console shows:**

```
✅ Socket.IO connected: 123abc
📤 Emitted user-join event for userId: user_456def
✅ Confirmed: User joined socket room 'user-user_456def'
📡 Listening for event: user-invited { socketConnected: true }
📨 Received user-invited event: { ... }
❌ Email mismatch - invitation not for this user {
  invitedUserEmail: "john@example.com",
  currentUserEmail: "john.doe@example.com"
}
```

**Problem:** Email in event data doesn't match logged-in user's email

**Possible Causes:**

1. User registered with different email format
   - `john@example.com` vs `john.doe@example.com`
2. Email has whitespace
   - `" john@example.com"` (leading space)
   - `"john@example.com "` (trailing space)

3. Case sensitivity
   - `John@Example.com` vs `john@example.com`

4. User object not properly populated
   - `user?.email` is undefined or wrong

**Fix:**

1. **Check User B's User Object:**
   In browser console, run:

   ```javascript
   // Get current user from auth store
   import { useAuthStore } from "@/lib/store/authStore";
   const store = useAuthStore.getState();
   console.log("Current user:", store.user);
   ```

   Note the exact email value

2. **Check Invitation Data:**
   Look at server logs or the "eventData" in the log
   Compare: `invitedUserEmail` from event vs `currentUserEmail` from auth

3. **If Emails Don't Match:**
   - Update user in MongoDB to match exactly
   - Or update the invitation check in InvitationNotifications.tsx to normalize:
     ```typescript
     const invitedEmail = data.invitedUser.email?.toLowerCase().trim();
     const currentEmail = user?.email?.toLowerCase().trim();
     if (invitedEmail === currentEmail) { ... }
     ```

---

### Issue: Everything Works But No Popup

**All logs look perfect, including:**

```
✅ Email match! Displaying invitation popup
```

**But no popup appears on screen**

**Possible Causes:**

1. CSS display hidden
2. z-index too low (behind other elements)
3. Component rendering but not visible
4. Popup container missing from DOM

**Fix:**

1. **Verify Popup Component:**
   - Check `/components/room/InvitationNotifications.tsx` exists
   - Ensure it returns JSX in render

2. **Check Fixed Position:**

   ```tsx
   <div className="fixed bottom-6 right-6 space-y-3 z-40 max-w-sm">
   ```

   - Should be visible at bottom-right corner
   - z-40 should be above most content

3. **Verify State:**
   In browser console, add to useEffect:

   ```typescript
   console.log("Invitations state:", invitations);
   ```

   Should show array with invitation object

4. **Test Manually:**
   - Open DevTools
   - Go to Elements tab
   - Look for div with `fixed bottom-6 right-6`
   - Should exist and have content

---

## Copy-Paste Log Validation

When testing, check for these **exact** patterns:

✅ **User connected and in room:**

```
👤 User connected with socket ID:
✓ User user_ joined room 'user-user_' with socket
```

✅ **Server emitting invitation:**

```
📤 Emitting 'user-invited' to room 'user-' for user  (1 socket(s) connected)
✅ Event 'user-invited' successfully emitted to user-
```

✅ **Client received invitation:**

```
📨 Received user-invited event:
✅ Email match! Displaying invitation popup
```

---

## Emergency: Reset Everything

If logs are confusing and you want to start fresh:

1. **Clear Browser Storage:**

   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   // Reload page
   ```

2. **Restart Server:**
   - Stop: `Ctrl+C` in terminal
   - Start: `npm run dev`

3. **Hard Refresh Client:**
   - `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

4. **Check Network Tab:**
   - Filter by "socket"
   - Should show WebSocket or long-polling connection
   - No 400/404 errors

5. **Start Fresh Test:**
   - Log out and log back in
   - Follow expected logs above
   - Check each phase
