import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[#0A0A0B] gap-6 px-[10vw]"
      {...sceneTransitions.wipe}
    >
      {[
        { title: "Compare Repos", color: "var(--color-accent)" },
        { title: "Standup Mode", color: "var(--color-accent-violet)" },
        { title: "Dependency Health", color: "var(--color-emerald)" }
      ].map((panel, i) => (
        <motion.div
          key={i}
          className="flex-1 h-[60vh] rounded-xl border border-white/10 bg-white/5 relative overflow-hidden flex flex-col justify-end p-6"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, delay: i * 0.15 }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-1" 
            style={{ backgroundColor: panel.color }} 
          />
          <div 
            className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(circle at top right, ${panel.color}, transparent 70%)` }}
          />
          <div className="w-12 h-12 rounded-lg bg-white/10 mb-4 flex items-center justify-center backdrop-blur-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={panel.color} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">{panel.title}</h3>
        </motion.div>
      ))}
    </motion.div>
  );
}
