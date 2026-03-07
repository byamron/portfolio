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
      <div
        data-link-card
        data-project-id={project.id}
        onMouseEnter={() => setHoveredProjectId(project.id)}
        onMouseLeave={() => setHoveredProjectId(null)}
        style={{
          display: 'inline-block',
          width: 'fit-content',
          alignSelf: 'flex-start',
          padding: '24px 16px',
          margin: '0 -16px',
          borderRadius: 16,
          fontSize: 18,
          fontWeight: 400,
          lineHeight: 1.4,
          color: 'var(--text-medium)',
          border: '0.1px solid transparent',
        }}
      >
        {project.title}{' '}<span aria-hidden="true" style={{ opacity: 0.5 }}>{'\u2026'}</span>
      </div>
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
      display: 'inline-block' as const,
      width: 'fit-content' as const,
      alignSelf: 'flex-start' as const,
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
      {project.title}{' '}<span aria-hidden="true">{'\u2192'}</span>
    </>
  )

  const isInternal = project.href.startsWith('/')

  if (isInternal) {
    return <Link to={project.href} {...linkProps}>{children}</Link>
  }

  return <a href={project.href} {...linkProps}>{children}</a>
}
