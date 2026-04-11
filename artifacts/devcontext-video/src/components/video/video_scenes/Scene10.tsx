import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    color: 'rgba(255,255,255,0.6)',
    border: 'rgba(255,255,255,0.15)',
    bg: 'rgba(255,255,255,0.03)',
    limits: ['1 repository', '10 AI analyses/mo', 'Basic commit view'],
    badge: null,
  },
  {
    name: 'Plus',
    price: '₹499',
    period: '/month',
    color: '#3B82F6',
    border: 'rgba(59,130,246,0.4)',
    bg: 'rgba(59,130,246,0.08)',
    limits: ['3 repositories', '100 AI analyses/mo', 'Standup generator', 'Dependency health'],
    badge: null,
  },
  {
    name: 'Pro',
    price: '₹999',
    period: '/month',
    color: '#8B5CF6',
    border: 'rgba(139,92,246,0.5)',
    bg: 'rgba(139,92,246,0.1)',
    limits: ['10 repositories', '500 AI analyses/mo', 'Commit health signals', 'Multi-repo compare'],
    badge: 'MOST POPULAR',
  },
  {
    name: 'Team',
    price: '₹2,499',
    period: '/month',
    color: '#10B981',
    border: 'rgba(16,185,129,0.4)',
    bg: 'rgba(16,185,129,0.08)',
    limits: ['Unlimited repos', '2,000 AI analyses/mo', 'Workspaces', 'Priority support'],
    badge: null,
  },
];

export function Scene10() {
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

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-transparent"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="text-[3.5vw] font-black tracking-tight text-white mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        Plans that scale with you
      </motion.div>

      <motion.div
        className="text-[1.2vw] text-white/50 font-mono mb-8"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3 }}
      >
        Start free. Upgrade when you're ready.
      </motion.div>

      <div className="flex gap-5 items-stretch">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            className="w-[18vw] rounded-xl overflow-hidden flex flex-col relative"
            style={{
              background: plan.bg,
              border: `1px solid ${plan.border}`,
              boxShadow: plan.badge ? `0 0 40px ${plan.border}` : 'none',
            }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, scale: plan.badge ? 1.05 : 1 } : { opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.12 }}
          >
            {plan.badge && (
              <div
                className="text-center py-1.5 text-xs font-black tracking-widest"
                style={{ background: plan.color, color: '#fff' }}
              >
                {plan.badge}
              </div>
            )}

            <div className="p-5 flex flex-col gap-4">
              <div>
                <div className="text-lg font-bold" style={{ color: plan.color }}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[2.2vw] font-black text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm font-mono">{plan.period}</span>
                </div>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div className="flex flex-col gap-2">
                {plan.limits.map((limit, j) => (
                  <motion.div
                    key={j}
                    className="flex items-center gap-2 text-sm text-white/80 font-mono"
                    initial={{ opacity: 0, x: -10 }}
                    animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.1 + j * 0.08 }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={plan.color}
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {limit}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 text-white/40 text-sm font-mono flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
        Powered by Razorpay · Secure payments
      </motion.div>
    </motion.div>
  );
}
