export default function Slide5Stat() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a18]">
      <div className="absolute inset-0" style={{background: "radial-gradient(ellipse 70% 60% at 30% 50%, #6366f1 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 75% 60%, #10b981 0%, transparent 60%)"}} />
      <div className="absolute inset-0 bg-[#080812]/75" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-[10vw]">
        <div className="font-body text-[1.2vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[3vh]">
          The Cost of Lost Context
        </div>

        <div className="font-display font-bold text-[14vw] leading-none tracking-tighter bg-gradient-to-br from-white via-white to-[#6366f1] bg-clip-text text-transparent mb-[2vh]">
          23
        </div>
        <div className="font-display text-[3vw] font-semibold text-white/80 mb-[3vh]">
          minutes to regain full focus
        </div>
        <p className="font-body text-[1.6vw] text-white/45 max-w-[50vw] leading-snug mb-[1.5vh]">
          after a single context switch. Multiply that by every repo, every sprint, every Monday morning.
        </p>
        <p className="font-body text-[1.1vw] text-white/25 tracking-wide">
          Source: Gloria Mark, UC Irvine — research on attention and multitasking
        </p>
      </div>
    </div>
  );
}
