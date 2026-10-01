# Speak Your Log — Product Requirements

## Goal

Build a voice agent that allows a student to talk for up to 2 minutes in Tamil or English about something they tried to build.

The agent should:

1. Ask what the student tried.
2. Ask what broke.
3. Ask why.
4. Listen to the student's response.
5. Preserve the student's words exactly as spoken.
6. Ask exactly ONE relevant follow-up question based on what the student said.
7. Preserve the follow-up response exactly.
8. Read the resulting log back to the student.
9. Post the log ONLY after the student explicitly confirms.
10. Never rewrite, summarize, improve, or paraphrase the student's words.

## Core Principle

The student's words are the product.

The AI is allowed to:

* Ask questions.
* Generate one follow-up question.
* Speak the questions aloud.
* Read the captured log back.

The AI is NOT allowed to:

* Rewrite the student's transcript.
* Correct grammar.
* Summarize the student's answer.
* Invent missing information.
* Change technical terminology.
* Make the student sound more professional.
* Add facts that the student did not say.

## Languages

Support:

* English: `en-IN`
* Tamil: `ta-IN`

The user should be able to select the language before starting.

Do not automatically translate Tamil into English.

If the student speaks Tamil, preserve the Tamil transcript.

If the student speaks English, preserve the English transcript.

## Conversation

Opening question:

"What did you try, what broke, and why?"

The system may split this into multiple spoken prompts if necessary, but the experience should remain simple.

After the student's first answer:

* Generate exactly ONE follow-up question.
* The question must be based on something actually present in the student's answer.
* Do not repeat the opening question.
* Do not ask multiple questions at once.

Example:

Student:
"I tried using YOLO for detecting vehicles, but it gave wrong results at night."

Good follow-up:

"What did you try changing after you noticed the wrong detections?"

Bad follow-up:

"Can you explain your project?"

Bad follow-up:

"What did you try, what broke, and why?"

## Time Limit

The complete voice interaction must not exceed 2 minutes.

Maximum duration:

120 seconds.

The timer begins when the student starts the voice session.

At 120 seconds:

* Stop speech recognition.
* Stop accepting new speech.
* Finish the current UI state safely.
* Move to log verification if enough transcript exists.
* Never restart the session automatically after the deadline.

## Confirmation

Before posting:

Read the captured log back to the student.

Ask:

"Should I post this?"

Only post when the user clearly confirms.

Examples of confirmation:

* "yes"
* "yes, post it"
* "post it"
* "ஆமாம், post பண்ணு"

Do NOT post for ambiguous responses.

Examples:

* "maybe"
* "okay"
* "hmm"
* silence
* "looks fine"

When confirmation is unclear, ask again.

## Failure Behavior

If speech recognition fails:

* Tell the user what happened.
* Allow them to retry.
* Never fabricate transcript text.

If the LLM follow-up fails:

* Keep the student's existing transcript.
* Show a retry option.
* Do not invent a question.

If posting fails:

* Keep the final log visible.
* Show that posting failed.
* Allow retry.
* Do not lose the transcript.

## Success Criteria

A reviewer should be able to:

1. Open the public URL.
2. Click Start.
3. Speak in English or Tamil.
4. Hear the agent respond.
5. Receive one relevant follow-up.
6. Answer the follow-up.
7. See the exact captured words.
8. Confirm the log.
9. Successfully post it.

No login or installation should be required.
