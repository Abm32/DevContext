import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-start px-[10vw]"
      {...sceneTransitions.clipPolygon}
    >
      <div className="flex flex-col gap-4 max-w-[60vw]">
        <motion.div
          className="text-[8vw] font-black leading-none tracking-tight text-white/10"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          9:47 AM.
        </motion.div>
        
        <motion.div
          className="text-[6vw] font-bold leading-none tracking-tight text-white/50"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          You open your editor.
        </motion.div>

        <motion.div
          className="text-[6vw] font-bold leading-none tracking-tight text-white"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          30 minutes lost. <span className="text-[var(--color-error)]">Again.</span>
        </motion.div>
        
        <motion.div 
          className="w-4 h-12 bg-white mt-8"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
        />
      </div>
    </motion.div>
  );
}
