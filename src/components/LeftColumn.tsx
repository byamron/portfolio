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
        overflowY: 'auto',
        padding:
          'var(--layout-padding-top) var(--layout-margin)',
        position: 'relative',
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 64, maxWidth: 480, margin: '0 auto' }}>
        <HeroTitle />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {sections.map((section, i) => (
            <Section key={i} section={section} />
          ))}
          <AboutSection />
        </div>
      </div>
    </main>
  )
}
