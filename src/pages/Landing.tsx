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

  // subtle parallax focus following the cursor (very gentle)
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
      {/* --- PURE CSS “NEURAL SPACE” BACKGROUND --- */}
      <style>{`
        /* Animatable custom props */
        @property --pulse { syntax: "<number>"; inherits: false; initial-value: 0; }
        @property --mx { syntax: "<number>"; inherits: true; initial-value: 0.5; }
        @property --my { syntax: "<number>"; inherits: true; initial-value: 0.5; }

        /* Heartbeat (slow pulse) */
        @keyframes heartbeat {
          0%, 100% { --pulse: 0; filter: brightness(1); }
          30%      { --pulse: 1; filter: brightness(1.05); }
          60%      { --pulse: 0.2; filter: brightness(1.02); }
        }

        /* Ultra-slow drift */
        @keyframes driftUltraSlow {
          0%   { transform: translate3d(0,0,0) scale(1.00) rotate(0deg); }
          50%  { transform: translate3d(0,-0.4%,0) scale(1.01) rotate(0.3deg); }
          100% { transform: translate3d(0,0,0) scale(1.00) rotate(0deg); }
        }

        /* Starfields: very slow background-position shifts */
        @keyframes starfieldA {
          0%   { background-position: 0% 0%; }
          100% { background-position: 40% 24%; }
        }
        @keyframes starfieldB {
          0%   { background-position: 0% 0%; }
          100% { background-position: -32% -28%; }
        }

        /* Gentle twinkle (randomized per layer using different durations) */
        @keyframes twinkleSlow {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 0.85; }
        }
        @keyframes twinkleSlower {
          0%, 100% { opacity: 0.40; }
          50%      { opacity: 0.80; }
        }

        /* Super-slow filament rotation */
        @keyframes filamentsSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Helpers */
        .absfill { position: absolute; inset: 0; pointer-events: none; }
        .gpu { will-change: transform, opacity, background-position, filter; }

        /* Root container variables (center follows pointer very slightly) */
        .neura-space {
          --mx: 0.5;
          --my: 0.5;
          --cx: calc(50% + (var(--mx) - 0.5) * 4%);
          --cy: calc(48% + (var(--my) - 0.5) * 3%);
        }

        /* 1) CORE: slow heartbeat + soft rings (white + teal) */
        .layer-core {
          z-index: 0;
          background-image:
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(255,255,255,0.10) 0%,
              rgba(255,255,255,0.06) calc(12% + 3% * var(--pulse)),
              rgba(255,255,255,0.02) calc(28% + 4% * var(--pulse)),
              rgba(0,0,0,0) 62%
            ),
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(160,255,245,0.16) 0%,
              rgba(160,255,245,0.09) calc(20% + 4% * var(--pulse)),
              rgba(160,255,245,0.04) calc(36% + 5% * var(--pulse)),
              rgba(0,0,0,0) 74%
            ),
            radial-gradient(
              circle at 50% 60%,
              rgba(255,255,255,0.05) 0%,
              rgba(0,0,0,0) 70%
            );
          background-repeat: no-repeat;
          background-size: 140% 140%, 160% 160%, 200% 200%;
          animation:
            heartbeat 8.5s ease-in-out infinite,
            driftUltraSlow 120s ease-in-out infinite;
          filter: saturate(1.03) contrast(1.02);
        }

        /* 2) STARFIELD A: fine, dense speckles, very slow drift, soft twinkle */
        .layer-starsA {
          z-index: 1;
          opacity: 0.55;
          background-image:
            radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.08) 60%, transparent 61%),
            radial-gradient(1px 1px at 68% 78%, rgba(255,255,255,0.06) 60%, transparent 61%),
            radial-gradient(1px 1px at 42% 62%, rgba(160,255,245,0.08) 60%, transparent 61%),
            radial-gradient(1px 1px at 84% 38%, rgba(255,255,255,0.06) 60%, transparent 61%),
            radial-gradient(1px 1px at 28% 72%, rgba(255,255,255,0.06) 60%, transparent 61%);
          background-size: 260px 260px, 280px 280px, 300px 300px, 320px 320px, 260px 260px;
          background-repeat: repeat;
          animation:
            starfieldA 160s linear infinite,
            twinkleSlow 7.5s ease-in-out infinite;
          /* gentle parallax */
          background-position:
            calc((var(--mx) - 0.5) * 5%) calc((var(--my) - 0.5) * 5%),
            calc((var(--mx) - 0.5) * 6%) calc((var(--my) - 0.5) * 6%),
            calc((var(--mx) - 0.5) * 7%) calc((var(--my) - 0.5) * 7%),
            calc((var(--mx) - 0.5) * 8%) calc((var(--my) - 0.5) * 8%),
            calc((var(--mx) - 0.5) * 9%) calc((var(--my) - 0.5) * 9%);
        }

        /* 3) STARFIELD B: larger sparse atoms, even slower drift, slower twinkle */
        .layer-starsB {
          z-index: 2;
          opacity: 0.48;
          background-image:
            radial-gradient(1.5px 1.5px at 35% 25%, rgba(255,255,255,0.12) 60%, transparent 61%),
            radial-gradient(1.5px 1.5px at 80% 70%, rgba(160,255,245,0.12) 60%, transparent 61%),
            radial-gradient(1.5px 1.5px at 55% 85%, rgba(255,255,255,0.10) 60%, transparent 61%),
            radial-gradient(2px 2px at 25% 40%, rgba(255,255,255,0.10) 60%, transparent 61%);
          background-size: 360px 360px, 420px 420px, 380px 380px, 460px 460px;
          background-repeat: repeat;
          animation:
            starfieldB 200s linear infinite,
            twinkleSlower 11s ease-in-out infinite;
          background-position:
            calc((var(--mx) - 0.5) * -4%) calc((var(--my) - 0.5) * -4%),
            calc((var(--mx) - 0.5) * -5%) calc((var(--my) - 0.5) * -5%),
            calc((var(--mx) - 0.5) * -6%) calc((var(--my) - 0.5) * -6%),
            calc((var(--mx) - 0.5) * -7%) calc((var(--my) - 0.5) * -7%);
        }

        /* 4) NEURAL FILAMENTS: ultra-slow rotating conic gradients, masked near center */
        .layer-filaments-wrap { z-index: 3; display: grid; place-items: center; }
        .filaments {
          width: 180vmax;
          height: 180vmax;
          opacity: 0.24;
          border-radius: 50%;
          background:
            conic-gradient(from 0deg,
              rgba(160,255,245,0.10) 0deg, rgba(160,255,245,0.00) 30deg,
              rgba(255,255,255,0.10) 55deg, rgba(255,255,255,0.00) 95deg,
              rgba(160,255,245,0.08) 135deg, rgba(160,255,245,0.00) 175deg,
              rgba(255,255,255,0.06) 215deg, rgba(255,255,255,0.00) 245deg,
              rgba(160,255,245,0.08) 300deg, rgba(160,255,245,0.00) 330deg
            ),
            conic-gradient(from 180deg,
              rgba(255,255,255,0.06) 0deg, rgba(255,255,255,0.00) 40deg,
              rgba(160,255,245,0.10) 80deg, rgba(160,255,245,0.00) 120deg,
              rgba(255,255,255,0.08) 170deg, rgba(255,255,255,0.00) 200deg,
              rgba(160,255,245,0.10) 240deg, rgba(160,255,245,0.00) 280deg,
              rgba(255,255,255,0.06) 320deg, rgba(255,255,255,0.00) 350deg
            );
          -webkit-mask: radial-gradient(circle at var(--cx) var(--cy),
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.35) calc(16% + 3% * var(--pulse)),
            rgba(0,0,0,0.65) calc(34% + 4% * var(--pulse)),
            rgba(0,0,0,0.90) 58%,
            rgba(0,0,0,1) 76%);
          mask: radial-gradient(circle at var(--cx) var(--cy),
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.35) calc(16% + 3% * var(--pulse)),
            rgba(0,0,0,0.65) calc(34% + 4% * var(--pulse)),
            rgba(0,0,0,0.90) 58%,
            rgba(0,0,0,1) 76%);
          animation: filamentsSpin 180s linear infinite;
          transform-origin: center center;
        }

        /* 5) SOFT VIGNETTE for focus */
        .layer-vignette {
          z-index: 4;
          background: radial-gradient(ellipse at 50% 48%,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0) 55%,
            rgba(0,0,0,0.45) 100%);
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .layer-core,
          .layer-starsA,
          .layer-starsB,
          .filaments {
            animation: none;
          }
        }
      `}</style>

      {/* ---------------------- HERO ---------------------- */}
      <section
        ref={heroRef}
        className="neura-space relative isolate min-h-screen flex items-center overflow-hidden bg-[#0A0A0A]"
      >
        {/* Layers (ordered back → front) */}
        <div className="absfill gpu layer-core" />
        <div className="absfill gpu layer-starsA" />
        <div className="absfill gpu layer-starsB" />
        <div className="absfill layer-filaments-wrap">
          <div className="filaments" />
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
