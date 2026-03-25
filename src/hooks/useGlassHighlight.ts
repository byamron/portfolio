import { useCallback, useEffect, useRef, type RefObject } from 'react'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface GlassConfig {
  fillSaturation: number
  fillBrightness: number
  fillOpacity: number
  surfaceBlur: number
  innerGlow: number
  borderWidth: number
  borderRadius: number
  fadeDuration: number
  maxPull: number
  lerpSpeed: number
  tightBounds: boolean
  clearDelay: number
  cardSelector: string
}

export const GLASS_DEFAULTS: GlassConfig = {
  fillSaturation: 0.10,
  fillBrightness: 0.45,
  fillOpacity: 0.05,
  surfaceBlur: 1.00,
  innerGlow: 0.80,
  borderWidth: 0.10,
  borderRadius: 16,
  fadeDuration: 200,
  maxPull: 10,
  lerpSpeed: 0.15,
  tightBounds: false,
  clearDelay: 150,
  cardSelector: '[data-link-card]',
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

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
    // Skip glass pill entirely on touch devices — no hover capability
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

// ---------------------------------------------------------------------------
// Setup — fully imperative, one RAF loop drives everything
// ---------------------------------------------------------------------------

function setupGlassHighlight(
  container: HTMLElement,
  configRef: React.MutableRefObject<GlassConfig>,
): { cleanup: () => void; fadeOut: (duration?: number, delay?: number) => void } {
  // -- Mutable state --
  let pill: HTMLDivElement | null = null

  let currentCard: HTMLElement | null = null
  let isVisible = false
  let rafId: number | null = null
  let resizeTimer: ReturnType<typeof setTimeout> | null = null
  let clearTimer: ReturnType<typeof setTimeout> | null = null
  let currentBorderRadius = configRef.current.borderRadius
  let cachedContainerRect: DOMRect | null = null
  let scrollDirty = false
  let lastPillW = -1
  let lastPillH = -1
  let cachedSectionCards: HTMLElement[] | null = null

  // All pill geometry is driven by this state object.
  // The RAF loop lerps `current` toward `target` every frame.
  const state = {
    currentX: 0, currentY: 0, currentW: 0, currentH: 0,
    targetX: 0, targetY: 0, targetW: 0, targetH: 0,
    baseX: 0, baseY: 0, baseW: 0, baseH: 0,
    mouseX: 0, mouseY: 0,
  }

  // -- Reduced motion --
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function applyReducedMotion(reduced: boolean): void {
    if (reduced) {
      configRef.current = {
        ...configRef.current,
        fadeDuration: 0,
        maxPull: 0,
        lerpSpeed: 1, // instant — snap to target
      }
    } else {
      configRef.current = { ...GLASS_DEFAULTS, ...configRef.current }
    }
  }

  applyReducedMotion(prefersReducedMotion.matches)

  function handleMotionChange(e: MediaQueryListEvent): void {
    applyReducedMotion(e.matches)
  }
  prefersReducedMotion.addEventListener('change', handleMotionChange)

  // -- Helpers --

  function getAccentHue(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim()
    return parseFloat(raw) || 34
  }

  function setBackdropFilter(el: HTMLElement, value: string): void {
    el.style.backdropFilter = value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(el.style as any).webkitBackdropFilter = value
  }

  // -- Pill creation + styling --

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

  function skinPill(): void {
    if (!pill) return
    const cfg = configRef.current
    const hue = getAccentHue()

    pill.style.borderRadius = `${cfg.borderRadius}px`

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

    // Frost: Blur + accent tint. Mode-aware shading.
    const fill = `hsla(${hue}, 20%, ${isDark ? '55%' : '40%'}, ${isDark ? 0.12 : 0.08})`
    pill.style.background = fill
    setBackdropFilter(pill, `blur(${cfg.surfaceBlur}px)`)

    pill.style.boxShadow = isDark
      ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.10)`
      : `inset 0 -1px 0 0 rgba(0, 0, 0, 0.06)`
    pill.style.border = isDark
      ? `0.5px solid rgba(255, 255, 255, 0.12)`
      : `0.5px solid rgba(0, 0, 0, 0.08)`
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

  // -- Position helper --

  function applyPillPosition(
    x: number, y: number, w: number, h: number,
    leanX = 0, leanY = 0, scaleX = 1, scaleY = 1,
    rotate = 0,
  ): void {
    if (!pill) return
    pill.style.transform = `translate(${x + leanX}px, ${y + leanY}px) rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`
    // Only write width/height when they actually change — these trigger layout
    const roundedW = Math.round(w)
    const roundedH = Math.round(h)
    if (roundedW !== lastPillW) {
      pill.style.width = `${roundedW}px`
      lastPillW = roundedW
    }
    if (roundedH !== lastPillH) {
      pill.style.height = `${roundedH}px`
      lastPillH = roundedH
    }
  }

  // -- Fade (the ONLY thing using CSS transitions) --

  function fadeIn(): void {
    if (!pill) return
    isVisible = true
    const t = `opacity ${configRef.current.fadeDuration}ms ease`
    pill.style.transition = t
    pill.style.opacity = '1'

  }

  function fadeOut(): void {
    if (!pill) return
    isVisible = false
    const t = `opacity ${configRef.current.fadeDuration}ms ease`
    pill.style.transition = t
    pill.style.opacity = '0'

  }

  // -- The one RAF loop that drives all pill movement --

  function startLoop(): void {
    if (rafId !== null) return // already running
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

  function loop(): void {
    rafId = null
    if (!currentCard || !pill) return

    // Handle deferred scroll repositioning
    if (scrollDirty) {
      scrollDirty = false
      const pos = getCardPosition(currentCard)
      state.baseX = state.currentX = state.targetX = pos.x
      state.baseY = state.currentY = state.targetY = pos.y
      state.baseW = state.currentW = state.targetW = pos.w
      state.baseH = state.currentH = state.targetH = pos.h
      applyPillPosition(pos.x, pos.y, pos.w, pos.h)
    }

    const cfg = configRef.current
    const lr = cfg.lerpSpeed

    // Targets stay at base (card position)
    state.targetX = state.baseX
    state.targetY = state.baseY
    state.targetW = state.baseW
    state.targetH = state.baseH

    // Lerp current toward target
    state.currentX += (state.targetX - state.currentX) * lr
    state.currentY += (state.targetY - state.currentY) * lr
    state.currentW += (state.targetW - state.currentW) * lr
    state.currentH += (state.targetH - state.currentH) * lr

    // Settle check
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

    // Compute lean + tilt from cursor position
    let leanX = 0, leanY = 0
    let rotateDeg = 0

    if (cfg.maxPull > 0) {
      if (!cachedContainerRect) cachedContainerRect = container.getBoundingClientRect()
      const pillVpX = cachedContainerRect.left + state.currentX - container.scrollLeft
      const pillVpY = cachedContainerRect.top + state.currentY - container.scrollTop
      const relX = state.mouseX - pillVpX - state.currentW / 2
      const relY = state.mouseY - pillVpY - state.currentH / 2
      const nx = state.currentW > 0 ? relX / (state.currentW / 2) : 0
      const ny = state.currentH > 0 ? relY / (state.currentH / 2) : 0
      const d = Math.sqrt(nx * nx + ny * ny)

      const deadZone = 0.78
      const rawD = Math.max(0, d - deadZone) / (1 - deadZone)
      const t = 1 - Math.exp(-rawD * 2.0)

      // Lean: offset toward cursor
      const maxLean = 2.5
      const dirX = d > 0.001 ? nx / d : 0
      const dirY = d > 0.001 ? ny / d : 0
      leanX = dirX * t * maxLean
      leanY = dirY * t * maxLean

      // Tilt: cross-axis positional hint via rotation
      // Uses dirY * |dirY| (not just |dirY|) so the rotation sign flips correctly
      // when pulling from opposite sides. Symmetric in all quadrants.
      const maxTilt = 0.75 // degrees
      const cnx = Math.max(-1, Math.min(1, nx))
      const cny = Math.max(-1, Math.min(1, ny))
      rotateDeg = (cnx * dirY * Math.abs(dirY) + cny * dirX * Math.abs(dirX)) * maxTilt * t
    }

    // Apply position + lean + tilt to DOM
    applyPillPosition(
      state.currentX, state.currentY, state.currentW, state.currentH,
      leanX, leanY, 1, 1, rotateDeg,
    )

    // Keep running if not settled
    if (!settled) {
      rafId = requestAnimationFrame(loop)
    }
    // When settled, loop stops. mousemove restarts it.
  }

  // -- Event handlers --

  function isCursorInCardStack(clientX: number, clientY: number): boolean {
    if (!currentCard) return false
    // Use cached card list — rebuilt when currentCard changes, avoids
    // querySelectorAll + Array.from + filter on every non-card mouseover
    if (!cachedSectionCards) {
      const sel = configRef.current.cardSelector
      // Scope to the same <section> as the current card so narrative text
      // between sections properly clears the glass pill.
      const section = currentCard.closest('section')
      const scope = section && container.contains(section) ? section : container
      // Exclude tight-bounds cards (e.g. inline links like "Mochi Health") from the
      // stack span — they aren't adjacent to project cards and would extend the
      // stack bounds across unrelated content, keeping the pill alive in gaps.
      cachedSectionCards = Array.from(scope.querySelectorAll<HTMLElement>(sel))
        .filter(c => !c.hasAttribute('data-tight-bounds'))
    }
    const cards = cachedSectionCards
    if (cards.length === 0) return false
    const firstRect = cards[0]!.getBoundingClientRect()
    const lastRect = cards[cards.length - 1]!.getBoundingClientRect()
    // Vertical bounds: span only the section's card stack
    if (clientY < firstRect.top || clientY > lastRect.bottom) return false
    // Horizontal bounds: use the current card's width, not the union of all cards.
    const rect = currentCard.getBoundingClientRect()
    return clientX >= rect.left && clientX <= rect.right
  }

  function handleMouseOver(e: MouseEvent): void {
    const card = (e.target as HTMLElement).closest<HTMLElement>(configRef.current.cardSelector)
    // Ignore cards that belong to a nested glass container
    if (card && card.closest('[data-glass-highlight-active]') !== container) {
      return
    }
    if (!card) {
      // Cursor entered a glass-break zone (e.g. heatmap visualization) — force clear
      const breakEl = (e.target as HTMLElement).closest('[data-glass-break]')
      if (breakEl && container.contains(breakEl)) {
        if (clearTimer) { clearTimeout(clearTimer); clearTimer = null }
        currentCard = null
        fadeOut()
        stopLoop()
        removeScrollListeners()
        return
      }
      // Cursor moved to a non-card area
      const cardTight = currentCard?.hasAttribute('data-tight-bounds')
      const inStack = isCursorInCardStack(e.clientX, e.clientY)
      const shouldClear = configRef.current.tightBounds || cardTight || !inStack
      if (currentCard && shouldClear) {
        if (!clearTimer) {
          // Longer delay when leaving a tight-bounds card toward other cards,
          // so the cursor has time to reach the next card and cancel the timer
          const base = configRef.current.clearDelay
          const delay = (cardTight && inStack) ? Math.max(base, 400) : base
          clearTimer = setTimeout(() => {
            clearTimer = null
            currentCard = null
            fadeOut()
            stopLoop()
            removeScrollListeners()
          }, delay)
        }
      } else if (clearTimer) {
        // Cursor moved back into card stack bounds — cancel pending clear
        clearTimeout(clearTimer)
        clearTimer = null
      }
      return
    }
    // Entered a card — cancel any pending clear
    if (clearTimer) {
      clearTimeout(clearTimer)
      clearTimer = null
    }
    if (card === currentCard) return

    const prevCard = currentCard
    currentCard = card
    cachedSectionCards = null // Rebuild card list for new section context

    // Per-card border radius override
    const cardRadius = card.getAttribute('data-border-radius')
    currentBorderRadius = cardRadius ? parseFloat(cardRadius) : configRef.current.borderRadius
    if (pill) pill.style.borderRadius = `${currentBorderRadius}px`

    // Invalidate cached container rect so the lean calculation uses a fresh
    // position — prevents inverted pull after scrolling between hover sessions
    // (scroll listeners are removed when no card is hovered, so scrolling
    // between hovers leaves the cache stale).
    cachedContainerRect = null

    const pos = getCardPosition(card)

    if (!prevCard) {
      // First hover: snap pill to card instantly, then fade in
      state.baseX = state.currentX = state.targetX = pos.x
      state.baseY = state.currentY = state.targetY = pos.y
      state.baseW = state.currentW = state.targetW = pos.w
      state.baseH = state.currentH = state.targetH = pos.h

      pill!.style.transition = 'none'

      applyPillPosition(pos.x, pos.y, pos.w, pos.h)
      // Double-rAF: separate the "no transition" write from the fade-in
      requestAnimationFrame(() => { requestAnimationFrame(() => { fadeIn() }) })
    } else {
      // Slide: update base and target, current stays where it is — lerp does the rest
      state.baseX = pos.x
      state.baseY = pos.y
      state.baseW = pos.w
      state.baseH = pos.h
      state.targetX = pos.x
      state.targetY = pos.y
      state.targetW = pos.w
      state.targetH = pos.h
      // current stays at old position — the loop lerps it to the new target
    }

    state.mouseX = e.clientX
    state.mouseY = e.clientY
    addScrollListeners()
    startLoop()
  }

  function handleMouseLeave(e: MouseEvent): void {
    if (container.contains(e.relatedTarget as Node)) return
    if (clearTimer) {
      clearTimeout(clearTimer)
      clearTimer = null
    }
    currentCard = null
    fadeOut()
    stopLoop()
    removeScrollListeners()
  }

  function handleMouseMove(e: MouseEvent): void {
    state.mouseX = e.clientX
    state.mouseY = e.clientY
    if (currentCard && rafId === null) {
      startLoop()
    }
  }

  function handleFocusIn(e: FocusEvent): void {
    const card = (e.target as HTMLElement).closest<HTMLElement>(configRef.current.cardSelector)
    if (!card || card.closest('[data-glass-highlight-active]') !== container) return

    const prevCard = currentCard
    currentCard = card
    cachedSectionCards = null

    const cardRadius = card.getAttribute('data-border-radius')
    currentBorderRadius = cardRadius ? parseFloat(cardRadius) : configRef.current.borderRadius
    if (pill) pill.style.borderRadius = `${currentBorderRadius}px`

    cachedContainerRect = null

    const pos = getCardPosition(card)

    if (!prevCard) {
      state.baseX = state.currentX = state.targetX = pos.x
      state.baseY = state.currentY = state.targetY = pos.y
      state.baseW = state.currentW = state.targetW = pos.w
      state.baseH = state.currentH = state.targetH = pos.h

      pill!.style.transition = 'none'

      applyPillPosition(pos.x, pos.y, pos.w, pos.h)
      // Double-rAF: separate the "no transition" write from the fade-in
      requestAnimationFrame(() => { requestAnimationFrame(() => { fadeIn() }) })
    } else {
      state.baseX = pos.x
      state.baseY = pos.y
      state.baseW = pos.w
      state.baseH = pos.h
      state.targetX = pos.x
      state.targetY = pos.y
      state.targetW = pos.w
      state.targetH = pos.h
      startLoop()
    }
  }

  function handleFocusOut(e: FocusEvent): void {
    const related = e.relatedTarget as HTMLElement | null
    if (related?.closest?.(configRef.current.cardSelector)) return
    currentCard = null
    fadeOut()
    stopLoop()
    removeScrollListeners()
  }

  function handleScroll(): void {
    if (!currentCard || !isVisible || !pill) return
    cachedContainerRect = null
    scrollDirty = true
    startLoop()
  }

  function handleResize(): void {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      cachedContainerRect = null
      if (currentCard && isVisible) {
        scrollDirty = true
        startLoop()
      }
    }, 100)
  }

  // -- Theme observer --

  function setupThemeObserver(): void {
    document.addEventListener('theme-changed', skinPill)
  }

  // -- Init --

  pill = createPill()
  skinPill()
  // Only opacity transitions — all position/size driven by RAF
  pill.style.transition = `opacity ${configRef.current.fadeDuration}ms ease`
  container.setAttribute('data-glass-highlight-active', 'true')

  container.addEventListener('mouseover', handleMouseOver)
  container.addEventListener('mouseleave', handleMouseLeave)
  container.addEventListener('mousemove', handleMouseMove, { passive: true })
  container.addEventListener('focusin', handleFocusIn, true)
  container.addEventListener('focusout', handleFocusOut, true)
  setupThemeObserver()

  // -- Navigation fade-out (called externally to sync with page exit) --

  function navigationFadeOut(duration = configRef.current.fadeDuration, delay = 0): void {
    if (!pill) return
    isVisible = false
    currentCard = null
    if (clearTimer) { clearTimeout(clearTimer); clearTimer = null }
    stopLoop()
    // Respect reduced motion: fall back to instant opacity change
    const d = prefersReducedMotion.matches ? 0 : duration
    const dl = prefersReducedMotion.matches ? 0 : delay
    pill.style.transition = `opacity ${d}ms ease-out ${dl}ms`
    pill.style.opacity = '0'
  }

  // -- Cleanup --
  const cleanup = () => {
    stopLoop()
    removeScrollListeners()
    container.removeEventListener('mouseover', handleMouseOver)
    container.removeEventListener('mouseleave', handleMouseLeave)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('focusin', handleFocusIn, true)
    container.removeEventListener('focusout', handleFocusOut, true)
    document.removeEventListener('theme-changed', skinPill)
    prefersReducedMotion.removeEventListener('change', handleMotionChange)
    pill?.remove()
    container.removeAttribute('data-glass-highlight-active')
    if (resizeTimer) clearTimeout(resizeTimer)
    if (clearTimer) clearTimeout(clearTimer)
  }

  return { cleanup, fadeOut: navigationFadeOut }
}
