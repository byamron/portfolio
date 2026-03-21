import { useRef } from 'react'
import { useGlassHighlight } from '../hooks/useGlassHighlight'

interface CaseStudySectionTextProps {
  heading: string
  paragraphs: string[]
}

export function CaseStudySectionText({
  heading,
  paragraphs,
}: CaseStudySectionTextProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useGlassHighlight(sectionRef, {
    borderRadius: 8,
    maxPull: 3,
    tightBounds: true,
    clearDelay: 300,
    cardSelector: '[data-paper-link]',
  })

  return (
    <section ref={sectionRef} style={{ position: 'relative' }}>
      <h2
        style={{
          fontSize: 'var(--text-size-section-heading)',
          fontWeight: 300,
          lineHeight: 1.2,
          color: 'var(--text-dark)',
          marginBottom: 16,
        }}
        dangerouslySetInnerHTML={{ __html: heading }}
      />
      {paragraphs.map((text, i) => (
        <p
          key={i}
          style={{
            fontSize: 'var(--text-size-body)',
            lineHeight: 1.5,
            color: 'var(--text-medium)',
            marginBottom: i < paragraphs.length - 1 ? 32 : 0,
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ))}
    </section>
  )
}
