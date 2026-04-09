import { useEffect, useRef, useState } from 'react';
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

// Extended to ~87s to match ElevenLabs output at max speed 1.20
const SCENE_DURATIONS = {
  s1:  8300,
  s2:  7300,
  s3:  8300,
  s4:  7800,
  s5: 11500,
  s6:  7300,
  s7:  8400,
  s8:  9300,
  s9: 10300,
  s10: 9400,
};

// Subtitle delays scaled proportionally to the new scene durations
const SCENE_SUBTITLES: Array<Array<{ text: string; delay: number }>> = [
  // Scene 1 — Pitch Hook (8000ms)
  [
    { text: 'Every developer loses context.', delay: 800 },
    { text: 'After a break... After a meeting...', delay: 2600 },
    { text: "After a single night's sleep, you come back and ask:", delay: 4600 },
    { text: 'What was I even working on?', delay: 6400 },
  ],
  // Scene 2 — Problem (7000ms)
  [
    { text: "This isn't a focus problem.", delay: 600 },
    { text: "It's a memory problem.", delay: 2200 },
    { text: 'The average developer spends thirty minutes just re-orienting.', delay: 3800 },
    { text: 'Every. Single. Day.', delay: 6000 },
  ],
  // Scene 3 — Connect Repo (8000ms)
  [
    { text: 'With DevContext, you connect your GitHub repositories in seconds.', delay: 700 },
    { text: 'Select your repo. Choose your branch.', delay: 3600 },
    { text: "That's it.", delay: 6000 },
  ],
  // Scene 4 — Commits Stream (7500ms)
  [
    { text: 'DevContext reads your recent commits, your file changes, your pull requests...', delay: 750 },
    { text: '...and builds a picture of exactly where you left off.', delay: 4700 },
  ],
  // Scene 5 — AI Briefing (11000ms)
  [
    { text: 'Then the magic happens.', delay: 600 },
    { text: '"You were building the Stripe webhook integration."', delay: 2400 },
    { text: '"Your last commit fixed an auth race condition."', delay: 5000 },
    { text: '"Next step: wire webhook events to subscription state."', delay: 7400 },
    { text: 'No digging. No confusion. Just clarity.', delay: 9400 },
  ],
  // Scene 6 — Standup Mode (7000ms)
  [
    { text: 'Need to share what you did yesterday?', delay: 600 },
    { text: 'One click generates your standup.', delay: 2600 },
    { text: 'Yesterday, today, blockers... Done. In seconds.', delay: 4800 },
  ],
  // Scene 7 — Dependency Health (8000ms)
  [
    { text: 'DevContext also checks your dependency health.', delay: 700 },
    { text: 'See which packages are current, which are behind...', delay: 3400 },
    { text: '...and which ones carry vulnerabilities, before they become problems.', delay: 5900 },
  ],
  // Scene 8 — Commit Health (9000ms)
  [
    { text: 'And DevContext reads the health of your codebase...', delay: 600 },
    { text: 'Which files change the most? Where are the hotspots hiding?', delay: 3400 },
    { text: 'How much of your work is bug fixes versus features?', delay: 6000 },
    { text: 'Now you know.', delay: 8200 },
  ],
  // Scene 9 — Workspace (10000ms)
  [
    { text: 'Working across multiple repositories? Create a Workspace.', delay: 800 },
    { text: 'Bundle two repos, five repos, an entire microservice ecosystem...', delay: 4000 },
    { text: '...into one unified AI context.', delay: 6800 },
    { text: 'One briefing. The full picture.', delay: 8600 },
  ],
  // Scene 10 — Closer (9000ms)
  [
    { text: 'This is DevContext.', delay: 800 },
    { text: 'The intelligence layer for complex engineering.', delay: 2600 },
    { text: 'AI briefings. Standup generation. Dependency health.', delay: 4600 },
    { text: 'Commit health signals. Multi-repo Workspaces.', delay: 6400 },
    { text: 'Resume your code brain.', delay: 8000 },
  ],
];

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
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1;
    audio.play().catch(() => {});
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[var(--color-bg-light)] text-[var(--color-text-primary)]">
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/voiceover.mp3`}
        preload="auto"
      />

      {/* Persistent ambient background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[80vw] h-[80vh] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
          animate={{
            x: ['-20%', '40%', '10%', '-10%', '50%', '30%', '-20%', '10%', '25%', '-5%'][currentScene % 10],
            y: ['10%', '-10%', '40%', '50%', '20%', '60%', '10%', '-10%', '30%', '40%'][currentScene % 10],
            scale: [1, 1.2, 0.8, 1.1, 0.9, 1.3, 0.9, 1.1, 1.2, 0.9][currentScene % 10],
          }}
          transition={{ duration: 3, ease: 'easeInOut' }} />

        <motion.div className="absolute w-[60vw] h-[60vh] rounded-full opacity-15 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent-violet), transparent)' }}
          animate={{
            x: ['10%', '-30%', '5%', '-20%', '15%', '-10%', '20%', '-15%', '10%', '-25%'][currentScene % 10],
            y: ['-10%', '20%', '-20%', '10%', '-30%', '15%', '-5%', '25%', '-15%', '5%'][currentScene % 10],
          }}
          transition={{ duration: 4, ease: 'easeInOut' }} />
      </div>

      {/* Persistent traveling accent line */}
      <motion.div
        className="absolute h-[2px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-violet)] z-50 shadow-[0_0_10px_var(--color-accent)]"
        animate={{
          left:    ['0%', '10%', '50%', '20%', '40%', '15%', '60%', '30%', '5%',  '45%'][currentScene % 10],
          width:   ['100%','80%', '50%', '60%', '20%', '70%', '40%', '50%', '90%', '30%'][currentScene % 10],
          top:     ['10%', '90%', '5%',  '50%', '80%', '15%', '85%', '50%', '25%', '75%'][currentScene % 10],
          opacity: [0.8,   0.5,   0.9,   0.6,   1,     0.7,   0.8,   1,     0.6,   0.9  ][currentScene % 10],
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Scene content */}
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
      </AnimatePresence>

      {/* Synchronized subtitle overlay */}
      <SubtitleOverlay currentScene={currentScene} />
    </div>
  );
}
