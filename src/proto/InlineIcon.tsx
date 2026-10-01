import { useTheme } from '@/contexts/ThemeContext'
import { useLayoutDials } from './tuning'

const RADIUS_RATIO = 0.22

/**
 * An app-icon-sized element that sits inline within text. Size is computed
 * as fontSize × lineHeight × iconScale, so it scales proportionally to
 * whichever text context it's placed in (heading or body).
 *
 * Pass `context="heading"` or `context="body"` to pick which text metrics
 * drive the size.
 */
export function InlineIcon({ src, alt, href, context = 'heading' }: {
  src: string; alt: string; href?: string; context?: 'heading' | 'body'
}) {
  const layout = useLayoutDials()
  const fontSize = context === 'heading' ? layout.headingSize : layout.bodySize
  const size = Math.round(fontSize * layout.iconScale)

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
        verticalAlign: 'middle',
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
        style={{ display: 'inline-block', lineHeight: 0, verticalAlign: 'middle' }}
      >
        {img}
      </a>
    )
  }

  return img
}

export function InlinePortrait({ context = 'heading' }: { context?: 'heading' | 'body' }) {
  const { accentColor } = useTheme()
  const layout = useLayoutDials()
  const fontSize = context === 'heading' ? layout.headingSize : layout.bodySize
  const size = Math.round(fontSize * layout.iconScale)

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
        verticalAlign: 'middle',
      }}
    />
  )
}
