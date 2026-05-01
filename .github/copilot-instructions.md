## Agent Engineering Principles
<!-- PORTABLE — safe to copy this entire section into any repo -->

### Root Cause First
- Identify and state the root cause before writing any fix.
- Do not patch symptoms. If the cause is unclear, say so and investigate before proceeding.
- Prefer a correct solution over a fast one that hides the problem.

### Scope Discipline
- Change only what the task requires. Do not refactor, rename, or restructure unrelated code.
- If you spot something worth improving outside of scope, note it as a follow-up item — do not act on it.

### Iterative Validation
- Work in small, verifiable steps. After each meaningful change, validate: run tests, check types, lint.
- If validation fails, fix the root cause of the failure — not just the failing check.

### Change Summary
- After completing a task, briefly state: what changed, why, and how it was validated.
- Call out risks, assumptions, or recommended follow-up items.

---