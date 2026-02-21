export function AboutSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 18, lineHeight: 1.2, color: 'var(--text-medium)' }}>
        I like working through ambiguous problems, leading 0-to-1 efforts, doing product strategy work, and getting in the weeds with engineers.
      </p>
      <p style={{ fontSize: 18, lineHeight: 1.2, color: 'var(--text-medium)' }}>
        I feel fulfilled working on experiences related to health, community, and other human stuff.
      </p>
      <p style={{ fontSize: 18, lineHeight: 1.2, color: 'var(--text-medium)' }}>
        You can say hi if you see me running around SF, or you can{' '}
        <a href="mailto:ben.yamron@icloud.com" style={{ color: 'var(--text-link)', textDecoration: 'underline', textDecorationColor: 'var(--text-underline)' }}>
          contact me
        </a>.
      </p>
    </section>
  )
}
