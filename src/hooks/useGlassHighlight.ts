import { useEffect, useRef, type RefObject } from 'react'

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
  stretchAmount: number
  squashAmount: number
  recoveryDuration: number
  pullStrength: number
  edgeZone: number
  lerpSpeed: number
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
  stretchAmount: 0.05,
  squashAmount: 0.003,
  recoveryDuration: 150,
  pullStrength: 0.25,
  edgeZone: 0.20,
  lerpSpeed: 0.15,
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGlassHighlight(
  containerRef: RefObject<HTMLElement | null>,
  config?: Partial<GlassConfig>,
) {
  const configRef = useRef<GlassConfig>({ ...GLASS_DEFAULTS, ...config })
  configRef.current = { ...GLASS_DEFAULTS, ...config }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    return setupGlassHighlight(container, configRef)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

// ---------------------------------------------------------------------------
// Setup — fully imperative, one RAF loop drives everything
// ---------------------------------------------------------------------------

function setupGlassHighlight(
  container: HTMLElement,
  configRef: React.MutableRefObject<GlassConfig>,
): () => void {
  // -- Mutable state --
  let pill: HTMLDivElement | null = null
  let currentCard: HTMLElement | null = null
  let isVisible = false
  let rafId: number | null = null
  let observer: MutationObserver | null = null
  let isVerticalLayout = true
  let resizeTimer: ReturnType<typeof setTimeout> | null = null
  let clearTimer: ReturnType<typeof setTimeout> | null = null

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
        pullStrength: 0,
        stretchAmount: 0,
        squashAmount: 0,
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

    // Frost: Blur + accent tint + thin border. Mode-aware shading.
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

  // -- Layout detection --

  function detectLayout(): void {
    const cards = container.querySelectorAll<HTMLElement>('[data-link-card]')
    if (cards.length >= 2) {
      const a = cards[0]!.getBoundingClientRect()
      const b = cards[1]!.getBoundingClientRect()
      isVerticalLayout = Math.abs(b.top - a.top) > Math.abs(b.left - a.left)
    }
  }

  // -- Positioning --

  function getCardPosition(card: HTMLElement) {
    const cardRect = card.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    return {
      x: cardRect.left - containerRect.left + container.scrollLeft,
      y: cardRect.top - containerRect.top + container.scrollTop,
      w: cardRect.width,
      h: cardRect.height,
    }
  }

  // -- Fade (the ONLY thing using CSS transitions) --

  function fadeIn(): void {
    if (!pill) return
    isVisible = true
    pill.style.transition = `opacity ${configRef.current.fadeDuration}ms ease`
    pill.style.opacity = '1'
  }

  function fadeOut(): void {
    if (!pill) return
    isVisible = false
    pill.style.transition = `opacity ${configRef.current.fadeDuration}ms ease`
    pill.style.opacity = '0'
  }

  // -- Stretch/squash deformation (Web Animations API, layered on top) --

  function applyStretchSquash(dx: number, dy: number, distance: number): void {
    if (!pill) return
    const cfg = configRef.current
    if (distance <= 5) return

    const f = Math.min(distance / 150, 1)
    const hr = Math.abs(dx) / distance
    const vr = Math.abs(dy) / distance

    const peakSx = (1 + cfg.stretchAmount * f * hr) * (1 - cfg.squashAmount * f * vr)
    const peakSy = (1 + cfg.stretchAmount * f * vr) * (1 - cfg.squashAmount * f * hr)

    pill.animate(
      [
        { transform: 'scale(1, 1)', offset: 0 },
        { transform: `scale(${peakSx}, ${peakSy})`, offset: 0.3 },
        { transform: 'scale(1, 1)', offset: 1.0 },
      ],
      {
        duration: 350,
        easing: 'ease-out',
        fill: 'none' as FillMode,
        composite: 'add',
      },
    )
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

  function loop(): void {
    rafId = null
    if (!currentCard || !pill) return

    const cfg = configRef.current
    const lr = cfg.lerpSpeed

    // Compute pull-adjusted targets (gravitational pull modifies target from base)
    computePullTargets(cfg)

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

    // Apply to DOM — single write
    pill.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`
    pill.style.width = `${state.currentW}px`
    pill.style.height = `${state.currentH}px`

    // Keep running if not settled, or if a card is hovered (mouse may move into edge zone)
    if (!settled) {
      rafId = requestAnimationFrame(loop)
    }
    // When settled, loop stops. mousemove restarts it.
  }

  function computePullTargets(cfg: GlassConfig): void {
    if (!currentCard) return

    // Start from base position (the card's natural position)
    let newX = state.baseX
    let newY = state.baseY
    let newW = state.baseW
    let newH = state.baseH

    // Gravitational pull: if cursor is in edge zone, stretch + shift
    const cardRect = currentCard.getBoundingClientRect()
    const relX = (state.mouseX - cardRect.left) / cardRect.width
    const relY = (state.mouseY - cardRect.top) / cardRect.height

    const ez = cfg.edgeZone
    let pullAmount = 0

    if (isVerticalLayout) {
      if (relY < ez) {
        pullAmount = -Math.pow(Math.max(0, Math.min(1, 1 - relY / ez)), 1.5)
      } else if (relY > 1 - ez) {
        pullAmount = Math.pow(Math.max(0, Math.min(1, (relY - (1 - ez)) / ez)), 1.5)
      }
    } else {
      if (relX < ez) {
        pullAmount = -Math.pow(Math.max(0, Math.min(1, 1 - relX / ez)), 1.5)
      } else if (relX > 1 - ez) {
        pullAmount = Math.pow(Math.max(0, Math.min(1, (relX - (1 - ez)) / ez)), 1.5)
      }
    }

    if (pullAmount !== 0) {
      const ps = cfg.pullStrength
      const dim = isVerticalLayout ? state.baseH : state.baseW
      const maxStretch = dim * 0.25 * ps
      const maxMove = dim * 0.15 * ps
      const stretchPx = Math.abs(pullAmount) * maxStretch
      const movePx = pullAmount * maxMove

      if (isVerticalLayout) {
        newH = state.baseH + stretchPx
        newW = state.baseW * (state.baseH / newH) // volume preservation
        newX = state.baseX + (state.baseW - newW) / 2
        newY = state.baseY + movePx
        if (pullAmount < 0) newY -= stretchPx
      } else {
        newW = state.baseW + stretchPx
        newH = state.baseH * (state.baseW / newW)
        newY = state.baseY + (state.baseH - newH) / 2
        newX = state.baseX + movePx
        if (pullAmount < 0) newX -= stretchPx
      }
    }

    state.targetX = newX
    state.targetY = newY
    state.targetW = newW
    state.targetH = newH
  }

  // -- Event handlers --

  function isCursorInCardStack(clientY: number): boolean {
    const cards = container.querySelectorAll<HTMLElement>('[data-link-card]')
    if (cards.length === 0) return false
    const firstRect = cards[0]!.getBoundingClientRect()
    const lastRect = cards[cards.length - 1]!.getBoundingClientRect()
    return clientY >= firstRect.top && clientY <= lastRect.bottom
  }

  function handleMouseOver(e: MouseEvent): void {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-link-card]')
    if (!card) {
      // Cursor moved to a non-card area — only clear if outside the card stack
      if (currentCard && !isCursorInCardStack(e.clientY)) {
        if (!clearTimer) {
          clearTimer = setTimeout(() => {
            clearTimer = null
            currentCard = null
            fadeOut()
            stopLoop()
          }, 150)
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

    detectLayout()

    const prevCard = currentCard
    currentCard = card

    const pos = getCardPosition(card)

    if (!prevCard) {
      // First hover: snap pill to card instantly, then fade in
      state.baseX = state.currentX = state.targetX = pos.x
      state.baseY = state.currentY = state.targetY = pos.y
      state.baseW = state.currentW = state.targetW = pos.w
      state.baseH = state.currentH = state.targetH = pos.h

      pill!.style.transition = 'none'
      pill!.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      pill!.style.width = `${pos.w}px`
      pill!.style.height = `${pos.h}px`
      void pill!.offsetHeight // force reflow

      fadeIn()
    } else {
      // Slide: update base and target, current stays where it is — lerp does the rest
      const dx = pos.x - state.baseX
      const dy = pos.y - state.baseY
      const distance = Math.sqrt(dx * dx + dy * dy)

      state.baseX = pos.x
      state.baseY = pos.y
      state.baseW = pos.w
      state.baseH = pos.h
      state.targetX = pos.x
      state.targetY = pos.y
      state.targetW = pos.w
      state.targetH = pos.h
      // current stays at old position — the loop lerps it to the new target

      // Layer stretch/squash deformation on top
      applyStretchSquash(dx, dy, distance)
    }

    state.mouseX = e.clientX
    state.mouseY = e.clientY
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
  }

  function handleMouseMove(e: MouseEvent): void {
    state.mouseX = e.clientX
    state.mouseY = e.clientY
    if (currentCard && rafId === null) {
      startLoop()
    }
  }

  function handleFocusIn(e: FocusEvent): void {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-link-card]')
    if (!card) return

    detectLayout()
    const prevCard = currentCard
    currentCard = card
    const pos = getCardPosition(card)

    if (!prevCard) {
      state.baseX = state.currentX = state.targetX = pos.x
      state.baseY = state.currentY = state.targetY = pos.y
      state.baseW = state.currentW = state.targetW = pos.w
      state.baseH = state.currentH = state.targetH = pos.h

      pill!.style.transition = 'none'
      pill!.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      pill!.style.width = `${pos.w}px`
      pill!.style.height = `${pos.h}px`
      void pill!.offsetHeight

      fadeIn()
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
    if (related?.closest?.('[data-link-card]')) return
    currentCard = null
    fadeOut()
    stopLoop()
  }

  function handleScroll(): void {
    if (!currentCard || !isVisible || !pill) return
    const pos = getCardPosition(currentCard)

    state.baseX = state.currentX = state.targetX = pos.x
    state.baseY = state.currentY = state.targetY = pos.y
    state.baseW = state.currentW = state.targetW = pos.w
    state.baseH = state.currentH = state.targetH = pos.h

    pill.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    pill.style.width = `${pos.w}px`
    pill.style.height = `${pos.h}px`
  }

  function handleResize(): void {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      detectLayout()
      if (currentCard && isVisible) handleScroll()
    }, 100)
  }

  // -- Theme observer --

  function setupThemeObserver(): void {
    observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.attributeName === 'data-accent' || m.attributeName === 'data-theme') {
          skinPill()
          break
        }
      }
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-accent', 'data-theme'],
    })
  }

  // -- Init --

  pill = createPill()
  skinPill()
  // Only opacity transitions — all position/size driven by RAF
  pill.style.transition = `opacity ${configRef.current.fadeDuration}ms ease`
  container.setAttribute('data-glass-highlight-active', 'true')
  detectLayout()

  container.addEventListener('mouseover', handleMouseOver)
  container.addEventListener('mouseleave', handleMouseLeave)
  container.addEventListener('mousemove', handleMouseMove, { passive: true })
  container.addEventListener('focusin', handleFocusIn, true)
  container.addEventListener('focusout', handleFocusOut, true)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  setupThemeObserver()

  // -- Cleanup --
  return () => {
    stopLoop()
    container.removeEventListener('mouseover', handleMouseOver)
    container.removeEventListener('mouseleave', handleMouseLeave)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('focusin', handleFocusIn, true)
    container.removeEventListener('focusout', handleFocusOut, true)
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    observer?.disconnect()
    prefersReducedMotion.removeEventListener('change', handleMotionChange)
    pill?.remove()
    container.removeAttribute('data-glass-highlight-active')
    if (resizeTimer) clearTimeout(resizeTimer)
    if (clearTimer) clearTimeout(clearTimer)
  }
}
