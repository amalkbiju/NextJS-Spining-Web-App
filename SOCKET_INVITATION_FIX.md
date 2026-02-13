# Socket Invitation Alert Fix

## Problem Statement
When User A creates a room and invites User B by their ID, User B does **NOT receive** the socket popup alert for the invitation, even if they're logged in.

## Root Cause
**Socket.IO was not initialized at the protected layout level.** 

The socket connection was only being established when users navigated to the home page. This meant:
- User B logs in → gets redirected to `/home` but hasn't loaded the page yet
- User A invites User B → tries to emit `user-invited` event to User B
- But User B's Socket.IO hasn't initialized yet → no socket in `user-{userId}` room
- Result: Invitation alert never reaches User B

## Solution Implemented
**Initialize Socket.IO in the Protected Layout** (`/app/(protected)/layout.tsx`)

This ensures that Socket.IO is initialized **immediately after authentication**, before the user navigates to any page.

### Changes Made

#### 1. Protected Layout - Early Socket Initialization
**File**: `/app/(protected)/layout.tsx`

```typescript
import { initSocket } from "@/lib/socket";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hydrate, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // ... existing code ...

  // NEW: Initialize Socket.IO as soon as user is authenticated
  // This ensures we're ready to receive invitation alerts immediately
  useEffect(() => {
    if (isHydrated && isAuthenticated && user?.userId) {
      console.log(
        `🔌 Protected layout: Initializing Socket.IO for user ${user.userId}`,
      );
      initSocket(user.userId);
    }
  }, [isHydrated, isAuthenticated, user?.userId]);

  // ... rest of component ...
}
```

**Why this works:**
- The protected layout wraps ALL protected pages
- It loads before the user navigates to any page
- Socket connection is established immediately after `user?.userId` is available
- User B's socket will be ready to receive events within milliseconds of authentication

#### 2. Enhanced emitToUser Retry Logic
**File**: `/lib/socketServer.ts`

Improved retry mechanism for better reliability:
- Increased retry attempts from **3 → 5**
- Increased retry delays: `300ms, 600ms, 900ms, 1200ms, 1500ms`
- Added warning when no sockets are connected to a user room

```typescript
export async function emitToUser(
  userId: string,
  eventName: string,
  data: any,
  retries = 5,  // ← Increased from 3
  req?: any,
) {
  // ... retry logic with longer delays ...
  
  if (socketsCount === 0) {
    console.warn(
      `⚠️  No sockets connected to room '${targetRoom}' - user ${userId} may not be online`,
    );
  }
}
```

**Why this helps:**
- Gives Socket.IO more time to initialize even in slow environments
- Better diagnostics to identify when users are offline
- More reliable event delivery for Edge cases

## Flow After Fix

### Scenario: User A Invites User B

**Timeline:**
```
1. User B logs in
   ↓
2. Protected layout loads (before any page renders)
   ↓
3. 🔌 Socket.IO initializes for User B
   ↓
4. User B's socket joins room 'user-{userId}'
   ↓
5. User A invites User B (creates room, adds user ID)
   ↓
6. API calls emitToUser(userIdB, 'user-invited', {...})
   ↓
7. ✅ Socket event delivered to User B immediately
   ↓
8. InvitationNotifications component receives event
   ↓
9. ✅ User B sees invitation popup alert
```

## Key Points

### What Gets Fixed
✅ User B receives invitation alerts **immediately** after being invited  
✅ Works even if User B is on any protected page (not just home)  
✅ More reliable event delivery with enhanced retry logic  

### What Stays the Same
- Socket initialization on individual pages (home, room) still works as before
- All existing socket events continue to function normally
- No breaking changes to the API

### Why This Is The Right Fix
1. **Minimal Changes** - Only 2 files modified
2. **Works For All Pages** - Socket ready on protected layout, not just specific pages
3. **Backward Compatible** - Existing socket initialization on individual pages still works
4. **Reliable** - Increased retry attempts ensure robustness

## Testing Steps

1. **Open Two Browser Windows/Tabs**
   - Browser 1: Log in as User A
   - Browser 2: Log in as User B

2. **Test Invitation Flow**
   - User A: Create a room
   - User A: Add User B by their ID (click invite button)
   - **Expected**: User B **immediately** sees invitation popup (within 1-2 seconds)

3. **Test On Different Pages**
   - Have User B on `/home` page or any other protected page
   - User A sends invitation
   - **Expected**: User B still sees popup regardless of which page they're on

4. **Check Browser Console**
   - Open DevTools on User B's browser
   - Should see: `🔌 Protected layout: Initializing Socket.IO for user {userId}`
   - When invite arrives, see: `📨 Home page received 'user-invited' event: {...}`

## Browser Console Output Expected

### On Protected Layout Load
```
🔌 Protected layout: Initializing Socket.IO for user USER_1769329764644_9kztxbwew
✅ Socket.IO connected: fxW-ZHklN8_CzUWdAAAH
📤 Emitted user-join event for userId: USER_1769329764644_9kztxbwew
✅ Confirmed: User USER_1769329764644_9kztxbwew joined socket room 'user-USER_1769329764644_9kztxbwew'
```

### When Invitation Arrives
```
📨 Home page received 'user-invited' event: {
  roomId: 'ROOM_1770966052939_0b9i75wrh',
  invitedUser: { userId: '...', name: 'User B', email: 'user@example.com' },
  creator: { userId: '...', name: 'User A', email: 'creator@example.com' }
}
✅ Invitation added to notifications
```

## Deployment
- Changes have been committed and pushed to GitHub
- Vercel will auto-deploy on main branch
- No environment variable changes needed

## Summary
By initializing Socket.IO in the protected layout instead of waiting for individual pages to load, we ensure that all authenticated users are ready to receive socket events immediately. This solves the problem where User B wouldn't receive invitation alerts because their socket hadn't connected yet.
