import { Link } from 'react-router-dom'
// @ts-expect-error — submodule may not exist in all worktrees
import { bg, demoPalettes, text } from '@playground/palette'

const demos = [
  {
    slug: 'water-ripple',
    title: 'Water Ripple',
    description: 'Click anywhere — ripples propagate like water',
  },
  {
    slug: 'glass-pull',
    title: 'Glass Pull',
    description: 'Hover between items — glass pill stretches and follows',
  },
  {
    slug: 'magnetic-button',
    title: 'Magnetic Button',
    description: 'Cursor proximity warps the button toward you',
  },
  {
    slug: 'text-scramble',
    title: 'Text Scramble',
    description: 'Characters randomize then resolve into words',
  },
  {
    slug: 'elastic-toggle',
    title: 'Elastic Toggle',
    description: 'Bouncy physics-driven switch with overshoot',
  },
  {
    slug: 'fisheye-text',
    title: 'Fisheye Text',
    description: 'Type freely — letters stretch wide on hover with spring physics',
  },
  {
    slug: 'figpal-cursor',
    title: 'Figpal Cursor',
    description: 'A companion character trails your cursor with lerp inertia',
  },
  {
    slug: 'cursor-morph',
    title: 'Cursor Morph',
    description: 'Inverted circle collapses into an arrow on card hover',
  },
  {
    slug: 'theme-sidebar',
    title: 'Theme Sidebar',
    description: 'Color, intensity, and mode — expandable sidebar with glass pills',
  },
  {
    slug: 'task-ranking',
    title: 'Task Ranking',
    description: 'Binary search pairwise comparison to prioritize tasks',
  },
  {
    slug: 'dvd-bounce',
    title: 'DVD Bounce',
    description: 'Classic bouncing logo with squash physics, corner celebrations, and mouse influence',
  },
  {
    slug: 'slide-unlock',
    title: 'Slide to Unlock',
    description: 'Drag with fluid WebGL shader trail, spring snap-back, and switchable patterns',
  },
  {
    slug: 'figma-highfive',
    title: 'Figma High-Five',
    description: 'FigJam share modal with a very useful permission level',
  },
  {
    slug: 'frame-guide',
    title: 'Frame Guide',
    description: 'Responsive frame overlay for design validation',
  },
]

const galleryBg = bg({ hue: 220, mode: 'dark', intensity: 0 })

export function PlaygroundGallery() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: galleryBg,
        color: text.dark.primary,
        padding: '80px 40px',
      }}
    >
      <h1
        style={{
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: text.dark.tertiary,
          marginBottom: 48,
        }}
      >
        Playground
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {demos.map((demo) => (
          <Link
            key={demo.slug}
            to={`/playground/${demo.slug}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              background: bg(
                demoPalettes[demo.slug as keyof typeof demoPalettes] ?? {
                  hue: 220,
                  mode: 'dark' as const,
                  intensity: 1 as const,
                }
              ),
              borderRadius: 12,
              padding: '32px 28px',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              {demo.title}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: text.dark.tertiary,
                lineHeight: 1.5,
              }}
            >
              {demo.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
