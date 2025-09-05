import React, {useEffect, useRef, useImperativeHandle, forwardRef} from "react";
import p5 from "p5";

type PerfMode = "auto" | "hi" | "med" | "low";

export type HexSculptProps = {
  rings?: number;          // number of concentric hex rings (desktop default chosen automatically)
  dotSize?: number;        // base dot radius in px
  glowStrength?: number;   // 0..1
  idleSpeed?: number;      // radians per second (very small)
  focusCount?: number;     // how many nearest dots brighten under cursor
  noiseAmt?: number;       // 0..1 for tiny shimmer
  perfMode?: PerfMode;
  className?: string;      // wrapper class
};

export type HexSculptHandle = { pause: () => void; resume: () => void; };

type Dot = { x: number; y: number; baseR: number; baseA: number; };

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function pickPerfMode(width: number): PerfMode {
  if (width < 480) return "low";
  if (width < 900) return "med";
  return "hi";
}

const HexSculptP5 = forwardRef<HexSculptHandle, HexSculptProps>(function HexSculptP5(
  {
    rings,
    dotSize = 3.0,
    glowStrength = 0.8,
    idleSpeed = 0.2,   // deg/sec; converted to rad/frame
    focusCount = 60,
    noiseAmt = 0.15,
    perfMode = "auto",
    className = ""
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5 | null>(null);
  const pausedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    pause() { pausedRef.current = true; },
    resume() { pausedRef.current = false; }
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const reduced = prefersReducedMotion();

    const instance = new p5((p: p5) => {
      let dots: Dot[] = [];
      let W = 0, H = 0;
      let S = 16;             // hex “size” (spacing scaler)
      let R = 10;             // rings
      let centerX = 0, centerY = 0;

      // pointer state (in local canvas coords)
      let mouseLX = 0, mouseLY = 0;
      let hasPointer = false;

      // perf scaling
      const _perf = perfMode === "auto" ? pickPerfMode(window.innerWidth) : perfMode;

      const scaleByPerf = (hi: number, med: number, low: number) => {
        if (_perf === "hi") return hi;
        if (_perf === "med") return med;
        return low;
      };

      const bg = "#0A0A0A";

      function computeRings() {
        // if user supplied rings, honor it; else choose by perf + viewport
        if (typeof rings === "number") return rings;
        const w = Math.min(window.innerWidth, 1400);
        if (_perf === "hi") return w > 1200 ? 12 : 10;
        if (_perf === "med") return 9;
        return 7;
      }

      function rebuild() {
        W = containerRef.current!.clientWidth;
        H = containerRef.current!.clientHeight;
        p.resizeCanvas(W, H, true);
        centerX = W / 2;
        centerY = H / 2;

        R = computeRings();
        S = scaleByPerf(22, 18, 14) * Math.min(1, W / 1200);

        dots = [];
        // build concentric axial rings around (0,0)
        // axial neighbors
        const dirs = [
          [1, 0], [1, -1], [0, -1],
          [-1, 0], [-1, 1], [0, 1]
        ];

        // ring 0 (center)
        dots.push({ x: 0, y: 0, baseR: dotSize + 0.8, baseA: 220 });

        for (let k = 1; k <= R; k++) {
          // start at cube coordinate on one hex corner
          let q = k, r = 0;
          for (let side = 0; side < 6; side++) {
            const dq = dirs[side][0];
            const dr = dirs[side][1];
            for (let step = 0; step < k; step++) {
              const X = S * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
              const Y = S * ((3 / 2) * r);
              const radial = k / R;
              const sizeJitter = (1 - radial) * 0.7;
              const a = 180 - radial * 120; // alpha fades outward
              dots.push({
                x: X,
                y: Y,
                baseR: dotSize + sizeJitter,
                baseA: a
              });
              q += dq; r += dr;
            }
          }
        }
      }

      p.setup = () => {
        const canvas = p.createCanvas(10, 10, p.P2D); // will be resized in rebuild()
        p.pixelDensity(1);
        rebuild();

        // pointer events
        containerRef.current!.addEventListener("pointermove", (e) => {
          const rect = (canvas.elt as HTMLCanvasElement).getBoundingClientRect();
          mouseLX = e.clientX - rect.left;
          mouseLY = e.clientY - rect.top;
          hasPointer = true;
        });
        containerRef.current!.addEventListener("pointerleave", () => {
          hasPointer = false;
        });

        // pause when off-screen
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              pausedRef.current = false;
            } else {
              pausedRef.current = true;
            }
          });
        }, { threshold: 0.01 });
        io.observe(containerRef.current!);

        window.addEventListener("resize", () => {
          rebuild();
        });
      };

      let t0 = performance.now();

      p.draw = () => {
        if (pausedRef.current) return;

        p.clear();
        p.background(bg);

        // center and tiny global rotation (very subtle)
        p.push();
        p.translate(centerX, centerY);

        const now = performance.now();
        const dt = (now - t0) / 1000; t0 = now;
        const idleRadPerSec = (idleSpeed * Math.PI) / 180; // convert deg/sec → rad/sec
        const idleRot = reduced ? 0 : idleRadPerSec * (now / 1000);

        // pointer → small tilt/parallax
        const px = hasPointer ? (mouseLX - centerX) / Math.max(180, W * 0.6) : 0;
        const py = hasPointer ? (mouseLY - centerY) / Math.max(180, H * 0.6) : 0;
        const tilt = reduced ? 0 : 0.10; // radians max (~6°)
        p.rotate(idleRot + px * tilt * 0.6); // yaw-ish; simple 2D

        p.noStroke();
        if ((p as any).blendMode) p.blendMode(p.ADD);

        // compute “focus” glow: sort a copy by distance to pointer (in sculpt space)
        const mx = (mouseLX - centerX);
        const my = (mouseLY - centerY);
        let nearest: number[] = [];
        if (hasPointer) {
          // sample by picking a subset for perf
          const step = dots.length > 2000 ? 2 : 1;
          for (let i = 0; i < dots.length; i += step) {
            const d = dots[i];
            const dx = d.x - mx;
            const dy = d.y - my;
            nearest.push(i << 20 | (dx*dx + dy*dy)); // pack dist in lower bits
          }
          // partial sort: just get top N by ascending dist
          nearest.sort((a, b) => (a & 0xFFFFF) - (b & 0xFFFFF));
        }

        const N = Math.min(focusCount, nearest.length);
        const focusIndex = new Set<number>();
        for (let i = 0; i < N; i++) {
          focusIndex.add(nearest[i] >> 20);
        }

        // draw lines are **not** requested; dots only
        // draw dots
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];

          // tiny shimmer via noise
          const n = noiseAmt > 0
            ? noiseAmt * 2 * (p.noise(d.x * 0.002 + now * 0.0002, d.y * 0.002) - 0.5)
            : 0;

          let r = d.baseR + n;
          let a = d.baseA;

          if (hasPointer && focusIndex.has(i)) {
            // compute exact distance for smooth falloff glow
            const dx = d.x - mx, dy = d.y - my;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const glowRadius = S * 6.0; // how far the glow influences
            const t = Math.max(0, 1 - dist / glowRadius);
            const ease = t * t * (3 - 2 * t); // smoothstep
            a = Math.min(255, d.baseA + ease * glowStrength * 160);
            r = d.baseR + ease * 1.1; // tiny “breathe”
          }

          p.fill(130, 255, 250, a); // cyan/teal-ish
          p.circle(d.x, d.y, r * 2);
        }

        p.pop();
      };
    }, containerRef.current);

    sketchRef.current = instance;

    return () => {
      try { sketchRef.current?.remove(); } catch {}
      sketchRef.current = null;
    };
  }, [rings, dotSize, glowStrength, idleSpeed, focusCount, noiseAmt, perfMode]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
});

export default HexSculptP5;
