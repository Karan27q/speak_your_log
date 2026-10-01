# AI Coding Agent Rules

## 1. Build Working Software First

Prioritize:

```text
Functionality
>
Reliability
>
Clarity
>
UI polish
```

Do not spend significant time on styling while the voice flow is broken.

## 2. Work Incrementally

Before implementing a major feature:

1. Inspect the existing code.
2. Understand the current architecture.
3. Make the smallest appropriate change.
4. Run the application.
5. Test the change.
6. Fix errors.
7. Continue.

Do not unnecessarily rewrite working code.

## 3. Do Not Invent APIs

Never invent:

* Proof endpoints
* authentication methods
* request schemas
* response schemas
* undocumented SDK methods

If API documentation is missing, create a clearly isolated adapter and mark the integration as pending.

## 4. Protect Secrets

Never put secrets in:

```text
React components
client JavaScript
Git
README files
screenshots
browser localStorage
```

Use environment variables and server-side APIs.

## 5. Preserve User Words

This is the most important product rule.

Never:

```text
summarize
paraphrase
correct
translate
polish
rewrite
```

the student's transcript.

If an AI model sees the transcript, it must be explicitly instructed that the transcript is immutable source data.

## 6. No Fake Data

Do not create fake:

* transcripts
* test results
* user feedback
* successful API responses
* Proof posts
* deployment URLs

Mock data is acceptable during development only when clearly marked and removed or disabled in production.

## 7. Do Not Overengineer

Do not introduce:

* LangChain
* LangGraph
* vector databases
* Redis
* Kafka
* microservices
* authentication
* complex agent frameworks

unless a real requirement appears.

The challenge is a small voice interaction.

## 8. Keep Dependencies Minimal

Before installing a package, ask:

* Is it necessary?
* Can the browser API already solve this?
* Does it increase deployment complexity?
* Does it introduce another failure point?

Prefer native browser APIs when they are sufficient.

## 9. Accessibility

Use:

* readable text
* clear button labels
* visible recording state
* keyboard-accessible controls
* clear error messages

Do not communicate important state using color alone.

## 10. Production Safety

Before deployment verify:

```text
npm run build
```

and test the actual production URL.

Do not assume localhost behavior equals production behavior.

## 11. Git Discipline

Make meaningful commits.

Examples:

```text
feat: add speech recognition
feat: add two minute session timer
feat: add follow-up generation
feat: add log verification
fix: prevent duplicate transcript segments
fix: recover speech recognition after onend
```

Avoid commits such as:

```text
stuff
changes
final
final2
working
```

## 12. README

The README must explain:

* What the project does.
* How to run it.
* Environment variables.
* Architecture.
* Supported languages.
* How the follow-up works.
* How transcript preservation works.
* How to deploy.
* Known browser limitations.
* Actual testing results.

Do not claim features that were not tested.

## 13. Challenge Strategy

The reviewer has approximately two minutes.

Optimize the first experience for:

```text
Open
→ Start
→ Speak
→ Follow-up
→ Verify
→ Confirm
```

The reviewer should not need:

* an account
* installation
* configuration
* documentation before trying the product

## 14. Completion Definition

Do not say "complete" merely because the code compiles.

The application is complete only when:

* Production URL works.
* Microphone works.
* English works.
* Tamil works.
* Follow-up works.
* Exact transcript is preserved.
* Confirmation works.
* Posting works against the real API.
* Errors are handled.
* Production build succeeds.
