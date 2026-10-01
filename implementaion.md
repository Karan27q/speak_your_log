# Speak Your Log — Implementation Instructions

## Current Implementation

The app now listens directly, lets the user review the transcript, and saves confirmed logs to browser `localStorage`. It does not speak prompts or call an LLM/Proof API. The phases below are historical implementation notes and must not be used to reintroduce those flows; see `README.md` for the current behavior.

## Agent Objective

Implement the application completely, incrementally, and test each milestone before moving to the next.

Do not build the entire application in one step without testing.

## Phase 1 — Project Setup

Create:

* React + Vite application
* Git repository
* Clean component structure
* Environment variable support
* Basic responsive UI

Verify:

```text
npm install
npm run dev
npm run build
```

must work.

## Phase 2 — Speech Recognition

Implement a reusable hook:

```text
useSpeechRecognition
```

It should support:

* Start
* Stop
* Restart
* Current transcript
* Listening state
* Error state
* Browser compatibility detection

Supported languages:

```text
en-IN
ta-IN
```

Handle:

* `onstart`
* `onresult`
* `onerror`
* `onend`

Do not assume `onend` means the entire conversation is finished.

Browser speech recognition may stop unexpectedly.

If the session is still active, safely restart recognition.

Do not restart after the 120-second deadline.

## Phase 3 — Transcript Handling

Use incremental transcript segments.

Distinguish:

```text
interimResults
finalResults
```

Only append final results to the permanent transcript.

Do not repeatedly append the same transcript.

Avoid duplicate text caused by recognition restarts.

The transcript displayed to the user should match what the browser recognized.

Never run transcript text through an LLM for correction.

## Phase 4 — Text-to-Speech

Create:

```text
speechService.js
```

with:

```javascript
speak(text, language)
stop()
```

Select an appropriate browser voice when available.

Use:

```text
en-IN
ta-IN
```

based on selected language.

The application must continue working if a matching voice is unavailable.

## Phase 5 — Timer

Create a 120-second session timer.

Requirements:

* Starts when the voice session starts.
* Updates visibly.
* Stops at zero.
* Cannot become negative.
* Stops speech recognition at zero.
* Prevents restarting recognition after timeout.

Example:

```text
02:00
01:59
01:58
...
00:01
00:00
```

The timer should not reset when moving from the initial response to the follow-up.

## Phase 6 — Initial Question

Ask:

"What did you try, what broke, and why?"

Speak the question using speech synthesis.

Then start listening.

Store the student's answer exactly.

## Phase 7 — Follow-up Generation

Create a server-side endpoint:

```text
/api/followup
```

Input:

```json
{
  "transcript": "..."
}
```

Use a strict LLM prompt.

The model must return exactly one question.

Validate the output.

If the model returns multiple questions, reject it and retry once.

If it still fails, display a safe error state instead of inventing a question.

## Phase 8 — Follow-up Conversation

Speak the generated question.

Then listen to the student's answer.

Append the new response to the transcript.

Do not replace the original response.

The final transcript should preserve both responses.

## Phase 9 — Verification

Display the exact transcript.

Example:

```text
Your log

I tried using YOLO but it was giving wrong
detections at night.

I changed the confidence threshold and tested
it again.
```

Do not show an AI-generated summary.

Ask:

"Should I post this?"

Provide clear controls:

```text
Yes, post it
No
```

Voice confirmation may also be supported.

## Phase 10 — Confirmation

Only post after explicit confirmation.

Prefer a UI button as the primary reliable confirmation mechanism.

If voice confirmation is implemented:

Accept clear confirmation phrases.

Reject ambiguous responses.

## Phase 11 — Proof Posting

Implement only against the official API specification.

Do not guess:

* endpoint URLs
* authentication
* request fields
* response format

Keep all Proof-specific code isolated.

## Phase 12 — Error Handling

Every external operation needs an error state.

Speech recognition:

```text
Could not access the microphone.
Try again.
```

LLM:

```text
I couldn't generate the follow-up question.
Try again.
```

Posting:

```text
The log could not be posted.
Your log is still safe. Try again.
```

Never silently fail.

## Phase 13 — UI Polish

Only after functionality works.

Prioritize:

* Large Start button
* Clear recording state
* Visible timer
* Large readable transcript
* Clear microphone status
* Clear confirmation controls
* Mobile responsiveness

Do not spend excessive time on visual effects.

## Phase 14 — Deployment

Deploy to Vercel.

Test the production URL.

Do not consider the task complete until:

```text
Production URL
        ↓
Fresh browser
        ↓
Microphone permission
        ↓
English test
        ↓
Tamil test
        ↓
Follow-up
        ↓
Verification
        ↓
Confirmation
        ↓
Posting
```

all work.
