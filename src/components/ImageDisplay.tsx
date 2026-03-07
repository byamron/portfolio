import { AnimatePresence, motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'
import { useHover } from '@/contexts/HoverContext'
import { useTheme } from '@/contexts/ThemeContext'
import { projectsById, projectImageMap, defaultImageMap } from '@/data/projects'

// Projects whose previews need a subtle shadow to separate from the background
const needsShadow = new Set(['cip-misinfo', 'acorn-covid'])

// Toggle between 'serif' and 'sans' to compare font treatments
const SUMMARY_FONT: 'serif' | 'sans' = 'serif'

const summaryStyles: Record<'serif' | 'sans', React.CSSProperties> = {
  serif: {
    fontFamily: "'Literata', serif",
    fontWeight: 300,
    fontSize: 15,
  },
  sans: {
    fontFamily: "'Onest', sans-serif",
    fontWeight: 400,
    fontSize: 14,
  },
}

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Fixed height for text zone — always allocated so the image area never resizes
const TEXT_ZONE_HEIGHT = 120

export function ImageDisplay() {
  const { hoveredProjectId } = useHover()
  const { accentColor, resolvedAppearance } = useTheme()

  const project = hoveredProjectId ? projectsById[hoveredProjectId] : null
  const lottieUrl = project?.lottiePreview ?? null
  const imageSrc = project
    ? projectImageMap[project.projectId]
    : defaultImageMap[accentColor]
  const contentKey = lottieUrl
    ? `lottie-${project!.id}`
    : project
      ? project.projectId
      : `default-${accentColor}`

  const summary = project?.summary ?? null

  const showShadow = project && needsShadow.has(project.id)
  const dropShadow = showShadow
    ? resolvedAppearance === 'dark'
      ? 'drop-shadow(0 2px 40px rgba(255, 255, 255, 0.1))'
      : 'drop-shadow(0 2px 40px rgba(0, 0, 0, 0.08))'
    : undefined

  const [lottieData, setLottieData] = useState<object | null>(null)

  useEffect(() => {
    if (!lottieUrl) {
      setLottieData(null)
      return
    }
    let cancelled = false
    fetch(lottieUrl)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setLottieData(data)
      })
      .catch(() => {
        if (!cancelled) setLottieData(null)
      })
    return () => { cancelled = true }
  }, [lottieUrl])

  return (
    <div
      aria-live="polite"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <AnimatePresence mode="sync">
        {/* Each state (portrait or project preview) is a single crossfade unit
            containing both image + text zone with identical layout structure.
            The text zone is always allocated so the image area never changes size. */}
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Image area — flex: 1, always same height regardless of text */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 0,
            }}
          >
            {lottieUrl && lottieData ? (
              <Lottie
                animationData={lottieData}
                loop={false}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  filter: dropShadow,
                }}
              />
            ) : (
              <img
                src={imageSrc}
                alt={project ? project.title : 'Ben Yamron portrait'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 32,
                  filter: dropShadow,
                }}
              />
            )}
          </div>

          {/* Text zone — always present, fixed height, never changes image sizing */}
          <div
            style={{
              width: '100%',
              height: TEXT_ZONE_HEIGHT,
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <AnimatePresence mode="sync">
              {summary && (
                <motion.p
                  key={project?.id ?? 'none'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.3,
                    ease: 'easeInOut',
                  }}
                  style={{
                    ...summaryStyles[SUMMARY_FONT],
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    lineHeight: 1.5,
                    color: 'var(--text-grey)',
                    maxWidth: 480,
                    padding: '0 24px',
                    textAlign: 'left',
                    margin: 0,
                  }}
                >
                  {summary}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
