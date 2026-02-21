import { useCallback } from 'react'
import { useHoverContext } from '@/contexts/HoverContext'
import type { Project } from '@/data/projects'

interface ProjectLinkProps {
  project: Project
}

export function ProjectLink({ project }: ProjectLinkProps) {
  const { setHoveredProjectId } = useHoverContext()

  const handleEnter = useCallback(() => setHoveredProjectId(project.id), [project.id, setHoveredProjectId])
  const handleLeave = useCallback(() => setHoveredProjectId(null), [setHoveredProjectId])

  if (!project.isLink) {
    return (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 12px',
          fontSize: 18,
          lineHeight: 1.4,
          color: 'var(--text-grey)',
        }}
      >
        {project.title}
      </span>
    )
  }

  return (
    <a
      href={project.href}
      data-link-card=""
      data-project-id={project.id}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '8px 12px',
        fontSize: 18,
        lineHeight: 1.4,
        color: 'var(--text-dark)',
        textDecoration: 'underline',
        textDecorationColor: 'var(--text-underline)',
        textUnderlineOffset: 3,
        borderRadius: 0,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <span>{project.title}</span>
      <span style={{ flexShrink: 0 }}>{'\u2192'}</span>
    </a>
  )
}
