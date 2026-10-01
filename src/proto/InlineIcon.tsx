import { useTheme } from '@/contexts/ThemeContext'
import { useLayoutDials } from './tuning'

/**
 * An app-icon-sized element that sits inline within heading text.
 * Sized to match the heading's line height so it reads as part of the text flow.
 * Shape: square with rounded corners (app-icon style).
 *
 * Three variants:
 *  - logo: renders an SVG logo image (Consensus, Mochi, etc.)
 *  - portrait: renders Ben's square portrait photo (accent-reactive)
 *  - placeholder: a colored square (for logos not yet available)
 */

const RADIUS_RATIO = 0.22 // iOS app-icon-style corner radius

export function InlineIcon({ src, alt, href }: { src: string; alt: string; href?: string }) {
  const layout = useLayoutDials()
  const size = Math.round(layout.headingSize * layout.headingLineHeight)

  const img = (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: size * RADIUS_RATIO,
        display: 'inline-block',
        verticalAlign: 'baseline',
        transform: 'translateY(0.14em)',
      }}
    />
  )

  if (href) {
    const isExternal = href.startsWith('http')
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        style={{ display: 'inline-block', lineHeight: 0, verticalAlign: 'baseline' }}
      >
        {img}
      </a>
    )
  }

  return img
}

export function InlinePortrait() {
  const { accentColor } = useTheme()
  const layout = useLayoutDials()
  const size = Math.round(layout.headingSize * layout.headingLineHeight)

  return (
    <img
      src={`/images/portrait-square-${accentColor}.jpg`}
      alt="Ben Yamron"
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: size * RADIUS_RATIO,
        display: 'inline-block',
        verticalAlign: 'baseline',
        transform: 'translateY(0.14em)',
      }}
    />
  )
}
