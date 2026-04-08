import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
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
      className="absolute inset-0 flex items-center justify-center"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(100% at 50% 50%)' }}
      exit={{ clipPath: 'inset(0 100% 0 0)' }}
      transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="relative z-10 text-left w-[80vw] mx-auto">
        <div className="flex flex-col gap-[2vh] text-[8vw] leading-[0.9] font-black tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
          <motion.div
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={phase >= 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 50, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            Every developer
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={phase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 50, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="text-[var(--color-accent-violet)]"
          >
            loses time
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={phase >= 3 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 50, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            re-entering their own code.
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
