import { ProjectLink } from '@/components/ProjectLink'
import type { Section as SectionType } from '@/data/projects'

interface SectionProps {
  section: SectionType
}

export function Section({ section }: SectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {section.context.map((text, i) => (
        <p
          key={i}
          style={{
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--text-medium)',
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {section.projects.map(project => (
          <ProjectLink key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
