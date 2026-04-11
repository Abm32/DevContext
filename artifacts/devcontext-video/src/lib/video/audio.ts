let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicNodes: OscillatorNode[] = [];
let musicGains: GainNode[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startAmbientMusic() {
  const ctx = getAudioContext();
  if (!masterGain) return;

  stopAmbientMusic();

  const chords = [
    [130.81, 164.81, 196.00],
    [146.83, 185.00, 220.00],
    [123.47, 155.56, 185.00],
    [110.00, 138.59, 164.81],
  ];

  const now = ctx.currentTime;
  const cycleDuration = 20;

  chords.forEach((chord, ci) => {
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;

      gain.gain.value = 0;

      const segStart = ci * (cycleDuration / chords.length);
      const segEnd = segStart + (cycleDuration / chords.length);

      for (let loop = 0; loop < 20; loop++) {
        const offset = loop * cycleDuration;
        gain.gain.setValueAtTime(0, now + offset + segStart);
        gain.gain.linearRampToValueAtTime(0.15, now + offset + segStart + 1.5);
        gain.gain.setValueAtTime(0.15, now + offset + segEnd - 1.5);
        gain.gain.linearRampToValueAtTime(0, now + offset + segEnd);
      }

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain!);

      osc.start(now);
      musicNodes.push(osc);
      musicGains.push(gain);
    });
  });

  const lfoOsc = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfoOsc.type = 'sine';
  lfoOsc.frequency.value = 0.08;
  lfoGain.gain.value = 30;
  lfoOsc.connect(lfoGain);
  musicNodes.forEach((osc) => {
    lfoGain.connect(osc.frequency);
  });
  lfoOsc.start(now);
  musicNodes.push(lfoOsc);
}

export function stopAmbientMusic() {
  musicNodes.forEach((osc) => {
    try { osc.stop(); } catch {}
  });
  musicNodes = [];
  musicGains = [];
}

let sceneNodes: OscillatorNode[] = [];
let sceneGains: GainNode[] = [];

const SCENE_MELODIES: Record<number, { notes: number[]; tempo: number; type: OscillatorType }> = {
  2: { notes: [261.63, 329.63, 392.00, 440.00, 392.00, 329.63], tempo: 0.6, type: 'triangle' },
  3: { notes: [220.00, 277.18, 329.63, 370.00, 329.63, 277.18, 220.00], tempo: 0.5, type: 'sine' },
  6: { notes: [196.00, 246.94, 293.66, 349.23, 293.66, 246.94], tempo: 0.55, type: 'triangle' },
  7: { notes: [174.61, 220.00, 261.63, 293.66, 329.63, 293.66, 261.63], tempo: 0.5, type: 'sine' },
  8: { notes: [246.94, 293.66, 349.23, 392.00, 440.00, 392.00, 349.23, 293.66], tempo: 0.45, type: 'triangle' },
};

export function playSceneMelody(sceneIndex: number) {
  const melody = SCENE_MELODIES[sceneIndex];
  if (!melody) return;

  stopSceneMelody();
  const ctx = getAudioContext();
  if (!masterGain) return;

  const now = ctx.currentTime;
  const { notes, tempo, type } = melody;

  const melodyGain = ctx.createGain();
  melodyGain.gain.value = 0;
  melodyGain.gain.setValueAtTime(0, now);
  melodyGain.gain.linearRampToValueAtTime(0.5, now + 0.8);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.7;

  melodyGain.connect(filter);
  filter.connect(masterGain);

  for (let loop = 0; loop < 3; loop++) {
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      const noteStart = now + (loop * notes.length * tempo) + (i * tempo);
      const noteEnd = noteStart + tempo * 0.85;

      noteGain.gain.value = 0;
      noteGain.gain.setValueAtTime(0, noteStart);
      noteGain.gain.linearRampToValueAtTime(0.3, noteStart + 0.05);
      noteGain.gain.setValueAtTime(0.3, noteEnd - 0.08);
      noteGain.gain.linearRampToValueAtTime(0, noteEnd);

      osc.connect(noteGain);
      noteGain.connect(melodyGain);

      osc.start(noteStart);
      osc.stop(noteEnd + 0.1);

      sceneNodes.push(osc);
      sceneGains.push(noteGain);
    });
  }

  sceneGains.push(melodyGain);
}

export function stopSceneMelody() {
  sceneNodes.forEach((osc) => {
    try { osc.stop(); } catch {}
  });
  sceneNodes = [];
  sceneGains = [];
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, rate: number = 1.0) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 0.85;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel') ||
        v.name.includes('Microsoft'))
  );
  if (preferred) utterance.voice = preferred;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function cleanupAudio() {
  stopSpeech();
  stopSceneMelody();
  stopAmbientMusic();
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
    masterGain = null;
  }
}
