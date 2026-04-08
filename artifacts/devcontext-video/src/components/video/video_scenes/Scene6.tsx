import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-transparent"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          className="px-8 py-4 rounded-full bg-[var(--color-emerald)]/20 border border-[var(--color-emerald)] text-[var(--color-emerald)] font-bold text-xl flex items-center gap-3 shadow-[0_0_30px_var(--color-emerald)] shadow-emerald-500/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Generate Standup
        </motion.div>

        <motion.div 
          className="w-[50vw] bg-[#0A0A0B]/90 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl font-mono text-lg text-white/80 flex flex-col gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <motion.div
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={phase >= 2 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(5px)' }}
          >
            <span className="text-[var(--color-emerald)] font-bold">Yesterday:</span> Fixed auth session race condition, resolved Stripe signature mismatch.
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(5px)' }}
          >
            <span className="text-[var(--color-emerald)] font-bold">Today:</span> Wire Stripe webhook to subscription state machine.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, filter: 'blur(5px)' }}
            animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(5px)' }}
          >
            <span className="text-[var(--color-emerald)] font-bold">Blockers:</span> None.
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
