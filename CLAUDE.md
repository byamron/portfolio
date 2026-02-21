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

- **Theme system**: 4 named themes (table, portrait, sky, pizza) with light/dark/system appearance modes. CSS custom properties drive color, background, and accent changes. The original uses `window.__themeState` with a listener pattern — migrate to React Context + CSS variables.
- **Glass highlight**: Frosted-glass pill that slides between navigation items with physics-based animation (stretch/squash, gravitational pull to adjacent items, volume preservation). Two variants exist (GlassHighlight, SectionHighlight) — unify into one configurable component.
- **Hover preview**: LinkCard emits hover state globally; Hover_Preview conditionally renders content when matched. Theme_Image hides on any hover. Migrate from `window.__hoverState` to React Context.
- **Appearance toggle**: 3-mode toggle (system/light/dark) with localStorage persistence, system preference detection, and browser meta theme-color integration.
- **Theme background layer**: Non-wrapping background that syncs with theme — straightforward CSS variable consumer.

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

## Project Structure (Target)

```
islamabad/
├── CLAUDE.md                 # This file
├── workflow.md               # Development workflow
├── feedback.md               # Recorded feedback and lessons
├── history.md                # Decision log (reverse chronological)
├── PLAN.md                   # Migration plan
├── src/
│   ├── app/                  # Next.js or Vite app entry
│   ├── components/           # UI components
│   │   ├── GlassHighlight/
│   │   ├── LinkCard/
│   │   ├── HoverPreview/
│   │   ├── ThemeToggle/
│   │   ├── ThemeImage/
│   │   └── ThemeBackground/
│   ├── context/              # React Context providers
│   │   ├── ThemeContext.tsx
│   │   └── HoverContext.tsx
│   ├── hooks/                # Custom hooks
│   ├── styles/               # Global styles + CSS variables
│   └── lib/                  # Utilities (color conversion, etc.)
├── public/                   # Static assets
├── package.json
├── tsconfig.json
└── (original Framer files)   # Reference only
```
