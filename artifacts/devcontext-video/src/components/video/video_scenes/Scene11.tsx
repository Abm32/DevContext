import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene11() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-transparent"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5, filter: 'blur(30px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 flex items-center justify-center mix-blend-screen opacity-50 pointer-events-none z-0">
        {phase >= 3 && (
          <motion.div
            className="w-[10px] h-[10px] rounded-full bg-[var(--color-accent)] shadow-[0_0_100px_50px_var(--color-accent)]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 100, opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        )}
      </div>

      <div className="z-10 flex flex-col items-center text-center">
        <motion.div
          className="text-[8vw] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 leading-none mb-6"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={phase >= 1 ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        >
          DEVCONTEXT
        </motion.div>

        <motion.div
          className="text-2xl text-white/60 tracking-wider uppercase font-mono font-bold mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          Resume your code brain — start free today
        </motion.div>

        <div className="flex items-center gap-4">
          {['AI Briefings', 'Standup Generator', 'Dep Health', 'Commit Health', 'Workspaces', 'Free → Team Plans'].map(
            (pill, i) => (
              <motion.div
                key={pill}
                className="px-6 py-2 rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-sm font-bold text-lg"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.12 }}
              >
                {pill}
              </motion.div>
            ),
          )}
        </div>
      </div>
    </motion.div>
  );
}
