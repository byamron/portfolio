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

  // Content container — delays then cascades all children at 80ms
  const contentVariants = {
    hidden: {},
    visible: { transition: { delayChildren: ep.cascadeDelay, staggerChildren: ep.cascadeStagger } },
  }
  // Each content element — simple opacity fade
  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: ep.itemDuration, ease: 'easeOut' } },
  }

  // Suppress background transition during entrance to avoid competing repaints
  useEffect(() => {
    if (!shouldChoreograph) return
    document.body.classList.add('entrance-active')
    return () => { document.body.classList.remove('entrance-active') }
  }, [shouldChoreograph])

  // If choreography is cancelled mid-entrance, unblock pointer events
  const wasChoreographing = useRef(shouldChoreograph)
  useEffect(() => {
    if (wasChoreographing.current && !shouldChoreograph) {
      setEntranceComplete(true)
    }
    wasChoreographing.current = shouldChoreograph
  }, [shouldChoreograph])

  // Safety net: force entranceComplete after 3s
  useEffect(() => {
    if (entranceComplete) return
    const timer = setTimeout(() => setEntranceComplete(true), 3000)
    return () => clearTimeout(timer)
  }, [entranceComplete])

  useEffect(() => {
    if (navigatingProjectId) {
      fadeOutGlass()
    }
  }, [navigatingProjectId, fadeOutGlass])
  return (
    <motion.main
      ref={contentRef}
      className="left-column"
      initial={shouldChoreograph ? { opacity: 1 } : { opacity: 0 }}
      animate={navigatingProjectId ? { opacity: 0 } : { opacity: 1 }}
      transition={navigatingProjectId
        ? { duration: 0.28, delay: 0.15 }
        : (shouldChoreograph ? undefined : { duration: 0.35, delay: 0.12 })
      }
      style={{
        width: fullWidth ? '100%' : '50%',
        padding:
          'var(--layout-padding-top) var(--layout-margin)',
        position: 'relative',
        pointerEvents: entranceComplete ? 'auto' : 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 56, maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        <motion.div
          initial={shouldChoreograph ? { opacity: 0 } : undefined}
          animate={shouldChoreograph ? { opacity: 1 } : undefined}
          transition={shouldChoreograph ? { duration: ep.heroDuration, delay: ep.heroDelay, ease: 'easeOut' } : undefined}
        >
          <HeroTitle />
        </motion.div>

        <motion.div
          variants={shouldChoreograph ? contentVariants : undefined}
          initial={shouldChoreograph ? 'hidden' : undefined}
          animate={shouldChoreograph ? 'visible' : undefined}
          onAnimationComplete={() => { if (shouldChoreograph) setEntranceComplete(true) }}
        >
          {sections.map((section, i) => (
            <motion.div
              key={i}
              variants={shouldChoreograph ? itemVariants : undefined}
              style={i > 0 ? { marginTop: 56 } : undefined}
            >
              <section style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sectionHeadingMode === 'label' && section.label && (
                  <h2 style={{
                    fontFamily: "'Literata', serif",
                    fontSize: 'var(--text-size-section-heading)',
                    fontWeight: 300,
                    lineHeight: 1.3,
                    color: 'var(--text-medium)',
                    margin: 0,
                    marginBottom: 12,
                  }}>{section.label}</h2>
                )}
                {section.context.map((text, j) => (
                  <p key={j} style={{ ...narrativeStyle, marginBottom: 12 }}>{text}</p>
                ))}
                {i === 1 && (
                  <div style={{ marginBottom: 12 }}>
                    <ContributionHeatmap displayMode="collapsed" vizGap={16} sparkPos="right" collapseTransition="drawer" />
                  </div>
                )}
                {section.projects.map(proj => (
                  <ProjectLink key={proj.id} project={proj} twoLine statusGap={8} subtitleSize="var(--text-size-caption)" nonLinkUnderline="dotted" titleSubGap={6} />
                ))}
              </section>
            </motion.div>
          ))}

          <motion.div variants={shouldChoreograph ? itemVariants : undefined} style={{ marginTop: 56 }}>
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
