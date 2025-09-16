import React, { useEffect, useRef, useState } from "react";
import { VideoModal } from "@/components/VideoModal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { ArrowDown, Play, CheckCircle, Users, Zap, Shield } from "lucide-react";

export default function Landing() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  // pointer → CSS vars for light parallax/focus
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - r.left) / Math.max(1, r.width);
      const my = (e.clientY - r.top) / Math.max(1, r.height);
      el.style.setProperty("--mx", mx.toFixed(4));
      el.style.setProperty("--my", my.toFixed(4));
    };
    const onLeave = () => {
      el.style.setProperty("--mx", "0.5");
      el.style.setProperty("--my", "0.5");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    onLeave();
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-inter">
      {/* ------- INLINE COSMIC/NEURAL BACKGROUND CSS (pure CSS) ------- */}
      <style>{`
        /* Animatable numbers */
        @property --pulse { syntax: "<number>"; inherits: false; initial-value: 0; }
        @property --shiftX { syntax: "<percentage>"; inherits: false; initial-value: 50%; }
        @property --shiftY { syntax: "<percentage>"; inherits: false; initial-value: 50%; }

        /* Keyframes */
        @keyframes pulse {
          0%, 100% { --pulse: 0; }
          50%      { --pulse: 1; }
        }
        @keyframes driftSlow {
          0%   { transform: translate3d(0,0,0) scale(1.0) rotate(0deg); }
          50%  { transform: translate3d(0,-0.6%,0) scale(1.01) rotate(0.4deg); }
          100% { transform: translate3d(0,0,0) scale(1.0) rotate(0deg); }
        }
        @keyframes starflowA {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 120%; }
        }
        @keyframes starflowB {
          0%   { background-position: 0% 0%; }
          100% { background-position: -180% -140%; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes shoot {
          0% { transform: translate3d(0,0,0) rotate(15deg); opacity: 0; }
          10%{ opacity: 1; }
          100% { transform: translate3d(120vw, -60vh, 0) rotate(15deg); opacity: 0; }
        }
        @keyframes orbitSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Helpers */
        .absfill { position: absolute; inset: 0; pointer-events: none; }
        .gpu { will-change: transform, opacity, background-position, filter; }

        /* -- Center follows pointer subtly -- */
        .cosmos {
          --mx: 0.5;
          --my: 0.5;
          --cx: calc(50% + (var(--mx) - 0.5) * 6%);
          --cy: calc(47% + (var(--my) - 0.5) * 4%);
        }

        /* 1) Deep space gradient base with pulsing core + teal aura */
        .layer-core {
          z-index: 0;
          background-image:
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(255,255,255,0.10) 0%,
              rgba(255,255,255,0.06) calc(12% + 4% * var(--pulse)),
              rgba(255,255,255,0.02) calc(30% + 5% * var(--pulse)),
              rgba(0,0,0,0) 65%
            ),
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(160,255,245,0.18) 0%,
              rgba(160,255,245,0.10) calc(20% + 6% * var(--pulse)),
              rgba(160,255,245,0.045) calc(36% + 7% * var(--pulse)),
              rgba(0,0,0,0) 75%
            ),
            radial-gradient(circle at 50% 60%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%);
          background-repeat: no-repeat;
          background-size: 140% 140%, 160% 160%, 200% 200%;
          animation: pulse 6.2s ease-in-out infinite, driftSlow 28s ease-in-out infinite;
          filter: saturate(1.05) contrast(1.02);
        }

        /* 2) Parallax starfields (atoms) */
        .layer-starsA {
          z-index: 1;
          opacity: 0.65;
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.08) 60%, transparent 61%),
            radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.06) 60%, transparent 61%),
            radial-gradient(1px 1px at 40% 60%, rgba(160,255,245,0.08) 60%, transparent 61%),
            radial-gradient(1px 1px at 85% 35%, rgba(255,255,255,0.06) 60%, transparent 61%);
          background-size: 220px 220px, 260px 260px, 300px 300px, 280px 280px;
          background-repeat: repeat;
          animation: starflowA 60s linear infinite;
          /* parallax offset from pointer */
          background-position:
            calc((var(--mx) - 0.5) * 8%) calc((var(--my) - 0.5) * 8%),
            calc((var(--mx) - 0.5) * 10%) calc((var(--my) - 0.5) * 10%),
            calc((var(--mx) - 0.5) * 12%) calc((var(--my) - 0.5) * 12%),
            calc((var(--mx) - 0.5) * 14%) calc((var(--my) - 0.5) * 14%);
        }
        .layer-starsB {
          z-index: 2;
          opacity: 0.55;
          background-image:
            radial-gradient(1.5px 1.5px at 35% 25%, rgba(255,255,255,0.12) 60%, transparent 61%),
            radial-gradient(1.5px 1.5px at 80% 70%, rgba(160,255,245,0.12) 60%, transparent 61%),
            radial-gradient(1.5px 1.5px at 55% 85%, rgba(255,255,255,0.10) 60%, transparent 61%);
          background-size: 360px 360px, 420px 420px, 380px 380px;
          background-repeat: repeat;
          animation: starflowB 70s linear infinite;
          background-position:
            calc((var(--mx) - 0.5) * -6%) calc((var(--my) - 0.5) * -6%),
            calc((var(--mx) - 0.5) * -8%) calc((var(--my) - 0.5) * -8%),
            calc((var(--mx) - 0.5) * -10%) calc((var(--my) - 0.5) * -10%);
        }

        /* 3) Shooting stars (a few lightweight spans) */
        .layer-shooters { z-index: 3; overflow: visible; }
        .shoot {
          position: absolute;
          left: -20vw;
          top: 80vh;
          width: 120px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.9), rgba(160,255,245,0.0));
          filter: drop-shadow(0 0 6px rgba(160,255,245,0.4));
          animation: shoot 2.8s ease-in-out infinite;
          opacity: 0;
        }
        /* staggered variants */
        .shoot:nth-child(1){ animation-delay: 0.3s; top: 72vh; }
        .shoot:nth-child(2){ animation-delay: 1.6s; top: 64vh; }
        .shoot:nth-child(3){ animation-delay: 3.2s; top: 78vh; }
        .shoot:nth-child(4){ animation-delay: 4.9s; top: 69vh; }
        .shoot:nth-child(5){ animation-delay: 6.6s; top: 82vh; }

        /* 4) Orbiting nodes (feel like neurons firing around a core) */
        .layer-orbits { z-index: 4; display: grid; place-items: center; }
        .orbits {
          position: relative;
          width: 120vmin;
          height: 120vmin;
          opacity: 0.35;
          transform: translateZ(0);
          /* pull toward pointer slightly */
          translate: calc((var(--mx) - 0.5) * 1.2%) calc((var(--my) - 0.5) * 0.8%);
        }
        .orbit {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px dashed rgba(255,255,255,0.12);
          mask: radial-gradient(circle at var(--cx) var(--cy), rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,1) 85%);
          animation: orbitSpin linear infinite;
        }
        .orbit:nth-child(1){ animation-duration: 44s; scale: 0.46; }
        .orbit:nth-child(2){ animation-duration: 66s; scale: 0.62; }
        .orbit:nth-child(3){ animation-duration: 88s; scale: 0.78; }
        .orbit:nth-child(4){ animation-duration: 110s; scale: 0.92; }

        /* orbiting nodes */
        .orbit::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          margin: -4px 0 0 -4px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.2));
          box-shadow:
            0 0 8px rgba(255,255,255,0.5),
            0 0 18px rgba(160,255,245,0.25);
          transform: translateX(calc(50vmin));
        }
        /* distribute nodes on different angles with ::before too */
        .orbit::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          margin: -3px 0 0 -3px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(160,255,245,0.95), rgba(160,255,245,0.15));
          box-shadow:
            0 0 6px rgba(160,255,245,0.5),
            0 0 14px rgba(160,255,245,0.25);
          transform: rotate(120deg) translateX(calc(36vmin));
          filter: saturate(1.1);
        }

        /* 5) Soft vignette for focus */
        .layer-vignette {
          z-index: 5;
          background: radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .layer-core,
          .layer-starsA,
          .layer-starsB,
          .layer-orbits .orbit {
            animation: none;
          }
          .layer-shooters { display: none; }
        }
      `}</style>

      {/* ---------------------- HERO ---------------------- */}
      <section
        ref={heroRef}
        className="cosmos relative isolate min-h-screen flex items-center overflow-hidden bg-[#0A0A0A]"
      >
        {/* Cosmic/Neural Background Layers */}
        <div className="absfill gpu layer-core" />
        <div className="absfill gpu layer-starsA" />
        <div className="absfill gpu layer-starsB" />

        <div className="absfill gpu layer-shooters">
          <span className="shoot" />
          <span className="shoot" />
          <span className="shoot" />
          <span className="shoot" />
          <span className="shoot" />
        </div>

        <div className="absfill layer-orbits">
          <div className="orbits">
            <div className="orbit" />
            <div className="orbit" />
            <div className="orbit" />
            <div className="orbit" />
          </div>
        </div>

        <div className="absfill layer-vignette" />

        {/* Foreground content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
          <p className="text-neutral-200 font-semibold">Neura AI</p>

          <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
            Answers at the speed <br className="hidden sm:block" />
            <span className="text-white/80">of conversation.</span>
          </h1>

          <p className="mt-6 text-lg text-neutral-300">
            Neura AI surfaces concise, relevant insights while you talk—no toggling, no typing.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Button variant="hero" size="lg" onClick={scrollToWaitlist} className="group">
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

      {/* ---------------------- BODY ---------------------- */}
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
