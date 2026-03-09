import { useParams, Link, useNavigate } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { caseStudiesBySlug } from '@/data/case-study-content'
import { getProjectForSlug, projectImageMap } from '@/data/projects'
import { CaseStudyLayoutA } from './CaseStudyLayoutA'
import { useIsWide } from '@/hooks/useMediaQuery'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useHover } from '@/contexts/HoverContext'

export function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const isWide = useIsWide()
  const navigate = useNavigate()
  const caseStudy = slug ? caseStudiesBySlug[slug] : undefined
  const projectData = slug ? getProjectForSlug(slug) : undefined
  const previewImage = projectData ? projectImageMap[projectData.projectId] : undefined
  const { setHoveredProjectId, setHoveringLink } = useHover()
  const [isExiting, setIsExiting] = useState(false)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doBack = useCallback(() => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => navigate('/'))
        window.scrollTo(0, 0)
      })
    } else {
      navigate('/')
    }
  }, [navigate])

  const handleBack = useCallback((e: React.MouseEvent) => {
    // Cmd/Ctrl+click: let browser handle natively
    if (e.metaKey || e.ctrlKey || e.button === 1) return
    e.preventDefault()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doBack()
      return
    }
    setIsExiting(true)
    exitTimer.current = setTimeout(doBack, 280)
  }, [doBack])

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
    return () => { if (exitTimer.current) clearTimeout(exitTimer.current) }
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
          onClick={handleBack}
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
    <motion.div
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.28 }}
    >
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
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
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
          onClick={handleBack}
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

      <CaseStudyLayoutA data={caseStudy} isNarrow={!isWide} previewImage={previewImage} />
    </motion.div>
  )
}
