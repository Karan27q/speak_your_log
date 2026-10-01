# Speak Your Log — Testing Plan

## Goal

Test the real user experience rather than only checking whether the code compiles.

The reviewer has approximately 2 minutes.

The application must work quickly without installation or login.

## Test 1 — Basic English

Steps:

1. Open production URL.
2. Select English.
3. Click Start.
4. Allow microphone.
5. Answer the opening question.
6. Wait for follow-up.
7. Answer follow-up.
8. Confirm.
9. Check posted log.

Expected:

* Voice input works.
* Follow-up is relevant.
* Transcript is preserved.
* Log is posted only after confirmation.

## Test 2 — Tamil

Steps:

1. Select Tamil.
2. Start session.
3. Speak naturally in Tamil.
4. Answer follow-up.
5. Confirm.

Expected:

* Tamil recognition works.
* Tamil words are not translated automatically.
* Tamil transcript remains intact.

## Test 3 — Mixed Tamil + English

Example:

"I tried building a YOLO model but accuracy சரியாக வரவில்லை."

Expected:

The transcript preserves the mixed-language content.

No translation.

No rewriting.

## Test 4 — Pause During Speech

Speak:

"I tried building..."

Pause for several seconds.

Continue:

"...then I got an error."

Expected:

The application should avoid unnecessarily losing the second part.

If browser recognition ends, the application should recover while the session remains active.

## Test 5 — Recognition Error

Deny microphone permission.

Expected:

A clear error message.

No broken UI.

A retry option.

## Test 6 — LLM Failure

Temporarily make the follow-up API fail.

Expected:

* Original transcript remains.
* User is informed.
* No fake question is generated.
* Retry is possible.

## Test 7 — Follow-up Quality

Test at least 5 different responses.

For each response ask:

1. Is the follow-up related to something the student actually said?
2. Is it only one question?
3. Does it avoid repeating the initial question?
4. Is it understandable when spoken aloud?

Record the results.

## Test 8 — Exact Words

Say a sentence containing:

* grammar mistakes
* technical terminology
* Tamil words
* English words
* numbers

Verify that the system does not intentionally rewrite it.

## Test 9 — Confirmation

Test:

```text
yes
yes, post it
no
maybe
okay
silence
```

Expected:

Only clear confirmation results in posting.

## Test 10 — Timer

Start a session and verify:

```text
02:00 → 01:59 → ... → 00:00
```

At zero:

* recognition stops
* timer stops
* no restart occurs
* application transitions safely

## Test 11 — Refresh

Refresh before posting.

Expected behavior should be intentional and documented.

Do not claim unsaved transcript persistence unless it is implemented.

## Test 12 — Mobile

Test on a mobile browser if possible.

Verify:

* Start button is accessible.
* Timer is readable.
* Transcript does not overflow.
* Buttons are easy to tap.

## Final Human Test

Have at least 3 people use the production URL.

Record:

```text
TESTED
3 people used the application.

WORKED
...

BROKE
...

FIXED
...

NEXT
...
```

Do not fabricate testing results.

Only record results from actual tests.
