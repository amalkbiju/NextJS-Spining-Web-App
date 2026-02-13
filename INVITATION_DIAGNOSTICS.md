# Socket.IO Invitation Delivery Diagnostics

## Issue

User A creates a room and invites User B by selecting them. User B should receive a popup notification/invitation, but currently does not.

## Expected Flow

1. **Client A**: User A creates room, selects opposite user (User B)
2. **Server**: PUT `/api/rooms/[roomId]` endpoint is called
3. **Server**: `emitToUser(oppositeUser.userId, "user-invited", {...})` is called
4. **Server**: Socket.IO emits event to `user-{userId}` room where User B is connected
5. **Client B**: `InvitationNotifications` component receives `user-invited` event
6. **Client B**: Email match check passes (`data.invitedUser.email === user?.email`)
7. **Client B**: Popup is displayed to User B

## Diagnostic Steps

### Step 1: Verify Socket Initialization

**User B's console should show:**

```
✅ Socket.IO connected: <socket-id>
📤 Emitted user-join event for userId: <userId>
✅ Confirmed: User <userId> joined socket room 'user-<userId>'
```

### Step 2: Verify Event Listener Attachment

**User B's console should show:**

```
📡 Listening for event: user-invited {
  socketConnected: true,
  socketId: "<socket-id>"
}
```

### Step 3: Verify User Join on Server

**Server logs should show:**

```
✓ User <userId> joined room 'user-<userId>' with socket <socket-id> {
  totalUsersTracked: <count>,
  usersInRoom: [...]
}
```

### Step 4: Verify Invitation Emission

**Server logs should show (from PUT /api/rooms):**

```
📨 About to emit user-invited with data: {
  "roomId": "...",
  "invitedUser": {
    "userId": "<User B's ID>",
    "name": "<User B's Name>",
    "email": "<User B's Email>"
  },
  "creator": {
    "userId": "<User A's ID>",
    "name": "<User A's Name>",
    "email": "<User A's Email>"
  }
}
📤 Emitting 'user-invited' to room 'user-<User B's ID>' for user <User B's ID> (<count> socket(s) connected)
✅ Event 'user-invited' successfully emitted to user-<User B's ID>
```

**Critical Check:** If count = 0, User B's socket is NOT in the room yet!

### Step 5: Verify Event Reception and Display

**User B's console should show:**

```
📨 Received user-invited event: {
  invitedUserEmail: "<User B's Email>",
  currentUserEmail: "<User B's Email>",
  eventData: {...}
}
✅ Email match! Displaying invitation popup
```

If you see:

```
❌ Email mismatch - invitation not for this user {
  invitedUserEmail: "...",
  currentUserEmail: "..."
}
```

Then the emails don't match! Check if there's a typo or formatting issue.

## Debugging Checklist

- [ ] User B's console shows socket connection logs
- [ ] User B's console shows "joined socket room" confirmation
- [ ] User B's console shows "Listening for event: user-invited" with connected status
- [ ] Server logs show "user-<User B's ID> joined room" message
- [ ] Server logs show invitation emission with > 0 sockets in room
- [ ] User B's console shows "Received user-invited event" log
- [ ] User B's console shows "Email match! Displaying invitation popup"
- [ ] Popup actually appears on User B's screen

## Common Issues

### No Socket Connection

- Socket not initialized
- Socket initializing after event is sent
- Connection dropped before event received

### Socket Not in Room

- `user-join` event not received by server
- Socket not calling `socket.join()`
- Socket room naming mismatch

### Event Not Reaching Component

- Event listener not attached
- Event emitted before listener attached
- Event listener detached prematurely

### Email Mismatch

- `data.invitedUser.email` doesn't match `user?.email`
- Email has different casing
- Email has whitespace
- User object not populated correctly

## Testing Steps

1. Open User A's browser (incognito/another browser for User B)
2. User A logs in and creates a room
3. User A selects opposite user (User B) to invite
4. Check both browsers' console for logs matching "Expected Flow" above
5. Check server logs (terminal output) for emission logs
6. If popup doesn't appear, compare the email logs and check for mismatches
