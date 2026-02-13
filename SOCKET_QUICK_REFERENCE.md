# Socket.IO Invitation System - Quick Reference Card

## The Problem

User A invites User B → User B should see a popup → Popup not showing ❌

## The Solution Approach

Added comprehensive logging to trace the invitation flow and identify where it breaks.

## Test in 3 Steps

### Step 1: Setup

```bash
npm run dev          # Terminal 1
# Open two browser windows
# User A in Window 1, User B in Window 2
# Keep both consoles open (F12)
```

### Step 2: Do This

1. User A: Create room
2. User A: Invite User B
3. Check User B's console for logs

### Step 3: Read Logs

Look for this sequence in User B's console:

```
✅ Socket.IO connected
📤 Emitted user-join event
✅ Confirmed: User joined socket room
📡 Listening for event: user-invited {
  socketConnected: true
}
📨 Received user-invited event
✅ Email match! Displaying invitation popup
```

## If Any Log Is Missing

| Missing Log                   | Problem                             | Fix                                 |
| ----------------------------- | ----------------------------------- | ----------------------------------- |
| No connection logs            | Socket not initializing             | Hard refresh: Cmd+Shift+R           |
| Missing "joined room"         | Server didn't get user-join         | Restart server: Ctrl+C, npm run dev |
| Missing "Listening for event" | InvitationNotifications not mounted | Check if component in layout.tsx    |
| Missing "Received event"      | Socket disconnected before invite   | Keep window in focus                |
| "Email mismatch" logged       | Wrong email in data                 | Check MongoDB user emails           |
| All logs but no popup         | CSS/DOM issue                       | Check Elements tab in DevTools      |

## Understanding the Flow

```
User B connects
    ↓
Socket joins "user-{userId}" room
    ↓
InvitationNotifications listens for "user-invited"
    ↓
User A invites User B
    ↓
Server emits "user-invited" to room
    ↓
Event received by User B's socket
    ↓
Check: invitedUser.email === currentUser.email
    ↓
Match? → Popup shows ✅
No match? → Event ignored ❌
```

## Key Files

| File                                          | Purpose                        |
| --------------------------------------------- | ------------------------------ |
| `lib/socket.ts`                               | Socket initialization          |
| `lib/socketIOFactory.ts`                      | Server-side socket & rooms     |
| `app/(protected)/layout.tsx`                  | Initialize socket on app load  |
| `components/room/InvitationNotifications.tsx` | Show popup when event received |
| `app/api/rooms/[roomId]/route.ts`             | Emit invitation event          |

## Logs Added

**What was enhanced:**

1. `InvitationNotifications.tsx` - Shows email matching details
2. `socket.ts` - Shows socket status when attaching listeners
3. `socketIOFactory.ts` - Shows room join confirmation
4. `rooms/[roomId]/route.ts` - Shows invitation emission details

All logs prefixed with emojis:

- 📡 = Listening for event
- 📨 = Event received
- ✅ = Success
- ❌ = Failure
- ⚠️ = Warning

## Common Fixes

**Socket won't connect:**

```bash
npm install socket.io-client@4.8.3
npm run build
npm run dev
```

**Email mismatch:**

- Check MongoDB: `db.users.findOne({email: "user@example.com"})`
- Update if needed: `db.users.updateOne({...}, {$set: {email: "correct@email.com"}})`

**Component not mounting:**

- Verify in `/app/(protected)/layout.tsx`:

```tsx
<>
  <InvitationNotifications /> // ← Must be here
  {children}
</>
```

## Documentation

- 📄 **STATUS_SOCKET_INVITATION.md** - Complete overview
- 📄 **SOCKET_LOG_FLOW.md** - Expected logs & troubleshooting
- 📄 **SOCKET_INVITATION_TESTING.md** - Testing guide
- 📄 **INVITATION_DIAGNOSTICS.md** - Diagnostic checklist

## Emergency Reset

```bash
# Stop server
Ctrl+C

# Reset everything
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Start fresh
npm run dev

# Browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

## Questions?

1. **Where should logs appear?** - User B's browser console (F12)
2. **What if server is deployed?** - Check server logs in Vercel dashboard
3. **How to test on mobile?** - Use Chrome DevTools remote debugging
4. **Can I trace network traffic?** - Yes, Network tab → Filter "socket"

## Success Criteria

✅ All logs appear in right order
✅ Email match shows in console
✅ Popup visible on screen
✅ Can accept/decline invitation
✅ Room loads after accepting

## Deployment

Once working locally:

```bash
git add .
git commit -m "Working socket invitations with diagnostics"
git push origin main

# Deploy to Vercel
# (Automatic on push or use: vercel deploy)
```

Check Vercel logs if issues appear in production.
