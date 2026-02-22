import { useRef } from 'react'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { HeroTitle } from './HeroTitle'
import { Section } from './Section'
import { AboutSection } from './AboutSection'
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
      style={{
        width: fullWidth ? '100%' : '50%',
        overflowY: 'auto',
        padding:
          'var(--layout-padding-top) var(--layout-margin)',
        position: 'relative',
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
        <HeroTitle />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {sections.map(section => (
            <Section key={section.id} section={section} />
          ))}
        </div>
        <AboutSection />
      </div>
    </main>
  )
}
