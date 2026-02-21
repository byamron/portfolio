# History

Decision log and completed work, in reverse chronological order.

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
