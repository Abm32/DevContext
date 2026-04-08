import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1600),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const deps = [
    { name: "stripe@14.2", status: "Up to date", color: "var(--color-emerald)", fill: "100%", icon: "🟢" },
    { name: "express@4.18", status: "1 minor behind", color: "var(--color-warning)", fill: "75%", icon: "🟡" },
    { name: "jsonwebtoken@8.5", status: "2 vulnerabilities", color: "var(--color-error)", fill: "40%", icon: "🔴", alert: true },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-transparent"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[55vw] bg-[#0A0A0B]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="h-16 border-b border-white/10 bg-white/5 flex items-center px-6">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Dependency Health
          </h2>
        </div>

        <div className="p-8 flex flex-col gap-8 font-mono">
          {deps.map((dep, i) => (
            <div key={dep.name} className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-lg">
                <span className="text-white font-bold">{dep.name}</span>
                <span className={`flex items-center gap-2 ${dep.alert ? 'text-[var(--color-error)]' : 'text-white/70'}`}>
                  {dep.icon} {dep.status}
                </span>
              </div>
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ backgroundColor: dep.color }}
                  initial={{ width: 0 }}
                  animate={phase >= i + 1 ? { width: dep.fill } : { width: 0 }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                />
              </div>
              {dep.alert && phase >= 3 && (
                <motion.div 
                  className="text-[var(--color-error)] text-sm flex items-center gap-2 bg-[var(--color-error)]/10 p-2 rounded border border-[var(--color-error)]/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Update immediately to patch CVE-2023-XXXX
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
