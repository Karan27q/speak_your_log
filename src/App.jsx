import { useCallback, useEffect, useState } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js';

const LIMIT = 120;
const STORAGE_KEY = 'speak-your-log.entries';

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function readSavedLogs() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [language, setLanguage] = useState('en-IN');
  const [phase, setPhase] = useState('idle');
  const [segments, setSegments] = useState([]);
  const [savedLogs, setSavedLogs] = useState(readSavedLogs);
  const [seconds, setSeconds] = useState(LIMIT);
  const [deadline, setDeadline] = useState(null);
  const [message, setMessage] = useState('');
  const addFinal = useCallback((text) => {
    setSegments((current) => [...current, text]);
  }, []);
  const speech = useSpeechRecognition(language, addFinal);
  const transcript = segments.join('');
  const listening = phase === 'listening';

  function startSession() {
    setSegments([]);
    setMessage('');
    setSeconds(LIMIT);
    setDeadline(Date.now() + LIMIT * 1000);
    setPhase('listening');
    if (!speech.start()) {
      setDeadline(null);
      setPhase('idle');
    }
  }

  function finishSession() {
    speech.stop();
    setDeadline(null);
    setPhase('verify');
  }

  useEffect(() => {
    if (!deadline || phase !== 'listening') return undefined;
    const update = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(left);
      if (!left) {
        speech.stop();
        setDeadline(null);
        setMessage('Two minutes are up. Review and save your transcript.');
        setPhase('verify');
      }
    };
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [deadline, phase, speech.stop]);

  useEffect(() => () => speech.stop(), [speech.stop]);

  function saveLog() {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      language,
      transcript,
      savedAt: new Date().toISOString(),
    };
    const nextLogs = [entry, ...savedLogs];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLogs));
      setSavedLogs(nextLogs);
      setPhase('saved');
      setMessage('Saved on this device.');
    } catch {
      setMessage('Could not save this log in browser storage. Your transcript is still shown above.');
    }
  }

  function removeLog(id) {
    const nextLogs = savedLogs.filter((entry) => entry.id !== id);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLogs));
      setSavedLogs(nextLogs);
    } catch {
      setMessage('Could not delete this log from browser storage.');
    }
  }

  function reset() {
    speech.stop();
    setDeadline(null);
    setSegments([]);
    setMessage('');
    setPhase('idle');
    setSeconds(LIMIT);
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="Speak Your Log home"><span className="brand-mark">S</span><span>Speak Your Log</span></a><span className="tagline">A voice-first work log</span></header>
    <section className="hero" id="top">
      <div className="eyebrow"><span className="live-dot"/> YOUR WORK, IN YOUR WORDS</div>
      <h1>Make the work<br/><em>rememberable.</em></h1>
      <p className="intro">Speak your log. Review it, then save it on this device.</p>
    </section>

    <section className="work-card" aria-label="Work log recorder">
      <div className="card-top"><div><div className="label">TODAY’S LOG</div><h2>Capture a work session</h2></div>
        {listening && <div className="timer" aria-label={`${formatTime(seconds)} remaining`}>{formatTime(seconds)}</div>}
      </div>
      <div className="controls">
        <label className="language-label" htmlFor="language">Language</label>
        <select id="language" value={language} disabled={listening} onChange={(event) => setLanguage(event.target.value)}><option value="en-IN">English</option><option value="ta-IN">தமிழ் (Tamil)</option></select>
        {(phase === 'idle' || phase === 'saved') && <button className="primary" onClick={startSession}><span className="mic-icon">●</span> Start listening</button>}
        {listening && <div className="recording-status is-listening" role="status"><span className="status-dot"/>Listening to you</div>}
      </div>
      {!speech.supported && phase === 'idle' && <p className="hint">For voice input, open this page in Chrome or Edge.</p>}
      {speech.error && <div className="alert" role="alert">{speech.error}<button onClick={startSession}>Try again</button></div>}
      {message && <div className="notice" role="status">{message}</div>}
      {phase === 'verify' && <>
        <div className="divider"/><div className="transcript-heading"><div><div className="label">YOUR WORDS</div><h3>Review your log</h3></div><span className="lock-label">Unedited transcript</span></div>
        <pre className="transcript">{transcript || 'No speech was recognized in this session.'}</pre>
        <p className="confirm-copy">Save this transcript to your logs?</p>
        <div className="confirm-actions"><button className="primary" onClick={saveLog} disabled={!transcript.trim()}>Save log</button><button className="secondary" onClick={reset}>Discard</button></div>
      </>}
      {listening && speech.interim && <div className="interim" aria-live="polite"><span>Hearing</span> {speech.interim}</div>}
      {segments.length > 0 && !['verify', 'saved'].includes(phase) && <div className="captured"><span className="label">CAPTURED TRANSCRIPT</span><pre className="transcript live-transcript">{transcript}{speech.interim ? ` ${speech.interim}` : ''}</pre></div>}
      {listening && <button className="text-button" onClick={finishSession}>Finish and review transcript</button>}
      {savedLogs.length > 0 && <section className="saved-logs" aria-label="Saved logs"><div className="divider"/><div className="label">SAVED ON THIS DEVICE</div>{savedLogs.map((entry) => <article className="saved-log" key={entry.id}><div className="saved-log-meta"><time dateTime={entry.savedAt}>{new Date(entry.savedAt).toLocaleString()}</time><span>{entry.language === 'ta-IN' ? 'தமிழ்' : 'English'}</span></div><pre className="transcript">{entry.transcript}</pre><button className="text-button" onClick={() => removeLog(entry.id)}>Delete</button></article>)}</section>}
    </section>
    <footer><span>Recognition runs through your browser.</span><span>Logs are stored only in this browser.</span></footer>
  </main>;
}
