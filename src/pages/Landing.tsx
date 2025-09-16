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

  // gentle parallax focus
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
      {/* =================== NEURAL SPACE BACKGROUND (pure CSS) =================== */}
      <style>{`
        /* Custom animatable props */
        @property --pulse { syntax: "<number>"; inherits: false; initial-value: 0; }
        @property --mx { syntax: "<number>"; inherits: true; initial-value: 0.5; }
        @property --my { syntax: "<number>"; inherits: true; initial-value: 0.5; }

        /* Heartbeat pulse (slow) */
        @keyframes heartbeat {
          0%, 100% { --pulse: 0; filter: brightness(1); }
          40%      { --pulse: 1; filter: brightness(1.06); }
          70%      { --pulse: 0.25; filter: brightness(1.02); }
        }

        /* Ultra-slow drift */
        @keyframes driftUltraSlow {
          0%   { transform: translate3d(0,0,0) scale(1.00) rotate(0deg); }
          50%  { transform: translate3d(0,-0.4%,0) scale(1.01) rotate(0.25deg); }
          100% { transform: translate3d(0,0,0) scale(1.00) rotate(0deg); }
        }

        /* Starfield drift (very slow) */
        @keyframes starfieldA { 0% {background-position:0% 0%} 100% {background-position: 28% 18%} }
        @keyframes starfieldB { 0% {background-position:0% 0%} 100% {background-position:-22% -20%} }
        @keyframes starfieldC { 0% {background-position:0% 0%} 100% {background-position: 16% -14%} }

        /* Twinkle */
        @keyframes twinkleA { 0%,100%{opacity:.55} 50%{opacity:.95} }
        @keyframes twinkleB { 0%,100%{opacity:.45} 50%{opacity:.85} }
        @keyframes twinkleC { 0%,100%{opacity:.40} 50%{opacity:.80} }

        /* Super-slow rotations */
        @keyframes filamentsSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        @keyframes gridRotate     { 0%{transform:rotate(0)} 100%{transform:rotate(-360deg)} }

        .absfill { position: absolute; inset: 0; pointer-events: none; }
        .gpu { will-change: transform, opacity, background-position, filter; }

        /* Pointer-following center */
        .neura-space {
          --mx: .5; --my: .5;
          --cx: calc(50% + (var(--mx) - .5) * 4%);
          --cy: calc(48% + (var(--my) - .5) * 3%);
        }

        /* 1) CORE halo + teal aura (brighter than before) */
        .layer-core {
          z-index: 0;
          background-image:
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(255,255,255,0.14) 0%,
              rgba(255,255,255,0.08) calc(14% + 4% * var(--pulse)),
              rgba(255,255,255,0.03) calc(30% + 5% * var(--pulse)),
              rgba(0,0,0,0) 60%
            ),
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(160,255,245,0.22) 0%,
              rgba(160,255,245,0.12) calc(22% + 5% * var(--pulse)),
              rgba(160,255,245,0.06) calc(38% + 6% * var(--pulse)),
              rgba(0,0,0,0) 76%
            ),
            radial-gradient(circle at 50% 60%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 72%);
          background-size: 140% 140%, 160% 160%, 200% 200%;
          background-repeat: no-repeat;
          animation: heartbeat 9s ease-in-out infinite, driftUltraSlow 120s ease-in-out infinite;
          filter: saturate(1.06) contrast(1.03);
        }

        /* 2) DENSE STARFIELD (now much more visible) */
        /* Smaller background-size => more dots (denser) */
        .layer-starsA {
          z-index: 1;
          opacity: 0.9; /* up from ~0.55 */
          background-image:
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.12) 60%, transparent 61%),
            radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.10) 60%, transparent 61%),
            radial-gradient(1px 1px at 70% 25%, rgba(160,255,245,0.12) 60%, transparent 61%),
            radial-gradient(1px 1px at 90% 55%, rgba(255,255,255,0.10) 60%, transparent 61%),
            radial-gradient(1px 1px at 45% 85%, rgba(255,255,255,0.10) 60%, transparent 61%);
          background-size: 160px 160px, 170px 170px, 180px 180px, 190px 190px, 160px 160px; /* denser */
          background-repeat: repeat;
          animation: starfieldA 180s linear infinite, twinkleA 6.8s ease-in-out infinite;
          background-position:
            calc((var(--mx) - .5) * 6%) calc((var(--my) - .5) * 6%),
            calc((var(--mx) - .5) * 7%) calc((var(--my) - .5) * 7%),
            calc((var(--mx) - .5) * 8%) calc((var(--my) - .5) * 8%),
            calc((var(--mx) - .5) * 9%) calc((var(--my) - .5) * 9%),
            calc((var(--mx) - .5) * 10%) calc((var(--my) - .5) * 10%);
        }

        .layer-starsB {
          z-index: 2;
          opacity: 0.75; /* up from ~0.48 */
          background-image:
            radial-gradient(1.5px 1.5px at 20% 30%, rgba(255,255,255,0.16) 60%, transparent 61%),
            radial-gradient(1.5px 1.5px at 75% 65%, rgba(160,255,245,0.16) 60%, transparent 61%),
            radial-gradient(2px 2px at 50% 80%, rgba(255,255,255,0.14) 60%, transparent 61%),
            radial-gradient(1.5px 1.5px at 28% 55%, rgba(255,255,255,0.14) 60%, transparent 61%);
          background-size: 220px 220px, 260px 260px, 240px 240px, 260px 260px; /* denser */
          background-repeat: repeat;
          animation: starfieldB 200s linear infinite, twinkleB 9s ease-in-out infinite;
          background-position:
            calc((var(--mx) - .5) * -5%) calc((var(--my) - .5) * -5%),
            calc((var(--mx) - .5) * -6%) calc((var(--my) - .5) * -6%),
            calc((var(--mx) - .5) * -7%) calc((var(--my) - .5) * -7%),
            calc((var(--mx) - .5) * -8%) calc((var(--my) - .5) * -8%);
        }

        /* Third star layer for depth */
        .layer-starsC {
          z-index: 3;
          opacity: 0.55;
          background-image:
            radial-gradient(2px 2px at 15% 45%, rgba(255,255,255,0.18) 60%, transparent 61%),
            radial-gradient(2px 2px at 65% 20%, rgba(160,255,245,0.18) 60%, transparent 61%);
          background-size: 260px 260px, 300px 300px;
          background-repeat: repeat;
          animation: starfieldC 220s linear infinite, twinkleC 12s ease-in-out infinite;
          background-position:
            calc((var(--mx) - .5) * 4%) calc((var(--my) - .5) * 4%),
            calc((var(--mx) - .5) * 5%) calc((var(--my) - .5) * 5%);
        }

        /* 3) NEURAL FILAMENTS (brighter & thicker) */
        .layer-filaments-wrap { z-index: 4; display: grid; place-items: center; }
        .filaments {
          width: 200vmax;
          height: 200vmax;
          opacity: 0.42; /* up from ~0.24 */
          border-radius: 50%;
          background:
            conic-gradient(from 0deg,
              rgba(160,255,245,0.18) 0deg, rgba(160,255,245,0.00) 26deg,
              rgba(255,255,255,0.16) 48deg, rgba(255,255,255,0.00) 86deg,
              rgba(160,255,245,0.14) 128deg, rgba(160,255,245,0.00) 168deg,
              rgba(255,255,255,0.12) 210deg, rgba(255,255,255,0.00) 244deg,
              rgba(160,255,245,0.14) 300deg, rgba(160,255,245,0.00) 334deg
            ),
            conic-gradient(from 180deg,
              rgba(255,255,255,0.12) 0deg, rgba(255,255,255,0.00) 36deg,
              rgba(160,255,245,0.18) 78deg, rgba(160,255,245,0.00) 118deg,
              rgba(255,255,255,0.14) 166deg, rgba(255,255,255,0.00) 200deg,
              rgba(160,255,245,0.18) 248deg, rgba(160,255,245,0.00) 286deg,
              rgba(255,255,255,0.12) 324deg, rgba(255,255,255,0.00) 356deg
            );
          -webkit-mask: radial-gradient(circle at var(--cx) var(--cy),
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.30) calc(14% + 3% * var(--pulse)),
            rgba(0,0,0,0.55) calc(32% + 4% * var(--pulse)),
            rgba(0,0,0,0.88) 56%,
            rgba(0,0,0,1) 76%);
          mask: radial-gradient(circle at var(--cx) var(--cy),
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.30) calc(14% + 3% * var(--pulse)),
            rgba(0,0,0,0.55) calc(32% + 4% * var(--pulse)),
            rgba(0,0,0,0.88) 56%,
            rgba(0,0,0,1) 76%);
          animation: filamentsSpin 240s linear infinite; /* slower + continuous */
          transform-origin: center center;
        }

        /* 4) SUBTLE NEURAL GRID (soft links) */
        .layer-grid-wrap { z-index: 5; display: grid; place-items: center; }
        .gridlinks {
          width: 180vmax;
          height: 180vmax;
          opacity: 0.18; /* visibility up */
          border-radius: 50%;
          background:
            repeating-linear-gradient(0deg,   rgba(255,255,255,0.08) 0 1px, transparent 1px 40px),
            repeating-linear-gradient(90deg,  rgba(255,255,255,0.08) 0 1px, transparent 1px 40px),
            repeating-linear-gradient(45deg,  rgba(160,255,245,0.08) 0 1px, transparent 1px 56px),
            repeating-linear-gradient(135deg, rgba(160,255,245,0.06) 0 1px, transparent 1px 56px);
          -webkit-mask: radial-gradient(circle at var(--cx) var(--cy),
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.25) 18%,
            rgba(0,0,0,0.55) 40%,
            rgba(0,0,0,0.90) 64%,
            rgba(0,0,0,1) 76%);
          mask: radial-gradient(circle at var(--cx) var(--cy),
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.25) 18%,
            rgba(0,0,0,0.55) 40%,
            rgba(0,0,0,0.90) 64%,
            rgba(0,0,0,1) 76%);
          animation: gridRotate 360s linear infinite; /* super slow */
        }

        /* 5) Vignette */
        .layer-vignette {
          z-index: 6;
          background: radial-gradient(ellipse at 50% 48%,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0) 55%,
            rgba(0,0,0,0.50) 100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .layer-core,
          .layer-starsA,
          .layer-starsB,
          .layer-starsC,
          .filaments,
          .gridlinks {
            animation: none;
          }
        }
      `}</style>

      {/* =================== HERO =================== */}
      <section
        ref={heroRef}
        className="neura-space relative isolate min-h-screen flex items-center overflow-hidden bg-[#0A0A0A]"
      >
        {/* Background layers (back → front) */}
        <div className="absfill gpu layer-core" />
        <div className="absfill gpu layer-starsA" />
        <div className="absfill gpu layer-starsB" />
        <div className="absfill gpu layer-starsC" />
        <div className="absfill layer-filaments-wrap">
          <div className="filaments" />
        </div>
        <div className="absfill layer-grid-wrap">
          <div className="gridlinks" />
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

      {/* =================== BODY =================== */}
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
