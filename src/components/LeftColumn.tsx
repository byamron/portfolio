import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useHover } from '@/contexts/HoverContext'
import { HeroTitle } from '@/components/HeroTitle'
import { Section } from '@/components/Section'
import { AboutSection } from '@/components/AboutSection'
import { ContributionHeatmap } from '@/components/ContributionHeatmap'
import { sections } from '@/data/projects'

interface LeftColumnProps {
  fullWidth?: boolean
}

export function LeftColumn({ fullWidth }: LeftColumnProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(contentRef)
  const { navigatingProjectId } = useHover()

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: navigatingProjectId ? 0 : 1 }}
        transition={navigatingProjectId
          ? { duration: 0.28, delay: 0.15 }
          : { duration: 0.35, delay: 0.12 }
        }
        style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 528, margin: '0 auto' }}
      >
        <HeroTitle />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {sections.map((section, i) => (
            <Section
              key={i}
              section={section}
              afterContext={i === sections.length - 1 ? <ContributionHeatmap /> : undefined}
            />
          ))}
          <AboutSection />
        </div>
      </motion.div>
    </main>
  )
}
