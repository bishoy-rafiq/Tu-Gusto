let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
const SOUND_URL = "/sounds/order-chime.mp3";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function unlock() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume();
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
}

async function loadChime(): Promise<AudioBuffer | null> {
  if (buffer) return buffer;
  const c = getCtx();
  if (!c) return null;
  try {
    const res = await fetch(SOUND_URL);
    if (!res.ok) return null;
    const data = await res.arrayBuffer();
    buffer = await c.decodeAudioData(data);
  } catch {
    buffer = null;
  }
  return buffer;
}

export async function playOrderSound() {
  try {
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    const buf = await loadChime();
    if (!buf) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start();
  } catch {}
}
