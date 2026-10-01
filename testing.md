# Speak Your Log — Testing Plan

## Test 1 — English capture and save

1. Open the app in Chrome or Edge and allow microphone access.
2. Select English, start listening, and speak a short work log.
3. Finish and review the transcript, then save it.
4. Refresh the page.

Expected: the reviewed transcript is saved in the saved-log list and remains after refresh.

## Test 2 — Tamil capture

1. Select Tamil and start listening.
2. Speak naturally in Tamil, finish, and review the transcript.
3. Save and refresh.

Expected: recognized Tamil text is preserved as returned by the browser. No translation or rewriting occurs.

## Test 3 — Mixed Tamil and English / Tanglish

Speak a mixed sentence, such as: `I tried building a YOLO model but accuracy சரியாக வரவில்லை.` Also test spoken Tamil if Tanglish (Latin-letter) output is needed.

Expected: inspect the actual browser output. Tamil script, mixed script, or recognition errors are possible; Tanglish output is not guaranteed.

## Test 4 — Pause and recognition recovery

Speak a phrase, pause for several seconds, and continue before the two-minute timer ends.

Expected: recognition recovers if the browser ends a recognition segment; the transcript does not duplicate finalized segments.

## Test 5 — Microphone and unsupported browser

Deny microphone access, then test a browser without Web Speech API support.

Expected: a clear error appears, the UI remains usable, and retry is available.

## Test 6 — Local persistence and deletion

Save two logs, refresh, then delete one.

Expected: both logs survive refresh; deleting one removes only that entry and it remains deleted after refresh. Clearing browser data removes local logs.

## Test 7 — Timer and review

Start a session and let the timer reach zero.

Expected: recognition stops and the app opens transcript review without losing finalized text.

## Test 8 — Mobile

On a mobile browser, verify microphone permission, language selection, timer, transcript wrapping, save, and delete controls.

## Verification record

Do not record a human test as passed unless it was actually performed. Track tested devices, language, recognition output, failures, and follow-up work.

Only record results from actual tests.
