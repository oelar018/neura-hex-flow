import React, { useEffect, useRef } from "react";

type PerfMode = "auto" | "hi" | "med" | "low";

type Props = {
  rings?: number;          // total concentric rings
  dotSize?: number;        // base dot radius (px)
  glowStrength?: number;   // 0..1
  idleSpeedDeg?: number;   // small degrees/sec
  perfMode?: PerfMode;
  className?: string;
  shimmer?: number;        // 0..1 tiny noise shimmer
};

type Dot = { x: number; y: number; r: number; a: number; ring: number };

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export default function HexDotsCanvas({
  rings,
  dotSize = 3,
  glowStrength = 0.8,
  idleSpeedDeg = 0.18,
  perfMode = "auto",
  className = "",
  shimmer = 0.12,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, cx = 0, cy = 0;

    let dots: Dot[] = [];
    let S = 20; // spacing scaler
    let R = 10; // rings
    const pointer = { x: 0, y: 0, has: false };

    const reduced = prefersReducedMotion();

    // perf mode
    const pm: PerfMode =
      perfMode === "auto"
        ? (window.innerWidth < 480 ? "low" : window.innerWidth < 900 ? "med" : "hi")
        : perfMode;

    function chooseRings() {
      if (typeof rings === "number") return rings;
      if (pm === "hi") return 13;
      if (pm === "med") return 10;
      return 8;
    }

    function resize() {
      const rect = wrap.getBoundingClientRect();
      W = Math.max(1, rect.width | 0);
      H = Math.max(1, rect.height | 0);
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;

      R = chooseRings();

      // Scale lattice to sit comfortably in hero (≈ 70% of min dimension)
      const target = Math.min(W, H) * 0.70;
      S = (target * 0.5) / R; // empirically balanced

      buildDots();
    }

    // Build perfect concentric hex rings (axial coords)
    function buildDots() {
      dots = [];
      // inner hollow radius in rings (subtle hole like neura.ai)
      const hollow = Math.max(0, Math.round(R * 0.18)); // ~18% of radius

      // axial directions
      const dirs = [
        [1, 0], [1, -1], [0, -1],
        [-1, 0], [-1, 1], [0, 1],
      ];

      // center only if hollow == 0
      if (hollow === 0) {
        dots.push({ x: 0, y: 0, r: dotSize + 0.8, a: 230, ring: 0 });
      }

      for (let k = 1; k <= R; k++) {
        if (k <= hollow) continue; // skip inner hollow rings
        // start at one corner
        let q = k, r = 0;
        for (let side = 0; side < 6; side++) {
          const [dq, dr] = dirs[side];
          for (let step = 0; step < k; step++) {
            const X = S * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
            const Y = S * ((3 / 2) * r);
            const radial = k / R;

            // inner brighter, outer dimmer (clean gradient)
            const alpha = 220 - radial * 150; // 220 → 70
            const radius = dotSize + (1 - radial) * 0.65;

            dots.push({ x: X, y: Y, r: radius, a: alpha, ring: k });
            q += dq; r += dr;
          }
        }
      }
    }

    function onMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left - cx;
      pointer.y = e.clientY - rect.top - cy;
      pointer.has = true;
    }
    function onLeave() { pointer.has = false; }

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    // pause off-screen
    let paused = false;
    const io = new IntersectionObserver((entries) => {
      paused = !entries[0].isIntersecting;
    }, { threshold: 0.01 });
    io.observe(wrap);

    window.addEventListener("resize", resize);
    resize();

    const start = performance.now();

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (paused) return;

      const now = performance.now();
      const t = (now - start) / 1000;

      // clear & bg
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0A0A0A";
      ctx.fillRect(0, 0, W, H);

      // transform to center
      ctx.save();
      ctx.translate(cx, cy);

      // tiny idle rotation + slight pointer yaw (like parallax)
      const idle = reduced ? 0 : ((idleSpeedDeg * Math.PI) / 180) * t;
      const tilt = reduced ? 0 : 0.10; // ~6°
      const px = pointer.has ? pointer.x / Math.max(220, W * 0.6) : 0;
      ctx.rotate(idle + px * tilt * 0.6);

      // choose a small neighborhood to glow (nearest N) for crisp focus
      let nearest: number[] = [];
      if (pointer.has) {
        // sample step for perf on dense lattices
        const step = dots.length > 2500 ? 2 : 1;
        for (let i = 0; i < dots.length; i += step) {
          const d = dots[i];
          const dx = d.x - pointer.x, dy = d.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          // pack index & distance to sort quickly
          nearest.push((i << 1) ^ (dist2 >>> 1));
        }
        nearest.sort((a, b) => (a & 0x7FFFFFFF) - (b & 0x7FFFFFFF));
      }
      const focusSet = new Set<number>();
      const N = Math.min(nearest.length, Math.round(55)); // ~55 focus dots
      for (let i = 0; i < N; i++) focusSet.add(nearest[i] >> 1);

      // draw (additive-ish by alpha layering)
      const glowRadius = S * 5.5;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        // base
        let a = d.a;
        let r = d.r;

        // tiny shimmer (noise-free: time sinusoidal on ring)
        if (!reduced && shimmer > 0) {
          const s = Math.sin((t * 0.9) + d.ring * 0.6) * shimmer; // -s..+s
          r += s * 0.6;
          a += s * 18;
        }

        // focus glow (smoothstep falloff)
        if (pointer.has && focusSet.has(i)) {
          const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
          const tglow = Math.max(0, 1 - dist / glowRadius);
          const ease = tglow * tglow * (3 - 2 * tglow);
          a = Math.min(255, a + ease * glowStrength * 170);
          r = r + ease * 1.2;
        }

        // fill
        ctx.fillStyle = `rgba(130,255,250,${Math.max(0, Math.min(1, a / 255))})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rings, dotSize, glowStrength, idleSpeedDeg, perfMode, shimmer]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
