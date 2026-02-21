# Development Workflow

This document defines the process for all development work on this project.

## Process

### 1. Understand the What and Why

Before writing any code, make sure you clearly understand:
- What is being built or changed
- Why it matters — the user-facing goal or problem being solved
- What success looks like

If the request is ambiguous, ask clarifying questions before proceeding.

### 2. Plan

Create a detailed plan to achieve the goals, aligned with best practices for:
- **Design**: Visual hierarchy, spacing, typography, color, interaction patterns
- **UX**: Accessibility, responsiveness, performance, user flow
- **Software engineering**: Component architecture, state management, separation of concerns
- **Technical architecture**: Build tooling, dependency management, deployment

Search for current best practices if needed. Don't assume — verify.

### 3. Consult Previous Feedback

Before planning or implementing, review:
- `core-docs/feedback.md` — past mistakes, rejected approaches, and lessons learned
- `core-docs/history.md` — previous decisions and their rationale

Avoid repeating documented mistakes.

### 4. Review the Plan

Before executing, review the plan for:
- Completeness — does it cover all requirements?
- Feasibility — is the approach realistic given constraints?
- Quality — does it align with the design philosophy in `CLAUDE.md`?
- Risks — what could go wrong? How will you handle it?

Improve the plan if needed before proceeding.

### 5. Execute

Implement the plan. Write clean, well-structured code. Follow the architecture principles in `CLAUDE.md`.

### 6. Review Your Work

After implementation, self-review:
- Does it match the plan?
- Is the code clean and idiomatic?
- Are there visual or functional regressions?
- Does it meet accessibility standards?
- Is the implementation complete, not partial?

### 7. Solicit Feedback

Present the work for feedback. Show what was built, why, and how.

### 8. Handle Feedback

**If feedback is negative:**
1. Record what went wrong in `core-docs/feedback.md` — include the date, what was attempted, why it failed, and the lesson learned.
2. Restart the workflow from Step 1, incorporating the feedback.
3. Review `core-docs/feedback.md` as part of Step 3 in the next iteration.

**If feedback is positive:**
1. Document what was done in `core-docs/history.md` in reverse chronological order, including:
   - Date
   - Summary of work completed
   - Major decisions and reasoning
   - Technical details (branch name, issue number if applicable)
2. Proceed to commit.

### 9. Commit and Push

- Commit changes with a clear, descriptive message
- Push to the relevant remote branch on GitHub
- Reference any related issues in the commit message if applicable
