interface CaseStudySectionTextProps {
  heading: string
  paragraphs: string[]
}

export function CaseStudySectionText({
  heading,
  paragraphs,
}: CaseStudySectionTextProps) {
  return (
    <section>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 300,
          lineHeight: 1.2,
          color: 'var(--text-dark)',
          marginBottom: 16,
        }}
      >
        {heading}
      </h2>
      {paragraphs.map((text, i) => (
        <p
          key={i}
          style={{
            fontSize: 18,
            lineHeight: 1.4,
            color: 'var(--text-medium)',
            marginBottom: i < paragraphs.length - 1 ? 24 : 0,
          }}
        >
          {text}
        </p>
      ))}
    </section>
  )
}
