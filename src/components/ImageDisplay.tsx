import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'

const Lottie = lazy(() => import('lottie-react'))
import { useHover } from '@/contexts/HoverContext'
import { useTheme } from '@/contexts/ThemeContext'
import { projectsById, projectImageMap, defaultImageMap, linkPreviews } from '@/data/projects'

// Projects whose previews need a subtle shadow to separate from the background
const needsShadow = new Set(['cip-misinfo', 'acorn-covid', 'duo-flags'])

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
  const { hoveredProjectId, hoveredLinkId } = useHover()
  const { accentColor, resolvedAppearance, cycleAccent } = useTheme()

  const project = hoveredProjectId ? projectsById[hoveredProjectId] : null
  const linkPreview = hoveredLinkId ? linkPreviews[hoveredLinkId] ?? null : null
  const lottieUrl = project?.lottiePreview ?? null
  const videoUrl = linkPreview?.video ?? project?.videoPreview ?? null
  const imageSrc = linkPreview
    ? linkPreview.image ?? null
    : project
      ? (projectImageMap[project.projectId] ?? defaultImageMap[accentColor])
      : defaultImageMap[accentColor]
  const contentKey = linkPreview
    ? `link-${linkPreview.id}`
    : videoUrl
      ? `video-${project!.id}`
      : lottieUrl
        ? `lottie-${project!.id}`
        : project
          ? project.projectId
          : `default-${accentColor}`

  const summary = linkPreview?.summary ?? project?.summary ?? null

  const showShadow = linkPreview || (project && needsShadow.has(project.id))
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

  // Portraits fill with cover; link previews and project previews use contain
  const isPortrait = !project && !linkPreview

  const imgStyle: React.CSSProperties = isPortrait
    ? {
        height: '100%',
        maxWidth: '100%',
        aspectRatio: '528 / 720',
        objectFit: 'cover',
        borderRadius: 32,
        filter: dropShadow,
      }
    : {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        borderRadius: 32,
        filter: dropShadow,
        viewTransitionName: project && !lottieUrl ? 'project-hero' : undefined,
      }

  const imageWrapperStyle: React.CSSProperties = isPortrait
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
        {linkPreview ? linkPreview.alt : project ? project.title : `Portrait, ${accentColor} theme`}
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
              aria-label={linkPreview?.alt ?? project!.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: project?.id === 'sony-screenless' ? 'cover' : 'contain',
                aspectRatio: project?.id === 'sony-screenless' ? '4 / 3' : undefined,
                borderRadius: 32,
                filter: dropShadow,
                viewTransitionName: project ? 'project-hero' : undefined,
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
              <div style={{ maxWidth: '100%', maxHeight: '100%', viewTransitionName: 'project-hero' }}>
                <Lottie
                  animationData={lottieData}
                  loop={false}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
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
              src={imageSrc!}
              alt={linkPreview ? linkPreview.alt : project ? project.title : 'Ben Yamron portrait'}
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
            <motion.div
              key={contentKey + '-summary'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.3,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <p
                style={{
                  ...summaryStyle,
                  lineHeight: 1.5,
                  color: 'var(--text-grey)',
                  maxWidth: 540,
                  padding: '0 24px',
                  textAlign: 'left',
                  margin: '0 auto',
                }}
              >
                {summary}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
