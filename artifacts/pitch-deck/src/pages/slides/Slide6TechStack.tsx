export default function Slide6TechStack() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] opacity-8" style={{background: "radial-gradient(ellipse at 0% 100%, #6366f1, transparent 60%)"}} />

      <div className="relative h-full flex flex-col justify-center px-[7vw]">
        <div className="font-body text-[1.2vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[1.5vh]">
          Built To Ship
        </div>
        <h2 className="font-display text-[4vw] font-bold tracking-tight text-white mb-[4.5vh]">
          Stack + Architecture
        </h2>

        <div className="flex gap-[3vw] items-start">
          <div className="flex-1 space-y-[1.8vh]">
            <div className="flex items-center gap-[1.5vw] p-[2vh_2vw] rounded-[0.8vw] border border-white/8 bg-[#0f0f1e]">
              <div className="w-[2.5vw] h-[2.5vw] rounded-[0.5vw] bg-[#6366f1]/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-[1.4vw] h-[1.4vw] text-[#6366f1]" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </div>
              <div>
                <p className="font-display text-[1.4vw] font-semibold text-white">GitHub REST API</p>
                <p className="font-body text-[1.15vw] text-white/45">Repos, branches, commits, file diffs — real data</p>
              </div>
            </div>

            <div className="flex items-center gap-[1.5vw] p-[2vh_2vw] rounded-[0.8vw] border border-white/8 bg-[#0f0f1e]">
              <div className="w-[2.5vw] h-[2.5vw] rounded-[0.5vw] bg-[#10b981]/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-[1.4vw] h-[1.4vw] text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              </div>
              <div>
                <p className="font-display text-[1.4vw] font-semibold text-white">OpenAI (via Replit AI)</p>
                <p className="font-body text-[1.15vw] text-white/45">Next Steps + Standup modes — no API key required</p>
              </div>
            </div>

            <div className="flex items-center gap-[1.5vw] p-[2vh_2vw] rounded-[0.8vw] border border-white/8 bg-[#0f0f1e]">
              <div className="w-[2.5vw] h-[2.5vw] rounded-[0.5vw] bg-[#6366f1]/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-[1.4vw] h-[1.4vw] text-[#6366f1]" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div>
                <p className="font-display text-[1.4vw] font-semibold text-white">React + Vite + Express 5</p>
                <p className="font-body text-[1.15vw] text-white/45">Full-stack TypeScript — JWT auth, REST API, pnpm monorepo</p>
              </div>
            </div>
          </div>

          <div className="w-[28vw] p-[3vh_2.5vw] rounded-[1vw] border border-[#10b981]/20 bg-[#10b981]/5">
            <p className="font-body text-[1.1vw] font-medium tracking-[0.15em] uppercase text-[#10b981] mb-[2vh]">Features Shipped</p>
            <div className="space-y-[1.3vh]">
              {[
                "GitHub OAuth → instant login",
                "Branch selector — analyze any branch",
                "Parallel commit + diff fetching (~1s)",
                "Next Steps mode — resume your work",
                "Standup mode — paste into Slack",
                "Commit file explorer — click to expand",
                "Copy summary as Markdown",
                "Stateless JWT — scales to any load",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-[0.8vw]">
                  <div className="mt-[0.6vh] w-[0.35vw] h-[0.35vw] rounded-full bg-[#10b981] shrink-0" />
                  <p className="font-body text-[1.2vw] text-white/65 leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
