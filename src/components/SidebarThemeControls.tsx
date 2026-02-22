import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Sun, Moon } from '@phosphor-icons/react'
import { useTheme, INTENSITY_LEVELS, type AppearanceMode, type AccentColor } from '@/contexts/ThemeContext'

const modes: { mode: AppearanceMode; Icon: typeof Monitor; label: string }[] = [
  { mode: 'system', Icon: Monitor, label: 'System theme' },
  { mode: 'light', Icon: Sun, label: 'Light theme' },
  { mode: 'dark', Icon: Moon, label: 'Dark theme' },
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
      // z-index 10: pill sits ON TOP of controls so backdrop-filter blurs
      // the swatch/icon content below it (matching useGlassHighlight pattern)
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

    const fill = `hsla(${hue}, 10%, 45%, 0.08)`
    const highlight = `radial-gradient(ellipse 150% 120% at 50% 10%, rgba(255,255,255,0.12), rgba(255,255,255,0.048) 50%, rgba(255,255,255,0.012) 85%, transparent 120%)`

    pill.style.background = `${highlight}, ${fill}`
    pill.style.backdropFilter = 'blur(1px) saturate(1.2)'
    pill.style.webkitBackdropFilter = 'blur(1px) saturate(1.2)'
    pill.style.boxShadow = [
      'inset 0 0.5px 0 0 rgba(255,255,255,0.2)',
      'inset 0 -0.5px 0 0 rgba(0,0,0,0.08)',
    ].join(', ')
    pill.style.border = `0.5px solid hsla(${hue}, 20%, 50%, 0.15)`
  }

  // Fixed-size pill centered on the control's center point
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

const STRIP_HEIGHT = 48
const ZONE_HEIGHT = STRIP_HEIGHT / INTENSITY_LEVELS.length

export function SidebarThemeControls() {
  const [hovered, setHovered] = useState(false)
  const { appearanceMode, setAppearanceMode, accentColor, setAccentColor,
          bgIntensity, setBgIntensity, intensityVariant } = useTheme()
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const handleEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setHovered(true)
  }

  const handleLeave = () => {
    closeTimeout.current = setTimeout(() => setHovered(false), 250)
  }

  // Set up / tear down pill when toolbar opens/closes
  const setupPill = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }
    if (hovered && toolbarRef.current) {
      cleanupRef.current = setupControlPill(toolbarRef.current)
    }
  }, [hovered])

  useEffect(() => {
    // Delay lets framer-motion items settle into position before measuring
    const timer = setTimeout(setupPill, 120)
    return () => {
      clearTimeout(timer)
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [setupPill])

  const activeSwatch = accents.find(a => a.color === accentColor)!

  return (
    <div
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
        {/* Fixed trigger — always visible, rounded square */}
        {/* In 'ring' variant: clickable, cycles intensity, ring encodes level */}
        {intensityVariant === 'ring' ? (
          <button
            onClick={() => setBgIntensity((bgIntensity + 1) % INTENSITY_LEVELS.length)}
            aria-label={`Background intensity: ${INTENSITY_LEVELS[bgIntensity].name}. Click to cycle.`}
            style={{
              width: 16,
              height: 16,
              borderRadius: 5,
              background: activeSwatch.swatch,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              flexShrink: 0,
              outline: bgIntensity === 0 ? 'none'
                : `${bgIntensity === 3 ? 1.5 : 1}px solid color-mix(in srgb, ${activeSwatch.swatch} ${15 + bgIntensity * 12}%, transparent)`,
              outlineOffset: bgIntensity === 0 ? 0 : 3,
              boxShadow: bgIntensity === 3
                ? `0 0 6px color-mix(in srgb, ${activeSwatch.swatch} 20%, transparent)`
                : 'none',
              transition: 'background 200ms ease-in-out, outline 200ms ease-in-out, box-shadow 200ms ease-in-out',
            }}
          />
        ) : (
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 5,
              background: activeSwatch.swatch,
              transition: 'background 200ms ease-in-out',
              flexShrink: 0,
            }}
          />
        )}

        {/* Expandable toolbar with glass pill */}
        <div
          ref={toolbarRef}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Divider: trigger ↔ swatches */}
          <motion.div
            animate={{ opacity: hovered ? 0.15 : 0, x: hovered ? 0 : 20 }}
            transition={{
              duration: 0.22,
              delay: hovered ? 0 * 0.04 : 0,
              ease: motionEase,
            }}
            style={{
              width: 20,
              height: 1,
              background: 'var(--text-dark)',
              margin: '18px 0',
              pointerEvents: 'none',
            }}
          />

          {/* Accent swatches */}
          <div
            role="radiogroup"
            aria-label="Accent color"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {accents.map((item, i) => {
              const isActive = accentColor === item.color
              return (
                <motion.div
                  key={item.color}
                  animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 20 }}
                  transition={{
                    duration: 0.22,
                    delay: hovered ? (1 + i) * 0.04 : 0,
                    ease: motionEase,
                  }}
                  style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                >
                  <button
                    data-sidebar-control
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`${item.color} theme`}
                    onClick={() => setAccentColor(item.color)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: item.swatch,
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      outline: isActive ? `1.5px solid color-mix(in srgb, ${item.swatch} 50%, transparent)` : 'none',
                      outlineOffset: 3,
                      transition: 'outline 200ms ease-in-out',
                    }}
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Divider: swatches ↔ modes */}
          <motion.div
            animate={{ opacity: hovered ? 0.15 : 0, x: hovered ? 0 : 20 }}
            transition={{
              duration: 0.22,
              delay: hovered ? (1 + accents.length) * 0.04 : 0,
              ease: motionEase,
            }}
            style={{
              width: 20,
              height: 1,
              background: 'var(--text-dark)',
              margin: '18px 0',
              pointerEvents: 'none',
            }}
          />

          {/* Mode icons */}
          <div
            role="radiogroup"
            aria-label="Appearance mode"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            {modes.map(({ mode, Icon, label }, i) => {
              const isActive = appearanceMode === mode
              return (
                <motion.div
                  key={mode}
                  animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 20 }}
                  transition={{
                    duration: 0.22,
                    delay: hovered ? (2 + accents.length + i) * 0.04 : 0,
                    ease: motionEase,
                  }}
                  style={{ pointerEvents: hovered ? 'auto' : 'none' }}
                >
                  <button
                    data-sidebar-control
                    role="radio"
                    aria-checked={isActive}
                    aria-label={label}
                    onClick={() => setAppearanceMode(mode)}
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      borderRadius: 8,
                      opacity: isActive ? 1 : 0.4,
                      color: 'var(--text-dark)',
                      transition: 'opacity 200ms ease-in-out',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        outline: isActive ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
                        outlineOffset: 3,
                        transition: 'outline 200ms ease-in-out',
                      }}
                    >
                      <Icon size={18} />
                    </span>
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Option 3: Gradient strip for intensity */}
          {intensityVariant === 'gradient' && (
            <>
              {/* Divider: modes ↔ intensity */}
              <motion.div
                animate={{ opacity: hovered ? 0.15 : 0, x: hovered ? 0 : 20 }}
                transition={{
                  duration: 0.22,
                  delay: hovered ? (2 + accents.length + modes.length) * 0.04 : 0,
                  ease: motionEase,
                }}
                style={{
                  width: 20,
                  height: 1,
                  background: 'var(--text-dark)',
                  margin: '18px 0',
                  pointerEvents: 'none',
                }}
              />

              <motion.div
                animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 20 }}
                transition={{
                  duration: 0.22,
                  delay: hovered ? (3 + accents.length + modes.length) * 0.04 : 0,
                  ease: motionEase,
                }}
                style={{ pointerEvents: hovered ? 'auto' : 'none' }}
              >
                <div
                  aria-label={`Background intensity: ${INTENSITY_LEVELS[bgIntensity].name}`}
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={INTENSITY_LEVELS.length - 1}
                  aria-valuenow={bgIntensity}
                  aria-valuetext={INTENSITY_LEVELS[bgIntensity].name}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                      e.preventDefault()
                      setBgIntensity(Math.min(INTENSITY_LEVELS.length - 1, bgIntensity + 1))
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                      e.preventDefault()
                      setBgIntensity(Math.max(0, bgIntensity - 1))
                    }
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const level = Math.min(INTENSITY_LEVELS.length - 1, Math.floor(y / ZONE_HEIGHT))
                    setBgIntensity(level)
                  }}
                  style={{
                    position: 'relative',
                    width: 24,
                    height: STRIP_HEIGHT,
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {/* The visual gradient strip */}
                  <div
                    style={{
                      width: 5,
                      height: STRIP_HEIGHT,
                      borderRadius: 2.5,
                      background: `linear-gradient(to bottom, color-mix(in srgb, var(--swatch) 10%, transparent), color-mix(in srgb, var(--swatch) 55%, transparent))`,
                      transition: 'background 500ms ease-in-out',
                    }}
                  />
                  {/* Active level indicator — small dot on the strip */}
                  <div
                    style={{
                      position: 'absolute',
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--swatch)',
                      border: '1.5px solid color-mix(in srgb, var(--text-dark) 30%, transparent)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      top: bgIntensity * ZONE_HEIGHT + ZONE_HEIGHT / 2 - 3.5,
                      transition: 'top 200ms ease-in-out, background 500ms ease-in-out',
                    }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
