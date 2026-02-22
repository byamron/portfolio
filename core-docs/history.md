# History

Decision log and completed work, in reverse chronological order.

## 2026-02-21 — Sidebar theme controls with glass pill hover

**Branch:** `byamron/react-portfolio-build`

**Summary:** Built, iterated, and polished the right-edge sidebar for theme/accent controls. Explored three placement variants (below image, floating popover, right sidebar), consolidated into a single hybrid design, and added a mini glass pill hover system matching the project card glass language.

**What was built:**
- **`src/components/SidebarThemeControls.tsx`** — Consolidated sidebar: fixed trigger dot (16×16, r=5) + expandable toolbar with swatches, dividers, and mode icons. Staggered slide-in animation (0.22s, 0.04s stagger). 250ms close delay for edge tolerance.
- **Mini glass pill** (`setupControlPill`) — Imperative pill system adapted from `useGlassHighlight`: 36×36 fixed size, r=12 (concentric with 24px swatches at r=6). RAF lerp at 0.2 speed. Theme-reactive via MutationObserver. z-index 10 with `contain: layout style` for proper backdrop-filter compositing.
- **Removed:** `FloatingThemeControls.tsx`, `ThemeControls.tsx`, `ModeSwitcher.tsx`, `AccentPicker.tsx` (all consolidated into SidebarThemeControls)

**Key decisions:**
- **Pill sits ON TOP of controls (z-index 10):** backdrop-filter only creates visible blur when there's varied content behind the element. With z-index 0 (behind controls), the pill was blurring a uniform dark background — invisible. z-index 10 matches useGlassHighlight and blurs the swatch/icon content below.
- **Fixed 36×36 pill size for all controls:** Both swatches (24px) and mode buttons (40px tap target, 24px icon) get the same pill. Position calculated from control center point, not element edges. Ensures visual consistency across control types.
- **Concentric radius calculation:** Pill r=12 = swatch r(6) + padding((36-24)/2 = 6). Selection outline at outlineOffset 3 has effective r≈9. Three concentric rings: swatch (r=6) → outline (r≈9) → pill (r=12).
- **Two dividers for structural clarity:** One between trigger and swatches, one between swatches and modes. Both animate in/out with the toolbar. Same style (width 20, height 1, var(--text-dark) at 0.15 opacity, margin 18px).
- **Selected state indicators:** Swatches use 1.5px outline in swatch color at 50% opacity (via `color-mix`). Mode icons use 1.5px outline in `var(--text-dark)` at 20% opacity — adapts to theme (white in dark mode, black in light mode). Mode icons shrunk to 18px inside 24×24 span for breathing room. Both use outlineOffset 3.
- **Hover on selected items preserved:** Glass pill shows on all items including the active one. Hover = spatial feedback, selection = state feedback — suppressing hover creates dead zones.
- **Small trigger dot, not rounded square:** Tested both via dev toggle. The dot differentiates the trigger from the selectable swatches below without competing visually.

**Iteration path:** 3 variants (A/B/C) → user testing → consolidated hybrid → size/spacing tuning → rounded squares everywhere → glass pill added → pill size normalized → blur fix (z-index) → selected state borders → border refinement (1.5px, lighter colors, smaller icons)

**Files changed:** SidebarThemeControls.tsx (new), Layout.tsx, core-docs/design-language.md, core-docs/history.md, core-docs/feedback.md

## 2026-02-21 — Accessibility fixes for glass highlight scaffolding

**Branch:** `byamron/glass-hover-gravity` → pushed directly to `main`

**Summary:** Fixed three accessibility gaps identified post-merge: missing semantic landmarks, non-reactive reduced motion preference, and `dangerouslySetInnerHTML` in Section.tsx.

**What changed:**
- **Semantic landmarks**: LeftColumn now uses `<main>`, RightColumn uses `<aside>` (was `<div>` for both)
- **Reactive reduced motion**: `prefers-reduced-motion` media query now has an `addEventListener('change', ...)` handler, so toggling the system preference mid-session immediately updates the glass config (previously only checked once at setup)
- **Removed `dangerouslySetInnerHTML`**: Changed `contextParagraphs` from `string[]` to `ReactNode[]`, renamed `projects.ts` → `projects.tsx`, Section.tsx now renders children directly

**Files changed:** Layout.tsx, LeftColumn.tsx, RightColumn.tsx, Section.tsx, projects.ts→projects.tsx, useGlassHighlight.ts

## 2026-02-21 — Glass hover highlight with gravitational pull

**Branch:** `byamron/glass-hover-gravity`

**Summary:** Built the portfolio's signature interaction: a single glass pill element that lives on the LeftColumn container, slides smoothly between project links via RAF lerp, and gravitationally pulls toward neighboring cards when the cursor drifts to card edges. Also built all prerequisite scaffolding (contexts, layout, project data, components).

**What was built:**
- **`src/hooks/useGlassHighlight.ts`** (~300 lines) — Fully imperative physics system. One `requestAnimationFrame` loop drives all pill movement: card-to-card slides, gravitational pull, and volume-preserving stretch. Glass visual recipe (6 layers: fill, radial highlight, backdrop blur, inner glow, border, shape). Theme reactivity via MutationObserver. Scroll/resize tracking. Keyboard focus support. Reduced motion support.
- **`src/data/projects.ts`** — All 11 projects across 3 content sections with types
- **`src/contexts/HoverContext.tsx`** — Hovered project ID state
- **`src/contexts/ThemeContext.tsx`** — Minimal: reads HTML attributes, exposes accent/appearance
- **`src/components/`** — ProjectLink, Section, HeroTitle, AboutSection, LeftColumn, RightColumn, Layout
- **`src/App.tsx`** — Wired providers + Layout
- **`src/styles/globals.css`** — Body background, full glass CSS hover fallback (radial gradient, 6 inset shadows, backdrop blur), `[data-glass-highlight-active]` override

**Key decisions:**
- **Unified RAF lerp for all motion** (no CSS transitions on position): The first approach used CSS transitions for card-to-card slides with a separate RAF loop for gravitational pull. This caused the two systems to fight — the RAF loop overwrote the CSS transition, causing abrupt jumps. The fix: one RAF loop with exponential lerp (`lerpSpeed: 0.15`) drives ALL pill movement. When hovering a new card, the target updates but current stays at the old position — the lerp naturally produces smooth deceleration. See `feedback.md` for the full lesson.
- **Container-level pill, not per-card**: The glass pill is a single absolutely-positioned div inside the LeftColumn container. It slides between all `[data-link-card]` elements as one continuous object — matching the Framer original where the code override was applied to the section, not individual cards.
- **Cards use `width: fit-content`**: ProjectLink elements shrink to their text content so the pill hugs the text rather than spanning the full column width. `padding: 24px 16px` with `margin: 0 -16px` keeps text aligned with surrounding paragraphs.
- **Smart RAF lifecycle**: Loop stops when pill settles (all dimensions within 0.3px of target). Restarts on `mousemove`. Zero wasted frames when cursor is stationary.
- **Only CSS transition is opacity**: Fade in/out uses `opacity` CSS transition. Everything else is RAF-driven.
- **CSS hover fallback**: Full glass recipe (radial gradient, 6 inset box-shadows, backdrop blur) applied via CSS for pre-JS state. Disabled by `[data-glass-highlight-active]` once the hook attaches.
- **RightColumn is a placeholder**: Shows static portrait-table.jpeg. Image swap on hover is not wired yet.

## 2026-02-21 — Subframe component library, Tailwind v4, and theme integration

**Branch:** `main`

**Summary:** Installed Subframe UI component library (44 components), Tailwind CSS v4, and wired up the portfolio's design token system so Subframe components visually match the portfolio's "table" accent theme.

**What was added:**
- **Subframe CLI + components**: `npx @subframe/cli init` with project ID `b82957b2b077`, synced 44 components to `src/ui/` (Button, Dialog, TextField, Accordion, Charts, etc.) plus 3 layouts (DefaultPageLayout, DialogLayout, DrawerLayout)
- **Tailwind CSS v4**: Installed `tailwindcss` + `@tailwindcss/vite` plugin; CSS-first configuration via `@import "tailwindcss"` in globals.css
- **Portfolio design tokens**: Populated `src/styles/theme.css` with all 15 tokens from `tokens.md` — 7 text colors (appearance-only), 8 background colors (4 accents × 2 modes), 4 constant swatches, plus `--accent-hue`
- **Subframe theme overrides**: Added CSS variable overrides in `src/styles/theme.css` that load after Subframe's `src/ui/theme.css` and win via cascade — maps Subframe's `--font-*`, `--color-*`, and `--text-*--font-weight` tokens to portfolio values
- **Font configuration**: Google Fonts link updated for Manrope (wght 300–700) + Newsreader (wght 300–700)

**Key decisions:**
- **CSS cascade override strategy** (not `edit_theme`): The Subframe `edit_theme` MCP tool is AI-driven and interprets descriptions loosely — 3 attempts produced wrong fonts (Plus Jakarta Sans, Lora, Inter) and wrong colors. Instead, all Subframe variable overrides live in `src/styles/theme.css` which loads after `src/ui/theme.css` and wins via CSS specificity. This means `npx @subframe/cli sync` can safely overwrite `src/ui/theme.css` without losing our customizations.
- **"Table" accent as Subframe base theme**: The portfolio has 4 switchable accent themes but Subframe expects a single brand color. Chose "table" (warm gold, `hsl(34, 50%, 60%)`) as the Subframe default. Subframe's `--color-brand-primary` and `--color-default-background` reference portfolio CSS variables (`var(--swatch)`, `var(--bg)`) so they respond to `data-accent` attribute changes.
- **Newsreader for Subframe headings**: Subframe's `--font-heading-*` tokens are set to Newsreader (serif) while body/caption remain Manrope. This applies only to Subframe components; the portfolio's own components follow the single-typeface rule (Manrope 400 throughout) per `design-language.md`.
- **Tailwind v4 (not v3)**: CSS-first config with `@tailwindcss/vite` plugin — no `tailwind.config.js` needed. Theme variables defined in CSS, not JS.

**CSS import order** (in `src/styles/globals.css`):
```
@import "tailwindcss";         → Tailwind base + utilities
@import "../ui/theme.css";     → Subframe theme (synced, do not edit)
@import "./theme.css";         → Portfolio tokens + Subframe overrides (wins via cascade)
```

**New files:**
- `.subframe/sync.json` — Subframe project config (projectId, directory, cssType)
- `src/ui/` — 44 synced components, theme.css, utils.ts, index.ts, 3 layouts

**Modified files:**
- `vite.config.ts` — added `@tailwindcss/vite` plugin
- `src/styles/globals.css` — added 3 `@import` lines
- `src/styles/theme.css` — populated with all tokens + Subframe overrides
- `index.html` — expanded Google Fonts link (added Newsreader, expanded Manrope weights)
- `package.json` — added `@subframe/core`, `tailwindcss`, `@tailwindcss/vite`
- `.gitignore` — added `.vite/`

**Updated docs:** CLAUDE.md, plan.md, history.md

## 2026-02-21 — Extracted all Framer reference data, deleted reference files

**Branch:** `byamron/cleanup-file-structure`

**Summary:** Audited all 10 Framer `.tsx` reference files, extracted every implementation-critical detail into `core-docs/design-language.md` and `core-docs/plan.md`, then deleted the `reference/` directory entirely. The project no longer depends on any Framer code.

**What was extracted:**
- Glass fill color computation algorithm (hue extraction, saturation/brightness recipe, fallback color)
- Dynamic radial highlight gradient formula (intensity scaling with fill brightness)
- Border light simulation (directional `baseIntensity` formula with 1.2x/1.0x/0.8x multipliers)
- Inner glow multipliers (top `0.4`, bottom `0.15`)
- Complete glass config defaults for all 3 panel tabs: Fill (7 params), Shadow (5 params), Motion (10 params) with ranges and steps
- Stretch/squash deformation formulas (`peakSx`/`peakSy` computation, distance normalization, 3-keyframe structure)
- Gravitational pull physics (volume preservation formula, max stretch/translate calculations, layout detection)
- Theme-to-image mapping (table→portrait-table.jpeg, etc.)
- Z-index stacking order (pill: 10, link content: 1)
- Link card padding clarification (card: 8px 12px, glass pill: 0 padding, sizes to bounding box)
- Mode switcher details (localStorage key `"appearanceMode"`, button gap 8px, padding 8px, ARIA labels)
- 6 named easing curve presets (Smooth, Material, Expo Out, Quint Out, Snap, Spring)

**What was deleted:** All 10 files in `reference/`

**Updated docs:** CLAUDE.md, plan.md, design-language.md

## 2026-02-21 — Project scaffolding and file structure cleanup

**Branch:** `byamron/cleanup-file-structure`

**Summary:** Reorganized the repo from a loose collection of Framer reference files into a proper Vite + React + TypeScript project structure, ready for development.

**What changed:**
- Moved all 10 Framer `.tsx` reference files from repo root into `reference/` directory — they remain in git for consultation but are excluded from the build and linting
- Initialized Vite + React + TypeScript project with `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- Installed core dependencies: React 19, Framer Motion, Phosphor Icons
- Created full `src/` directory structure: `contexts/`, `components/`, `hooks/`, `styles/`, plus entry files (`main.tsx`, `App.tsx`, `globals.css`, `theme.css`)
- Added `.gitignore` (node_modules, dist, .env, .DS_Store, .context)
- Added ESLint config with TypeScript and React hooks plugins (ignores `reference/`)
- Set up `@/` path alias for clean imports
- Configured Manrope font via Google Fonts in `index.html`
- Set default `data-theme="dark"` and `data-accent="table"` on `<html>`
- Verified clean build (432ms, ~61KB gzipped JS)

**Key decisions:**
- `reference/` at project root (not inside `src/`) — these files are not part of the build, just documentation
- Manual Vite setup rather than `create-vite` scaffold — gives full control over what's included
- React 19 — latest stable, no reason to pin older
- ESLint 9 flat config — modern standard
- Path alias `@/` → `src/` for clean imports from any depth
- No Tailwind yet — the plan lists it for Phase 0 but it can be added when actual layout work begins

**Updated docs:** CLAUDE.md project structure, plan.md reference file paths

## 2026-02-21 — React Component Architecture Analysis

**Branch:** byamron/react-component-plan
**Summary:** Deep analysis of all 10 Framer components and their interactions. Designed the React architecture that delivers identical interactive behavior with dramatically less complexity.

**Key decisions:**
- **Two React Contexts replace all globals**: `ThemeContext` (accent + appearance) and `HoverContext` (hovered project ID). No `window.__themeState`, no `window.__hoverState`, no custom events.
- **ImageDisplay merges Theme_Image + Hover_Preview**: A single component reads both contexts to determine which image to show. Eliminates N separate Hover_Preview instances.
- **GlassHighlight stays imperative, wrapped in a hook**: `useGlassHighlight(containerRef, config)` wraps the same RAF-based pill animation. The DOM manipulation approach is correct for 60fps animation — React state would cause excessive re-renders.
- **Theme color for glass pill**: Read `--swatch` from computed style on `:root` instead of the 50-line `getTokenColor()` → `findFramerTokenElement()` chain. Use `MutationObserver` on `data-accent` attribute instead of `window.__themeState.listeners`.
- **ThemeBackgroundLayer eliminated entirely**: Replaced by `body { background-color: var(--bg) }` in CSS.
- **No timing hacks**: All `setTimeout(50-100ms)` delays are Framer-specific. React state updates + CSS variable resolution are synchronous.
- **`data-link-card` attribute preserved**: GlassHighlight's DOM queries use it to find hoverable cards — this stays the same.

**Component line count reduction estimate:**
- Framer total: ~3,370 lines across 10 files
- React equivalent: ~950 lines across ~15 files (smaller, focused modules)

**Full architecture plan:** `core-docs/initial-implementation.md`

## 2026-02-20 — Created design-language.md, integrated token system

**Branch:** `byamron/design-language-doc`

**Summary:** Created `core-docs/design-language.md` — a comprehensive design language specification that codifies the visual and interaction rules governing the site. Derived from analysis of all 8 screenshots across themes, all 10 original Framer components, and the existing CLAUDE.md and plan.md documentation. Subsequently merged main (which added `tokens.md`) and updated the Color section to use precise HSL token values and document the three-tier token architecture.

**Key decisions:**
- Structured the doc around principles and rules rather than just values — it explains the _why_ behind every choice, not just the _what_
- Included an explicit anti-patterns section to prevent common deviations (second typeface, drop shadows, scroll animations, etc.)
- Added a coherence checklist for verifying implementation consistency
- Positioned design-language.md as the first file to read before any design/implementation work, referenced in both CLAUDE.md and plan.md
- Documented the three-tier token architecture: text colors (appearance-only), backgrounds (accent + appearance), swatches (constant). This structural insight is critical for implementation — it defines which things feel ambient vs thematic.
- Replaced approximate RGB color values with precise HSL tokens from `tokens.md`, cross-referencing tokens.md for implementation values
- Filled in portrait accent details (previously TBD)
- Noted 4 image variants (not 5) per the doc-review findings

**Technical details:**
- Updated CLAUDE.md core docs table to include design-language.md with its purpose and update trigger
- Added a new rule in CLAUDE.md requiring design-language.md review before any design/implementation work
- Added a cross-reference callout at the top of plan.md linking to design-language.md as the source of truth for visual decisions
- Merged main (PR #3: doc-review) to incorporate tokens.md and related doc updates
- Added token-specific items to the coherence checklist

## 2026-02-20 — Documentation Review & Color Token Extraction

**Branch:** byamron/doc-review
**Summary:** Deep review of all Framer reference components and documentation. Clarified component relationships, identified gaps, extracted color tokens from the live Framer site.

**Key decisions:**
- **SectionHighlight is dropped.** GlassHighlight.tsx is the only glass pill component needed — SectionHighlight was an earlier iteration.
- **Theme_Image uses 4 variants**, not 5. The 5th variant slot in the original is vestigial.
- **Typography baseline**: Manrope, 18px body / 36px headings, regular weight, 120% line height.
- **Glass pill defaults**: Use the values from GlassHighlightControls.tsx as the starting spec. Will be refined through testing.
- **Color tokens extracted**: 7 text tokens (appearance-dependent only), 4 theme backgrounds (theme + appearance), 4 swatch accents (constant). All documented in `tokens.md`.
- **Text colors are theme-independent** — they only change with light/dark, not with theme selection.
- **Framer-only tokens ignored**: Default, Default Frosted, Extra Light, Mochi Blue, UW Purple, Surface-Subtle, Surface-80, Tint — not needed for portfolio theming.

**Technical details:**
- Documented full data flow for theme changes, appearance mode changes, hover previews, and glass highlight interactions
- Identified that Framer timing hacks (50-100ms setTimeout delays) are unnecessary in React
- GlassHighlight uses raw DOM manipulation (createElement, Web Animations API, rAF lerp loop) — needs useEffect-based integration
- Updated reference file mapping table with migration status for each file
