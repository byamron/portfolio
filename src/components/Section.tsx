import { ProjectLink } from '@/components/ProjectLink'
import type { Section as SectionType } from '@/data/projects'

interface SectionProps {
  section: SectionType
  afterContext?: React.ReactNode
}

export function Section({ section, afterContext }: SectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {section.context.map((text, i) => (
          <p
            key={i}
            style={{
              fontFamily: "'Literata', serif",
              fontSize: 'var(--text-size-narrative)',
              fontWeight: 300,
              lineHeight: 1.4,
              color: 'var(--text-grey)',
            }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        ))}
      </div>
      {afterContext}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 32 }}>
        {section.projects.map(project => (
          <ProjectLink key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
