import type { ProtoEntry } from './data'
import { InlineIcon } from './InlineIcon'

/**
 * Inline prose link: black text, underline, glass-pill hover (proto.css +
 * useGlassHighlight). A leading logo sits inside the anchor so logo + name
 * are one target. ↗ only for links that leave for another website.
 */
export function ProtoLink({ entry }: { entry: ProtoEntry }) {
  const isWeb = entry.href.startsWith('http')
  return (
    <a
      data-proto-link
      href={entry.href}
      target={isWeb ? '_blank' : undefined}
      rel={isWeb ? 'noopener noreferrer' : undefined}
      style={{ textDecoration: 'none', whiteSpace: 'nowrap', padding: '0 0.3em', margin: '0 -0.3em' }}
    >
      {entry.icon && <><InlineIcon src={entry.icon} />{' '}</>}
      <span className="proto-link-label">{entry.label}</span>
      {isWeb && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'inline-block', width: '0.6em', height: '0.6em', marginLeft: '0.14em', verticalAlign: '0.06em', opacity: 0.7 }}
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      )}
    </a>
  )
}
