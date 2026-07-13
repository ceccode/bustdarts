let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) ctx = new AudioCtor();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15, delay = 0) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const start = audioCtx.currentTime + delay;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.start(start);
  osc.stop(start + duration);
}

export function playTap() {
  beep(720, 0.045, 'sine', 0.1);
}

export function playUndo() {
  beep(320, 0.08, 'sine', 0.12);
}

export function playBust() {
  beep(180, 0.18, 'sawtooth', 0.16);
  beep(120, 0.22, 'sawtooth', 0.14, 0.08);
}

export function play180() {
  beep(880, 0.09, 'triangle', 0.16);
  beep(1175, 0.09, 'triangle', 0.16, 0.09);
  beep(1568, 0.14, 'triangle', 0.18, 0.18);
}

export function playCheckout() {
  beep(660, 0.1, 'triangle', 0.16);
  beep(990, 0.16, 'triangle', 0.18, 0.1);
}
