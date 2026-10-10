import { useTheme } from '@/contexts/ThemeContext'

// Sized in em so icons track the prose size at every breakpoint:
// line-height (1.3) × 0.75 ≈ the largest square that sits inside the line box.
const SIZE = '0.975em'

const wrapper: React.CSSProperties = {
  display: 'inline-flex',
  width: SIZE,
  height: SIZE,
  verticalAlign: 'middle',
  // Asymmetric pull: centres on cap height rather than x-height, and the
  // negative margins keep the icon from growing the line box.
  marginTop: '-0.45em',
  marginBottom: '-0.25em',
  flexShrink: 0,
}

const image: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '22%',
  display: 'block',
}

/** Decorative: the name always follows, so the icon stays silent to AT. */
export function InlineIcon({ src }: { src: string }) {
  return (
    <span style={wrapper} aria-hidden="true">
      <img src={src} alt="" style={image} />
    </span>
  )
}

export function InlinePortrait() {
  const { accentColor } = useTheme()
  return <InlineIcon src={`/images/portrait-square-${accentColor}.jpg`} />
}
