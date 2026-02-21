# CLAUDE.md — Portfolio Site

## About Ben

Ben is a senior product designer who works at the intersection of complex information and human decision-making — across health tech, AI, and tools for critical thinking. He thrives in fast-moving, ambiguous environments where design, strategy, and engineering blur together, and he's at his best when turning messy, high-stakes problems into clear, actionable experiences.

## Design Philosophy

The site should feel like a design artifact in itself — clean, opinionated, and structurally confident in a way that signals senior-level taste before anyone reads a word.

Architecture should lead with outcomes, decisions, and strategic thinking rather than process documentation, making it immediately clear that this is someone who shapes what gets built and why, not someone proving they can push pixels.

The entire experience should embody that core value proposition of making complex information feel simple and actionable: effortless navigation, clear hierarchy, intentional restraint, nothing decorative without purpose.

It should read as authored and specific — built for an audience of design-mature companies like Figma, Anthropic, and Stripe — rather than trying to appeal to everyone.

The vibe is quiet confidence and substance over spectacle, closer to nelson.co than a Dribbble portfolio. Someone should land on it and within seconds think: this person has a point of view, ships real work, and I'd trust their judgment on my team.

## Technical Context

This is a React migration of a Framer-based portfolio site. The original Framer components are preserved in the repo root as reference (`.tsx` files). The React rebuild should replicate the visual and interactive behavior of the originals while using idiomatic React patterns.

### Key systems to replicate:

- **Theme system**: 4 accent colors (table, portrait, sky, pizza) × 3 appearance modes (system/light/dark). CSS custom properties drive all color changes. Dark mode default with warm brown background `rgb(36, 31, 25)`. The original uses `window.__themeState` with a listener pattern — migrate to React Context + CSS variables.
- **Glass highlight on hover**: Project links get a frosted-glass background on hover — `backdrop-filter: blur(1px)`, semi-transparent accent-hued fill, inner glow, subtle border, `border-radius: 16px`. CSS-first implementation, with optional physics-based animated pill as enhancement.
- **Image swap on hover**: Hovering a project link cross-fades the right-column image to a project-specific preview. Leaving resets to the accent-color default portrait. Both transitions (glass + image) happen simultaneously. Migrate from `window.__hoverState` to React Context.
- **Appearance toggle**: 3-mode toggle (system/light/dark) with Phosphor Icons (monitor/sun/moon), localStorage persistence, system preference detection, and browser meta theme-color integration.
- **Glass configurator panel**: Floating demo panel that tunes the glass hover effect in real-time with sliders. 3 tabs (Fill/Shadow/Motion). Showcase feature.

### Architecture principles:

- Replace all `window.__*` global state with React Context providers
- Use CSS custom properties for theming (no runtime style computation)
- Prefer Framer Motion for animations (already used in originals)
- Keep components small and composable
- No unnecessary abstractions — only extract when reuse is real
- Mobile-first responsive design
- Accessible by default (semantic HTML, keyboard navigation, ARIA where needed)

## Workflow

See `workflow.md` for the full development workflow. Key points:

- Always consult `feedback.md` before starting new work
- Record decisions and completed work in `history.md`
- Plan before building, review before shipping
- Commit to the working branch and push to remote

### Visual reference:

- **Font**: Manrope (Google Fonts), weight 400, sans-serif fallback
- **Layout**: Two-column flex — left 50% scrollable (`padding: 64px 40px`), right 50% fixed (`padding: 64px 16px`)
- **Image container**: 528×720px, `border-radius: 32px`, `object-fit: cover`
- **Spacing hierarchy**: 80px (content↔footer) → 64px (title↔sections) → 40px (between sections) → 24px (between links)
- **Responsive**: Right column hidden below 1200px

## Project Structure (Target)

```
islamabad/
├── CLAUDE.md                 # This file
├── workflow.md               # Development workflow
├── feedback.md               # Recorded feedback and lessons
├── history.md                # Decision log (reverse chronological)
├── PLAN.md                   # Migration plan
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
