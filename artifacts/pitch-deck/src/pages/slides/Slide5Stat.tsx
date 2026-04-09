export default function Slide5Stat() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a18]">
      <div className="absolute inset-0" style={{background: "radial-gradient(ellipse 70% 60% at 30% 50%, #6366f1 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 75% 60%, #10b981 0%, transparent 60%)"}} />
      <div className="absolute inset-0 bg-[#080812]/75" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-[10vw]">
        <div className="font-body text-[1.2vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[3vh]">
          The Cost of Lost Context
        </div>

        <div className="font-display font-bold text-[15vw] leading-none tracking-tighter bg-gradient-to-br from-white via-white to-[#6366f1] bg-clip-text text-transparent mb-[1.5vh]">
          23
        </div>
        <div className="font-display text-[3vw] font-semibold text-white/80 mb-[3vh]">
          minutes to regain full focus
        </div>
        <p className="font-body text-[1.6vw] text-white/45 max-w-[52vw] leading-snug mb-[4vh]">
          after a single context switch — multiply that by every repo, every sprint, every morning standup.
        </p>

        {/* Supporting stats row */}
        <div className="flex items-center gap-[4vw]">
          {[
            { val: "27M+", label: "developers globally" },
            { val: "$58B", label: "lost annually to context switching" },
            { val: "4.6x", label: "ROI from reducing interruptions" },
          ].map((s, i) => (
            <div key={i} className="text-center px-[2vw]">
              <div className="font-display text-[2.2vw] font-bold text-white mb-[0.3vh]">{s.val}</div>
              <div className="font-body text-[1.1vw] text-white/35 max-w-[14vw] leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="font-body text-[1vw] text-white/20 tracking-wide mt-[4vh]">
          Source: Gloria Mark, UC Irvine — research on attention and multitasking · IDC Productivity Report 2024
        </p>
      </div>
    </div>
  );
}
