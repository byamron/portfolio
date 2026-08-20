import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePreview } from './PreviewContext'
import type { ProtoEntry } from './data'

/**
 * An inline prose link. Entries with an `href` open another site (inline ↗,
 * native navigation); the rest are case studies whose hover preview morphs
 * into the hero on click. Underline styling lives in proto.css.
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
  const newTab = entry.href?.startsWith('http')

  return (
    <a
      ref={ref}
      data-proto-link
      href={entry.href ?? `/new/${entry.id}`}
      style={{ color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => hoverLink(entry)}
      onMouseLeave={leaveLink}
      onFocus={() => hoverLink(entry)}
      onBlur={leaveLink}
      onClick={e => {
        if (isExternal) return // native navigation
        e.preventDefault()
        morphTo(entry)
        navigate(`/new/${entry.id}`)
      }}
    >
      <span>
        {entry.label}
        {isExternal && (
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
      </span>
    </a>
  )
}
