const base = import.meta.env.BASE_URL;

export default function Slide1Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <img
        src={`${base}hero.png`}
        crossOrigin="anonymous"
        alt="Neural network brain"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#080812] via-[#080812]/80 to-indigo-950/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-15" style={{background:"radial-gradient(ellipse 60% 50% at 70% 40%, #6366f1, transparent)"}} />

      <div className="relative h-full flex flex-col justify-between px-[7vw] py-[7vh]">
        {/* Logo */}
        <div className="flex items-center gap-[0.8vw]">
          <div className="w-[2vw] h-[2vw] rounded-[0.45vw] bg-[#6366f1] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-[1.2vw] h-[1.2vw]">
              <circle cx="12" cy="12" r="3" fill="white"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-[1.5vw] font-semibold text-white/90 tracking-wide">DevContext</span>
        </div>

        {/* Hero text */}
        <div className="max-w-[68vw]">
          <div className="inline-flex items-center gap-[0.6vw] px-[1.2vw] py-[0.5vh] rounded-full border border-[#6366f1]/40 bg-[#6366f1]/10 mb-[3.5vh]">
            <div className="w-[0.45vw] h-[0.45vw] rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-body text-[1.1vw] text-[#10b981] font-medium tracking-widest uppercase">Get Back Into Flow — Instantly</span>
          </div>
          <h1 className="font-display text-[7vw] font-bold leading-[0.9] tracking-tight text-white">
            Never Lose Your
          </h1>
          <h1 className="font-display text-[7vw] font-bold leading-[0.9] tracking-tight bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            Coding Flow Again.
          </h1>
          <p className="mt-[3vh] font-body text-[1.9vw] text-white/55 leading-snug max-w-[48vw]">
            Stop wasting time trying to remember "where was I?"<br/>
            DevContext rebuilds your developer brain in seconds.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[2vw]">
            {["AI Briefings", "Standup Generator", "Dependency Health", "Commit Signals", "Workspaces"].map((f) => (
              <span key={f} className="font-body text-[1.05vw] text-white/35 tracking-wide">{f}</span>
            ))}
          </div>
          <div className="font-mono text-[1.1vw] text-[#6366f1]/60 tracking-wider">
            devcontext.abhimanyurb.com
          </div>
        </div>
      </div>
    </div>
  );
}
