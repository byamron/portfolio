# Portfolio Site — React Migration Plan

## Overview

Recreate Ben's Framer-based design portfolio as a standalone React application. The site should replicate the visual identity and interactive behavior of the original while using idiomatic React patterns, eliminating Framer-specific coupling, and producing a production-ready, deployable artifact.

The site is not a showcase of process — it's a design artifact that demonstrates taste, judgment, and the ability to make complex things feel simple.

---

## Phase 0: Project Scaffolding

**Goal:** Set up the build toolchain, project structure, and development environment.

### Tasks

- [ ] Initialize a Vite + React + TypeScript project
- [ ] Configure path aliases (`@/components`, `@/context`, etc.)
- [ ] Set up Tailwind CSS v4 (utility-first, CSS custom properties for theming)
- [ ] Install Framer Motion for animations
- [ ] Set up ESLint + Prettier with opinionated defaults
- [ ] Create folder structure per `CLAUDE.md`
- [ ] Add a basic `index.html` with proper meta tags (viewport, charset, theme-color)
- [ ] Confirm dev server runs cleanly

### Decisions

- **Vite over Next.js**: This is a single-page portfolio with no SSR/ISR needs. Vite is faster, simpler, and avoids unnecessary complexity.
- **Tailwind v4**: Aligns with modern CSS-first approach. Utility classes for layout, CSS custom properties for theme tokens.
- **Framer Motion**: Already used in the originals. Best-in-class React animation library. No reason to switch.

---

## Phase 1: Theme System

**Goal:** Build the foundational theme infrastructure that all other components depend on.

### 1.1 — CSS Custom Properties

- [ ] Define theme tokens as CSS custom properties in a root stylesheet:
  - 4 themes: `table`, `portrait`, `sky`, `pizza`
  - Each theme defines: `--bg`, `--fg`, `--accent`, `--accent-subtle`, `--surface`, `--border`
  - Light and dark variants for each theme
  - **Token values to be provided by Ben** — the Framer-generated token IDs (`--token-6e011c17-...`) in the originals need to be replaced with semantic variable names and actual color values
- [ ] Use `[data-theme="light"]` and `[data-theme="dark"]` selectors on `<html>`
- [ ] Use `[data-color-theme="table|portrait|sky|pizza"]` for color theme selection

### 1.2 — ThemeContext

- [ ] Create `ThemeContext` with:
  - `colorTheme`: `"table" | "portrait" | "sky" | "pizza"`
  - `appearanceMode`: `"light" | "dark" | "system"`
  - `resolvedAppearance`: `"light" | "dark"` (resolved from system preference when mode is "system")
  - `setColorTheme(theme)`: Updates color theme, notifies consumers
  - `setAppearanceMode(mode)`: Updates appearance, persists to localStorage
- [ ] On mount: read localStorage for persisted preferences, detect system preference via `matchMedia`
- [ ] Listen for system preference changes (`prefers-color-scheme` media query)
- [ ] Update `<html>` attributes on theme change
- [ ] Update `<meta name="theme-color">` for browser chrome integration
- [ ] Update `document.body` background color with CSS transition

### 1.3 — ThemeToggle Component

- [ ] 3-state toggle: System / Light / Dark
- [ ] Icons for each state (sun, moon, auto)
- [ ] Visual feedback: selected state styling, hover scale on inactive buttons
- [ ] Keyboard accessible (arrow keys to navigate, enter/space to select)

### 1.4 — Theme Selector

- [ ] 4 buttons or swatches, one per color theme
- [ ] Visual indicator of active theme
- [ ] Smooth background transition on switch

### 1.5 — ThemeBackgroundLayer

- [ ] Full-viewport background that reads `--bg` from CSS custom properties
- [ ] Smooth color transition on theme change
- [ ] Optional backdrop blur

---

## Phase 2: Layout & Navigation

**Goal:** Build the page structure, navigation, and core layout that frames all content.

### 2.1 — Page Layout

- [ ] Single-page layout with clear visual sections
- [ ] Responsive: desktop (primary), tablet, mobile
- [ ] Max-width container with generous whitespace
- [ ] Typography system:
  - **Font**: Manrope (Google Fonts)
  - **Body**: 18px, regular (400) weight, 120% line height
  - **Headings**: 36px, regular (400) weight, 120% line height
  - Secondary sizes, weights, and full scale to be refined later

### 2.2 — Navigation / Link List

- [ ] Vertical or horizontal list of project links (LinkCard components)
- [ ] Clear hover/focus states
- [ ] Glass highlight overlay that slides between items (see Phase 3)

### 2.3 — Content Sections

- [ ] Hero / introduction area — minimal, confident, no fluff
- [ ] Project list — the primary content
- [ ] About section — brief, opinionated, not a biography
- [ ] Contact / links — email, LinkedIn, etc.

---

## Phase 3: Glass Highlight System

**Goal:** Replicate the signature frosted-glass pill that animates between navigation items.

### 3.1 — HoverContext

- [ ] Create `HoverContext` with:
  - `hoveredId`: `string | null`
  - `setHoveredId(id)`: Updates hover state
  - Listener pattern (or simple context) to notify consumers

### 3.2 — LinkCard Component

- [ ] Semantic `<a>` tag with `data-link-card` attribute
- [ ] Emits hover/focus/blur to HoverContext
- [ ] Props: `projectId`, `text`, `href`, `openInNewTab`
- [ ] Optional arrow indicator
- [ ] Configurable text style and padding
- [ ] Accessible: proper focus ring, keyboard navigation

### 3.3 — GlassHighlight Component

Only `GlassHighlight.tsx` is needed. `SectionHighlight.tsx` was an earlier iteration and is superseded.

Implementation approach: raw DOM manipulation via `useEffect`-based hook or vanilla JS module with React wrapper (the pill element is created/managed outside React's render cycle).

- [ ] Absolute-positioned frosted glass pill
- [ ] Tracks position of hovered/focused `[data-link-card]` elements
- [ ] Smooth position/size transition using CSS transitions + Web Animations API for deformation
- [ ] Visual properties (defaults from GlassHighlightControls, to be refined through testing):
  - Border radius: `16px`
  - Fill: theme-aware (inherits hue from theme background, saturation: `0.1`, brightness: `0.45`, opacity: `0.05`)
  - Background: radial gradient overlay for subtle highlight
  - Surface blur: `backdrop-filter: blur(1px) saturate(1.2)`
  - Inner glow intensity: `0.8` (inset box-shadow top/bottom)
  - Border: `0.1px` transparent with inset shadow simulation (glass edge light)
  - Drop shadow: off by default (x: 0, y: 0, blur: 0, opacity: 0)
- [ ] Animation physics (defaults, to be refined):
  - Move duration: `200ms`, easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
  - Fade duration: `200ms`
  - **Stretch**: `0.05` — deformation in direction of movement
  - **Squash**: `0.01` — perpendicular compression
  - **Overshoot**: `0.05` — bounce past target on recovery
  - Recovery duration: `150ms`
  - **Volume preservation**: stretch one axis → squash the other proportionally
- [ ] Edge pull physics (defaults, to be refined):
  - Pull strength: `0.15` — how far pill trails cursor at card edges
  - Edge zone: `0.2` — outer 20% of card responds to pull
  - Pull lerp: `0.12` — interpolation smoothing speed
  - Uses `requestAnimationFrame` lerp loop (stops when settled, delta < 0.3px)
- [ ] Fade in on first appearance, CSS transition on subsequent slides
- [ ] Theme-aware fill: extract hue from theme background via RGB→HSL, apply custom saturation/brightness/opacity
- [ ] Color helpers needed: `parseColorToRGB`, `rgbToHSL`, `hslToRGB`, `getFillColor` (see `GlassHighlight.tsx` and `GlassHighlightControls.tsx` for reference implementations)

---

## Phase 4: Hover Preview System

**Goal:** Show project previews on hover, hide default imagery.

### 4.1 — HoverPreview Component

- [ ] Conditionally renders children when `hoveredId` matches `listenForId`
- [ ] Transition types: fade, scale, slideUp/Down/Left/Right
- [ ] Uses `AnimatePresence` for mount/unmount animation
- [ ] Configurable transition duration

### 4.2 — ThemeImage Component

- [ ] Displays a theme-variant image when no project is hovered
- [ ] Hides (fades out) when any project is hovered
- [ ] 4 variant slots (one per theme) — the original's 5th slot is vestigial and should be dropped
- [ ] Smooth crossfade on theme change

### 4.3 — Integration

- [ ] LinkCard hover → HoverContext → HoverPreview shows matching content
- [ ] LinkCard hover → HoverContext → ThemeImage hides
- [ ] On blur/leave → reverse

---

## Phase 5: Content & Polish

**Goal:** Populate real content, refine interactions, and polish the experience.

### 5.1 — Project Content

- [ ] Define project data structure:
  ```ts
  interface Project {
    id: string
    title: string
    description: string
    href: string
    previewImage?: string
    tags?: string[]
  }
  ```
- [ ] Create project data file (`src/data/projects.ts`)
- [ ] Populate with real projects (content to be provided by Ben)

### 5.2 — Typography & Spacing Polish

- [ ] Audit all text against Manrope baseline: body 18px/120%, headings 36px/120%, regular weight
- [ ] Verify spacing rhythm (4px or 8px base grid)
- [ ] Ensure color contrast meets WCAG AA for all theme/appearance combinations

### 5.3 — Responsive Behavior

- [ ] Test and refine all breakpoints
- [ ] Ensure glass highlight works on touch (tap to select, tap outside to deselect)
- [ ] Disable gravitational pull physics on touch devices
- [ ] Stack layout adjustments for mobile

### 5.4 — Performance

- [ ] Lazy load project preview images
- [ ] Ensure animation loops are cleaned up on unmount
- [ ] Minimize re-renders in context consumers (memoize where appropriate)
- [ ] Audit bundle size — keep it small

### 5.5 — Accessibility

- [ ] Full keyboard navigation
- [ ] Screen reader announcements for theme changes
- [ ] Reduced motion support (`prefers-reduced-motion` disables physics animations, uses simple fades)
- [ ] Focus management on route-like transitions

---

## Phase 6: Deployment

**Goal:** Ship it.

### 6.1 — Build & Optimization

- [ ] Production build with Vite
- [ ] Asset optimization (images, fonts)
- [ ] Generate proper `<head>` metadata (title, description, OG tags, favicon)

### 6.2 — Hosting

- [ ] Deploy to Vercel or Netlify (TBD)
- [ ] Custom domain setup
- [ ] HTTPS, proper caching headers

### 6.3 — Post-Launch

- [ ] Verify all themes and appearance modes work in production
- [ ] Test across browsers (Chrome, Safari, Firefox, Arc)
- [ ] Check Lighthouse scores (aim for 95+ across all categories)
- [ ] Monitor for runtime errors

---

## Component Dependency Graph

```
ThemeContext
├── ThemeToggle
├── ThemeSelector
├── ThemeBackgroundLayer
├── ThemeImage
└── GlassHighlight (theme-aware fill color)

HoverContext
├── LinkCard (emits)
├── HoverPreview (listens)
├── ThemeImage (listens — hides on hover)
└── GlassHighlight (tracks hovered card position)
```

## Migration Priority

The phases are ordered by dependency:

1. **Theme system first** — everything depends on it
2. **Layout & navigation** — structural frame for content
3. **Glass highlight** — the signature interaction, depends on layout + theme
4. **Hover previews** — depends on LinkCard + layout
5. **Content & polish** — final layer
6. **Deployment** — ship when ready

Each phase should produce a working, visually coherent state. No phase should leave the site broken.

---

## Reference Files

The original Framer components are in the repo root:

| File | Maps To | Notes |
|------|---------|-------|
| `Theme_Overrides.tsx` | ThemeContext, ThemeSelector | Central state hub — global state patterns migrate to React Context |
| `ThemeToggle.tsx` | ThemeToggle | Appearance mode toggle (system/light/dark) |
| `ThemeBackgroundLayer.tsx` | ThemeBackgroundLayer | Simple CSS variable consumer |
| `Theme_Image.tsx` | ThemeImage | 4 variants only (5th is vestigial) |
| `GlassHighlight.tsx` | GlassHighlight | Primary reference — edge-pull glass pill with theme-aware fill |
| `SectionHighlight.tsx` | ~~Not migrated~~ | Superseded by GlassHighlight — ignore |
| `GlassHighlightControls.tsx` | Dev tooling (not migrated) | Default config values used as starting spec for GlassHighlight |
| `HighlightControls.tsx` | ~~Not migrated~~ | Dev panel for SectionHighlight — ignore |
| `LinkCard.tsx` | LinkCard | Emits hover/focus to HoverContext |
| `Hover_Preview.tsx` | HoverPreview | Conditional display based on hover ID match |
