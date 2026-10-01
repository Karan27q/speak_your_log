import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js';
import { speak, stopSpeaking } from './services/speechService.js';
import { generateFollowup } from './services/followupService.js';
import { postLog } from './services/proof.js';

const INTRO = 'What did you try, what broke, and why?';
const LIMIT = 120;

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function App() {
  const [language, setLanguage] = useState('en-IN');
  const [phase, setPhase] = useState('idle');
  const [segments, setSegments] = useState([]);
  const [question, setQuestion] = useState('');
  const [seconds, setSeconds] = useState(LIMIT);
  const [deadline, setDeadline] = useState(null);
  const [message, setMessage] = useState('');
  const silenceRef = useRef(null);
  const phaseRef = useRef(phase);
  const segmentRef = useRef(segments);
  phaseRef.current = phase;
  segmentRef.current = segments;

  const addFinal = useCallback((text) => {
    setSegments((current) => [...current, { speaker: 'student', text, timestamp: Date.now() }]);
    if (silenceRef.current) window.clearTimeout(silenceRef.current);
    silenceRef.current = window.setTimeout(() => {
      if (phaseRef.current === 'listening-initial') finishInitial();
      else if (phaseRef.current === 'listening-followup') finishFollowup();
    }, 2200);
  }, []);

  const speech = useSpeechRecognition(language, addFinal);

  async function listen(nextPhase) {
    setPhase(nextPhase);
    speech.start();
  }

  async function startSession() {
    setSegments([]); segmentRef.current = [];
    setQuestion(''); setMessage(''); setSeconds(LIMIT);
    const endAt = Date.now() + LIMIT * 1000;
    setDeadline(endAt);
    setPhase('asking-initial');
    await speak(INTRO, language);
    if (Date.now() < endAt) await listen('listening-initial');
  }

  function clearSilence() {
    if (silenceRef.current) window.clearTimeout(silenceRef.current);
    silenceRef.current = null;
  }

  async function finishInitial() {
    clearSilence();
    speech.stop();
    // Let the browser deliver any final result emitted by stop() before taking the snapshot.
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    const transcript = segmentRef.current.map((segment) => segment.text).join('');
    if (!transcript.trim()) return;
    setPhase('processing-followup');
    try {
      const nextQuestion = await generateFollowup(transcript);
      setQuestion(nextQuestion);
      if (deadline && Date.now() >= deadline) { setPhase('verify'); return; }
      setPhase('asking-followup');
      await speak(nextQuestion, language);
      if (phaseRef.current === 'asking-followup' && (!deadline || Date.now() < deadline)) await listen('listening-followup');
      else setPhase('verify');
    } catch (error) {
      setPhase('followup-error');
      setMessage(error.message || "I couldn't generate the follow-up question. Try again.");
    }
  }

  function finishFollowup() {
    clearSilence();
    speech.stop();
    setPhase('verify');
  }

  async function retryFollowup() {
    setPhase('processing-followup'); setMessage('');
    const transcript = segmentRef.current.map((segment) => segment.text).join('');
    try {
      const nextQuestion = await generateFollowup(transcript);
      setQuestion(nextQuestion);
      if (deadline && Date.now() >= deadline) { setPhase('verify'); return; }
      setPhase('asking-followup');
      await speak(nextQuestion, language);
      if (!deadline || Date.now() < deadline) await listen('listening-followup');
      else setPhase('verify');
    } catch (error) { setPhase('followup-error'); setMessage(error.message || "I couldn't generate the follow-up question. Try again."); }
  }

  useEffect(() => {
    if (!deadline || ['idle', 'verify', 'posting', 'posted', 'cancelled'].includes(phase)) return undefined;
    const update = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(left);
      if (!left) {
        speech.stop(); stopSpeaking(); clearSilence(); setDeadline(null);
        setMessage('Two minutes are up. Your transcript is ready to review.');
        setPhase('verify');
      }
    };
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [deadline, phase]);

  useEffect(() => () => { clearSilence(); stopSpeaking(); }, []);

  async function confirmPost() {
    setPhase('posting');
    const result = await postLog(segments.map((segment) => segment.text).join(''));
    if (result.posted) setPhase('posted');
    else { setPhase('post-error'); setMessage(result.reason || 'The log could not be posted. Your log is still safe. Try again.'); }
  }

  function reset() {
    speech.stop(); stopSpeaking(); clearSilence(); setDeadline(null); setSegments([]); setQuestion(''); setMessage(''); setPhase('idle'); setSeconds(LIMIT);
  }

  const transcript = segments.map((segment) => segment.text).join('');
  const busy = !['idle', 'verify', 'followup-error', 'post-error', 'posted', 'cancelled'].includes(phase);
  const listening = phase === 'listening-initial' || phase === 'listening-followup';

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="Speak Your Log home"><span className="brand-mark">S</span><span>Speak Your Log</span></a><span className="tagline">A voice-first work log</span></header>
    <section className="hero" id="top">
      <div className="eyebrow"><span className="live-dot"/> YOUR WORK, IN YOUR WORDS</div>
      <h1>Make the work<br/><em>rememberable.</em></h1>
      <p className="intro">Talk through what you tried, what broke, and what you learned. Your words stay yours.</p>
    </section>

    <section className="work-card" aria-label="Work log recorder">
      <div className="card-top"><div><div className="label">TODAY’S LOG</div><h2>Capture a work session</h2></div>
        {busy && <div className="timer" aria-label={`${formatTime(seconds)} remaining`}>{formatTime(seconds)}</div>}
      </div>
      <div className="controls">
        <label className="language-label" htmlFor="language">Language</label>
        <select id="language" value={language} disabled={busy} onChange={(event) => setLanguage(event.target.value)}><option value="en-IN">English</option><option value="ta-IN">தமிழ் (Tamil)</option></select>
        {phase === 'idle' || phase === 'cancelled' ? <button className="primary" onClick={startSession}><span className="mic-icon">●</span> Start speaking</button> : <div className={`recording-status ${listening ? 'is-listening' : ''}`} role="status"><span className="status-dot"/>{listening ? 'Listening to you' : phaseLabel(phase)}</div>}
      </div>
      {!speech.supported && phase === 'idle' && <p className="hint">For voice input, open this page in Chrome or Edge.</p>}
      {speech.error && <div className="alert" role="alert">{speech.error}<button onClick={startSession}>Try again</button></div>}
      {message && <div className="notice" role="status">{message}</div>}
      {phase === 'followup-error' && <button className="secondary retry" onClick={retryFollowup}>Retry follow-up</button>}
      {phase === 'posted' && <div className="success" role="status">Your log has been posted.</div>}
      {phase === 'verify' && <>
        <div className="divider"/><div className="transcript-heading"><div><div className="label">YOUR WORDS</div><h3>Review your log</h3></div><span className="lock-label">Unedited transcript</span></div>
        <pre className="transcript">{transcript || 'No speech was recognized in this session.'}</pre>
        {question && <details className="followup"><summary>Follow-up asked</summary><p>{question}</p></details>}
        <p className="confirm-copy">Should I post this?</p>
        <div className="confirm-actions"><button className="primary" onClick={confirmPost} disabled={!transcript.trim()}>Yes, post it</button><button className="secondary" onClick={reset}>No, discard</button></div>
      </>}
      {phase === 'post-error' && <div className="confirm-actions"><button className="secondary" onClick={confirmPost}>Try posting again</button><button className="secondary" onClick={reset}>Discard log</button></div>}
      {phase === 'posting' && <div className="notice">Posting your log…</div>}
      {listening && speech.interim && <div className="interim" aria-live="polite"><span>Hearing</span> {speech.interim}</div>}
      {segments.length > 0 && !['verify', 'posted'].includes(phase) && <div className="captured"><span className="label">CAPTURED TRANSCRIPT</span><pre className="transcript live-transcript">{transcript}{speech.interim ? ` ${speech.interim}` : ''}</pre></div>}
      {busy && <button className="text-button" onClick={() => { speech.stop(); stopSpeaking(); clearSilence(); setDeadline(null); setPhase('verify'); }}>Finish and review transcript</button>}
    </section>
    <footer><span>Speak naturally. Pause when you’re done.</span><span>Your transcript is never rewritten.</span></footer>
  </main>;
}

function phaseLabel(phase) {
  return ({ 'asking-initial': 'Asking the opening question', 'processing-followup': 'Preparing one follow-up', 'asking-followup': 'Asking a follow-up', posting: 'Posting your log' })[phase] || 'Session in progress';
}
