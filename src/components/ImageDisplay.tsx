import { AnimatePresence, motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'
import { useHover } from '@/contexts/HoverContext'
import { useTheme } from '@/contexts/ThemeContext'
import { projectsById, projectImageMap, defaultImageMap } from '@/data/projects'

// Projects whose previews need a subtle shadow to separate from the background
const needsShadow = new Set(['cip-misinfo', 'acorn-covid'])

export function ImageDisplay() {
  const { hoveredProjectId } = useHover()
  const { accentColor, resolvedAppearance } = useTheme()

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence mode="sync">
        {videoUrl ? (
          <motion.video
            key={contentKey}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
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
        ) : lottieUrl && lottieData ? (
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
  )
}
