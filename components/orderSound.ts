let ctx: AudioContext | null = null;
let bufferPromise: Promise<AudioBuffer | null> | null = null;
const SOUND_URL = "/sounds/order-chime.mp3";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

async function unlock() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {}
  }
  // Warm up the decoded buffer on the first interaction so playback is instant.
  if (!bufferPromise) {
    bufferPromise = (async () => {
      try {
        const res = await fetch(SOUND_URL);
        if (!res.ok) return null;
        const data = await res.arrayBuffer();
        return await c.decodeAudioData(data);
      } catch {
        return null;
      }
    })();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock);
}

async function loadChime(): Promise<AudioBuffer | null> {
  if (!bufferPromise) {
    const c = getCtx();
    if (!c) return null;
    bufferPromise = (async () => {
      try {
        const res = await fetch(SOUND_URL);
        if (!res.ok) return null;
        const data = await res.arrayBuffer();
        return await c.decodeAudioData(data);
      } catch {
        return null;
      }
    })();
  }
  return bufferPromise;
}

export async function playOrderSound() {
  try {
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") await c.resume();
    const buf = await loadChime();
    if (!buf) return;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start();
  } catch {}
}
