# 🎨 Game Page Design System Reference

## Color Palette

### Background

```css
/* Main gradient background */
background: linear-gradient(to bottom right, #111827, #1f2937, #111827);
/* Equivalent Tailwind */
@apply bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900;
```

### Wheel Colors (6 segments)

```javascript
const WHEEL_COLORS = [
  "#FF6B6B", // Red - vibrant, energetic
  "#4ECDC4", // Teal - cool, fresh
  "#45B7D1", // Blue - calm, trusted
  "#FFA502", // Orange - warm, exciting
  "#9B59B6", // Purple - creative, premium
  "#1ABC9C", // Turquoise - modern, cool
];
```

### Accent Colors

```css
/* Gold - premium, winner, highlight */
#FFD700    /* CSS: gold, elegant */

/* Blue - primary action, current turn */
#3B82F6    /* Tailwind: blue-500 */
#2563EB    /* Tailwind: blue-600 */

/* Green - success, status */
#10B981    /* Tailwind: green-500 */

/* Cyan - secondary accent */
#06B6D4    /* Tailwind: cyan-500 */
```

### Text Colors

```css
/* Primary text */
white      /* Main text, headings */

/* Secondary text */
#9CA3AF    /* Tailwind: gray-400 - labels, hints */

/* Tertiary text */
#6B7280    /* Tailwind: gray-500 - subtle info */
```

---

## Typography

### Font Stack

```css
font-family: "Inter", system-ui, sans-serif;
```

### Text Sizes

| Element    | Size        | Weight   | Color      |
| ---------- | ----------- | -------- | ---------- |
| Page Title | `text-2xl`  | bold     | white      |
| Card Title | `text-lg`   | semibold | white      |
| Body Text  | `text-base` | normal   | white      |
| Small Text | `text-sm`   | normal   | gray-400   |
| Tiny Text  | `text-xs`   | normal   | gray-400   |
| Wheel Text | `16px` bold | -        | white      |
| Badge Text | `text-xs`   | semibold | white/blue |

---

## Component Styling

### Cards (Glassmorphism)

```tailwind
backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6
hover:bg-white/15 transition-colors
```

**Variants:**

```tailwind
/* Highlighted card */
bg-white/15 border-white/30

/* Current player */
bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border-yellow-400/50

/* Current turn */
bg-blue-500/20 border-blue-400/50

/* Success state */
bg-green-500/20 border-green-400/50
```

### Buttons

```tailwind
/* Primary - Spin Button */
px-8 py-4 rounded-xl font-bold text-lg
bg-gradient-to-r from-blue-600 to-blue-500
hover:from-blue-700 hover:to-blue-600
hover:shadow-lg hover:shadow-blue-500/50
hover:scale-105 active:scale-95
transition-all

/* Disabled state */
bg-gray-600 cursor-not-allowed scale-95

/* Secondary */
px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg
```

### Badges

```tailwind
/* Your Turn */
px-3 py-1 bg-blue-500/30 border border-blue-400/50
rounded-full text-xs font-semibold text-blue-300

/* In Progress */
px-3 py-1 bg-green-500/20 border border-green-400/50
rounded-full text-xs font-semibold text-green-300
```

---

## Layout & Spacing

### Container

```tailwind
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
```

### Grid Layouts

```tailwind
/* Main content grid - 3 columns on desktop */
grid grid-cols-1 lg:grid-cols-3 gap-8

/* Leaderboard list */
space-y-4

/* Header flexbox */
flex items-center justify-between gap-4
```

### Spacing Scale

- `gap-2` = 8px - small gaps
- `gap-4` = 16px - normal gaps
- `gap-6` = 24px - large gaps
- `gap-8` = 32px - section gaps
- `p-4` = 16px padding
- `p-6` = 24px padding

---

## Effects & Shadows

### Shadows

```css
/* Card shadow */
shadow-lg

/* Glow effect */
shadow-blue-500/50     /* Colored glow */
shadow-yellow-400/50   /* Gold glow */
```

### Filters

```css
/* Backdrop blur */
backdrop-blur-md       /* Medium blur ~12px */

/* Glow blur */
blur-3xl               /* Very large blur ~64px */

/* Drop shadows */
drop-shadow-lg
```

### Blurs & Transparency

```tailwind
/* Background orbs */
bg-blue-500/10 blur-3xl animate-pulse
bg-purple-500/10 blur-3xl animate-pulse

/* Border transparency */
border-white/10 to border-white/30
border-blue-400/50
border-yellow-400/50
```

---

## Responsive Design

### Breakpoints

```tailwind
/* Tailwind breakpoints */
sm:  640px   /* Tablet */
md:  768px
lg:  1024px  /* Desktop */
xl:  1280px
2xl: 1536px
```

### Canvas Sizing Logic

```javascript
// Mobile (< 640px)
Math.min(280, width - 40)  // Max 280px with 20px margin

// Tablet (640-1024px)
380px

// Desktop (> 1024px)
400px
```

### Layout Adjustments

```tailwind
/* Single column on mobile, 3 columns on desktop */
grid grid-cols-1 lg:grid-cols-3

/* Hide on mobile */
hidden sm:block

/* Smaller text on mobile */
text-lg sm:text-2xl

/* Adjust padding */
px-4 sm:px-6 lg:px-8
```

---

## Animations

### Keyframe Animations

```css
/* Confetti falling */
@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Pulse effect (background orbs) */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Tailwind Animations

```tailwind
/* Bounce - trophy emoji */
animate-bounce

/* Spin - loading spinner */
animate-spin

/* Pulse - background orbs */
animate-pulse

/* Slide in - result card */
animate-in slide-in-from-bottom-10 duration-500

/* Custom confetti animation */
animation: fall 2-3s linear 0-200ms forwards;
```

### Transitions

```tailwind
/* Smooth state changes */
transition-all              /* All properties */
transition-colors           /* Color only */
transition-opacity          /* Opacity only */

/* Timing */
duration-100                /* 100ms */
duration-200                /* 200ms - default hover */
duration-500                /* 500ms - card animations */

/* Easing */
ease-in                     /* Start slow */
ease-out                    /* End slow */
ease-in-out                 /* Both slow */
ease-linear                 /* Linear */
```

---

## Canvas Styling Details

### Wheel Colors & Gradients

```javascript
// Segment fill
ctx.fillStyle = WHEEL_COLORS[index];

// Golden border
ctx.strokeStyle = "#FFD700";
ctx.lineWidth = 8;

// Glow effect
ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
ctx.shadowBlur = 20;

// Text in segments
ctx.fillStyle = "#fff";
ctx.font = "bold 16px Inter, sans-serif";

// Golden pointer (triangle at top)
ctx.fillStyle = "#FFD700";
ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
ctx.shadowBlur = 15;
```

---

## Interactive States

### Button States

```css
/* Normal */
bg-gradient-to-r from-blue-600 to-blue-500
cursor-pointer

/* Hover */
from-blue-700 to-blue-600
shadow-lg shadow-blue-500/50
scale-105

/* Active/Press */
scale-95

/* Disabled */
bg-gray-600
cursor-not-allowed
opacity-50
```

### Card States

```tailwind
/* Default */
bg-white/10 border-white/20

/* Hover */
bg-white/15 transition-colors

/* Active (current turn) */
border-blue-400/50 bg-blue-500/20

/* Highlighted (you) */
bg-gradient-to-r from-yellow-500/20 to-yellow-400/10
border-yellow-400/50
```

---

## Icon Usage (lucide-react)

```tsx
// Size reference
<Icon className="w-4 h-4" />  // Small - labels
<Icon className="w-5 h-5" />  // Medium - buttons
<Icon className="w-6 h-6" />  // Large - cards
<Icon className="w-8 h-8" />  // XL - headers

// Color reference
<Icon className="text-blue-500" />    // Primary blue
<Icon className="text-yellow-400" />  // Gold
<Icon className="text-green-400" />   // Success green
<Icon className="text-white" />       // Default white
<Icon className="text-gray-400" />    // Subtle gray
```

**Icons Used:**

- `ArrowLeft` - Back button
- `Users` - Player count
- `Trophy` - Leaderboard header
- `Zap` - Spin button icon
- `Loader2` - Loading spinner
- `Volume2` - Sound on
- `VolumeX` - Sound off

---

## Depth & Layering

### Z-Index Levels

```tailwind
z-10  /* Header - sticky, always visible */
z-20  /* Main content */
z-50  /* Modal/Result card - full screen overlay */
```

### Layering with Absolute/Relative

```tailwind
/* Background blur effect */
absolute inset-0 overflow-hidden pointer-events-none

/* Glow behind wheel */
absolute inset-0 rounded-full blur-2xl

/* Result card overlay */
fixed inset-0 flex items-end justify-center
```

---

## Accessibility Considerations

### Color Contrast

- ✅ White (#fff) on gray-900 - WCAG AAA
- ✅ Blue-500 on gray-900 - WCAG AA
- ✅ Gold (#FFD700) on gray-900 - WCAG AA
- ✅ Gray-400 on gray-900 - WCAG AA

### Interactive Elements

- ✅ Minimum 44x44px touch targets
- ✅ Clear focus states (hover effects)
- ✅ Disabled states visually distinct
- ✅ Loading states clearly indicated

### Text Readability

- ✅ Font size minimum 16px on mobile
- ✅ Line height comfortable spacing
- ✅ Sufficient color contrast
- ✅ Clear hierarchies with font weight

---

## Performance Notes

### CSS Optimization

- Uses Tailwind for tree-shaking
- No unused CSS in build
- Classes grouped for efficiency
- Gradients use CSS (not images)

### Canvas Performance

- Only redraws on state changes
- Uses `requestAnimationFrame` for smooth animation
- Efficient path drawing
- Minimal shadow/blur for performance

### Animation Performance

- Uses transforms (GPU accelerated)
- Uses opacity for fading
- Avoids position/size changes during animation
- Auto-cleanup of confetti elements

---

## Customization Guide

### To Change Wheel Colors

```javascript
const WHEEL_COLORS = [
  "#YOUR_COLOR_1",
  "#YOUR_COLOR_2",
  // ... etc
];
```

### To Change Animation Duration

```javascript
const spinDuration = 3500; // milliseconds
```

### To Change Segment Count

```javascript
// Add/remove players from gameState.players array
// Canvas automatically recalculates segment angle
const segmentAngle = 360 / gameState.players.length;
```

### To Change Card Styling

```tailwind
/* Just update the classes */
backdrop-blur-md bg-white/10 border border-white/20
/* to */
backdrop-blur-lg bg-white/20 border border-white/30
```

---

## Browser Rendering Notes

### Stacking Context

- Fixed header creates new stacking context
- Result card overlay above all
- Confetti particles floating above

### Repaints & Reflows

- Minimized through CSS containment
- Canvas updates isolated
- Smooth 60fps animation target

### GPU Acceleration

- Transform: scale, rotate ✅ GPU
- Opacity changes ✅ GPU
- Filter blur ✅ GPU
- Shadow effects ⚠️ CPU (minimal)

---

## Design Tokens Summary

```
Colors:     6 wheel + 4 primary + 3 text = 13
Typography: 7 sizes × 3 weights = 21 combinations
Spacing:    11 values (2-8 in increments)
Shadows:    3 levels
Borders:    2 weights (3px, 8px)
Blurs:      4 levels (md, 2xl, 3xl)
Radius:     2 values (lg, xl)
```

---

**Last Updated**: February 10, 2026
**Component**: `/app/(protected)/game/page.tsx`
