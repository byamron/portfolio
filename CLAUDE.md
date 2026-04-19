# CLAUDE.md — Portfolio Site

## About Ben

Ben is a senior product designer working across health tech, AI, and tools for critical thinking. The portfolio's positioning, voice, visual philosophy, and decision-making lens are defined in `core-docs/guidelines.md` — read that first for any content, copy, or design decision.

## Core Documentation

All project documentation lives in `core-docs/`. **You must review and proactively update these files as part of your workflow.**

| File | Purpose | When to update |
|------|---------|----------------|
| `core-docs/guidelines.md` | Positioning, voice, visual philosophy, case study approach, AI decision filters | When content strategy, voice, or editorial standards change |
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
- **Branching**: Feature branches merge into `next-update`, not `main`. Only merge `next-update → main` when intentionally deploying. See `core-docs/workflow.md` § Branching and Deploy Strategy.
- **Proactive updates**: If you notice a doc is stale, inaccurate, or missing useful context, update it. Don't wait to be asked.

## Technical Context

For detailed technical context (Tailwind, theme system, typography, architecture, accessibility, visual reference), see `.claude/rules/technical-context.md` — auto-loaded when editing `src/` files.

### Dev server after implementation:

After completing any feature implementation, bug fix, or code change, **always run `/link`** to start (or reconnect to) a dev server and send the user a test link. Do not wait to be asked. The `/link` command handles port assignment automatically to avoid conflicts across parallel worktrees.

### PR preparation:

- **Scope audit**: Before preparing any PR, ensure the branch is rebased on the current base branch so the diff reflects only this branch's changes. Then report the diff summary (`git diff --stat`) to Ben before proceeding.
- **Approval gate**: Before preparing any PR for merge, always: (1) review the branch for bugs and errors, (2) start a dev server and send a test link, (3) wait for Ben's explicit approval. Never create a PR without first receiving a green light on a live preview.
- **Quality comparison**: After completing any significant implementation or refactor, explicitly compare the result against the prior state: does it perform the same functions, preserve visual fidelity, and represent a net improvement? State this assessment before closing out the task.

## Project Structure (Target)

```
├── CLAUDE.md                 # This file
├── tokens.md                 # Design tokens (HSL values for all themes)
├── index.html                # Vite entry HTML
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── core-docs/
│   ├── guidelines.md         # Positioning, voice, philosophy, decision filters
│   ├── plan.md               # Migration plan (living document)
│   ├── design-language.md    # Visual & interaction rules
│   ├── workflow.md           # Development process
│   ├── feedback.md           # Lessons from negative feedback
│   └── history.md            # Decision log (reverse chronological)
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── contexts/
│   │   ├── ThemeContext.tsx   # Mode + accent color state
│   │   └── HoverContext.tsx   # Hovered project ID
│   ├── components/           # Portfolio-specific components
│   │   ├── Layout.tsx         # Two-column flex
│   │   ├── LeftColumn.tsx     # Scrollable content
│   │   ├── RightColumn.tsx    # Fixed image display
│   │   ├── HeroTitle.tsx
│   │   ├── Section.tsx
│   │   ├── ProjectLink.tsx    # Hoverable link with glass effect
│   │   ├── AboutSection.tsx
│   │   ├── ThemeControls.tsx  # Footer: mode + accent
│   │   ├── ModeSwitcher.tsx
│   │   ├── AccentPicker.tsx
│   │   ├── ImageDisplay.tsx   # Cross-fading images
│   │   └── GlassButton.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── useHoveredProject.ts
│   ├── data/
│   │   ├── projects.ts
│   │   └── case-studies/      # Markdown content for case studies
│   ├── assets/
│   │   └── images/
│   └── styles/
│       ├── globals.css        # CSS entry: imports Tailwind → portfolio tokens
│       └── theme.css          # Portfolio design tokens
└── public/
```
