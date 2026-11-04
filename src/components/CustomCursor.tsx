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
const DIR_WINDOW_MS = 100 // approach direction: pointer travel over this window
const RING_ANGLES = 16 // candidate spots round the pointer…
const RING_GAPS = [32, 60, 88] // …at these gaps (pointer → figpal edge); home's is ~35
const SPOT_HYSTERESIS = 24 // px of score a new spot must win by
const ICON_PENALTY = 64 // px of score for sitting over a neighbouring icon
// Stepping aside and back is its own motion, layered on the trailing lerp:
// a critically damped spring on the figpal's offset from the pointer, so it
// eases out and settles (no first-frame dart). Natural frequencies (rad/s):
const STEP_ASIDE_W = 13 // out of the way: brisk, still ahead of a pop-out
const STEP_HOME_W = 7 // back into place: unhurried
const ESCAPE_W = 20 // caught inside a pop-out's space: hurry out
const HOLD_MAX_MS = 400 // longest it waits for a closing pop-out before gliding through
// The space a contact pop-out opens into, relative to the hovered icon: from
// just left of it (the email sheet) out past the GitHub terminal (300px), and
// down past the email sheet (~280px). Kept clear before anything opens.
const POP_RESERVE = { left: -24, width: 344, height: 300 }
// …and the "Email address copied" note, which appears beside the button on a
// click: a strip along the row's centre line to the right of the icon.
const NOTE_RESERVE = { width: 200, halfHeight: 12 }
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
    let figpalSpot = 0 // 0 = home, n > 0 = ring spot, -1 = nowhere clear (faded)

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
        // A fade isn't motion: it stays under reduced motion too.
        transition: FIGPAL_FADE,
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
    // Away from avoid zones the figpal sits at home (+24/+24). Near them it
    // stays on the side the pointer came from, like a pet that was trailing:
    // candidate spots on rings round the pointer are scored by distance to
    // the point *behind* the pointer along its approach, and any spot that
    // would cover an open pop-out (or the space one is about to take) is out.
    type Box = { l: number; t: number; r: number; b: number }
    let rows: Box[] = [] // the icon row(s): trigger the step-aside
    let pops: Box[] = [] // open pop-outs: never covered
    let rowItems: Box[] = [] // the row's icons, read only while the pointer is on a row
    let zoneSig = ''
    const toBox = (r: DOMRect): Box => ({ l: r.left, t: r.top, r: r.right, b: r.bottom })
    const inside = (r: Box, x: number, y: number, m: number) =>
      x > r.l - m && x < r.r + m && y > r.t - m && y < r.b + m
    const overlaps = (a: Box, r: Box, m: number) =>
      a.l < r.r + m && a.r > r.l - m && a.t < r.b + m && a.b > r.t - m
    const boxAt = (c: { x: number; y: number }): Box =>
      ({ l: c.x - figpalW / 2, t: c.y - FIGPAL_SIZE / 2, r: c.x + figpalW / 2, b: c.y + FIGPAL_SIZE / 2 })
    const boxAtPos = (x: number, y: number): Box => ({ l: x, t: y, r: x + figpalW, b: y + FIGPAL_SIZE })
    const ROW_SPAN = AVOID_MARGIN + AVOID_RETURN
    // Beyond this from the row, nothing about it can reach the figpal (its
    // farthest spot plus its own size, with room).
    const ZONE_REACH = 320

    // Zone rects, read once per frame (only when zones exist).
    // Layout reads are skipped while nothing's open and the pointer is far
    // from the row: its cached box can't have moved unless the DOM, the
    // scroll or the window changed (which mark it stale).
    let zonesStale = true
    const readZones = (mx: number, my: number) => {
      if (!zonesStale && !pops.length && rows.length && rows.every(r => !inside(r, mx, my, ZONE_REACH))) {
        rowItems = []
        return false
      }
      zonesStale = false
      const els = document.querySelectorAll<HTMLElement>(AVOID_SELECTOR)
      rows = []
      pops = []
      rowItems = []
      let sig = ''
      for (const el of els) {
        let box: Box
        const isRow = el.dataset.figpalAvoid === 'row'
        if (isRow) {
          // A row's span is its icons, not its (column-wide) box.
          const items = Array.from(el.children, li => toBox(li.getBoundingClientRect()))
          if (!items.length) continue
          box = {
            l: Math.min(...items.map(i => i.l)), t: Math.min(...items.map(i => i.t)),
            r: Math.max(...items.map(i => i.r)), b: Math.max(...items.map(i => i.b)),
          }
          if (inside(box, mx, my, ROW_SPAN)) rowItems.push(...items)
        } else {
          box = toBox(el.getBoundingClientRect())
        }
        if (box.r - box.l < 1 || box.b - box.t < 1) continue
        ;(isRow ? rows : pops).push(box)
        sig += `${isRow ? 'r' : 'p'}${Math.round(box.l)},${Math.round(box.t)},${Math.round(box.r)},${Math.round(box.b)};`
      }
      const changed = sig !== zoneSig
      zoneSig = sig
      return changed
    }

    // Pointer history for a smoothed approach direction (the last ~100ms of
    // moves, not one event).
    const trail: { t: number; x: number; y: number }[] = []
    let frozenDir: { x: number; y: number } | null = null
    let figpalHidden = false
    let holdSince: number | null = null
    // The motion's two layers: `follow` trails the pointer (the lerp), and
    // `off` is the figpal's centre relative to it, sprung toward the chosen
    // spot. Set up from where the figpal is on its first frame.
    let follow: { x: number; y: number } | null = null
    const off = { x: 0, y: 0, vx: 0, vy: 0 }
    let lastFrame = 0
    const liveDir = (mx: number, my: number) => {
      const now = performance.now()
      const first = trail.find(p => now - p.t <= DIR_WINDOW_MS)
      if (first) {
        const dx = mx - first.x
        const dy = my - first.y
        const d = Math.hypot(dx, dy)
        if (d >= 6) return { x: dx / d, y: dy / d }
      }
      // Pointer still (or the row arrived by scroll): keep the figpal on the
      // side it's already on.
      const dx = mx - (posRef.current.x + figpalW / 2)
      const dy = my - (posRef.current.y + FIGPAL_SIZE / 2)
      const d = Math.hypot(dx, dy) || 1
      return { x: dx / d, y: dy / d }
    }

    // Centre of a spot in direction (ux, uy) with `gap` px between the pointer
    // and the near edge of the figpal's box along that ray.
    const ringCentre = (mx: number, my: number, ux: number, uy: number, gap: number) => {
      const reach = Math.min(
        Math.abs(ux) > 1e-6 ? figpalW / 2 / Math.abs(ux) : Infinity,
        Math.abs(uy) > 1e-6 ? FIGPAL_SIZE / 2 / Math.abs(uy) : Infinity,
      )
      return { x: mx + ux * (gap + reach), y: my + uy * (gap + reach) }
    }
    const CANDIDATES = RING_ANGLES * RING_GAPS.length
    const candidate = (i: number, mx: number, my: number) => {
      const th = (Math.floor((i - 1) / RING_GAPS.length) / RING_ANGLES) * Math.PI * 2
      return ringCentre(mx, my, Math.cos(th), Math.sin(th), RING_GAPS[(i - 1) % RING_GAPS.length]!)
    }
    const homeCentre = (mx: number, my: number) =>
      ({ x: mx + FIGPAL_OFFSET_X + figpalW / 2, y: my + FIGPAL_OFFSET_Y + FIGPAL_SIZE / 2 })
    const spotCentre = (i: number, mx: number, my: number) =>
      i > 0 ? candidate(i, mx, my) : homeCentre(mx, my)

    // What a spot must stay clear of: open pop-outs; and, while the pointer
    // is on the row, the icon under it plus the space its pop-out opens into
    // (so the figpal is already out of the way when it opens). Off the row,
    // the row itself.
    let obstacles: Box[] = []
    let reserve: Box | null = null // the space the hovered icon's pop-out opens into
    const buildObstacles = (mx: number, my: number, onRow: boolean) => {
      obstacles = pops.slice()
      reserve = null
      if (!onRow) {
        obstacles.push(...rows)
        return
      }
      let item: Box | null = null
      let nearest = Infinity
      for (const it of rowItems) {
        const d = mx < it.l ? it.l - mx : mx > it.r ? mx - it.r : 0
        if (d < nearest) { nearest = d; item = it }
      }
      if (!item) return
      const row = rows.find(r => inside(r, mx, my, ROW_SPAN))
      const top = row ? row.b : item.b
      reserve = {
        l: item.l + POP_RESERVE.left, t: top,
        r: item.l + POP_RESERVE.left + POP_RESERVE.width, b: top + POP_RESERVE.height,
      }
      const mid = (item.t + item.b) / 2
      obstacles.push(item, reserve, { l: item.r, t: mid - NOTE_RESERVE.halfHeight, r: item.r + NOTE_RESERVE.width, b: mid + NOTE_RESERVE.halfHeight })
    }
    const isClear = (c: { x: number; y: number }) => {
      const box = boxAt(c)
      if (box.l < 0 || box.t < 0 || box.r > window.innerWidth || box.b > window.innerHeight) return false
      for (const o of obstacles) if (overlaps(box, o, AVOID_MARGIN)) return false
      return true
    }

    // The spot to head for: 0 = home, 1…CANDIDATES = a ring spot, -1 = none clear.
    const pickSpot = (mx: number, my: number) => {
      const cur = figpalSpot
      if (!rows.length && !pops.length) { frozenDir = null; obstacles = []; reserve = null; return 0 }
      // Stepping aside is immediate; coming back home needs extra clearance.
      const m = AVOID_MARGIN + (cur === 0 ? 0 : AVOID_RETURN)
      const inZone = rows.some(r => inside(r, mx, my, m)) || pops.some(r => inside(r, mx, my, m))
      buildObstacles(mx, my, inZone && rows.some(r => inside(r, mx, my, ROW_SPAN)))
      if (!inZone) {
        frozenDir = null
        const home = boxAt(homeCentre(mx, my))
        if (!pops.some(o => overlaps(home, o, m)) && !rows.some(o => overlaps(home, o, m))) return 0
      } else if (!frozenDir) {
        // Entering: capture the approach and hold it while the pointer stays
        // in the zone, so sliding along the row doesn't swing the figpal round.
        frozenDir = liveDir(mx, my)
      }
      const dir = frozenDir ?? liveDir(mx, my)
      const want = ringCentre(mx, my, -dir.x, -dir.y, RING_GAPS[0]!) // behind the pointer
      // Distance from behind, plus a nudge off the neighbouring icons: it
      // may sit over one, but takes a spot just past it when there's one near.
      const score = (i: number) => {
        const c = candidate(i, mx, my)
        const box = boxAt(c)
        const onIcon = rowItems.some(it => overlaps(box, it, 0))
        return Math.hypot(c.x - want.x, c.y - want.y) + (onIcon ? ICON_PENALTY : 0)
      }
      let best = -1
      let bestScore = Infinity
      for (let i = 1; i <= CANDIDATES; i++) {
        if (!isClear(candidate(i, mx, my))) continue
        const sc = score(i)
        if (sc < bestScore) { bestScore = sc; best = i }
      }
      // Don't hop between neighbours: stay unless the new best is clearly better.
      if (cur > 0 && best > 0 && cur !== best && isClear(candidate(cur, mx, my)) && score(cur) <= bestScore + SPOT_HYSTERESIS) return cur
      return best
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
      if (cursorMode === 'figpal') {
        const now = performance.now()
        trail.push({ t: now, x: e.clientX, y: e.clientY })
        while (trail.length > 2 && now - trail[0]!.t > DIR_WINDOW_MS * 2) trail.shift()
      }

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
        const mx = mouseRef.current.x
        const my = mouseRef.current.y
        const zonesChanged = readZones(mx, my)
        const next = pickSpot(mx, my)
        figpalSpot = next
        // Nowhere clear: fade out where it is (keep following home, unseen).
        const c = spotCentre(next, mx, my)
        targetX = c.x - figpalW / 2
        targetY = c.y - FIGPAL_SIZE / 2
        if (reducedMotion.current) {
          posRef.current.x = targetX
          posRef.current.y = targetY
          settled = true
          follow = null
        } else {
          const now = performance.now()
          const dt = Math.min(0.032, lastFrame ? (now - lastFrame) / 1000 : 1 / 60)
          lastFrame = now
          const { x, y } = posRef.current
          const tox = c.x - mx, toy = c.y - my // the spot, relative to the pointer
          if (!follow) {
            off.x = tox; off.y = toy; off.vx = off.vy = 0
            follow = { x: x + figpalW / 2 - tox, y: y + FIGPAL_SIZE / 2 - toy }
          }
          // Caught inside a pop-out (or the space one is about to open into),
          // e.g. trailing up from below: hurry out rather than drift across.
          // Otherwise brisk stepping aside, unhurried coming home.
          const inPop = pops.some(o => overlaps(boxAtPos(x, y), o, 0))
          const w = inPop || (reserve && overlaps(boxAtPos(x, y), reserve, 0)) ? ESCAPE_W
            : next <= 0 ? STEP_HOME_W : STEP_ASIDE_W
          // Semi-implicit Euler on a critically damped spring.
          const nvx = off.vx + (w * w * (tox - off.x) - 2 * w * off.vx) * dt
          const nvy = off.vy + (w * w * (toy - off.y) - 2 * w * off.vy) * dt
          const nox = off.x + nvx * dt, noy = off.y + nvy * dt
          const nfx = follow.x + (mx - follow.x) * LERP_RATE
          const nfy = follow.y + (my - follow.y) * LERP_RATE
          const nx = nfx + nox - figpalW / 2
          const ny = nfy + noy - FIGPAL_SIZE / 2
          // Outside a pop-out but the next step would cross one (heading home
          // as it closes, say): wait for it to go, then glide. Capped, so a
          // pop-out that stays put can't strand the figpal; past the cap the
          // dip below covers the crossing.
          const ahead = !inPop && pops.some(o => overlaps(boxAtPos(nx, ny), o, 0))
          if (!ahead) holdSince = null
          else if (holdSince === null) holdSince = now
          if (ahead && now - holdSince! < HOLD_MAX_MS) {
            settled = false
          } else {
            off.x = nox; off.y = noy; off.vx = nvx; off.vy = nvy
            follow.x = nfx; follow.y = nfy
            posRef.current.x = nx
            posRef.current.y = ny
            settled = Math.abs(nx - targetX) < 0.5 && Math.abs(ny - targetY) < 0.5
              && Math.hypot(off.vx, off.vy) < 2
            if (settled) {
              posRef.current.x = targetX
              posRef.current.y = targetY
              off.x = tox; off.y = toy; off.vx = off.vy = 0
              follow.x = mx; follow.y = my
              lastFrame = 0 // the loop stops: the next start begins a fresh step
            }
          }
        }
        // Never drawn over an open pop-out: if the glide still crosses one,
        // it dips out for those frames.
        const box = boxAtPos(posRef.current.x, posRef.current.y)
        const over = pops.some(o => overlaps(box, o, 0))
        const hidden = next === -1 || over
        if (hidden !== figpalHidden && figpalRef.current) {
          figpalHidden = hidden
          // Over a pop-out it goes at once (a fade would be seen over it);
          // nowhere clear, it fades; it always fades back in.
          figpalRef.current.style.transition = hidden && over ? 'none' : FIGPAL_FADE
          figpalRef.current.style.opacity = hidden ? '0' : '1'
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
    // still pointer, so wake the loop when an avoid zone comes, goes or
    // changes, or the page scrolls or resizes. Any DOM change marks the
    // cached zones stale; only one that touches a zone wakes the loop (the
    // rest of the page typing, flying or updating doesn't).
    const touchesZone = (n: Node) => n instanceof Element && (n.matches(AVOID_SELECTOR) || !!n.querySelector(AVOID_SELECTOR))
    const onMutations = (records: MutationRecord[]) => {
      zonesStale = true
      if (records.some(r => (r.target instanceof Element && r.target.closest(AVOID_SELECTOR))
        || [...r.addedNodes].some(touchesZone) || [...r.removedNodes].some(touchesZone))) startLoop()
    }
    const onLayout = () => { zonesStale = true; startLoop() }
    let observer: MutationObserver | null = null
    if (cursorMode === 'figpal') {
      observer = new MutationObserver(onMutations)
      observer.observe(document.body, { childList: true, subtree: true })
      window.addEventListener('scroll', onLayout, { passive: true, capture: true })
      window.addEventListener('resize', onLayout)
    }

    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onLayout, { capture: true })
      window.removeEventListener('resize', onLayout)
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
