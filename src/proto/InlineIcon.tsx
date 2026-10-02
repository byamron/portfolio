import { useTheme } from '@/contexts/ThemeContext'
import { useLayoutDials } from './tuning'

const RADIUS_RATIO = 0.22

function useIconSize(context: 'heading' | 'body') {
  const layout = useLayoutDials()
  const fontSize = context === 'heading' ? layout.headingSize : layout.bodySize
  const lineHeight = context === 'heading' ? layout.headingLineHeight : layout.bodyLineHeight
  return Math.round(fontSize * lineHeight * layout.iconScale)
}

/**
 * Wrapper that centers any icon element on the text line without affecting
 * line height. Uses inline-flex + align-items:center so the icon is
 * vertically centered on the text's line box, with negative vertical margin
 * to prevent the icon from expanding the line.
 *
 * This is one formula for all icons — no per-icon vertical-align tweaks.
 */
function IconWrapper({ size, children, href }: { size: number; children: React.ReactNode; href?: string }) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    // Pull the icon into the line box without expanding it.
    // The icon visually overflows but the line height stays natural.
    verticalAlign: 'middle',
    marginTop: '-0.35em',
    marginBottom: '-0.35em',
    flexShrink: 0,
  }

  if (href) {
    const isExternal = href.startsWith('http')
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        style={style}
      >
        {children}
      </a>
    )
  }

  return <span style={style}>{children}</span>
}

export function InlineIcon({ src, alt, href, context = 'heading' }: {
  src: string; alt: string; href?: string; context?: 'heading' | 'body'
}) {
  const size = useIconSize(context)
  return (
    <IconWrapper size={size} href={href}>
      <img
        src={src}
        alt={alt}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: size * RADIUS_RATIO,
          display: 'block',
        }}
      />
    </IconWrapper>
  )
}

export function InlinePortrait({ context = 'heading' }: { context?: 'heading' | 'body' }) {
  const { accentColor } = useTheme()
  const size = useIconSize(context)
  return (
    <IconWrapper size={size}>
      <img
        src={`/images/portrait-square-${accentColor}.jpg`}
        alt="Ben Yamron"
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: size * RADIUS_RATIO,
          display: 'block',
        }}
      />
    </IconWrapper>
  )
}
