import { useRef } from 'react'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { HeroTitle } from '@/components/HeroTitle'
import { Section } from '@/components/Section'
import { AboutSection } from '@/components/AboutSection'
import { sections } from '@/data/projects'

interface LeftColumnProps {
  fullWidth?: boolean
}

export function LeftColumn({ fullWidth }: LeftColumnProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(contentRef)

  return (
    <main
      ref={contentRef}
      className="left-column"
      style={{
        width: fullWidth ? '100%' : '50%',
        padding:
          'var(--layout-padding-top) var(--layout-margin)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 528, margin: '0 auto' }}>
        <HeroTitle />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {sections.map((section, i) => (
            <Section key={i} section={section} />
          ))}
          <AboutSection />
        </div>
      </div>
    </main>
  )
}
