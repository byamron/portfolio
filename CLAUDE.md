# CLAUDE.md — Portfolio Site

## About Ben

Ben is a senior product designer who works at the intersection of complex information and human decision-making — across health tech, AI, and tools for critical thinking. He thrives in fast-moving, ambiguous environments where design, strategy, and engineering blur together, and he's at his best when turning messy, high-stakes problems into clear, actionable experiences.

## Design Philosophy

The site should feel like a design artifact in itself — clean, opinionated, and structurally confident in a way that signals senior-level taste before anyone reads a word.

Architecture should lead with outcomes, decisions, and strategic thinking rather than process documentation, making it immediately clear that this is someone who shapes what gets built and why, not someone proving they can push pixels.

The entire experience should embody that core value proposition of making complex information feel simple and actionable: effortless navigation, clear hierarchy, intentional restraint, nothing decorative without purpose.

It should read as authored and specific — built for an audience of design-mature companies like Figma, Anthropic, and Stripe — rather than trying to appeal to everyone.

The vibe is quiet confidence and substance over spectacle, closer to nelson.co than a Dribbble portfolio. Someone should land on it and within seconds think: this person has a point of view, ships real work, and I'd trust their judgment on my team.

## Core Documentation

All project documentation lives in `core-docs/`. **You must review and proactively update these files as part of your workflow.**

| File | Purpose | When to update |
|------|---------|----------------|
| `core-docs/design-language.md` | Visual & interaction rules, principles, anti-patterns | When design decisions are made, patterns are established, or visual rules change |
| `core-docs/plan.md` | Migration plan, visual spec, phase breakdown | When scope changes, phases complete, or new info emerges |
| `core-docs/workflow.md` | Development process (plan → build → review → feedback loop) | When the process itself needs refinement |
| `core-docs/feedback.md` | Negative feedback and lessons learned | After any rejected implementation or mistake |
| `core-docs/history.md` | Completed work and decision log (reverse chronological) | After every successful implementation |
| `core-docs/initial-implementation.md` | React component architecture: Framer→React mapping, contexts, decisions | When architectural approach changes |
| `tokens.md` | Design tokens: all theme colors (text, background, swatch) with HSL values | When color values change or new tokens are added |

### Rules for core docs:

- **Before starting any work**: Read `core-docs/feedback.md` and `core-docs/history.md` to avoid repeating mistakes and understand prior decisions.
- **Before any design/implementation work**: Read `core-docs/design-language.md` to ensure consistency with the site's visual and interaction rules. Use the coherence checklist before considering work complete.
- **Before planning**: Read `core-docs/plan.md` to understand the current state and what's next.
- **Follow the workflow**: Read and follow `core-docs/workflow.md` for the full development process.
- **After completing work**: Update `core-docs/history.md` with what was done, decisions made, and technical details (branch, date).
- **After negative feedback**: Record the lesson in `core-docs/feedback.md` before re-attempting.
- **When the plan evolves**: Update `core-docs/plan.md` — mark completed phases, add new information, adjust scope. The plan is a living document, not a snapshot.
- **Proactive updates**: If you notice a doc is stale, inaccurate, or missing useful context, update it. Don't wait to be asked.

## Technical Context

This is a React migration of a Framer-based portfolio site. The original Framer components are preserved in the repo root as reference (`.tsx` files). The React rebuild should replicate the visual and interactive behavior of the originals while using idiomatic React patterns.

### Key systems to replicate:

- **Theme system**: 4 accent colors (table, portrait, sky, pizza) × 3 appearance modes (system/light/dark). CSS custom properties drive all color changes. Dark mode default. The original uses `window.__themeState` with a listener pattern — migrate to React Context + CSS variables. All token values (text, background, swatch) are documented in `tokens.md`.
- **Glass highlight on hover**: Project links get a frosted-glass background on hover — `backdrop-filter: blur(1px)`, semi-transparent accent-hued fill, inner glow, subtle border, `border-radius: 16px`. CSS-first implementation, with optional physics-based animated pill as enhancement. Only `GlassHighlight.tsx` is needed as reference — `SectionHighlight.tsx` was an earlier iteration and is superseded. Default config values from `GlassHighlightControls.tsx` will be refined through testing.
- **Image swap on hover**: Hovering a project link cross-fades the right-column image to a project-specific preview. Leaving resets to the accent-color default portrait. Both transitions (glass + image) happen simultaneously. Supports 4 image variants (one per theme — the 5th variant slot in `Theme_Image.tsx` is vestigial). Migrate from `window.__hoverState` to React Context.
- **Appearance toggle**: 3-mode toggle (system/light/dark) with Phosphor Icons (monitor/sun/moon), localStorage persistence, system preference detection, and browser meta theme-color integration.
- **Glass configurator panel**: Floating demo panel that tunes the glass hover effect in real-time with sliders. 3 tabs (Fill/Shadow/Motion). Showcase feature.

### Typography:

- **Font**: Manrope (Google Fonts), weight 400 throughout, sans-serif fallback
- **Title/Headings**: 36px, weight 400, line-height 1.2
- **Body/description**: 18px, weight 400, line-height 1.2
- **Project links**: 18px, weight 400, line-height 1.4
- Nuances (scale, secondary sizes, weights) to be refined later

### Architecture principles:

- Replace all `window.__*` global state with React Context providers
- Use CSS custom properties for theming (no runtime style computation)
- Prefer Framer Motion for animations (already used in originals)
- Keep components small and composable
- No unnecessary abstractions — only extract when reuse is real
- Mobile-first responsive design
- Accessible by default — see **Accessibility Standards** below

### Accessibility Standards

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

### Visual reference:

- **Layout**: Two-column flex — left 50% scrollable (`padding: 64px 40px`), right 50% fixed (`padding: 64px 16px`)
- **Image container**: 528×720px, `border-radius: 32px`, `object-fit: cover`
- **Spacing hierarchy**: 80px (content↔footer) → 64px (title↔sections) → 40px (between sections) → 24px (between links)
- **Responsive**: Right column hidden below 1200px

## Project Structure (Target)

```
sofia/
├── CLAUDE.md                 # This file
├── tokens.md                 # Design tokens (HSL values for all themes)
├── core-docs/
│   ├── plan.md               # Migration plan (living document)
│   ├── workflow.md            # Development process
│   ├── feedback.md            # Lessons from negative feedback
│   └── history.md             # Decision log (reverse chronological)
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx   # Mode + accent color state
│   │   └── HoverContext.tsx   # Hovered project ID
│   ├── components/
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
│   │   ├── GlassPanel.tsx     # Config panel (demo)
│   │   └── GlassButton.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── useHoveredProject.ts
│   ├── data/
│   │   └── projects.ts
│   ├── assets/
│   │   └── images/
│   └── styles/
│       ├── globals.css
│       └── theme.css
├── public/
├── package.json
├── tsconfig.json
└── (original Framer .tsx files — reference only)
```
