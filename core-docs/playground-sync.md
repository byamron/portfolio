# Cross-repo sync: ui-playground ↔ portfolio

> **Status:** Draft — awaiting portfolio-side review. Once approved,
> this doc lives in both repos and supersedes the file-copy workflow
> described in `docs/promote-demo-to-arcade.md`.
>
> Mirror location:
> - ui-playground → `docs/cross-repo-sync.md` (this file)
> - portfolio → `core-docs/playground-sync.md`
>
> When the doc changes, update both copies in the same PR pair.

---

## 1. What the two repos are

| Repo | Role | URL | Audience |
| --- | --- | --- | --- |
| **ui-playground** | Workshop. Every demo lives here — Ready, In progress, Internal, Deferred, Archived. The wrapping shell switches between Museum / Arcade / Cursor Curious galleries. | `github.com/byamron/ui-playground` | Ben (development), captured into recordings |
| **portfolio** | Production site at `benyamron.com`. Consumes a curated subset of playground demos. No In progress demos, no internal tools. | `github.com/byamron/portfolio` (private) | Public visitors |

Treat them as one product with two surfaces, not two products. The
playground is the workshop bench; the portfolio is the showcase wall.

---

## 2. How the connection works today

The portfolio consumes the playground via a **git submodule**.

```
portfolio/
├── ui-playground/                 ← git submodule
│   └── src/demos/<slug>/<File>.tsx
├── src/
│   ├── App.tsx                    ← mounts /playground/* and vanity routes
│   └── components/
│       ├── PlaygroundRoutes.tsx   ← hand-registered safeLazy() imports
│       ├── PlaygroundGallery.tsx  ← hand-maintained demo list
│       ├── PlaygroundWrapper.tsx  ← scoped style reset per demo page
│       └── PlaygroundDemo.tsx     ← wrapper used by vanity routes
└── vite.config.ts                 ← alias '@playground' → ui-playground/src
```

### Submodule config

- Path: `portfolio/ui-playground/`
- URL: `https://github.com/byamron/ui-playground.git`
- Current pin: a specific commit SHA (advances on each portfolio PR
  that bumps the submodule)

### Vite alias

```ts
// portfolio/vite.config.ts
alias: { '@playground': path.resolve(__dirname, './ui-playground/src') }
```

### Routes

`portfolio/src/App.tsx` mounts:

- `/playground/*` → `<PlaygroundRoutes/>` (gallery + per-demo routes)
- `/slide-to-unlock`, `/dvd`, `/high-five` → vanity routes via
  `<PlaygroundDemo slug="…" />`

`isStandalone` is true for any `/playground*` path or vanity demo route,
which suppresses portfolio chrome (custom cursor, sidebar controls,
right column).

### safeLazy + hasDemo

```tsx
// portfolio/src/components/PlaygroundRoutes.tsx
const demoModules = import.meta.glob('@playground/demos/*/index.{ts,tsx}')
const hasDemo = (name: string) =>
  Object.keys(demoModules).some(k => k.includes(`/${name}/`))
function safeLazy(path, name, exportName) {
  if (!hasDemo(name)) return null     // ← graceful no-op if file missing
  return lazy(() => import(/* @vite-ignore */ path).then(...))
}
```

This pattern means: even if the portfolio's hardcoded route list
references a demo that no longer exists in the submodule, the page
returns null instead of crashing. The cost: a stale route looks
"present" in the codebase but does nothing.

> ⚠️ **Open question — verify before relying on this.** `hasDemo()`
> looks for `@playground/demos/<slug>/index.{ts,tsx}`, but the
> playground does not currently ship `index.ts(x)` files in demo
> folders (each folder contains `<Component>.tsx` directly). This
> implies that *no* existing demo currently passes the `hasDemo()`
> check in the latest playground, and `safeLazy()` always returns
> null. Yet the production site renders demos. That contradiction
> means either (a) the submodule pin is so old it predates the
> rename, (b) some demos do have `index.tsx` at the pinned SHA, or
> (c) the glob/check is misbehaving and routes are being rendered
> anyway. **The portfolio agent must verify and document the real
> behaviour before we lock in a sync workflow.**

### Two route families, two purposes

- **`/playground/*`** — engineering surface for browsing demos.
  Audience is Ben and anyone he shares a link with. Demos appear in
  the gallery and at `/playground/<slug>`.
- **`/slide-to-unlock`, `/dvd`, `/high-five`** — *vanity routes* for
  individual demos that have been intentionally promoted to live at
  pretty URLs (typically for sharing in posts). These bypass the
  gallery entirely.

The vanity-route promotion is independent from playground status.
Adding `/page-transition` as a vanity route is a separate, explicit
decision per demo.

---

## 3. Source of truth: ui-playground `DEMOS.md`

`DEMOS.md` is the canonical inventory. Every demo has exactly one
status:

| Status | Meaning | Shows in portfolio? |
| --- | --- | --- |
| **Released** | Already posted publicly | ✅ Yes |
| **Ready** | Meets the quality bar; cleared for recording | ✅ Yes |
| **In progress** | Exists in code, not yet ready | ❌ No |
| **Deferred** | Paused, will revisit | ❌ No |
| **Internal** | Personal tool, never ships | ❌ No |
| **Archived** | Cut; code may remain under `src/demos/archived` | ❌ No |

**Rule:** Released + Ready → eligible for portfolio. Everything else
stays playground-only.

Status changes happen in the playground (DEMOS.md edit, PR, merge).
The portfolio reacts to those changes on its next sync.

---

## 4. Update workflow

There are three categories of change to keep in sync. Treat them
independently.

### 4a. Behavior change in an existing demo (most common)

Example: PR #34 polishing `page-transition`.

1. **Playground:** make the change on a feature branch, open PR,
   merge to `main`.
2. **Portfolio:** bump the submodule pointer.
   ```sh
   cd ui-playground
   git fetch origin
   git checkout main && git pull
   cd ..
   git add ui-playground
   git commit -m "Bump ui-playground submodule"
   ```
3. **Portfolio:** verify locally — `npm run dev`, open the demo at
   `/playground/<slug>`, confirm the new behavior renders and nothing
   else regressed.
4. **Portfolio:** PR into `next-update` (per portfolio's branching
   rule). Body links the playground PR + submodule diff
   (`git submodule summary`).

No route or gallery changes needed — the demo's URL didn't change.

### 4b. New demo flipped to Ready (promotion)

Example: a demo moves from In progress → Ready in `DEMOS.md`.

1. **Playground:** flip the status in `DEMOS.md`, merge.
2. **Portfolio:** bump the submodule pointer (as in 4a).
3. **Portfolio:** register the demo.
   - Add a `safeLazy` import + `<DemoRoute>` entry in
     `src/components/PlaygroundRoutes.tsx`.
   - Add an entry to the `demos` array in
     `src/components/PlaygroundGallery.tsx`.
4. **Portfolio:** verify, PR into `next-update`.

> The decision in §6 will determine whether step 3 stays manual or
> becomes scripted from `DEMOS.md`.

### 4c. Demo demoted (Ready → In progress, Archived, etc.)

Rare, but: a demo that previously qualified for production no longer
does.

1. **Playground:** update `DEMOS.md`, merge.
2. **Portfolio:** bump the submodule pointer.
3. **Portfolio:** remove the demo from `PlaygroundGallery.tsx` and
   `PlaygroundRoutes.tsx`. If the demo had a vanity route, decide
   whether to keep or 301 it.
4. **Portfolio:** verify, PR into `next-update`.

### 4d. Vanity route promotion (independent)

A demo is granted a top-level URL like `/page-transition` for
sharing. This is **per-demo, intentional, decoupled from status
changes**. Add the route in `App.tsx`. Demote it the same way.

---

## 5. Drift handling

The portfolio is currently drifted from playground reality:

- **Gallery lists demos that no longer exist** in current playground:
  `water-ripple`, `magnetic-button`, `text-scramble`, `elastic-toggle`,
  `figpal-cursor`, `task-ranking`. These are gracefully hidden by
  `hasDemo()` (if it works as designed — see §2 open question), but
  the source code lies about what's available.
- **Gallery is missing demos that are now Ready** in playground:
  `page-transition`, `color-hold-pick`, `github-sparkline`,
  `git-toggle`. Production users can't see them.

**Reconciliation pass (one-time):**

1. Bump submodule to current playground `main`.
2. Diff playground `DEMOS.md` (Released + Ready) against portfolio's
   gallery + route lists.
3. Add missing Ready demos. Remove stale demos.
4. Verify all routes load.
5. PR into `next-update`.

After this pass, drift becomes a small per-change task instead of a
large cleanup.

---

## 6. Decisions needed (portfolio-agent review)

These shape the workflow above. Each is a fork in the road.

### D1. Manual vs scripted sync

**Today:** the portfolio's gallery and route lists are hand-written
duplicates of what's in playground.

**Option A — keep manual.** Portfolio agent edits two files per demo
addition. Pro: simple, no new tooling. Con: drift is easy.

**Option B — derive from `DEMOS.md`.** A script in the portfolio
parses `ui-playground/DEMOS.md`, filters to Released + Ready, and
either (a) generates the demo list at build time or (b) regenerates
the source files via codemod. Pro: one source of truth. Con: parsing
a hand-edited markdown table is brittle.

**Option C — derive from a structured manifest.** Replace `DEMOS.md`'s
table with (or supplement it by) a `demos.json` in the playground.
The portfolio reads `@playground/demos.json` directly. Pro: robust,
typed. Con: changes the playground's authoring surface (Ben edits
JSON now, not markdown).

**Recommendation:** B if `DEMOS.md` parsing proves stable; C if it
doesn't. Both can wait until after the immediate drift is reconciled.

### D2. The `hasDemo()` / `index.{ts,tsx}` mystery

See the open question in §2. **Before any new demo is registered**,
verify how `hasDemo()` actually behaves in the current portfolio
build against the current submodule pin. Document the result here.
If the check is silently failing, decide whether to:

- (a) Add `index.tsx` shims to every playground demo folder, or
- (b) Drop the index check and import demo files directly, or
- (c) Replace the glob with one that matches the real layout.

### D3. Gallery descriptions

`PlaygroundGallery.tsx` includes a short description per demo (e.g.
"Click anywhere — ripples propagate like water"). These don't exist
in `DEMOS.md`. If we move to a derived list (D1 B/C), descriptions
need a home — either added to `DEMOS.md` / `demos.json` or kept
portfolio-side.

### D4. Vanity routes and status

Today `/slide-to-unlock`, `/dvd`, `/high-five` map to Released demos.
If a vanity-route demo gets archived in playground, what happens to
the public URL? Proposal: vanity routes are sticky — they don't auto-
demote with status. Archiving a demo with a vanity route requires an
explicit portfolio decision about the URL (delete? 301? leave?).

### D5. Branching alignment

Portfolio merges feature branches into `next-update`, not `main`.
Playground merges directly to `main`. This is a deliberate asymmetry
(portfolio is staged before deploy; playground is the workshop). The
sync workflow above assumes the asymmetry stays; confirm.

### D6. Where the obsolete playbook lives

`ui-playground/docs/promote-demo-to-arcade.md` describes a file-copy
workflow and an `/arcade/*` URL structure that doesn't match
production reality. Either delete it, mark it as superseded with a
pointer to this doc, or rewrite it as a vanity-route promotion guide.

---

## 7. Verification checklist for any sync PR

Before merging a portfolio PR that bumps the submodule:

- [ ] Submodule advances to a specific commit on playground `main`,
      not a feature branch.
- [ ] `npm run build` clean in portfolio.
- [ ] `npm run dev`, smoke-test:
  - [ ] `/playground` gallery renders without empty cards.
  - [ ] Every demo in the gallery loads when clicked.
  - [ ] Each vanity route still works.
  - [ ] Portfolio chrome (cursor, sidebar) doesn't leak into demo
        pages (`isStandalone` working).
- [ ] Mobile viewport (375px) check on at least one playground page.
- [ ] If demos were added/removed: `DEMOS.md` status matches
      portfolio gallery list.
- [ ] PR body links the playground PR(s) included in the submodule
      bump and shows `git submodule summary`.
