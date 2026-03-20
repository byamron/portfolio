# /push — Update docs, commit, PR, and merge to next-update

You are running the `/push` workflow for the portfolio site. Follow every step in order. Do not skip steps.

## Step 1: Pre-flight checks

- Run `git status` to see what's changed.
- Run `git branch --show-current` to confirm you're on a feature branch (not `main` or `next-update`). If you're on `main` or `next-update`, **stop and tell the user** they need to be on a feature branch.
- Run `git log next-update..HEAD --oneline` to see what commits are being contributed.

## Step 2: Update core docs

Read the following files, then update them based on the work done on this branch:

### `core-docs/history.md`
- Add a new entry at the top (reverse chronological order) with:
  - **Date**: today's date
  - **Summary**: what was built or changed
  - **Decisions**: key decisions and reasoning
  - **Branch**: current branch name
- Keep the entry concise — 3-6 lines max.

### `core-docs/plan.md`
- If any planned phases or tasks were completed by this work, mark them done.
- If scope changed, reflect it.
- Only update if relevant — skip if the work doesn't affect the plan.

### `core-docs/deploys.md`
- Do NOT update this file. Deploys only happen on merge to `main`, not `next-update`.

### `core-docs/feedback.md`
- Only update if there were mistakes or rejected approaches during this work that should be recorded for future reference.
- Skip if everything went smoothly.

## Step 3: Commit

- Stage all changes (updated docs + any uncommitted work): `git add -A`
- Review what's staged with `git diff --cached --stat` to confirm nothing unexpected is included.
- Write a clear commit message summarizing the work. End with the co-author line.
- Commit.

## Step 4: Push and open PR

- Push the branch to origin: `git push -u origin HEAD`
- Create a PR targeting `next-update` using `gh pr create`:
  - Title: concise summary of the work (under 70 chars)
  - Body format:
    ```
    ## Summary
    - <bullet points of what changed>

    ## Core docs updated
    - history.md: ✅
    - plan.md: ✅ or ⏭️ (skipped — not relevant)
    - feedback.md: ✅ or ⏭️ (skipped — no issues)

    🤖 Generated with [Claude Code](https://claude.com/claude-code)
    ```
  - Base branch: `next-update`

## Step 5: Merge the PR

- Merge the PR into `next-update`: `gh pr merge --squash --delete-branch`
- Confirm the merge succeeded.

## Step 6: Report

Tell the user:
- ✅ What was committed
- ✅ PR URL
- ✅ Merged into `next-update`
- Current deploy status from `core-docs/deploys.md` (as a reminder)
