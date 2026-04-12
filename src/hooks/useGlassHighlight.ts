import { useCallback, useEffect, useRef, type RefObject } from 'react'

/**
 * Glass Highlight — spring-physics driven glass pill hover effect.
 *
 * Damped spring solver (k/c configurable) with 4ms sub-stepping for
 * frame-drop stability. Every positional property uses springs instead of
 * lerp — gives overshoot, settle, and that alive, weighted quality.
 *
 * Visual effects:
 *   - Cursor-as-light-source: radial gradient epicentered on cursor position
 *   - Cursor-reactive edge highlight: box-shadow shifts for surface curvature
 *   - Glass pressure: fill opacity modulates with spring velocity
 *   - Entrance spring (configurable start scale → 1.0) on every hover session
 *   - Exit scale-down (0.96) with ease-in
 *   - Velocity-based stretch/squash (continuous, driven by spring velocity)
 *   - Pill lean + tilt toward cursor with dead zone
 *   - Card text lean with edge-fade
 */

// ═══════════════════════════════════════════════════════════════
// Config
// ═══════════════════════════════════════════════════════════════

export interface GlassConfig {
  springStiffness: number
  springDamping: number
  pillMaxLean: number
  pillMaxTilt: number
  cardMaxLean: number
  stretchAmount: number
  entranceScale: number
  glassPressure: number
  highlightIntensity: number
  cursorLight: number
  pullStrength: number
  edgeZone: number
  surfaceBlur: number
  borderRadius: number
  fadeDuration: number
  squashAmount: number
  pillDeadZone: number
  cardLeanRamp: number
  clearDelay: number
  cardSelector: string
  // Light mode cursor light tuning
  lightCursorIntensity: number
  lightCursorSaturation: number
  lightCursorLightness: number
  lightEdgeIntensity: number
}

export const GLASS_DEFAULTS: GlassConfig = {
  springStiffness: 340,
  springDamping: 27,
  pillMaxLean: 1.0,
  pillMaxTilt: 1.0,
  cardMaxLean: 0.4,
  stretchAmount: 0.04,
  entranceScale: 0.70,
  glassPressure: 0.04,
  highlightIntensity: 0.12,
  cursorLight: 0.04,
  pullStrength: 0.20,
  edgeZone: 0.12,
  surfaceBlur: 1,
  borderRadius: 16,
  fadeDuration: 200,
  squashAmount: 0.004,
  pillDeadZone: 0.4,
  cardLeanRamp: 0.10,
  clearDelay: 150,
  cardSelector: '[data-link-card]',
  lightCursorIntensity: 1.8,
  lightCursorSaturation: 45,
  lightCursorLightness: 50,
  lightEdgeIntensity: 0.8,
}

// ═══════════════════════════════════════════════════════════════
// Spring solver
// ═══════════════════════════════════════════════════════════════

interface SpringState {
  value: number
  velocity: number
  target: number
}

function createSpring(initial: number): SpringState {
  return { value: initial, velocity: 0, target: initial }
}

function stepSpring(s: SpringState, dt: number, k: number, c: number): boolean {
  const displacement = s.value - s.target
  const springForce = -k * displacement
  const dampingForce = -c * s.velocity
  const acceleration = springForce + dampingForce // mass = 1

  s.velocity += acceleration * dt
  s.value += s.velocity * dt

  return Math.abs(displacement) > 0.1 || Math.abs(s.velocity) > 0.1
}

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════

export function useGlassHighlight(
  containerRef: RefObject<HTMLElement | null>,
  config?: Partial<GlassConfig>,
): { fadeOut: (duration?: number, delay?: number) => void } {
  const configRef = useRef<GlassConfig>({ ...GLASS_DEFAULTS, ...config })
  configRef.current = { ...GLASS_DEFAULTS, ...config }

  const fadeOutRef = useRef<(duration?: number, delay?: number) => void>(() => {})

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const { cleanup, fadeOut } = setupGlassHighlight(container, configRef)
    fadeOutRef.current = fadeOut
    return () => {
      fadeOutRef.current = () => {}
      cleanup()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stableFadeOut = useCallback((duration?: number, delay?: number) => {
    fadeOutRef.current(duration, delay)
  }, [])

  return { fadeOut: stableFadeOut }
}

// ═══════════════════════════════════════════════════════════════
// Imperative glass highlight system
// ═══════════════════════════════════════════════════════════════

function setupGlassHighlight(
  container: HTMLElement,
  configRef: React.MutableRefObject<GlassConfig>,
): { cleanup: () => void; fadeOut: (duration?: number, delay?: number) => void } {
  let pill: HTMLDivElement | null = null
  let currentCard: HTMLElement | null = null
  let rafId: number | null = null
  let clearTimer: ReturnType<typeof setTimeout> | null = null
  let resizeTimer: ReturnType<typeof setTimeout> | null = null

  const springs = {
    x: createSpring(0),
    y: createSpring(0),
    w: createSpring(0),
    h: createSpring(0),
  }

  const state = {
    baseX: 0, baseY: 0, baseW: 0, baseH: 0,
    mouseX: 0, mouseY: 0,
    lastTime: 0,
  }

  let cachedContainerRect: DOMRect | null = null
  let lastPillW = -1
  let lastPillH = -1
  let scrollDirty = false

  // Card text lean
  let leanedCard: HTMLElement | null = null
  let leanIntensity = 0
  let mouseActive = false

  // Entrance spring
  let entranceScale = 1
  let entranceVel = 0
  let entranceTarget = 1
  const ENTRANCE_K = 350
  const ENTRANCE_C = 22

  // Glass pressure
  let glassPressure = 0

  // Pending fade-in RAFs (tracked so they can be cancelled on early leave)
  let fadeInRaf1: number | null = null
  let fadeInRaf2: number | null = null

  // Reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function handleMotionChange(): void {
    // Runtime decisions check prefersReducedMotion.matches directly
  }
  prefersReducedMotion.addEventListener('change', handleMotionChange)

  // -- Cached theme state (updated on theme-changed, avoids per-frame DOM reads) --

  let cachedHue = (() => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim()
    return parseFloat(raw) || 34
  })()
  let cachedDark = document.documentElement.getAttribute('data-theme') === 'dark'

  function refreshThemeCache(): void {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim()
    cachedHue = parseFloat(raw) || 34
    cachedDark = document.documentElement.getAttribute('data-theme') === 'dark'
  }

  function setBackdropFilter(el: HTMLElement, value: string): void {
    el.style.backdropFilter = value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(el.style as any).webkitBackdropFilter = value
  }

  // -- Card text lean --

  function engageCardLean(card: HTMLElement): void {
    if (!card.hasAttribute('data-project-id')) return
    leanIntensity = 0
    card.style.transition = 'none'
    leanedCard = card
  }

  function releaseCardLean(): void {
    if (!leanedCard) return
    leanedCard.style.transition = 'transform 300ms cubic-bezier(0.5, 0, 0.15, 1)'
    leanedCard.style.transform = ''
    leanedCard = null
  }

  // -- Pill creation --

  function createPill(): HTMLDivElement {
    const div = document.createElement('div')
    div.setAttribute('aria-hidden', 'true')
    div.setAttribute('data-glass-highlight', 'true')

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

  function skinPillBase(): void {
    if (!pill) return
    refreshThemeCache()
    const cfg = configRef.current
    const hue = cachedHue
    const dark = cachedDark

    pill.style.borderRadius = `${cfg.borderRadius}px`

    // Base fill — glass pressure modulates this in the loop
    const fill = dark
      ? `hsla(${hue}, 20%, 55%, 0.12)`
      : `hsla(${hue}, 20%, 40%, 0.08)`
    pill.style.background = fill
    setBackdropFilter(pill, `blur(${cfg.surfaceBlur}px)`)

    pill.style.boxShadow = dark
      ? 'inset 0 1px 0 0 rgba(255, 255, 255, 0.10)'
      : 'inset 0 -1px 0 0 rgba(0, 0, 0, 0.06)'
    pill.style.border = dark
      ? '0.5px solid rgba(255, 255, 255, 0.12)'
      : '0.5px solid rgba(0, 0, 0, 0.08)'
  }

  // -- Positioning --

  function getCardPosition(card: HTMLElement) {
    const cardRect = card.getBoundingClientRect()
    if (!cachedContainerRect) cachedContainerRect = container.getBoundingClientRect()
    return {
      x: cardRect.left - cachedContainerRect.left + container.scrollLeft,
      y: cardRect.top - cachedContainerRect.top + container.scrollTop,
      w: cardRect.width,
      h: cardRect.height,
    }
  }

  // -- Fade --

  function cancelPendingFadeIn(): void {
    if (fadeInRaf1 !== null) { cancelAnimationFrame(fadeInRaf1); fadeInRaf1 = null }
    if (fadeInRaf2 !== null) { cancelAnimationFrame(fadeInRaf2); fadeInRaf2 = null }
  }

  function fadeIn(): void {
    if (!pill || !currentCard) return // guard against ghost pill from stale double-RAF
    const d = prefersReducedMotion.matches ? 0 : configRef.current.fadeDuration
    pill.style.transition = `opacity ${d}ms ease`
    pill.style.opacity = '1'
  }

  function scheduleFadeIn(): void {
    cancelPendingFadeIn()
    fadeInRaf1 = requestAnimationFrame(() => {
      fadeInRaf1 = null
      fadeInRaf2 = requestAnimationFrame(() => {
        fadeInRaf2 = null
        fadeIn()
      })
    })
  }

  function fadeOut(): void {
    if (!pill) return
    cancelPendingFadeIn()
    const d = prefersReducedMotion.matches ? 0 : configRef.current.fadeDuration
    if (prefersReducedMotion.matches) {
      pill.style.transition = 'opacity 0ms'
      pill.style.opacity = '0'
    } else {
      // Exit: slight scale-down + fade
      pill.style.transition = `opacity ${d}ms ease, transform ${d}ms cubic-bezier(0.4, 0, 1, 1)`
      pill.style.transform = `translate(${springs.x.value}px, ${springs.y.value}px) scale(0.96)`
      pill.style.opacity = '0'
    }
  }

  // -- Velocity stretch (continuous, driven by spring velocity) --

  function getVelocityStretch(): { sx: number; sy: number } {
    if (prefersReducedMotion.matches) return { sx: 1, sy: 1 }
    const cfg = configRef.current
    const vx = springs.x.velocity
    const vy = springs.y.velocity
    const speed = Math.sqrt(vx * vx + vy * vy)
    if (speed < 5) return { sx: 1, sy: 1 }

    const f = Math.min(speed / 400, 1)
    const hr = speed > 0 ? Math.abs(vx) / speed : 0
    const vr = speed > 0 ? Math.abs(vy) / speed : 0

    const sx = (1 + cfg.stretchAmount * f * hr) * (1 - cfg.squashAmount * f * vr)
    const sy = (1 + cfg.stretchAmount * f * vr) * (1 - cfg.squashAmount * f * hr)
    return { sx, sy }
  }

  // -- Edge pull --

  function computePullTargets(): void {
    if (!currentCard) return
    if (prefersReducedMotion.matches) {
      springs.x.target = state.baseX
      springs.y.target = state.baseY
      springs.w.target = state.baseW
      springs.h.target = state.baseH
      return
    }

    let newX = state.baseX
    let newY = state.baseY
    let newW = state.baseW
    let newH = state.baseH

    if (!cachedContainerRect) cachedContainerRect = container.getBoundingClientRect()
    const cardTop = cachedContainerRect.top + state.baseY - container.scrollTop
    const cardHeight = state.baseH
    const relY = cardHeight > 0 ? (state.mouseY - cardTop) / cardHeight : 0.5
    const cfg = configRef.current
    const ez = cfg.edgeZone
    let pullAmount = 0

    if (relY < ez) {
      pullAmount = -Math.pow(Math.max(0, Math.min(1, 1 - relY / ez)), 1.5)
    } else if (relY > 1 - ez) {
      pullAmount = Math.pow(Math.max(0, Math.min(1, (relY - (1 - ez)) / ez)), 1.5)
    }

    if (pullAmount !== 0) {
      const ps = cfg.pullStrength
      const dim = state.baseH
      const maxStretch = dim * 0.25 * ps
      const maxMove = dim * 0.15 * ps
      const stretchPx = Math.abs(pullAmount) * maxStretch
      const movePx = pullAmount * maxMove

      newH = state.baseH + stretchPx
      newW = state.baseW * (state.baseH / newH)
      newX = state.baseX + (state.baseW - newW) / 2
      newY = state.baseY + movePx
      if (pullAmount < 0) newY -= stretchPx
    }

    springs.x.target = newX
    springs.y.target = newY
    springs.w.target = newW
    springs.h.target = newH
  }

  // -- RAF loop --

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

  let scrollListenersActive = false

  function addScrollListeners(): void {
    if (scrollListenersActive) return
    scrollListenersActive = true
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
  }

  function removeScrollListeners(): void {
    if (!scrollListenersActive) return
    scrollListenersActive = false
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
  }

  function loop(now: number): void {
    rafId = null
    if (!currentCard || !pill) return

    // Handle deferred scroll — update targets only so the spring animates smoothly.
    // Only snap values on large jumps (e.g., programmatic scroll) to avoid teleporting.
    if (scrollDirty) {
      scrollDirty = false
      cachedContainerRect = null
      const pos = getCardPosition(currentCard)
      const jumpX = Math.abs(pos.x - state.baseX)
      const jumpY = Math.abs(pos.y - state.baseY)
      state.baseX = pos.x; state.baseY = pos.y
      state.baseW = pos.w; state.baseH = pos.h
      if (jumpX > pos.h || jumpY > pos.h) {
        // Large discontinuity — snap to avoid long spring chase
        springs.x.value = springs.x.target = pos.x
        springs.y.value = springs.y.target = pos.y
        springs.w.value = springs.w.target = pos.w
        springs.h.value = springs.h.target = pos.h
        springs.x.velocity = springs.y.velocity = springs.w.velocity = springs.h.velocity = 0
      }
      // Always update targets — spring will converge naturally for small scrolls
      springs.x.target = pos.x
      springs.y.target = pos.y
      springs.w.target = pos.w
      springs.h.target = pos.h
    }

    const cfg = configRef.current
    const k = prefersReducedMotion.matches ? 2000 : cfg.springStiffness
    const c = prefersReducedMotion.matches ? 100 : cfg.springDamping

    const dt = state.lastTime ? Math.min((now - state.lastTime) / 1000, 0.032) : 0.016
    state.lastTime = now

    computePullTargets()

    // Sub-step all springs (including entrance) for numerical stability
    const SUB_STEP = 0.004
    let remaining = dt
    let activeX = false, activeY = false, activeW = false, activeH = false
    let entranceActive = false
    while (remaining > 0) {
      const step = Math.min(remaining, SUB_STEP)
      activeX = stepSpring(springs.x, step, k, c) || activeX
      activeY = stepSpring(springs.y, step, k, c) || activeY
      activeW = stepSpring(springs.w, step, k, c) || activeW
      activeH = stepSpring(springs.h, step, k, c) || activeH
      // Entrance spring — same sub-stepping to prevent overshoot on frame drops
      if (!prefersReducedMotion.matches) {
        const eForce = -ENTRANCE_K * (entranceScale - entranceTarget) - ENTRANCE_C * entranceVel
        entranceVel += eForce * step
        entranceScale += entranceVel * step
        if (Math.abs(entranceScale - entranceTarget) > 0.001 || Math.abs(entranceVel) > 0.01) {
          entranceActive = true
        }
      }
      remaining -= step
    }
    if (prefersReducedMotion.matches) {
      entranceScale = entranceTarget
      entranceVel = 0
    }

    // Glass pressure
    const springSpeed = Math.sqrt(springs.x.velocity ** 2 + springs.y.velocity ** 2)
    const targetPressure = prefersReducedMotion.matches ? 0 : Math.min(springSpeed / 300, 1) * cfg.glassPressure
    glassPressure += (targetPressure - glassPressure) * 0.1
    const pressureActive = glassPressure > 0.001

    const settled = !activeX && !activeY && !activeW && !activeH && !entranceActive && !pressureActive

    if (settled) {
      springs.x.value = springs.x.target
      springs.y.value = springs.y.target
      springs.w.value = springs.w.target
      springs.h.value = springs.h.target
    }

    const { sx, sy } = getVelocityStretch()
    const w = springs.w.value
    const h = springs.h.value
    const hue = cachedHue
    const dark = cachedDark

    // ── Pill lean + tilt ──
    let leanX = 0, leanY = 0
    let rotateDeg = 0
    let nx = 0, ny = 0

    if (!prefersReducedMotion.matches) {
      if (!cachedContainerRect) cachedContainerRect = container.getBoundingClientRect()
      const pillVpX = cachedContainerRect.left + springs.x.value - container.scrollLeft
      const pillVpY = cachedContainerRect.top + springs.y.value - container.scrollTop
      const relX = state.mouseX - pillVpX - w / 2
      const relY = state.mouseY - pillVpY - h / 2
      nx = w > 0 ? relX / (w / 2) : 0
      ny = h > 0 ? relY / (h / 2) : 0
      const d = Math.sqrt(nx * nx + ny * ny)

      const deadZone = cfg.pillDeadZone
      const rawD = Math.max(0, d - deadZone) / (1 - deadZone)
      const t = 1 - Math.exp(-rawD * 2.0)

      const dirX = d > 0.001 ? nx / d : 0
      const dirY = d > 0.001 ? ny / d : 0
      leanX = dirX * t * cfg.pillMaxLean
      leanY = dirY * t * cfg.pillMaxLean

      const cnx = Math.max(-1, Math.min(1, nx))
      const cny = Math.max(-1, Math.min(1, ny))
      rotateDeg = (cnx * dirY * Math.abs(dirY) + cny * dirX * Math.abs(dirX)) * cfg.pillMaxTilt * t
    }

    // ── Cursor-as-light-source + ambient edge highlight ──
    const d = Math.sqrt(nx * nx + ny * ny)
    const clampNx = Math.max(-1, Math.min(1, nx))
    const clampNy = Math.max(-1, Math.min(1, ny))
    const hlPctX = ((clampNx + 1) / 2 * 100).toFixed(1)
    const hlPctY = ((clampNy + 1) / 2 * 100).toFixed(1)
    const clIntensity = cfg.cursorLight * (1 + (1 - Math.min(d * 0.6, 1)) * 0.5)

    // Edge highlight: shifts with cursor for surface curvature
    const ambientHL = cfg.highlightIntensity
    const shadowX = clampNx * 0.8
    const shadowY = 0.5 + clampNy * 0.5
    const edgeIntensity = ambientHL + (1 - Math.min(d, 1)) * ambientHL * 0.5

    // Compose: cursor radial gradient + glass fill (with pressure)
    const baseOpacity = dark ? 0.12 : 0.08
    const fillOpacity = (baseOpacity + glassPressure).toFixed(3)

    // Cursor light uses a fixed-radius circle so it looks properly radial
    // regardless of card aspect ratio (cards are wide + short)
    const lightRadius = Math.max(h * 1.2, 60)

    // Cursor-as-light-source: accent-tinted radial in both modes.
    // Dark mode: high lightness, low saturation — reads as a light source with a hint of color.
    // Light mode: configurable — lightness, saturation, and intensity multiplier are tunable
    // to get the accent color visible against the light background.
    const lightL = dark ? 90 : cfg.lightCursorLightness
    const lightS = dark ? 15 : cfg.lightCursorSaturation
    const lightAlpha = dark ? clIntensity : clIntensity * cfg.lightCursorIntensity
    const lightFade = dark ? clIntensity * 0.1 : clIntensity * cfg.lightCursorIntensity * 0.1

    pill.style.background = `radial-gradient(circle ${lightRadius.toFixed(0)}px at ${hlPctX}% ${hlPctY}%, hsla(${hue}, ${lightS}%, ${lightL}%, ${lightAlpha.toFixed(3)}), hsla(${hue}, ${lightS}%, ${lightL}%, ${lightFade.toFixed(3)}) 55%, transparent 100%), hsla(${hue}, 20%, ${dark ? '55%' : '40%'}, ${fillOpacity})`

    if (dark) {
      pill.style.boxShadow = `inset ${shadowX.toFixed(2)}px ${shadowY.toFixed(2)}px 0 0 rgba(255,255,255,${edgeIntensity.toFixed(3)}), inset 0 -0.5px 0 0 rgba(0,0,0,0.06)`
    } else {
      pill.style.boxShadow = `inset ${shadowX.toFixed(2)}px ${shadowY.toFixed(2)}px 0 0 hsla(${hue}, ${lightS}%, ${lightL}%, ${(edgeIntensity * cfg.lightEdgeIntensity).toFixed(3)}), inset 0 -0.5px 0 0 rgba(0,0,0,0.04)`
    }

    // ── Card text lean ──
    if (leanedCard && mouseActive && !prefersReducedMotion.matches) {
      leanIntensity += (1 - leanIntensity) * cfg.cardLeanRamp
      if (leanIntensity > 0.99) leanIntensity = 1
      const cardDist = Math.sqrt(nx * nx + ny * ny)
      const cardT = Math.min(cardDist, 1)
      const cdx = cardDist > 0.001 ? nx / cardDist : 0
      const cdy = cardDist > 0.001 ? ny / cardDist : 0
      const edgeProximity = Math.max(Math.abs(nx), Math.abs(ny))
      const edgeFade = edgeProximity < 0.75 ? 1 : Math.max(0, 1 - (edgeProximity - 0.75) / 0.25)
      const clx = cdx * cardT * cfg.cardMaxLean * leanIntensity * edgeFade
      const cly = cdy * cardT * cfg.cardMaxLean * leanIntensity * edgeFade
      leanedCard.style.transform = `translate(${clx.toFixed(2)}px, ${cly.toFixed(2)}px)`
    }

    // ── Apply transform ──
    const tx = springs.x.value - (w * (sx - 1)) / 2 + leanX
    const ty = springs.y.value - (h * (sy - 1)) / 2 + leanY
    const es = Math.max(0.01, entranceScale)
    pill.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotateDeg}deg) scale(${sx * es}, ${sy * es})`

    const roundedW = Math.round(w)
    const roundedH = Math.round(h)
    if (roundedW !== lastPillW) { pill.style.width = `${roundedW}px`; lastPillW = roundedW }
    if (roundedH !== lastPillH) { pill.style.height = `${roundedH}px`; lastPillH = roundedH }

    const leanRamping = leanedCard && mouseActive && leanIntensity < 1

    if (!settled || leanRamping) {
      rafId = requestAnimationFrame(loop)
    }
  }

  // -- Event handlers --

  function handleMouseOver(e: MouseEvent): void {
    const cfg = configRef.current
    const card = (e.target as HTMLElement).closest<HTMLElement>(cfg.cardSelector)
    if (card && card.closest('[data-glass-highlight-active]') !== container) return

    if (!card) {
      // Glass-break zones force immediate clear
      const breakEl = (e.target as HTMLElement).closest('[data-glass-break]')
      if (breakEl && container.contains(breakEl)) {
        if (clearTimer) { clearTimeout(clearTimer); clearTimer = null }
        releaseCardLean()
        currentCard = null
        fadeOut()
        stopLoop()
        removeScrollListeners()
        return
      }

      // Cursor moved to a non-card area — start clear timer
      if (currentCard && !clearTimer) {
        clearTimer = setTimeout(() => {
          clearTimer = null
          releaseCardLean()
          currentCard = null
          fadeOut()
          stopLoop()
          removeScrollListeners()
        }, cfg.clearDelay)
      }
      return
    }

    if (clearTimer) { clearTimeout(clearTimer); clearTimer = null }
    if (card === currentCard) return

    const prevCard = currentCard
    currentCard = card
    mouseActive = true
    releaseCardLean()
    engageCardLean(card)

    const cardRadius = card.getAttribute('data-border-radius')
    const br = cardRadius ? parseFloat(cardRadius) : cfg.borderRadius
    if (pill) pill.style.borderRadius = `${br}px`

    cachedContainerRect = null
    const pos = getCardPosition(card)

    if (!prevCard) {
      state.baseX = pos.x; state.baseY = pos.y
      state.baseW = pos.w; state.baseH = pos.h

      springs.x.value = springs.x.target = pos.x
      springs.y.value = springs.y.target = pos.y
      springs.w.value = springs.w.target = pos.w
      springs.h.value = springs.h.target = pos.h
      springs.x.velocity = springs.y.velocity = springs.w.velocity = springs.h.velocity = 0

      // Entrance spring
      if (!prefersReducedMotion.matches) {
        entranceScale = cfg.entranceScale
        entranceVel = 0
        entranceTarget = 1
      } else {
        entranceScale = 1
      }
      glassPressure = 0

      pill!.style.transition = 'none'
      const initScale = prefersReducedMotion.matches ? 1 : cfg.entranceScale
      pill!.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${initScale})`
      pill!.style.width = `${pos.w}px`
      pill!.style.height = `${pos.h}px`
      lastPillW = Math.round(pos.w)
      lastPillH = Math.round(pos.h)

      scheduleFadeIn()
    } else {
      state.baseX = pos.x; state.baseY = pos.y
      state.baseW = pos.w; state.baseH = pos.h

      springs.x.target = pos.x
      springs.y.target = pos.y
      springs.w.target = pos.w
      springs.h.target = pos.h
    }

    state.mouseX = e.clientX
    state.mouseY = e.clientY
    state.lastTime = 0
    addScrollListeners()
    startLoop()
  }

  function handleMouseLeave(e: MouseEvent): void {
    if (container.contains(e.relatedTarget as Node)) return
    if (clearTimer) { clearTimeout(clearTimer); clearTimer = null }
    releaseCardLean()
    currentCard = null
    fadeOut()
    stopLoop()
    removeScrollListeners()
  }

  function handleMouseMove(e: MouseEvent): void {
    state.mouseX = e.clientX
    state.mouseY = e.clientY
    if (!mouseActive) {
      mouseActive = true
      if (currentCard && !leanedCard) engageCardLean(currentCard)
    }
    if (currentCard && rafId === null) {
      startLoop()
    }
  }

  // Focus support
  function handleFocusIn(e: FocusEvent): void {
    const cfg = configRef.current
    const card = (e.target as HTMLElement).closest<HTMLElement>(cfg.cardSelector)
    if (!card || card.closest('[data-glass-highlight-active]') !== container) return

    const prevCard = currentCard
    currentCard = card
    mouseActive = false
    releaseCardLean()

    const cardRadius = card.getAttribute('data-border-radius')
    const br = cardRadius ? parseFloat(cardRadius) : cfg.borderRadius
    if (pill) pill.style.borderRadius = `${br}px`

    cachedContainerRect = null
    const pos = getCardPosition(card)

    if (!prevCard) {
      state.baseX = pos.x; state.baseY = pos.y
      state.baseW = pos.w; state.baseH = pos.h

      springs.x.value = springs.x.target = pos.x
      springs.y.value = springs.y.target = pos.y
      springs.w.value = springs.w.target = pos.w
      springs.h.value = springs.h.target = pos.h
      springs.x.velocity = springs.y.velocity = springs.w.velocity = springs.h.velocity = 0

      entranceScale = 1 // no entrance spring on keyboard
      glassPressure = 0

      pill!.style.transition = 'none'
      pill!.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      pill!.style.width = `${pos.w}px`
      pill!.style.height = `${pos.h}px`
      lastPillW = Math.round(pos.w)
      lastPillH = Math.round(pos.h)

      scheduleFadeIn()
    } else {
      state.baseX = pos.x; state.baseY = pos.y
      state.baseW = pos.w; state.baseH = pos.h

      springs.x.target = pos.x
      springs.y.target = pos.y
      springs.w.target = pos.w
      springs.h.target = pos.h
      state.lastTime = 0
      startLoop()
    }
  }

  function handleFocusOut(e: FocusEvent): void {
    const related = e.relatedTarget as HTMLElement | null
    // Only keep pill alive if focus moved to a card within THIS container
    const relatedCard = related?.closest?.(configRef.current.cardSelector) as HTMLElement | null
    if (relatedCard && container.contains(relatedCard)) return
    releaseCardLean()
    currentCard = null
    fadeOut()
    stopLoop()
    removeScrollListeners()
  }

  function handleScroll(): void {
    if (!currentCard || !pill) return
    cachedContainerRect = null
    scrollDirty = true
    startLoop()
  }

  function handleResize(): void {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      cachedContainerRect = null
      if (currentCard) {
        scrollDirty = true
        startLoop()
      }
    }, 100)
  }

  // -- Init --

  pill = createPill()
  skinPillBase()
  const initD = prefersReducedMotion.matches ? 0 : configRef.current.fadeDuration
  pill.style.transition = `opacity ${initD}ms ease`
  container.setAttribute('data-glass-highlight-active', 'true')

  container.addEventListener('mouseover', handleMouseOver)
  container.addEventListener('mouseleave', handleMouseLeave)
  container.addEventListener('mousemove', handleMouseMove, { passive: true })
  container.addEventListener('focusin', handleFocusIn, true)
  container.addEventListener('focusout', handleFocusOut, true)
  document.addEventListener('theme-changed', skinPillBase)

  // -- Navigation fade-out --

  function navigationFadeOut(duration = configRef.current.fadeDuration, delay = 0): void {
    if (!pill) return
    cancelPendingFadeIn()
    releaseCardLean()
    currentCard = null
    if (clearTimer) { clearTimeout(clearTimer); clearTimer = null }
    stopLoop()
    const dd = prefersReducedMotion.matches ? 0 : duration
    const dl = prefersReducedMotion.matches ? 0 : delay
    pill.style.transition = `opacity ${dd}ms ease-out ${dl}ms`
    pill.style.opacity = '0'
  }

  // -- Cleanup --

  const cleanup = () => {
    cancelPendingFadeIn()
    releaseCardLean()
    stopLoop()
    removeScrollListeners()
    container.removeEventListener('mouseover', handleMouseOver)
    container.removeEventListener('mouseleave', handleMouseLeave)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('focusin', handleFocusIn, true)
    container.removeEventListener('focusout', handleFocusOut, true)
    document.removeEventListener('theme-changed', skinPillBase)
    prefersReducedMotion.removeEventListener('change', handleMotionChange)
    pill?.remove()
    pill = null
    container.removeAttribute('data-glass-highlight-active')
    if (resizeTimer) clearTimeout(resizeTimer)
    if (clearTimer) clearTimeout(clearTimer)
  }

  return { cleanup, fadeOut: navigationFadeOut }
}
