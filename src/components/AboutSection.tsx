import { useRef } from 'react'
import { useGlassHighlight } from '../hooks/useGlassHighlight'

const textStyle = {
  fontFamily: "'Literata', serif",
  fontSize: 22,
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
  const contactRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(contactRef, {
    borderRadius: 8,
    pullStrength: 0,
    stretchAmount: 0,
    squashAmount: 0,
    tightBounds: true,
    clearDelay: 300,
    cardSelector: '[data-contact-card]',
  })

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <p style={textStyle}>
        I like working through ambiguous problems, leading 0-to-1 efforts, doing product strategy work, and getting in the weeds with engineers.
      </p>
      <p style={textStyle}>
        I feel fulfilled working on experiences related to health, community, and other human stuff.
      </p>
      <div ref={contactRef} data-contact-links style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <p style={textStyle}>
          You can say hi if you see me running around SF, or you can contact me via{' '}
          <a href="mailto:ben.yamron@icloud.com" data-contact-card style={linkCardStyle}>email</a>
          {' '}or on{' '}
          <a href="https://www.linkedin.com/in/benyamron" target="_blank" rel="noopener noreferrer" data-contact-card style={linkCardStyle}>LinkedIn</a>.
        </p>
        <p style={textStyle}>
          Just lurking? Take a look at my{' '}
          <a href="/ben-yamron-resume.pdf" target="_blank" rel="noopener noreferrer" data-contact-card style={linkCardStyle}>resume</a>.
        </p>
      </div>
    </section>
  )
}
