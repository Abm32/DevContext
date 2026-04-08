import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene9() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2500),
      setTimeout(() => setPhase(5), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const repos = [
    { name: "api-server", branch: "main", time: "2h ago" },
    { name: "web-client", branch: "feat/stripe-ui", time: "4h ago" },
    { name: "webhook-processor", branch: "main", time: "1d ago" },
  ];

  const fullText = "Stripe Integration Sprint";
  const summaryText = "You're building end-to-end Stripe payment flow across 3 repos. Frontend checkout UI (80% complete), API payment routes (done), webhook processor (in progress).";

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-transparent gap-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Left Panel */}
      <motion.div 
        className="w-[35vw] bg-[#0A0A0B]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col"
        initial={{ x: -50, opacity: 0 }}
        animate={phase >= 1 ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="h-14 border-b border-white/10 bg-white/5 flex items-center px-6 gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <h2 className="text-lg font-bold text-white">Create Workspace</h2>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs uppercase tracking-wider font-mono">Workspace Name</label>
            <div className="h-10 bg-white/5 border border-white/10 rounded-md px-3 flex items-center text-white font-mono text-sm">
              {phase >= 2 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {fullText.split('').map((char, i) => (
                    <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>{char}</motion.span>
                  ))}
                  <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-1.5 h-4 bg-[var(--color-accent)] ml-1 align-middle"/>
                </motion.span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-white/60 text-xs uppercase tracking-wider font-mono">Repositories</label>
            {repos.map((repo, i) => (
              <motion.div 
                key={repo.name}
                className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                <div className="w-5 h-5 rounded bg-[var(--color-accent)] flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-bold font-mono">{repo.name}</span>
                  <span className="text-white/50 text-xs font-mono">{repo.branch} · {repo.time}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="h-10 mt-2 bg-white/10 text-white rounded-md flex items-center justify-center font-bold text-sm"
            animate={phase >= 4 ? { backgroundColor: 'var(--color-accent)', boxShadow: '0 0 20px var(--color-accent)' } : {}}
            transition={{ duration: 0.5 }}
          >
            Generate Context
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div 
        className="w-[45vw] h-full py-8"
        initial={{ x: 50, opacity: 0 }}
        animate={phase >= 4 ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="h-full bg-[#0A0A0B]/90 backdrop-blur-xl border border-[var(--color-accent)]/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col">
          <div className="h-14 border-b border-white/10 bg-white/5 flex items-center px-6 justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-3.18-4.52 2.5 2.5 0 0 1-1.4-4.5 3 3 0 0 1 3.18-4.52 2.5 2.5 0 0 1 2.96-3.08 2.5 2.5 0 0 1 3.86-.84z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 3.18-4.52 2.5 2.5 0 0 0 1.4-4.5 3 3 0 0 0-3.18-4.52 2.5 2.5 0 0 0-2.96-3.08 2.5 2.5 0 0 0-3.86-.84z"/></svg>
              Workspace Context
            </h2>
            {phase >= 5 && (
              <motion.div 
                className="px-2 py-1 rounded bg-white/10 text-white/80 text-xs font-mono"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                6 commits across 3 repos
              </motion.div>
            )}
          </div>

          <div className="p-8 flex flex-col gap-6">
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs font-mono px-2 py-1 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30">[api-server]</span>
              <span className="text-xs font-mono px-2 py-1 rounded bg-[var(--color-accent-violet)]/20 text-[var(--color-accent-violet)] border border-[var(--color-accent-violet)]/30">[web-client]</span>
              <span className="text-xs font-mono px-2 py-1 rounded bg-[var(--color-emerald)]/20 text-[var(--color-emerald)] border border-[var(--color-emerald)]/30">[webhook-processor]</span>
            </div>

            <div className="text-white/80 text-lg leading-relaxed font-body">
              {phase >= 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {summaryText.split(' ').map((word, i) => (
                    <motion.span 
                      key={i} 
                      className="inline-block mr-1.5"
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.05 }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
