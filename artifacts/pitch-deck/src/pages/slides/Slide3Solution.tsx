export default function Slide3Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute inset-0 opacity-20" style={{background: "radial-gradient(ellipse 80% 60% at 50% 50%, #6366f1 0%, transparent 70%)"}} />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-[10vw]">
        <div className="font-body text-[1.2vw] font-medium tracking-[0.2em] uppercase text-[#10b981] mb-[3vh]">
          The Solution
        </div>

        <h2 className="font-display text-[5.5vw] font-bold tracking-tighter text-white leading-[0.95] mb-[2vh]">
          DevContext
        </h2>

        <p className="font-body text-[2.2vw] text-white/50 font-medium mb-[6vh] max-w-[55vw] leading-snug">
          Connect GitHub. Pick a repo. Get an instant AI-powered summary of exactly what you were building — and what to do next.
        </p>

        <div className="flex items-center gap-[3vw]">
          <div className="text-center">
            <div className="w-[10vw] h-[10vw] rounded-[1.5vw] border border-[#6366f1]/30 bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-[1.5vh]">
              <svg viewBox="0 0 24 24" className="w-[4vw] h-[4vw] text-[#6366f1]" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>
            <p className="font-display text-[1.4vw] font-semibold text-white">Connect</p>
            <p className="font-body text-[1.2vw] text-white/45">GitHub OAuth</p>
          </div>

          <div className="text-[2vw] text-[#6366f1]/40 font-light">—</div>

          <div className="text-center">
            <div className="w-[10vw] h-[10vw] rounded-[1.5vw] border border-[#6366f1]/30 bg-[#6366f1]/10 flex items-center justify-center mx-auto mb-[1.5vh]">
              <svg viewBox="0 0 24 24" className="w-[4vw] h-[4vw] text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/>
                <path d="M8 12h8M8 8h5M8 16h3"/>
              </svg>
            </div>
            <p className="font-display text-[1.4vw] font-semibold text-white">Select</p>
            <p className="font-body text-[1.2vw] text-white/45">Any repository</p>
          </div>

          <div className="text-[2vw] text-[#6366f1]/40 font-light">—</div>

          <div className="text-center">
            <div className="w-[10vw] h-[10vw] rounded-[1.5vw] border border-[#10b981]/30 bg-[#10b981]/10 flex items-center justify-center mx-auto mb-[1.5vh]">
              <svg viewBox="0 0 24 24" className="w-[4vw] h-[4vw] text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
              </svg>
            </div>
            <p className="font-display text-[1.4vw] font-semibold text-white">Resume</p>
            <p className="font-body text-[1.2vw] text-white/45">AI context summary</p>
          </div>
        </div>
      </div>
    </div>
  );
}
