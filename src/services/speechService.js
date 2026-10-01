export function speak(text, language) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || !text) return resolve();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase())
      || voices.find((voice) => voice.lang.toLowerCase().startsWith(language.slice(0, 2)))
      || null;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
