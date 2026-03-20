import { useEffect, useRef } from 'react'
import { useCursor } from '@/contexts/CursorContext'
import { useHover } from '@/contexts/HoverContext'
import { projectsById } from '@/data/projects'
import { DIRECTIONAL_SWEEP } from '@/utils/braille'

const INVERT_SIZE = 64
const ARROW_FONT_SIZE = 36
const FIGPAL_SIZE = 72
const FIGPAL_OFFSET_X = 24
const FIGPAL_OFFSET_Y = 24
const LERP_RATE = 0.12
const MORPH_LEAVE_DELAY = 150
const CIRCLE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

// Phosphor fill hand-pointing SVG for theme image hover
function makeHandSvg(fill: string) {
  return `<svg width="48" height="48" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" d="M224,104v50.93c0,46.2-36.85,84.55-83,85.06A83.71,83.71,0,0,1,80.6,215.4C58.79,192.33,34.15,136,34.15,136a16,16,0,0,1,6.53-22.23c7.66-4,17.1-.84,21.4,6.62l21,36.44a6.09,6.09,0,0,0,6,3.09l.12,0A8.19,8.19,0,0,0,96,151.74V32a16,16,0,0,1,16.77-16c8.61.4,15.23,7.82,15.23,16.43V104a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25V88a16,16,0,0,1,16.77-16c8.61.4,15.23,7.82,15.23,16.43V112a8,8,0,0,0,8.53,8,8.17,8.17,0,0,0,7.47-8.25v-7.28c0-8.61,6.62-16,15.23-16.43A16,16,0,0,1,224,104Z"/></svg>`
}

const CURSOR_NONE_CLASS = 'cursor-none'

function injectCursorNoneStyle() {
  document.documentElement.classList.add(CURSOR_NONE_CLASS)
}

function removeCursorNoneStyle() {
  document.documentElement.classList.remove(CURSOR_NONE_CLASS)
}

function getAccentHue(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim() || '34'
}

function isDarkMode(): boolean {
  return document.documentElement.getAttribute('data-theme') !== 'light'
}

function getTintColor(hue: string, bold: boolean, dark: boolean): string {
  const h = dark ? Number(hue) : (Number(hue) + 180) % 360
  return bold
    ? `hsl(${h}, 72%, 78%)`
    : `hsl(${h}, 45%, 88%)`
}

export function CustomCursor() {
  const { cursorMode, cursorTintMode } = useCursor()
  const { hoveredProjectId, hoveringLink, navigatingProjectId } = useHover()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const circleRef = useRef<HTMLDivElement | null>(null)
  const arrowRef = useRef<HTMLDivElement | null>(null)
  const handRef = useRef<HTMLDivElement | null>(null)
  const comingSoonRef = useRef<HTMLDivElement | null>(null)
  const figpalRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const posRef = useRef({ x: 0, y: 0 })
  const initializedRef = useRef(false)
  const reducedMotion = useRef(false)
  const onCardRef = useRef(false)
  const cursorContentRef = useRef<'idle' | 'arrow' | 'coming-soon'>('idle')
  const onSidebarRef = useRef(false)
  const onImageRef = useRef(false)
  const onBackLinkRef = useRef(false)
  const onHeatmapRef = useRef(false)
  const heatmapSnapRef = useRef<{ x: number; y: number } | null>(null)
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

    // Remove any orphaned cursor containers from previous effect runs
    // (guards against StrictMode double-invoke, HMR, or stale cleanup)
    document.querySelectorAll('[data-custom-cursor]').forEach(el => el.remove())

    const elements: HTMLElement[] = []

    if (cursorMode === 'invert') {
      injectCursorNoneStyle()

      const hue = getAccentHue()
      const bold = cursorTintMode === 'tint-bold'
      const tintColor = getTintColor(hue, bold, isDarkMode())

      const container = document.createElement('div')
      container.setAttribute('aria-hidden', 'true')
      container.setAttribute('data-custom-cursor', 'invert')
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

      // Arrow — hidden by default, shown on card hover
      const arrow = document.createElement('div')
      Object.assign(arrow.style, {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: tintColor,
        fontSize: `${ARROW_FONT_SIZE}px`,
        fontFamily: "'Onest', sans-serif",
        fontWeight: '400',
        lineHeight: '1',
        transform: 'scale(0)',
        transition: reducedMotion.current ? 'none' : `transform 300ms ${CIRCLE_EASING}`,
      })
      arrow.textContent = '\u2192'
      container.appendChild(arrow)
      arrowRef.current = arrow

      // Hand pointer — hidden by default, shown on theme image hover
      const hand = document.createElement('div')
      Object.assign(hand.style, {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'scale(0)',
        transition: reducedMotion.current ? 'none' : `transform 300ms ${CIRCLE_EASING}`,
      })
      hand.innerHTML = makeHandSvg(tintColor)
      container.appendChild(hand)
      handRef.current = hand

      // "Coming soon" label — hidden by default, shown on non-link card hover
      const comingSoon = document.createElement('div')
      Object.assign(comingSoon.style, {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: tintColor,
        fontSize: '22px',
        fontFamily: "'Literata', serif",
        fontWeight: '300',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        transform: 'scale(0)',
        transition: reducedMotion.current ? 'none' : `transform 300ms ${CIRCLE_EASING}`,
      })
      comingSoon.textContent = 'coming soon'
      container.appendChild(comingSoon)
      comingSoonRef.current = comingSoon

      // Circle — disc that scales down to reveal arrow/hand/coming-soon
      const circle = document.createElement('div')
      Object.assign(circle.style, {
        position: 'absolute',
        inset: '0',
        borderRadius: '50%',
        background: tintColor,
        transition: reducedMotion.current ? 'none' : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'scale(1)',
      })
      container.appendChild(circle)

      document.body.appendChild(container)
      containerRef.current = container
      circleRef.current = circle
      elements.push(container)

      // Observe accent changes to update tint colors live
      const applyTint = () => {
        const h = getAccentHue()
        const tc = getTintColor(h, bold, isDarkMode())
        circle.style.background = tc
        arrow.style.color = tc
        comingSoon.style.color = tc
        hand.innerHTML = makeHandSvg(tc)
      }

      const observer = new MutationObserver(applyTint)
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-accent', 'data-theme'],
      })

      ;(container as any).__tintCleanup = () => observer.disconnect()
    } else {
      // figpal
      removeCursorNoneStyle()
      const el = document.createElement('div')
      el.setAttribute('aria-hidden', 'true')
      el.setAttribute('data-custom-cursor', 'figpal')
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

    // Preserve cursor position and visibility on tint-only switches
    const hadPosition = initializedRef.current
    const savedPos = { ...posRef.current }

    if (!hadPosition) {
      initializedRef.current = false
    }
    onCardRef.current = false
    cursorContentRef.current = 'idle'
    onSidebarRef.current = false
    onImageRef.current = false
    onBackLinkRef.current = false
    onHeatmapRef.current = false
    heatmapSnapRef.current = null

    if (hadPosition) {
      const t = `translate(${savedPos.x}px, ${savedPos.y}px)`
      for (const el of elements) {
        el.style.transform = t
      }
      if (cursorMode === 'invert' && containerRef.current) {
        containerRef.current.style.opacity = '1'
      } else if (figpalRef.current) {
        figpalRef.current.style.opacity = '1'
      }

      // Re-detect what we're hovering so morphs are correct immediately
      if (cursorMode === 'invert' && circleRef.current) {
        const cx = savedPos.x + INVERT_SIZE / 2
        const cy = savedPos.y + INVERT_SIZE / 2
        const target = document.elementFromPoint(cx, cy)
        if (target?.closest('[data-sidebar]')) {
          onSidebarRef.current = true
          circleRef.current.style.transition = 'none'
          circleRef.current.style.transform = 'scale(0.15)'
          // Restore transition on next frame
          requestAnimationFrame(() => {
            if (circleRef.current) {
              circleRef.current.style.transition = reducedMotion.current
                ? 'none'
                : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            }
          })
        } else if (target?.closest('[data-theme-image]')) {
          onImageRef.current = true
          circleRef.current.style.transition = 'none'
          circleRef.current.style.transform = 'scale(0)'
          if (handRef.current) handRef.current.style.transform = 'scale(1)'
          requestAnimationFrame(() => {
            if (circleRef.current) {
              circleRef.current.style.transition = reducedMotion.current
                ? 'none'
                : 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            }
          })
        }
      }
    }

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

      if (cursorMode === 'invert' && circleRef.current) {
        const target = document.elementFromPoint(e.clientX, e.clientY)
        const isOnSidebar = !!(target && target.closest('[data-sidebar]'))
        if (isOnSidebar !== onSidebarRef.current) {
          onSidebarRef.current = isOnSidebar
          if (isOnSidebar) {
            circleRef.current.style.transform = 'scale(0.15)'
            if (handRef.current) handRef.current.style.transform = 'scale(0)'
            if (arrowRef.current) arrowRef.current.style.transform = 'scale(0)'
            if (comingSoonRef.current) comingSoonRef.current.style.transform = 'scale(0)'
          } else if (!onCardRef.current && !onImageRef.current) {
            circleRef.current.style.transform = 'scale(1)'
          }
        }
        const isOnImage = !!(target && target.closest('[data-theme-image]'))
        if (isOnImage !== onImageRef.current) {
          onImageRef.current = isOnImage
          if (isOnImage && !onCardRef.current) {
            circleRef.current.style.transform = 'scale(0)'
            if (handRef.current) handRef.current.style.transform = 'scale(1)'
          } else if (!isOnImage && !onCardRef.current && !onSidebarRef.current) {
            circleRef.current.style.transform = 'scale(1)'
            if (handRef.current) handRef.current.style.transform = 'scale(0)'
          }
        }
        onBackLinkRef.current = !!(target && target.closest('[data-back-link]'))

        // Heatmap zone: morph circle to cell-sized squircle and snap to cells
        const isOnHeatmap = !!(target && target.closest('[data-glass-break]'))
        if (isOnHeatmap !== onHeatmapRef.current) {
          onHeatmapRef.current = isOnHeatmap
          if (!isOnHeatmap) {
            // Leaving heatmap — restore circle
            heatmapSnapRef.current = null
            if (!onCardRef.current && !onImageRef.current && !onSidebarRef.current) {
              if (reducedMotion.current) circleRef.current.style.transition = 'none'
              circleRef.current.style.transform = 'scale(1)'
              circleRef.current.style.borderRadius = '50%'
            }
          }
        }
        // While in heatmap, snap to whichever cell is nearest to cursor
        if (isOnHeatmap && !onCardRef.current && !onImageRef.current) {
          let cellRect: DOMRect | null = null
          if (target?.hasAttribute('data-date')) {
            cellRect = (target as Element).getBoundingClientRect()
          } else {
            // In gap — find nearest cell via SVG coordinate math
            const svg = (target as Element)?.closest?.('svg')
              ?? document.querySelector('[data-glass-break] svg')
            if (svg) {
              const ctm = (svg as SVGSVGElement).getScreenCTM()
              if (ctm) {
                const svgX = (e.clientX - ctm.e) / ctm.a
                const svgY = (e.clientY - ctm.f) / ctm.d
                // Constants match ContributionHeatmap: CELL_STEP=12, CELL_SIZE=10, LABEL_TOP=16
                if (svgY >= 6) { // skip month labels area
                  const w = Math.max(0, Math.round((svgX - 5) / 12))
                  const d = Math.max(0, Math.min(6, Math.round((svgY - 16 - 5) / 12)))
                  const nearestRect = svg.querySelector(`rect[data-week="${w}"][data-day="${d}"]`)
                  if (nearestRect) {
                    cellRect = nearestRect.getBoundingClientRect()
                  } else {
                    // Past grid bounds — clear snap so cursor reverts to default
                    heatmapSnapRef.current = null
                    if (reducedMotion.current) circleRef.current.style.transition = 'none'
                    circleRef.current.style.transform = 'scale(1)'
                    circleRef.current.style.borderRadius = '50%'
                  }
                }
              }
            }
          }
          if (cellRect) {
            const scale = cellRect.width / INVERT_SIZE
            heatmapSnapRef.current = {
              x: cellRect.left + cellRect.width / 2 - INVERT_SIZE / 2,
              y: cellRect.top + cellRect.height / 2 - INVERT_SIZE / 2,
            }
            if (reducedMotion.current) circleRef.current.style.transition = 'none'
            circleRef.current.style.transform = `scale(${scale})`
            circleRef.current.style.borderRadius = '20%'
          }
        }
      }
    }

    let loopRunning = false

    const startLoop = () => {
      if (loopRunning) return
      loopRunning = true
      rafRef.current = requestAnimationFrame(loop)
    }

    const loop = () => {
      rafRef.current = null
      if (!initializedRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      let targetX: number
      let targetY: number
      let settled = false

      if (cursorMode === 'invert') {
        if (onHeatmapRef.current && heatmapSnapRef.current) {
          // Snap to cell position
          posRef.current.x = heatmapSnapRef.current.x
          posRef.current.y = heatmapSnapRef.current.y
        } else {
          targetX = mouseRef.current.x - INVERT_SIZE / 2
          targetY = mouseRef.current.y - INVERT_SIZE / 2
          posRef.current.x = targetX
          posRef.current.y = targetY
        }
        settled = true // invert mode has no lerp — always settled after one frame
      } else {
        targetX = mouseRef.current.x + FIGPAL_OFFSET_X
        targetY = mouseRef.current.y + FIGPAL_OFFSET_Y
        if (reducedMotion.current) {
          posRef.current.x = targetX
          posRef.current.y = targetY
          settled = true
        } else {
          posRef.current.x += (targetX - posRef.current.x) * LERP_RATE
          posRef.current.y += (targetY - posRef.current.y) * LERP_RATE
          settled =
            Math.abs(posRef.current.x - targetX) < 0.5 &&
            Math.abs(posRef.current.y - targetY) < 0.5
          if (settled) {
            posRef.current.x = targetX
            posRef.current.y = targetY
          }
        }
      }

      const t = `translate(${posRef.current.x}px, ${posRef.current.y}px)`
      for (const el of elements) {
        el.style.transform = t
      }

      if (settled) {
        loopRunning = false
      } else {
        rafRef.current = requestAnimationFrame(loop)
      }
    }

    const handlePointerMoveAndLoop = (e: PointerEvent) => {
      handlePointerMove(e)
      startLoop()
    }
    document.addEventListener('pointermove', handlePointerMoveAndLoop)
    loopRunning = true
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      document.removeEventListener('pointermove', handlePointerMoveAndLoop)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      // Don't remove cursor-none here — the new effect setup will manage it.
      // Removing and re-adding in the same tick can cause a one-frame OS cursor
      // flash on browsers that defer cursor style recalculation.
      // The setup code handles both adding (invert) and removing (standard/figpal).
      for (const el of elements) {
        ;(el as any).__tintCleanup?.()
        el.remove()
      }
      containerRef.current = null
      circleRef.current = null
      arrowRef.current = null
      handRef.current = null
      comingSoonRef.current = null
      figpalRef.current = null
    }
  }, [cursorMode, cursorTintMode])

  // Morph circle ↔ arrow / coming-soon based on hovered project or external link.
  useEffect(() => {
    if (cursorMode !== 'invert' || !circleRef.current) return

    const project = hoveredProjectId ? projectsById[hoveredProjectId] : null
    const showArrow = !!(project && project.isLink) || hoveringLink
    const showComingSoon = !!(project && !project.isLink)
    const newContent: 'idle' | 'arrow' | 'coming-soon' = showArrow ? 'arrow' : showComingSoon ? 'coming-soon' : 'idle'

    if (newContent === cursorContentRef.current) return

    if (morphTimerRef.current) {
      clearTimeout(morphTimerRef.current)
      morphTimerRef.current = null
    }

    if (newContent === 'arrow') {
      onCardRef.current = true
      cursorContentRef.current = 'arrow'
      circleRef.current.style.transform = 'scale(0)'
      if (arrowRef.current) {
        arrowRef.current.textContent = onBackLinkRef.current ? '\u2190' : '\u2192'
        arrowRef.current.style.transform = 'scale(1)'
      }
      if (comingSoonRef.current) comingSoonRef.current.style.transform = 'scale(0)'
      if (handRef.current) handRef.current.style.transform = 'scale(0)'
    } else if (newContent === 'coming-soon') {
      onCardRef.current = true
      cursorContentRef.current = 'coming-soon'
      circleRef.current.style.transform = 'scale(0)'
      if (comingSoonRef.current) comingSoonRef.current.style.transform = 'scale(1)'
      if (arrowRef.current) arrowRef.current.style.transform = 'scale(0)'
      if (handRef.current) handRef.current.style.transform = 'scale(0)'
    } else {
      morphTimerRef.current = setTimeout(() => {
        onCardRef.current = false
        cursorContentRef.current = 'idle'
        if (onImageRef.current && circleRef.current) {
          circleRef.current.style.transform = 'scale(0)'
          if (arrowRef.current) arrowRef.current.style.transform = 'scale(0)'
          if (comingSoonRef.current) comingSoonRef.current.style.transform = 'scale(0)'
          if (handRef.current) handRef.current.style.transform = 'scale(1)'
        } else if (onSidebarRef.current && circleRef.current) {
          circleRef.current.style.transform = 'scale(0.15)'
          if (arrowRef.current) arrowRef.current.style.transform = 'scale(0)'
          if (comingSoonRef.current) comingSoonRef.current.style.transform = 'scale(0)'
        } else {
          if (arrowRef.current) arrowRef.current.style.transform = 'scale(0)'
          if (comingSoonRef.current) comingSoonRef.current.style.transform = 'scale(0)'
          if (circleRef.current) {
            if (onHeatmapRef.current && heatmapSnapRef.current) {
              const snapEl = document.elementFromPoint(
                heatmapSnapRef.current.x + INVERT_SIZE / 2,
                heatmapSnapRef.current.y + INVERT_SIZE / 2,
              )
              if (snapEl?.hasAttribute('data-date')) {
                const cellRect = snapEl.getBoundingClientRect()
                if (reducedMotion.current) circleRef.current.style.transition = 'none'
                circleRef.current.style.transform = `scale(${cellRect.width / INVERT_SIZE})`
                circleRef.current.style.borderRadius = '20%'
              }
            } else if (onHeatmapRef.current) {
              circleRef.current.style.transform = 'scale(0)'
            } else {
              if (reducedMotion.current) circleRef.current.style.transition = 'none'
              circleRef.current.style.transform = 'scale(1)'
              circleRef.current.style.borderRadius = '50%'
            }
          }
        }
        morphTimerRef.current = null
      }, MORPH_LEAVE_DELAY)
    }

    return () => {
      if (morphTimerRef.current) {
        clearTimeout(morphTimerRef.current)
        morphTimerRef.current = null
      }
    }
  }, [hoveredProjectId, hoveringLink, cursorMode])

  // Braille animation on cursor arrow when a project link is clicked
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

  // Final cleanup: restore OS cursor if the component tree fully unmounts
  useEffect(() => {
    return () => removeCursorNoneStyle()
  }, [])

  return null
}
