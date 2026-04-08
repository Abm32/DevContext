import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      {...sceneTransitions.zoomThrough}
    >
      <div className="absolute inset-0 flex items-center justify-center mix-blend-screen opacity-50 pointer-events-none">
        <motion.div 
          className="w-[100vw] h-[100vw] rounded-full border border-[var(--color-accent)]"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      </div>

      <div className="text-center z-10 flex flex-col items-center">
        <div className="flex text-[4vw] font-bold tracking-tight mb-8">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="text-white/50 mr-3"
          >
            Resume your code brain
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="text-[var(--color-accent)]"
          >
            in seconds.
          </motion.span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          animate={phase >= 3 ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="flex flex-col items-center"
        >
          <div className="text-[6vw] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 leading-none mb-4">
            DEVCONTEXT
          </div>
          <div className="text-xl text-white/40 tracking-wider uppercase font-mono">
            The intelligence layer for complex engineering
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
