import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 3800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-transparent"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/neural-bg.png`} 
          alt="Neural Network"
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <motion.div 
          className="absolute inset-0 bg-[var(--color-accent-violet)] mix-blend-screen"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <motion.div 
        className="relative z-10 w-[65vw] p-10 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-accent-violet)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-white">AI Briefing</h2>
        </div>

        <div className="space-y-6 font-display text-3xl leading-snug">
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
            animate={phase >= 1 ? { opacity: 1, filter: 'blur(0px)', x: 0 } : { opacity: 0, filter: 'blur(10px)', x: -20 }}
          >
            "You were building <span className="text-[var(--color-accent)] font-bold">Stripe webhook integration.</span>"
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
            animate={phase >= 2 ? { opacity: 1, filter: 'blur(0px)', x: 0 } : { opacity: 0, filter: 'blur(10px)', x: -20 }}
            className="text-white/80"
          >
            Last commit fixed an auth race condition.
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)', x: -20 }}
            animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)', x: 0 } : { opacity: 0, filter: 'blur(10px)', x: -20 }}
            className="text-white/80"
          >
            Next: wire webhook events → subscription state.
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          className="mt-10 p-6 rounded-xl bg-[var(--color-emerald)]/10 border border-[var(--color-emerald)]/30"
        >
          <div className="text-[var(--color-emerald)] font-bold font-mono uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-emerald)] animate-pulse" />
            Suggested next steps
          </div>
          <ul className="space-y-3 font-mono text-lg text-white/90">
            <li className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Implement StripeEvent webhook handler
            </li>
            <li className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Map invoice.paid to SubscriptionState
            </li>
            <li className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-emerald)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Write unit tests for signature verification
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
