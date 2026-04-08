import { useEffect, useRef } from 'react';
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

const SCENE_DURATIONS = { s1: 4000, s2: 3500, s3: 4500, s4: 4000, s5: 5500, s6: 3500, s7: 3500, s8: 4500, s9: 5000, s10: 4500 };

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
        loop
        preload="auto"
      />
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

      <motion.div
        className="absolute h-[2px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-violet)] z-50 shadow-[0_0_10px_var(--color-accent)]"
        animate={{
          left: ['0%', '10%', '50%', '20%', '40%', '15%', '60%', '30%', '5%', '45%'][currentScene % 10],
          width: ['100%', '80%', '50%', '60%', '20%', '70%', '40%', '50%', '90%', '30%'][currentScene % 10],
          top: ['10%', '90%', '5%', '50%', '80%', '15%', '85%', '50%', '25%', '75%'][currentScene % 10],
          opacity: [0.8, 0.5, 0.9, 0.6, 1, 0.7, 0.8, 1, 0.6, 0.9][currentScene % 10],
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />

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
    </div>
  );
}
