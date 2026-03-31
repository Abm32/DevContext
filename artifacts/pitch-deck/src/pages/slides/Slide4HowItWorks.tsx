export default function Slide4HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] opacity-10" style={{background: "radial-gradient(ellipse at 100% 0%, #6366f1, transparent 70%)"}} />

      <div className="relative h-full flex flex-col justify-center px-[7vw]">
        <div className="font-body text-[1.2vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[1.5vh]">
          Under the Hood
        </div>
        <h2 className="font-display text-[4vw] font-bold tracking-tight text-white mb-[5vh]">
          How It Works
        </h2>

        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="p-[3vh_2.5vw] rounded-[1vw] border border-white/8 bg-[#0f0f1e]">
            <div className="flex items-center gap-[1vw] mb-[1.5vh]">
              <span className="font-display text-[2.5vw] font-bold text-[#6366f1]/30">01</span>
              <h3 className="font-display text-[1.6vw] font-semibold text-white">GitHub OAuth Login</h3>
            </div>
            <p className="font-body text-[1.4vw] text-white/55 leading-snug">
              One-click GitHub sign-in. We request read access to your repositories — no passwords, no setup.
            </p>
          </div>

          <div className="p-[3vh_2.5vw] rounded-[1vw] border border-white/8 bg-[#0f0f1e]">
            <div className="flex items-center gap-[1vw] mb-[1.5vh]">
              <span className="font-display text-[2.5vw] font-bold text-[#6366f1]/30">02</span>
              <h3 className="font-display text-[1.6vw] font-semibold text-white">Commit Timeline Fetch</h3>
            </div>
            <p className="font-body text-[1.4vw] text-white/55 leading-snug">
              We pull your 15 most recent commits — messages, changed files, diffs — from the GitHub REST API in parallel.
            </p>
          </div>

          <div className="p-[3vh_2.5vw] rounded-[1vw] border border-white/8 bg-[#0f0f1e]">
            <div className="flex items-center gap-[1vw] mb-[1.5vh]">
              <span className="font-display text-[2.5vw] font-bold text-[#6366f1]/30">03</span>
              <h3 className="font-display text-[1.6vw] font-semibold text-white">AI Context Synthesis</h3>
            </div>
            <p className="font-body text-[1.4vw] text-white/55 leading-snug">
              OpenAI reads your commit history and generates: what you were building, key changes made, and concrete next steps.
            </p>
          </div>

          <div className="p-[3vh_2.5vw] rounded-[1vw] border border-[#10b981]/20 bg-[#10b981]/5">
            <div className="flex items-center gap-[1vw] mb-[1.5vh]">
              <span className="font-display text-[2.5vw] font-bold text-[#10b981]/30">04</span>
              <h3 className="font-display text-[1.6vw] font-semibold text-[#10b981]">Back in Flow</h3>
            </div>
            <p className="font-body text-[1.4vw] text-white/55 leading-snug">
              You get a clear, actionable summary in under 10 seconds. No git log archaeology. No ramp-up time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
