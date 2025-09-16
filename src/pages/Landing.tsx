import React, { useState } from "react";
import { VideoModal } from "@/components/VideoModal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Button } from "@/components/ui/button";
import { ArrowDown, Play, CheckCircle, Users, Zap, Shield } from "lucide-react";

export default function Landing() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-inter">
      {/* Inline CSS for the background animation (no extra files, no deps) */}
      <style>{`
        /* UTIL: hardware-accelerate the background element */
        .neura-bg { will-change: transform, opacity, background-position, background-size; }

        /* A custom property we animate for "breathing" */
        @property --pulse {
          syntax: "<number>";
          inherits: false;
          initial-value: 0;
        }

        /* subtle slow drift */
        @keyframes neuraDrift {
          0%   { transform: translate3d(0, 0, 0) scale(1.0); }
          50%  { transform: translate3d(0, -0.6%, 0) scale(1.01); }
          100% { transform: translate3d(0, 0, 0) scale(1.0); }
        }

        /* rhythmic pulse that grows/shrinks the main halo and rings */
        @keyframes neuraPulse {
          0%, 100% { --pulse: 0;   opacity: 0.95; }
          50%      { --pulse: 1;   opacity: 1.0; }
        }

        /* twinkling speckles (very subtle) */
        @keyframes neuraGrain {
          0%   { background-position: 0 0, 0 0, 0 0; }
          100% { background-position: 5px 4px, -3px -2px, 2px -3px; }
        }

        /* The actual background layer */
        .neura-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;

          /* We stack multiple gradients:
             1) A central white halo that breathes
             2) Cyan/teal aura ring that grows subtly
             3) Wide soft rings for depth
             4) Very faint speckle/grain layers for life
          */
          background-image:
            radial-gradient(
              circle at 50% 45%,
              rgba(255,255,255,0.10) 0%,
              rgba(255,255,255,0.06) calc(15% + 5% * var(--pulse)),
              rgba(255,255,255,0.02) calc(34% + 6% * var(--pulse)),
              rgba(0,0,0,0.00) 70%
            ),
            radial-gradient(
              circle at 50% 45%,
              rgba(160,255,245,0.18) 0%,
              rgba(160,255,245,0.10) calc(22% + 6% * var(--pulse)),
              rgba(160,255,245,0.04) calc(40% + 8% * var(--pulse)),
              rgba(0,0,0,0.00) 75%
            ),
            radial-gradient(
              circle at 50% 60%,
              rgba(255,255,255,0.06) 0%,
              rgba(255,255,255,0.03) 30%,
              rgba(0,0,0,0.00) 75%
            ),
            /* faint speckles — three layers, each drifting slightly */
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.05) 50%, transparent 51%),
            radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.04) 50%, transparent 51%),
            radial-gradient(1px 1px at 40% 60%, rgba(160,255,245,0.05) 50%, transparent 51%);

          background-repeat: no-repeat, no-repeat, no-repeat, repeat, repeat, repeat;
          background-size:
            140% 140%, /* white halo */
            160% 160%, /* teal aura */
            200% 200%, /* deep rings */
            auto, auto, auto; /* speckles */

          background-position:
            50% 45%, /* halo */
            50% 45%, /* aura */
            50% 60%, /* deep rings */
            0 0, 0 0, 0 0; /* speckles */

          filter: saturate(1.05) contrast(1.02);
          animation:
            neuraPulse 6.2s ease-in-out infinite,
            neuraDrift 28s ease-in-out infinite,
            neuraGrain 1.8s steps(2, end) infinite;
        }

        /* Optional vignette to focus content (very subtle) */
        .neura-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background: radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%);
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .neura-bg { animation: none; }
        }
      `}</style>

      {/* Hero */}
      <section className="relative isolate min-h-screen flex items-center overflow-hidden bg-[#0A0A0A]">
        {/* Lively “neura” background (pure CSS) */}
        <div className="neura-bg" />
        <div className="neura-vignette" />

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
