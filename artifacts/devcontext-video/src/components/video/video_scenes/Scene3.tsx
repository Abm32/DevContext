import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const repos = [
    { name: "acme/api-server", branches: ["main", "fix/auth-race", "feat/stripe-webhook"] },
    { name: "acme/frontend", branches: ["main", "chore/deps"] },
    { name: "acme/worker-pool", branches: ["main"] }
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-transparent"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[60vw] bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="ml-4 font-mono text-sm text-white/40">Connect Repository</div>
        </div>

        <div className="p-8 flex flex-col gap-6">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={phase >= 1 ? (phase >= 2 ? { scale: 0.95, opacity: 0.8 } : { opacity: 1, scale: 1 }) : { opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <div className={`px-6 py-3 rounded-lg border flex items-center gap-3 font-bold ${phase >= 2 ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'border-white/20 bg-white/5 text-white'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              {phase >= 2 ? 'Connected to GitHub' : 'Connect GitHub'}
            </div>
          </motion.div>

          <div className="flex flex-col gap-2 font-mono text-sm">
            {repos.map((repo, i) => (
              <motion.div
                key={repo.name}
                initial={{ opacity: 0, x: -20 }}
                animate={phase >= 2 + i * 0.5 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`p-4 rounded-lg border flex flex-col gap-3 relative ${i === 0 && phase >= 3 ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-white/5 bg-white/5'}`}
              >
                {i === 0 && phase >= 3 && (
                  <motion.div 
                    className="absolute -bottom-[1px] left-0 h-[2px] bg-[var(--color-accent)]"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <div className={`font-bold ${i === 0 && phase >= 3 ? 'text-[var(--color-accent)]' : 'text-white'}`}>{repo.name}</div>
                  <div className="text-white/40">{i === 0 && phase >= 4 ? 'Syncing...' : 'Synced'}</div>
                </div>

                {i === 0 && phase >= 4 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex gap-2 overflow-hidden"
                  >
                    {repo.branches.map(branch => (
                      <div key={branch} className={`px-2 py-1 rounded text-xs ${branch === 'feat/stripe-webhook' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'bg-white/10 text-white/60'}`}>
                        {branch}
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
