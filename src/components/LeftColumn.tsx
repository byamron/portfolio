import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useHover } from '@/contexts/HoverContext'
import { HeroTitle } from '@/components/HeroTitle'
import { ProjectLink } from '@/components/ProjectLink'
import { AboutSection } from '@/components/AboutSection'
import { SignatureAnimation } from '@/components/SignatureAnimation'
import { ContributionHeatmap } from '@/components/ContributionHeatmap'
import { projectsById } from '@/data/projects'
import { preloadPreviewImages } from '@/utils/preloadImages'

const narrativeStyle: React.CSSProperties = {
  fontFamily: "'Literata', serif",
  fontSize: 'var(--text-size-narrative)',
  fontWeight: 300,
  lineHeight: 1.4,
  color: 'var(--text-grey)',
}

// Canonical display order
const cardOrder = [
  'mochi-ai-tooling', 'todo-priority', 'detect-manip',
  'mochi-tracker', 'mochi-billing',
  'sony-screenless', 'uw-system', 'cip-misinfo',
  'duo-flags', 'acorn-covid',
].map(id => projectsById[id])

interface LeftColumnProps {
  fullWidth?: boolean
}

export function LeftColumn({ fullWidth }: LeftColumnProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { fadeOut: fadeOutGlass } = useGlassHighlight(contentRef)
  const { navigatingProjectId } = useHover()

  useEffect(() => {
    if (navigatingProjectId) {
      fadeOutGlass(280, 150)
    }
  }, [navigatingProjectId, fadeOutGlass])
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

          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={narrativeStyle}>
              I own product problems{'\u2009'}&mdash;{'\u2009'}from setting direction with leadership to shipping the details. Lately, that means building AI into how my team designs and ships.
            </p>
            <p style={narrativeStyle}>
              Outside of work, I'm always building{'\u2009'}&mdash;{'\u2009'}apps, tools, experiments. I try to ship something every day.
            </p>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cardOrder.map(proj => (
              <ProjectLink key={proj.id} project={proj} twoLine />
            ))}
          </section>

          <ContributionHeatmap />

          <AboutSection />
          <SignatureAnimation />
        </div>
      </motion.div>
    </main>
  )
}
