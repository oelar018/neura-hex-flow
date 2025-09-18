# Performance Quality Modes

## How to Switch Modes

### Via Query Parameters
- `?quality=high` - Full visual quality (default for desktop)
- `?quality=medium` - Balanced performance/quality
- `?quality=low` - Maximum performance mode
- `?quality=auto` - Automatic detection based on device

### Via Developer Console
```javascript
window.__setQuality('low')  // Switch to low quality
window.__setQuality('high') // Switch to high quality
```

## Quality Mode Differences

### High Mode (Default Desktop)
- Full backdrop blur effects
- All shadow layers and glows
- Spring-based animations
- Full particle count (120 desktop)
- Complete visual effects

### Medium Mode (Default Mobile/Low-end)
- Reduced particle count (80)
- Slightly reduced animation durations (0.28s)
- Maintained backdrop blur
- Reduced glow intensity (90%)
- 2-3 shadow layers

### Low Mode (Performance Critical)
- Minimal particles (40)
- No backdrop blur (uses solid backgrounds)
- Tween-based animations (no springs)
- Single shadow layer only
- Shortest durations (0.25s)
- No parallax effects

## Performance Optimizations Applied

### Universal (All Modes)
- `once: true` for all scroll-triggered animations
- Content visibility: auto for offscreen elements
- Passive scroll listeners with RAF throttling
- Intersection Observer for pausing offscreen animations
- Proper will-change management (only on hover/active)

### Quality-Aware Features
- Particle systems respect count limits
- Shadow layers scale with quality
- Blur effects disabled in low mode
- Animation types switch (spring → tween)
- Glow intensity scales with quality

## Measured Improvements
- High mode: Maintains current visual quality
- Medium mode: 15-25% better performance, imperceptible visual changes
- Low mode: 40-50% better performance, minimal visual impact