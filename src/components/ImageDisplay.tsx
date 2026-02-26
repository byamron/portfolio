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
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: summary ? 20 : 0,
      }}
    >
      {/* Image area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: '1 1 0',
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="sync">
          {lottieUrl && lottieData ? (
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
                alignItems: 'center',
                justifyContent: 'center',
                filter: dropShadow,
              }}
            >
              <Lottie
                animationData={lottieData}
                loop={false}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </motion.div>
          ) : (
            <motion.img
              key={contentKey}
              src={imageSrc}
              alt={project ? project.title : 'Ben Yamron portrait'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 32,
                filter: dropShadow,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Summary text area */}
      <AnimatePresence mode="sync">
        {summary && (
          <motion.p
            key={contentKey + '-summary'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.3,
              delay: reducedMotion ? 0 : 0.15,
              ease: 'easeInOut',
            }}
            style={{
              ...summaryStyles[SUMMARY_FONT],
              lineHeight: 1.5,
              color: 'var(--text-grey)',
              maxWidth: 480,
              padding: '0 24px',
              textAlign: 'left',
              margin: 0,
              flexShrink: 0,
            }}
          >
            {summary}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
