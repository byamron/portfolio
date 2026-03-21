import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useHover } from '@/contexts/HoverContext'
import { HeroTitle } from '@/components/HeroTitle'
import { Section } from '@/components/Section'
import { AboutSection } from '@/components/AboutSection'
import { ContributionHeatmap } from '@/components/ContributionHeatmap'
import { sections } from '@/data/projects'
import { preloadPreviewImages } from '@/utils/preloadImages'

interface LeftColumnProps {
  fullWidth?: boolean
}

export function LeftColumn({ fullWidth }: LeftColumnProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(contentRef)
  const { navigatingProjectId } = useHover()
  const previewsPreloaded = useRef(false)
  const handleMouseEnter = useCallback(() => {
    if (!previewsPreloaded.current) {
      previewsPreloaded.current = true
      preloadPreviewImages()
    }
  }, [])

  return (
    <main
      ref={contentRef}
      className="left-column"
      onMouseEnter={handleMouseEnter}
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
        style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 'var(--content-max-width)', margin: '0 auto' }}
      >
        <HeroTitle />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {sections.map((section, i) => (
            <Section
              key={i}
              section={section}
              afterContext={i === 1 ? <ContributionHeatmap /> : undefined}
            />
          ))}
          <AboutSection />
        </div>
      </motion.div>
    </main>
  )
}
