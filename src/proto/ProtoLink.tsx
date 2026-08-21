import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePreview } from './PreviewContext'
import type { ProtoEntry } from './data'

/**
 * An inline prose link, in three flavors:
 *  - genuine external site (`href` starting with http): inline ↗, opens in a
 *    new tab, native navigation.
 *  - internal route (`href` present but not http, e.g. /playground): client-
 *    side navigate to that route directly. No morph (it isn't a case study),
 *    no arrow (it never left the site).
 *  - case study (no `href`): anchors the hover preview and morphs into the
 *    hero on click.
 * Underline styling lives in proto.css.
 */
export function ProtoLink({ entry }: { entry: ProtoEntry }) {
  const { hoverLink, leaveLink, morphTo, registerLink } = usePreview()
  const navigate = useNavigate()
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    registerLink(entry.id, ref.current)
    return () => registerLink(entry.id, null)
  }, [entry.id, registerLink])

  const isHttpExternal = entry.href?.startsWith('http') ?? false
  const isInternalRoute = entry.href != null && !isHttpExternal

  return (
    <a
      ref={ref}
      data-proto-link
      href={entry.href ?? `/new/${entry.id}`}
      style={{ color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap' }}
      target={isHttpExternal ? '_blank' : undefined}
      rel={isHttpExternal ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => hoverLink(entry)}
      onMouseLeave={leaveLink}
      onFocus={() => hoverLink(entry)}
      onBlur={leaveLink}
      onClick={e => {
        if (isHttpExternal) return // native navigation, new tab
        e.preventDefault()
        if (isInternalRoute) { navigate(entry.href!); return }
        morphTo(entry)
        navigate(`/new/${entry.id}`)
      }}
    >
      <span>
        {entry.label}
        {isHttpExternal && (
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
