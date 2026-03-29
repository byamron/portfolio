import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Monitor, Sun, Moon, Cursor, Circle } from '@phosphor-icons/react'
import { useTheme, computeBg, type AppearanceMode, type AccentColor } from '@/contexts/ThemeContext'
import { useCursor, type CursorMode } from '@/contexts/CursorContext'
import { useIsWide } from '@/hooks/useMediaQuery'

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

function readSwatchColors(): { color: AccentColor; swatch: string }[] {
  const style = getComputedStyle(document.documentElement)
  return ACCENT_ORDER.map(color => ({
    color,
    swatch: style.getPropertyValue(`--swatch-${color}`).trim() || 'gray',
  }))
}

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

function swatchToHsla(swatch: string, alpha: number): string {
  return swatch.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`)
}

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

  function loop(): void {
    rafId = null
    if (!currentControl || !pill) return

    const lr = 0.2

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

export function SidebarThemeControls() {
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const slideProps = { x: hovered ? 0 : 20, y: 0 }
  const [accents, setAccents] = useState<{ color: AccentColor; swatch: string }[]>(
    () => ACCENT_ORDER.map(color => ({ color, swatch: 'gray' }))
  )
  const { appearanceMode, setAppearanceMode, accentColor, setAccentColor,
          resolvedAppearance, bgIntensity, setBgIntensity } = useTheme()

  // Read swatch colors after CSS has loaded
  useEffect(() => {
    setAccents(readSwatchColors())
  }, [])
  const { cursorMode, setCursorMode } = useCursor()
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const swatchesRef = useRef<HTMLDivElement>(null)
  const modesRef = useRef<HTMLDivElement>(null)
  const cursorsRef = useRef<HTMLDivElement>(null)
  const cleanupSwatchPill = useRef<(() => void) | null>(null)
  const cleanupModePill = useRef<(() => void) | null>(null)
  const cleanupCursorPill = useRef<(() => void) | null>(null)
  const draggingRef = useRef(false)
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
  const compressT = Math.min(1, Math.max(0, (viewportHeight - MIN_VP) / (FULL_VP - MIN_VP)))
  const swatchSize = Math.round(lerp(18, 24, compressT))
  const swatchGap = Math.round(lerp(6, 14, compressT))
  const dividerMargin = Math.round(lerp(8, 18, compressT))
  const buttonSize = Math.round(lerp(30, 40, compressT))
  const buttonGap = Math.round(lerp(2, 6, compressT))
  const stripHeight = Math.round(lerp(44, 72, compressT))
  const thumbTravel = stripHeight - THUMB_SIZE

  // Max height for the expandable toolbar: viewport - top offset - trigger - bottom padding
  const toolbarMaxHeight = viewportHeight - 64 - 16 - 16

  const handleEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setHovered(true)
  }

  const handleLeave = () => {
    closeTimeout.current = setTimeout(() => setHovered(false), 250)
  }

  // Close panel when tapping outside on touch devices
  useEffect(() => {
    if (!hovered) return
    const handler = (e: TouchEvent) => {
      if (sidebarRef.current?.contains(e.target as Node)) return
      setHovered(false)
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
    if (hovered) {
      if (swatchesRef.current) cleanupSwatchPill.current = setupControlPill(swatchesRef.current)
      if (modesRef.current) cleanupModePill.current = setupControlPill(modesRef.current)
      if (cursorsRef.current) cleanupCursorPill.current = setupControlPill(cursorsRef.current)
    }
  }, [hovered])

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

  const activeSwatch = accents.find(a => a.color === accentColor) ?? accents[0] ?? { color: 'table' as AccentColor, swatch: 'gray' }

  const thumbRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Jiggle the trigger dot when accent is cycled via image click
  useEffect(() => {
    const handler = () => {
      const el = triggerRef.current
      if (!el) return
      el.classList.remove('sidebar-jiggle')
      void el.offsetHeight
      el.classList.add('sidebar-jiggle')
      const cleanup = () => el.classList.remove('sidebar-jiggle')
      el.addEventListener('animationend', cleanup, { once: true })
    }
    document.addEventListener('accent-cycled', handler)
    return () => document.removeEventListener('accent-cycled', handler)
  }, [])

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
      if (triggerRef.current) {
        triggerRef.current.style.opacity = String(lerp(0.45, 1.0, t))
        triggerRef.current.style.boxShadow = t > 0.01
          ? `0 0 ${lerp(0, 14, t).toFixed(1)}px ${swatchToHsla(activeSwatch.swatch, lerp(0, 0.5, t))}`
          : 'none'
      }
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', bg)
    }
  }, [setBgIntensity, accentColor, resolvedAppearance, activeSwatch.swatch])

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
      onMouseEnter={isTouch ? undefined : handleEnter}
      onMouseLeave={isTouch ? undefined : handleLeave}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 56,
        height: '100vh',
        zIndex: 100,
        overflow: hovered ? 'visible' : 'hidden',
        pointerEvents: isTouch && !hovered ? 'none' : 'auto',
        viewTransitionName: 'sidebar',
      }}
    >
      {/* Sidebar backdrop — mount/unmount to avoid compositing cost at rest */}
      <AnimatePresence>
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
      <div
        style={{
          position: 'absolute',
          right: 16,
          display: 'flex',
          alignItems: 'center',
          top: 'var(--sidebar-trigger-top, 64px)',
          flexDirection: 'column' as const,
          filter: 'drop-shadow(0 1px 3px color-mix(in srgb, var(--bg) 90%, transparent))',
        }}
      >
        {/* Fixed trigger — 16×16 dot with 40×40 invisible touch target overlay */}
        <div
          ref={triggerRef}
          role="button"
          tabIndex={0}
          aria-label={hovered ? 'Close theme controls' : 'Open theme controls'}
          aria-expanded={hovered}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setHovered(h => !h)
            }
          }}
          style={{
            position: 'relative',
            width: 16,
            height: 16,
            borderRadius: 5,
            background: activeSwatch.swatch,
            opacity: lerp(0.45, 1.0, bgIntensity),
            boxShadow: bgIntensity > 0.01
              ? `0 0 ${lerp(0, 14, bgIntensity).toFixed(1)}px ${swatchToHsla(activeSwatch.swatch, lerp(0, 0.5, bgIntensity))}`
              : 'none',
            transition: 'background 200ms ease-in-out, opacity 300ms ease-in-out, box-shadow 300ms ease-in-out',
            flexShrink: 0,
          }}
        >
          {/* Enlarged hit area for touch */}
          <div
            onClick={() => setHovered(h => !h)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 40,
              height: 40,
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          />
        </div>

        {/* Expandable toolbar — scrollable when controls exceed viewport */}
        <div
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
            transition={{ duration: 0.22, delay: hovered ? DIVIDER_1 * 0.04 : 0, ease: motionEase }}
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
            {accents.map((item, i) => {
              const isActive = accentColor === item.color
              return (
                <motion.div
                  key={item.color}
                  animate={{ opacity: hovered ? 1 : 0, ...slideProps }}
                  transition={{ duration: 0.22, delay: hovered ? (SWATCH_BASE + i) * 0.04 : 0, ease: motionEase }}
                  style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                >
                  <button
                    data-sidebar-control
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`${item.color} theme`}
                    tabIndex={hovered ? 0 : -1}
                    onClick={() => setAccentColor(item.color)}
                    style={{
                      width: swatchSize, height: swatchSize, borderRadius: 6,
                      background: item.swatch, border: 'none', cursor: 'pointer', padding: 0, userSelect: 'none' as const,
                      outline: isActive ? `1.5px solid color-mix(in srgb, ${item.swatch} 50%, transparent)` : 'none',
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
            transition={{ duration: 0.22, delay: hovered ? DIVIDER_2 * 0.04 : 0, ease: motionEase }}
            style={{
              width: 20, height: 1, background: 'var(--text-dark)',
              margin: `${dividerMargin}px 0`, pointerEvents: 'none',
            }}
          />

          {/* Intensity gradient strip */}
              <motion.div
                animate={{ opacity: hovered ? 1 : 0, ...slideProps }}
                transition={{ duration: 0.22, delay: hovered ? STRIP_IDX * 0.04 : 0, ease: motionEase }}
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
                    width: 24,
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
                      width: 8,
                      height: stripHeight,
                      borderRadius: 4,
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
                transition={{ duration: 0.22, delay: hovered ? DIVIDER_3 * 0.04 : 0, ease: motionEase }}
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
                  transition={{ duration: 0.22, delay: hovered ? (MODE_BASE + i) * 0.04 : 0, ease: motionEase }}
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
                        width: 24, height: 24, borderRadius: 6,
                        outline: isActive ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
                        outlineOffset: 3, transition: 'outline 200ms ease-in-out',
                      }}
                    >
                      <Icon size={18} />
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
                transition={{ duration: 0.22, delay: hovered ? DIVIDER_4 * 0.04 : 0, ease: motionEase }}
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
                      transition={{ duration: 0.22, delay: hovered ? (CURSOR_BASE + i) * 0.04 : 0, ease: motionEase }}
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
                            width: 24, height: 24, borderRadius: 6,
                            outline: isActive ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
                            outlineOffset: 3, transition: 'outline 200ms ease-in-out',
                          }}
                        >
                          {icon === 'cursor' && <Cursor size={18} />}
                          {icon === 'circle' && <Circle size={18} />}
                          {icon === 'figpal' && (
                            <img
                              src="/images/figpal.png"
                              alt=""
                              style={{ height: 22, width: 'auto' }}
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
      </div>
    </div>
  )
}
