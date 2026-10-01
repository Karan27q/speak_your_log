import { useCallback, useEffect, useRef, useState } from 'react';

export function useSpeechRecognition(language, onFinal) {
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const callbackRef = useRef(onFinal);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { callbackRef.current = onFinal; }, [onFinal]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    setListening(false);
    setInterim('');
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); setError('Speech recognition is not supported in this browser. Try Chrome or Edge.'); return false; }
    setSupported(true);
    setError('');
    shouldListenRef.current = true;
    let recognition = recognitionRef.current;
    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => setListening(true);
      recognition.onresult = (event) => {
        let partial = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal && text.trim()) callbackRef.current(text);
          else partial += text;
        }
        setInterim(partial);
      };
      recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          shouldListenRef.current = false;
          setError('Could not access the microphone. Check your browser permission and try again.');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError('Speech recognition stopped unexpectedly. Try again.');
        }
      };
      recognition.onend = () => {
        setListening(false);
        if (shouldListenRef.current) {
          window.setTimeout(() => {
            if (!shouldListenRef.current) return;
            try { recognition.start(); } catch { /* a start is already queued */ }
          }, 250);
        }
      };
      recognitionRef.current = recognition;
    }
    recognition.lang = language;
    try { recognition.start(); return true; }
    catch { setError('Could not start speech recognition. Please try again.'); return false; }
  }, [language]);

  useEffect(() => () => {
    shouldListenRef.current = false;
    try { recognitionRef.current?.abort(); } catch { /* nothing to abort */ }
  }, []);

  return { supported, listening, interim, error, start, stop };
}
