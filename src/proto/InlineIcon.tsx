import { useTheme } from '@/contexts/ThemeContext'

const RADIUS_RATIO = 0.22
const ICON_SCALE = 0.75

// Baked values from the Uniform preset
const BODY_SIZE = 40
const LINE_HEIGHT = 1.3

function iconSize() {
  return Math.round(BODY_SIZE * LINE_HEIGHT * ICON_SCALE)
}

function IconWrapper({ size, children, href }: { size: number; children: React.ReactNode; href?: string }) {
  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    verticalAlign: 'middle',
    marginTop: '-0.45em',
    marginBottom: '-0.25em',
    flexShrink: 0,
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    )
  }
  return <span style={style}>{children}</span>
}

export function InlineIcon({ src, alt, href }: { src: string; alt: string; href?: string; context?: string }) {
  const size = iconSize()
  return (
    <IconWrapper size={size} href={href}>
      <img
        src={src}
        alt={alt}
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: size * RADIUS_RATIO, display: 'block' }}
      />
    </IconWrapper>
  )
}

export function InlinePortrait() {
  const { accentColor } = useTheme()
  const size = iconSize()
  return (
    <IconWrapper size={size}>
      <img
        src={`/images/portrait-square-${accentColor}.jpg`}
        alt="Ben Yamron"
        style={{ width: size, height: size, objectFit: 'cover', borderRadius: size * RADIUS_RATIO, display: 'block' }}
      />
    </IconWrapper>
  )
}
