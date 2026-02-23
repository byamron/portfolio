import { Link } from 'react-router-dom'
import { useHover } from '@/contexts/HoverContext'
import type { Project } from '@/data/projects'

interface ProjectLinkProps {
  project: Project
}

export function ProjectLink({ project }: ProjectLinkProps) {
  const { setHoveredProjectId } = useHover()

  if (!project.isLink) {
    return (
      <p
        style={{
          fontSize: 18,
          fontWeight: 400,
          lineHeight: 1.4,
          color: 'var(--text-grey)',
        }}
      >
        {project.title}
      </p>
    )
  }

  const linkProps = {
    'data-link-card': true as const,
    'data-project-id': project.id,
    onMouseEnter: () => setHoveredProjectId(project.id),
    onMouseLeave: () => setHoveredProjectId(null),
    onFocus: () => setHoveredProjectId(project.id),
    onBlur: () => setHoveredProjectId(null),
    style: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      gap: 4,
      width: 'fit-content' as const,
      padding: '24px 16px',
      margin: '0 -16px',
      borderRadius: 16,
      fontSize: 18,
      fontWeight: 400,
      lineHeight: 1.4,
      color: 'var(--text-dark)',
      textDecoration: 'underline' as const,
      textDecorationColor: 'var(--text-underline)',
      textUnderlineOffset: 4,
      border: '0.1px solid transparent',
    },
  }

  const children = (
    <>
      <span>{project.title}</span>
      <span style={{ flexShrink: 0 }} aria-hidden="true">{'\u2192'}</span>
    </>
  )

  const isInternal = project.href.startsWith('/')

  if (isInternal) {
    return <Link to={project.href} {...linkProps}>{children}</Link>
  }

  return <a href={project.href} {...linkProps}>{children}</a>
}
