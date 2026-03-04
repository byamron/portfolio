import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Sun, Moon, Cursor, Circle } from '@phosphor-icons/react'
import { useTheme, computeBg, type AppearanceMode, type AccentColor } from '@/contexts/ThemeContext'
import { useCursor, type CursorMode } from '@/contexts/CursorContext'

const modes: { mode: AppearanceMode; Icon: typeof Monitor; label: string }[] = [
  { mode: 'system', Icon: Monitor, label: 'System theme' },
  { mode: 'light', Icon: Sun, label: 'Light theme' },
  { mode: 'dark', Icon: Moon, label: 'Dark theme' },
]

const cursorOptions: { mode: CursorMode; label: string; icon: 'cursor' | 'circle' | 'figpal' }[] = [
  { mode: 'standard', label: 'Standard cursor', icon: 'cursor' },
  { mode: 'invert', label: 'Invert circle cursor', icon: 'circle' },
  { mode: 'figpal', label: 'Figpal trailing cursor', icon: 'figpal' },
]

const accents: { color: AccentColor; swatch: string }[] = [
  { color: 'table', swatch: 'hsl(34, 50%, 60%)' },
  { color: 'portrait', swatch: 'hsl(47, 34%, 64%)' },
  { color: 'sky', swatch: 'hsl(204, 50%, 70%)' },
  { color: 'pizza', swatch: 'hsl(15, 53%, 64%)' },
]

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
    pill.style.webkitBackdropFilter = 'blur(1px)'
    pill.style.boxShadow = isDark
      ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.10)'
      : 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.06)'
    pill.style.border = isDark
      ? '0.5px solid rgba(255, 255, 255, 0.12)'
      : '0.5px solid rgba(0, 0, 0, 0.08)'
  }

  function getControlPosition(el: HTMLElement) {
    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const centerX = elRect.left + elRect.width / 2 - containerRect.left
    const centerY = elRect.top + elRect.height / 2 - containerRect.top
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

  function handleMouseOver(e: MouseEvent): void {
    const control = (e.target as HTMLElement).closest<HTMLElement>('[data-sidebar-control]')
    if (!control) return
    if (control === currentControl) return

    const prevControl = currentControl
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

  function handleMouseLeave(e: MouseEvent): void {
    if (container.contains(e.relatedTarget as Node)) return
    currentControl = null
    fadeOut()
    stopLoop()
  }

  const observer = new MutationObserver(() => skinPill())
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-accent', 'data-theme'],
  })

  pill = createPill()
  skinPill()

  container.addEventListener('mouseover', handleMouseOver)
  container.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    stopLoop()
    container.removeEventListener('mouseover', handleMouseOver)
    container.removeEventListener('mouseleave', handleMouseLeave)
    observer.disconnect()
    pill?.remove()
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const STRIP_HEIGHT = 72
const THUMB_SIZE = 11
const THUMB_TRAVEL = STRIP_HEIGHT - THUMB_SIZE // usable range for thumb center-to-edge

// Stagger delay indices (fixed layout: swatches → intensity → modes → cursors)
// [0] divider  [1-4] swatches  [5] divider  [6] strip  [7] divider  [8-10] modes  [11] divider  [12-14] cursors
const DIVIDER_1 = 0
const SWATCH_BASE = 1
const DIVIDER_2 = SWATCH_BASE + accents.length        // 5
const STRIP_IDX = DIVIDER_2 + 1                       // 6
const DIVIDER_3 = STRIP_IDX + 1                       // 7
const MODE_BASE = DIVIDER_3 + 1                       // 8
const DIVIDER_4 = MODE_BASE + modes.length             // 11
const CURSOR_BASE = DIVIDER_4 + 1                      // 12

export function SidebarThemeControls() {
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
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

  const handleEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setHovered(true)
  }

  const handleLeave = () => {
    closeTimeout.current = setTimeout(() => setHovered(false), 250)
  }

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

  const activeSwatch = accents.find(a => a.color === accentColor)!

  const thumbRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Gradient strip pointer handlers (continuous drag support)
  const updateFromPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = Math.max(0, Math.min(STRIP_HEIGHT, e.clientY - rect.top))
    const t = y / STRIP_HEIGHT
    setBgIntensity(t)
    // Direct DOM updates for zero-lag visual feedback during drag
    if (draggingRef.current) {
      const bg = computeBg(accentColor, resolvedAppearance, t)
      if (thumbRef.current) thumbRef.current.style.top = `${t * THUMB_TRAVEL}px`
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
    // Restore body bg transition
    document.body.style.transition = ''
  }, [])

  return (
    <div
      data-sidebar
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 56,
        height: '100vh',
        zIndex: 100,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 64,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Fixed trigger — always visible, glow + opacity reflect intensity */}
        <div
          ref={triggerRef}
          style={{
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
        />

        {/* Expandable toolbar */}
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Divider: trigger ↔ swatches */}
          <motion.div
            animate={{ opacity: hovered ? 0.15 : 0, x: hovered ? 0 : 20 }}
            transition={{ duration: 0.22, delay: hovered ? DIVIDER_1 * 0.04 : 0, ease: motionEase }}
            style={{
              width: 20, height: 1, background: 'var(--text-dark)',
              margin: '18px 0', pointerEvents: 'none',
            }}
          />

          {/* Accent swatches — own pill container */}
          <div
            ref={swatchesRef}
            role="radiogroup"
            aria-label="Accent color"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
          >
            {accents.map((item, i) => {
              const isActive = accentColor === item.color
              return (
                <motion.div
                  key={item.color}
                  animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 20 }}
                  transition={{ duration: 0.22, delay: hovered ? (SWATCH_BASE + i) * 0.04 : 0, ease: motionEase }}
                  style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                >
                  <button
                    data-sidebar-control
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`${item.color} theme`}
                    onClick={() => setAccentColor(item.color)}
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: item.swatch, border: 'none', cursor: 'pointer', padding: 0,
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
            animate={{ opacity: hovered ? 0.15 : 0, x: hovered ? 0 : 20 }}
            transition={{ duration: 0.22, delay: hovered ? DIVIDER_2 * 0.04 : 0, ease: motionEase }}
            style={{
              width: 20, height: 1, background: 'var(--text-dark)',
              margin: '18px 0', pointerEvents: 'none',
            }}
          />

          {/* Intensity gradient strip */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 20 }}
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
              tabIndex={0}
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
                height: STRIP_HEIGHT,
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
                  height: STRIP_HEIGHT,
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
                  top: bgIntensity * THUMB_TRAVEL,
                  transition: isDragging ? 'none' : 'top 200ms ease-in-out, background 500ms ease-in-out',
                }}
              />
            </div>
          </motion.div>

          {/* Divider: intensity ↔ modes */}
          <motion.div
            animate={{ opacity: hovered ? 0.15 : 0, x: hovered ? 0 : 20 }}
            transition={{ duration: 0.22, delay: hovered ? DIVIDER_3 * 0.04 : 0, ease: motionEase }}
            style={{
              width: 20, height: 1, background: 'var(--text-dark)',
              margin: '18px 0', pointerEvents: 'none',
            }}
          />

          {/* Mode icons — own pill container */}
          <div
            ref={modesRef}
            role="radiogroup"
            aria-label="Appearance mode"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            {modes.map(({ mode, Icon, label }, i) => {
              const isActive = appearanceMode === mode
              return (
                <motion.div
                  key={mode}
                  animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 20 }}
                  transition={{ duration: 0.22, delay: hovered ? (MODE_BASE + i) * 0.04 : 0, ease: motionEase }}
                  style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                >
                  <button
                    data-sidebar-control
                    role="radio"
                    aria-checked={isActive}
                    aria-label={label}
                    onClick={() => setAppearanceMode(mode)}
                    style={{
                      width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 8,
                      opacity: isActive ? 1 : 0.4, color: 'var(--text-dark)',
                      transition: 'opacity 200ms ease-in-out',
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

          {/* Divider: modes ↔ cursors */}
          <motion.div
            animate={{ opacity: hovered ? 0.15 : 0, x: hovered ? 0 : 20 }}
            transition={{ duration: 0.22, delay: hovered ? DIVIDER_4 * 0.04 : 0, ease: motionEase }}
            style={{
              width: 20, height: 1, background: 'var(--text-dark)',
              margin: '18px 0', pointerEvents: 'none',
            }}
          />

          {/* Cursor style icons — own pill container */}
          <div
            ref={cursorsRef}
            role="radiogroup"
            aria-label="Cursor style"
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            {cursorOptions.map(({ mode, label, icon }, i) => {
              const isActive = cursorMode === mode
              return (
                <motion.div
                  key={mode}
                  animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 20 }}
                  transition={{ duration: 0.22, delay: hovered ? (CURSOR_BASE + i) * 0.04 : 0, ease: motionEase }}
                  style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                >
                  <button
                    data-sidebar-control
                    role="radio"
                    aria-checked={isActive}
                    aria-label={label}
                    onClick={() => setCursorMode(mode)}
                    style={{
                      width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', background: 'none', cursor: 'pointer', padding: 0, borderRadius: 8,
                      opacity: isActive ? 1 : 0.4, color: 'var(--text-dark)',
                      transition: 'opacity 200ms ease-in-out',
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
                          style={{ width: 18, height: 18, objectFit: 'contain' }}
                        />
                      )}
                    </span>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
