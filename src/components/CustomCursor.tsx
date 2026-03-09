import { useEffect, useRef } from 'react'
import { useCursor } from '@/contexts/CursorContext'
import { useHover } from '@/contexts/HoverContext'
import { projectsById } from '@/data/projects'
import { DIRECTIONAL_SWEEP } from '@/utils/braille'

const INVERT_SIZE = 80
const ARROW_FONT_SIZE = 36
const FIGPAL_SIZE = 72
const FIGPAL_OFFSET_X = 24
const FIGPAL_OFFSET_Y = 24
const LERP_RATE = 0.12

// Phosphor fill hand-pointing SVG for theme image hover
const HAND_SVG = `<svg width="48" height="48" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M224,104v50.93c0,46.2-36.85,84.55-83,85.06A83.71,83.71,0,0,1,80.6,215.4C58.79,192.33,34.15,136,34.15,136a16,16,0,0,1,6.53-22.23c7.66-4,17.1-.84,21.4,6.62l21,36.44a6.09,6.09,0,0,0,6,3.09l.12,0A8.19,8.19,0,0,0,96,151.74V32a16,16,0,0,1,16.77-16c8.61.4,15.23,7.82,15.23,16.43V104a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25V88a16,16,0,0,1,16.77-16c8.61.4,15.23,7.82,15.23,16.43V112a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25v-7.28c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,224,104Z"/></svg>`

// Global style to suppress all cursor overrides in invert mode
const CURSOR_NONE_STYLE_ID = 'custom-cursor-none'

function injectCursorNoneStyle() {
  if (document.getElementById(CURSOR_NONE_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = CURSOR_NONE_STYLE_ID
  style.textContent = '* { cursor: none !important; }'
  document.head.appendChild(style)
}

function removeCursorNoneStyle() {
  document.getElementById(CURSOR_NONE_STYLE_ID)?.remove()
}

export function CustomCursor() {
  const { cursorMode } = useCursor()
  const { hoveredProjectId, hoveringLink, navigatingProjectId } = useHover()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const circleRef = useRef<HTMLDivElement | null>(null)
  const arrowRef = useRef<HTMLDivElement | null>(null)
  const handRef = useRef<HTMLDivElement | null>(null)
  const figpalRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const posRef = useRef({ x: 0, y: 0 })
  const initializedRef = useRef(false)
  const reducedMotion = useRef(false)
  const onCardRef = useRef(false)
  const onSidebarRef = useRef(false)
  const onImageRef = useRef(false)
  const onBackLinkRef = useRef(false)
  const morphTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cursorAnimRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (cursorMode === 'standard') {
      removeCursorNoneStyle()
      return
    }

    const elements: HTMLElement[] = []

    if (cursorMode === 'invert') {
      injectCursorNoneStyle()

      // Single container — mix-blend-mode: difference on this element
      // so both the circle and arrow get the invert treatment
      const container = document.createElement('div')
      container.setAttribute('aria-hidden', 'true')
      Object.assign(container.style, {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: '9999',
        top: '0',
        left: '0',
        willChange: 'transform',
        opacity: '0',
        width: `${INVERT_SIZE}px`,
        height: `${INVERT_SIZE}px`,
        mixBlendMode: 'difference',
        transition: 'opacity 150ms ease',
      })

      // Arrow (bottom layer) — hidden by default, shown only on card hover
      const arrow = document.createElement('div')
      Object.assign(arrow.style, {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: `${ARROW_FONT_SIZE}px`,
        fontFamily: "'Onest', sans-serif",
        fontWeight: '400',
        lineHeight: '1',
        opacity: '0',
        transition: reducedMotion.current ? 'none' : 'opacity 200ms ease',
      })
      arrow.textContent = '\u2192'
      container.appendChild(arrow)
      arrowRef.current = arrow

      // Hand pointer (bottom layer) — hidden by default, shown on theme image hover
      const hand = document.createElement('div')
      Object.assign(hand.style, {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0',
        transition: reducedMotion.current ? 'none' : 'opacity 200ms ease',
      })
      hand.innerHTML = HAND_SVG
      container.appendChild(hand)
      handRef.current = hand

      // Circle (top layer) — white disc that scales down to reveal arrow
      const circle = document.createElement('div')
      Object.assign(circle.style, {
        position: 'absolute',
        inset: '0',
        borderRadius: '50%',
        background: 'white',
        transition: reducedMotion.current ? 'none' : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'scale(1)',
      })
      container.appendChild(circle)

      document.body.appendChild(container)
      containerRef.current = container
      circleRef.current = circle
      elements.push(container)
    } else {
      // figpal
      removeCursorNoneStyle()
      const el = document.createElement('div')
      el.setAttribute('aria-hidden', 'true')
      Object.assign(el.style, {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: '9999',
        top: '0',
        left: '0',
        willChange: 'transform',
        opacity: '0',
      })
      const img = document.createElement('img')
      img.src = '/images/figpal.png'
      img.alt = ''
      img.draggable = false
      Object.assign(img.style, {
        height: `${FIGPAL_SIZE}px`,
        width: 'auto',
        display: 'block',
      })
      el.appendChild(img)
      document.body.appendChild(el)
      figpalRef.current = el
      elements.push(el)
    }

    initializedRef.current = false
    onCardRef.current = false
    onSidebarRef.current = false
    onImageRef.current = false
    onBackLinkRef.current = false

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY

      if (!initializedRef.current) {
        initializedRef.current = true
        if (cursorMode === 'invert') {
          posRef.current.x = e.clientX - INVERT_SIZE / 2
          posRef.current.y = e.clientY - INVERT_SIZE / 2
        } else {
          posRef.current.x = e.clientX + FIGPAL_OFFSET_X
          posRef.current.y = e.clientY + FIGPAL_OFFSET_Y
        }
        const t = `translate(${posRef.current.x}px, ${posRef.current.y}px)`
        for (const el of elements) {
          el.style.transform = t
        }
        if (cursorMode === 'invert') {
          containerRef.current!.style.opacity = '1'
        } else {
          figpalRef.current!.style.opacity = '1'
        }
      }

      // Shrink circle over sidebar — morph to small dot, let glass hover do the rest
      // Detect theme image hover for hand cursor morph
      if (cursorMode === 'invert' && circleRef.current) {
        const target = document.elementFromPoint(e.clientX, e.clientY)
        const isOnSidebar = !!(target && target.closest('[data-sidebar]'))
        if (isOnSidebar !== onSidebarRef.current) {
          onSidebarRef.current = isOnSidebar
          if (isOnSidebar) {
            circleRef.current.style.transform = 'scale(0.15)'
          } else if (!onCardRef.current && !onImageRef.current) {
            circleRef.current.style.transform = 'scale(1)'
          }
        }
        const isOnImage = !!(target && target.closest('[data-theme-image]'))
        if (isOnImage !== onImageRef.current) {
          onImageRef.current = isOnImage
          if (isOnImage && !onCardRef.current) {
            circleRef.current.style.transform = 'scale(0)'
            if (handRef.current) handRef.current.style.opacity = '1'
          } else if (!isOnImage && !onCardRef.current && !onSidebarRef.current) {
            circleRef.current.style.transform = 'scale(1)'
            if (handRef.current) handRef.current.style.opacity = '0'
          }
        }
        onBackLinkRef.current = !!(target && target.closest('[data-back-link]'))
      }
    }

    const loop = () => {
      if (!initializedRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      let targetX: number
      let targetY: number

      if (cursorMode === 'invert') {
        targetX = mouseRef.current.x - INVERT_SIZE / 2
        targetY = mouseRef.current.y - INVERT_SIZE / 2
        posRef.current.x = targetX
        posRef.current.y = targetY
      } else {
        targetX = mouseRef.current.x + FIGPAL_OFFSET_X
        targetY = mouseRef.current.y + FIGPAL_OFFSET_Y
        if (reducedMotion.current) {
          posRef.current.x = targetX
          posRef.current.y = targetY
        } else {
          posRef.current.x += (targetX - posRef.current.x) * LERP_RATE
          posRef.current.y += (targetY - posRef.current.y) * LERP_RATE
        }
      }

      const t = `translate(${posRef.current.x}px, ${posRef.current.y}px)`
      for (const el of elements) {
        el.style.transform = t
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    document.addEventListener('pointermove', handlePointerMove)
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      removeCursorNoneStyle()
      for (const el of elements) el.remove()
      containerRef.current = null
      circleRef.current = null
      arrowRef.current = null
      handRef.current = null
      figpalRef.current = null
    }
  }, [cursorMode])

  // Morph circle ↔ arrow based on hovered project or external link.
  // Debounce the arrow→circle transition so moving between cards doesn't flicker.
  useEffect(() => {
    if (cursorMode !== 'invert' || !circleRef.current) return

    const project = hoveredProjectId ? projectsById[hoveredProjectId] : null
    const showArrow = !!(project && project.isLink) || hoveringLink

    if (showArrow === onCardRef.current) return

    // Clear any pending morph timer
    if (morphTimerRef.current) {
      clearTimeout(morphTimerRef.current)
      morphTimerRef.current = null
    }

    if (showArrow) {
      // Arrow on immediately — takes priority over hand
      onCardRef.current = true
      circleRef.current.style.transform = 'scale(0)'
      if (arrowRef.current) {
        arrowRef.current.textContent = onBackLinkRef.current ? '\u2190' : '\u2192'
        arrowRef.current.style.opacity = '1'
      }
      if (handRef.current) handRef.current.style.opacity = '0'
    } else {
      // Delay circle restore so card-to-card gaps don't flicker
      morphTimerRef.current = setTimeout(() => {
        onCardRef.current = false
        if (arrowRef.current) arrowRef.current.style.opacity = '0'
        // Restore to hand if still over image, otherwise to circle
        if (onImageRef.current) {
          if (circleRef.current) circleRef.current.style.transform = 'scale(0)'
          if (handRef.current) handRef.current.style.opacity = '1'
        } else if (circleRef.current) {
          circleRef.current.style.transform = onSidebarRef.current ? 'scale(0.15)' : 'scale(1)'
        }
        morphTimerRef.current = null
      }, 200)
    }

    return () => {
      if (morphTimerRef.current) {
        clearTimeout(morphTimerRef.current)
        morphTimerRef.current = null
      }
    }
  }, [hoveredProjectId, hoveringLink, cursorMode])

  // Braille animation on cursor arrow when a project link is clicked in invert mode
  useEffect(() => {
    if (cursorMode !== 'invert' || !navigatingProjectId || !arrowRef.current) return
    if (reducedMotion.current) return

    const arrow = arrowRef.current
    const { frames, interval } = DIRECTIONAL_SWEEP
    let frameIndex = 0

    cursorAnimRef.current = setInterval(() => {
      if (frameIndex < frames.length) {
        arrow.textContent = frames[frameIndex] ?? '\u2192'
        frameIndex++
      } else {
        clearInterval(cursorAnimRef.current!)
        cursorAnimRef.current = null
        arrow.textContent = '\u2192'
      }
    }, interval)

    return () => {
      if (cursorAnimRef.current) {
        clearInterval(cursorAnimRef.current)
        cursorAnimRef.current = null
      }
      if (arrowRef.current) {
        arrowRef.current.textContent = '\u2192'
      }
    }
  }, [navigatingProjectId, cursorMode])

  return null
}
