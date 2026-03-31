export default function Slide3Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute inset-0 opacity-20" style={{background: "radial-gradient(ellipse 80% 60% at 50% 30%, #6366f1 0%, transparent 70%)"}} />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-[8vw]">
        <div className="font-body text-[1.1vw] font-medium tracking-[0.2em] uppercase text-[#10b981] mb-[2vh]">
          The Solution
        </div>

        <h2 className="font-display text-[5vw] font-bold tracking-tighter text-white leading-[0.95] mb-[1.5vh]">
          DevContext
        </h2>

        <p className="font-body text-[1.9vw] text-white/50 font-medium mb-[4vh] max-w-[52vw] leading-snug">
          Connect GitHub. Pick a repo. Get an instant AI-powered summary of exactly what you were building — and what to do next.
        </p>

        {/* 3-step flow */}
        <div className="flex items-center gap-[2.5vw] mb-[4vh]">
          {[
            { num: "01", label: "Connect", sub: "GitHub OAuth", color: "#6366f1" },
            { num: "02", label: "Select", sub: "Repo + Branch", color: "#6366f1" },
            { num: "03", label: "Resume", sub: "AI summary", color: "#10b981" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-[2vw]">
              <div className="text-center">
                <div
                  className="w-[8.5vw] h-[8.5vw] rounded-[1.2vw] flex items-center justify-center mx-auto mb-[1vh]"
                  style={{ border: `1px solid ${step.color}30`, background: `${step.color}12` }}
                >
                  <span className="font-display text-[2.8vw] font-bold" style={{ color: step.color }}>{step.num}</span>
                </div>
                <p className="font-display text-[1.3vw] font-semibold text-white">{step.label}</p>
                <p className="font-body text-[1.1vw] text-white/45">{step.sub}</p>
              </div>
              {i < 2 && <div className="text-[1.8vw] text-[#6366f1]/30 font-light">—</div>}
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-[1vw]">
          {[
            { icon: "⎇", label: "Branch selector" },
            { icon: "📋", label: "Standup generator" },
            { icon: "🔍", label: "File diff explorer" },
            { icon: "⎘", label: "Copy as Markdown" },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-[0.6vw] px-[1.4vw] py-[0.7vh] rounded-full border border-white/10 bg-white/[0.04]"
            >
              <span className="text-[1.2vw]">{f.icon}</span>
              <span className="font-body text-[1.1vw] text-white/70 font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
