# 🧪 Testing Guide - Dummy Users & Credits

## 📝 Available Test Users

All test users have password: **`Test@123`**

### Test User 1: Player One (Balanced)

- **Email**: `test1@example.com`
- **Password**: `Test@123`
- **Credits**: 10,000 💰
- **Purpose**: Primary testing user - has plenty of credits for multiple games
- **Good For**: Testing all entry price tiers (100, 200, 500, 1000)

### Test User 2: Player Two (Standard)

- **Email**: `test2@example.com`
- **Password**: `Test@123`
- **Credits**: 5,000 💰
- **Purpose**: Secondary testing user - matches first user's playstyle
- **Good For**: Testing 1-on-1 games between two players

### Test User 3: Rich Player (VIP)

- **Email**: `test3@example.com`
- **Password**: `Test@123`
- **Credits**: 50,000 💰💰💰
- **Purpose**: Stress testing - tests with very high entry fees
- **Good For**: Testing high-stakes games, edge cases with large numbers

### Test User 4: Demo User (Limited)

- **Email**: `test4@example.com`
- **Password**: `Test@123`
- **Credits**: 3,000 💰
- **Purpose**: Edge case testing - limited credits scenario
- **Good For**: Testing when credits are running low, insufficient balance errors

---

## 🎮 Testing Scenarios

### Scenario 1: Equal Entry Fees (Balanced Game)

```
Player 1 (test1@example.com): 10,000 credits
Player 2 (test2@example.com): 5,000 credits
Entry Fee: 100 credits each
Prize Pool: 200 credits total (100 + 100)
Winner: Gets 200 credits
```

**Steps**:

1. Log in as Player One
2. Create room, select 100 credits entry
3. Invite Player Two
4. Player Two joins, accepts 100 credits entry
5. Both spin
6. Winner gets 200 credits
7. Check header: Winner should have +200, Loser should have -100

---

### Scenario 2: Different Entry Fees

```
Player 1 (test1@example.com): 10,000 credits - chooses 500
Player 2 (test2@example.com): 5,000 credits - chooses 200
Prize Pool: 700 credits total (500 + 200)
Winner: Gets 700 credits
```

**Steps**:

1. Player One creates room, selects 500 credits
2. Player Two joins and selects 200 credits
3. Both spin
4. Winner receives: 700 credits
5. Loser deducts: Their entry amount

---

### Scenario 3: High Stakes Game

```
Player 1 (test3@example.com): 50,000 credits - chooses 5000
Player 2 (test1@example.com): 10,000 credits - chooses 5000
Prize Pool: 10,000 credits
Winner: Gets 10,000 credits
```

**Steps**:

1. Log in as Rich Player, create room, select 5000
2. Invite Player One
3. Player One joins and accepts 5000
4. Spin
5. Winner gets: 10,000 credits
6. Verify header shows correct balance

---

### Scenario 4: Low Credit Scenario

```
Player 1 (test4@example.com): 3,000 credits - tries 1000
Player 2 (test1@example.com): 10,000 credits - accepts 1000
Prize Pool: 2,000 credits
```

**Steps**:

1. Log in as Demo User
2. See header: 3,000 available
3. Try to select 1000 entry - should work (have enough)
4. If tries 5000 - should show "insufficient credits" error
5. Play with 1000 entry
6. If lose: 2,000 left (not enough for another 1000 game)
7. Verify credit display updates

---

## 💾 Where to Find Dummy User Data

**File**: `lib/models/User.ts`

**Section**: `DUMMY_USERS_FOR_TESTING` export

**Usage**: Can import and use for seeding database:

```typescript
import { DUMMY_USERS_FOR_TESTING } from "@/lib/models/User";

// Use to populate test database
for (const user of DUMMY_USERS_FOR_TESTING) {
  // Create user in database
}
```

---

## 🧪 Testing Checklist

### Credits Display ✅

- [ ] Home page shows correct credits in header
- [ ] Credits display updates after game
- [ ] Winner shows increased credits
- [ ] Loser shows decreased credits
- [ ] Display matches database value

### Entry Price Selection ✅

- [ ] Can select all 4 entry tiers (100, 200, 500, 1000)
- [ ] Shows available credits in header
- [ ] Cannot select entry if insufficient credits
- [ ] Shows error message if credits too low
- [ ] Modal displays entry price clearly

### Prize Pool Calculation ✅

- [ ] Shows both players' entry fees
- [ ] Calculates total correctly
- [ ] Winner gets exact sum of both entries
- [ ] Loser's credits reduced by their entry only
- [ ] Prize pool shows during spin

### Game Flow with Credits ✅

- [ ] Credits deducted when game starts
- [ ] Winner credited before loser sees result
- [ ] Both players' headers update correctly
- [ ] Can play multiple games in sequence
- [ ] Credits persist after page refresh

### Edge Cases ✅

- [ ] Player with exactly enough credits for entry
- [ ] Player trying to spend more than available
- [ ] Different entry fees both accepted
- [ ] Very high entry fees handled correctly
- [ ] Zero credits shows appropriate message

---

## 🚀 Quick Start for Testing

### Setup

1. Make sure you have at least 2 browsers or tabs open
2. Use Private/Incognito windows to avoid session conflicts

### Multi-Player Test

```
Browser 1: test1@example.com (10,000 credits)
Browser 2: test2@example.com (5,000 credits)

Steps:
1. Browser 1: Log in → Create room → Copy room link
2. Browser 2: Log in → Navigate to room link
3. Browser 1: Select entry (100 credits)
4. Browser 2: Accept entry
5. Both: Click SPIN
6. Watch: Arrow should point to winner
7. Check: Winner's credits +200, Loser's -100
```

---

## 📊 Testing Data Summary

| User        | Email             | Password | Credits | Use Case             |
| ----------- | ----------------- | -------- | ------- | -------------------- |
| Player One  | test1@example.com | Test@123 | 10,000  | Primary tester       |
| Player Two  | test2@example.com | Test@123 | 5,000   | Secondary tester     |
| Rich Player | test3@example.com | Test@123 | 50,000  | High stakes          |
| Demo User   | test4@example.com | Test@123 | 3,000   | Low credit edge case |

---

## 🎯 What to Test With These Users

✅ **All entry tiers** (100, 200, 500, 1000 credits)  
✅ **Equal entry fees** (same amount from both)  
✅ **Different entry fees** (different amounts)  
✅ **High stakes games** (large amounts)  
✅ **Low credit scenarios** (limited funds)  
✅ **Multiple consecutive games** (credit tracking)  
✅ **Winner/Loser scenarios** (both outcomes)  
✅ **Header updates** (credits display accuracy)  
✅ **Arrow pointing** (correct winner indication)  
✅ **Prize pool display** (real-time information)

---

## 🐛 Debugging Tips

### Check Credits in Console

```typescript
// In browser console after logging in:
JSON.parse(localStorage.getItem("auth-store")).state.user.credits;
```

### Monitor API Calls

1. Open DevTools → Network tab
2. Play a game
3. Look for `/api/wheel/complete` request
4. Check response: Should show updated winner credits

### Verify Database

Check MongoDB for user document:

```javascript
db.users.find({ email: "test1@example.com" });
// Should show: credits: 10000
```

---

## 📝 Notes

- **Default Credit Amount**: 5000 (for new users not in the test list)
- **Entry Prices Available**: 100, 200, 500, 1000 credits
- **Minimum Credits**: 0 (after losing all games)
- **Maximum Credits**: No limit (can accumulate)

All dummy users have been created for quick testing without needing to register real accounts!

---

**Status**: ✅ Ready for Testing  
**Date**: February 23, 2026  
**Test Environment**: Development  
**All 4 test users available**: YES
