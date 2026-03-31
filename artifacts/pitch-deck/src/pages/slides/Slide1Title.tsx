const base = import.meta.env.BASE_URL;

export default function Slide1Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <img
        src={`${base}hero.png`}
        crossOrigin="anonymous"
        alt="Neural network brain"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#080812] via-[#080812]/80 to-indigo-950/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-transparent to-transparent" />

      <div className="relative h-full flex flex-col justify-between px-[7vw] py-[8vh]">
        <div className="flex items-center gap-[1vw]">
          <div className="w-[1.8vw] h-[1.8vw] rounded-[0.4vw] bg-[#6366f1] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-[1.1vw] h-[1.1vw]">
              <circle cx="12" cy="12" r="3" fill="white"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-[1.4vw] font-semibold text-white/80 tracking-wide">DevContext</span>
        </div>

        <div className="max-w-[65vw]">
          <div className="inline-flex items-center gap-[0.6vw] px-[1.2vw] py-[0.5vh] rounded-full border border-[#6366f1]/40 bg-[#6366f1]/10 mb-[3vh]">
            <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-[#10b981]" />
            <span className="font-body text-[1.2vw] text-[#10b981] font-medium tracking-widest uppercase">AI-Powered Developer Tool</span>
          </div>
          <h1 className="font-display text-[6.5vw] font-bold leading-[0.93] tracking-tight text-white">
            Resume Your
          </h1>
          <h1 className="font-display text-[6.5vw] font-bold leading-[0.93] tracking-tight text-[#6366f1]">
            Code Brain.
          </h1>
          <p className="mt-[2.5vh] font-body text-[1.8vw] text-white/60 leading-snug max-w-[50vw]">
            Stop losing an hour every time you return to a codebase. Get back in flow — in seconds.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-body text-[1.3vw] text-white/40">
            Hackathon Demo — March 2026
          </div>
          <div className="font-mono text-[1.1vw] text-[#6366f1]/60 tracking-wider">
            devcontext.replit.app
          </div>
        </div>
      </div>
    </div>
  );
}
