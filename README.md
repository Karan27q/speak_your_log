# Speak Your Log

A responsive, voice-first work log for English (`en-IN`) and Tamil (`ta-IN`). The app asks what you tried, what broke, and why; it can ask one related follow-up; then it shows the browser-recognized transcript for explicit review and confirmation.

## Run locally

```sh
npm install
Copy-Item .env.example .env.local   # PowerShell; set OPENAI_API_KEY in .env.local
npm run dev
```

Open the Vite URL printed in the terminal. Use a supported browser with Web Speech API support, commonly Chrome or Edge, and grant microphone permission when the browser asks. The local Vite middleware serves `/api/followup` through the same server handler used by deployment. Without `OPENAI_API_KEY`, follow-up generation returns a clear configuration error; the rest of the UI loads. Never commit `.env.local` or expose its key to frontend code.

To make a production build and serve its static files locally:

```sh
npm run build
npm run preview
```

`vite preview` serves the static build only; the `/api/followup` serverless function is available on Vercel, or in local development using `npm run dev`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | For follow-up | Server-side OpenAI API key. Configure it only in `.env.local` for local development or the deployment platform's server environment. |
| `OPENAI_MODEL` | No | Responses API model; defaults to `gpt-4.1-mini`. |

## Architecture and transcript preservation

- `src/hooks/useSpeechRecognition.js` wraps browser speech recognition, English/Tamil locale selection, interim display, final-segment capture, errors, and recognition recovery.
- `src/services/speechService.js` handles spoken prompts using browser speech synthesis.
- `api/followup.js` is the server-side follow-up endpoint. It sends the transcript as immutable source data and asks for exactly one question. It validates the response and retries once when the output is invalid.
- The app stores final browser-recognized segments as received and joins them in order for review. It never sends transcript text to a correction, summary, translation, or cleanup step. Recognition software itself may mishear speech; the app preserves the recognized result, not a recording of the audio.
- The 120-second timer is continuous through the follow-up. At the deadline it stops speech and moves to transcript review.
- `src/services/proof.js` is an isolated adapter. It does not post logs until official Proof API documentation is available.

## Deploy to Vercel

1. Push this project to a Git provider and import it into Vercel.
2. Keep the Vite framework preset and the default `npm run build` command/output directory (`dist`). `api/followup.js` is deployed as a Vercel serverless function.
3. Add `OPENAI_API_KEY` in the Vercel project's server-side Environment Variables for the desired environments. Optionally set `OPENAI_MODEL`.
4. Deploy, open the HTTPS production URL in a fresh browser, allow microphone access, and test English and Tamil recognition, follow-up generation, transcript review, and confirmation.

Proof posting will remain pending until the official API documentation supplies its endpoint, authentication, request, and response contract. Do not treat the current adapter response as a successful post.

## Known limitations and verification

- Browser speech recognition varies by browser, device, network, language, and browser vendor. It may not be available offline and can return recognition errors or inaccuracies.
- No automatic voice confirmation is implemented; the review buttons are the explicit confirmation mechanism.
- Transcript persistence across refresh is not implemented; an unposted session is lost on refresh.
- Proof posting is not implemented because official API details were not available.
- Verified in this development environment: the production Vite build succeeded; the local dev server started and served the app; the initial page rendered with the language selector and Start control. Microphone, English/Tamil recognition, actual OpenAI follow-up generation, Proof posting, mobile devices, and a production deployment have not been exercised here.
