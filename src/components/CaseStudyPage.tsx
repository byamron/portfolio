import { useParams, Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { caseStudiesBySlug } from '@/data/case-study-content'
import { CaseStudyLayoutA } from './CaseStudyLayoutA'
import { useIsWide } from '@/hooks/useMediaQuery'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useHover } from '@/contexts/HoverContext'

export function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const isWide = useIsWide()
  const caseStudy = slug ? caseStudiesBySlug[slug] : undefined
  const { setHoveredProjectId, setHoveringLink } = useHover()

  const navRef = useRef<HTMLElement>(null)
  useGlassHighlight(navRef, {
    borderRadius: 8,
    maxPull: 3,
    tightBounds: true,
    clearDelay: 300,
    cardSelector: '[data-back-link]',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    setHoveredProjectId(null)
    setHoveringLink(false)
  }, [slug, setHoveredProjectId, setHoveringLink])

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
          data-back-link
          onMouseEnter={() => setHoveringLink(true)}
          onMouseLeave={() => setHoveringLink(false)}
          style={{
            display: 'inline-block',
            padding: '8px 12px',
            margin: '0 -12px 40px',
            fontSize: 18,
            fontFamily: "'Onest', sans-serif",
            fontWeight: 400,
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

      <nav
        ref={navRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '24px var(--layout-margin) 0',
          pointerEvents: 'none',
        }}
      >
        <Link
          to="/"
          data-back-link
          onMouseEnter={() => setHoveringLink(true)}
          onMouseLeave={() => setHoveringLink(false)}
          style={{
            display: 'inline-block',
            pointerEvents: 'auto',
            padding: '8px 12px',
            margin: '0 -12px',
            borderRadius: 8,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            fontSize: 18,
            fontFamily: "'Onest', sans-serif",
            fontWeight: 400,
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
