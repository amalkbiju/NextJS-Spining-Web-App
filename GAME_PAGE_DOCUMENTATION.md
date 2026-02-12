# 🎮 Spinning Wheel Game Page Documentation

## Overview

A modern, fully-featured spinning wheel game page built with Next.js, TypeScript, React, Canvas API, and Tailwind CSS. Features smooth animations, real-time multiplayer support via Socket.IO, and a beautiful dark theme design.

---

## 📋 File Location

```
/app/(protected)/game/page.tsx
```

---

## ✨ Features

### 🎨 Visual Design

- **Dark Theme**: Gradient background (gray-900 to gray-800)
- **Glassmorphism Cards**: White/10 background with backdrop blur effects
- **Golden Wheel**: Premium gradient colors with golden border and glow effects
- **Responsive Layout**: Mobile (300px), Tablet (350px), Desktop (400px) canvas sizes
- **Animated Background**: Pulsing gradient orbs for depth

### 🎯 Game Components

#### 1. **Header Section**

- Back button with hover effects
- Game title "Spin & Win"
- Round counter (Round X of Y)
- Sound toggle button
- Player count display
- Sticky positioning with backdrop blur

#### 2. **Spinning Wheel Canvas**

- 6 colorful segments (Red, Teal, Blue, Orange, Purple, Turquoise)
- Player names displayed in each segment
- Golden border with 8px thickness
- Golden pointer at top
- Center glow effect
- Smooth rotation animation
- Responsive sizing based on viewport

#### 3. **Player Info Sidebar (Left)**

- Current player card with avatar
- "Your Turn" badge (blue gradient)
- Score display with progress bar
- Other players' quick info cards
- Color-coded turns (blue border for current turn)

#### 4. **Game Status Card**

- Current game status indicator
- List of active players with avatars
- In Progress status badge

#### 5. **Leaderboard (Right)**

- Sorted by score (highest first)
- Position badges (1st, 2nd, etc.)
- Player names and role (You/Opponent)
- Point totals in yellow
- Special styling for:
  - Current player (gold gradient background)
  - Current turn player (blue background)
  - Other players (subtle white/10 background)

#### 6. **Spin Button**

- Large, prominent blue gradient button
- Disabled state during spinning (gray)
- Icon animation (Zap icon with spin indicator)
- "Spinning..." text during animation
- Hover scale effect for interactivity

#### 7. **Result Card**

- Animated slide-up from bottom
- Trophy emoji animation
- Winner name display
- Points awarded display (+10)
- Gold colored points text
- Continue button to dismiss

#### 8. **Confetti Animation**

- 20 confetti pieces on win
- Random emoji selection (🎉, 🏆, ⭐, ✨, 🎊)
- Falling animation with rotation
- 2+ second duration
- Auto-cleanup

### 🎬 Animations

#### Wheel Spin

```javascript
- Duration: 3.5 seconds
- Total rotation: 5+ full rotations + random offset
- Easing: ease-out cubic (smooth deceleration)
- Sound effect: Optional beep tone (mutable)
```

#### Result Card

```javascript
- Entrance: slide-in-from-bottom-10
- Duration: 500ms
- Trophy bounce effect on continuous animation
```

#### Confetti

```javascript
- Fall animation: translateY(100vh) + rotate(360deg)
- Duration: 2-3 seconds
- Random delay: 0-200ms stagger
```

---

## 🔧 Component Props & State

### GameState Interface

```typescript
interface GameState {
  round: number; // Current round (1-5)
  totalRounds: number; // Total rounds in game (5)
  players: Player[]; // Array of player objects
  gameStatus: string; // 'idle' | 'spinning' | 'finished'
  winner?: string; // Winner's name
}

interface Player {
  id: string; // Unique player ID
  name: string; // Player name
  avatar?: string; // Avatar URL (optional)
  score: number; // Current score
  isCurrentPlayer: boolean; // Is this the viewing player
  isCurrentTurn: boolean; // Is it their turn to spin
}
```

### State Variables

```typescript
const [gameState, setGameState] = useState<GameState>;
const [rotation, setRotation] = useState(0);
const [isSpinning, setIsSpinning] = useState(false);
const [resultCard, setResultCard] = useState<{ visible; winner; points }>;
const [showConfetti, setShowConfetti] = useState(false);
const [isMuted, setIsMuted] = useState(false);
const [canvasSize, setCanvasSize] = useState(400);
```

---

## 🎨 Color Palette

### Wheel Segments

```javascript
const WHEEL_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA502", // Orange
  "#9B59B6", // Purple
  "#1ABC9C", // Turquoise
];
```

### UI Colors

- **Background**: `gray-900` to `gray-800`
- **Cards**: `white/10` with `backdrop-blur-md`
- **Accent**: `blue-500` to `blue-600`
- **Success**: `green-500/20`
- **Gold**: `#FFD700` (wheel & points)
- **Primary Text**: `white`
- **Secondary Text**: `gray-400`

---

## 📱 Responsive Breakpoints

| Breakpoint          | Canvas Size | Layout        |
| ------------------- | ----------- | ------------- |
| Mobile (<640px)     | 300px       | Single column |
| Tablet (640-1024px) | 350px       | Single column |
| Desktop (>1024px)   | 400px       | 3-column grid |

---

## 🎯 Key Functions

### `drawWheel(currentRotation: number)`

Renders the spinning wheel on canvas with:

- Player segments with colors
- Player names
- Golden border
- Center glow effect
- Golden pointer at top

### `spinWheel()`

Initiates the spin animation:

- Calculates random final rotation
- Animates over 3.5 seconds
- Uses cubic ease-out function
- Determines winner based on rotation
- Shows result card
- Plays sound effect
- Triggers confetti

### `playWinSound()`

Creates a simple beep using Web Audio API:

- Oscillator: 800Hz → 400Hz
- Duration: 100ms
- Mutable via isMuted state

---

## 🔗 Integration Points

### Socket.IO Events

When integrated with actual game logic:

```typescript
// Listen for game state updates
onEvent("game-state-updated", (newState) => {
  setGameState(newState);
});

// Emit spin ready
emitEvent("spin-ready", { roomId, userId });

// Listen for opponent spin
onEvent("opponent-spun", (data) => {
  setGameState(data.state);
  showResultCard(data.winner);
});
```

### API Endpoints

```
POST /api/wheel/spin      - Record spin result
GET  /api/rooms/{id}      - Get room/game state
PUT  /api/rooms/{id}      - Update game state
```

---

## 🎨 Tailwind CSS Classes Used

**Layout**:

- `grid grid-cols-1 lg:grid-cols-3` - 3-column grid
- `backdrop-blur-md` - Glassmorphism
- `sticky top-0` - Fixed header
- `relative z-10 z-20 z-50` - Layering

**Effects**:

- `shadow-lg hover:shadow-blue-500/50` - Glowing shadows
- `blur-3xl animate-pulse` - Background orbs
- `rounded-full` - Circular shapes
- `gradient-to-*` - Gradient backgrounds

**Animations**:

- `animate-bounce` - Trophy animation
- `animate-spin` - Loading spinner
- `animate-in slide-in-from-bottom-10` - Result card
- `transition-all` - Smooth state changes

---

## 📊 Game Logic Flow

```
1. Page Loads
   ↓
2. Canvas renders wheel with player names
   ↓
3. User clicks "Spin the Wheel"
   ↓
4. Button disabled, spinner starts
   ↓
5. Wheel animates (3.5 seconds)
   ↓
6. Winner calculated based on final rotation
   ↓
7. Result card slides up with trophy
   ↓
8. Confetti falls (2 seconds)
   ↓
9. Sound plays (if not muted)
   ↓
10. Points added to winner's score
    ↓
11. User continues to next round
```

---

## 🔊 Audio

**Sound Effect**:

- Frequency: 800Hz → 400Hz sweep
- Duration: 100ms
- Mutable toggle in header
- Uses Web Audio API (fallback-safe)

---

## 🚀 Performance Optimizations

1. **Canvas Rendering**: Only redraws on state changes
2. **Animation Loop**: Uses `requestAnimationFrame`
3. **Responsive**: Debounced resize listener
4. **Confetti**: Limited to 20 pieces, auto-cleanup
5. **Refs**: Used for canvas and animation IDs
6. **Callbacks**: Memoized with `useCallback` to prevent re-renders

---

## 🛠️ Future Enhancements

1. **Sound Library**: Replace Web Audio with actual sound files
2. **Particle Effects**: More elaborate confetti system
3. **Achievements**: Unlock special badges
4. **Power-ups**: Temporary score multipliers
5. **Custom Wheel**: Player-created custom segments
6. **Animations**: More sophisticated easing functions
7. **Accessibility**: ARIA labels, keyboard controls
8. **i18n**: Multi-language support

---

## 📝 Code Example: Using in Room Page

```typescript
// In your room page component
import SpinningWheelGame from '@/app/(protected)/game/page';

// Or navigate to it
<Link href="/game">
  <button>Start Playing</button>
</Link>
```

---

## 🐛 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements**:

- Canvas API support
- CSS Grid support
- Backdrop Filter support
- Web Audio API (optional, with fallback)

---

## 📄 License

Part of the Spin & Win game application.

---

## 👨‍💻 Developer Notes

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4
- **Canvas**: Native Canvas 2D API
- **State Management**: React Hooks
- **Type Safety**: Full TypeScript
- **Icons**: lucide-react

---

### Last Updated

February 10, 2026
