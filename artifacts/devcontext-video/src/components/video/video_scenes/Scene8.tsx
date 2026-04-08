import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene8() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const files = [
    { name: "src/auth/session.ts", changes: 12, bar: "90%", color: "var(--color-error)" },
    { name: "src/webhooks/stripe.ts", changes: 9, bar: "70%", color: "var(--color-warning)" },
    { name: "src/api/routes.ts", changes: 6, bar: "45%", color: "#EAB308" },
    { name: "src/db/client.ts", changes: 3, bar: "20%", color: "var(--color-emerald)" }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-transparent"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[65vw] bg-[#0A0A0B]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <motion.div 
          className="h-16 border-b border-white/10 bg-white/5 flex items-center px-6"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Commit Health Detection
          </h2>
        </motion.div>

        <div className="flex flex-row">
          {/* Left Column */}
          <div className="w-1/2 p-8 border-r border-white/10 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" />
                <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="251.2"
                  animate={phase >= 2 ? { strokeDashoffset: 251.2 * (1 - 0.58) } : { strokeDashoffset: 251.2 }}
                  transition={{ duration: 1.5, ease: "easeOut" }} />
                <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="251.2"
                  animate={phase >= 2 ? { strokeDashoffset: 251.2 * (1 - 0.28) } : { strokeDashoffset: 251.2 }}
                  style={{ originX: '50px', originY: '50px', rotate: '208.8deg' }}
                  transition={{ duration: 1.5, ease: "easeOut" }} />
                <motion.circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="251.2"
                  animate={phase >= 2 ? { strokeDashoffset: 251.2 * (1 - 0.14) } : { strokeDashoffset: 251.2 }}
                  style={{ originX: '50px', originY: '50px', rotate: '309.6deg' }}
                  transition={{ duration: 1.5, ease: "easeOut" }} />
              </svg>
            </div>
            
            <motion.div 
              className="w-full space-y-3 font-mono text-sm"
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div><span className="text-white/80">Feature</span></div><span className="text-white font-bold">58%</span></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div><span className="text-white/80">Bug Fix</span></div><span className="text-white font-bold">28%</span></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white/30"></div><span className="text-white/80">Chore/Refactor</span></div><span className="text-white font-bold">14%</span></div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="w-1/2 p-8 flex flex-col font-mono">
            <motion.h3 
              className="text-white/60 mb-6 uppercase tracking-wider text-sm"
              initial={{ opacity: 0 }}
              animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
            >
              High Churn Files
            </motion.h3>
            
            <div className="flex flex-col gap-5">
              {files.map((file, i) => (
                <div key={file.name} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white">{file.name}</span>
                    <span className="text-white/50">{file.changes} changes</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: file.color }}
                      initial={{ width: 0 }}
                      animate={phase >= 3 ? { width: file.bar } : { width: 0 }}
                      transition={{ duration: 0.8, delay: i * 0.15, ease: "circOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <motion.div 
              className="mt-auto pt-6 text-[var(--color-warning)] text-sm flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
            >
              ⚠ auth/session.ts has high churn — consider refactoring
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
