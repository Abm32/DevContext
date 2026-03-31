const base = import.meta.env.BASE_URL;

export default function Slide7Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <img
        src={`${base}hero.png`}
        crossOrigin="anonymous"
        alt="Neural network"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080812] via-[#080812]/85 to-[#080812]/60" />
      <div className="absolute inset-0" style={{background: "radial-gradient(ellipse 80% 80% at 50% 50%, #6366f1 0%, transparent 60%)", opacity: 0.12}} />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-[10vw]">
        <div className="flex items-center gap-[1vw] mb-[4vh]">
          <div className="w-[2.5vw] h-[2.5vw] rounded-[0.6vw] bg-[#6366f1] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-[1.4vw] h-[1.4vw]">
              <circle cx="12" cy="12" r="3" fill="white"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-[2vw] font-bold text-white">DevContext</span>
        </div>

        <h2 className="font-display text-[5vw] font-bold tracking-tight text-white leading-tight mb-[2vh]">
          Every developer deserves
        </h2>
        <h2 className="font-display text-[5vw] font-bold tracking-tight text-[#6366f1] leading-tight mb-[4vh]">
          instant context.
        </h2>

        <p className="font-body text-[1.8vw] text-white/50 max-w-[48vw] leading-snug mb-[6vh]">
          Live and deployed. Connect your GitHub account and recover your context in seconds — right now.
        </p>

        <div className="flex items-center gap-[4vw]">
          <div className="text-center">
            <p className="font-mono text-[1.8vw] font-semibold text-[#10b981] tracking-wider mb-[0.5vh]">devcontext.replit.app</p>
            <p className="font-body text-[1.2vw] text-white/35">Live demo</p>
          </div>
          <div className="w-[1px] h-[5vh] bg-white/10" />
          <div className="text-center">
            <p className="font-display text-[1.8vw] font-semibold text-white/70 mb-[0.5vh]">Open Source</p>
            <p className="font-body text-[1.2vw] text-white/35">Built on Replit</p>
          </div>
          <div className="w-[1px] h-[5vh] bg-white/10" />
          <div className="text-center">
            <p className="font-display text-[1.8vw] font-semibold text-white/70 mb-[0.5vh]">No API Key</p>
            <p className="font-body text-[1.2vw] text-white/35">Just connect GitHub</p>
          </div>
        </div>
      </div>
    </div>
  );
}
