import React, { useEffect, useRef } from "react";

type PerfMode = "auto" | "hi" | "med" | "low";
type Props = {
  rings?: number;
  dotSize?: number;
  glowStrength?: number;
  idleSpeedDeg?: number;
  perfMode?: PerfMode;
  className?: string;
};
type Dot = { x: number; y: number; r: number; a: number };

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

const HexDotsCanvas: React.FC<Props> = ({
  rings,
  dotSize = 3,
  glowStrength = 0.8,
  idleSpeedDeg = 0.2,
  perfMode = "auto",
  className = "",
}) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current!, canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, cx = 0, cy = 0;
    let dots: Dot[] = [];
    let S = 20, R = 10;
    const pointer = { x: 0, y: 0, has: false };
    const reduced = prefersReducedMotion();

    const pm: PerfMode =
      perfMode === "auto"
        ? (window.innerWidth < 480 ? "low" : window.innerWidth < 900 ? "med" : "hi")
        : perfMode;

    function chooseRings() {
      if (typeof rings === "number") return rings;
      if (pm === "hi") return 12;
      if (pm === "med") return 9;
      return 7;
    }

    function buildDots() {
      dots = [];
      dots.push({ x: 0, y: 0, r: dotSize + 0.8, a: 220 });
      const dirs = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
      for (let k = 1; k <= R; k++) {
        let q = k, r = 0;
        for (let side = 0; side < 6; side++) {
          const [dq, dr] = dirs[side];
          for (let step = 0; step < k; step++) {
            const X = S * (Math.sqrt(3) * q + (Math.sqrt(3)/2) * r);
            const Y = S * ((3/2) * r);
            const radial = k / R;
            dots.push({ x: X, y: Y, r: dotSize + (1 - radial) * 0.7, a: 180 - radial * 120 });
            q += dq; r += dr;
          }
        }
      }
    }

    function resize() {
      const rect = wrap.getBoundingClientRect();
      W = Math.max(1, rect.width|0); H = Math.max(1, rect.height|0);
      canvas.width = W; canvas.height = H; cx = W/2; cy = H/2;
      R = chooseRings();
      S = (Math.min(W, H) * 0.35) / R;
      buildDots();
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

      const t = (performance.now() - start) / 1000;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#0A0A0A"; ctx.fillRect(0,0,W,H);

      ctx.save();
      ctx.translate(cx, cy);
      const idle = reduced ? 0 : ((idleSpeedDeg * Math.PI) / 180) * t;
      const tilt = reduced ? 0 : 0.10;
      const px = pointer.has ? pointer.x / Math.max(180, W * 0.6) : 0;
      ctx.rotate(idle + px * tilt * 0.6);

      const mx = pointer.x, my = pointer.y;
      const glowRadius = S * 6;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let a = d.a, r = d.r;

        if (pointer.has) {
          const dist = Math.hypot(d.x - mx, d.y - my);
          const t = Math.max(0, 1 - dist / glowRadius);
          const ease = t * t * (3 - 2 * t);
          a = Math.min(255, a + ease * glowStrength * 160);
          r = d.r + ease * 1.1;
        }

        ctx.fillStyle = `rgba(130,255,250,${a / 255})`;
        ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2); ctx.fill();
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
  }, [rings, dotSize, glowStrength, idleSpeedDeg, perfMode]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default HexDotsCanvas;