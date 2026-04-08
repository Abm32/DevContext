import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { s1: 3500, s2: 4500, s3: 5000, s4: 3000, s5: 4000 };

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[var(--color-bg-light)]">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute w-[80vw] h-[80vh] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)' }}
          animate={{
            x: ['-20%', '40%', '10%', '-10%', '50%'][currentScene % 5],
            y: ['10%', '-10%', '40%', '50%', '20%'][currentScene % 5],
            scale: [1, 1.2, 0.8, 1.1, 0.9][currentScene % 5],
          }}
          transition={{ duration: 3, ease: 'easeInOut' }} />
          
        <motion.div className="absolute w-[60vw] h-[60vh] rounded-full opacity-15 blur-3xl right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent-violet), transparent)' }}
          animate={{
            x: ['10%', '-30%', '5%', '-20%', '15%'][currentScene % 5],
            y: ['-10%', '20%', '-20%', '10%', '-30%'][currentScene % 5],
          }}
          transition={{ duration: 4, ease: 'easeInOut' }} />
      </div>

      <motion.div
        className="absolute h-[2px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-violet)] z-50 shadow-[0_0_10px_var(--color-accent)]"
        animate={{
          left: ['0%', '10%', '50%', '20%', '40%'][currentScene % 5],
          width: ['100%', '80%', '50%', '60%', '20%'][currentScene % 5],
          top: ['10%', '90%', '5%', '50%', '80%'][currentScene % 5],
          opacity: [0.8, 0.5, 0.9, 0.6, 1][currentScene % 5],
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
        {currentScene === 4 && <Scene5 key="s5" />}
      </AnimatePresence>
    </div>
  );
}
