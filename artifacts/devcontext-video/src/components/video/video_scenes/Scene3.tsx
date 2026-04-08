import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 4000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      {...sceneTransitions.scaleFade}
    >
      <img 
        src={`${import.meta.env.BASE_URL}images/neural-bg.png`}
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        alt=""
      />
      
      <motion.div 
        className="absolute w-[40vw] h-[40vw] bg-[var(--color-accent-violet)] rounded-full opacity-20 blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div 
        className="relative z-10 w-[60vw] p-10 rounded-2xl bg-white/5 border border-white/20 backdrop-blur-xl shadow-2xl"
        initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : { opacity: 0, y: 50, scale: 0.9, rotateX: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ transformPerspective: 1000 }}
      >
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-accent-violet)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">AI Briefing</h2>
        </div>

        <div className="space-y-6 font-display text-2xl leading-relaxed">
          <motion.p
            initial={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
            animate={phase >= 1 ? { opacity: 1, filter: 'blur(0px)', x: 0 } : { opacity: 0, filter: 'blur(10px)', x: -20 }}
          >
            "You were building <span className="text-[var(--color-accent)]">Stripe webhook integration.</span>"
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
            animate={phase >= 2 ? { opacity: 1, filter: 'blur(0px)', x: 0 } : { opacity: 0, filter: 'blur(10px)', x: -20 }}
            className="text-white/70"
          >
            Last commit: <span className="text-white">auth race condition fix.</span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="mt-8 p-4 rounded-lg bg-[var(--color-accent-violet)]/10 border border-[var(--color-accent-violet)]/30 text-[var(--color-accent-violet)] font-bold flex items-center gap-4"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent-violet)] animate-pulse" />
            Next: wire webhook → subscription state
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
