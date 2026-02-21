# React Component Architecture Plan

## Context

The Framer portfolio site uses 10 interconnected components that coordinate through `window.__themeState` and `window.__hoverState` global pub/sub systems. These patterns exist because Framer components are isolated — they can't share React state. The result is a complex web of global listeners, DOM queries, timing hacks, and manual color resolution that is unnecessary in a standard React app.

This plan redesigns the interactive system for idiomatic React: the same visual behavior with a fraction of the complexity.

---

## Framer Architecture (What We're Replacing)

### The Problem: Global Pub/Sub Everywhere

Every interaction flows through window globals:

```
LinkCard → window.__hoverState.listeners → Hover_Preview (×N instances)
                                         → Theme_Image (hide/show)
                                         → GlassHighlight (pill position)

ThemeSelectorButton → window.__themeState.listeners → ThemeImageVariant override
                                                    → BackgroundColor override
                                                    → GlassHighlight (fill color)
                                                    → ThemeBackgroundLayer
                                                    → Browser meta tag

ThemeToggle → Custom DOM event → window.__themeState listener → 100ms setTimeout → re-query CSS
```

### Specific Framer Constraints We're Eliminating

| Framer Pattern | Problem | React Solution |
|---|---|---|
| `window.__themeState` / `window.__hoverState` | Global mutation + manual listener Sets | React Context |
| `ThemeSelectorButton()` override | Watches Framer variant changes via ref/effect hack | Direct `setAccentColor()` call |
| `ThemeImageVariant()` override | Maps theme name → variant prop | Context consumer reads `accentColor` directly |
| `getTokenColor()` — 50 lines of DOM querying | Resolves CSS var → computed → nested var → hex | CSS custom properties resolve automatically |
| `findFramerTokenElement()` — checks 5 DOM locations | Framer puts tokens on unpredictable elements | We define tokens on `:root` |
| `setTimeout(50-100ms)` after appearance changes | Framer needs time to recalculate CSS | React state updates are synchronous |
| `window.dispatchEvent(new CustomEvent(...))` | Cross-component communication | React Context propagation |
| N separate `Hover_Preview` component instances | Framer can't conditionally render children | Single `ImageDisplay` with data-driven logic |
| `ThemeBackgroundLayer` as separate component | Independent layer that polls for theme state | `background-color: var(--bg)` on body |

---

## React Architecture

### Two Contexts, Zero Globals

**ThemeContext** — accent color + appearance mode:

```typescript
interface ThemeContextValue {
  accentColor: 'table' | 'portrait' | 'sky' | 'pizza'
  setAccentColor: (color: AccentColor) => void
  appearanceMode: 'system' | 'light' | 'dark'
  setAppearanceMode: (mode: AppearanceMode) => void
  resolvedAppearance: 'light' | 'dark'
}
```

Effects inside the provider:
- Sets `data-theme` and `data-accent` attributes on `<html>` — CSS custom properties resolve everything
- Updates `<meta name="theme-color">` content from `--bg` computed value
- Persists both `appearanceMode` and `accentColor` to `localStorage`
- Listens to `matchMedia('(prefers-color-scheme: dark)')` changes
- Default: `appearanceMode: "system"`, `accentColor: "table"` — `resolvedAppearance` computed from system preference

**HoverContext** — hovered project ID:

```typescript
interface HoverContextValue {
  hoveredProjectId: string | null
  setHoveredProjectId: (id: string | null) => void
}
```

That's it. No listener Sets, no window globals, no custom events.

### CSS Architecture (Replaces Theme_Overrides color resolution)

All theme tokens defined in `theme.css` using combinatorial `[data-theme][data-accent]` selectors. When ThemeContext sets attributes on `<html>`, CSS variables resolve automatically — no JavaScript color querying needed.

**Attribute names** (canonical — used everywhere):
- `data-theme` → `"light"` | `"dark"` on `<html>`
- `data-accent` → `"table"` | `"portrait"` | `"sky"` | `"pizza"` on `<html>`

Note: `tokens.md` CSS draft uses `data-color-theme` — rename to `data-accent` during implementation to match this doc and CLAUDE.md conventions.

**Variables each combination defines:**
- `--bg` — page background (accent × appearance dependent)
- `--swatch` — accent spot color (constant across light/dark)
- `--accent-hue` — bare hue number for glass effect CSS: `hsla(var(--accent-hue), 10%, 45%, 0.05)`

**Text tokens** (appearance-only, no accent dependency):
- `--text-dark`, `--text-medium`, `--text-grey`, `--text-light-grey`, `--text-light`, `--text-link`, `--text-underline`

**Surface tokens** (for GlassPanel, constant across themes):
- `--surface` — panel background: `hsl(0, 0%, 10%)` dark / `hsl(0, 0%, 96%)` light
- `--border` — panel border: `hsl(0, 0%, 20%)` dark / `hsl(0, 0%, 85%)` light

The `--swatch` variable is constant across appearance modes, which means GlassHighlight can read it via `getComputedStyle` without worrying about light/dark state. The Framer version reads the background color and extracts its hue — using `--swatch` instead is a deliberate simplification (hues differ by ~1-3° between bg and swatch, visually identical).

### Component Mapping

| Framer Component | React Replacement | Change |
|---|---|---|
| `Theme_Overrides.tsx` (234 lines) | `ThemeContext.tsx` (~60 lines) | Eliminates global state, DOM queries, timing hacks |
| `ThemeToggle.tsx` (323 lines) | `ModeSwitcher.tsx` (~50 lines) | Direct Phosphor icons, no `cloneElement` color injection |
| `ThemeBackgroundLayer.tsx` (231 lines) | 1 CSS rule: `body { background-color: var(--bg) }` | Entire component eliminated |
| `LinkCard.tsx` (307 lines) | `ProjectLink.tsx` (~40 lines) | No Framer property controls, context instead of global |
| `Theme_Image.tsx` (257 lines) | Part of `ImageDisplay.tsx` | Merged with Hover_Preview logic |
| `Hover_Preview.tsx` (198 lines) | Part of `ImageDisplay.tsx` | Single component replaces N instances |
| `GlassHighlight.tsx` (758 lines) | `useGlassHighlight.ts` (~300 lines) | Hook wrapping the same imperative logic, simplified theme reads |
| `GlassHighlightControls.tsx` (1062 lines) | `GlassPanel.tsx` (~400 lines) | Remove Framer controls, keep UI |
| `SectionHighlight.tsx` | Not migrated | Superseded |
| `HighlightControls.tsx` | Not migrated | Superseded |

---

## Key Architectural Decisions

### 1. ImageDisplay: One Component Replaces Two

In Framer: `Theme_Image` (shows accent portrait, hides on any hover) + N × `Hover_Preview` (each shows when its specific project is hovered). These are separate because Framer can't conditionally render inside a single component.

In React: A single `ImageDisplay` reads both contexts:

```tsx
function ImageDisplay() {
  const { hoveredProjectId } = useHoverContext()
  const { accentColor } = useThemeContext()

  // Multiple projects share the same projectId (e.g., "uw" appears 3 times).
  // Map: unique project id → projectId → image source.
  const project = hoveredProjectId ? projectsById[hoveredProjectId] : null
  const imageSrc = project
    ? projectImageMap[project.projectId]  // project-specific preview
    : defaultImageMap[accentColor]        // accent default portrait
  const imageKey = project ? project.projectId : `default-${accentColor}`

  // Cross-fade: stack all images absolutely, fade via opacity.
  // AnimatePresence mode="sync" keeps both old and new images mounted
  // during the transition so they overlap (true cross-fade).
  // mode="wait" would show a gap between exit and enter.
  return (
    <div style={{ position: 'relative', width: 528, height: 720 }}>
      <AnimatePresence mode="sync">
        <motion.img
          key={imageKey}
          src={imageSrc}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: 32, objectFit: 'cover',
            width: '100%', height: '100%',
          }}
        />
      </AnimatePresence>
    </div>
  )
}
```

**Image key logic**: `imageKey` is derived from `projectId` (not unique project `id`) so that hovering two different projects that share the same preview (same `projectId`) doesn't trigger a redundant cross-fade.

This eliminates: N Hover_Preview instances, Theme_Image's separate hide/show logic, the variant mapping override, and the dual AnimatePresence coordination.

### 2. GlassHighlight: Keep Imperative, Wrap in Hook

The GlassHighlight pill animation is inherently imperative — it creates a DOM element, uses `requestAnimationFrame` for lerp-based movement, and the Web Animations API for deformation. This is correct and performant. Re-implementing it with React state would cause 60+ re-renders per second.

The React migration wraps this in a hook:

```typescript
function useGlassHighlight(containerRef: RefObject<HTMLElement>, config?: GlassConfig) {
  // Store config in a ref to avoid teardown/setup on every config change.
  // The setup function reads cfg() which checks the ref, so skin() and
  // setTransition() pick up new values without re-creating the pill.
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    return setupGlassHighlight(el, configRef)  // returns cleanup
  }, [])  // stable — never re-runs
}
```

**Container scope**: The hook attaches to the **LeftColumn content area** that wraps ALL sections — not per-Section. This way the pill slides continuously across all project links regardless of which section they belong to. In LeftColumn:

```tsx
function LeftColumn() {
  const contentRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(contentRef)

  return (
    <div ref={contentRef}>
      <HeroTitle />
      <Section ... />
      <Section ... />
      <Section ... />
      <AboutSection />
    </div>
  )
}
```

**CSS hover vs animated pill**: When useGlassHighlight is active, individual ProjectLink CSS hover backgrounds must be disabled — otherwise you get a double-highlight (the pill AND the link's own background). The pill adds `data-glass-highlight-active` to the container on setup. CSS:

```css
/* CSS-only fallback when no JS pill */
[data-link-card]:hover { background: hsla(var(--accent-hue), 10%, 45%, 0.05); ... }

/* Disable CSS hover when animated pill is active */
[data-glass-highlight-active] [data-link-card]:hover { background: transparent; ... }
```

Simplifications from the Framer version:
- **Theme color**: Read `getComputedStyle(document.documentElement).getPropertyValue('--swatch')` instead of traversing 5 DOM elements via `findFramerTokenElement()`
- **Theme change listener**: Use a `MutationObserver` on `<html>` `data-accent` attribute instead of `window.__themeState.listeners`
- **Config updates**: `setupGlassHighlight` reads from `configRef.current` via a `cfg()` function — config changes take effect immediately on next `skin()` or `moveTo()` call without tearing down the pill. GlassPanel can trigger a re-skin by calling a returned `refresh()` function.
- **Everything else stays**: The pill creation, `moveTo()`, `handlePull()`, lerp loop, stretch/squash deformation, and event handlers are all preserved as-is

### 3. ProjectLink: Context Over Globals

Framer's `LinkCard` calls `window.__hoverState.listeners.forEach(...)` on mouse events. React's `ProjectLink` calls `setHoveredProjectId()` from context. Same behavior, type-safe, no globals.

The `data-link-card` attribute is preserved — GlassHighlight's DOM queries use it to find hoverable cards.

### 4. No Timing Hacks

Framer needs `setTimeout(50-100ms)` after appearance changes because Framer's runtime recalculates CSS asynchronously. In React:
- ThemeContext sets `data-theme` attribute → CSS variables update instantly
- Components re-render via context → no race conditions
- `getComputedStyle` queries in GlassHighlight happen after DOM update → correct values

---

## Files to Create

### Contexts
- `src/contexts/ThemeContext.tsx` — accent + appearance state, attribute sync, localStorage, meta tag
- `src/contexts/HoverContext.tsx` — hovered project ID

### Components
- `src/components/Layout.tsx` — two-column flex
- `src/components/LeftColumn.tsx` — scrollable content container, owns the glass highlight container ref
- `src/components/RightColumn.tsx` — fixed image container
- `src/components/HeroTitle.tsx` — heading
- `src/components/Section.tsx` — context text + project link group (no glass highlight responsibility)
- `src/components/ProjectLink.tsx` — hoverable `<a>` with `data-link-card` attribute
- `src/components/AboutSection.tsx` — bio paragraphs
- `src/components/ImageDisplay.tsx` — cross-fading image display (replaces Theme_Image + Hover_Preview)
- `src/components/ThemeControls.tsx` — footer row
- `src/components/ModeSwitcher.tsx` — 3-mode toggle
- `src/components/AccentPicker.tsx` — 4 swatches

### Hooks
- `src/hooks/useGlassHighlight.ts` — imperative glass pill, adapted from GlassHighlight.tsx

### Data
- `src/data/projects.ts` — project definitions + image maps

**Data model notes:**

Multiple projects share the same `projectId` (e.g., 3 projects use `"uw"`, 3 use `"cip"`). The `projectId` maps to a preview image — there are only 4 unique preview images (uw, sony, cip, acorn), not 11. Projects with the same `projectId` show the same preview.

```typescript
// Lookup chain: hoveredProjectId (unique) → project.projectId → image
const projectsById: Record<string, Project> = { ... }
const projectImageMap: Record<string, string> = {
  uw: '/images/preview-uw.jpg',
  sony: '/images/preview-sony.jpg',
  cip: '/images/preview-cip.jpg',
  acorn: '/images/preview-acorn.jpg',
}
const defaultImageMap: Record<AccentColor, string> = {
  table: '/images/portrait-table.jpg',
  portrait: '/images/portrait-portrait.jpg',
  sky: '/images/portrait-sky.jpg',
  pizza: '/images/portrait-pizza.jpg',
}
```

Project preview images are **not** accent-variant — they're single static images per `projectId`. Only the default portraits have accent variants (4 different photos, one per accent).

### Styles
- `src/styles/globals.css` — reset, font import, base styles
- `src/styles/theme.css` — all CSS custom property definitions (from tokens.md)

### Later (Phase 4-5)
- `src/components/GlassPanel.tsx` — configurator panel
- `src/components/GlassButton.tsx` — panel toggle

---

## Implementation Order

1. **Theme CSS + ThemeContext** — everything else depends on theming
2. **HoverContext** — simple, enables all interaction work
3. **Layout + static content** — page structure with real text
4. **ProjectLink + ImageDisplay** — the core interaction loop
5. **useGlassHighlight** — the signature animated effect
6. **ModeSwitcher + AccentPicker** — user controls
7. **GlassPanel** — demo feature

---

## Verification

- Toggle through all 4 accents × 3 modes (12 combinations) — background, text, swatch colors correct
- Hover each project link — glass pill slides smoothly, image cross-fades to correct preview
- Leave hover — image returns to accent default portrait
- Change accent while hovering — glass pill fill color updates, default portrait changes on unhover
- Change appearance mode — all colors transition, GlassHighlight fill updates
- Keyboard tab through links — glass pill follows focus, image swaps
- Resize below 1200px — right column hides
- Check `prefers-reduced-motion` — physics disabled, simple opacity transitions
- No console errors, no memory leaks (RAF cleanup, listener cleanup)
