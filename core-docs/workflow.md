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

**Refactoring safety checklist** (run when your changes restructure or rewrite any component):
- **Recent fixes preserved:** Run `git log --oneline -10 -- <file>` for every file you substantially changed. If any recent commit was a fix, diff your version against it to confirm the fix survived your refactor.
- **No duplicated style values:** If your refactor created multiple rendering paths (e.g., narrow/wide layout), verify that shared values (font sizes, spacing, colors) are extracted into constants — not copy-pasted with potentially stale values.
- **Both branches updated:** If you're hotfixing `main` directly, the same fix must also land on `next-update` (or vice versa), or the next merge will revert it.

**Performance & production readiness checklist** (run before considering work complete):
- **Asset preload paths:** If any asset's delivery method changed (e.g., static image → video, GIF → MP4), verify old references are removed from `projectImageMap` and any other preload maps. Run `projectData.test.ts` to catch dead entries.
- **Preload timing:** New images/assets should preload at mount, not on interaction. Verify `preloadPreviewImages` covers all static assets that need to be ready on hover.
- **External links:** Every link to an external URL or downloadable file must have `target="_blank"` and `rel="noopener noreferrer"`. Grep for `href="http` and `href="/.*\.pdf"` to verify.
- **File sizes:** No static image in the preload pipeline should exceed 1MB. If it does, convert to video/WebP or lazy-load it. The `preloadImages.test.ts` suite enforces this.
- **Cache headers:** If new asset types are added to `public/`, verify `netlify.toml` has appropriate `Cache-Control` headers for them.
- **CSS transitions:** Avoid transitioning GPU-heavy properties (`backdrop-filter`, `filter`, `clip-path`) unless the animation is visually necessary. Prefer instant application for binary on/off effects.

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

### 9. Pre-Merge Cleanup

Before merging any branch into `main` or `next-update`, check for and remove dev control panels:
- Font/typography comparison panels
- Glass mode/configurator switchers
- Layout tuning panels
- Any other floating dev tools with sliders, toggles, or debug UI

Remove the component files, their imports, their render calls, and any hook/CSS plumbing that exists solely to support them. Dev panels are welcome on feature branches for experimentation but must never ship to `main` or `next-update`.

### 10. Commit and Push

- Commit changes with a clear, descriptive message
- Push to the relevant remote branch on GitHub
- Reference any related issues in the commit message if applicable

### 11. Branching and Deploy Strategy

Netlify auto-deploys every push to `main`. The free tier allows **20 deploys/month** (resets on the 14th). To avoid burning deploys on every PR:

- **Feature branches → `next-update`**: All new work is merged into `next-update` via PR. This does NOT trigger a deploy.
- **`next-update` → `main`**: Only merge when intentionally ready to deploy. Each merge costs 1 deploy.
- **Batching**: Accumulate multiple features on `next-update` and deploy them together in a single merge to conserve credits.

**Deploy tracking** is maintained in `core-docs/deploys.md`. Every merge to `main` must be logged there.

### 12. Deploy Awareness (Claude Responsibility)

At the start of every conversation, Claude must:
1. Check `core-docs/deploys.md` for the current deploy count.
2. Report: **"Deploys this cycle: X / 20 (Y remaining, resets [date])"**.
3. If the user is about to merge to `main`, remind them of the deploy cost and remaining credits.
4. After any merge to `main`, update `core-docs/deploys.md` with the new entry.
5. When a new billing cycle starts (current date ≥ 14th and no current-cycle table exists), archive the previous cycle and start a fresh table.
6. **Pending deploy nudge**: If `next-update` is ahead of `main` by 3+ merged PRs, or if 7+ days have passed since the last deploy to `main`, mention it once — e.g., "Reminder: 4 features on next-update haven't been deployed yet. Last deploy was 9 days ago." Don't repeat this every message — once per conversation is enough.
