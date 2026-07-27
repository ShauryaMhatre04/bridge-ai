export function speak(text: string, opts?: { rate?: number; voiceURI?: string; interrupt?: boolean }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
  if (opts?.interrupt !== false) window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts?.rate ?? 1;
  if (opts?.voiceURI) {
    const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === opts.voiceURI);
    if (voice) utterance.voice = voice;
  }
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
}
