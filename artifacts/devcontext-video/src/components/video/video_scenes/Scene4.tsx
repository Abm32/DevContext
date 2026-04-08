import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const commits = [
    { msg: "feat(auth): fix race condition in session refresh", time: "2h ago", files: 3 },
    { msg: "fix(webhook): handle Stripe signature mismatch", time: "5h ago", files: 1 },
    { msg: "refactor(db): decouple client from context", time: "1d ago", files: 12 },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-transparent"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-[60vw] bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="h-14 border-b border-white/10 bg-white/5 flex items-center px-6 gap-4">
          <div className="font-mono font-bold text-[var(--color-accent)]">acme/api-server</div>
          <div className="text-white/30 font-mono text-sm">/</div>
          <div className="px-2 py-1 rounded bg-white/10 text-white/70 font-mono text-sm flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
            feat/stripe-webhook
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4 font-mono text-lg bg-[#050505]">
          {commits.map((commit, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-4 p-4 rounded border border-white/5 bg-white/[0.02]"
              initial={{ opacity: 0, x: 50 }}
              animate={phase >= i + 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="mt-1">
                <div className="w-3 h-3 rounded-full bg-[var(--color-emerald)]" />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="text-white font-bold">{commit.msg}</div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/40">{commit.time}</span>
                  <span className="flex items-center gap-1 text-[var(--color-accent)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    {commit.files} files changed
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          
          <motion.div 
            className="flex items-center justify-center pt-4"
            initial={{ opacity: 0 }}
            animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
          >
            <div className="h-6 w-6 border-2 border-t-[var(--color-accent)] border-r-transparent border-b-transparent border-l-[var(--color-accent)] rounded-full animate-spin" />
            <span className="ml-3 text-white/50 text-sm">Generating Briefing...</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
