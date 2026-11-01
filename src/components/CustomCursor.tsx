import { useEffect, useRef, useState } from 'react'
import { useCursor } from '@/contexts/CursorContext'
import { useHover } from '@/contexts/HoverContext'
import { useIsWide } from '@/hooks/useMediaQuery'
import { projectsById } from '@/data/projects'
import { DIRECTIONAL_SWEEP } from '@/utils/braille'

const INVERT_SIZE = 64
const ARROW_FONT_SIZE = 36 // matches --text-size-title
const FIGPAL_SIZE = 72
const FIGPAL_OFFSET_X = 24
const FIGPAL_OFFSET_Y = 24
const LERP_RATE = 0.12
// Avoid zones: elements marked `data-figpal-avoid` (the contact icon row and
// its open pop-outs). The figpal steps aside rather than covering them.
const AVOID_SELECTOR = '[data-figpal-avoid]'
const AVOID_MARGIN = 8 // breathing room round each zone
const AVOID_RETURN = 12 // extra clearance before stepping back home (no flip-flop at the edge)
const FIGPAL_FADE = 'opacity 150ms ease'
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
  const comingSoonTextRef = useRef<HTMLSpanElement | null>(null)
  const figpalRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const posRef = useRef({ x: 0, y: 0 })
  const initializedRef = useRef(false)
  const reducedMotion = useRef(false)
  const isWide = useIsWide()
  const [isCoarsePointer, setIsCoarsePointer] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const isTouch = isCoarsePointer || !isWide
  const figpalSpotRef = useRef(0) // index into the figpal's spots; -1 = nowhere clear (faded)
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
    const mq = window.matchMedia('(pointer: coarse)')
    setIsCoarsePointer(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsCoarsePointer(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (cursorMode === 'standard' || isTouch) {
      removeCursorNoneStyle()
      return
    }

    // Remove any orphaned cursor containers from previous effect runs
    // (guards against StrictMode double-invoke, HMR, or stale cleanup)
    document.querySelectorAll('[data-custom-cursor]').forEach(el => el.remove())

    const elements: HTMLElement[] = []
    let figpalW = FIGPAL_SIZE * 192 / 222 // figpal.png's aspect until it loads
    figpalSpotRef.current = 0

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
      const comingSoonText = document.createElement('span')
      comingSoonText.textContent = 'coming soon'
      comingSoon.appendChild(comingSoonText)
      container.appendChild(comingSoon)
      comingSoonRef.current = comingSoon
      comingSoonTextRef.current = comingSoonText

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

      document.addEventListener('theme-changed', applyTint)

      ;(container as HTMLElement & { __tintCleanup?: () => void }).__tintCleanup = () => document.removeEventListener('theme-changed', applyTint)
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
        transition: reducedMotion.current ? 'none' : FIGPAL_FADE,
      })
      const img = document.createElement('img')
      img.src = '/images/figpal.png'
      img.alt = ''
      img.draggable = false
      img.onload = () => {
        if (img.naturalHeight) figpalW = FIGPAL_SIZE * img.naturalWidth / img.naturalHeight
      }
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

    // ── Figpal avoidance ──────────────────────────────────────────────
    // Spots for the figpal's top-left, in order of preference: home
    // (down-right of the pointer), then up-left (above the icon row, clear of
    // the pop-outs that open below and to the right), up-right, down-left.
    // An off-home spot clears any zone the pointer is inside: above it for the
    // upper spots (so over an icon it sits just above the row), below it for
    // the lower one.
    const spot = (i: number, mx: number, my: number) => {
      const up = i === 1 || i === 2
      const l = mx + (i === 1 || i === 3 ? -FIGPAL_OFFSET_X - figpalW : FIGPAL_OFFSET_X)
      let t = my + (up ? -FIGPAL_OFFSET_Y - FIGPAL_SIZE : FIGPAL_OFFSET_Y)
      if (i !== 0) {
        for (const r of zones) {
          if (!inside(r, mx, my, AVOID_MARGIN)) continue
          t = up ? Math.min(t, r.top - AVOID_MARGIN - FIGPAL_SIZE) : Math.max(t, r.bottom + AVOID_MARGIN)
        }
      }
      return { l, t }
    }
    const inside = (r: DOMRect, x: number, y: number, m: number) =>
      x > r.left - m && x < r.right + m && y > r.top - m && y < r.bottom + m
    // Zone rects, read once per frame (only when zones exist).
    let zones: DOMRect[] = []
    let zoneSig = ''
    const readZones = () => {
      const els = document.querySelectorAll(AVOID_SELECTOR)
      zones = []
      let sig = ''
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.width < 1 || r.height < 1) continue
        zones.push(r)
        sig += `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)};`
      }
      const changed = sig !== zoneSig
      zoneSig = sig
      return changed
    }
    const hits = (l: number, t: number, w: number, h: number, extra: number) => {
      const m = AVOID_MARGIN + extra
      for (const r of zones) {
        if (l < r.right + m && l + w > r.left - m && t < r.bottom + m && t + h > r.top - m) return true
      }
      return false
    }
    const spotBlocked = (i: number, mx: number, my: number, extra: number) => {
      const s = spot(i, mx, my)
      return hits(s.l, s.t, figpalW, FIGPAL_SIZE, extra)
    }
    const pickSpot = (mx: number, my: number) => {
      if (!zones.length) return 0
      const cur = figpalSpotRef.current
      // Home is blocked while the pointer is over a zone (the icon row: the
      // figpal moves on approach, before a dwell opens anything), or if its box
      // would overlap one. Leaving home is immediate; coming back needs a
      // little extra clearance.
      const extra = cur === 0 ? 0 : AVOID_RETURN
      const m = AVOID_MARGIN + extra
      if (!zones.some(r => inside(r, mx, my, m)) && !spotBlocked(0, mx, my, extra)) return 0
      if (cur > 0 && !spotBlocked(cur, mx, my, 0)) return cur
      for (let i = 1; i < 4; i++) if (!spotBlocked(i, mx, my, 0)) return i
      return -1
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
                // Constants match ContributionHeatmap: CELL_STEP=12, CELL_SIZE=10 (labels now in HTML, grid starts at y=0)
                if (svgY >= 0) {
                  const w = Math.max(0, Math.round((svgX - 5) / 12))
                  const d = Math.max(0, Math.min(6, Math.round((svgY - 5) / 12)))
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
        const zonesChanged = readZones()
        const mx = mouseRef.current.x
        const my = mouseRef.current.y
        const next = pickSpot(mx, my)
        if (next !== figpalSpotRef.current) {
          figpalSpotRef.current = next
          if (figpalRef.current) figpalRef.current.style.opacity = next === -1 ? '0' : '1'
        }
        // Nowhere clear: fade out where it is (keep following home, unseen).
        const s = spot(Math.max(0, next), mx, my)
        targetX = s.l
        targetY = s.t
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
        // Zones still moving (a pop-out springing open, a note typing):
        // keep checking until they're still too.
        if (zonesChanged) settled = false
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

    // Figpal: a pop-out can open (or a page scroll move the row) under a
    // still pointer, so wake the loop when the DOM or the scroll changes. The
    // loop settles again in a frame when nothing it cares about moved.
    let observer: MutationObserver | null = null
    if (cursorMode === 'figpal') {
      observer = new MutationObserver(startLoop)
      observer.observe(document.body, { childList: true, subtree: true })
      window.addEventListener('scroll', startLoop, { passive: true, capture: true })
      window.addEventListener('resize', startLoop)
    }

    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', startLoop, { capture: true })
      window.removeEventListener('resize', startLoop)
      document.removeEventListener('pointermove', handlePointerMoveAndLoop)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      removeCursorNoneStyle()
      for (const el of elements) {
        ;(el as HTMLElement & { __tintCleanup?: () => void }).__tintCleanup?.()
        el.remove()
      }
      containerRef.current = null
      circleRef.current = null
      arrowRef.current = null
      handRef.current = null
      comingSoonRef.current = null
      comingSoonTextRef.current = null
      figpalRef.current = null
    }
  }, [cursorMode, cursorTintMode, isTouch])

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

  // Jiggle "coming soon" label when a non-link card is clicked (invert mode)
  useEffect(() => {
    if (cursorMode !== 'invert') return
    const handler = () => {
      const el = comingSoonTextRef.current
      if (!el || cursorContentRef.current !== 'coming-soon') return
      el.classList.remove('coming-soon-nudge')
      void el.offsetHeight
      el.classList.add('coming-soon-nudge')
      el.addEventListener('animationend', () => el.classList.remove('coming-soon-nudge'), { once: true })
    }
    document.addEventListener('coming-soon-clicked', handler)
    return () => document.removeEventListener('coming-soon-clicked', handler)
  }, [cursorMode])

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

  return null
}
