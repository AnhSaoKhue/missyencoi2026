// Audio Alert utility for AI Lesson Plans system (Anh Sao Khue - 0346513056)

/**
 * Plays a warning sound chime using Web Audio API when lesson structure or objectives are incomplete.
 */
export function playAudioWarning() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Create dual-tone warning sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.frequency.setValueAtTime(554.37, ctx.currentTime); // C#5
    osc2.frequency.exponentialRampToValueAtTime(1108.73, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn('Audio warning sound could not be played:', e);
  }
}

/**
 * Plays a success sound chime when a lesson plan is validated or generated.
 */
export function playAudioSuccess() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn('Audio success sound could not be played:', e);
  }
}

/**
 * Stops any active speech synthesis immediately across the entire app.
 */
export function stopAllSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Pre-load voices if available
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Creates a SpeechSynthesisUtterance configured for a clear, loud, standard young female voice.
 */
export function createFemaleUtterance(text: string, langPreference?: 'vi-VN' | 'en-US'): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Auto-detect language if not explicitly provided
  const isVietnamese = /[\u00C0-\u024F\u1EA0-\u1EF9]/.test(text);
  const lang = langPreference || (isVietnamese ? 'vi-VN' : 'en-US');

  utterance.lang = lang;
  utterance.volume = 1.0; // Âm thanh to rõ tối đa
  utterance.rate = 0.92;   // Tốc độ vừa phải, chuẩn lời, tròn vành rõ chữ
  utterance.pitch = 1.18;  // Âm điệu thanh thoát, giọng nữ trẻ tuổi chuẩn

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const langCode = lang.split('-')[0].toLowerCase(); // 'vi' or 'en'
    
    // Filter voices matching language
    const matchingVoices = voices.filter((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(langCode);
    });

    if (matchingVoices.length > 0) {
      // Priority female keywords for young clear female voice
      const femaleKeywords = [
        'hoaimy', 'an', 'zira', 'jenny', 'aria', 'samantha',
        'victoria', 'karen', 'female', 'girl', 'nu', 'nữ',
        'google tiếng việt', 'google us english', 'natural'
      ];
      
      const bestFemaleVoice = matchingVoices.find((v) => {
        const name = v.name.toLowerCase();
        return femaleKeywords.some((kw) => name.includes(kw));
      });

      if (bestFemaleVoice) {
        utterance.voice = bestFemaleVoice;
      } else {
        utterance.voice = matchingVoices[0];
      }
    }
  }

  return utterance;
}

/**
 * Uses SpeechSynthesis to speak text aloud in a clear, loud, standard young female voice.
 */
export function speakText(text: string, langPreference?: 'vi-VN' | 'en-US') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  stopAllSpeech();

  const utterance = createFemaleUtterance(text, langPreference);
  window.speechSynthesis.speak(utterance);
}

