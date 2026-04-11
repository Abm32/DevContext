import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';
import { Scene9 } from './video_scenes/Scene9';
import { Scene10 } from './video_scenes/Scene10';
import { Scene11 } from './video_scenes/Scene11';

const SCENE_DURATIONS = {
  s1:  7500,
  s2:  6600,
  s3:  7500,
  s4:  7100,
  s5: 10500,
  s6:  6600,
  s7:  7600,
  s8:  8500,
  s9:  9400,
  s10: 9000,
  s11: 8600,
};

const SCENE_SUBTITLES: Array<Array<{ text: string; delay: number }>> = [
  [
    { text: 'Every developer loses context.', delay: 800 },
    { text: 'After a break... After a meeting...', delay: 2600 },
    { text: "After a single night's sleep, you come back and ask:", delay: 4600 },
    { text: 'What was I even working on?', delay: 6400 },
  ],
  [
    { text: "This isn't a focus problem.", delay: 600 },
    { text: "It's a memory problem.", delay: 2200 },
    { text: 'The average developer spends thirty minutes just re-orienting.', delay: 3800 },
    { text: 'Every. Single. Day.', delay: 6000 },
  ],
  [
    { text: 'With DevContext, you connect your GitHub repositories in seconds.', delay: 700 },
    { text: 'Select your repo. Choose your branch.', delay: 3600 },
    { text: "That's it.", delay: 6000 },
  ],
  [
    { text: 'DevContext reads your recent commits, your file changes, your pull requests...', delay: 750 },
    { text: '...and builds a picture of exactly where you left off.', delay: 4700 },
  ],
  [
    { text: 'Then the magic happens.', delay: 600 },
    { text: '"You were building the Stripe webhook integration."', delay: 2400 },
    { text: '"Your last commit fixed an auth race condition."', delay: 5000 },
    { text: '"Next step: wire webhook events to subscription state."', delay: 7400 },
    { text: 'No digging. No confusion. Just clarity.', delay: 9400 },
  ],
  [
    { text: 'Need to share what you did yesterday?', delay: 600 },
    { text: 'One click generates your standup.', delay: 2600 },
    { text: 'Yesterday, today, blockers... Done. In seconds.', delay: 4800 },
  ],
  [
    { text: 'DevContext also checks your dependency health.', delay: 700 },
    { text: 'See which packages are current, which are behind...', delay: 3400 },
    { text: '...and which ones carry vulnerabilities, before they become problems.', delay: 5900 },
  ],
  [
    { text: 'And DevContext reads the health of your codebase...', delay: 600 },
    { text: 'Which files change the most? Where are the hotspots hiding?', delay: 3400 },
    { text: 'How much of your work is bug fixes versus features?', delay: 6000 },
    { text: 'Now you know.', delay: 8200 },
  ],
  [
    { text: 'Working across multiple repositories? Create a Workspace.', delay: 800 },
    { text: 'Bundle two repos, five repos, an entire microservice ecosystem...', delay: 4000 },
    { text: '...into one unified AI context.', delay: 6800 },
    { text: 'One briefing. The full picture.', delay: 8600 },
  ],
  [
    { text: 'Plans that scale with you.', delay: 600 },
    { text: 'Free to get started. Plus at four ninety-nine. Pro at nine ninety-nine.', delay: 2400 },
    { text: 'Team plan for your whole engineering squad at twenty-four ninety-nine per month.', delay: 5200 },
    { text: 'Powered by Razorpay. Secure and instant.', delay: 7800 },
  ],
  [
    { text: 'This is DevContext.', delay: 800 },
    { text: 'The intelligence layer for complex engineering.', delay: 2600 },
    { text: 'AI briefings. Standup generation. Dependency health.', delay: 4600 },
    { text: 'Commit health signals. Multi-repo Workspaces.', delay: 6400 },
    { text: 'Resume your code brain — start free today.', delay: 8000 },
  ],
];

const SCENE_TTS: Record<number, { text: string; delay: number; rate?: number }[]> = {
  0: [
    { text: 'Every developer loses context. After a break, after a meeting, after a single night of sleep.', delay: 500, rate: 1.0 },
  ],
  1: [
    { text: "This isn't a focus problem. It's a memory problem.", delay: 400, rate: 1.05 },
  ],
  4: [
    { text: 'Then the magic happens. AI analyzes your commits and tells you exactly where you left off.', delay: 400, rate: 1.0 },
  ],
  5: [
    { text: 'One click generates your daily standup report.', delay: 400, rate: 1.0 },
  ],
  9: [
    { text: 'Plans that scale with you. Start free. Upgrade when you are ready.', delay: 600, rate: 0.95 },
  ],
  10: [
    { text: 'DevContext. Resume your code brain. Start free today.', delay: 500, rate: 0.9 },
  ],
};

function SubtitleOverlay({ currentScene }: { currentScene: number }) {
  const [currentLine, setCurrentLine] = useState('');

  useEffect(() => {
    setCurrentLine('');
    const lines = SCENE_SUBTITLES[currentScene] ?? [];
    const timers = lines.map(({ text, delay }) =>
      setTimeout(() => setCurrentLine(text), delay)
    );
    return () => timers.forEach(t => clearTimeout(t));
  }, [currentScene]);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center pb-10 pointer-events-none px-8">
      <AnimatePresence mode="wait">
        {currentLine && (
          <motion.div
            key={currentLine}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
            className="text-center text-[1.35vw] leading-relaxed max-w-[72%]"
            style={{
              fontFamily: 'var(--font-body)',
              color: '#F1F5F9',
              textShadow: '0 1px 12px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)',
            }}
          >
            {currentLine}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[var(--color-bg-light)] text-[var(--color-text-primary)]">

      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[80vw] h-[80vh] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
          animate={{
            x: ['-20%', '40%', '10%', '-10%', '50%', '30%', '-20%', '10%', '25%', '-5%', '15%'][currentScene % 11],
            y: ['10%', '-10%', '40%', '50%', '20%', '60%', '10%', '-10%', '30%', '40%', '20%'][currentScene % 11],
            scale: [1, 1.2, 0.8, 1.1, 0.9, 1.3, 0.9, 1.1, 1.2, 0.9, 1.15][currentScene % 11],
          }}
          transition={{ duration: 3, ease: 'easeInOut' }} />

        <motion.div className="absolute w-[60vw] h-[60vh] rounded-full opacity-15 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent-violet), transparent)' }}
          animate={{
            x: ['10%', '-30%', '5%', '-20%', '15%', '-10%', '20%', '-15%', '10%', '-25%', '5%'][currentScene % 11],
            y: ['-10%', '20%', '-20%', '10%', '-30%', '15%', '-5%', '25%', '-15%', '5%', '-10%'][currentScene % 11],
          }}
          transition={{ duration: 4, ease: 'easeInOut' }} />
      </div>

      {[2, 3, 4, 5, 6, 7, 8].includes(currentScene) && (
        <motion.div
          className="absolute h-[2px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-violet)] z-50 shadow-[0_0_10px_var(--color-accent)]"
          initial={{ opacity: 0 }}
          animate={{
            left:    { 2: '50%', 3: '20%', 4: '40%', 5: '15%', 6: '60%', 7: '30%', 8: '5%' }[currentScene] ?? '0%',
            width:   { 2: '50%', 3: '60%', 4: '20%', 5: '70%', 6: '40%', 7: '50%', 8: '90%' }[currentScene] ?? '50%',
            top:     { 2: '5%',  3: '50%', 4: '80%', 5: '15%', 6: '85%', 7: '50%', 8: '25%' }[currentScene] ?? '50%',
            opacity: { 2: 0.7,   3: 0.5,   4: 0.9,   5: 0.6,   6: 0.7,   7: 0.8,   8: 0.5 }[currentScene] ?? 0.6,
          }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
        {currentScene === 4 && <Scene5 key="s5" />}
        {currentScene === 5 && <Scene6 key="s6" />}
        {currentScene === 6 && <Scene7 key="s7" />}
        {currentScene === 7 && <Scene8 key="s8" />}
        {currentScene === 8 && <Scene9 key="s9" />}
        {currentScene === 9 && <Scene10 key="s10" />}
        {currentScene === 10 && <Scene11 key="s11" />}
      </AnimatePresence>

      <SubtitleOverlay currentScene={currentScene} />
    </div>
  );
}
