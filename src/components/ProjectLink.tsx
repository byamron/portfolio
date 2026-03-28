import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { useHover } from '@/contexts/HoverContext'
import { useCursor } from '@/contexts/CursorContext'
import { DIRECTIONAL_SWEEP } from '@/utils/braille'
import type { Project } from '@/data/projects'

const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const ARROW_SLIDE_MS = 500

interface ProjectLinkProps {
  project: Project
  twoLine?: boolean
  separator?: string
  statusGap?: number
  titleWeight?: number
  subtitleWeight?: number
  statusWeight?: number
  subtitleSize?: string
  titleSubGap?: number
  nonLinkUnderline?: 'none' | 'solid' | 'dotted'
}

export function ProjectLink({ project, twoLine, separator = ', ', statusGap = 10, titleWeight = 400, subtitleWeight = 400, statusWeight = 400, subtitleSize, titleSubGap = 4, nonLinkUnderline = 'none' }: ProjectLinkProps) {
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

  const subtitleParts = [
    project.company ?? '',
    project.year ? project.year : '',
  ].filter(Boolean).join(separator)

  // Derive a stable delay from project id so dots pulse out of sync
  const pulseDelay = useMemo(() => {
    let hash = 0
    for (let i = 0; i < project.id.length; i++) {
      hash = ((hash << 5) - hash + project.id.charCodeAt(i)) | 0
    }
    return (Math.abs(hash) % 2500) / 1000 // 0–2.5s, matching animation duration
  }, [project.id])

  const statusIndicator = project.status ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--status-green)' }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: 'var(--status-green)',
          display: 'inline-block',
          flexShrink: 0,
          animation: 'status-pulse 2.5s ease-in-out infinite',
          animationDelay: `${pulseDelay}s`,
        }}
      />
      <span style={{ fontWeight: statusWeight }}>{project.status}</span>
    </span>
  ) : null

  const subtitleContent = (
    <div style={{
      fontSize: subtitleSize || 'var(--text-size-body)',
      color: 'var(--text-grey)',
      fontWeight: subtitleWeight,
      marginTop: titleSubGap,
      display: 'flex',
      alignItems: 'center',
      gap: statusGap,
    }}>
      {subtitleParts && <span>{subtitleParts}</span>}
      {statusIndicator}
    </div>
  )

  if (!project.isLink) {
    return (
      <div
        data-link-card
        data-project-id={project.id}
        role="group"
        aria-label={`${project.title}${project.status ? ` — ${project.status}` : ''}`}
        onMouseEnter={() => setHoveredProjectId(project.id)}
        onMouseLeave={() => setHoveredProjectId(null)}
        onFocus={IS_TOUCH ? undefined : () => setHoveredProjectId(project.id)}
        onBlur={IS_TOUCH ? undefined : () => setHoveredProjectId(null)}
        tabIndex={0}
        style={{
          width: 'fit-content',
          alignSelf: 'flex-start',
          padding: '24px 16px',
          margin: '0 -16px',
          borderRadius: 16,
          fontSize: 'var(--text-size-body)',
          fontWeight: titleWeight,
          lineHeight: 1.4,
          color: 'var(--text-medium)',
          border: '0.1px solid transparent',
        }}
      >
        <span style={nonLinkUnderline !== 'none' ? {
          textDecoration: 'underline',
          textDecorationStyle: nonLinkUnderline as React.CSSProperties['textDecorationStyle'],
          textDecorationColor: 'var(--text-underline)',
          textUnderlineOffset: 4,
        } : undefined}>{project.title}</span>
        {twoLine && subtitleContent}
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
    onFocus: IS_TOUCH ? undefined : () => setHoveredProjectId(project.id),
    onBlur: IS_TOUCH ? undefined : () => setHoveredProjectId(null),
    onClick: handleClick,
    style: {
      width: 'fit-content' as const,
      alignSelf: 'flex-start' as const,
      padding: '24px 16px',
      margin: '0 -16px',
      borderRadius: 16,
      fontSize: 'var(--text-size-body)',
      fontWeight: titleWeight,
      lineHeight: 1.4,
      color: 'var(--text-dark)',
      textDecoration: twoLine ? 'none' as const : 'underline' as const,
      textDecorationColor: 'var(--text-underline)',
      textUnderlineOffset: 4,
      border: '0.1px solid transparent',
      ...(twoLine ? { display: 'flex' as const, flexDirection: 'column' as const } : {}),
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

  const metaLine = twoLine ? (
    <div style={{
      fontSize: subtitleSize || 'var(--text-size-body)',
      color: 'var(--text-grey)',
      fontWeight: subtitleWeight,
      marginTop: titleSubGap,
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: statusGap,
    }}>
      {subtitleParts && <span>{subtitleParts}</span>}
      {statusIndicator}
    </div>
  ) : null

  const titleSpanStyle = twoLine ? {
    textDecoration: 'underline' as const,
    textDecorationColor: 'var(--text-underline)',
    textUnderlineOffset: 4,
  } : undefined

  const children = (
    <>
      <span style={titleSpanStyle}>{project.title}{' '}{arrowSpan}</span>
      {metaLine}
    </>
  )

  if (isInternal) {
    return <Link to={project.href} {...linkProps}>{children}</Link>
  }

  return <a href={project.href} {...linkProps}>{children}</a>
}
