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

/** Consensus logo as an inline React SVG — theme-aware background. */
export function ConsensusIcon({ context = 'heading', href = 'https://consensus.app/' }: { context?: 'heading' | 'body'; href?: string }) {
  const { resolvedAppearance } = useTheme()
  const { size, align } = useIconMetrics(context)
  const isDark = resolvedAppearance === 'dark'
  const bg = isDark ? '#1a1a1a' : '#f5f5f5'
  const r = size * RADIUS_RATIO

  const svg = (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: align, borderRadius: r, overflow: 'hidden', lineHeight: 0 }}>
      <rect width="40" height="40" rx="0" fill={bg} />
      <path d="M9.79869 15.2C10.824 14.8285 11.9988 14.8417 12.9976 15.2322L13.5972 15.4667C14.4812 15.8124 15.1111 16.4066 15.5467 17.0954C15.711 16.7986 15.9009 16.5146 16.1154 16.2471C16.9596 15.1941 18.1341 14.4565 19.4492 14.1533C20.7643 13.8502 22.1432 13.9993 23.3631 14.5765C23.6695 14.7215 23.9614 14.8914 24.2362 15.0836C25.5939 16.0334 27.3756 16.7378 28.86 16.0017C30.3443 15.2656 30.9749 13.4309 29.8945 12.1748C28.806 10.9093 27.4581 9.87632 25.9293 9.15299C23.4895 7.99854 20.7317 7.70037 18.1015 8.30664C15.4713 8.91292 13.1223 10.3882 11.434 12.4942C10.7675 13.3257 10.2193 14.2363 9.79869 15.2Z" fill="#3BCDAA"/>
      <path d="M30.5442 26.8816C31.5106 25.5358 30.7219 23.7634 29.1789 23.16L28.5793 22.9255C27.3673 22.4516 26.0249 23.1012 25.1233 24.0395C24.5773 24.6077 23.9249 25.0628 23.2031 25.3787C22.4813 25.6947 21.7043 25.8654 20.9165 25.8812C20.1288 25.8969 19.3457 25.7573 18.6118 25.4704C17.878 25.1834 17.2079 24.7547 16.6397 24.2088C16.0716 23.6629 15.6165 23.0104 15.3005 22.2886C14.9845 21.5668 14.8138 20.7898 14.7981 20.0021C14.7721 18.701 14.2264 17.3132 13.0145 16.8393L12.4149 16.6048C10.8718 16.0014 9.09002 16.7687 8.88716 18.4131C8.8174 18.9786 8.78785 19.5496 8.79926 20.1218C8.8307 21.6974 9.17216 23.2513 9.80415 24.6949C9.89379 24.8996 9.98903 25.1016 10.0897 25.3006L8.8784 29.9821C8.56987 31.1746 9.66787 32.2538 10.8548 31.9248L15.4832 30.6418C15.7911 30.7938 16.1059 30.9329 16.4268 31.0583C17.8944 31.6322 19.4607 31.9114 21.0363 31.88C22.6118 31.8486 24.1657 31.5071 25.6093 30.8751C27.0529 30.2431 28.3579 29.333 29.4497 28.1967C29.8463 27.784 30.2119 27.3444 30.5442 26.8816Z" fill="#068EF1"/>
    </svg>
  )

  if (href) {
    const isExternal = href.startsWith('http')
    return (
      <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} style={{ display: 'inline-block', lineHeight: 0, verticalAlign: align }}>
        {svg}
      </a>
    )
  }
  return svg
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
