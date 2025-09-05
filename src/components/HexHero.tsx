import HexSculptP5 from "@/components/HexSculptP5";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] bg-[#0A0A0A] flex items-center">
      {/* The sculpture background */}
      <HexSculptP5 className="" />

      {/* Foreground content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
        <p className="text-cyan-300 font-semibold">Neura AI</p>
        <h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
          Answers at the speed <br className="hidden sm:block" />
          <span className="text-cyan-300">of conversation.</span>
        </h1>
        <p className="mt-6 text-lg text-neutral-300">
          Neura AI surfaces concise, relevant insights while you talk—no toggling, no typing.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <a href="#waitlist" className="px-6 py-3 rounded-2xl bg-cyan-300/90 text-black font-semibold shadow-lg hover:bg-cyan-300">
            Join the waitlist
          </a>
          <button className="px-6 py-3 rounded-2xl bg-neutral-900/80 text-white ring-1 ring-white/10 hover:bg-neutral-900">
            Watch a 30s preview
          </button>
        </div>
      </div>
    </section>
  );
}
