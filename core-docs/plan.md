# Portfolio Site — React Migration Plan

## Overview

Recreate Ben's Framer-based design portfolio as a standalone React application. The site should replicate the visual identity and interactive behavior of the original while using idiomatic React patterns, eliminating Framer-specific coupling, and producing a production-ready, deployable artifact.

The site is not a showcase of process — it's a design artifact that demonstrates taste, judgment, and the ability to make complex things feel simple.

> **Design language reference**: All visual and interaction rules are codified in `core-docs/design-language.md`. That document is the source of truth for how things should look, feel, and behave. The visual spec below provides implementation-ready values; the design language provides the principles and rules that govern those values.

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
  1. "Boosting engagement with our in-app weight tracker →" (`projectId: mochi-tracker`)
  2. "Improving billing UX for our core subscriptions model →" (`projectId: cip`)
  3. "AI tooling to automate internal workflows →" (`projectId: uw`) — stub, content TBD

**Subsection B — Previous work:**
- "Before Mochi, I helped different teams make sense of information in different contexts."
- Project links:
  4. "Building a system that builds the system →" (`projectId: uw`)
  5. "Screenless TV: Designing for shared reality →" (`projectId: sony`)
  6. "Framing election misinformation (CSCW 2025) →" (`projectId: cip`)
  7. "Languages ≠ Flags →" (`projectId: cip`)
  8. "Connecting farmers and customers during COVID-19 →" (`projectId: acorn`)

**Subsection C — Side projects:**
- "I spend a lot of time outside of work building things — usually tools that solve my own problems in life and work."
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

## Case Study Routing (completed 2026-02-22)

**Branch:** `byamron/link-case-studies` (merged to main)

React Router integration complete. All 8 case study project cards on the home page link to dedicated case study pages using `CaseStudyLayoutA`.

- [x] Set up React Router (`BrowserRouter` in `main.tsx`, `Routes` in `App.tsx`)
- [x] Convert all 8 markdown case studies → typed `CaseStudy` objects in `case-study-content.ts`
- [x] Create `CaseStudyPage.tsx` route component (slug resolution, back link, edge fades, scroll-to-top)
- [x] Wire routes: `/` → `Layout`, `/project/:slug` → `CaseStudyPage`
- [x] Remove dev `ViewSwitcher` toggle, `CaseStudyPrototype`, unused `CaseStudy.tsx` markdown renderer
- [x] Fix side projects without case studies → `isLink: false` (grey non-interactive text)
- [ ] Add real visuals to case studies (currently using `PlaceholderVisual`)
- [ ] SPA fallback for production deployment (Netlify `_redirects` or equivalent)

---

## Continuous Background Intensity (completed 2026-02-23)

**Branch:** `continuous-intensity-slider` (merged to main)

Converted the background intensity system from discrete 4-step integers (0–3) to a continuous float range (0.0–1.0). `computeBg(accent, mode, t)` uses linear interpolation: `satMult = 1.0 + 1.8 * t`, `lightShift = -10 * t` (light) / `2 * t` (dark). Direct DOM mutations during drag for zero-lag feedback. ARIA reports 0–100 percentage. Keyboard step: 0.05. Old integer localStorage values migrated automatically.

---

## Phase 0: Project Scaffolding

**Goal:** Set up the build toolchain, project structure, and development environment.

### Tasks

- [x] Initialize a Vite + React + TypeScript project
- [x] Configure path aliases (`@/components`, `@/context`, etc.)
- [x] Set up Tailwind CSS v4 (utility-first, CSS custom properties for theming) — `@tailwindcss/vite` plugin, CSS-first config
- [ ] Install Framer Motion for animations
- [ ] Install Phosphor Icons (`@phosphor-icons/react`)
- [x] Import Manrope from Google Fonts — also added Newsreader for Subframe headings
- [x] Set up ESLint + Prettier
- [x] Create folder structure (see below)
- [x] Add `index.html` with proper meta tags (viewport, charset, theme-color)
- [x] Confirm dev server runs cleanly
- [x] Install Subframe component library — 44 components synced to `src/ui/`, theme overrides in `src/styles/theme.css`
- [x] Populate `src/styles/theme.css` with all design tokens from `tokens.md`

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
│   ├── ProjectLink.tsx        # Hoverable link with glass effect + React Router Link
│   ├── AboutSection.tsx       # Bio paragraphs
│   ├── CaseStudyPage.tsx      # Route component: slug → CaseStudyLayoutA
│   ├── CaseStudyLayoutA.tsx   # Two-column sticky case study layout
│   ├── CaseStudySectionText.tsx # Shared text renderer for case study sections
│   ├── PlaceholderVisual.tsx  # Gray placeholder for case study visuals
│   ├── GlassModeSwitcher.tsx  # Glass mode switcher component
│   ├── SidebarThemeControls.tsx # Sidebar with accent picker + mode switcher (rendered in App.tsx, visible on all routes)
│   ├── ModeSwitcher.tsx       # System/Light/Dark toggle
│   ├── AccentPicker.tsx       # 4 color swatches
│   ├── ImageDisplay.tsx       # Cross-fading image container
│   ├── GlassPanel.tsx         # Floating glass config panel (demo feature)
│   └── GlassButton.tsx        # "Glass" trigger button
├── hooks/
│   ├── useTheme.ts
│   └── useHoveredProject.ts
├── data/
│   ├── projects.ts            # Project data: id, title, projectId, href, image
│   ├── case-study-content.ts  # Typed CaseStudy objects + caseStudiesBySlug lookup
│   └── case-studies/          # 8 markdown source files (reference, not used at runtime)
├── assets/
│   └── images/                # Portraits + project previews
└── styles/
    ├── globals.css            # Reset, font import, base styles
    └── theme.css              # CSS custom property definitions
```

### Decisions

- **Vite over Next.js**: Single-page portfolio, no SSR needs. Vite is faster and simpler.
- **Tailwind v4**: Installed via `@tailwindcss/vite` plugin. CSS-first config — no `tailwind.config.js`. Theme tokens defined in `src/styles/theme.css`.
- **Subframe**: Component library (44 components in `src/ui/`). Synced via CLI, theme overridden via CSS cascade. See `history.md` for full integration details.
- **Framer Motion**: Already used in originals. Best-in-class React animation library.
- **Phosphor Icons**: Original uses Phosphor SVGs for mode switcher.

---

## Phase 1: Theme System

**Goal:** Build the foundational theme infrastructure that all other components depend on.

### 1.1 — CSS Custom Properties

- [x] Define all theme tokens in `theme.css`:
  - Dark mode values as `:root` defaults (dark is the default)
  - Light mode values under `[data-theme="dark"]` (dark is default in `:root`, light values override per accent)
  - 4 accent color sets under `[data-accent="table|portrait|sky|pizza"]` for both light and dark modes
  - Each accent defines: `--bg`, `--swatch`, `--accent-hue` (for glass effect HSL math)
- [x] Exact color values per `tokens.md` — all 15 tokens populated
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

- [x] Full-viewport flex row
- [x] Left column: `width: 50%`, `overflow-y: auto`, `padding: 64px 40px`
- [x] Right column: `width: 50%`, `position: fixed`, `top: 0`, `right: 0`, `height: 100vh`, `padding: 64px 16px`
- [ ] Responsive: hide right column below 1200px, left column becomes full width

### 2.2 — Left Column Content

- [x] **HeroTitle**: `<h1>`, 36px Manrope, heading color
- [x] **Sections** with context text + project link groups:
  - Subsection A (Mochi Health) — context + 3 links
  - Subsection B (Previous work) — context + 5 links
  - Subsection C (Side projects) — context + 2 links + 1 non-link text
- [x] **AboutSection**: 3 paragraphs, body text styling
- [ ] **ThemeControls**: footer row
- [x] Spacing: 80px → 64px → 40px → 24px hierarchy (see Visual Spec)

### 2.3 — Right Column (ImageDisplay)

- [x] Fixed position container
- [x] Image area: 528×720px, `border-radius: 32px`, `object-fit: cover`
- [x] Default state: shows accent-color-associated portrait (placeholder — table only)
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
- [x] Create `src/data/projects.ts` with all 11 projects organized by section
- [ ] Create image map: `projectId → preview image path`
- [ ] Create accent map: `accentColor → default portrait image path`

---

## Phase 3: Glass Highlight & Hover Interactions

**Goal:** Build the signature glass hover effect on project links and the image swap behavior.

### 3.1 — HoverContext

- [x] Create `HoverContext` with:
  - `hoveredProjectId`: `string | null`
  - `setHoveredProjectId(id | null)`: Updates state
- [x] Consumed by: ProjectLink (emits), ImageDisplay (swaps image), GlassHighlight (optional)

### 3.2 — ProjectLink Component

- [x] Semantic `<a>` tag with `data-link-card` attribute
- [x] On hover/focus: sets `hoveredProjectId` in context
- [x] On blur/leave: clears `hoveredProjectId`
- [x] Styling:
  - Link card padding: `24px 16px` with `margin: 0 -16px` (text stays aligned, hover area is generous)
  - `width: fit-content` — card hugs text, pill hugs card
  - `border-radius: 16px`, `border: 0.1px solid transparent`
  - 18px Manrope, line-height 1.4, heading color
  - Subtle underline: `text-decoration: underline`, `text-decoration-color: var(--text-underline)`
  - Arrow `→` appended for link items
- [x] CSS hover fallback: full glass recipe in globals.css (radial gradient, 6 inset shadows, backdrop blur), disabled when JS pill is active
- [x] Non-link variant: `<span>`, no `data-link-card`, no arrow, muted color
- [x] Accessible: focus states, keyboard navigation, focus-visible ring

### 3.3 — GlassHighlight (Animated Pill)

- [x] Single absolutely-positioned pill on LeftColumn container
- [x] One unified RAF lerp loop drives ALL pill movement (card-to-card slides + gravitational pull)
  - `lerpSpeed: 0.15` — exponential decay produces smooth deceleration
  - No CSS transitions on transform/width/height — RAF owns all positioning
  - Stretch/squash deformation via Web Animations API (`composite: 'add'`)
  - Gravitational pull: `pow(t, 1.5)` ramp, volume preservation, 0.25 max stretch, 0.15 max translate
  - Smart lifecycle: stops on settle (0.3px threshold), restarts on mousemove
- [x] Glass visual: 6-layer recipe (fill, radial highlight, backdrop blur, inner glow, border, shape)
- [x] Theme reactivity via MutationObserver on `data-accent`/`data-theme`
- [x] Reduced motion: `lerpSpeed: 1` (instant snap), all deformation/pull disabled

### 3.4 — Image Swap on Hover

- [ ] When `hoveredProjectId` is set → find matching `projectId` → cross-fade to that preview image
- [ ] When `hoveredProjectId` is null → cross-fade back to accent default portrait
- [ ] Both transitions simultaneous: glass highlight appears AND image swaps at the same time
- [ ] Stack all images absolutely, toggle opacity

### 3.5 — Anchor Transitions (Home ↔ Case Study) — In Progress

- [ ] Smooth size/scale transition for hover preview visuals when navigating between home page and case study pages
- The View Transition API (`viewTransitionName: 'project-hero'`) handles the shared-element morph, but the element changes size between the two contexts (e.g., `contain`-fit preview on home vs. case study hero), causing an abrupt visual jump
- [ ] Investigate interpolation of `object-fit` / bounding box during the view transition
- [ ] Consider matching aspect ratios or using `cover` on both ends to smooth the morph
- [ ] Test across all preview types (video, lottie, static image)

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
- [ ] All slider ranges, defaults, and parameter descriptions are documented in `core-docs/design-language.md` under "Complete default configuration"
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

## Reference

The original Framer components have been removed. All visual and interaction specifications are now fully documented in:

- `core-docs/design-language.md` — glass formulas, animation physics, config defaults, theme-to-image mapping, easing presets
- `tokens.md` — all HSL color token values
