# CLAUDE.md — Portfolio Site

## About Ben

Ben is a senior product designer working across health tech, AI, and tools for critical thinking. The portfolio's positioning, voice, visual philosophy, and decision-making lens are defined in `core-docs/guidelines.md` — read that first for any content, copy, or design decision.

## Core Documentation

> **New workspace or agent? Start with `core-docs/plan.md` § "▶ START HERE".** It covers the live site's state, a file map, how to verify and deploy, and the triaged backlog. Items marked [Ben] need his decision first.

All project documentation lives in `core-docs/`. **You must review and proactively update these files as part of your workflow.**

| File | Purpose | When to update |
|------|---------|----------------|
| `core-docs/guidelines.md` | Positioning, voice, visual philosophy, case study approach, AI decision filters | When content strategy, voice, or editorial standards change |
| `core-docs/case-study-voice.md` | Concrete case-study copy rules (anti-corny, high-signal) distilled from Ben's edits, with before/after examples | Before writing/revising case study copy; after Ben gives new copy/voice feedback |
| `core-docs/design-language.md` | Visual & interaction rules, principles, anti-patterns | When design decisions are made, patterns are established, or visual rules change |
| `core-docs/plan.md` | Migration plan, visual spec, phase breakdown | When scope changes, phases complete, or new info emerges |
| `core-docs/workflow.md` | Development process (plan → build → review → feedback loop) | When the process itself needs refinement |
| `core-docs/feedback.md` | Negative feedback and lessons learned | After any rejected implementation or mistake |
| `core-docs/history.md` | Completed work and decision log (reverse chronological) | After every successful implementation |
| `core-docs/initial-implementation.md` | React component architecture: Framer→React mapping, contexts, decisions | When architectural approach changes |
| `tokens.md` | Design tokens: all theme colors (text, background, swatch) with HSL values | When color values change or new tokens are added |

### Rules for core docs:

- **Before starting any work**: Read `core-docs/feedback.md` and `core-docs/history.md` to avoid repeating mistakes and understand prior decisions.
- **Before any content, copy, or design decision**: Read `core-docs/guidelines.md`. This is the strategic lens — positioning, voice, editorial standards, and the filters every AI-generated output must pass through.
- **Before any design/implementation work**: Read `core-docs/design-language.md` to ensure consistency with the site's visual and interaction rules. Use the coherence checklist before considering work complete.
- **Before planning**: Read `core-docs/plan.md` to understand the current state and what's next.
- **Follow the workflow**: Read and follow `core-docs/workflow.md` for the full development process.
- **After completing work**: Update `core-docs/history.md` with what was done, decisions made, and technical details (branch, date).
- **After negative feedback**: Record the lesson in `core-docs/feedback.md` before re-attempting.
- **When the plan evolves**: Update `core-docs/plan.md` — mark completed phases, add new information, adjust scope. The plan is a living document, not a snapshot.
- **Branching**: Feature branches merge into `next-update`, not `main`. Only merge `next-update → main` when intentionally deploying. See `core-docs/workflow.md` § Branching Strategy. *Status 2026-10-31: `next-update` is 213 commits behind `main`, and the launch merged straight to `main` with Ben's approval (#210). Whether to retire or reset `next-update` is an open question for Ben, so ask him for the PR base until it's settled.*
- **Proactive updates**: If you notice a doc is stale, inaccurate, or missing useful context, update it. Don't wait to be asked.

## Technical Context

For detailed technical context (Tailwind, theme system, typography, architecture, accessibility, visual reference), see `.claude/rules/technical-context.md` — auto-loaded when editing `src/` files.

### The site is one page (since 2026-10-29)

`benyamron.com/` is the simple home: `src/proto/SimpleSite.tsx` (shell, settings rail, record) → `SimpleHome.tsx` + `ContactFx.tsx`. `src/App.tsx` routes only `/` and the Havana/Trio privacy pages; every other path redirects to `/`. The tuned values are constants in `src/proto/protoSettings.ts` (`PROTO_DEFAULTS`).

- **Previous portfolio** (two-column home, case studies, playground, demos): tag **`portfolio-v1`**. Pull pieces back with `git show portfolio-v1:<path>` or `git checkout portfolio-v1 -- <path>`. Its source files are still in `src/` but unrouted (not in the bundle) until a cleanup pass.
- **DialKit tuning panel** (`ProtoTuner`, settings context, `dialkit`/`agentation` dev deps): tag **`simple-home-dev`**. For more tuning, branch from `main`, restore `src/proto/ProtoTuner.tsx` from that tag, re-add the context + dev deps, and strip them again before merging (dev-panel policy).
- Tags are git-only; nothing about them appears on the site.

### Font-guesser game (`apps/fontguesser/`)

The font-guessing game is a **self-contained sub-app** with its own `package.json`, toolchain (Vite + `oxlint`), and `node_modules`/`dist` (both gitignored). It is deliberately **decoupled** from the portfolio: it is not imported into the SPA, and it is excluded from the portfolio's `eslint`/`tsc`/`vitest` — so a game issue can never break the portfolio build or deploy.

- **Source of truth**: `apps/fontguesser/` (edit here to fix game bugs).
- **Deploy mechanism**: the built game is committed to `public/font-guesser/` and served verbatim by GitHub Pages at `benyamron.com/font-guesser/` (Pages serves the real file before the SPA fallback). The portfolio build copies `public/` verbatim and never processes it.
- **Rebuild + re-vendor** after any change: `npm run build:fontguesser` (builds with `--base=/font-guesser/` and refreshes `public/font-guesser/`). The `--base` flag is required or the built HTML requests assets from the domain root and loads blank.
- It's still deployed at `/font-guesser/`, but since the 2026-10-29 launch nothing on the one-page site links to it. Its old home-page card is in `src/data/projects.ts` (absolute `href`, no `caseStudySlug`), which is now unused by the live page.

### Consensus prototype (`apps/consensus-prototype/`, unlisted)

Same self-contained sub-app pattern as font-guesser (own toolchain, gitignored `node_modules`/`dist`, excluded from the portfolio's `eslint`/`tsc`/`vitest`), but **private and unlisted** — no home-page card, no sitemap entry, nothing links to it.

- **Source of truth**: `apps/consensus-prototype/` (originally vendored from a separate take-home-challenge repo).
- **Deploy mechanism**: built and committed to `public/consensus/`, served verbatim by GitHub Pages at `benyamron.com/consensus/`.
- **Rebuild + re-vendor**: `npm run build:consensus` (builds with `--base=/consensus/`).
- **Access control**: client-side-only password gate (`src/components/PasswordGate.tsx` in the sub-app, password `consensus`). This is obscurity, not real security — GitHub Pages has no server-side auth, and the password is readable in the built JS. Fine for gating an unreleased design concept; don't rely on it for anything sensitive.

### Dev server after implementation:

After completing any feature implementation, bug fix, or code change, **always run `/link`** to start (or reconnect to) a dev server and send the user a test link. Do not wait to be asked. The `/link` command handles port assignment automatically to avoid conflicts across parallel worktrees.

### PR preparation:

- **Scope audit**: Before preparing any PR, ensure the branch is rebased on the current base branch so the diff reflects only this branch's changes. Then report the diff summary (`git diff --stat`) to Ben before proceeding.
- **Approval gate**: Before preparing any PR for merge, always: (1) review the branch for bugs and errors, (2) start a dev server and send a test link, (3) wait for Ben's explicit approval. Never create a PR without first receiving a green light on a live preview.
- **Quality comparison**: After completing any significant implementation or refactor, explicitly compare the result against the prior state: does it perform the same functions, preserve visual fidelity, and represent a net improvement? State this assessment before closing out the task.

## Project Structure (live site, 2026-10-31)

```
├── CLAUDE.md
├── tokens.md                    # Design tokens (HSL values for all themes)
├── index.html                   # Vite entry; title/description/OG; portrait preload
├── scripts/generate-sitemap.ts  # → public/sitemap.xml (run by hand; deploy doesn't)
├── .github/workflows/           # deploy.yml (push to main → Pages), update-contributions.yml (daily)
├── core-docs/                   # plan.md ▶ START HERE first; see the table above
├── src/
│   ├── App.tsx                  # routes: / (SimpleSite), /havana/privacy, /trio/privacy, * → /
│   ├── proto/                   # THE LIVE SITE (prototype-era names; see plan.md cleanup)
│   │   ├── SimpleSite.tsx       # shell, settings trigger, rail + record
│   │   ├── SimpleHome.tsx       # intro (fit-to-column line sets), icon row, strip
│   │   ├── ContactFx.tsx        # contact easter eggs (email note → plane, terminal, card, blimp)
│   │   ├── InlineIcon.tsx       # portrait = theme toy
│   │   ├── CursorGlow.tsx, RecordDock.tsx, data.ts, protoSettings.ts, proto.css
│   ├── components/              # shared: SidebarThemeControls, ContributionStrip, RecordToggle,
│   │                            #   FlockX, CustomCursor… plus the OLD site's unrouted files
│   ├── hooks/                   # useGlassHighlight, useWindowLeave, …
│   ├── contexts/                # ThemeContext (mode + accent), HoverContext, CursorContext, …
│   ├── data/projects.ts         # old-site project data (still imported by the cursor; see plan.md)
│   └── styles/                  # globals.css → theme.css tokens
├── apps/                        # fontguesser, consensus-prototype (self-contained sub-apps)
└── public/                      # font-guesser/, consensus/ (built sub-apps), audio/, images/, …
```

The old site's files (two-column `Layout`, case studies, playground) are listed for removal in `core-docs/plan.md` § START HERE → Cleanup, and are preserved at the `portfolio-v1` tag.
