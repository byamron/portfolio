import { useRef, useCallback } from 'react'
import { useHover } from '@/contexts/HoverContext'
import { useGlassHighlight } from '../hooks/useGlassHighlight'
import { narrativeStyle } from '@/styles/shared'

const linkCardStyle = {
  color: 'inherit',
  textDecoration: 'underline' as const,
  textDecorationColor: 'var(--text-underline)',
  textUnderlineOffset: 4,
  padding: '4px 6px',
  margin: '0 -6px',
} as const

export function AboutSection() {
  const { setHoveringLink, setHoveredLinkId } = useHover()
  const onLinkEnter = useCallback((id: string) => { setHoveringLink(true); setHoveredLinkId(id) }, [setHoveringLink, setHoveredLinkId])
  const onLinkLeave = useCallback(() => { setHoveringLink(false); setHoveredLinkId(null) }, [setHoveringLink, setHoveredLinkId])
  const contactRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(contactRef, {
    borderRadius: 8,
    maxPull: 3,
    tightBounds: true,
    clearDelay: 300,
    cardSelector: '[data-contact-card]',
  })

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <p style={narrativeStyle}>
        I do my best work shaping early-stage ideas — setting direction in ambiguity, getting technical with engineers, and building ideas in code.
      </p>

      <p style={narrativeStyle}>
        I feel fulfilled working on experiences related to health, community, and other human stuff.
      </p>
      <div ref={contactRef} data-contact-links style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <p style={narrativeStyle}>
          You can say hi if you see me running around SF, or you can contact me via{' '}
          <a href="mailto:ben.yamron@icloud.com" data-contact-card style={linkCardStyle} onMouseEnter={() => onLinkEnter('email')} onMouseLeave={onLinkLeave} onFocus={() => onLinkEnter('email')} onBlur={onLinkLeave}>email</a>
          {' '}or on{' '}
          <a href="https://www.linkedin.com/in/benyamron" target="_blank" rel="noopener noreferrer" data-contact-card style={linkCardStyle} onMouseEnter={() => onLinkEnter('linkedin')} onMouseLeave={onLinkLeave} onFocus={() => onLinkEnter('linkedin')} onBlur={onLinkLeave}>LinkedIn</a>.
        </p>
        <p style={narrativeStyle}>
          Just lurking? Take a look at my{' '}
          <a href="/ben-yamron-resume.pdf" target="_blank" rel="noopener noreferrer" data-contact-card style={linkCardStyle} onMouseEnter={() => onLinkEnter('resume')} onMouseLeave={onLinkLeave} onFocus={() => onLinkEnter('resume')} onBlur={onLinkLeave}>resume</a>.
        </p>
      </div>
    </section>
  )
}
