const paragraphs = [
  'I like working through ambiguous problems, leading 0-to-1 efforts, doing product strategy work, and getting in the weeds with engineers.',
  'I feel fulfilled working on experiences related to health, community, and other human stuff.',
  'You can say hi if you see me running around SF, or you can contact me via <a href="mailto:ben.yamron@icloud.com">email</a> or on <a href="https://www.linkedin.com/in/benyamron" target="_blank" rel="noopener noreferrer">LinkedIn</a>.',
  'Just lurking? Take a look at my <a href="/ben-yamron-resume.pdf" target="_blank" rel="noopener noreferrer">resume</a>.',
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
            color: 'var(--text-grey)',
          }}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      ))}
    </section>
  )
}
