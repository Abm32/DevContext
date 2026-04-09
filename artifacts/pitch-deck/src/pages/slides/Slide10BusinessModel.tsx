export default function Slide10BusinessModel() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute inset-0 opacity-10" style={{background:"radial-gradient(ellipse 55% 45% at 20% 80%, #8b5cf6, transparent), radial-gradient(ellipse 40% 40% at 80% 20%, #10b981, transparent)"}} />

      <div className="relative h-full flex flex-col justify-center px-[7vw]">
        <div className="font-body text-[1.1vw] font-medium tracking-[0.2em] uppercase text-[#8b5cf6] mb-[1.5vh]">
          Business Model
        </div>
        <h2 className="font-display text-[4vw] font-bold tracking-tight text-white mb-[4.5vh]">
          Freemium → Team Expansion
        </h2>

        <div className="flex gap-[2vw] items-stretch mb-[4vh]">
          {/* Free */}
          <div className="flex-1 p-[3vh_2.2vw] rounded-[1.2vw] border border-white/8 bg-white/[0.025]">
            <div className="font-body text-[1vw] font-medium tracking-[0.15em] uppercase text-white/40 mb-[1.5vh]">Free</div>
            <div className="font-display text-[3.2vw] font-bold text-white mb-[0.3vh]">$0</div>
            <div className="font-body text-[1.1vw] text-white/35 mb-[2.5vh]">forever</div>
            <div className="space-y-[1vh]">
              {["3 connected repos", "5 AI briefings / day", "Standup generator", "Dependency health scan"].map((item) => (
                <div key={item} className="flex items-center gap-[0.7vw]">
                  <div className="w-[0.35vw] h-[0.35vw] rounded-full bg-white/30 shrink-0" />
                  <span className="font-body text-[1.15vw] text-white/55">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro — highlighted */}
          <div className="flex-1 p-[3vh_2.2vw] rounded-[1.2vw] border border-[#6366f1]/40 bg-[#6366f1]/8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[0.3vh] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]" />
            <div className="flex items-center gap-[0.8vw] mb-[1.5vh]">
              <div className="font-body text-[1vw] font-medium tracking-[0.15em] uppercase text-[#6366f1]">Pro</div>
              <span className="px-[0.7vw] py-[0.2vh] rounded-full bg-[#6366f1]/20 font-body text-[0.85vw] text-[#6366f1] font-medium">Most Popular</span>
            </div>
            <div className="font-display text-[3.2vw] font-bold text-white mb-[0.3vh]">$12</div>
            <div className="font-body text-[1.1vw] text-white/35 mb-[2.5vh]">per user / month</div>
            <div className="space-y-[1vh]">
              {["Unlimited repos & briefings", "Multi-repo Workspaces", "Commit health signals", "Priority AI processing", "Markdown export"].map((item) => (
                <div key={item} className="flex items-center gap-[0.7vw]">
                  <div className="w-[0.35vw] h-[0.35vw] rounded-full bg-[#6366f1] shrink-0" />
                  <span className="font-body text-[1.15vw] text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise */}
          <div className="flex-1 p-[3vh_2.2vw] rounded-[1.2vw] border border-[#10b981]/25 bg-[#10b981]/5">
            <div className="font-body text-[1vw] font-medium tracking-[0.15em] uppercase text-[#10b981] mb-[1.5vh]">Enterprise</div>
            <div className="font-display text-[3.2vw] font-bold text-white mb-[0.3vh]">Custom</div>
            <div className="font-body text-[1.1vw] text-white/35 mb-[2.5vh]">annual contract</div>
            <div className="space-y-[1vh]">
              {["SSO + org management", "Private AI deployment", "Audit logs & compliance", "Dedicated support SLA", "Custom integrations"].map((item) => (
                <div key={item} className="flex items-center gap-[0.7vw]">
                  <div className="w-[0.35vw] h-[0.35vw] rounded-full bg-[#10b981] shrink-0" />
                  <span className="font-body text-[1.15vw] text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Growth levers */}
        <div className="flex gap-[2.5vw]">
          {[
            { label: "Viral loop", desc: "Standup sharing pulls teammates into the product" },
            { label: "Seat expansion", desc: "Solo → team → org as repos are added" },
            { label: "Workspace upsell", desc: "Multi-repo is the natural Pro conversion trigger" },
          ].map((lever, i) => (
            <div key={i} className="flex-1 p-[1.5vh_1.8vw] rounded-[0.7vw] border border-white/6 bg-white/[0.02]">
              <div className="font-display text-[1.2vw] font-semibold text-white mb-[0.5vh]">{lever.label}</div>
              <p className="font-body text-[1.1vw] text-white/40 leading-snug">{lever.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
