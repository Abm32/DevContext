export default function Slide2Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute inset-0 opacity-10" style={{background:"radial-gradient(ellipse 55% 60% at 80% 50%, #6366f1, transparent)"}} />

      <div className="relative h-full flex flex-col justify-center px-[7vw]">
        <div className="font-body text-[1.1vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[1.5vh]">
          The Problem
        </div>

        <h2 className="font-display text-[5vw] font-bold tracking-tight text-white leading-tight mb-[5vh] max-w-[55vw]">
          The Monday Morning Wall
        </h2>

        <div className="space-y-[2vh] max-w-[58vw]">
          {[
            {
              stat: "30–60 min",
              text: "lost every time a developer returns to a codebase — just re-orienting and remembering where they left off.",
              color: "#6366f1",
            },
            {
              stat: "Daily",
              text: "context switching across multiple repos, PRs, branches, and projects. Flow is killed before work begins.",
              color: "#8b5cf6",
            },
            {
              stat: "Scattered",
              text: "Git logs, commit messages, PR threads — useful raw data, but not a readable human context. Developers piece it together manually, every single time.",
              color: "#6366f1",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-[2vw] p-[2.2vh_2.2vw] rounded-[0.8vw] border border-white/6 bg-white/[0.025]">
              <div className="shrink-0 font-display text-[1.8vw] font-bold w-[8vw]" style={{color: item.color}}>
                {item.stat}
              </div>
              <p className="font-body text-[1.5vw] text-white/65 leading-snug pt-[0.3vh]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
