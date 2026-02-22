import { ProjectLink } from './ProjectLink'
import type { ContentSection } from '@/data/projects'

interface SectionProps {
  section: ContentSection
}

export function Section({ section }: SectionProps) {
  return (
    <section>
      {section.contextParagraphs.map((p, i) => (
        <p
          key={i}
          dangerouslySetInnerHTML={{ __html: p }}
          style={{
            fontSize: 18,
            lineHeight: 1.2,
            color: 'var(--text-medium)',
            marginBottom: i < section.contextParagraphs.length - 1 ? 8 : 24,
          }}
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
