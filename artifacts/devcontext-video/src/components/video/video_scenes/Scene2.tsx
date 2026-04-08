import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2200),
      setTimeout(() => setPhase(5), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const commits = [
    "feat(auth): fix race condition in session refresh",
    "fix(webhook): handle stripe signature mismatch",
    "refactor: decouple db client from context",
    "chore: update dependencies",
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[#050505]"
      {...sceneTransitions.slideLeft}
    >
      <div className="w-[70vw] h-[70vh] border border-white/10 rounded-xl bg-[#0A0A0B] flex flex-col overflow-hidden shadow-2xl relative">
        <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-[#111114]">
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <motion.div 
            className="ml-4 font-mono text-sm text-white/50"
            initial={{ opacity: 0 }}
            animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          >
            Analyzing GitHub...
          </motion.div>
        </div>
        
        <div className="p-8 flex flex-col gap-6 flex-1 font-mono text-lg text-[var(--color-accent)]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          >
            {'>'} connecting to repository
          </motion.div>
          
          <motion.div
            className="flex items-center gap-4 text-white/80"
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          >
            <span className="text-[var(--color-accent-violet)]">main</span> branch detected
          </motion.div>
          
          <div className="flex flex-col gap-3 mt-4 text-white/60">
            {commits.map((commit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={phase >= 4 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--color-emerald)]" />
                {commit}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {phase >= 3 && (
            <motion.path
              d="M0,50 L20,50 L30,20 L50,80 L60,50 L100,50"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0.5 }}
              animate={{ pathLength: 1, opacity: 0 }}
              transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
            />
          )}
        </motion.svg>
      </div>
    </motion.div>
  );
}
