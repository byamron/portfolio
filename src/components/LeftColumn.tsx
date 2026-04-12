import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGlassHighlight, GLASS_DEFAULTS } from '@/hooks/useGlassHighlight'
import { useHover } from '@/contexts/HoverContext'
import { HeroTitle } from '@/components/HeroTitle'
import { ProjectLink } from '@/components/ProjectLink'
import { AboutSection } from '@/components/AboutSection'
import { SignatureAnimation } from '@/components/SignatureAnimation'
import { ContributionHeatmap } from '@/components/ContributionHeatmap'
import { GlassLightTuner } from '@/components/GlassLightTuner'
import { sections } from '@/data/projects'
import { useTypography } from '@/contexts/TypographyContext'

interface LeftColumnProps {
  fullWidth?: boolean
}

export function LeftColumn({ fullWidth }: LeftColumnProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { navigatingProjectId } = useHover()
  const { narrativeStyle, sectionHeadingMode } = useTypography()

  // DEV: light mode cursor tuning state
  const [lightTuning, setLightTuning] = useState({
    lightCursorIntensity: GLASS_DEFAULTS.lightCursorIntensity,
    lightCursorSaturation: GLASS_DEFAULTS.lightCursorSaturation,
    lightCursorLightness: GLASS_DEFAULTS.lightCursorLightness,
    lightEdgeIntensity: GLASS_DEFAULTS.lightEdgeIntensity,
  })

  const { fadeOut: fadeOutGlass } = useGlassHighlight(contentRef, lightTuning)

  useEffect(() => {
    if (navigatingProjectId) {
      fadeOutGlass()
    }
  }, [navigatingProjectId, fadeOutGlass])
  return (
    <>
      <motion.main
        ref={contentRef}
        className="left-column"
        initial={{ opacity: 0 }}
        animate={{ opacity: navigatingProjectId ? 0 : 1 }}
        transition={navigatingProjectId
          ? { duration: 0.28, delay: 0.15 }
          : { duration: 0.35, delay: 0.12 }
        }
        style={{
          width: fullWidth ? '100%' : '50%',
          padding:
            'var(--layout-padding-top) var(--layout-margin)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
          <HeroTitle />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>

            {sections.map((section, i) => (
              <section key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sectionHeadingMode === 'label' && section.label && (
                  <h2 style={{
                    fontFamily: "'Literata', serif",
                    fontSize: 'var(--text-size-section-heading)',
                    fontWeight: 300,
                    lineHeight: 1.3,
                    color: 'var(--text-medium)',
                    margin: 0,
                    marginBottom: 4,
                  }}>{section.label}</h2>
                )}
                {section.context.map((text, j) => (
                  <p key={j} style={narrativeStyle}>{text}</p>
                ))}
                {/* Heatmap between narrative and project cards for personal projects (index 1) */}
                {i === 1 && <ContributionHeatmap displayMode="collapsed" vizGap={16} sparkPos="right" collapseTransition="drawer" />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {section.projects.map(proj => (
                    <ProjectLink key={proj.id} project={proj} twoLine statusGap={8} subtitleSize="var(--text-size-caption)" nonLinkUnderline="dotted" titleSubGap={6} />
                  ))}
                </div>
              </section>
            ))}

            <AboutSection />
            <SignatureAnimation />

          </div>
        </div>
      </motion.main>
      {/* DEV ONLY — remove before merging to main */}
      <GlassLightTuner
        values={lightTuning}
        onChange={(v) => setLightTuning(prev => ({ ...prev, ...v }))}
      />
    </>
  )
}
