import { useTheme } from '@/contexts/ThemeContext'
import { useLayoutDials } from './tuning'

const RADIUS_RATIO = 0.22

/**
 * Compute the vertical-align value that truly centers the icon.
 *
 * CSS `vertical-align: middle` aligns to the x-height midpoint, not the
 * line-box center — visibly off for larger icons. Instead, when "middle"
 * is selected we calculate the exact pixel offset from the baseline that
 * centers the icon within the line box:
 *
 *   lineBox = fontSize × lineHeight
 *   leading = lineBox - fontSize  (split half above, half below)
 *   baselineFromTop ≈ fontSize × 0.8 + leading/2
 *   iconCenter should be at lineBox / 2
 *   offset = baselineFromTop - iconCenter - iconSize/2
 *          = (fontSize×0.8 + leading/2) - lineBox/2 - iconSize/2
 *          simplified: (fontSize×0.3) - iconSize/2 + leading×0  ...
 *
 * Actually simpler: we want the icon's center at lineBox/2 from the top.
 * vertical-align offset from baseline = (lineBox/2 - iconSize/2) - descent
 * where descent ≈ fontSize × 0.2 for Latin fonts.
 */
function computeAlign(align: string, fontSize: number, lineHeight: number, iconSize: number): string {
  if (align !== 'middle') return align
  const lineBox = fontSize * lineHeight
  const descent = fontSize * 0.18
  const offset = (lineBox - iconSize) / 2 - descent
  return `${offset.toFixed(1)}px`
}

function useIconMetrics(context: 'heading' | 'body') {
  const layout = useLayoutDials()
  const fontSize = context === 'heading' ? layout.headingSize : layout.bodySize
  const lineHeight = context === 'heading' ? layout.headingLineHeight : layout.bodyLineHeight
  const size = Math.round(fontSize * lineHeight * layout.iconScale)
  const align = computeAlign(layout.iconAlign as string, fontSize, lineHeight, size)
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
    lineHeight: 0,
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
        lineHeight: 0,
      }}
    />
  )
}
