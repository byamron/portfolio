const paragraphs = [
  'I like working through ambiguous problems, leading 0-to-1 efforts, doing product strategy work, and getting in the weeds with engineers.',
  'I feel fulfilled working on experiences related to health, community, and other human stuff.',
  'You can say hi if you see me running around SF, or you can <a href="mailto:ben.yamron@icloud.com">contact me</a>.',
]

export function AboutSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {paragraphs.map((text, i) => (
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
    </section>
  )
}
