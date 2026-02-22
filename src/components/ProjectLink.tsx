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
          padding: '24px 16px',
          margin: '0 -16px',
          width: 'fit-content',
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
        padding: '24px 16px',
        margin: '0 -16px',
        width: 'fit-content',
        borderRadius: 16,
        fontSize: 18,
        lineHeight: 1.4,
        color: 'var(--text-dark)',
        textDecoration: 'underline',
        textDecorationColor: 'var(--text-underline)',
        textUnderlineOffset: 4,
        border: '0.1px solid transparent',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <span>{project.title}</span>
      <span style={{ flexShrink: 0 }}>{'\u2192'}</span>
    </a>
  )
}
