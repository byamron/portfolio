import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'

const Lottie = lazy(() => import('lottie-react'))
import { useHover } from '@/contexts/HoverContext'
import { useTheme } from '@/contexts/ThemeContext'
import { projectsById, projectImageMap, defaultImageMap } from '@/data/projects'

// Projects whose previews need a subtle shadow to separate from the background
const needsShadow = new Set(['cip-misinfo', 'acorn-covid'])

const summaryStyle: React.CSSProperties = {
  fontFamily: "'Literata', serif",
  fontWeight: 300,
  fontSize: 'var(--text-size-summary)',
}

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Fixed height for text zone — always allocated so the image area never resizes
const TEXT_ZONE_HEIGHT = 120

export function ImageDisplay() {
  const { hoveredProjectId } = useHover()
  const { accentColor, resolvedAppearance, cycleAccent } = useTheme()

  const project = hoveredProjectId ? projectsById[hoveredProjectId] : null
  const lottieUrl = project?.lottiePreview ?? null
  const videoUrl = project?.videoPreview ?? null
  const imageSrc = project
    ? projectImageMap[project.projectId]
    : defaultImageMap[accentColor]
  const contentKey = videoUrl
    ? `video-${project!.id}`
    : lottieUrl
      ? `lottie-${project!.id}`
      : project
        ? project.projectId
        : `default-${accentColor}`

  const summary = project?.summary ?? null
  const isPreview = !!project

  const showShadow = project && needsShadow.has(project.id)
  const dropShadow = showShadow
    ? resolvedAppearance === 'dark'
      ? 'drop-shadow(0 2px 40px rgba(255, 255, 255, 0.1))'
      : 'drop-shadow(0 2px 40px rgba(0, 0, 0, 0.08))'
    : undefined

  const containerRef = useRef<HTMLDivElement>(null)

  const triggerSpringPress = useCallback(() => {
    if (reducedMotion || !containerRef.current) return
    const el = containerRef.current
    el.style.transition = 'none'
    el.style.transform = 'scale(0.985)'
    void el.offsetHeight
    el.style.transition = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
    el.style.transform = 'scale(1)'
  }, [])

  const handleClick = useCallback(() => {
    cycleAccent()
    triggerSpringPress()
    document.dispatchEvent(new CustomEvent('accent-cycled'))
  }, [cycleAccent, triggerSpringPress])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      cycleAccent()
      triggerSpringPress()
      document.dispatchEvent(new CustomEvent('accent-cycled'))
    }
  }, [cycleAccent, triggerSpringPress])

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

  // Portrait fills with cover, previews use contain (no cropping)
  const usePortraitCover = !isPreview

  const imgStyle: React.CSSProperties = usePortraitCover
    ? {
        height: '100%',
        maxWidth: '100%',
        aspectRatio: '528 / 720',
        objectFit: 'cover',
        borderRadius: 32,
        filter: dropShadow,
        viewTransitionName: project && !lottieUrl ? 'project-hero' : undefined,
      }
    : {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        borderRadius: 32,
        filter: dropShadow,
        viewTransitionName: project && !lottieUrl ? 'project-hero' : undefined,
      }

  const imageWrapperStyle: React.CSSProperties = usePortraitCover
    ? {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 32,
      }
    : {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `0 5% ${TEXT_ZONE_HEIGHT + 24}px`,
      }

  return (
    <div
      ref={containerRef}
      data-theme-image
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Cycle accent color"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Live region for screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {project ? project.title : `Portrait, ${accentColor} theme`}
      </div>

      {/* Image */}
      <AnimatePresence mode="sync">
        {videoUrl ? (
          <motion.div
            key={contentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `0 5% ${TEXT_ZONE_HEIGHT + 24}px`,
            }}
          >
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              aria-label={project!.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 32,
                filter: dropShadow,
              }}
            />
          </motion.div>
        ) : lottieUrl && lottieData ? (
          <motion.div
            key={contentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: dropShadow,
              padding: `0 5% ${TEXT_ZONE_HEIGHT + 24}px`,
            }}
          >
            <Suspense fallback={null}>
              <Lottie
                animationData={lottieData}
                loop={false}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </Suspense>
          </motion.div>
        ) : (
          <motion.div
            key={contentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={imageWrapperStyle}
          >
            <img
              src={imageSrc}
              alt={project ? project.title : 'Ben Yamron portrait'}
              style={imgStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary text — absolutely positioned at bottom, no layout impact */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: TEXT_ZONE_HEIGHT,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="sync">
          {summary && (
            <motion.p
              key={contentKey + '-summary'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.3,
                ease: 'easeInOut',
              }}
              style={{
                ...summaryStyle,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                lineHeight: 1.5,
                color: 'var(--text-grey)',
                maxWidth: 540,
                padding: '0 24px',
                textAlign: 'left',
                margin: '0 auto',
              }}
            >
              {summary}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
