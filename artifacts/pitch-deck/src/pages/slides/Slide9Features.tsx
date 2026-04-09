export default function Slide9Features() {
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[1.6vw] h-[1.6vw]" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
          <path strokeLinecap="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
        </svg>
      ),
      title: "AI Briefings",
      desc: "Reads your commits, diffs, and PR activity to generate an instant, human-readable context brief — exactly what you were building and your recommended next step.",
      color: "#6366f1",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[1.6vw] h-[1.6vw]" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/>
        </svg>
      ),
      title: "Standup Generator",
      desc: "One click transforms your commit history into a structured standup update — yesterday, today, blockers. Ready to paste into Slack, Notion, or your daily meeting.",
      color: "#8b5cf6",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[1.6vw] h-[1.6vw]" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.25c0 2.278-3.694 4.125-8.25 4.125S3.75 10.903 3.75 8.625"/>
        </svg>
      ),
      title: "Dependency Health",
      desc: "Scans your package.json against the npm registry — surfaces outdated packages, version lag, and known CVEs before they compound into production problems.",
      color: "#10b981",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[1.6vw] h-[1.6vw]" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/>
        </svg>
      ),
      title: "Commit Health Signals",
      desc: "Detects high-churn files, bug-fix ratios, and commit pattern anomalies. Visualises where complexity is accumulating — before it becomes technical debt.",
      color: "#f59e0b",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-[1.6vw] h-[1.6vw]" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"/>
        </svg>
      ),
      title: "Multi-Repo Workspaces",
      desc: "Bundle multiple repos into a single Workspace for one unified AI context. Built for microservice teams and engineers who live across 5+ repositories daily.",
      color: "#6366f1",
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080812]">
      <div className="absolute inset-0 opacity-8" style={{background:"radial-gradient(ellipse 70% 50% at 50% 0%, #6366f1, transparent)"}} />

      <div className="relative h-full flex flex-col justify-center px-[6vw] py-[5vh]">
        <div className="font-body text-[1.1vw] font-medium tracking-[0.2em] uppercase text-[#6366f1] mb-[1vh]">
          Full Feature Set
        </div>
        <h2 className="font-display text-[3.8vw] font-bold tracking-tight text-white mb-[3.5vh]">
          Five Layers of Intelligence
        </h2>

        <div className="grid grid-cols-5 gap-[1.3vw]">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-[2.5vh_1.8vw] rounded-[1vw] border border-white/6 bg-white/[0.025] flex flex-col gap-[1.5vh]"
            >
              <div
                className="w-[3.2vw] h-[3.2vw] rounded-[0.7vw] flex items-center justify-center shrink-0"
                style={{ background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="font-display text-[1.3vw] font-semibold text-white mb-[0.8vh] leading-tight">{f.title}</h3>
                <p className="font-body text-[1.05vw] text-white/50 leading-snug">{f.desc}</p>
              </div>
              <div className="mt-auto pt-[1vh] border-t border-white/6">
                <div className="w-[2vw] h-[0.15vh] rounded-full" style={{background: f.color}} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
