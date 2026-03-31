const base = import.meta.env.BASE_URL;

export default function Slide2Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <img
        src={`${base}problem.png`}
        crossOrigin="anonymous"
        alt="Developer context loss"
        className="absolute right-0 top-0 w-[52vw] h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080812] via-[#080812]/95 to-transparent" />

      <div className="relative h-full flex flex-col justify-center px-[7vw]">
        <div className="font-body text-[1.2vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[2vh]">
          The Problem
        </div>

        <h2 className="font-display text-[4.8vw] font-bold tracking-tight text-white leading-tight mb-[4vh] max-w-[52vw]">
          The Monday Morning Wall
        </h2>

        <div className="space-y-[2vh] max-w-[46vw]">
          <div className="flex items-start gap-[1.5vw] p-[2vh_2vw] rounded-[0.8vw] border border-white/5 bg-white/[0.03]">
            <div className="mt-[0.3vh] w-[0.5vw] h-[0.5vw] rounded-full bg-[#6366f1] shrink-0" />
            <p className="font-body text-[1.6vw] text-white/75 leading-snug">
              Developers spend <span className="text-white font-semibold">30–60 minutes</span> every time they return to a codebase just re-orienting themselves
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw] p-[2vh_2vw] rounded-[0.8vw] border border-white/5 bg-white/[0.03]">
            <div className="mt-[0.3vh] w-[0.5vw] h-[0.5vw] rounded-full bg-[#6366f1] shrink-0" />
            <p className="font-body text-[1.6vw] text-white/75 leading-snug">
              Context switching kills flow — yet every developer faces it <span className="text-white font-semibold">daily</span> across multiple projects
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw] p-[2vh_2vw] rounded-[0.8vw] border border-white/5 bg-white/[0.03]">
            <div className="mt-[0.3vh] w-[0.5vw] h-[0.5vw] rounded-full bg-[#6366f1] shrink-0" />
            <p className="font-body text-[1.6vw] text-white/75 leading-snug">
              Git logs, commit messages, and PR threads are <span className="text-white font-semibold">scattered artifacts</span> — not a readable context
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
