# Speak Your Log — Architecture

## Recommended Stack

Frontend:

* React
* Vite
* Bootstrap 5 or lightweight CSS

Speech recognition:

* Browser Web Speech API
* `webkitSpeechRecognition`
* `en-IN`
* `ta-IN`

Text-to-speech:

* Browser `speechSynthesis`

AI:

* Server-side LLM API
* Never expose an LLM API key in frontend code.

Deployment:

* Vercel

## High-Level Architecture

```text
Browser
   |
   | voice
   v
Speech Recognition
   |
   v
Raw Transcript
   |
   +----------------------+
   |                      |
   v                      v
Local Transcript       LLM Follow-up API
   |                      |
   |                      v
   |                One Question
   |                      |
   +----------+-----------+
              |
              v
        Voice Output
              |
              v
       Student Response
              |
              v
       Exact Transcript
              |
              v
        Log Verification
              |
              v
       Explicit Confirmation
              |
              v
         Proof API
```

## Frontend Responsibilities

The frontend handles:

* Language selection.
* Microphone permission.
* Speech recognition.
* Recording state.
* Timer.
* Transcript display.
* Speech synthesis.
* Conversation state.
* Follow-up display.
* Confirmation UI.
* Error states.

The frontend must NOT contain:

* Secret API keys.
* Private credentials.
* Server-only tokens.

## Backend Responsibilities

The backend handles:

* LLM follow-up generation.
* Proof API communication.
* Secret credentials.
* Input validation.
* Output validation.

## Conversation State

Use an explicit state machine.

Recommended states:

```text
IDLE
  ↓
STARTING
  ↓
LISTENING_INITIAL
  ↓
PROCESSING_FOLLOWUP
  ↓
ASKING_FOLLOWUP
  ↓
LISTENING_FOLLOWUP
  ↓
VERIFYING
  ↓
WAITING_CONFIRMATION
  ↓
POSTING
  ↓
POSTED
```

Error state:

```text
ERROR
```

Do not rely on many unrelated boolean flags when a clear state machine can be used.

## Transcript Model

Store raw transcript segments.

Example:

```javascript
{
  speaker: "student",
  text: "I tried using YOLO but it was giving wrong detections.",
  timestamp: 1727770000
}
```

Do not send the transcript through a "cleanup" model.

The final log should be assembled from the original transcript segments.

## Follow-up API

The frontend sends the student's transcript to the backend.

Example request:

```json
{
  "transcript": "I tried using YOLO but it was giving wrong detections at night."
}
```

Expected response:

```json
{
  "question": "What did you try changing after you noticed the wrong detections?"
}
```

The backend must validate that a question exists before returning it.

## LLM Rules

The LLM is only responsible for generating one follow-up question.

It must never produce:

* a summary
* a rewritten transcript
* multiple questions
* an answer
* invented project details

## Security

Never expose:

```text
OPENAI_API_KEY
GEMINI_API_KEY
ANTHROPIC_API_KEY
```

or any equivalent credential in client-side JavaScript.

Use environment variables on the server.

## Proof Integration

Implement Proof posting behind a dedicated service:

```text
services/proof.js
```

Do not scatter Proof API calls throughout React components.

If official Proof API documentation is unavailable, create an adapter interface without inventing API behavior.

Example:

```javascript
async function postLog(log) {
  // Implement only when official API details are available.
}
```

## Deployment

The deployed application must:

* Load without authentication.
* Work from a fresh browser session.
* Request microphone permission only when required.
* Have no localhost dependencies.
* Have no hardcoded local API URLs.
* Handle missing environment variables gracefully.
