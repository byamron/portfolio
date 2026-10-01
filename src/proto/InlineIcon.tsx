import { useTheme } from '@/contexts/ThemeContext'
import { useLayoutDials } from './tuning'

const RADIUS_RATIO = 0.22

/**
 * An app-icon-sized element that sits inline within text. Size equals
 * fontSize × lineHeight — the largest square that fits inside the line
 * box without affecting line spacing. True-centered vertically via a
 * calculated translateY rather than CSS vertical-align: middle (which
 * aligns to the x-height midpoint, not the line-box center).
 */
function useIconMetrics(context: 'heading' | 'body') {
  const layout = useLayoutDials()
  const fontSize = context === 'heading' ? layout.headingSize : layout.bodySize
  const lineHeight = context === 'heading' ? layout.headingLineHeight : layout.bodyLineHeight
  const size = Math.round(fontSize * lineHeight)
  const align = layout.iconAlign as string
  return { size, align }
}

export function InlineIcon({ src, alt, href, context = 'heading' }: {
  src: string; alt: string; href?: string; context?: 'heading' | 'body'
}) {
  const { size, align } = useIconMetrics(context)

  const imgStyle: React.CSSProperties = {
    width: size,
    height: size,
    objectFit: 'cover',
    borderRadius: size * RADIUS_RATIO,
    display: 'inline-block',
    verticalAlign: align,
  }

  const img = <img src={src} alt={alt} style={imgStyle} />

  if (href) {
    const isExternal = href.startsWith('http')
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        style={{ display: 'inline-block', lineHeight: 0, verticalAlign: align }}
      >
        {img}
      </a>
    )
  }

  return img
}

export function InlinePortrait({ context = 'heading' }: { context?: 'heading' | 'body' }) {
  const { accentColor } = useTheme()
  const { size, align } = useIconMetrics(context)

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
        verticalAlign: align,
      }}
    />
  )
}
