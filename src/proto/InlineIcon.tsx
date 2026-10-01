import { useTheme } from '@/contexts/ThemeContext'
import { useLayoutDials } from './tuning'

const RADIUS_RATIO = 0.22

export function InlineIcon({ src, alt, href }: { src: string; alt: string; href?: string }) {
  const { inlineIconSize: size } = useLayoutDials()

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
  const { inlineIconSize: size } = useLayoutDials()

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
