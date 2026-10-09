import type { ProtoEntry } from './data'

/**
 * An inline prose link to an external site. Underline + ↗ arrow + glass pill
 * hover (via data-proto-link, styled in proto.css). Opens in a new tab.
 */
export function ProtoLink({ entry }: { entry: ProtoEntry }) {
  return (
    <a
      data-proto-link
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: 'inherit',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        padding: '4px 6px',
        margin: '0 -6px',
      }}
    >
      <span>
        {entry.label}
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
      </span>
    </a>
  )
}
