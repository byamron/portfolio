---
name: push
description: >
  Review, commit, and open a PR. Use when you want to ship completed work —
  reviews the implementation, updates core docs, stages changes, writes a
  commit message, and opens a GitHub PR. Triggered by /push or phrases like
  "push this", "ship it", "create a PR", or "open a PR".
---

You are running the push workflow. Follow every step in order. Do not skip steps.

## Step 1: Review implementation

- Read all modified files and check for errors, type issues, or inconsistencies.
- Fix any issues found. Do not introduce new scope.

## Step 1b: Lint and test

- Run `npx eslint --no-warn-ignored --quiet --max-warnings 0 src/` to check for lint errors. Fix any issues found.
- Run `npx vitest run` to execute the test suite. Fix any failures.
- If either check fails and the fix is non-trivial, report to the user before proceeding.

## Step 2: Pre-flight checks

- Run `git status` to see what has changed.
- Run `git branch --show-current` to confirm you are on a feature branch, not `main`.
- If on `main`, create a new branch with a descriptive kebab-case name based on the changes.

## Step 3: Update core docs

- Review the changed files and update `core-docs/history.md` with what was done (reverse chronological, newest entry first).
- If any design decisions were made or visual rules changed, update `core-docs/design-language.md`.
- If the plan scope changed or a phase completed, update `core-docs/plan.md`.
- Stage the updated doc files alongside the feature changes.

## Step 4: Stage and commit

- Stage all relevant changed files. Never stage `.env`, secrets, or credentials.
- Write a concise commit message in imperative voice summarizing the changes (e.g. "Add glass highlight hover effect to project links").
- Create the commit.

## Step 5: Handle merge conflicts

- Run `git fetch origin next-update` and check if the branch can merge cleanly into `next-update`.
- If there are conflicts:
  - For straightforward conflicts (whitespace, non-overlapping edits), resolve them and commit the merge.
  - For complex conflicts (overlapping logic, ambiguous intent), stop and explain the conflicts to the user. Do not guess.

## Step 6: Push and open PR

- Push the branch to origin with the `-u` flag.
- Create a PR using `gh pr create` with a clear title and a one-paragraph body summarizing what changed and why.
- Target `next-update` as the base branch (feature branches merge into `next-update`, not `main`).
- Return the PR URL to the user.
