export default function Slide4HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] opacity-10" style={{background: "radial-gradient(ellipse at 100% 0%, #6366f1, transparent 70%)"}} />

      <div className="relative h-full flex flex-col justify-center px-[7vw]">
        <div className="font-body text-[1.1vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[1.5vh]">
          Under the Hood
        </div>
        <h2 className="font-display text-[4vw] font-bold tracking-tight text-white mb-[4vh]">
          How It Works
        </h2>

        <div className="grid grid-cols-2 gap-[1.8vw]">
          {[
            {
              num: "01",
              title: "GitHub OAuth Login",
              body: "One-click sign-in. Read-only access to your repos — no passwords, no setup, no API keys.",
              accent: "#6366f1",
              border: "border-white/8",
              bg: "bg-[#0f0f1e]",
            },
            {
              num: "02",
              title: "Select Repo + Branch",
              body: "Pick any repo, drill into any branch — main, feature, hotfix. We fetch the 15 most recent commits and diffs in parallel.",
              accent: "#8b5cf6",
              border: "border-white/8",
              bg: "bg-[#0f0f1e]",
            },
            {
              num: "03",
              title: "AI Context Synthesis",
              body: "Choose your mode: AI Briefing for deep context recovery, or Standup for a ready-to-paste daily update. AI reads diffs and synthesizes meaning — not just summaries.",
              accent: "#6366f1",
              border: "border-white/8",
              bg: "bg-[#0f0f1e]",
            },
            {
              num: "04",
              title: "Back in Flow — in Seconds",
              body: "Expand any commit to see changed files. Explore dependency health and commit signals. Copy your briefing as Markdown — paste to Slack, Notion, or your PR. Under 10 seconds total.",
              accent: "#10b981",
              border: "border-[#10b981]/25",
              bg: "bg-[#10b981]/5",
            },
          ].map((card) => (
            <div key={card.num} className={`p-[2.5vh_2.2vw] rounded-[1vw] border ${card.border} ${card.bg}`}>
              <div className="flex items-center gap-[1vw] mb-[1.2vh]">
                <span className="font-display text-[2.2vw] font-bold opacity-30" style={{color: card.accent}}>{card.num}</span>
                <h3 className="font-display text-[1.45vw] font-semibold text-white">{card.title}</h3>
              </div>
              <p className="font-body text-[1.25vw] text-white/55 leading-snug">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
