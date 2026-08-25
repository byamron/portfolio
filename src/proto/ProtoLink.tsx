import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePreview } from './PreviewContext'
import type { ProtoEntry } from './data'

const Arrow = () => (
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
)

/**
 * An inline prose link. All links get the glass-pill hover (via data-proto-link),
 * underline, and padding for pill breathing room. External links (href present)
 * additionally get a trailing ↗ arrow.
 */
export function ProtoLink({ entry }: { entry: ProtoEntry }) {
  const { hoverLink, leaveLink, morphTo, registerLink } = usePreview()
  const navigate = useNavigate()
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    registerLink(entry.id, ref.current)
    return () => registerLink(entry.id, null)
  }, [entry.id, registerLink])

  const isExternal = entry.href != null
  const isHttpExternal = entry.href?.startsWith('http') ?? false
  const isInternalRoute = isExternal && !isHttpExternal

  return (
    <a
      ref={ref}
      data-proto-link
      href={entry.href ?? `/new/${entry.id}`}
      style={{
        color: 'inherit',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        // Padding gives the glass pill breathing room around the text.
        // Negative margin keeps the text itself aligned with surrounding prose.
        padding: '4px 6px',
        margin: '0 -6px',
      }}
      target={isHttpExternal ? '_blank' : undefined}
      rel={isHttpExternal ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => hoverLink(entry)}
      onMouseLeave={leaveLink}
      onFocus={() => hoverLink(entry)}
      onBlur={leaveLink}
      onClick={e => {
        if (isHttpExternal) return
        e.preventDefault()
        if (isInternalRoute) { navigate(entry.href!); return }
        morphTo(entry)
        navigate(`/new/${entry.id}`)
      }}
    >
      <span>
        {entry.label}
        {isExternal && <Arrow />}
      </span>
    </a>
  )
}
