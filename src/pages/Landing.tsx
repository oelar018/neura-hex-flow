import React, { useEffect, useRef, useState, useMemo } from "react";
import { VideoModal } from "@/components/VideoModal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { ArrowDown, Play, CheckCircle, Users, Zap, Shield } from "lucide-react";

/** =========================
 *  Canvas background: stars + neural links (calmer version)
 *  ========================= */
type Particle = {
  x: number;
  y: number;
  z: number;        // depth layer (0..1)
  vx: number;
  vy: number;
  size: number;
  baseTwinkle: number;
};

function NeuraBackground({
  followRef,
}: {
  followRef: React.RefObject<HTMLElement | null>;
}) {
  const starsRef = useRef<HTMLCanvasElement | null>(null);
  const linksRef = useRef<HTMLCanvasElement | null>(null);

  const pointer = useRef({ mx: 0.5, my: 0.5 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number>(0);
  const pausedRef = useRef<boolean>(false);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  // **CALMER SETTINGS**
  const settings = useMemo(
    () => ({
      starLayers: 3,
      density: 0.11,         // was 0.16
      maxSpeed: 0.009,       // was 0.015
      linkDistance: 105,     // was 130
      linkWidth: 0.7,        // was 0.9
      linkChance: 0.55,      // draw ~55% of eligible links
      heartbeatMs: 3600,     // was 1350
      twinkleMs: 5200,       // was 2200
      heartbeatVelAmp: 0.06, // was 0.15
      heartbeatGlowAmp: 0.20 // was 0.35 (node glow)
    }),
    []
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onPointer = (e: PointerEvent) => {
      if (!followRef.current) return;
      const r = followRef.current.getBoundingClientRect();
      const mx = (e.clientX - r.left) / Math.max(1, r.width);
      const my = (e.clientY - r.top) / Math.max(1, r.height);
      pointer.current.mx = Math.max(0, Math.min(1, mx));
      pointer.current.my = Math.max(0, Math.min(1, my));
    };
    const onLeave = () => {
      pointer.current.mx = 0.5;
      pointer.current.my = 0.5;
    };

    const el = followRef.current;
    el?.addEventListener("pointermove", onPointer);
    el?.addEventListener("pointerleave", onLeave);

    const handleVis = () => {
      pausedRef.current = document.hidden;
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", handleVis);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      [starsRef.current, linksRef.current].forEach((c) => {
        if (!c) return;
        c.width = Math.floor(w * dpr);
        c.height = Math.floor(h * dpr);
        c.style.width = `${w}px`;
        c.style.height = `${h}px`;
      });

      const area = (w * h) / 10000;
      const targetCount = Math.round(area * settings.density * 60);
      const ps: Particle[] = [];
      for (let i = 0; i < targetCount; i++) {
        const z = Math.random();
        const s = 0.6 + z * 1.8;
        const speed = (0.25 + z) * settings.maxSpeed;
        const dir = Math.random() * Math.PI * 2;
        ps.push({
          x: Math.random() * w * dpr,
          y: Math.random() * h * dpr,
          z,
          vx: Math.cos(dir) * speed * dpr,
          vy: Math.sin(dir) * speed * dpr,
          size: s * dpr,
          baseTwinkle: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = ps;
    }

    resize();
    window.addEventListener("resize", resize);

    const starsCtx = starsRef.current?.getContext("2d");
    const linksCtx = linksRef.current?.getContext("2d");
    if (!starsCtx || !linksCtx) return;

    function frame(ts: number) {
      if (pausedRef.current) return;

      const dt = lastTRef.current ? ts - lastTRef.current : 16;
      lastTRef.current = ts;

      const width = starsRef.current!.width;
      const height = starsRef.current!.height;
      const ps = particlesRef.current;
      const { mx, my } = pointer.current;

      const parallaxX = (mx - 0.5) * 10 * dpr;
      const parallaxY = (my - 0.5) * 7 * dpr;

      // heartbeat 0..1..0
      const hbPhase = (ts % settings.heartbeatMs) / settings.heartbeatMs;
      const heartbeat =
        hbPhase < 0.4
          ? Math.sin((hbPhase / 0.4) * Math.PI)
          : hbPhase < 0.7
          ? 0.22 * Math.sin(((hbPhase - 0.4) / 0.3) * Math.PI)
          : 0.08 * Math.sin(((hbPhase - 0.7) / 0.3) * Math.PI);

      starsCtx.clearRect(0, 0, width, height);
      linksCtx.clearRect(0, 0, width, height);

      // STARS
      starsCtx.save();
      if (!reduceMotion) starsCtx.translate(parallaxX * 0.5, parallaxY * 0.5);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];

        if (!reduceMotion) {
          p.x += p.vx * dt * (1 + settings.heartbeatVelAmp * heartbeat);
          p.y += p.vy * dt * (1 + settings.heartbeatVelAmp * heartbeat);
        }

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const tw =
          0.55 +
          0.35 *
            Math.abs(
              Math.sin((ts / settings.twinkleMs) * (1.1 + p.z * 0.5) + p.baseTwinkle)
            ) +
          0.18 * heartbeat;

        starsCtx.globalAlpha = 0.38 + 0.52 * tw;
        starsCtx.beginPath();
        starsCtx.arc(p.x, p.y, p.size * (1 + 0.18 * heartbeat), 0, Math.PI * 2);
        const g = starsCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        g.addColorStop(0, `rgba(255,255,255,0.95)`);
        g.addColorStop(0.5, `rgba(160,255,245,0.48)`);
        g.addColorStop(1, `rgba(0,0,0,0)`);
        starsCtx.fillStyle = g;
        starsCtx.fill();
      }
      starsCtx.restore();

      // LINKS
      linksCtx.save();
      if (!reduceMotion) linksCtx.translate(parallaxX, parallaxY);
      linksCtx.lineWidth = settings.linkWidth * dpr;
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        let made = 0; // soft cap links per node
        for (let j = i + 1; j < ps.length; j++) {
          if (made > 2) break; // at most 3 links per particle
          const b = ps[j];
          const maxD = (settings.linkDistance + 90 * (a.z + b.z)) * 0.5 * dpr;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD * maxD && Math.random() < settings.linkChance) {
            const d = Math.sqrt(d2);
            const t = 1 - d / maxD;
            const alpha = (0.06 + 0.16 * t) * (0.55 + 0.35 * heartbeat);
            linksCtx.strokeStyle = `rgba(170,255,245,${alpha.toFixed(3)})`;
            linksCtx.beginPath();
            linksCtx.moveTo(a.x, a.y);
            linksCtx.lineTo(b.x, b.y);
            linksCtx.stroke();
            made++;

            if (t > 0.84) {
              const nx = (a.x + b.x) / 2;
              const ny = (a.y + b.y) / 2;
              const ng = linksCtx.createRadialGradient(nx, ny, 0, nx, ny, 9 * dpr);
              ng.addColorStop(0, `rgba(160,255,245,${0.22 + settings.heartbeatGlowAmp * t})`);
              ng.addColorStop(1, "rgba(0,0,0,0)");
              linksCtx.fillStyle = ng;
              linksCtx.beginPath();
              linksCtx.arc(nx, ny, 9 * dpr, 0, Math.PI * 2);
              linksCtx.fill();
            }
          }
        }
      }
      linksCtx.restore();

      rafRef.current = requestAnimationFrame(frame);
    }

    function kick() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }

    kick();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVis);
      el?.removeEventListener("pointermove", onPointer);
      el?.removeEventListener("pointerleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dpr, followRef, settings]);

  return (
    <>
      <canvas ref={starsRef} className="absfill block" />
      <canvas ref={linksRef} className="absfill block" />
    </>
  );
}

export default function Landing() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-inter">
      <style>{`
        @property --mx { syntax: "<number>"; inherits: true; initial-value: 0.5; }
        @property --my { syntax: "<number>"; inherits: true; initial-value: 0.5; }
        @property --pulse { syntax: "<number>"; inherits: false; initial-value: 0; }

        @keyframes heartbeat {
          0%,100% { --pulse: 0; filter: brightness(1); }
          40%      { --pulse: 1; filter: brightness(1.05); }
          70%      { --pulse: .25; filter: brightness(1.015); }
        }

        .absfill { position:absolute; inset:0; pointer-events:none; }

        .neura-hero {
          --mx:.5; --my:.5;
          --cx: calc(50% + (var(--mx) - .5) * 8%);
          --cy: calc(48% + (var(--my) - .5) * 6%);
          overflow:hidden;
          background: #0A0A0A;
        }

        .neura-aura {
          z-index:0;
          background-image:
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(255,255,255,0.12) 0%,
              rgba(255,255,255,0.05) calc(26% + 5% * var(--pulse)),
              rgba(255,255,255,0.02) calc(46% + 6% * var(--pulse)),
              rgba(0,0,0,0) 72%
            ),
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(160,255,245,0.18) 0%,
              rgba(160,255,245,0.10) calc(34% + 6% * var(--pulse)),
              rgba(160,255,245,0.05) calc(60% + 6% * var(--pulse)),
              rgba(0,0,0,0) 92%
            );
          background-repeat:no-repeat;
          background-size:170% 170%, 200% 200%;
          animation: heartbeat 20s ease-in-out infinite;
          filter: saturate(1.04) contrast(1.02);
        }

        .neura-vignette {
          z-index:4;
          background: radial-gradient(ellipse at 50% 50%,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.0) 56%,
            rgba(0,0,0,0.48) 100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .neura-aura { animation: none; }
        }
      `}</style>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative neura-hero min-h-screen flex items-center"
        onPointerMove={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const mx = (e.clientX - r.left) / Math.max(1, r.width);
          const my = (e.clientY - r.top) / Math.max(1, r.height);
          (e.currentTarget as HTMLElement).style.setProperty("--mx", mx.toFixed(4));
          (e.currentTarget as HTMLElement).style.setProperty("--my", my.toFixed(4));
        }}
        onPointerLeave={(e) => {
          (e.currentTarget as HTMLElement).style.setProperty("--mx", "0.5");
          (e.currentTarget as HTMLElement).style.setProperty("--my", "0.5");
        }}
      >
        <div className="absfill neura-aura" />
        <NeuraBackground followRef={heroRef} />
        <div className="absfill neura-vignette" />

        {/* Foreground content */}
        <div className="relative z-[5] w-full max-w-4xl mx-auto px-6 text-center">
          <p className="text-neutral-200 font-semibold">Neura AI</p>

          <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
            Answers at the speed <br className="hidden sm:block" />
            <span className="text-white/80">of conversation.</span>
          </h1>

          <p className="mt-6 text-lg text-neutral-300">
            Neura AI surfaces concise, relevant insights while you talk—no toggling, no typing.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Button variant="hero" size="lg" onClick={() => {
              document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
            }} className="group">
              Join the waitlist
              <ArrowDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => setShowVideoModal(true)}
              className="group"
              aria-label="Watch a 30-second product preview"
            >
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Watch a 30s preview
            </Button>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-24 bg-[#0A0A0A]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
              How it helps
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6 rounded-2xl bg-neutral-900/60 border border-white/10">
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-white/5">
                  <Zap className="w-6 h-6 text-white/80" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Stay in the flow—no context switching.
                </h3>
              </div>

              <div className="text-center space-y-4 p-6 rounded-2xl bg-neutral-900/60 border border-white/10">
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-white/5">
                  <CheckCircle className="w-6 h-6 text-white/80" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Only what's relevant—signal, not noise.
                </h3>
              </div>

              <div className="text-center space-y-4 p-6 rounded-2xl bg-neutral-900/60 border border-white/10">
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-white/5">
                  <Shield className="w-6 h-6 text-white/80" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Adapts to your setting—meetings, sales, interviews, diagnostics.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0A0A0A]">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-neutral-400">
            <Users className="w-5 h-5" />
            <p className="text-sm">
              Pilot partnerships underway in healthcare and enterprise.
            </p>
          </div>
        </div>
      </section>

      <section id="waitlist" className="py-24 bg-[#0A0A0A]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join the waitlist
            </h2>
            <p className="text-lg text-neutral-300">
              Be among the first to experience Neura AI. Get early access and help shape the future of conversation intelligence.
            </p>
          </div>

          <WaitlistForm />
        </div>
      </section>

      <footer className="py-12 bg-[#0A0A0A] border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-neutral-400 text-sm">© 2025 Neura AI. All rights reserved.</div>
            <nav className="flex gap-6">
              <a href="/privacy" className="text-neutral-400 hover:text-white text-sm transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-neutral-400 hover:text-white text-sm transition-colors">
                Terms
              </a>
              <a href="/contact" className="text-neutral-400 hover:text-white text-sm transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>

      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} />
    </div>
  );
}
