import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Vite glob import for all case study markdown files as raw text
const caseStudyModules = import.meta.glob<string>('/src/data/case-studies/*.md', {
  query: '?raw',
  import: 'default',
})

export function CaseStudy() {
  const { slug } = useParams<{ slug: string }>()
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const key = `/src/data/case-studies/${slug}.md`
    const loader = caseStudyModules[key]
    if (loader) {
      loader().then(text => {
        setContent(text)
        setLoading(false)
      })
    } else {
      setContent(null)
      setLoading(false)
    }
  }, [slug])

  return (
    <main
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '64px 40px',
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 400,
      }}
    >
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginBottom: 40,
          fontSize: 18,
          color: 'var(--text-link)',
          textDecoration: 'underline',
          textDecorationColor: 'var(--text-underline)',
          textUnderlineOffset: 4,
        }}
      >
        {'\u2190'} Back
      </Link>

      {loading ? null : content ? (
        <article
          className="case-study-content"
          style={{
            color: 'var(--text-dark)',
            fontSize: 18,
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
        />
      ) : (
        <p style={{ color: 'var(--text-grey)', fontSize: 18 }}>
          Case study not found.
        </p>
      )}
    </main>
  )
}

// Minimal markdown → HTML conversion (headings, paragraphs, bold, italic, links, lists, hr)
function markdownToHtml(md: string): string {
  const lines = md.split('\n')
  const html: string[] = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]!

    // Horizontal rule
    if (/^---+\s*$/.test(line)) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push('<hr style="border: none; border-top: 1px solid var(--text-light-grey); margin: 40px 0; opacity: 0.3;" />')
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h3 style="font-size: 18px; font-weight: 400; color: var(--text-dark); margin: 40px 0 16px;">${inlineFormat(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith('## ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h2 style="font-size: 24px; font-weight: 400; color: var(--text-dark); margin: 40px 0 16px;">${inlineFormat(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      if (inList) { html.push('</ul>'); inList = false }
      html.push(`<h1 style="font-size: 36px; font-weight: 400; line-height: 1.2; color: var(--text-dark); margin: 0 0 24px;">${inlineFormat(line.slice(2))}</h1>`)
      continue
    }

    // Unordered list
    if (/^[-*] /.test(line)) {
      if (!inList) { html.push('<ul style="padding-left: 24px; margin: 8px 0;">'); inList = true }
      html.push(`<li style="margin: 4px 0; color: var(--text-medium);">${inlineFormat(line.slice(2))}</li>`)
      continue
    }

    // Close list if line is not a list item
    if (inList && line.trim() === '') {
      html.push('</ul>')
      inList = false
      continue
    }

    // Empty line
    if (line.trim() === '') continue

    // Paragraph
    if (inList) { html.push('</ul>'); inList = false }
    html.push(`<p style="margin: 16px 0; color: var(--text-medium);">${inlineFormat(line)}</p>`)
  }

  if (inList) html.push('</ul>')
  return html.join('\n')
}

// Inline formatting: bold, italic, links
function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 400; color: var(--text-dark);">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: var(--text-link); text-decoration: underline; text-decoration-color: var(--text-underline);">$1</a>')
}
