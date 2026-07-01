---
name: voice
description: >
  Review copy against Ben's voice guidelines and flag anything corny, fluffy,
  AI-sounding, overstated, or low-signal — with plain rewrites. Use for case
  study copy (primary) and any portfolio copy (About, summaries, link text).
  Trigger with /voice, or phrases like "voice check", "is this corny",
  "does this sound like AI", "run this against the voice doc", "de-corny this",
  "copyedit this". Use PROACTIVELY before finalizing any case study copy.
allowed-tools:
  - Read
  - Grep
  - Edit
  - Bash
---

# /voice — Review copy against Ben's voice

You are doing an adversarial, cold read of copy against Ben's writing voice. The goal: catch anything corny, AI-sounding, fluffy, overstated, repetitive, or low-signal, and offer a plain rewrite — without flattening the meaning or the signal on Ben's design / critical-thinking / systems-thinking / builder skill.

## Step 1: Load the rubric (always — do not rely on memory)

Read these in full before judging anything:
- `core-docs/case-study-voice.md` — the concrete checklist (the "Cut these" list, rules of thumb, before/after table). This is the source of truth.
- The **Voice** and **Case study philosophy** sections of `core-docs/guidelines.md`.

The rubric evolves; the copy in this skill must never drift from those docs.

## Step 2: Identify the target copy

- **A case study** (slug or name, e.g. "flow", "health-tracker"): the copy that matters is the `narrative` array in `src/data/case-study-content.ts` — that is the only field that renders on the page. Also check its `summary` and `previewDescription` in `src/data/projects.ts` (these render on the homepage card/hover). You may note `subtitle`/`sections` too, but flag that they don't currently render.
- **A file path or pasted text:** use that directly.
- **Nothing specified:** ask which copy, or default to the most recently edited case study (`git log --oneline -5 -- src/data/case-study-content.ts`).

## Step 3: Read adversarially, sentence by sentence

For every sentence, apply the checklist. Say each line aloud in your head — if it sounds like a motivational poster, a press release, or something written to sound impressive, flag it. Watch specifically for:

- **AI-speak / poster lines** — tidy aphorisms that could sit under any project ("the one thing I won't trade for X is Y").
- **Clever-clever aphorisms** ("a dashboard that shows everything shows nothing").
- **Precious / poetic justification** ("earns its place", "reads the room without saying a word").
- **Performative over-explanation** — spec detail included to look rigorous, not because the *how* is the insight.
- **False aha moments** — routine craft or MVP scope inflated into a revelation.
- **Table-stakes bragging** — built with AI, uses an LLM, prototyped in code.
- **False differentiators** — a scoping choice framed as a design principle.
- **Repetition** — the same point (or limitation) hammered more than once.
- **Overselling** — usage/impact implied beyond the truth; unstated constraints.
- **Flowery over plain** — metaphor where a literal word is stronger; ten words where three work.

## Step 4: Report

Return findings tightly:
- For each flagged line: **quote it**, name the rule it breaks (one short phrase), and give a **plain rewrite**.
- Order by severity: corny/AI-speak and overselling first; minor flowery/wordy last.
- Call out what's clean — do **not** manufacture problems. If a line proves judgment plainly, leave it. If the whole piece is clean, say so.
- Preserve signal: never propose a rewrite that makes the copy more generic or drops a real proof of design/systems/builder judgment. Tightening ≠ hollowing out.

## Step 5: Apply (only if asked)

If the user asked to fix (e.g. `/voice --fix`, "and fix them"), apply the accepted rewrites to the source file(s) and confirm what changed. For strings in `case-study-content.ts` / `projects.ts` that contain em-dashes or curly quotes, prefer a small Python span-replace (ASCII anchors) over `Edit` if `Edit` fails to match — the file mixes thin-space and regular-space em-dashes. Run `node_modules/.bin/tsc -b` after edits. Otherwise, report only and let Ben choose.

## Note

Primarily for case-study narrative copy, but the anti-corny / plain-language / no-overselling rules apply to any portfolio copy (About, project summaries, contact lines). When new copy feedback comes from Ben, add the pattern to `core-docs/case-study-voice.md` so this skill keeps improving.
