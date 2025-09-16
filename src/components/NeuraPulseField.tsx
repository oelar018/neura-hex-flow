import React, { useEffect, useRef } from "react";

/**
 * NeuraPulseField
 * - full-bleed canvas background
 * - soft pulsating wave rings + subtle particle network
 * - reacts a bit to mouse movement
 * - zero external deps
 */
type Props = {
  className?: string;
  tint?: string;        // any CSS color (default subtle teal-white)
  intensity?: number;   // 0.5..1.5 overall brightness
  density?: number;     // 0.5..1.5 particle count
};

const NeuraPulseField: React.FC<Props> = ({
  className = "",
  tint = "rgba(160, 255, 245, 0.9)",
  intensity = 1.0,
  density = 1.0,
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | null>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0, easing: 0.06 });

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    const onResize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const tx = (e.clientX - rect.left) / Math.max(1, rect.width);
      const ty = (e.clientY - rect.top) / Math.max(1, rect.height);
      mouse.current.vx += (tx - mouse.current.x);
      mouse.current.vy += (ty - mouse.current.y);
    };

    // particles
    const COUNT = Math.floor(80 * density);
    const pts = Array.from({ length: COUNT }).map(() => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0015,
      vy: (Math.random() - 0.5) * 0.0015,
      phase: Math.random() * Math.PI * 2,
      r: 1 + Math.random() * 1.5,
    }));

    // noise helper
    const rand = (seed: number) => {
      // tiny LCG
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    // draw loop
    let t0 = performance.now();
    const draw = (t: number) => {
      const dt = (t - t0) / 1000;
      t0 = t;

      // ease mouse (smooth follow)
      mouse.current.x += mouse.current.vx * mouse.current.easing;
      mouse.current.y += mouse.current.vy * mouse.current.easing;
      mouse.current.vx *= (1 - mouse.current.easing);
      mouse.current.vy *= (1 - mouse.current.easing);

      // clear with very dark backdrop
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, w, h);

      // ---- Pulsating wave rings (subtle) ----
      const cx = w * 0.5 + (mouse.current.x - 0.5) * w * 0.06;
      const cy = h * 0.5 + (mouse.current.y - 0.5) * h * 0.04;
      const maxR = Math.sqrt(w * w + h * h) * 0.6;

      for (let i = 0; i < 6; i++) {
        const p = i / 6;
        const base = p * maxR;
        const wobble =
          Math.sin((t * 0.0015) + p * 8 + mouse.current.x * 2) * 16 +
          Math.cos((t * 0.0012) + p * 10 + mouse.current.y * 2) * 10;
        const R = base + wobble;

        const alpha = (0.12 + (0.14 - p * 0.12)) * intensity;
        const grad = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
        grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.15})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(cx, cy, Math.max(0, R), 0, Math.PI * 2);
        ctx.fill();
      }

      // faint tint glow halo
      {
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.8);
        halo.addColorStop(0, `${tint.replace("0.9", `${0.25 * intensity}`)}`);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);
      }

      // ---- Particle network ----
      // update
      for (let i = 0; i < COUNT; i++) {
        const p = pts[i];
        p.x += p.vx + (mouse.current.x - 0.5) * 0.0002;
        p.y += p.vy + (mouse.current.y - 0.5) * 0.0002;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        if (p.y < -0.02) p.y = 1.02;
        if (p.y > 1.02) p.y = -0.02;
        p.phase += dt * (1.5 + i * 0.0005);
      }

      // connections
      for (let i = 0; i < COUNT; i++) {
        const a = pts[i];
        for (let j = i + 1; j < COUNT; j++) {
          const b = pts[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const d2 = dx * dx + dy * dy;
          if (d2 < (w * 0.12) * (h * 0.12) * 0.0004) {
            const d = Math.sqrt(d2);
            const k = (1 - d / (Math.min(w, h) * 0.18)) * 0.9 * intensity;
            if (k > 0) {
              ctx.strokeStyle = `rgba(255,255,255,${0.08 * k})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x * w, a.y * h);
              ctx.lineTo(b.x * w, b.y * h);
              ctx.stroke();
            }
          }
        }
      }

      // draw particles
      for (let i = 0; i < COUNT; i++) {
        const p = pts[i];
        const pulse = 0.6 + Math.sin(p.phase) * 0.4; // 0..1
        const r = (p.r + pulse * 0.6) * intensity;

        // soft mono dot with slight tint
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.75})`;
        ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = tint;
        ctx.globalAlpha = 0.12 * intensity;
        ctx.arc(p.x * w, p.y * h, r * 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // very faint film grain
      const grains = 18;
      for (let i = 0; i < grains; i++) {
        const gx = rand(t + i) * w;
        const gy = rand(t * (i + 1)) * h;
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fillRect(gx, gy, 1, 1);
      }

      raf.current = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    onResize();

    canvas.addEventListener("pointermove", handleMove);
    raf.current = requestAnimationFrame(draw);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      ro.disconnect();
      canvas.removeEventListener("pointermove", handleMove);
    };
  }, [tint, intensity, density]);

  return (
    <canvas
      ref={ref}
      className={`absolute inset-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
};

export default NeuraPulseField;