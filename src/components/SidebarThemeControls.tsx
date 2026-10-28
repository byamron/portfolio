import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, type ReactNode } from 'react'
import { motion, AnimatePresence, useAnimationControls, useReducedMotion } from 'framer-motion'
import { Monitor, Sun, Moon, Cursor, Circle } from '@phosphor-icons/react'
import { useTheme, computeBg, type AppearanceMode, type AccentColor } from '@/contexts/ThemeContext'
import { useCursor, type CursorMode } from '@/contexts/CursorContext'
import { useIsWide } from '@/hooks/useMediaQuery'
import { isInitialEntrance, entrancePreset } from '@/utils/entranceState'

const modes: { mode: AppearanceMode; Icon: typeof Monitor; label: string }[] = [
  { mode: 'system', Icon: Monitor, label: 'System theme' },
  { mode: 'light', Icon: Sun, label: 'Light theme' },
  { mode: 'dark', Icon: Moon, label: 'Dark theme' },
]

const cursorOptions: { mode: CursorMode; label: string; icon: 'cursor' | 'circle' | 'figpal' }[] = [
  // { mode: 'invert', label: 'Invert circle cursor', icon: 'circle' },  // Disabled: Chromium macOS Tahoe ignores cursor:none
  { mode: 'standard', label: 'Standard cursor', icon: 'cursor' },
  { mode: 'figpal', label: 'Figpal trailing cursor', icon: 'figpal' },
]

const ACCENT_ORDER: AccentColor[] = ['table', 'portrait', 'pizza', 'vineyard', 'sky']

const motionEase = [0.25, 0.46, 0.45, 0.94]

// Pill: 36×36, centered on each control
// Concentric radius: swatch borderRadius (6) + padding ((36-24)/2 = 6) = 12
const PILL_SIZE = 36
const PILL_RADIUS = 12

// Trigger intensity indicator: continuous lerp (glow + fill opacity)
// Glow: soft ambient halo in the swatch color, 0–14px spread
// Fill: compressed opacity range (0.45 → 1.0) so the dot is never invisible
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

const KEYBOARD_STEP = 0.05

// ---------------------------------------------------------------------------
// Mini glass pill for sidebar controls
// ---------------------------------------------------------------------------

function setupControlPill(container: HTMLElement): () => void {
  let pill: HTMLDivElement | null = null
  let currentControl: HTMLElement | null = null
  let rafId: number | null = null

  const state = {
    currentX: 0, currentY: 0, currentW: 0, currentH: 0,
    targetX: 0, targetY: 0, targetW: 0, targetH: 0,
  }
  let retryRafId: number | null = null
  let pendingControl: HTMLElement | null = null
  let lastClientX = -1
  let lastClientY = -1
  let probeTimerId: ReturnType<typeof setTimeout> | null = null

  function createPill(): HTMLDivElement {
    const div = document.createElement('div')
    div.setAttribute('aria-hidden', 'true')
    Object.assign(div.style, {
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: '10',
      opacity: '0',
      willChange: 'transform, opacity',
      contain: 'layout style',
      top: '0',
      left: '0',
    })
    container.insertBefore(div, container.firstChild)
    return div
  }

  function skinPill(): void {
    if (!pill) return
    const hue = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim()
    ) || 34
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

    // Frost: matches useGlassHighlight skinPill()
    pill.style.background = `hsla(${hue}, 20%, ${isDark ? '55%' : '40%'}, ${isDark ? 0.12 : 0.08})`
    pill.style.backdropFilter = 'blur(1px)'
    ;(pill.style as unknown as Record<string, string>)['webkitBackdropFilter'] = 'blur(1px)'
    pill.style.boxShadow = isDark
      ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.10)'
      : 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.06)'
    pill.style.border = isDark
      ? '0.5px solid rgba(255, 255, 255, 0.12)'
      : '0.5px solid rgba(0, 0, 0, 0.08)'
  }

  function getControlPosition(el: HTMLElement) {
    // Use offsetLeft/offsetTop to get layout position without CSS transforms.
    // getBoundingClientRect() reflects Framer Motion's slide-in animation
    // (x: 20 → 0), which causes the pill to snap to the wrong position
    // when hovering a control before its animation completes.
    let x = 0, y = 0
    let node: HTMLElement | null = el
    while (node && node !== container) {
      x += node.offsetLeft
      y += node.offsetTop
      node = node.offsetParent as HTMLElement | null
    }
    const centerX = x + el.offsetWidth / 2
    const centerY = y + el.offsetHeight / 2
    return {
      x: centerX - PILL_SIZE / 2,
      y: centerY - PILL_SIZE / 2,
      w: PILL_SIZE,
      h: PILL_SIZE,
    }
  }

  function fadeIn(): void {
    if (!pill) return
    pill.style.transition = 'opacity 150ms ease'
    pill.style.opacity = '1'
  }

  function fadeOut(): void {
    if (!pill) return
    pill.style.transition = 'opacity 150ms ease'
    pill.style.opacity = '0'
  }

  function startLoop(): void {
    if (rafId !== null) return
    rafId = requestAnimationFrame(loop)
  }

  function stopLoop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  let lastTime = 0

  function loop(now: number): void {
    rafId = null
    if (!currentControl || !pill) return

    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.032) : 0.016
    lastTime = now
    const lr = 1 - Math.pow(0.8, dt * 60)

    state.currentX += (state.targetX - state.currentX) * lr
    state.currentY += (state.targetY - state.currentY) * lr
    state.currentW += (state.targetW - state.currentW) * lr
    state.currentH += (state.targetH - state.currentH) * lr

    const threshold = 0.3
    const settled =
      Math.abs(state.currentX - state.targetX) < threshold &&
      Math.abs(state.currentY - state.targetY) < threshold &&
      Math.abs(state.currentW - state.targetW) < threshold &&
      Math.abs(state.currentH - state.targetH) < threshold

    if (settled) {
      state.currentX = state.targetX
      state.currentY = state.targetY
      state.currentW = state.targetW
      state.currentH = state.targetH
    }

    pill.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`
    pill.style.width = `${state.currentW}px`
    pill.style.height = `${state.currentH}px`

    if (!settled) {
      rafId = requestAnimationFrame(loop)
    }
  }

  function cancelRetry(): void {
    if (retryRafId !== null) {
      cancelAnimationFrame(retryRafId)
      retryRafId = null
    }
    pendingControl = null
  }

  function isControlVisible(control: HTMLElement): boolean {
    const wrapper = control.parentElement
    if (!wrapper) return true
    return parseFloat(getComputedStyle(wrapper).opacity) >= 0.95
  }

  function showPillForControl(control: HTMLElement, prevControl: HTMLElement | null): void {
    currentControl = control
    lastTime = 0 // reset so first frame uses default dt
    const pos = getControlPosition(control)

    if (!prevControl) {
      state.currentX = state.targetX = pos.x
      state.currentY = state.targetY = pos.y
      state.currentW = state.targetW = pos.w
      state.currentH = state.targetH = pos.h

      pill!.style.transition = 'none'
      pill!.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      pill!.style.width = `${pos.w}px`
      pill!.style.height = `${pos.h}px`
      pill!.style.borderRadius = `${PILL_RADIUS}px`
      void pill!.offsetHeight

      fadeIn()
    } else {
      state.targetX = pos.x
      state.targetY = pos.y
      state.targetW = pos.w
      state.targetH = pos.h
    }

    startLoop()
  }

  function retryUntilVisible(control: HTMLElement): void {
    cancelRetry()
    pendingControl = control
    retryRafId = requestAnimationFrame(function check() {
      retryRafId = null
      if (pendingControl !== control) return
      if (isControlVisible(control)) {
        const prev = currentControl
        pendingControl = null
        showPillForControl(control, prev)
      } else {
        retryRafId = requestAnimationFrame(check)
      }
    })
  }

  function handleMouseOver(e: MouseEvent): void {
    const control = (e.target as HTMLElement).closest<HTMLElement>('[data-sidebar-control]')
    if (!control) return
    if (control === currentControl) return

    cancelRetry()

    if (!isControlVisible(control)) {
      retryUntilVisible(control)
      return
    }

    showPillForControl(control, currentControl)
  }

  function handleMouseLeave(e: MouseEvent): void {
    if (container.contains(e.relatedTarget as Node)) return
    cancelRetry()
    currentControl = null
    fadeOut()
    stopLoop()
  }

  // Track cursor position so we can probe for a stationary cursor after
  // stagger animations complete. mouseover doesn't fire when elements
  // animate under a stationary pointer — only pointer input triggers it.
  function trackMouse(e: MouseEvent): void {
    lastClientX = e.clientX
    lastClientY = e.clientY
  }

  function probeStaticCursor(): void {
    probeTimerId = null
    if (currentControl || pendingControl) return
    if (lastClientX < 0) return
    const el = document.elementFromPoint(lastClientX, lastClientY)
    if (!el) return
    const control = el.closest<HTMLElement>('[data-sidebar-control]')
    if (!control || !container.contains(control)) return
    if (!isControlVisible(control)) return
    showPillForControl(control, null)
  }

  const handleThemeChange = () => skinPill()
  document.addEventListener('theme-changed', handleThemeChange)

  pill = createPill()
  skinPill()

  container.addEventListener('mouseover', handleMouseOver)
  container.addEventListener('mouseleave', handleMouseLeave)
  container.addEventListener('mousemove', trackMouse)
  // Probe after stagger animations would be complete (~780ms max).
  // Catches a stationary cursor that ended up over a control.
  probeTimerId = setTimeout(probeStaticCursor, 800)

  return () => {
    stopLoop()
    cancelRetry()
    if (probeTimerId !== null) { clearTimeout(probeTimerId); probeTimerId = null }
    container.removeEventListener('mouseover', handleMouseOver)
    container.removeEventListener('mouseleave', handleMouseLeave)
    container.removeEventListener('mousemove', trackMouse)
    document.removeEventListener('theme-changed', handleThemeChange)
    pill?.remove()
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const THUMB_SIZE = 11

// Stagger delay indices (fixed layout: swatches → intensity → modes → cursors)
// [0] divider  [1-5] swatches  [6] divider  [7] strip  [8] divider  [9-11] modes  [12] divider  [13-14] cursors
const DIVIDER_1 = 0
const SWATCH_BASE = 1
const DIVIDER_2 = SWATCH_BASE + ACCENT_ORDER.length    // 5
const STRIP_IDX = DIVIDER_2 + 1                       // 6
const DIVIDER_3 = STRIP_IDX + 1                       // 7
const MODE_BASE = DIVIDER_3 + 1                       // 8
const DIVIDER_4 = MODE_BASE + modes.length             // 11
const CURSOR_BASE = DIVIDER_4 + 1                      // 12
const DIVIDER_5 = CURSOR_BASE + cursorOptions.length   // 14
const EXTRA_IDX = DIVIDER_5 + 1                        // 15

const TRIGGER_ICON_BOX = 44 // matches the page's icon buttons
// What the glide pill lands on: the trigger, every button, the strip, the record.
export const GLIDE_TARGETS = '.sidebar-icon-trigger, [data-sidebar-control], [data-sidebar] [role="slider"], [data-sidebar] [role="switch"]'
// Fit mode floors: intensity strip (before ×controlScale) and divider air.
const STRIP_MIN = 42
const DIVIDER_MIN = 10
const DIVIDER_MAX = 18

// Record-shaped extra control: its width tracks the icon buttons (a touch
// wider so the record reads), its height follows the record's 236:144 plinth.
const EXTRA_OVERHANG = 5
export const RECORD_ASPECT = 236 / 144 // RecordToggle's plinth (not imported: it's lazy-loaded)

export interface SidebarMetrics {
  /** Icon-button size at the current compression. */
  buttonSize: number
  /** Width the extra control should take to sit flush with the rail. */
  extraWidth: number
}

/** Dispatch on window (detail: { opener }) to open the sidebar pinned —
 *  it then stays open until a click outside, Escape, or another toggle. */
export const THEME_SIDEBAR_TOGGLE = 'theme-sidebar:toggle'
/** Broadcast on window with detail: { open } whenever the sidebar opens/closes. */
export const THEME_SIDEBAR_STATE = 'theme-sidebar:state'

interface SidebarThemeControlsProps {
  /** Hide the trigger square until the sidebar is open (an external element,
   *  via THEME_SIDEBAR_TOGGLE, is the visible way in; edge hover still works). */
  hideTriggerAtRest?: boolean
  /** Replaces the 16px accent square with an always-visible icon button.
   *  Click pins the sidebar open (click again, click outside, or Escape closes). */
  triggerIcon?: ReactNode
  /** One more control at the foot of the sidebar, below the cursor group.
   *  Right-aligned to the rail and kept out of its width, so wide controls
   *  (the record toggle) don't shift the column. Stays mounted while closed. */
  extraControl?: ReactNode | ((m: SidebarMetrics) => ReactNode)
  /** Multiplies control sizes (swatches, icon buttons, intensity strip). */
  controlScale?: number
  /** 'click': only the trigger opens it; the right edge doesn't react to
   *  hover (and passes pointer events through to the page). */
  openOn?: 'hover' | 'click'
  /** Names what the icon trigger opens, for its aria-label ("Open …"). */
  triggerLabel?: string
  /** Per-item open stagger (s). */
  stagger?: number
  /** Fit every control to the viewport height instead of scrolling, leaving
   *  this much room at the bottom (px). Off (undefined) = prod behaviour. */
  fitBottomReserve?: number
  /** One frosted pill for the whole rail that glides between controls
   *  (instead of a pill per group + the trigger's own glass). */
  glidePill?: boolean
  /** Column top (px). Default: the --sidebar-trigger-top CSS variable a page
   *  may set (e.g. aligned to measured content), else 64. */
  triggerTop?: number
}

export function SidebarThemeControls({
  hideTriggerAtRest = false, triggerIcon, extraControl, controlScale = 1,
  openOn = 'hover', stagger = 0.04, fitBottomReserve, triggerLabel = 'settings', glidePill = false, triggerTop: triggerTopProp,
}: SidebarThemeControlsProps = {}) {
  const [hovered, setHovered] = useState(false)
  // Opened by a click (external trigger): mouse-leave doesn't close it.
  const [pinned, setPinned] = useState(false)
  const hoveredRef = useRef(hovered)
  hoveredRef.current = hovered
  const pinnedRef = useRef(pinned)
  pinnedRef.current = pinned
  const openerRef = useRef<HTMLElement | null>(null)
  // Backdrop is 300px wide inside a 56px container; clipping it the instant
  // hover ends slices its fade-out into a hard vertical edge.
  const [backdropExiting, setBackdropExiting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isEntrance = useRef(isInitialEntrance()).current
  const slideProps = useMemo(() => ({ x: hovered ? 0 : 20, y: 0 }), [hovered])
  useEffect(() => { if (hovered) setBackdropExiting(true) }, [hovered])
  const { appearanceMode, setAppearanceMode, accentColor, setAccentColor,
          resolvedAppearance, bgIntensity, setBgIntensity } = useTheme()
  const { cursorMode, setCursorMode } = useCursor()
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const swatchesRef = useRef<HTMLDivElement>(null)
  const modesRef = useRef<HTMLDivElement>(null)
  const cursorsRef = useRef<HTMLDivElement>(null)
  const cleanupSwatchPill = useRef<(() => void) | null>(null)
  const cleanupModePill = useRef<(() => void) | null>(null)
  const cleanupCursorPill = useRef<(() => void) | null>(null)
  const draggingRef = useRef(false)
  useEffect(() => () => { if (draggingRef.current) document.body.style.transition = '' }, [])
  const pendingIntensity = useRef<number | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isWide = useIsWide()
  const [isCoarsePointer, setIsCoarsePointer] = useState(() => window.matchMedia('(pointer: coarse)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    setIsCoarsePointer(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsCoarsePointer(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Use click-to-toggle (not hover) on narrow viewports OR touch devices
  const isTouch = isCoarsePointer || !isWide

  // ---- Viewport-responsive layout ----
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight)
  useEffect(() => {
    const handler = () => {
      setViewportHeight(window.innerHeight)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Compression: full-size at 740px+, linearly compressed down to 500px
  const FULL_VP = 740
  const MIN_VP = 500
  const sc = controlScale
  const triggerSize = triggerIcon ? (TRIGGER_ICON_BOX) : 16
  // Fit mode — three levers, in order: (1) tighten the divider air (18 →
  // 10px), (2) shorten the intensity strip (to STRIP_MIN), (3) compress every
  // control (t). Heights come from a model of the stack, corrected by its
  // measured error against the real layout.
  const stripAt = (t: number) => Math.round(lerp(44, 72, t) * sc)
  const stripMin = Math.round(STRIP_MIN * sc)
  const dividerCount = (isTouch ? 3 : 4) + (extraControl ? 1 : 0)
  // Stack height without the strip, at compression t and divider margin dm.
  const stackWithoutStrip = (t: number, dm: number) => {
    const btn = Math.round(lerp(30, 40, t) * sc)
    const swatches = 5 * Math.round(lerp(18, 24, t) * sc) + 4 * Math.round(lerp(6, 14, t))
    const modes = 3 * btn + 2 * Math.round(lerp(2, 6, t))
    const cursors = isTouch ? 0 : 2 * btn + Math.round(lerp(2, 6, t))
    const extra = extraControl ? Math.round((btn + EXTRA_OVERHANG) / RECORD_ASPECT) : 0
    return triggerSize + dividerCount * (2 * dm + 1) + swatches + modes + cursors + extra
  }
  const [fitError, setFitError] = useState(0)
  // Fit mode only needs it, and a prop avoids a style read on every render.
  const triggerTop = triggerTopProp ?? 64
  let compressT = Math.min(1, Math.max(0, (viewportHeight - MIN_VP) / (FULL_VP - MIN_VP)))
  let fitStrip: number | null = null
  let fitDivider: number | null = null
  if (fitBottomReserve !== undefined) {
    const room = viewportHeight - triggerTop - fitBottomReserve - fitError
    compressT = 1
    const spare = room - stackWithoutStrip(1, 0) - stripAt(1)
    const dm = Math.floor(spare / (2 * dividerCount))
    if (dm >= DIVIDER_MAX) {
      fitDivider = null
    } else if (dm >= DIVIDER_MIN) {
      fitDivider = dm
    } else {
      fitDivider = DIVIDER_MIN
      const strip = Math.floor(room - stackWithoutStrip(1, DIVIDER_MIN))
      if (strip >= stripMin) {
        fitStrip = strip
      } else {
        fitStrip = stripMin
        let lo = 0, hi = 1
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2
          if (stackWithoutStrip(mid, Math.min(DIVIDER_MIN, Math.round(lerp(8, 18, mid)))) + stripMin <= room) lo = mid
          else hi = mid
        }
        compressT = lo
        fitDivider = Math.min(DIVIDER_MIN, Math.round(lerp(8, 18, lo)))
      }
    }
  }
  const swatchSize = Math.round(lerp(18, 24, compressT) * sc)
  const swatchGap = Math.round(lerp(6, 14, compressT))
  const dividerMargin = fitDivider ?? Math.round(lerp(8, 18, compressT))
  const buttonSize = Math.round(lerp(30, 40, compressT) * sc)
  const buttonGap = Math.round(lerp(2, 6, compressT))
  const stripHeight = fitStrip ?? stripAt(compressT)
  const iconSize = Math.round(18 * sc)
  const iconBox = Math.round(24 * sc)
  const thumbTravel = stripHeight - THUMB_SIZE

  // Max height for the expandable toolbar: viewport - top offset - trigger - bottom padding
  const extraWidth = buttonSize + EXTRA_OVERHANG
  const extraHeight = extraControl ? 2 * dividerMargin + 1 + Math.round(extraWidth / RECORD_ASPECT) : 0
  // Fit mode sizes the stack itself; the cap is only a last resort below the
  // smallest stack, and may then eat into the bottom reserve rather than clip.
  const toolbarMaxHeight = fitBottomReserve !== undefined
    ? viewportHeight - triggerTop - triggerSize - extraHeight - 8
    : viewportHeight - 64 - 16 - 16 - extraHeight

  // Fit mode: measure the real column (inline buttons add a few px of line
  // box each, etc.) and feed the model's error back in.
  const columnRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- re-measures every render (see below)
  useLayoutEffect(() => {
    if (fitBottomReserve === undefined) return
    const col = columnRef.current
    const bar = toolbarRef.current
    if (!col || !bar) return
    const actual = col.getBoundingClientRect().height - bar.clientHeight + bar.scrollHeight
    const model = stackWithoutStrip(compressT, dividerMargin) + stripHeight
    const error = Math.round(actual - model)
    if (Math.abs(error - fitError) > 1) setFitError(error)
    // No deps on purpose: re-measuring after every render is what lets the fit
    // settle once late-loading fonts/icons change the real stack height (fit
    // mode only — returns at once otherwise; converges in ≤1 extra render;
    // the >1px guard stops the loop).
  })

  const handleEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setHovered(true)
  }

  const handleLeave = () => {
    if (pinnedRef.current) return
    closeTimeout.current = setTimeout(() => setHovered(false), 250)
  }

  const triggerHidden = !triggerIcon && hideTriggerAtRest && !hovered
  const toggleFromTrigger = () => {
    // A visible icon button: hover may already have opened it, so a click
    // pins rather than toggling it shut under the cursor.
    if (triggerIcon) { pinOpen(triggerRef.current); return }
    if (hoveredRef.current) close(false)
    else setHovered(true)
  }

  const close = useCallback((restoreFocus: boolean) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setHovered(false)
    setPinned(false)
    if (restoreFocus) openerRef.current?.focus()
  }, [])

  /** Toggle a pinned open state (stays open until a click outside, Escape,
   *  or another toggle). Focus returns to `opener` on Escape. */
  const pinOpen = useCallback((opener: HTMLElement | null) => {
    if (hoveredRef.current && pinnedRef.current) { close(false); return }
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    openerRef.current = opener
    setHovered(true)
    setPinned(true)
  }, [close])

  // External trigger (e.g. a portrait elsewhere on the page).
  useEffect(() => {
    const onToggle = (e: Event) => pinOpen((e as CustomEvent<{ opener?: HTMLElement }>).detail?.opener ?? null)
    window.addEventListener(THEME_SIDEBAR_TOGGLE, onToggle)
    return () => window.removeEventListener(THEME_SIDEBAR_TOGGLE, onToggle)
  }, [pinOpen])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(THEME_SIDEBAR_STATE, { detail: { open: hovered } }))
  }, [hovered])

  // Pinned: dismiss on a press outside (the trigger toggles itself) or Escape.
  useEffect(() => {
    if (!hovered) return
    const onPointerDown = (e: PointerEvent) => {
      if (!pinnedRef.current) return
      const t = e.target as Element
      if (sidebarRef.current?.contains(t) || t.closest?.('[data-theme-sidebar-trigger]')) return
      close(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(true) }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [hovered, close])

  // Close panel when tapping outside on touch devices
  useEffect(() => {
    if (!hovered) return
    const handler = (e: TouchEvent) => {
      if (sidebarRef.current?.contains(e.target as Node)) return
      if ((e.target as Element).closest?.('[data-theme-sidebar-trigger]')) return
      setHovered(false)
      setPinned(false)
    }
    document.addEventListener('touchstart', handler)
    return () => document.removeEventListener('touchstart', handler)
  }, [hovered])

  // Each control group gets its own pill so the hover clears between sections
  const setupPills = useCallback(() => {
    cleanupSwatchPill.current?.()
    cleanupSwatchPill.current = null
    cleanupModePill.current?.()
    cleanupModePill.current = null
    cleanupCursorPill.current?.()
    cleanupCursorPill.current = null
    if (hovered && !glidePill) {
      if (swatchesRef.current) cleanupSwatchPill.current = setupControlPill(swatchesRef.current)
      if (modesRef.current) cleanupModePill.current = setupControlPill(modesRef.current)
      if (cursorsRef.current) cleanupCursorPill.current = setupControlPill(cursorsRef.current)
    }
  }, [hovered, glidePill])

  useEffect(() => {
    const timer = setTimeout(setupPills, 120)
    return () => {
      clearTimeout(timer)
      cleanupSwatchPill.current?.()
      cleanupSwatchPill.current = null
      cleanupModePill.current?.()
      cleanupModePill.current = null
      cleanupCursorPill.current?.()
      cleanupCursorPill.current = null
    }
  }, [setupPills])

  // ---- Glide pill (opt-in) ----
  // One pill in the column, behind the controls (z -1 inside the column's
  // filter stacking context). It springs from target to target; leaving the
  // rail fades it after a short grace (crossing a gap between two controls
  // shouldn't flicker), and it reappears in place on the next hover.
  const glide = useAnimationControls()
  const glideShown = useRef(false)
  const glideHide = useRef<ReturnType<typeof setTimeout> | null>(null)
  const glideTo = useCallback((el: Element) => {
    const col = columnRef.current
    if (!col) return
    if (glideHide.current) { clearTimeout(glideHide.current); glideHide.current = null }
    const c = col.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    // At least the trigger's square; wider/taller controls get a little air.
    const w = Math.max(r.width + (r.width > TRIGGER_ICON_BOX ? 8 : 0), TRIGGER_ICON_BOX)
    const h = Math.max(r.height + (r.height > TRIGGER_ICON_BOX ? 8 : 0), TRIGGER_ICON_BOX)
    const target = { x: r.left - c.left + (r.width - w) / 2, y: r.top - c.top + (r.height - h) / 2, width: w, height: h }
    if (!glideShown.current || prefersReducedMotion) {
      glide.set(target)
      glide.start({ opacity: 1, transition: { duration: 0.12 } })
    } else {
      glide.start({ ...target, opacity: 1, transition: { type: 'spring', stiffness: 560, damping: 40, mass: 0.7, opacity: { duration: 0.12 } } })
    }
    glideShown.current = true
  }, [glide, prefersReducedMotion])
  const glideOut = useCallback(() => {
    if (glideHide.current) clearTimeout(glideHide.current)
    glideHide.current = setTimeout(() => {
      glideShown.current = false
      glide.start({ opacity: 0, transition: { duration: 0.16 } })
    }, 140)
  }, [glide])
  useEffect(() => () => { if (glideHide.current) clearTimeout(glideHide.current) }, [])
  const glideHandlers = glidePill ? {
    onPointerOver: (e: React.PointerEvent) => {
      const t = (e.target as Element).closest(GLIDE_TARGETS)
      if (t && columnRef.current?.contains(t)) glideTo(t)
    },
    onPointerOut: (e: React.PointerEvent) => {
      const to = e.relatedTarget as Element | null
      if (!to || !columnRef.current?.contains(to) || !to.closest(GLIDE_TARGETS)) glideOut()
    },
    onFocus: (e: React.FocusEvent) => {
      const t = (e.target as Element).closest(GLIDE_TARGETS)
      if (t) glideTo(t)
    },
    onBlur: glideOut,
  } : {}

  const activeSwatchVar = `var(--swatch-${accentColor})`

  const thumbRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Gradient strip pointer handlers (continuous drag support)
  const updateFromPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const h = rect.height
    const y = Math.max(0, Math.min(h, e.clientY - rect.top))
    const t = y / h
    // During drag: skip React state updates, use direct DOM for zero-lag feedback.
    // Commit final value on pointer up.
    if (draggingRef.current) {
      pendingIntensity.current = t
    } else {
      setBgIntensity(t)
    }
    if (draggingRef.current) {
      const bg = computeBg(accentColor, resolvedAppearance, t)
      if (thumbRef.current) thumbRef.current.style.top = `${t * (h - THUMB_SIZE)}px`
      document.documentElement.style.setProperty('--bg', bg)
      // Sync trigger dot and meta theme-color in the same frame
      if (triggerRef.current && !triggerIcon) {
        triggerRef.current.style.opacity = String(lerp(0.45, 1.0, t))
        triggerRef.current.style.boxShadow = t > 0.01
          ? `0 0 ${lerp(0, 14, t).toFixed(1)}px color-mix(in srgb, ${activeSwatchVar} ${Math.round(lerp(0, 0.5, t) * 100)}%, transparent)`
          : 'none'
      }
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', bg)
    }
  }, [setBgIntensity, accentColor, resolvedAppearance, activeSwatchVar, triggerIcon])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = true
    setIsDragging(true)
    // Disable body bg transition for instant feedback during drag
    document.body.style.transition = 'none'
    updateFromPointer(e)
  }, [updateFromPointer])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    updateFromPointer(e)
  }, [updateFromPointer])

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false
    setIsDragging(false)
    // Commit deferred intensity to React state + localStorage
    if (pendingIntensity.current !== null) {
      setBgIntensity(pendingIntensity.current)
      pendingIntensity.current = null
    }
    // Restore body bg transition
    document.body.style.transition = ''
  }, [setBgIntensity])

  return (
    <div
      ref={sidebarRef}
      data-sidebar
      data-glide={glidePill || undefined}
      onMouseEnter={isTouch || openOn === 'click' ? undefined : handleEnter}
      onMouseLeave={isTouch || openOn === 'click' ? undefined : handleLeave}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 56,
        height: '100vh',
        zIndex: 100,
        // Click-only rails never catch the pointer, so nothing needs clipping
        // at rest — and the icon trigger's glass is wider than the strip.
        overflow: hovered || backdropExiting || openOn === 'click' ? 'visible' : 'hidden',
        // Click-only: the strip itself never catches the pointer; the trigger
        // and (while open) each control opt back in.
        pointerEvents: openOn === 'click' || (isTouch && !hovered) ? 'none' : 'auto',
        viewTransitionName: 'sidebar',
      }}
    >
      {/* Sidebar backdrop — mount/unmount to avoid compositing cost at rest */}
      <AnimatePresence onExitComplete={() => setBackdropExiting(false)}>
        {hovered && (
          <motion.div
            key="sidebar-backdrop"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: motionEase }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: 300,
              background: 'linear-gradient(to right, transparent 0%, color-mix(in srgb, var(--bg) 10%, transparent) 30%, color-mix(in srgb, var(--bg) 30%, transparent) 50%, color-mix(in srgb, var(--bg) 55%, transparent) 70%, color-mix(in srgb, var(--bg) 80%, transparent) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.02) 15%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,1) 80%)',
              WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.02) 15%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,1) 80%)',
              pointerEvents: 'none',
              willChange: 'opacity',
              contain: 'strict',
            } as React.CSSProperties}
          />
        )}
      </AnimatePresence>
      <motion.div
        initial={isEntrance && !prefersReducedMotion ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={isEntrance && !prefersReducedMotion ? { duration: 0.4, delay: entrancePreset.sidebarDelay, ease: 'easeOut' } : { duration: 0 }}
        ref={columnRef}
        {...glideHandlers}
        style={{
          position: 'absolute',
          right: 16,
          display: 'flex',
          alignItems: 'center',
          top: triggerTopProp ?? 'var(--sidebar-trigger-top, 64px)',
          flexDirection: 'column' as const,
          filter: 'drop-shadow(0 1px 3px color-mix(in srgb, var(--bg) 90%, transparent))',
        }}
      >
        {glidePill && (
          <motion.div
            aria-hidden="true"
            animate={glide}
            initial={{ opacity: 0 }}
            style={{
              position: 'absolute', top: 0, left: 0, zIndex: -1, pointerEvents: 'none',
              borderRadius: 12,
              // Same frost as the page's glass pill (useGlassHighlight skinPill).
              background: resolvedAppearance === 'dark'
                ? 'hsla(var(--accent-hue), 20%, 55%, 0.12)'
                : 'hsla(var(--accent-hue), 20%, 40%, 0.08)',
              boxShadow: resolvedAppearance === 'dark'
                ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.10)'
                : 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.06)',
              border: resolvedAppearance === 'dark'
                ? '0.5px solid rgba(255, 255, 255, 0.12)'
                : '0.5px solid rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(1px)',
            }}
          />
        )}
        {/* Fixed trigger — 16×16 dot with 40×40 invisible touch target overlay */}
        <div
          ref={triggerRef}
          role="button"
          tabIndex={triggerHidden ? -1 : 0}
          aria-hidden={triggerHidden || undefined}
          aria-label={triggerIcon
            ? `${hovered ? 'Close' : 'Open'} ${triggerLabel}`
            : (hovered ? 'Close theme controls' : 'Open theme controls')}
          aria-expanded={hovered}
          className={triggerIcon ? 'sidebar-icon-trigger' : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleFromTrigger()
            }
          }}
          style={triggerIcon ? {
            position: 'relative',
            width: TRIGGER_ICON_BOX,
            height: TRIGGER_ICON_BOX,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-dark)',
            opacity: hovered ? 1 : 0.6,
            flexShrink: 0,
          } : {
            position: 'relative',
            width: 16,
            height: 16,
            borderRadius: 5,
            background: activeSwatchVar,
            opacity: triggerHidden ? 0 : lerp(0.45, 1.0, bgIntensity),
            pointerEvents: triggerHidden ? 'none' : undefined,
            boxShadow: bgIntensity > 0.01
              ? `0 0 ${lerp(0, 14, bgIntensity).toFixed(1)}px color-mix(in srgb, ${activeSwatchVar} ${Math.round(lerp(0, 0.5, bgIntensity) * 100)}%, transparent)`
              : 'none',
            transition: 'background 200ms ease-in-out, opacity 300ms ease-in-out, box-shadow 300ms ease-in-out',
            flexShrink: 0,
          }}
        >
          {triggerIcon}
          {/* Enlarged hit area for touch */}
          <div
            onClick={toggleFromTrigger}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 44,
              height: 44,
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          />
        </div>

        {/* Expandable toolbar — scrollable when controls exceed viewport */}
        <div
          ref={toolbarRef}
          // Closed click-only rail: no stray tab stop on the (empty) toolbar.
          inert={openOn === 'click' && !hovered}
          className="sidebar-scroll"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            maxHeight: toolbarMaxHeight, overflowY: 'auto',
            scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
            padding: '0 6px',
          }}
        >
          {/* Divider: trigger ↔ swatches */}
          <motion.div
            animate={{ opacity: hovered ? 0.15 : 0, ...slideProps }}
            transition={{ duration: 0.22, delay: hovered ? DIVIDER_1 * stagger : 0, ease: motionEase }}
            style={{
              width: 20, height: 1, background: 'var(--text-dark)',
              margin: `${dividerMargin}px 0`, pointerEvents: 'none',
            }}
          />

          {/* Accent swatches — own pill container */}
          <div
            ref={swatchesRef}
            role="radiogroup"
            aria-label="Accent color"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: swatchGap }}
          >
            {ACCENT_ORDER.map((color, i) => {
              const isActive = accentColor === color
              const cssVar = `var(--swatch-${color})`
              return (
                <motion.div
                  key={color}
                  animate={{ opacity: hovered ? 1 : 0, ...slideProps }}
                  transition={{ duration: 0.22, delay: hovered ? (SWATCH_BASE + i) * stagger : 0, ease: motionEase }}
                  style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                >
                  <button
                    data-sidebar-control
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`${color} theme`}
                    tabIndex={hovered ? 0 : -1}
                    onClick={() => setAccentColor(color)}
                    style={{
                      width: swatchSize, height: swatchSize, borderRadius: Math.round(6 * sc),
                      background: cssVar, border: 'none', cursor: 'pointer', padding: 0, userSelect: 'none' as const,
                      outline: isActive ? `1.5px solid color-mix(in srgb, ${cssVar} 50%, transparent)` : 'none',
                      outlineOffset: 3, transition: 'outline 200ms ease-in-out',
                    }}
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Divider: swatches ↔ intensity */}
          <motion.div
            animate={{ opacity: hovered ? 0.15 : 0, ...slideProps }}
            transition={{ duration: 0.22, delay: hovered ? DIVIDER_2 * stagger : 0, ease: motionEase }}
            style={{
              width: 20, height: 1, background: 'var(--text-dark)',
              margin: `${dividerMargin}px 0`, pointerEvents: 'none',
            }}
          />

          {/* Intensity gradient strip */}
              <motion.div
                animate={{ opacity: hovered ? 1 : 0, ...slideProps }}
                transition={{ duration: 0.22, delay: hovered ? STRIP_IDX * stagger : 0, ease: motionEase }}
                style={{ pointerEvents: hovered ? 'auto' : 'none' }}
              >
                <div
                  aria-label="Background intensity"
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(bgIntensity * 100)}
                  aria-valuetext={`${Math.round(bgIntensity * 100)}%`}
                  tabIndex={hovered ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                      e.preventDefault()
                      setBgIntensity(Math.min(1, bgIntensity + KEYBOARD_STEP))
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                      e.preventDefault()
                      setBgIntensity(Math.max(0, bgIntensity - KEYBOARD_STEP))
                    }
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    position: 'relative',
                    width: iconBox,
                    height: stripHeight,
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    touchAction: 'none',
                    userSelect: 'none',
                  }}
                >
                  {/* The visual gradient strip */}
                  <div
                    style={{
                      width: Math.round(8 * sc),
                      height: stripHeight,
                      borderRadius: Math.round(4 * sc),
                      background: `linear-gradient(to bottom, color-mix(in srgb, var(--swatch) 8%, transparent), color-mix(in srgb, var(--swatch) 55%, transparent))`,
                      transition: 'background 500ms ease-in-out',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Active level indicator — thumb dot */}
                  <div
                    ref={thumbRef}
                    style={{
                      position: 'absolute',
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: 'var(--swatch)',
                      border: '1.5px solid color-mix(in srgb, var(--text-dark) 25%, transparent)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: bgIntensity * thumbTravel,
                      transition: isDragging ? 'none' : 'top 200ms ease-in-out, background 500ms ease-in-out',
                    }}
                  />
                </div>
              </motion.div>

              {/* Divider: intensity ↔ modes */}
              <motion.div
                animate={{ opacity: hovered ? 0.15 : 0, ...slideProps }}
                transition={{ duration: 0.22, delay: hovered ? DIVIDER_3 * stagger : 0, ease: motionEase }}
                style={{
                  width: 20, height: 1, background: 'var(--text-dark)',
                  margin: `${dividerMargin}px 0`, pointerEvents: 'none',
                }}
          />

          {/* Mode icons — own pill container */}
          <div
            ref={modesRef}
            role="radiogroup"
            aria-label="Appearance mode"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: buttonGap }}
          >
            {modes.map(({ mode, Icon, label }, i) => {
              const isActive = appearanceMode === mode
              return (
                <motion.div
                  key={mode}
                  animate={{ opacity: hovered ? 1 : 0, ...slideProps }}
                  transition={{ duration: 0.22, delay: hovered ? (MODE_BASE + i) * stagger : 0, ease: motionEase }}
                  style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                >
                  <button
                    data-sidebar-control
                    role="radio"
                    aria-checked={isActive}
                    aria-label={label}
                    tabIndex={hovered ? 0 : -1}
                    onClick={() => setAppearanceMode(mode)}
                    style={{
                      width: buttonSize, height: buttonSize, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 8,
                      opacity: isActive ? 1 : 0.4, color: 'var(--text-dark)',
                      transition: 'opacity 200ms ease-in-out', userSelect: 'none' as const,
                    }}
                  >
                    <span
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: iconBox, height: iconBox, borderRadius: Math.round(6 * sc),
                        outline: isActive ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
                        outlineOffset: 3, transition: 'outline 200ms ease-in-out',
                      }}
                    >
                      <Icon size={iconSize} />
                    </span>
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Cursor style controls — hidden on touch devices (no custom cursor) */}
          {!isTouch && (
            <>
              {/* Divider: modes ↔ cursors */}
              <motion.div
                animate={{ opacity: hovered ? 0.15 : 0, ...slideProps }}
                transition={{ duration: 0.22, delay: hovered ? DIVIDER_4 * stagger : 0, ease: motionEase }}
                style={{
                  width: 20, height: 1, background: 'var(--text-dark)',
                  margin: `${dividerMargin}px 0`, pointerEvents: 'none',
                }}
              />

              {/* Cursor style icons — own pill container */}
              <div
                ref={cursorsRef}
                role="radiogroup"
                aria-label="Cursor style"
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: buttonGap }}
              >
                {cursorOptions.map(({ mode, label, icon }, i) => {
                  const isActive = cursorMode === mode
                  return (
                    <motion.div
                      key={mode}
                      animate={{ opacity: hovered ? 1 : 0, ...slideProps }}
                      transition={{ duration: 0.22, delay: hovered ? (CURSOR_BASE + i) * stagger : 0, ease: motionEase }}
                      style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                    >
                      <button
                        data-sidebar-control
                        role="radio"
                        aria-checked={isActive}
                        aria-label={label}
                        tabIndex={hovered ? 0 : -1}
                        onClick={() => setCursorMode(mode)}
                        style={{
                          width: buttonSize, height: buttonSize, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 8,
                          opacity: isActive ? 1 : 0.4, color: 'var(--text-dark)',
                          transition: 'opacity 200ms ease-in-out', userSelect: 'none' as const,
                        }}
                      >
                        <span
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: iconBox, height: iconBox, borderRadius: Math.round(6 * sc),
                            outline: isActive ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
                            outlineOffset: 3, transition: 'outline 200ms ease-in-out',
                          }}
                        >
                          {icon === 'cursor' && <Cursor size={iconSize} />}
                          {icon === 'circle' && <Circle size={iconSize} />}
                          {icon === 'figpal' && (
                            <img
                              src="/images/figpal.png"
                              alt=""
                              style={{ height: Math.round(22 * sc), width: 'auto' }}
                            />
                          )}
                        </span>
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {extraControl && (
          <>
            <motion.div
              animate={{ opacity: hovered ? 0.15 : 0, ...slideProps }}
              transition={{ duration: 0.22, delay: hovered ? DIVIDER_5 * stagger : 0, ease: motionEase }}
              style={{
                width: 20, height: 1, background: 'var(--text-dark)',
                margin: `${dividerMargin}px 0`, pointerEvents: 'none', flexShrink: 0,
              }}
            />
            <motion.div
              inert={!hovered}
              animate={{ opacity: hovered ? 1 : 0, ...slideProps }}
              transition={{ duration: 0.22, delay: hovered ? EXTRA_IDX * stagger : 0, ease: motionEase }}
              style={{
                alignSelf: 'stretch',
                display: 'flex',
                justifyContent: 'center',
                // Zero intrinsic width: anything wider than the rail spills
                // out evenly instead of widening (and re-centring) it.
                contain: 'inline-size',
                pointerEvents: hovered ? 'auto' : 'none',
              }}
            >
              {typeof extraControl === 'function' ? extraControl({ buttonSize, extraWidth }) : extraControl}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}
