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
- [ ] Use `[data-theme="light"]` and `[data-theme="dark"]` selectors on `<html>`
- [ ] Use `[data-color-theme="table|portrait|sky|pizza"]` for color theme selection
- [ ] Extract the original Framer token values from `Theme_Overrides.tsx` as reference

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
- [ ] Typography system: define font stack, scale, and weights
  - Prioritize a clean sans-serif (Inter, or similar)
  - Establish hierarchy: display, heading, body, caption sizes

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

- [ ] Absolute-positioned frosted glass pill
- [ ] Tracks position of hovered/focused `[data-link-card]` elements
- [ ] Smooth position/size transition using Framer Motion or Web Animations API
- [ ] Visual properties:
  - Frosted glass: `backdrop-filter: blur()`, semi-transparent background
  - Border: subtle, theme-aware
  - Box shadow: soft, layered
  - Border radius: configurable
- [ ] Animation physics:
  - **Stretch/squash**: Deform on slide, recover on settle
  - **Overshoot**: Bounce past target, settle back
  - **Gravitational pull**: When cursor nears edge, pill stretches toward adjacent item
  - **Volume preservation**: Stretch one axis → squash the other proportionally
- [ ] Use `requestAnimationFrame` lerp loop for smooth interpolation (as in originals)
- [ ] Fade in/out on enter/leave the card area
- [ ] Theme-aware fill color (derive from current theme accent)

### 3.4 — Unify GlassHighlight + SectionHighlight

- [ ] The originals have two near-identical implementations. Build one component with config props:
  - `pullMode`: `"edge"` (GlassHighlight behavior) | `"neighbor"` (SectionHighlight behavior)
  - `pullBalance`: 0–1 slider between translate vs. stretch displacement
  - `pullStrength`, `pullRange`, `pullCurve`

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
- [ ] Supports different images per color theme
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
- [ ] Populate with real projects (content TBD with Ben)

### 5.2 — Typography & Spacing Polish

- [ ] Audit all text for consistent sizing, weight, and leading
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

| File | Maps To |
|------|---------|
| `Theme_Overrides.tsx` | ThemeContext, ThemeSelector |
| `ThemeToggle.tsx` | ThemeToggle |
| `ThemeBackgroundLayer.tsx` | ThemeBackgroundLayer |
| `Theme_Image.tsx` | ThemeImage |
| `GlassHighlight.tsx` | GlassHighlight (edge pull mode) |
| `SectionHighlight.tsx` | GlassHighlight (neighbor pull mode) |
| `GlassHighlightControls.tsx` | Dev tooling (not migrated — extract config values only) |
| `HighlightControls.tsx` | Dev tooling (not migrated — extract config values only) |
| `LinkCard.tsx` | LinkCard |
| `Hover_Preview.tsx` | HoverPreview |
