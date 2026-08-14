import confetti from 'canvas-confetti';

// Play a cheerful synthesizer sound using Web Audio API
export const playCheerfulSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Notes sequence (C5, E5, G5, C6 cheer melody)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch (e) {
    console.error('Audio playback error', e);
  }
};

// Trigger Confetti, Hearts, or Stars
export const triggerCelebration = (type: 'confetti' | 'hearts' | 'stars' = 'confetti') => {
  playCheerfulSound();

  if (type === 'hearts') {
    // Custom heart confetti shapes or rose colors
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#e63946'],
      shapes: ['circle'],
      scalar: 1.2,
    });
  } else if (type === 'stars') {
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#3b82f6', '#10b981'],
      shapes: ['star', 'circle'],
      scalar: 1.3,
    });
  } else {
    // Classic vibrant fireworks confetti
    confetti({
      particleCount: 70,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#001f3f', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#eab308'],
    });
  }
};
