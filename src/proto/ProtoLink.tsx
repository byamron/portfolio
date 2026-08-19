import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePreview } from './PreviewContext'
import type { ProtoEntry } from './data'

const linkStyle: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}

// Underline lives on the label span only, so it never runs under the trailing arrow.
const labelStyle: React.CSSProperties = {
  textDecoration: 'underline',
  textDecorationColor: 'color-mix(in srgb, var(--text-dark) 25%, transparent)',
  textUnderlineOffset: '3px',
  textDecorationThickness: '1px',
  transition: 'text-decoration-color 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}

const HOVER_COLOR = 'color-mix(in srgb, var(--text-dark) 55%, transparent)'
const REST_COLOR = 'color-mix(in srgb, var(--text-dark) 25%, transparent)'

/**
 * An inline prose link.
 *  - case-study: anchors the hover preview and morphs into the hero on click.
 *  - external: opens another site; shows an inline ↗ and navigates natively (no morph).
 */
export function ProtoLink({ entry }: { entry: ProtoEntry }) {
  const { hoverLink, movePointer, leaveLink, morphTo, registerLink, placement } = usePreview()
  const navigate = useNavigate()
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    registerLink(entry.id, ref.current)
    return () => registerLink(entry.id, null)
  }, [entry.id, registerLink])

  const isExternal = entry.kind === 'external'
  const isHttp = isExternal && /^https?:/.test(entry.href ?? '')
  const href = isExternal ? entry.href! : `/new/${entry.id}`

  const setLabelColor = (el: HTMLAnchorElement, color: string) => {
    const span = el.querySelector('span')
    if (span) (span as HTMLElement).style.textDecorationColor = color
  }

  return (
    <a
      ref={ref}
      href={href}
      style={linkStyle}
      {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onMouseEnter={e => hoverLink(entry, e.clientX)}
      onMouseMove={placement === 'follow' ? e => movePointer(e.clientX) : undefined}
      onMouseLeave={leaveLink}
      onFocus={() => hoverLink(entry, null)}
      onBlur={leaveLink}
      onMouseOver={e => setLabelColor(e.currentTarget, HOVER_COLOR)}
      onMouseOut={e => setLabelColor(e.currentTarget, REST_COLOR)}
      onClick={e => {
        if (isExternal) return // native navigation (new tab for http, same tab for internal)
        e.preventDefault()
        morphTo(entry)
        navigate(`/new/${entry.id}`)
      }}
    >
      <span style={labelStyle}>{entry.label}</span>
      {isExternal && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            display: 'inline-block',
            width: '0.6em',
            height: '0.6em',
            marginLeft: '0.14em',
            verticalAlign: '0.06em',
            opacity: 0.7,
          }}
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      )}
    </a>
  )
}
