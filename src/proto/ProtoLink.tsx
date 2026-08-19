import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePreview } from './PreviewContext'
import type { ProtoEntry } from './data'

const linkStyle: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'underline',
  textDecorationColor: 'color-mix(in srgb, var(--text-dark) 25%, transparent)',
  textUnderlineOffset: '3px',
  textDecorationThickness: '1px',
  transition: 'text-decoration-color 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}

/** An inline prose link that anchors the hover preview and triggers the morph on click. */
export function ProtoLink({ entry }: { entry: ProtoEntry }) {
  const { hoverLink, movePointer, leaveLink, morphTo, registerLink, placement } = usePreview()
  const navigate = useNavigate()
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    registerLink(entry.id, ref.current)
    return () => registerLink(entry.id, null)
  }, [entry.id, registerLink])

  const href = entry.external ?? `/new/${entry.id}`
  const isExternal = entry.external != null && /^https?:/.test(entry.external)

  return (
    <a
      ref={ref}
      href={href}
      style={linkStyle}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onMouseEnter={e => hoverLink(entry, e.clientX)}
      onMouseMove={placement === 'follow' ? e => movePointer(e.clientX) : undefined}
      onMouseLeave={leaveLink}
      onFocus={() => hoverLink(entry, null)}
      onBlur={leaveLink}
      onMouseOver={e => { (e.currentTarget.style.textDecorationColor = 'color-mix(in srgb, var(--text-dark) 55%, transparent)') }}
      onMouseOut={e => { (e.currentTarget.style.textDecorationColor = 'color-mix(in srgb, var(--text-dark) 25%, transparent)') }}
      onClick={e => {
        if (entry.external) return // native navigation
        e.preventDefault()
        morphTo(entry)
        navigate(`/new/${entry.id}`)
      }}
    >
      {entry.label}
    </a>
  )
}
