import { useRef, useCallback } from 'react'
import { useHover } from '@/contexts/HoverContext'
import { useGlassHighlight } from '../hooks/useGlassHighlight'

const textStyle = {
  fontFamily: "'Literata', serif",
  fontSize: 'var(--text-size-narrative)',
  fontWeight: 300,
  lineHeight: 1.4,
  color: 'var(--text-grey)',
} as const

const linkCardStyle = {
  color: 'inherit',
  textDecoration: 'underline' as const,
  textDecorationColor: 'var(--text-underline)',
  textUnderlineOffset: 4,
  padding: '4px 6px',
  margin: '0 -6px',
} as const

export function AboutSection() {
  const { setHoveringLink } = useHover()
  const onEnter = useCallback(() => setHoveringLink(true), [setHoveringLink])
  const onLeave = useCallback(() => setHoveringLink(false), [setHoveringLink])
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
      <p style={textStyle}>
        I do my best work shaping early-stage ideas — setting direction in ambiguity, getting technical with engineers, and building ideas in code.
      </p>

      <p style={textStyle}>
        I feel fulfilled working on experiences related to health, community, and other human stuff.
      </p>
      <div ref={contactRef} data-contact-links style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <p style={textStyle}>
          You can say hi if you see me running around SF, or you can contact me via{' '}
          <a href="mailto:ben.yamron@icloud.com" data-contact-card style={linkCardStyle} onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave}>email</a>
          {' '}or on{' '}
          <a href="https://www.linkedin.com/in/benyamron" target="_blank" rel="noopener noreferrer" data-contact-card style={linkCardStyle} onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave}>LinkedIn</a>.
        </p>
        <p style={textStyle}>
          Just lurking? Take a look at my{' '}
          <a href="/ben-yamron-resume.pdf" target="_blank" rel="noopener noreferrer" data-contact-card style={linkCardStyle} onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave}>resume</a>.
        </p>
      </div>
    </section>
  )
}
