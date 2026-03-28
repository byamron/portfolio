import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useHover } from '@/contexts/HoverContext'
import { HeroTitle } from '@/components/HeroTitle'
import { ProjectLink } from '@/components/ProjectLink'
import { AboutSection } from '@/components/AboutSection'
import { SignatureAnimation } from '@/components/SignatureAnimation'
import { ContributionHeatmap } from '@/components/ContributionHeatmap'
import { sections } from '@/data/projects'
import { narrativeStyle } from '@/styles/shared'

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
        style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 'var(--content-max-width)', margin: '0 auto' }}
      >
        <HeroTitle />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>

          {sections.map((section, i) => (
            <section key={i} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {section.context.map((text, j) => (
                <p key={j} style={narrativeStyle}>{text}</p>
              ))}
              {/* Heatmap between narrative and project cards for personal projects (index 1) */}
              {i === 1 && <ContributionHeatmap displayMode="collapsed" vizGap={16} sparkPos="right" collapseTransition="drawer" />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {section.projects.map(proj => (
                  <ProjectLink key={proj.id} project={proj} twoLine statusGap={8} subtitleSize="var(--text-size-summary)" nonLinkUnderline="dotted" titleSubGap={6} />
                ))}
              </div>
            </section>
          ))}

          <AboutSection />
          <SignatureAnimation />

        </div>
      </motion.div>
    </main>
  )
}
