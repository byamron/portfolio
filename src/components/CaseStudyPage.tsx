import { useParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { caseStudiesBySlug } from '@/data/case-study-content'
import { CaseStudyLayoutA } from './CaseStudyLayoutA'
import { useIsWide } from '@/hooks/useMediaQuery'

export function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const isWide = useIsWide()
  const caseStudy = slug ? caseStudiesBySlug[slug] : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!caseStudy) {
    return (
      <main
        style={{
          padding: 'var(--layout-padding-top) var(--layout-margin)',
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginBottom: 40,
            fontSize: 18,
            color: 'var(--text-dark)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--text-underline)',
            textUnderlineOffset: 4,
          }}
        >
          {'\u2190'} Back
        </Link>
        <p style={{ color: 'var(--text-grey)', fontSize: 18 }}>
          Case study not found.
        </p>
      </main>
    )
  }

  return (
    <>
      {/* Top fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 20,
          pointerEvents: 'none',
          zIndex: 100,
          background: 'linear-gradient(to bottom, var(--bg), transparent)',
        }}
      />
      {/* Bottom fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 20,
          pointerEvents: 'none',
          zIndex: 100,
          background: 'linear-gradient(to top, var(--bg), transparent)',
        }}
      />

      <nav style={{ padding: '24px var(--layout-margin) 0' }}>
        <Link
          to="/"
          style={{
            fontSize: 18,
            color: 'var(--text-dark)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--text-underline)',
            textUnderlineOffset: 4,
          }}
        >
          {'\u2190'} Back
        </Link>
      </nav>

      <CaseStudyLayoutA data={caseStudy} isNarrow={!isWide} />
    </>
  )
}
