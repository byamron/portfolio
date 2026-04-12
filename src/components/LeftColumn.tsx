import { useEffect, useState, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useHover } from '@/contexts/HoverContext'
import { isInitialEntrance, entrancePreset } from '@/utils/entranceState'
import { HeroTitle } from '@/components/HeroTitle'
import { ProjectLink } from '@/components/ProjectLink'
import { AboutSection } from '@/components/AboutSection'
import { SignatureAnimation } from '@/components/SignatureAnimation'
import { ContributionHeatmap } from '@/components/ContributionHeatmap'
import { sections } from '@/data/projects'
import { useTypography } from '@/contexts/TypographyContext'

interface LeftColumnProps {
  fullWidth?: boolean
}

export function LeftColumn({ fullWidth }: LeftColumnProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { fadeOut: fadeOutGlass } = useGlassHighlight(contentRef)
  const { navigatingProjectId } = useHover()
  const { narrativeStyle, sectionHeadingMode } = useTypography()
  const reducedMotion = useReducedMotion()
  const isEntrance = useRef(isInitialEntrance()).current
  const shouldChoreograph = isEntrance && !reducedMotion && !navigatingProjectId
  const [entranceComplete, setEntranceComplete] = useState(!shouldChoreograph)

  const ep = entrancePreset

  // Top-level: staggers hero, each section, and about at ep.stagger intervals
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: ep.containerDelay, staggerChildren: ep.stagger },
    },
  }
  // Hero entrance — direct child, gets its own stagger beat
  const heroVariants = {
    hidden: { opacity: 0, filter: `blur(${ep.blur}px)` },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: ep.childDuration, ease: 'easeOut' } },
  }
  // Section wrapper — no visual change, cascades its children at ep.cascadeStagger
  const sectionVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: ep.cascadeStagger } },
  }
  // Per-element within a section
  const itemVariants = {
    hidden: { opacity: 0, filter: `blur(${ep.blur}px)` },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: ep.childDuration, ease: 'easeOut' } },
  }

  useEffect(() => {
    if (navigatingProjectId) {
      fadeOutGlass()
    }
  }, [navigatingProjectId, fadeOutGlass])
  return (
    <motion.main
      ref={contentRef}
      className="left-column"
      initial={shouldChoreograph ? 'hidden' : { opacity: 0 }}
      animate={navigatingProjectId ? { opacity: 0 } : (shouldChoreograph ? 'visible' : { opacity: 1 })}
      transition={navigatingProjectId
        ? { duration: 0.28, delay: 0.15 }
        : (shouldChoreograph ? undefined : { duration: 0.35, delay: 0.12 })
      }
      variants={shouldChoreograph ? containerVariants : undefined}
      style={{
        width: fullWidth ? '100%' : '50%',
        padding:
          'var(--layout-padding-top) var(--layout-margin)',
        position: 'relative',
        pointerEvents: entranceComplete ? 'auto' : 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <motion.div variants={shouldChoreograph ? heroVariants : undefined}>
          <HeroTitle />
        </motion.div>

        {sections.map((section, i) => (
          <motion.div
            key={i}
            variants={shouldChoreograph ? sectionVariants : undefined}
            style={i > 0 ? { marginTop: 24 } : undefined}
          >
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sectionHeadingMode === 'label' && section.label && (
                <motion.div variants={shouldChoreograph ? itemVariants : undefined}>
                  <h2 style={{
                    fontFamily: "'Literata', serif",
                    fontSize: 'var(--text-size-section-heading)',
                    fontWeight: 300,
                    lineHeight: 1.3,
                    color: 'var(--text-medium)',
                    margin: 0,
                    marginBottom: 4,
                  }}>{section.label}</h2>
                </motion.div>
              )}
              {section.context.map((text, j) => (
                <motion.div key={j} variants={shouldChoreograph ? itemVariants : undefined}>
                  <p style={narrativeStyle}>{text}</p>
                </motion.div>
              ))}
              {i === 1 && (
                <motion.div variants={shouldChoreograph ? itemVariants : undefined}>
                  <ContributionHeatmap displayMode="collapsed" vizGap={16} sparkPos="right" collapseTransition="drawer" />
                </motion.div>
              )}
              {section.projects.map(proj => (
                <motion.div key={proj.id} variants={shouldChoreograph ? itemVariants : undefined}>
                  <ProjectLink project={proj} twoLine statusGap={8} subtitleSize="var(--text-size-caption)" nonLinkUnderline="dotted" titleSubGap={6} />
                </motion.div>
              ))}
            </section>
          </motion.div>
        ))}

        <motion.div
          variants={shouldChoreograph ? sectionVariants : undefined}
          onAnimationComplete={() => { if (shouldChoreograph) setEntranceComplete(true) }}
          style={{ marginTop: 24 }}
        >
          <motion.div variants={shouldChoreograph ? itemVariants : undefined}>
            <AboutSection />
          </motion.div>
          <motion.div variants={shouldChoreograph ? itemVariants : undefined}>
            <SignatureAnimation />
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  )
}
