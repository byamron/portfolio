# Outstanding

Things known to be wrong or unfinished, with enough context to act on them without the conversation that found them. Written 10 Aug 2026.

Delete an entry when it is done. This file is a to-do list, not a history — `core-docs/history.md` is where finished work goes.

---

## 1 · `core-docs/playground-sync.md` is on `main` and should not be

**What happened.** It was swept into #204 by a `git add -A` while the working tree was dirty. It is a draft belonging to the still-open #183 (`arcade-demos-setup`) and says so in its own header — "Draft — awaiting portfolio-side review".

**Why it matters.** `main` now carries a document describing a submodule consumption setup that `main` does not have. Anyone reading it will look for an `/arcade` surface that is not there.

**Fix.** Revert the file from `main`. It comes back with #183 when that lands.

```bash
git rm core-docs/playground-sync.md
```

Confirm it is still present on the #183 branch before removing it, so the draft is not lost.

---

## 2 · `next-update` has drifted a long way from `main`

**State.** 13 commits behind `main`, 15 ahead. The 15 ahead are merge commits and work that has since reached `main` by other routes. The 13 behind are real: mostly the Consensus prototype work merged in #204–#206, which is why `next-update` still carries an older `public/consensus/` build and a stale `src/data/contributions.json`.

**Intent.** `next-update` is the testing branch and is not to be deleted. It should be reset to `main` so it stops being a source of confusion.

**Why it has not happened.** Two open PRs would be disrupted:

- **#201** (`fix-fontguesser-blank-clip`) — 13 commits ahead of `main`, currently `MERGEABLE/CLEAN`. Needs rebasing onto `main` first, or merging before the reset.
- **#183** (`arcade-demos-setup`) — `CONFLICTING/DIRTY`, and has been since May. Needs a human decision about whether it is still wanted before anything else moves. See also item 1.

**Order.** Land or rebase #201 → resolve or close #183 → reset `next-update` to `main`.

---

## 3 · `tsconfig.*.tsbuildinfo` is committed and not ignored

`apps/consensus-prototype/tsconfig.app.tsbuildinfo` and `tsconfig.node.tsbuildinfo` are tracked **on `main`** — they are absent from `next-update`, so this arrives with the prototype work when `next-update` is reset. They are incremental-build caches: machine-specific, regenerated on every build, and a source of noise in every diff that touches the prototype.

Pre-existing — not introduced by any recent PR, which is why it has been left alone rather than folded into an unrelated change.

**Fix.** Add `*.tsbuildinfo` to `.gitignore` and `git rm --cached` the two files.

---

## 4 · Consensus prototype — `CollectionPicker`'s Create button

`apps/consensus-prototype/src/components/CollectionPicker.tsx`

It carries the `btn-sm btn-accent` bug that #206 fixed everywhere else: `.btn-accent` is a whole button size rather than a colour modifier and is defined after `.btn-sm`, so the composition silently renders at 36px — beside an `h-8` (32px) name input.

Left out of #206 deliberately: fixing it means *shrinking* a button rather than growing one, which is a visible change to a row nobody had complained about. One line when it is wanted.

---

## 5 · Consensus prototype — untested on real touch hardware

The mobile layout was verified in a 375px viewport with synthetic pointer events, not on a device. One thing in particular has never run on real touch input: the artifact document's `contentEditable` blocks (`apps/consensus-prototype/src/components/artifact/ArtifactDoc.tsx`), including the selection-driven "Find support" affordance, which depends on `selectionchange` behaving the way it does with a mouse.

Worth ten minutes on an actual phone before the prototype is shown to anyone on one.

---

## Not outstanding — recorded so nobody re-opens them

- **#206** (button sizes + panel drag) — merged 10 Aug, deployed to benyamron.com/consensus.
- **#205** (citations open beside the answer, mobile support) — merged.
- **Panel drag tracking, panel width recovery** — fixed in #206. If the drag ever feels laggy again, the cause is the `transition-[width]` easing being left on during a drag; it is gated on `resizing` in `panel/ProjectPanel.tsx`.
- **The source of truth for the Consensus prototype** is `byamron/consensus`, not this repo. `apps/consensus-prototype/` is a mirror that exists to be built and served; changes should be made there and rsynced across. See `byamron/consensus#11`.
