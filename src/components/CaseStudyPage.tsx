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

const BACK_ARROW_SLIDE_MS = 500

// Windup → slide-left animation (mirror of ProjectLink's arrowSlideOut).
// Brief pull-forward (anticipation), then accelerate out to the left.
const BACK_ARROW_KEYFRAMES = `
@keyframes arrowSlideOutLeft {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  30% {
    transform: translateX(20%);
    opacity: 1;
  }
  100% {
    transform: translateX(-110%);
    opacity: 0;
  }
}
`

let backKeyframesInjected = false
function ensureBackKeyframes() {
  if (backKeyframesInjected) return
  const style = document.createElement('style')
  style.textContent = BACK_ARROW_KEYFRAMES
  document.head.appendChild(style)
  backKeyframesInjected = true
}

export function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const isWide = useIsWide()
  const navigate = useNavigate()
  const caseStudy = slug ? caseStudiesBySlug[slug] : undefined
  const projectData = slug ? getProjectForSlug(slug) : undefined
  const previewImage = projectData ? projectImageMap[projectData.projectId] : undefined
  const { setHoveredProjectId, setHoveringLink, setNavigatingProjectId } = useHover()
  const [isExiting, setIsExiting] = useState(false)
  const [isSliding, setIsSliding] = useState(false)
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doBack = useCallback(() => {
    setNavigatingProjectId(null)
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => navigate('/'))
        window.scrollTo(0, 0)
      })
    } else {
      navigate('/')
    }
  }, [navigate, setNavigatingProjectId])

  const handleBack = useCallback((e: React.MouseEvent) => {
    // Cmd/Ctrl+click: let browser handle natively
    if (e.metaKey || e.ctrlKey || e.button === 1) return
    e.preventDefault()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doBack()
      return
    }
    ensureBackKeyframes()
    setIsSliding(true)
    setIsExiting(true)
    setNavigatingProjectId(projectData?.id ?? 'back')
    exitTimer.current = setTimeout(doBack, BACK_ARROW_SLIDE_MS)
  }, [doBack, setNavigatingProjectId, projectData])

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
          fontFamily: "'Onest', sans-serif",
        }}
      >
        <Link
          to="/"
          data-back-link
          onMouseEnter={() => setHoveringLink(true)}
          onMouseLeave={() => setHoveringLink(false)}
          onFocus={() => setHoveringLink(true)}
          onBlur={() => setHoveringLink(false)}
          onClick={handleBack}
          style={{
            display: 'inline-block',
            padding: '8px 12px',
            margin: '0 -12px 40px',
            fontSize: 'var(--text-size-body)',
            fontFamily: "'Onest', sans-serif",
            fontWeight: 400,
            color: 'var(--text-dark)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--text-underline)',
            textUnderlineOffset: 4,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '1em',
              textAlign: 'center' as const,
              clipPath: 'inset(0)',
              verticalAlign: 'text-top',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                ...(isSliding
                  ? {
                      animation: `arrowSlideOutLeft ${BACK_ARROW_SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                    }
                  : {}),
              }}
            >
              {'\u2190'}
            </span>
          </span>{' '}Back
        </Link>
        <p style={{ color: 'var(--text-grey)', fontSize: 'var(--text-size-body)' }}>
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
          onFocus={() => setHoveringLink(true)}
          onBlur={() => setHoveringLink(false)}
          onClick={handleBack}
          style={{
            display: 'inline-block',
            pointerEvents: 'auto',
            padding: '8px 12px',
            margin: '0 -12px',
            borderRadius: 8,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            fontSize: 'var(--text-size-body)',
            fontFamily: "'Onest', sans-serif",
            fontWeight: 400,
            color: 'var(--text-dark)',
            textDecoration: 'underline',
            textDecorationColor: 'var(--text-underline)',
            textUnderlineOffset: 4,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '1em',
              textAlign: 'center' as const,
              clipPath: 'inset(0)',
              verticalAlign: 'text-top',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                ...(isSliding
                  ? {
                      animation: `arrowSlideOutLeft ${BACK_ARROW_SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                    }
                  : {}),
              }}
            >
              {'\u2190'}
            </span>
          </span>{' '}Back
        </Link>
      </nav>

      <CaseStudyLayoutA data={caseStudy} isNarrow={!isWide} previewImage={previewImage} lottiePreview={projectData?.lottiePreview} videoPreview={projectData?.videoPreview} />
    </motion.div>
  )
}
