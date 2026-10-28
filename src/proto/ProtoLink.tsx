import { useTheme } from '@/contexts/ThemeContext'
import type { ProtoEntry } from './data'
import { InlineIcon } from './InlineIcon'

/**
 * Inline prose link: black text, underline, glass-pill hover (proto.css +
 * useGlassHighlight). A leading logo sits inside the anchor so logo + name
 * are one target. ↗ only for links that leave for another website.
 */
export function ProtoLink({ entry }: { entry: ProtoEntry }) {
  const isWeb = entry.href.startsWith('http')
  const { resolvedAppearance } = useTheme()
  const icon = resolvedAppearance === 'dark' && entry.iconDark ? entry.iconDark : entry.icon
  return (
    <a
      data-proto-link
      href={entry.href}
      target={isWeb ? '_blank' : undefined}
      rel={isWeb ? 'noopener noreferrer' : undefined}
      // 0.25em ≈ the pill's vertical inset (content box vs icon), so all four
      // sides match; any wider and the pill swallows the trailing period.
      style={{ textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 0.25em', margin: '0 -0.25em' }}
    >
      {icon && <><InlineIcon src={icon} />{' '}</>}
      <span className="proto-link-label">{entry.label}</span>
      {isWeb && (
        <svg
          aria-hidden="true"
          // Cropped to the stroke's ink (7–17 ± half the 2.2 stroke) so the
          // glyph box has no blank margin padding out the hover pill.
          viewBox="5.9 5.9 12.2 12.2"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'inline-block', width: '0.305em', height: '0.305em', marginLeft: '0.29em', verticalAlign: '0.2075em', opacity: 0.7 }}
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      )}
    </a>
  )
}
