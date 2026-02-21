# Portfolio Site — React Migration Plan

## Overview

Recreate Ben's Framer-based design portfolio as a standalone React application. The site should replicate the visual identity and interactive behavior of the original while using idiomatic React patterns, eliminating Framer-specific coupling, and producing a production-ready, deployable artifact.

The site is not a showcase of process — it's a design artifact that demonstrates taste, judgment, and the ability to make complex things feel simple.

---

## Visual Spec (from live site)

These are the concrete values extracted from the production Framer site. All phases reference these.

### Layout

- Root: `display: flex; flex-direction: row;` filling viewport, `min-height: 100vh`
- **Left column**: `width: 50%`, scrollable, `padding: 64px 40px`
  - Inner content: vertical flex, `gap: 80px` between main content and footer controls
  - Content block: `gap: 64px` between title area and section list
  - Between sections: `gap: 40px`
  - Between project links within a section: `gap: 24px`
- **Right column**: `width: 50%`, `position: fixed`, `top: 0`, `right: 0`, `height: 100vh`, `padding: 64px 16px`
  - Image container: `528×720px`, `border-radius: 32px`, `object-fit: cover`
- **Responsive breakpoints**:
  - Desktop: >= 1200px — full two-column layout
  - Tablet: 810px–1199px — right column hidden, single column
  - Mobile: < 810px — single column

### Typography

- **Font**: Manrope (Google Fonts), weight 400 throughout, fallback sans-serif
- **Title**: 36px, weight 400, line-height 1.2, `var(--text-heading)` color
- **Body/description**: 18px, weight 400, line-height 1.2, `var(--text-body)` muted color
- **Project links**: 18px, weight 400, line-height 1.4, bright text color, subtle underline `rgba(238, 238, 238, 0.2)`
- **Arrow character**: `→` (Unicode, not SVG)
- Use semantic HTML: `<h1>` for title, `<p>` for body (original uses all `<p>`)

### Colors

**Dark mode (default):**

| Token | Value |
|-------|-------|
| `--bg` | `rgb(36, 31, 25)` — warm dark brown |
| `--text-heading` | `rgb(252, 252, 252)` — near white |
| `--text-body` | `rgb(190, 190, 193)` — muted gray |
| `--link-underline` | `rgba(238, 238, 238, 0.2)` |
| `--surface` | `rgb(26, 26, 26)` — panel background |
| `--border` | `rgb(51, 51, 51)` — panel border |

**Light mode:**

| Token | Value |
|-------|-------|
| `--bg` | `rgb(236, 232, 228)` — warm cream |
| `--text-heading` | `rgb(17, 17, 17)` — near black |
| `--text-body` | `rgb(112, 112, 117)` — medium gray |

**4 accent colors:**

| Name | RGB | Default image |
|------|-----|---------------|
| table (default) | `rgb(194, 180, 130)` | Portrait (bench, green hat) |
| portrait | TBD — first swatch | Same or similar portrait |
| sky | `rgb(140, 186, 217)` | Blue sky portrait (sunglasses) |
| pizza | `rgb(212, 139, 115)` | Night/pizza shop portrait |

### Glass hover effect (on project links)

```css
padding: 24px 16px;
border-radius: 16px;
background: hsla(var(--accent-hue), 10%, 45%, 0.05);
backdrop-filter: blur(1px);
box-shadow: inset 0 0 20px rgba(255, 255, 255, calc(0.8 * 0.1));
border: 0.1px solid hsla(var(--accent-hue), 20%, 50%, 0.2);
transition: all 0.3s ease;
```

### Image cross-fade

```css
position: absolute;
inset: 0;
border-radius: 32px;
object-fit: cover;
transition: opacity 0.4s ease;
```

---

## Content Structure (from live site)

### Section 1: Hero

> "Ben Yamron is a product designer"

36px, heading color.

### Section 2: Introduction + Project Links

**Subsection A — Current role (Mochi Health):**
- "I focus on making complex information actionable within products and organizations."
- "Currently leading patient experience design at [Mochi Health](https://joinmochi.com/)." (inline link)
- Project links:
  1. "Building a competitive top of funnel experience →" (`projectId: uw`)
  2. "Boosting engagement with our in-app weight tracker →" (`projectId: sony`)
  3. "Improving billing UX for our core subscriptions model →" (`projectId: cip`)

**Subsection B — Previous work:**
- "Before Mochi, I helped different teams make sense of information in different contexts."
- Project links:
  4. "Building a system that builds the system →" (`projectId: uw`)
  5. "Screenless TV: Designing for shared reality →" (`projectId: sony`)
  6. "Framing election misinformation (CSCW 2025) →" (`projectId: cip`)
  7. "Languages ≠ Flags →" (`projectId: cip`)
  8. "Connecting farmers and customers during COVID-19 →" (`projectId: acorn`)

**Subsection C — Side projects:**
- "On the side, I design and build tools that solve my own problems in life and work."
- Project links:
  9. "A todo list that keeps tasks perfectly prioritized →" (`projectId: uw`)
  10. "Detecting manipulative language on the web →" (`projectId: cip`)
  11. "Currently exploring new patterns for AI search with personal context (coming soon)" (`projectId: uw`) — **not a link**, no arrow, no hover behavior

### Section 3: About

- "I like working through ambiguous problems, leading 0-to-1 efforts, doing product strategy work, and getting in the weeds with engineers."
- "I feel fulfilled working on experiences related to health, community, and other human stuff."
- "You can say hi if you see me running around SF, or you can [contact me](mailto:ben.yamron@icloud.com)."

### Section 4: Footer Controls

Row with `gap: 64px`, `padding: 0 16px`:
- **Mode switcher** (120×40px): 3 icon buttons (40×40px each) — System (monitor), Light (sun), Dark (moon). Phosphor Icons, 256×256 viewBox SVGs. Active state variant.
- **Accent picker** (144×24px): 4 circular swatches (24×24px, `border-radius: 12px`). Active swatch shows outline ring.

---

## Phase 0: Project Scaffolding

**Goal:** Set up the build toolchain, project structure, and development environment.

### Tasks

- [ ] Initialize a Vite + React + TypeScript project
- [ ] Configure path aliases (`@/components`, `@/context`, etc.)
- [ ] Set up Tailwind CSS v4 (utility-first, CSS custom properties for theming)
- [ ] Install Framer Motion for animations
- [ ] Install Phosphor Icons (`@phosphor-icons/react`)
- [ ] Import Manrope from Google Fonts
- [ ] Set up ESLint + Prettier
- [ ] Create folder structure (see below)
- [ ] Add `index.html` with proper meta tags (viewport, charset, theme-color)
- [ ] Confirm dev server runs cleanly

### Project Structure

```
src/
├── App.tsx
├── main.tsx
├── contexts/
│   ├── ThemeContext.tsx       # Mode + accent color state
│   └── HoverContext.tsx       # Hovered project ID
├── components/
│   ├── Layout.tsx             # Two-column flex layout
│   ├── LeftColumn.tsx         # Scrollable content
│   ├── RightColumn.tsx        # Fixed image display
│   ├── HeroTitle.tsx          # "Ben Yamron is a product designer"
│   ├── Section.tsx            # Context text + project link group
│   ├── ProjectLink.tsx        # Hoverable link with glass effect
│   ├── AboutSection.tsx       # Bio paragraphs
│   ├── ThemeControls.tsx      # Footer: mode switcher + accent picker
│   ├── ModeSwitcher.tsx       # System/Light/Dark toggle
│   ├── AccentPicker.tsx       # 4 color swatches
│   ├── ImageDisplay.tsx       # Cross-fading image container
│   ├── GlassPanel.tsx         # Floating glass config panel (demo feature)
│   └── GlassButton.tsx        # "Glass" trigger button
├── hooks/
│   ├── useTheme.ts
│   └── useHoveredProject.ts
├── data/
│   └── projects.ts            # Project data: id, title, projectId, href, image
├── assets/
│   └── images/                # Portraits + project previews
└── styles/
    ├── globals.css            # Reset, font import, base styles
    └── theme.css              # CSS custom property definitions
```

### Decisions

- **Vite over Next.js**: Single-page portfolio, no SSR needs. Vite is faster and simpler.
- **Tailwind v4**: Utility-first for layout, CSS custom properties for theme tokens.
- **Framer Motion**: Already used in originals. Best-in-class React animation library.
- **Phosphor Icons**: Original uses Phosphor SVGs for mode switcher.

---

## Phase 1: Theme System

**Goal:** Build the foundational theme infrastructure that all other components depend on.

### 1.1 — CSS Custom Properties

- [ ] Define all theme tokens in `theme.css`:
  - Dark mode values as `:root` defaults (dark is the default)
  - Light mode values under `[data-theme="light"]`
  - 4 accent color sets under `[data-accent="table|portrait|sky|pizza"]`
  - Each accent defines: `--accent`, `--accent-hue` (for glass effect HSL math)
- [ ] Exact color values per the Visual Spec above
- [ ] Smooth transitions: `transition: background-color 0.3s, color 0.3s` on body

### 1.2 — ThemeContext

- [ ] Create `ThemeContext` with:
  - `accentColor`: `"table" | "portrait" | "sky" | "pizza"`
  - `appearanceMode`: `"system" | "light" | "dark"`
  - `resolvedAppearance`: `"light" | "dark"`
  - `setAccentColor(color)`: Updates accent, sets `data-accent` on `<html>`
  - `setAppearanceMode(mode)`: Updates mode, persists to localStorage, sets `data-theme` on `<html>`
- [ ] On mount: read localStorage, detect system preference via `matchMedia`
- [ ] Listen for `prefers-color-scheme` changes
- [ ] Update `<meta name="theme-color">` for browser chrome (important for Arc)
- [ ] Default: dark mode, table accent

### 1.3 — ModeSwitcher Component

- [ ] 120×40px container, 3 buttons at 40×40px each
- [ ] Phosphor icons: Monitor (system), Sun (light), Moon (dark)
- [ ] Active button gets "Active" variant styling
- [ ] Keyboard accessible

### 1.4 — AccentPicker Component

- [ ] 144×24px container, 4 circular swatches at 24×24px
- [ ] Each swatch filled with its accent RGB color
- [ ] Active swatch shows outline ring indicator
- [ ] Clicking switches accent AND swaps the default right-column portrait

### 1.5 — ThemeControls (Footer)

- [ ] Row layout: `gap: 64px`, `padding: 0 16px`
- [ ] Contains ModeSwitcher + AccentPicker
- [ ] Positioned at bottom of left column

---

## Phase 2: Layout & Content

**Goal:** Build the two-column page structure with all real content.

### 2.1 — Layout Component

- [ ] Full-viewport flex row
- [ ] Left column: `width: 50%`, `overflow-y: auto`, `padding: 64px 40px`
- [ ] Right column: `width: 50%`, `position: fixed`, `top: 0`, `right: 0`, `height: 100vh`, `padding: 64px 16px`
- [ ] Responsive: hide right column below 1200px, left column becomes full width

### 2.2 — Left Column Content

- [ ] **HeroTitle**: `<h1>`, 36px Manrope, heading color
- [ ] **Sections** with context text + project link groups:
  - Subsection A (Mochi Health) — context + 3 links
  - Subsection B (Previous work) — context + 5 links
  - Subsection C (Side projects) — context + 2 links + 1 non-link text
- [ ] **AboutSection**: 3 paragraphs, body text styling
- [ ] **ThemeControls**: footer row
- [ ] Spacing: 80px → 64px → 40px → 24px hierarchy (see Visual Spec)

### 2.3 — Right Column (ImageDisplay)

- [ ] Fixed position container
- [ ] Image area: 528×720px, `border-radius: 32px`, `object-fit: cover`
- [ ] Default state: shows accent-color-associated portrait
- [ ] Hover state: cross-fades to project-specific preview image
- [ ] Uses opacity-based cross-fade (`transition: opacity 0.4s ease`)

### 2.4 — Project Data

- [ ] Define data structure:
  ```ts
  interface Project {
    id: string           // unique identifier
    title: string        // link text (without arrow)
    projectId: string    // maps to preview image: "uw" | "sony" | "cip" | "acorn"
    href: string         // destination URL
    isLink: boolean      // false for "coming soon" items
  }

  interface Section {
    context: string      // intro paragraph(s) before links
    projects: Project[]
  }
  ```
- [ ] Create `src/data/projects.ts` with all 11 projects organized by section
- [ ] Create image map: `projectId → preview image path`
- [ ] Create accent map: `accentColor → default portrait image path`

---

## Phase 3: Glass Highlight & Hover Interactions

**Goal:** Build the signature glass hover effect on project links and the image swap behavior.

### 3.1 — HoverContext

- [ ] Create `HoverContext` with:
  - `hoveredProjectId`: `string | null`
  - `setHoveredProjectId(id | null)`: Updates state
- [ ] Consumed by: ProjectLink (emits), ImageDisplay (swaps image), GlassHighlight (optional)

### 3.2 — ProjectLink Component

- [ ] Semantic `<a>` tag with `data-link-card` attribute
- [ ] On hover/focus: sets `hoveredProjectId` in context
- [ ] On blur/leave: clears `hoveredProjectId`
- [ ] Styling:
  - `padding: 24px 16px`
  - `border-radius: 16px`
  - 18px Manrope, line-height 1.4, heading color
  - Subtle underline: `text-decoration: underline`, `text-decoration-color: rgba(238, 238, 238, 0.2)`
  - Arrow `→` appended for link items
- [ ] Glass effect on hover (CSS-only approach first):
  - `background: hsla(var(--accent-hue), 10%, 45%, 0.05)`
  - `backdrop-filter: blur(1px)`
  - `box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.08)`
  - `border: 0.1px solid hsla(var(--accent-hue), 20%, 50%, 0.2)`
  - `transition: all 0.3s ease`
- [ ] Non-link variant: no `<a>`, no arrow, no hover effect (for "coming soon" item)
- [ ] Accessible: focus states, keyboard navigation

### 3.3 — GlassHighlight (Animated Pill) — Enhancement

- [ ] **Start with CSS-only hover** (3.2 above) — this matches the visual spec
- [ ] Optionally layer the animated sliding pill from the Framer originals on top:
  - Absolute-positioned element that lerps between hovered cards
  - Stretch/squash deformation during slide
  - Gravitational pull toward adjacent items
  - Volume preservation physics
  - `requestAnimationFrame` lerp loop
- [ ] This is an enhancement, not a blocker. Ship CSS hover first, add physics later.

### 3.4 — Image Swap on Hover

- [ ] When `hoveredProjectId` is set → find matching `projectId` → cross-fade to that preview image
- [ ] When `hoveredProjectId` is null → cross-fade back to accent default portrait
- [ ] Both transitions simultaneous: glass highlight appears AND image swaps at the same time
- [ ] Stack all images absolutely, toggle opacity

---

## Phase 4: Glass Effect Panel (Demo Feature)

**Goal:** Replicate the floating glass configurator panel — a showcase of the hover effect's tunability.

### 4.1 — GlassButton

- [ ] Small button fixed at bottom-right of the image area
- [ ] Label: "Glass"
- [ ] Toggles GlassPanel visibility

### 4.2 — GlassPanel

- [ ] Floating panel: 260×522px
- [ ] Dark background: `rgb(26, 26, 26)`, `border: 1px solid rgb(51, 51, 51)`, `border-radius: 14px`
- [ ] Shadow: `rgba(0, 0, 0, 0.5) 0px 8px 40px`
- [ ] Close button (×) at top right
- [ ] 3 tabs: **Fill**, **Shadow**, **Motion**
- [ ] Fill tab sliders:
  - Saturation: 0–1, step 0.01, default 0.10
  - Brightness: 0–1, step 0.01, default 0.45
  - Opacity: 0–0.5, step 0.01, default 0.05
  - Blur: 0–4px, step 0.1, default 1.00
  - Inner Glow: 0–1, step 0.01, default 0.80
  - Border Width: 0–2px, step 0.1, default 0.10
  - Border Radius: 0–40px, step 1, default 16
- [ ] Sliders update the glass effect on project links in real time
- [ ] "Copy Config" button at bottom — copies current config as code snippet
- [ ] State is local to the panel, passed to ProjectLink via context or CSS variables

---

## Phase 5: Polish & Production

**Goal:** Refine every detail, ensure cross-browser/device quality, and prepare for deployment.

### 5.1 — Responsive Behavior

- [ ] Below 1200px: hide right column, left column full width
- [ ] Below 810px: adjust padding, font sizes if needed
- [ ] Glass highlight works on touch: tap to select, tap outside to deselect
- [ ] Image display handled differently on mobile (inline or hidden)

### 5.2 — Accessibility

- [ ] Semantic HTML: `<h1>`, `<main>`, `<nav>`, `<footer>`, `<section>`
- [ ] Full keyboard navigation through all project links
- [ ] Focus visible styles that don't conflict with glass effect
- [ ] `prefers-reduced-motion`: disable glass physics, use simple opacity transitions
- [ ] Color contrast: verify WCAG AA for all theme × mode combinations
- [ ] Screen reader: announce theme changes, image swaps as `aria-live` regions

### 5.3 — Performance

- [ ] Lazy load project preview images (only load on hover or preload on idle)
- [ ] Clean up RAF loops on unmount
- [ ] Memoize context values to prevent unnecessary re-renders
- [ ] Bundle size audit — target < 100KB JS gzipped (excluding images)

### 5.4 — Assets Required

- [ ] 4 hero portrait images (one per accent, ~528×792px native)
- [ ] ~11 project preview images (one per project link, displayed at 528×720px)
- [ ] 3 Phosphor SVG icons (monitor, sun, moon)
- [ ] Manrope font (Google Fonts)
- [ ] Favicon + OG image

### 5.5 — Cross-Browser

- [ ] Test: Chrome, Safari, Firefox, Arc
- [ ] Verify `backdrop-filter` support (Safari needs `-webkit-` prefix)
- [ ] Verify smooth scrolling behavior on left column
- [ ] Meta theme-color for Arc/Dia browser chrome

---

## Phase 6: Deployment

**Goal:** Ship it.

### 6.1 — Build & Meta

- [ ] Production build with Vite
- [ ] Proper `<head>`: title, description, OG tags, favicon, canonical URL
- [ ] Font preload for Manrope
- [ ] Image optimization (WebP/AVIF with fallback)

### 6.2 — Hosting

- [ ] Deploy to Vercel (or Netlify)
- [ ] Custom domain setup
- [ ] HTTPS, caching headers, compression

### 6.3 — Post-Launch

- [ ] Verify all 4 accents × 3 modes work correctly
- [ ] Lighthouse: target 95+ across all categories
- [ ] Test on real devices (phone, tablet)

---

## Component Dependency Graph

```
ThemeContext
├── ModeSwitcher
├── AccentPicker
├── ImageDisplay (default portrait per accent)
├── ProjectLink (glass effect uses --accent-hue)
└── <html> attributes (data-theme, data-accent)

HoverContext
├── ProjectLink (emits hoveredProjectId)
├── ImageDisplay (swaps image on hover)
└── GlassHighlight (optional — tracks hovered card position)

GlassPanel (local state)
└── ProjectLink (overrides glass CSS variables in real-time)
```

## Phase Priority

1. **Phase 0: Scaffolding** — toolchain, structure
2. **Phase 1: Theme system** — everything depends on it
3. **Phase 2: Layout & content** — the page with real text and images
4. **Phase 3: Glass highlight & hover** — the signature interaction
5. **Phase 4: Glass panel** — demo feature, nice-to-have
6. **Phase 5: Polish** — responsive, a11y, performance
7. **Phase 6: Deployment** — ship

Each phase produces a working, visually coherent state. No phase leaves the site broken.

---

## Reference Files

The original Framer components are in the repo root:

| File | Maps To | Notes |
|------|---------|-------|
| `Theme_Overrides.tsx` | ThemeContext, AccentPicker | Central state hub — global state patterns migrate to React Context |
| `ThemeToggle.tsx` | ModeSwitcher | Appearance mode toggle (system/light/dark) |
| `ThemeBackgroundLayer.tsx` | Background via CSS custom properties | Simple CSS variable consumer |
| `Theme_Image.tsx` | ImageDisplay (accent-variant portraits) | 4 variants only (5th is vestigial) |
| `GlassHighlight.tsx` | GlassHighlight / ProjectLink hover | Primary reference — edge-pull glass pill with theme-aware fill |
| `SectionHighlight.tsx` | ~~Not migrated~~ | Superseded by GlassHighlight — ignore |
| `GlassHighlightControls.tsx` | GlassPanel | Default config values used as starting spec |
| `HighlightControls.tsx` | ~~Not migrated~~ | Dev panel for SectionHighlight — ignore |
| `LinkCard.tsx` | ProjectLink | Emits hover/focus to HoverContext |
| `Hover_Preview.tsx` | ImageDisplay (hover-triggered swap) | Conditional display based on hover ID match |

See also: `tokens.md` in the repo root for all extracted color token values (HSL).
