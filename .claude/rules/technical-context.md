---
paths:
  - "src/**"
---

# Technical Context

This is a React migration of a Framer-based portfolio site. All original Framer component behavior has been extracted into `core-docs/design-language.md` — the reference `.tsx` files have been removed. The React rebuild replicates the visual and interactive behavior using idiomatic React patterns.

## Tailwind Integration

The project uses **Tailwind CSS v4** for styling:

- **Tailwind v4** uses CSS-first config via `@tailwindcss/vite` plugin. No `tailwind.config.js`.
- **CSS import order** in `src/styles/globals.css`: `tailwindcss` → `./theme.css` (portfolio tokens).
- Subframe was previously used as a component library but has been removed. All UI is now built with portfolio-specific components in `src/components/`.

## Key systems to replicate:

- **Theme system**: 4 accent colors (table, portrait, sky, pizza) × 3 appearance modes (system/light/dark). CSS custom properties drive all color changes. Dark mode default. React Context + CSS variables replace Framer's `window.__themeState`. All token values (text, background, swatch) are documented in `tokens.md`.
- **Glass highlight on hover**: Project links get a frosted-glass background on hover — `backdrop-filter: blur(1px)`, semi-transparent accent-hued fill, inner glow, subtle border, `border-radius: 16px`. CSS-first implementation, with optional physics-based animated pill as enhancement. All formulas, defaults, and slider ranges documented in `core-docs/design-language.md`.
- **Image swap on hover**: Hovering a project link cross-fades the right-column image to a project-specific preview. Leaving resets to the accent-color default portrait. Both transitions (glass + image) happen simultaneously. Supports 4 image variants (one per theme). Theme-to-image mapping documented in `core-docs/design-language.md`.
- **Appearance toggle**: 3-mode toggle (system/light/dark) with Phosphor Icons (monitor/sun/moon), localStorage persistence (`"appearanceMode"` key), system preference detection, and browser meta theme-color integration.
- **Glass hover style**: The pill uses the "frost" mode — blur + accent tint + thin border, mode-aware shading. Config defaults and slider ranges documented in `core-docs/design-language.md`.

## Typography:

- **Fonts**: Literata (serif, 300) for headings/narrative, Onest (sans, 400) for body/links
- **Tokenized**: All sizes use CSS custom properties (`--text-size-*`) defined in `src/styles/theme.css`
- **Scale**: display 48px → title 36px → section-heading 28px → narrative 22px → body 18px → summary 15px → caption 14px → small 13px
- **Responsive**: Sizes scale down proportionally in narrower two-column tiers (1024–1199px, 900–1023px), reset to full at <900px single column
- See `core-docs/design-language.md` § Typography for full token table and responsive scaling values

## Architecture principles:

- Replace all `window.__*` global state with React Context providers
- Use CSS custom properties for theming (no runtime style computation)
- Prefer Framer Motion for animations (already used in originals)
- Keep components small and composable
- No unnecessary abstractions — only extract when reuse is real
- Mobile-first responsive design
- Accessible by default — see **Accessibility Standards** below

## Refactoring safety (CRITICAL — read before modifying any component):

When refactoring a component — especially splitting it into multiple rendering paths (e.g., narrow/wide, mobile/desktop) — **recent fixes get silently lost**. This has caused the same bug to ship to production three times.

**Why it happens:** When you rewrite sections of a file, you may write new code with old/default values instead of carrying forward the values currently in the file. Git merges this cleanly because the refactor replaces the relevant lines entirely — there's no conflict to flag the regression. Parallel worktrees make this worse because agents don't see each other's recent changes.

**Rules:**
1. **Before refactoring any file**, check `git log --oneline -10 -- <file>` for recent fixes. Understand what those fixes changed and verify your refactored code preserves them.
2. **Never duplicate style values across rendering paths.** Extract shared styles into constants at the top of the file (see `CaseStudyLayoutA.tsx` for the pattern). If two code paths need the same font size, spacing, or color, they must reference the same constant — not have the value typed twice.
3. **After refactoring**, diff your changes against the pre-refactor file and specifically check that no recently-fixed values reverted to old defaults.
4. **After any direct-to-main hotfix**, immediately propagate the fix to `next-update`. If only one branch has the fix, the next merge will revert it.

## Accessibility Standards

All development must adhere to WCAG 2.1 AA as a baseline. This is not a polish phase concern — it is a default requirement from the first line of code.

- **Semantic HTML**: Use correct landmark elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`) and heading hierarchy (`<h1>` through `<h3>`). Never use `<div>` where a semantic element exists.
- **Keyboard navigation**: All interactive elements must be reachable and operable via keyboard. Focus order must follow visual reading order. Custom interactive elements need explicit `tabindex`, `role`, and keyboard event handlers.
- **Focus visibility**: All focusable elements must show a visible focus indicator. Glass hover effects must not suppress or obscure focus rings. Use `:focus-visible` to avoid showing focus rings on mouse click.
- **Color contrast**: All text must meet WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text) across every theme × mode combination (4 accents × 2 appearances = 8 states). Verify contrast when choosing or changing colors.
- **ARIA**: Use `aria-label` on icon-only buttons (mode switcher, accent picker). Use `aria-live="polite"` regions to announce dynamic changes (theme switches, image swaps). Use `aria-current` or `aria-pressed` for active toggle states.
- **Reduced motion**: Respect `prefers-reduced-motion: reduce`. Disable physics-based animations, cross-fade transitions, and glass pill motion. Fall back to instant or minimal opacity changes.
- **Image accessibility**: All images must have meaningful `alt` text (hero portraits, project previews). Decorative images use `alt=""`. Image cross-fades should not cause accessibility tree churn.
- **Link semantics**: All project links must be `<a>` elements with descriptive text. "Coming soon" non-link items must not be focusable as links.
- **Touch targets**: Interactive elements must be at least 44×44px for touch (mode switcher buttons, accent swatches).

## Visual reference:

- **Layout**: Two-column flex — left 50% scrollable (`padding: 64px 40px`), right 50% fixed (`padding: 64px 16px`)
- **Image container**: 528×720px, `border-radius: 32px`, `object-fit: cover`
- **Spacing hierarchy**: 80px (content↔footer) → 64px (title↔sections) → 40px (between sections) → 24px (between links)
- **Responsive**: Two-column layout from 900px+, right column hidden below 900px. Spacing and typography scale across 4 tiers (see design-language.md).

## Dev panels policy:

Dev control panels (e.g. font comparison panels, glass mode switchers, layout tuners) must **never** be merged into `main`. They are useful on feature branches for experimentation, but must be removed before merging. When preparing a branch for merge, Claude should check for and flag any dev panels that need to be stripped out — including their component files, imports, renders, and any hook/CSS plumbing that exists solely to support them.
