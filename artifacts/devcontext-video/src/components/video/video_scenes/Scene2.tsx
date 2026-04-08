import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1300),
      setTimeout(() => setPhase(4), 2800), // Exit drift
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const cards = [
    { title: "Context Lost", desc: "Figuring out where you left off", metric: "31 min avg" },
    { title: "Context Lost", desc: "Re-reading docs you already read", metric: "daily" },
    { title: "Context Lost", desc: "Broken flow state", metric: "every morning" },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-transparent"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: "circOut" }}
    >
      <div className="relative w-full max-w-4xl flex items-center justify-center h-full">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className="absolute w-[400px] bg-[#111114]/90 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col gap-4 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8, x: i === 0 ? -200 : i === 2 ? 200 : 0, y: i === 1 ? -100 : 100, rotate: (i - 1) * 15 }}
            animate={phase >= i + 1 
              ? phase >= 4 
                ? { opacity: 0, scale: 0.5, y: -200, rotate: (i - 1) * 45, filter: 'blur(10px)' } 
                : { opacity: 1, scale: 1, x: (i - 1) * 200, y: (i === 1 ? -30 : 30), rotate: (i - 1) * 8 }
              : { opacity: 0, scale: 0.8, x: i === 0 ? -200 : i === 2 ? 200 : 0, y: i === 1 ? -100 : 100, rotate: (i - 1) * 15 }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ zIndex: i }}
          >
            <div className="text-[var(--color-error)] text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-error)] animate-pulse" />
              {card.title}
            </div>
            <div className="text-2xl font-bold leading-tight">{card.desc}</div>
            <div className="text-xl text-white/50 font-mono mt-4 pt-4 border-t border-white/10">
              {card.metric}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
