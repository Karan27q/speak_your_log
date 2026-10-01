# Speak Your Log

A voice-first work log for English (`en-IN`) and Tamil (`ta-IN`). The app listens through the browser's speech-recognition API, lets you review the transcript, and saves confirmed logs in this browser. It does not speak prompts or call OpenAI.

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal and allow microphone access. Speech recognition requires a supported browser, commonly Chrome or Edge. There is no API key or login requirement.

To make and preview a production build:

```sh
npm run build
npm run preview
```

## Recognition and storage

- `src/hooks/useSpeechRecognition.js` uses the browser's Web Speech API with English or Tamil locale selection, interim display, and recognition recovery.
- There is no OpenAI model in the app. Browser speech recognition is free to use from this app, but availability and processing are controlled by the browser; it may need an internet connection and is not guaranteed to work offline.
- Tamil (`ta-IN`) is selectable. Tanglish means Tamil spoken but represented with Latin letters; browser recognition may return Tamil script or misrecognize mixed Tamil-English speech. It does not guarantee Tanglish output.
- Confirmed transcripts are saved to `localStorage` on this device/browser. They are not uploaded or synced, and clearing browser data removes them.
- The app stores recognized text, not an audio recording. Recognition can make mistakes; the app does not translate, rewrite, or correct the transcript.

## Alternative free models

For local/self-hosted recognition instead of browser recognition, Whisper can run locally with `whisper.cpp` or `faster-whisper` and supports Tamil speech. It commonly transcribes Tamil in Tamil script, not guaranteed Tanglish. AI4Bharat's IndicConformer is another Tamil ASR model to evaluate; check its model and code licenses for your use. Either option requires a separate local service or backend integration and is not a drop-in browser API.

## Deploy

Deploy the static Vite app to any static host using `npm run build` and the `dist` output directory. Use HTTPS in production for microphone access. Saved logs stay in the same browser and do not follow the user between devices.

## Known limitations

- Recognition quality and availability vary by browser, device, network, and language. Mixed Tamil-English and Tanglish transcription need real-device testing.
- Transcript history is local to one browser profile; there is no account, cloud backup, or cross-device sync.
- Microphone recognition, English/Tamil accuracy, Tanglish output, and mobile behavior have not been exercised in this development environment.
