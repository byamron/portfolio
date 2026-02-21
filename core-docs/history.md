# History

Decision log and completed work, in reverse chronological order.

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
