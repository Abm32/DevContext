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
        {/* Logo */}
        <div className="flex items-center gap-[1vw] mb-[5vh]">
          <div className="w-[2.8vw] h-[2.8vw] rounded-[0.65vw] bg-[#6366f1] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-[1.6vw] h-[1.6vw]">
              <circle cx="12" cy="12" r="3" fill="white"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-[2.2vw] font-bold text-white">DevContext</span>
        </div>

        <h2 className="font-display text-[5.2vw] font-bold tracking-tight text-white leading-tight mb-[1.5vh]">
          Your Code Has Context.
        </h2>
        <h2 className="font-display text-[5.2vw] font-bold tracking-tight bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent leading-tight mb-[4vh]">
          Now You Do Too.
        </h2>

        <p className="font-body text-[1.8vw] text-white/50 max-w-[50vw] leading-snug mb-[6vh]">
          Live, deployed, and ready. Plug in GitHub. Pick up where you left off — right now, in seconds.
        </p>

        {/* CTA grid */}
        <div className="flex items-center gap-[3vw] mb-[6vh]">
          <div className="text-center">
            <p className="font-mono text-[1.6vw] font-semibold text-[#10b981] tracking-wider mb-[0.5vh]">devcontext.abhimanyurb.com</p>
            <p className="font-body text-[1vw] text-white/30">Live — free to try</p>
          </div>
          <div className="w-[1px] h-[5vh] bg-white/10" />
          <div className="text-center">
            <p className="font-display text-[1.6vw] font-semibold text-white/70 mb-[0.5vh]">Free</p>
            <p className="font-body text-[1vw] text-white/30">1 repo · 10 analyses</p>
          </div>
          <div className="w-[1px] h-[5vh] bg-white/10" />
          <div className="text-center">
            <p className="font-display text-[1.6vw] font-semibold text-white/70 mb-[0.5vh]">Plus ₹499/mo</p>
            <p className="font-body text-[1vw] text-white/30">3 repos · 100 analyses</p>
          </div>
          <div className="w-[1px] h-[5vh] bg-white/10" />
          <div className="text-center">
            <p className="font-display text-[1.6vw] font-semibold text-[#8b5cf6] mb-[0.5vh]">Pro ₹999/mo</p>
            <p className="font-body text-[1vw] text-white/30">10 repos · 500 analyses</p>
          </div>
          <div className="w-[1px] h-[5vh] bg-white/10" />
          <div className="text-center">
            <p className="font-display text-[1.6vw] font-semibold text-white/70 mb-[0.5vh]">Team ₹2,499/mo</p>
            <p className="font-body text-[1vw] text-white/30">Unlimited repos</p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex items-center gap-[1vw] flex-wrap justify-center">
          {["AI Briefings", "Standup Generator", "Dependency Health", "Commit Signals", "Multi-Repo Workspaces"].map((f) => (
            <span key={f} className="px-[1.4vw] py-[0.5vh] rounded-full border border-[#6366f1]/30 bg-[#6366f1]/8 font-body text-[1.1vw] text-white/55">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
