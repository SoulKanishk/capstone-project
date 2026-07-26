# WORKFLOW.md — Vague vs. Precise Prompting: A Settings Form Drill

## Setup
Same feature (a settings form: full name, email, username, notification toggle) was built twice, in two isolated branches, each from a fresh chat session with no shared context.

- **Round 1 (`round1-vague`)**: single prompt — "Build me a settings form with validation." No follow-ups, no corrections, output accepted as-is.
- **Round 2 (`round2-precise`)**: a detailed prompt specifying exact fields, validation rules, accessibility requirements, edge cases, and an explicit instruction to write and run tests before calling the task done.

## Correctness
Round 1 produced a working form, but validation logic was embedded loosely across `app.js` (524 lines) with no isolated test coverage. Round 2's `validator.js` was refactored down to 177 lines with stricter, more precise rules — for example, the email regex in Round 1 accepted addresses with consecutive dots (`john..doe@mail.com`), which Round 2 explicitly rejected. That's the concrete AI mistake I caught: **Round 1's email validation passed malformed addresses that Round 2 correctly flagged.**

## Testing
This is the starkest difference. Round 1 shipped with zero test files. Round 2 added `tests/validator.test.js` (125 lines) and `tests/storage.test.js` (42 lines), explicitly covering whitespace-only names, invalid email formats, username character restrictions, and localStorage fallback behavior. Round 1's "it looks like it works" was never actually verified against edge cases; Round 2's was, because the prompt required it.

## Accessibility
Round 1 included some ARIA attributes, but Round 2 was measurably more deliberate: `aria-invalid` state toggles, `aria-describedby` error bindings, and a global `aria-live="polite"` region were all explicit requirements in the Round 2 prompt and confirmed present in the build summary. Round 1 never mentioned or verified any of this because I never asked for it — it wasn't wrong, it just wasn't held to any standard.

## Edge Cases
Round 2 explicitly handled: empty submission, whitespace-only name, malformed email, invalid username characters, and localStorage being unavailable (with an in-memory fallback store). Round 1 handled a looser, unspecified subset — I can't even say precisely which edge cases it covered, because I never asked it to enumerate or test them, which is itself the lesson.

## Review Effort
Counterintuitively, Round 2 *felt* slower up front — writing the detailed prompt and reviewing its longer plan took real attention. But total time-to-trustworthy-result was shorter: I didn't have to manually hunt for missing edge cases or accessibility gaps afterward, since they were already verified. Round 1 looked done faster, but that speed was an illusion — the manual QA pass Round 2 automated hadn't happened yet, so its real cost was just deferred, not avoided.

## Bug found while writing this
Round 2's diff showed `.cursorrules` deleted (1288 bytes → 0) — an unrequested side effect, caught only by reading the diff stat closely rather than trusting the build summary. Lesson: check the full diff, not just the tool's self-reported summary.

## Takeaway
The lazy prompt produced something that *looked* finished. The precise prompt produced something that was *verified* finished. The gap between those two is invisible until you diff them side by side — which is exactly why this drill is useful.
