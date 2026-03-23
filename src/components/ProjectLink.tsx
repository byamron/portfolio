import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { useHover } from '@/contexts/HoverContext'
import { useCursor } from '@/contexts/CursorContext'
import { DIRECTIONAL_SWEEP } from '@/utils/braille'
import type { Project } from '@/data/projects'

const ARROW_SLIDE_MS = 500

// Windup → slide-right animation.
// Brief pull-back (anticipation), then accelerate out to the right.
const ARROW_SLIDE_KEYFRAMES = `
@keyframes arrowSlideOut {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  30% {
    transform: translateX(-20%);
    opacity: 1;
  }
  100% {
    transform: translateX(110%);
    opacity: 0;
  }
}
`

// Inject keyframes once
let keyframesInjected = false
function ensureKeyframes() {
  if (keyframesInjected) return
  const style = document.createElement('style')
  style.textContent = ARROW_SLIDE_KEYFRAMES
  document.head.appendChild(style)
  keyframesInjected = true
}

interface ProjectLinkProps {
  project: Project
}

export function ProjectLink({ project }: ProjectLinkProps) {
  const { setHoveredProjectId, setNavigatingProjectId } = useHover()
  const { cursorMode } = useCursor()
  const navigate = useNavigate()
  const [isSliding, setIsSliding] = useState(false)
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current)
        navTimerRef.current = null
      }
      setNavigatingProjectId(null)
    }
  }, [setNavigatingProjectId])

  if (!project.isLink) {
    return (
      <div
        data-link-card
        data-project-id={project.id}
        onMouseEnter={() => setHoveredProjectId(project.id)}
        onMouseLeave={() => setHoveredProjectId(null)}
        style={{
          width: 'fit-content',
          alignSelf: 'flex-start',
          padding: '24px 16px',
          margin: '0 -16px',
          borderRadius: 16,
          fontSize: 'var(--text-size-body)',
          fontWeight: 400,
          lineHeight: 1.4,
          color: 'var(--text-medium)',
          border: '0.1px solid transparent',
        }}
      >
        {project.title}{' '}<span style={{ opacity: 0.5 }}>(coming soon)</span>
      </div>
    )
  }

  const isInternal = project.href.startsWith('/')

  function handleClick(e: React.MouseEvent) {
    // Cmd/Ctrl+click: let browser open new tab natively
    if (e.metaKey || e.ctrlKey || e.button === 1) return

    // Only intercept internal links — external hrefs handled by browser
    if (!isInternal) return

    e.preventDefault()

    // Navigate with View Transition if supported, plain navigate otherwise
    function doNavigate() {
      setNavigatingProjectId(null)
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          flushSync(() => navigate(project.href))
          window.scrollTo(0, 0)
        })
      } else {
        navigate(project.href)
      }
    }

    // Reduced motion: navigate instantly, no animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(project.href)
      return
    }

    // Signal CustomCursor that navigation is starting
    setNavigatingProjectId(project.id)

    if (cursorMode !== 'invert') {
      // Standard/figpal: slide the arrow right and out with windup
      ensureKeyframes()
      setIsSliding(true)
      navTimerRef.current = setTimeout(doNavigate, ARROW_SLIDE_MS)
    } else {
      // Invert mode: cursor handles the braille animation, card arrow stays static
      const totalDuration = DIRECTIONAL_SWEEP.frames.length * DIRECTIONAL_SWEEP.interval
      navTimerRef.current = setTimeout(doNavigate, totalDuration)
    }
  }

  const linkProps = {
    'data-link-card': true as const,
    'data-project-id': project.id,
    onMouseEnter: () => setHoveredProjectId(project.id),
    onMouseLeave: () => setHoveredProjectId(null),
    onFocus: () => setHoveredProjectId(project.id),
    onBlur: () => setHoveredProjectId(null),
    onClick: handleClick,
    style: {
      width: 'fit-content' as const,
      alignSelf: 'flex-start' as const,
      padding: '24px 16px',
      margin: '0 -16px',
      borderRadius: 16,
      fontSize: 'var(--text-size-body)',
      fontWeight: 400,
      lineHeight: 1.4,
      color: 'var(--text-dark)',
      textDecoration: 'underline' as const,
      textDecorationColor: 'var(--text-underline)',
      textUnderlineOffset: 4,
      border: '0.1px solid transparent',
    },
  }

  const arrowSpan = (
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
                animation: `arrowSlideOut ${ARROW_SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              }
            : {}),
        }}
      >
        {'\u2192'}
      </span>
    </span>
  )

  const children = (
    <>
      {project.title}{' '}{arrowSpan}
    </>
  )

  if (isInternal) {
    return <Link to={project.href} {...linkProps}>{children}</Link>
  }

  return <a href={project.href} {...linkProps}>{children}</a>
}
