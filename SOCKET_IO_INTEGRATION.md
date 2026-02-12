# 🔌 Socket.IO Integration Guide for Game Page

## Current Status: ✅ Socket.IO Ready

Your Socket.IO server is **fully initialized and operational**. The game page is ready for real-time multiplayer integration.

---

## 📍 Socket.IO Server Status

```
✅ Server initialized and stored in globalThis
✅ Web socket connections working
✅ Event emission functional
✅ Client can connect and join rooms
✅ Broadcasting to multiple players working
```

---

## 🎮 Game Page Integration Steps

### Step 1: Import Socket Functions

```typescript
// In your game page component
import { initSocket, onEvent, offEvent, emitEvent } from "@/lib/socket";
```

### Step 2: Initialize Socket on Mount

```typescript
useEffect(() => {
  // Initialize Socket.IO with user ID
  const socketInstance = initSocket(user?.userId);

  // Listen for game state updates
  onEvent("game-state-updated", (newGameState) => {
    setGameState(newGameState);
  });

  // Listen for opponent spin
  onEvent("opponent-spun", (data) => {
    // Handle opponent's spin
    console.log(`${data.winnerName} spun and won!`);
  });

  // Cleanup
  return () => {
    offEvent("game-state-updated");
    offEvent("opponent-spun");
  };
}, [user?.userId]);
```

### Step 3: Emit Spin Event

```typescript
const handleSpinComplete = async (winner: string, points: number) => {
  // Update local state
  setGameState((prev) => ({
    ...prev,
    players: prev.players.map((p) =>
      p.name === winner ? { ...p, score: p.score + points } : p,
    ),
  }));

  // Emit to server
  emitEvent("spin-complete", {
    roomId: room.id,
    userId: user.userId,
    winner,
    points,
    timestamp: Date.now(),
  });
};
```

---

## 🔗 Socket.IO Events Reference

### Client → Server Events

#### `spin-ready`

Sent when player initiates a spin

```typescript
emitEvent("spin-ready", {
  roomId: string,
  userId: string,
  round: number,
  timestamp: number,
});
```

#### `spin-complete`

Sent when wheel animation finishes

```typescript
emitEvent("spin-complete", {
  roomId: string,
  userId: string,
  winner: string,
  points: number,
  finalRotation: number,
  timestamp: number,
});
```

#### `game-reset`

Reset game for next round

```typescript
emitEvent("game-reset", {
  roomId: string,
  userId: string,
  round: number,
});
```

### Server → Client Events

#### `game-state-updated`

Broadcast when game state changes

```typescript
onEvent("game-state-updated", (data) => {
  // data.gameState: Updated game state
  // data.round: Current round
  // data.players: Updated player list with scores
  setGameState(data.gameState);
});
```

#### `opponent-spun`

Notify when opponent completes their spin

```typescript
onEvent("opponent-spun", (data) => {
  // data.opponentName: Name of opponent
  // data.winner: Name of winner
  // data.points: Points awarded
  // data.newScores: Updated scores
  // data.finalRotation: Wheel rotation

  // Handle opponent's result
  setResultCard({
    visible: true,
    winner: data.winner,
    points: data.points,
  });
});
```

#### `game-reset`

Notify for game reset

```typescript
onEvent("game-reset", (data) => {
  // Reset UI
  setGameState(data.gameState);
  setIsSpinning(false);
  setResultCard({ visible: false, winner: "", points: 0 });
});
```

#### `round-complete`

Notify when round/game is complete

```typescript
onEvent("round-complete", (data) => {
  // data.round: Round number
  // data.winner: Winner of round
  // data.gameWinner: Overall game winner (if final round)
  // data.finalScores: Final player scores
});
```

---

## 📝 API Integration

### GET `/api/rooms/{roomId}`

Fetch room and game state

```typescript
const fetchGameState = async () => {
  const response = await axios.get(`/api/rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { room } = response.data;

  // Map room data to game state
  setGameState({
    round: room.currentRound || 1,
    totalRounds: room.totalRounds || 5,
    players:
      room.players?.map((p) => ({
        id: p.userId,
        name: p.name,
        score: p.score || 0,
        isCurrentPlayer: p.userId === user.userId,
        isCurrentTurn: p.userId === room.currentTurn,
      })) || [],
    gameStatus: room.status || "idle",
  });
};
```

### POST `/api/wheel/spin`

Record spin and get result

```typescript
const recordSpin = async (winner: string) => {
  const response = await axios.post(
    `/api/wheel/spin`,
    {
      roomId,
      userId: user.userId,
      winner,
      points: 10,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
};
```

### PUT `/api/rooms/{roomId}`

Update game state

```typescript
const updateGameState = async (updates: any) => {
  const response = await axios.put(`/api/rooms/${roomId}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.room;
};
```

---

## 🎯 Full Integration Example

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import { initSocket, onEvent, offEvent, emitEvent } from "@/lib/socket";
import SpinningWheelGame from "@/app/(protected)/game/page";

interface Room {
  id: string;
  players: any[];
  currentRound: number;
  totalRounds: number;
  currentTurn: string;
  status: string;
}

export default function GameIntegration() {
  const router = useRouter();
  const params = useParams();
  const roomId = (params?.roomId || "") as string;
  const { user, token } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial game state
  useEffect(() => {
    if (!roomId || !user) return;

    const fetchRoom = async () => {
      try {
        const response = await axios.get(`/api/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoom(response.data.room);
      } catch (error) {
        console.error("Failed to fetch room:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, user, token]);

  // Initialize Socket.IO
  useEffect(() => {
    if (!user) return;

    const socketInstance = initSocket(user.userId);

    // Listen for game state updates
    const handleGameUpdate = (data: any) => {
      setRoom(data.room);
    };

    // Listen for opponent spin
    const handleOpponentSpin = (data: any) => {
      setRoom(prev => ({
        ...prev!,
        players: data.updatedPlayers,
        currentTurn: data.nextTurn
      }));

      // Update game component state
      // (pass via props or state management)
    };

    onEvent("game-state-updated", handleGameUpdate);
    onEvent("opponent-spun", handleOpponentSpin);

    return () => {
      offEvent("game-state-updated", handleGameUpdate);
      offEvent("opponent-spun", handleOpponentSpin);
    };
  }, [user]);

  // Handle spin completion
  const handleSpinComplete = async (winner: string, points: number) => {
    try {
      // Record spin on server
      const response = await axios.post(
        `/api/wheel/spin`,
        {
          roomId,
          userId: user?.userId,
          winner,
          points
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit to other players
      emitEvent("spin-complete", {
        roomId,
        userId: user?.userId,
        winner,
        points,
        timestamp: Date.now()
      });

      // Update room state
      setRoom(response.data.room);
    } catch (error) {
      console.error("Failed to record spin:", error);
    }
  };

  if (loading) {
    return <div>Loading game...</div>;
  }

  if (!room) {
    return <div>Room not found</div>;
  }

  // Map room to game state
  const gameState = {
    round: room.currentRound,
    totalRounds: room.totalRounds,
    players: room.players.map((p: any) => ({
      id: p.userId,
      name: p.name,
      score: p.score,
      isCurrentPlayer: p.userId === user?.userId,
      isCurrentTurn: p.userId === room.currentTurn
    })),
    gameStatus: room.status
  };

  return (
    <SpinningWheelGame
      initialGameState={gameState}
      onSpinComplete={handleSpinComplete}
      onGameReset={() => {
        emitEvent("game-reset", { roomId });
      }}
    />
  );
}
```

---

## 🔄 Real-Time Score Updates

```typescript
// Listen for score updates in real-time
onEvent("scores-updated", (data) => {
  setGameState((prev) => ({
    ...prev,
    players: data.players.map((p: any) => ({
      ...p,
      score: p.score,
      isCurrentTurn: p.userId === data.currentTurn,
    })),
  }));
});

// Listen for leaderboard changes
onEvent("leaderboard-updated", (data) => {
  // Update leaderboard with new rankings
  const sortedPlayers = data.players.sort((a, b) => b.score - a.score);
  setLeaderboard(sortedPlayers);
});
```

---

## 🎯 Turn Management

```typescript
// Get whose turn it is
const isMyTurn = gameState.players.find(
  (p) => p.isCurrentPlayer,
)?.isCurrentTurn;

// Listen for turn changes
onEvent("turn-changed", (data) => {
  setGameState((prev) => ({
    ...prev,
    players: prev.players.map((p) => ({
      ...p,
      isCurrentTurn: p.id === data.nextPlayerId,
    })),
  }));
});

// Emit turn complete
emitEvent("turn-complete", {
  roomId,
  userId: user?.userId,
  nextPlayerId: nextPlayer.id,
});
```

---

## 🏆 Winner Detection

```typescript
// Listen for round winner
onEvent("round-winner", (data) => {
  const winner = gameState.players.find((p) => p.name === data.winnerName);

  // Show result card
  setResultCard({
    visible: true,
    winner: winner?.name || "Unknown",
    points: data.points,
  });

  // Check if this was the final round
  if (gameState.round === gameState.totalRounds) {
    // Show game winner
    onEvent("game-finished", (finalData) => {
      showGameWinnerModal(finalData.gameWinner);
    });
  }
});
```

---

## 🔊 Sound & Notifications

```typescript
// Play sound on opponent spin
onEvent("opponent-spun", (data) => {
  // Opponent's wheel finished spinning
  playOppponentSpinSound();

  // Show notification
  showNotification({
    title: `${data.opponentName} spun!`,
    message: `${data.winner} won ${data.points} points!`,
  });
});

// Play sound on opponent's turn
onEvent("turn-changed", (data) => {
  if (data.nextPlayerId !== user?.userId) {
    playOpponentTurnSound();
  }
});
```

---

## ⚠️ Error Handling

```typescript
// Handle spin errors
try {
  await recordSpin(winner);
} catch (error) {
  if (error.response?.status === 409) {
    // Conflict - another player already spun
    console.log("Someone else spun first");
  } else if (error.response?.status === 403) {
    // Not your turn
    console.log("Not your turn yet");
  } else {
    // Other error
    showErrorToast("Failed to record spin");
  }
}

// Handle connection loss
onEvent("disconnect", () => {
  showWarning("Connection lost. Reconnecting...");
  // Auto-reconnect handled by Socket.IO client
});

onEvent("connect", () => {
  showSuccess("Connected!");
  // Resync game state
  fetchRoom();
});
```

---

## 🔐 Authentication & Validation

```typescript
// All requests include auth header
const headers = {
  Authorization: `Bearer ${token}`,
};

// Validate user owns the spin
if (userId !== user?.userId) {
  throw new Error("Unauthorized spin attempt");
}

// Validate it's their turn
if (!isMyTurn) {
  throw new Error("Not your turn");
}

// Validate room is active
if (room.status !== "active") {
  throw new Error("Room is not active");
}
```

---

## 📊 State Sync Strategy

```typescript
// Optimistic update pattern
const optimisticSpin = async (winner: string) => {
  // Update UI immediately
  setGameState((prev) => ({
    ...prev,
    players: prev.players.map((p) =>
      p.name === winner ? { ...p, score: p.score + 10 } : p,
    ),
  }));

  try {
    // Confirm with server
    const response = await recordSpin(winner);

    // Update with server response (if different)
    setGameState(response.gameState);
  } catch (error) {
    // Revert optimistic update on error
    fetchRoom();
  }
};
```

---

## 🎯 Testing Socket Events

```bash
# Terminal 1 - Start server
npm run dev

# Terminal 2 - Open two browser windows
# Window 1: User A joins room
# Window 2: User B joins same room

# Test events:
# 1. User A spins
# 2. User B receives "opponent-spun" event
# 3. Both see updated scores
# 4. Turn changes to User B
# 5. User B spins
# 6. User A receives update
```

---

## 📋 Checklist

- [ ] Socket.IO imported in game component
- [ ] `initSocket` called on mount
- [ ] Event listeners attached with `onEvent`
- [ ] Event listeners cleaned up in `useEffect` cleanup
- [ ] Spin event emitted with proper data
- [ ] Game state synced from API
- [ ] Real-time updates displayed
- [ ] Error handling for failed spins
- [ ] Loading states during API calls
- [ ] Leaderboard updates in real-time
- [ ] Turn management working
- [ ] Winner detection and celebration
- [ ] Reconnection handling
- [ ] Disconnect/error notifications

---

## 🚀 Deployment Notes

1. **Environment Variables**

   ```
   NEXT_PUBLIC_API_URL=your_domain
   NEXT_PUBLIC_SOCKET_URL=your_domain
   ```

2. **Socket.IO Settings for Production**

   ```typescript
   // Ensure transports work in production
   transports: ["websocket", "polling"];
   ```

3. **CORS Configuration**
   ```typescript
   // Already configured in server
   cors: {
     origin: "*",
     methods: ["GET", "POST"]
   }
   ```

---

## 📚 Additional Resources

- Socket.IO Docs: https://socket.io/docs/
- Socket.IO Client: https://socket.io/docs/client-api/
- Real-time Games with Socket.IO: https://socket.io/blog/

---

## 🆘 Troubleshooting

### Issue: Socket not connecting

```typescript
// Check browser console for errors
// Verify Socket.IO server is running
// Check /api/init endpoint returns success
```

### Issue: Events not received

```typescript
// Verify event name matches exactly
// Check user is in correct room
// Verify Socket.IO instance exists
```

### Issue: Scores not updating

```typescript
// Check API response includes updated scores
// Verify onEvent listener is attached
// Check state update isn't being blocked
```

---

## 📞 Support

For Socket.IO issues, check:

1. Server logs in terminal
2. Browser console DevTools
3. Network tab for API calls
4. Socket.IO admin panel (if enabled)

---

**Last Updated**: February 10, 2026
**Status**: ✅ Ready for Integration
**Socket.IO Server**: ✅ Running & Initialized
