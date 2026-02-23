import { AnimatePresence, motion } from 'framer-motion'
import { useHover } from '@/contexts/HoverContext'
import { useTheme } from '@/contexts/ThemeContext'
import { projectsById, projectImageMap, defaultImageMap } from '@/data/projects'

export function ImageDisplay() {
  const { hoveredProjectId } = useHover()
  const { accentColor } = useTheme()

  const project = hoveredProjectId ? projectsById[hoveredProjectId] : null
  const imageSrc = project
    ? projectImageMap[project.projectId]
    : defaultImageMap[accentColor]
  const imageKey = project ? project.projectId : `default-${accentColor}`

  return (
    <div
      aria-live="polite"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 528,
        aspectRatio: '528 / 720',
        borderRadius: 32,
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="sync">
        <motion.img
          key={imageKey}
          src={imageSrc}
          alt={project ? project.title : 'Ben Yamron portrait'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 32,
          }}
        />
      </AnimatePresence>
    </div>
  )
}
