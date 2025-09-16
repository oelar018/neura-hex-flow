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

  // Tiny parallax: move background focus a little with the pointer
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / Math.max(1, rect.width);  // 0..1
      const my = (e.clientY - rect.top) / Math.max(1, rect.height); // 0..1
      el.style.setProperty("--mx", mx.toString());
      el.style.setProperty("--my", my.toString());
    };
    const onLeave = () => {
      el.style.setProperty("--mx", "0.5");
      el.style.setProperty("--my", "0.5");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    // defaults
    onLeave();
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-inter">
      {/* Inline CSS (pure CSS neural vibe — no canvas/webgl) */}
      <style>{`
        /* Animate-able number for pulsing */
        @property --pulse { syntax: "<number>"; inherits: false; initial-value: 0; }

        /* Keyframes */
        @keyframes neuraPulse {
          0%, 100% { --pulse: 0; opacity: 0.95; }
          50%      { --pulse: 1; opacity: 1; }
        }
        @keyframes neuraDrift {
          0%   { transform: translate3d(0,0,0) scale(1.0) rotate(0deg); }
          50%  { transform: translate3d(0,-0.8%,0) scale(1.01) rotate(0.5deg); }
          100% { transform: translate3d(0,0,0) scale(1.0) rotate(0deg); }
        }
        @keyframes dotsDrift1 {
          0%   { background-position: 0% 0%; }
          100% { background-position: 100% 60%; }
        }
        @keyframes dotsDrift2 {
          0%   { background-position: 0% 0%; }
          100% { background-position: -120% -80%; }
        }
        @keyframes webRotate {
          0%   { transform: translateZ(0) rotate(0deg);   }
          100% { transform: translateZ(0) rotate(360deg); }
        }

        /* Layer helpers */
        .absfill { position: absolute; inset: 0; pointer-events: none; }
        .neura-bg, .neura-aura, .neura-dots-1, .neura-dots-2, .neura-web, .neura-vignette {
          will-change: transform, opacity, background-position, background-size, filter;
        }

        /* --- Base pulsing core + soft rings (white + teal) --- */
        .neura-bg {
          z-index: 0;
          /* focus follows pointer lightly (center shifts 4–6%) */
          --cx: calc(50% + (var(--mx, 0.5) - 0.5) * 6%);
          --cy: calc(48% + (var(--my, 0.5) - 0.5) * 4%);
          background-image:
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(255,255,255,0.10) 0%,
              rgba(255,255,255,0.06) calc(12% + 5% * var(--pulse)),
              rgba(255,255,255,0.02) calc(30% + 6% * var(--pulse)),
              rgba(0,0,0,0) 70%
            ),
            radial-gradient(
              circle at var(--cx) var(--cy),
              rgba(160,255,245,0.18) 0%,
              rgba(160,255,245,0.10) calc(20% + 6% * var(--pulse)),
              rgba(160,255,245,0.04) calc(36% + 8% * var(--pulse)),
              rgba(0,0,0,0) 76%
            ),
            radial-gradient(
              circle at calc(var(--cx) + 2%) calc(var(--cy) + 6%),
              rgba(255,255,255,0.06) 0%,
              rgba(255,255,255,0.03) 28%,
              rgba(0,0,0,0) 75%
            );
          background-repeat: no-repeat, no-repeat, no-repeat;
          background-size: 140% 140%, 160% 160%, 200% 200%;
          animation: neuraPulse 6.2s ease-in-out infinite, neuraDrift 28s ease-in-out infinite;
          filter: saturate(1.05) contrast(1.02);
        }

        /* --- Constellation dots (two parallax layers) --- */
        /* Layer 1: fine dense speckles drifting diagonally */
        .neura-dots-1 {
          z-index: 1;
          opacity: 0.55;
          background-image:
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.08) 60%, transparent 61%),
            radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.06) 60%, transparent 61%),
            radial-gradient(1px 1px at 85% 25%, rgba(160,255,245,0.08) 60%, transparent 61%),
            radial-gradient(1px 1px at 35% 85%, rgba(255,255,255,0.05) 60%, transparent 61%);
          background-repeat: repeat;
          background-size: 240px 240px, 260px 260px, 320px 320px, 300px 300px;
          animation: dotsDrift1 38s linear infinite;
          transform: translateZ(0);
          /* slight parallax */
          background-position:
            calc((var(--mx, 0.5) - 0.5) * 6%) calc((var(--my, 0.5) - 0.5) * 6%),
            calc((var(--mx, 0.5) - 0.5) * 8%) calc((var(--my, 0.5) - 0.5) * 8%),
            calc((var(--mx, 0.5) - 0.5) * 10%) calc((var(--my, 0.5) - 0.5) * 10%),
            calc((var(--mx, 0.5) - 0.5) * 12%) calc((var(--my, 0.5) - 0.5) * 12%);
        }
        /* Layer 2: bigger, sparser atoms drifting opposite direction */
        .neura-dots-2 {
          z-index: 2;
          opacity: 0.45;
          background-image:
            radial-gradient(1.5px 1.5px at 15% 40%, rgba(255,255,255,0.12) 60%, transparent 61%),
            radial-gradient(1.5px 1.5px at 75% 30%, rgba(160,255,245,0.12) 60%, transparent 61%),
            radial-gradient(1.5px 1.5px at 45% 75%, rgba(255,255,255,0.10) 60%, transparent 61%);
          background-repeat: repeat;
          background-size: 340px 340px, 400px 400px, 360px 360px;
          animation: dotsDrift2 46s linear infinite;
          transform: translateZ(0);
          background-position:
            calc((var(--mx, 0.5) - 0.5) * -6%) calc((var(--my, 0.5) - 0.5) * -6%),
            calc((var(--mx, 0.5) - 0.5) * -8%) calc((var(--my, 0.5) - 0.5) * -8%),
            calc((var(--mx, 0.5) - 0.5) * -10%) calc((var(--my, 0.5) - 0.5) * -10%);
        }

        /* --- Neural “filament web” (rotating, masked near center) --- */
        .neura-web-wrap { z-index: 3; display: grid; place-items: center; }
        .neura-web {
          width: 160vmax;
          height: 160vmax;
          opacity: 0.28;
          border-radius: 50%;
          /* conic gradients create spokes/arcs; multiple layers add richness */
          background:
            conic-gradient(from 0deg,
              rgba(160,255,245,0.10) 0deg, rgba(160,255,245,0.00) 25deg,
              rgba(255,255,255,0.10) 40deg, rgba(255,255,255,0.00) 70deg,
              rgba(160,255,245,0.08) 110deg, rgba(160,255,245,0.00) 150deg,
              rgba(255,255,255,0.06) 190deg, rgba(255,255,255,0.00) 220deg,
              rgba(160,255,245,0.08) 270deg, rgba(160,255,245,0.00) 310deg
            ),
            conic-gradient(from 180deg,
              rgba(255,255,255,0.06) 0deg, rgba(255,255,255,0.00) 35deg,
              rgba(160,255,245,0.10) 60deg, rgba(160,255,245,0.00) 95deg,
              rgba(255,255,255,0.08) 140deg, rgba(255,255,255,0.00) 180deg,
              rgba(160,255,245,0.10) 215deg, rgba(160,255,245,0.00) 250deg,
              rgba(255,255,255,0.06) 300deg, rgba(255,255,255,0.00) 330deg
            );
          /* mask so filaments are strongest near the “brain/core” and fade out */
          -webkit-mask: radial-gradient(circle at var(--cx, 50%) var(--cy, 45%),
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.35) calc(16% + 4% * var(--pulse)),
            rgba(0,0,0,0.6) calc(34% + 6% * var(--pulse)),
            rgba(0,0,0,0.85) 55%,
            rgba(0,0,0,1) 72%);
          mask: radial-gradient(circle at var(--cx, 50%) var(--cy, 45%),
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0.35) calc(16% + 4% * var(--pulse)),
            rgba(0,0,0,0.6) calc(34% + 6% * var(--pulse)),
            rgba(0,0,0,0.85) 55%,
            rgba(0,0,0,1) 72%);
          animation: webRotate 64s linear infinite;
          transform-origin: center center;
        }

        /* Vignette for focus */
        .neura-vignette {
          z-index: 4;
          background: radial-gradient(ellipse at 50% 45%,
            rgba(0,0,0,0) 0%,
            rgba(0,0,0,0) 55%,
            rgba(0,0,0,0.45) 100%);
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .neura-bg,
          .neura-dots-1,
          .neura-dots-2,
          .neura-web {
            animation: none;
          }
        }
      `}</style>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative isolate min-h-screen flex items-center overflow-hidden bg-[#0A0A0A]"
      >
        {/* Neural, futuristic background (stacked pure-CSS layers) */}
        <div className="absfill neura-bg" />
        <div className="absfill neura-dots-1" />
        <div className="absfill neura-dots-2" />
        <div className="absfill neura-web-wrap">
          <div className="neura-web" />
        </div>
        <div className="absfill neura-vignette" />

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

      {/* How it helps */}
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

      {/* Social proof / teaser */}
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

      {/* Waitlist */}
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

      {/* Footer */}
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

      {/* Video modal */}
      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} />
    </div>
  );
}
