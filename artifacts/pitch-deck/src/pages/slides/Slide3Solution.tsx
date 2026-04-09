export default function Slide3Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute inset-0 opacity-18" style={{background: "radial-gradient(ellipse 80% 60% at 50% 30%, #6366f1 0%, transparent 70%)"}} />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-[8vw]">
        <div className="font-body text-[1.1vw] font-medium tracking-[0.2em] uppercase text-[#10b981] mb-[2vh]">
          The Solution
        </div>

        <h2 className="font-display text-[5.2vw] font-bold tracking-tight text-white leading-[0.93] mb-[1.5vh]">
          DevContext
        </h2>

        <p className="font-body text-[1.8vw] text-white/50 font-medium mb-[5vh] max-w-[54vw] leading-snug">
          Connect GitHub. Pick a repo and branch. Get an instant AI-powered briefing of exactly what you were building — and what to do next.
        </p>

        {/* 3-step flow */}
        <div className="flex items-center gap-[3vw] mb-[5vh]">
          {[
            { num: "01", label: "Connect", sub: "GitHub OAuth", color: "#6366f1" },
            { num: "02", label: "Select", sub: "Repo + Branch", color: "#8b5cf6" },
            { num: "03", label: "Resume", sub: "AI Briefing", color: "#10b981" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-[2.5vw]">
              <div className="text-center">
                <div
                  className="w-[9vw] h-[9vw] rounded-[1.3vw] flex items-center justify-center mx-auto mb-[1.2vh]"
                  style={{ border: `1px solid ${step.color}35`, background: `${step.color}12` }}
                >
                  <span className="font-display text-[3vw] font-bold" style={{ color: step.color }}>{step.num}</span>
                </div>
                <p className="font-display text-[1.4vw] font-semibold text-white">{step.label}</p>
                <p className="font-body text-[1.1vw] text-white/40">{step.sub}</p>
              </div>
              {i < 2 && (
                <div className="text-[1.5vw] text-white/15 font-light pb-[2vh]">———</div>
              )}
            </div>
          ))}
        </div>

        {/* 5 feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-[0.8vw]">
          {[
            { label: "AI Briefings", color: "#6366f1" },
            { label: "Standup Generator", color: "#8b5cf6" },
            { label: "Dependency Health", color: "#10b981" },
            { label: "Commit Signals", color: "#6366f1" },
            { label: "Multi-Repo Workspaces", color: "#10b981" },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-[0.5vw] px-[1.4vw] py-[0.7vh] rounded-full border bg-white/[0.04]"
              style={{ borderColor: `${f.color}35` }}
            >
              <div className="w-[0.4vw] h-[0.4vw] rounded-full" style={{background: f.color}} />
              <span className="font-body text-[1.1vw] text-white/70 font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
