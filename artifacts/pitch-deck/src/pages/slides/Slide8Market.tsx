export default function Slide8Market() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute inset-0 opacity-12" style={{background:"radial-gradient(ellipse 65% 55% at 15% 50%, #10b981, transparent), radial-gradient(ellipse 45% 45% at 85% 60%, #6366f1, transparent)"}} />

      <div className="relative h-full flex flex-col justify-center px-[7vw]">
        <div className="font-body text-[1.1vw] font-medium tracking-[0.2em] uppercase text-[#10b981] mb-[1.5vh]">
          Market Opportunity
        </div>

        <h2 className="font-display text-[4.5vw] font-bold tracking-tight text-white mb-[5vh] max-w-[60vw] leading-tight">
          Every Developer.<br/>Every Day.
        </h2>

        {/* Three market columns */}
        <div className="grid grid-cols-3 gap-[2vw] mb-[4vh]">
          {[
            {
              size: "27M+",
              label: "Developers globally",
              sub: "Growing at 25% YoY as software eats every industry",
              color: "#6366f1",
            },
            {
              size: "$22B",
              label: "Dev tools market (2024)",
              sub: "Expanding to $38B by 2028 — AI tooling is the fastest-growing segment",
              color: "#8b5cf6",
            },
            {
              size: "$58B",
              label: "Annual productivity loss",
              sub: "Context switching and re-orientation costs — a problem with no current software solution",
              color: "#10b981",
            },
          ].map((col, i) => (
            <div key={i} className="p-[3vh_2.2vw] rounded-[1vw] border border-white/6 bg-white/[0.025]">
              <div className="font-display text-[3.5vw] font-bold mb-[0.8vh]" style={{color: col.color}}>{col.size}</div>
              <div className="font-display text-[1.4vw] font-semibold text-white mb-[1.2vh]">{col.label}</div>
              <p className="font-body text-[1.15vw] text-white/50 leading-snug">{col.sub}</p>
            </div>
          ))}
        </div>

        {/* Target personas */}
        <div className="flex items-center gap-[2vw]">
          <span className="font-body text-[1.1vw] text-white/35 tracking-wide uppercase">Target users:</span>
          {[
            "Solo developers & freelancers",
            "Engineering teams (5–200 devs)",
            "Microservice / multi-repo orgs",
            "Open-source contributors",
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-[0.5vw] px-[1.2vw] py-[0.5vh] rounded-full border border-white/10 bg-white/[0.03]">
              <div className="w-[0.35vw] h-[0.35vw] rounded-full bg-[#6366f1]" />
              <span className="font-body text-[1.05vw] text-white/60">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
