export default function Slide4HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] opacity-10" style={{background: "radial-gradient(ellipse at 100% 0%, #6366f1, transparent 70%)"}} />

      <div className="relative h-full flex flex-col justify-center px-[7vw]">
        <div className="font-body text-[1.2vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[1.5vh]">
          Under the Hood
        </div>
        <h2 className="font-display text-[4vw] font-bold tracking-tight text-white mb-[4.5vh]">
          How It Works
        </h2>

        <div className="grid grid-cols-2 gap-[1.8vw]">
          <div className="p-[2.5vh_2.2vw] rounded-[1vw] border border-white/8 bg-[#0f0f1e]">
            <div className="flex items-center gap-[1vw] mb-[1.2vh]">
              <span className="font-display text-[2.2vw] font-bold text-[#6366f1]/30">01</span>
              <h3 className="font-display text-[1.5vw] font-semibold text-white">GitHub OAuth Login</h3>
            </div>
            <p className="font-body text-[1.3vw] text-white/55 leading-snug">
              One-click sign-in. Read access to your repos — no passwords, no setup, no API keys.
            </p>
          </div>

          <div className="p-[2.5vh_2.2vw] rounded-[1vw] border border-white/8 bg-[#0f0f1e]">
            <div className="flex items-center gap-[1vw] mb-[1.2vh]">
              <span className="font-display text-[2.2vw] font-bold text-[#6366f1]/30">02</span>
              <h3 className="font-display text-[1.5vw] font-semibold text-white">Select Repo + Branch</h3>
            </div>
            <p className="font-body text-[1.3vw] text-white/55 leading-snug">
              Pick any repo, then drill into any branch — main, feature, hotfix. We fetch the 15 most recent commits and diffs in parallel.
            </p>
          </div>

          <div className="p-[2.5vh_2.2vw] rounded-[1vw] border border-white/8 bg-[#0f0f1e]">
            <div className="flex items-center gap-[1vw] mb-[1.2vh]">
              <span className="font-display text-[2.2vw] font-bold text-[#6366f1]/30">03</span>
              <h3 className="font-display text-[1.5vw] font-semibold text-white">AI Context Synthesis</h3>
            </div>
            <p className="font-body text-[1.3vw] text-white/55 leading-snug">
              Choose your mode: <span className="text-[#6366f1] font-medium">Next Steps</span> for deep context recovery, or <span className="text-[#10b981] font-medium">Standup</span> for a ready-to-paste daily update. AI reads diffs and synthesizes meaning.
            </p>
          </div>

          <div className="p-[2.5vh_2.2vw] rounded-[1vw] border border-[#10b981]/20 bg-[#10b981]/5">
            <div className="flex items-center gap-[1vw] mb-[1.2vh]">
              <span className="font-display text-[2.2vw] font-bold text-[#10b981]/30">04</span>
              <h3 className="font-display text-[1.5vw] font-semibold text-[#10b981]">Back in Flow</h3>
            </div>
            <p className="font-body text-[1.3vw] text-white/55 leading-snug">
              Expand any commit to see files changed. Copy the full summary as Markdown — paste to Slack, Notion, or your PR description. Under 10 seconds total.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
