let audioContext: AudioContext | null = null;

const unlockAudio = () => {
  if (!("AudioContext" in window)) return;
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") {
    void audioContext.resume().catch(() => undefined);
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });
}

export async function playNotificationSound() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return;

  try {
    audioContext ??= new AudioContext();
    const context = audioContext;
    if (context.state === "suspended") await context.resume();

    const startAt = context.currentTime;
    const duration = 30;
    const toneLength = 0.5;
    const frequencies = [988, 1318, 1047, 1397];
    for (let offset = 0, index = 0; offset < duration; offset += toneLength, index += 1) {
      const start = startAt + offset;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequencies[index % frequencies.length];
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.28, start + 0.015);
      gain.gain.setValueAtTime(0.28, start + toneLength - 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + toneLength);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + toneLength);
    }
  } catch {
    // Browsers can block audio until the user interacts with the page.
  }
}
