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
  duration: number
  fadeDuration: number
  easing: string
  stretchAmount: number
  squashAmount: number
  overshoot: number
  recoveryDuration: number
  pullStrength: number
  edgeZone: number
  pullLerp: number
}

export const GLASS_DEFAULTS: GlassConfig = {
  fillSaturation: 0.10,
  fillBrightness: 0.45,
  fillOpacity: 0.05,
  surfaceBlur: 1.00,
  innerGlow: 0.80,
  borderWidth: 0.10,
  borderRadius: 16,
  duration: 200,
  fadeDuration: 200,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  stretchAmount: 0.05,
  squashAmount: 0.01,
  overshoot: 0.05,
  recoveryDuration: 150,
  pullStrength: 0.15,
  edgeZone: 0.20,
  pullLerp: 0.12,
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGlassHighlight(
  containerRef: RefObject<HTMLElement | null>,
  config?: Partial<GlassConfig>,
) {
  const configRef = useRef<GlassConfig>({ ...GLASS_DEFAULTS, ...config })

  // Update config ref on every render (no teardown needed)
  configRef.current = { ...GLASS_DEFAULTS, ...config }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    return setupGlassHighlight(container, configRef)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

// ---------------------------------------------------------------------------
// Setup (imperative, no React state)
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

  const pull = {
    currentX: 0, currentY: 0, currentW: 0, currentH: 0,
    targetX: 0, targetY: 0, targetW: 0, targetH: 0,
    baseX: 0, baseY: 0, baseW: 0, baseH: 0,
    mouseX: 0, mouseY: 0,
    isActive: false,
  }

  // -- Reduced motion --
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (prefersReducedMotion.matches) {
    configRef.current = {
      ...configRef.current,
      duration: 0,
      fadeDuration: 0,
      pullStrength: 0,
      stretchAmount: 0,
      squashAmount: 0,
      overshoot: 0,
    }
  }

  // -- Helpers --

  function getAccentHue(): number {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim()
    return parseFloat(raw) || 34
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

  function skinPill(): void {
    if (!pill) return
    const cfg = configRef.current
    const hue = getAccentHue()

    // Fill
    const fill = `hsla(${hue}, ${cfg.fillSaturation * 100}%, ${cfg.fillBrightness * 100}%, ${cfg.fillOpacity})`

    // Radial highlight
    const intensity = 0.15 + cfg.fillBrightness * 0.1
    const highlight = `radial-gradient(ellipse 150% 120% at 50% 10%, rgba(255,255,255,${intensity}), rgba(255,255,255,${intensity * 0.4}) 50%, rgba(255,255,255,${intensity * 0.1}) 85%, transparent 120%)`

    // Inner glow (6 inset shadows)
    const topHL = cfg.innerGlow * 0.4
    const botSH = cfg.innerGlow * 0.15
    const bi = 0.12 + cfg.fillBrightness * 0.15
    const bw = cfg.borderWidth
    const boxShadow = [
      `inset 0 1px 0 0 rgba(255,255,255,${topHL})`,
      `inset 0 -1px 0 0 rgba(0,0,0,${botSH})`,
      `inset 0 ${bw}px 0 0 rgba(255,255,255,${bi * 1.2})`,
      `inset ${bw}px 0 0 0 rgba(255,255,255,${bi})`,
      `inset -${bw}px 0 0 0 rgba(255,255,255,${bi})`,
      `inset 0 -${bw}px 0 0 rgba(255,255,255,${bi * 0.8})`,
    ].join(', ')

    const border = `${bw}px solid hsla(${hue}, 20%, 50%, 0.2)`

    pill.style.background = `${highlight}, ${fill}`
    pill.style.backdropFilter = `blur(${cfg.surfaceBlur}px) saturate(1.2)`
    pill.style.webkitBackdropFilter = `blur(${cfg.surfaceBlur}px) saturate(1.2)`
    pill.style.boxShadow = boxShadow
    pill.style.border = border
    pill.style.borderRadius = `${cfg.borderRadius}px`
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

  function positionPillAtCard(card: HTMLElement): void {
    if (!pill) return
    const pos = getCardPosition(card)

    // Disable transitions for instant placement
    pill.style.transition = 'none'
    pill.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    pill.style.width = `${pos.w}px`
    pill.style.height = `${pos.h}px`

    // Force reflow so transition: none takes effect
    void pill.offsetHeight

    // Sync pull state
    pull.baseX = pull.currentX = pull.targetX = pos.x
    pull.baseY = pull.currentY = pull.targetY = pos.y
    pull.baseW = pull.currentW = pull.targetW = pos.w
    pull.baseH = pull.currentH = pull.targetH = pos.h
  }

  function slidePillToCard(card: HTMLElement): void {
    if (!pill) return
    const cfg = configRef.current
    const pos = getCardPosition(card)

    const dx = pos.x - pull.baseX
    const dy = pos.y - pull.baseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Update base
    pull.baseX = pos.x
    pull.baseY = pos.y
    pull.baseW = pos.w
    pull.baseH = pos.h
    pull.targetX = pos.x
    pull.targetY = pos.y
    pull.targetW = pos.w
    pull.targetH = pos.h

    // Easing with optional overshoot
    let easing = cfg.easing
    if (cfg.overshoot > 0) {
      easing = `cubic-bezier(0.34, ${1 + cfg.overshoot}, 0.64, 1)`
    }

    // CSS transition for slide
    pill.style.transition = [
      `transform ${cfg.duration}ms ${easing}`,
      `width ${cfg.duration}ms ${easing}`,
      `height ${cfg.duration}ms ${easing}`,
      `opacity ${cfg.fadeDuration}ms ease`,
    ].join(', ')

    pill.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    pill.style.width = `${pos.w}px`
    pill.style.height = `${pos.h}px`

    // Sync current to target after transition duration (the pull loop
    // will take over positioning once it starts next frame)
    pull.currentX = pull.baseX
    pull.currentY = pull.baseY
    pull.currentW = pull.baseW
    pull.currentH = pull.baseH

    // Stretch/squash deformation
    if (distance > 5) {
      applyStretchSquash(dx, dy, distance)
    }
  }

  function applyStretchSquash(dx: number, dy: number, distance: number): void {
    if (!pill) return
    const cfg = configRef.current

    const f = Math.min(distance / 150, 1)
    const hr = Math.abs(dx) / distance
    const vr = Math.abs(dy) / distance

    const peakSx = (1 + cfg.stretchAmount * f * hr) * (1 - cfg.squashAmount * f * vr)
    const peakSy = (1 + cfg.stretchAmount * f * vr) * (1 - cfg.squashAmount * f * hr)

    const totalDuration = cfg.duration + cfg.recoveryDuration

    pill.animate(
      [
        { transform: 'scale(1, 1)', offset: 0 },
        { transform: `scale(${peakSx}, ${peakSy})`, offset: 0.3 },
        { transform: 'scale(1, 1)', offset: 1.0 },
      ],
      {
        duration: totalDuration,
        easing: 'ease-out',
        fill: 'none' as FillMode,
        composite: 'add',
      },
    )
  }

  // -- Fade --

  function fadeIn(): void {
    if (!pill) return
    isVisible = true
    // Keep only opacity transition — pull loop manages transform
    pill.style.transition = `opacity ${configRef.current.fadeDuration}ms ease`
    pill.style.opacity = '1'
  }

  function fadeOut(): void {
    if (!pill) return
    isVisible = false
    pill.style.transition = `opacity ${configRef.current.fadeDuration}ms ease`
    pill.style.opacity = '0'
  }

  // -- Gravitational pull (RAF loop) --

  function startPullLoop(): void {
    if (pull.isActive) return
    pull.isActive = true
    // Switch to RAF-managed positioning (disable CSS transitions on transform)
    if (pill) {
      pill.style.transition = `opacity ${configRef.current.fadeDuration}ms ease`
    }
    scheduleFrame()
  }

  function stopPullLoop(): void {
    pull.isActive = false
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function scheduleFrame(): void {
    if (rafId === null && pull.isActive) {
      rafId = requestAnimationFrame(rafLoop)
    }
  }

  function rafLoop(): void {
    rafId = null
    if (!pull.isActive || !currentCard || !pill) return

    const cfg = configRef.current

    // Step 1: Compute pull targets
    computePullTargets(cfg)

    // Step 2: Lerp toward targets
    const lr = cfg.pullLerp
    pull.currentX += (pull.targetX - pull.currentX) * lr
    pull.currentY += (pull.targetY - pull.currentY) * lr
    pull.currentW += (pull.targetW - pull.currentW) * lr
    pull.currentH += (pull.targetH - pull.currentH) * lr

    // Step 3: Settle check
    const threshold = 0.3
    const settled =
      Math.abs(pull.currentX - pull.targetX) < threshold &&
      Math.abs(pull.currentY - pull.targetY) < threshold &&
      Math.abs(pull.currentW - pull.targetW) < threshold &&
      Math.abs(pull.currentH - pull.targetH) < threshold

    if (settled) {
      pull.currentX = pull.targetX
      pull.currentY = pull.targetY
      pull.currentW = pull.targetW
      pull.currentH = pull.targetH
    }

    // Step 4: Apply to DOM (single write batch)
    pill.style.transform = `translate(${pull.currentX}px, ${pull.currentY}px)`
    pill.style.width = `${pull.currentW}px`
    pill.style.height = `${pull.currentH}px`

    // Step 5: Continue or pause
    if (!settled) {
      rafId = requestAnimationFrame(rafLoop)
    }
    // If settled, rafId stays null. mousemove will restart via scheduleFrame().
  }

  function computePullTargets(cfg: GlassConfig): void {
    if (!currentCard) {
      pull.targetX = pull.baseX
      pull.targetY = pull.baseY
      pull.targetW = pull.baseW
      pull.targetH = pull.baseH
      return
    }

    const cardRect = currentCard.getBoundingClientRect()

    // Mouse position as 0-1 ratio within card
    const relX = (pull.mouseX - cardRect.left) / cardRect.width
    const relY = (pull.mouseY - cardRect.top) / cardRect.height

    const ez = cfg.edgeZone
    let pullAmountX = 0
    let pullAmountY = 0

    if (isVerticalLayout) {
      // Check top/bottom edges
      if (relY < ez) {
        const t = 1 - relY / ez
        pullAmountY = -Math.pow(Math.max(0, Math.min(1, t)), 1.5)
      } else if (relY > 1 - ez) {
        const t = (relY - (1 - ez)) / ez
        pullAmountY = Math.pow(Math.max(0, Math.min(1, t)), 1.5)
      }
    } else {
      // Check left/right edges
      if (relX < ez) {
        const t = 1 - relX / ez
        pullAmountX = -Math.pow(Math.max(0, Math.min(1, t)), 1.5)
      } else if (relX > 1 - ez) {
        const t = (relX - (1 - ez)) / ez
        pullAmountX = Math.pow(Math.max(0, Math.min(1, t)), 1.5)
      }
    }

    const ps = cfg.pullStrength
    const dim = isVerticalLayout ? pull.baseH : pull.baseW
    const maxStretch = dim * 0.25 * ps
    const maxMove = dim * 0.15 * ps

    let newW = pull.baseW
    let newH = pull.baseH
    let newX = pull.baseX
    let newY = pull.baseY

    if (isVerticalLayout) {
      const stretchPx = Math.abs(pullAmountY) * maxStretch
      const movePx = pullAmountY * maxMove

      newH = pull.baseH + stretchPx
      // Volume preservation
      newW = pull.baseW * (pull.baseH / newH)
      // Center the width change
      newX = pull.baseX + (pull.baseW - newW) / 2
      // Translate in pull direction
      newY = pull.baseY + movePx
      // Extend stretch toward pull direction
      if (pullAmountY < 0) {
        newY -= stretchPx
      }
    } else {
      const stretchPx = Math.abs(pullAmountX) * maxStretch
      const movePx = pullAmountX * maxMove

      newW = pull.baseW + stretchPx
      newH = pull.baseH * (pull.baseW / newW)
      newY = pull.baseY + (pull.baseH - newH) / 2
      newX = pull.baseX + movePx
      if (pullAmountX < 0) {
        newX -= stretchPx
      }
    }

    pull.targetX = newX
    pull.targetY = newY
    pull.targetW = newW
    pull.targetH = newH
  }

  // -- Event handlers --

  function handleMouseOver(e: MouseEvent): void {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-link-card]')
    if (!card) return
    if (card === currentCard) return

    detectLayout()

    const prevCard = currentCard
    currentCard = card

    if (!prevCard) {
      positionPillAtCard(card)
      fadeIn()
    } else {
      slidePillToCard(card)
    }

    // Update mouse position and start pull
    pull.mouseX = e.clientX
    pull.mouseY = e.clientY
    startPullLoop()
  }

  function handleMouseLeave(e: MouseEvent): void {
    if (container.contains(e.relatedTarget as Node)) return
    currentCard = null
    fadeOut()
    stopPullLoop()
  }

  function handleMouseMove(e: MouseEvent): void {
    pull.mouseX = e.clientX
    pull.mouseY = e.clientY
    // Restart RAF if it stopped after settling
    if (pull.isActive && rafId === null) {
      scheduleFrame()
    }
  }

  function handleFocusIn(e: FocusEvent): void {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-link-card]')
    if (!card) return

    detectLayout()
    const prevCard = currentCard
    currentCard = card

    if (!prevCard) {
      positionPillAtCard(card)
      fadeIn()
    } else {
      slidePillToCard(card)
    }
    // No pull loop for keyboard focus (no cursor position)
  }

  function handleFocusOut(e: FocusEvent): void {
    const related = e.relatedTarget as HTMLElement | null
    if (related?.closest?.('[data-link-card]')) return
    currentCard = null
    fadeOut()
    stopPullLoop()
  }

  function handleScroll(): void {
    if (!currentCard || !isVisible || !pill) return
    const pos = getCardPosition(currentCard)

    // Snap pill to card (no lerp during scroll)
    pull.baseX = pull.currentX = pull.targetX = pos.x
    pull.baseY = pull.currentY = pull.targetY = pos.y
    pull.baseW = pull.currentW = pull.targetW = pos.w
    pull.baseH = pull.currentH = pull.targetH = pos.h

    pill.style.transform = `translate(${pos.x}px, ${pos.y}px)`
    pill.style.width = `${pos.w}px`
    pill.style.height = `${pos.h}px`
  }

  function handleResize(): void {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      detectLayout()
      if (currentCard && isVisible) {
        handleScroll() // reuses the snap-to-card logic
      }
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
  container.setAttribute('data-glass-highlight-active', 'true')
  detectLayout()

  container.addEventListener('mouseover', handleMouseOver)
  container.addEventListener('mouseleave', handleMouseLeave)
  container.addEventListener('mousemove', handleMouseMove, { passive: true })
  container.addEventListener('focusin', handleFocusIn, true)
  container.addEventListener('focusout', handleFocusOut, true)
  container.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)

  setupThemeObserver()

  // -- Cleanup --
  return () => {
    stopPullLoop()
    container.removeEventListener('mouseover', handleMouseOver)
    container.removeEventListener('mouseleave', handleMouseLeave)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('focusin', handleFocusIn, true)
    container.removeEventListener('focusout', handleFocusOut, true)
    container.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', handleResize)
    observer?.disconnect()
    pill?.remove()
    container.removeAttribute('data-glass-highlight-active')
    if (resizeTimer) clearTimeout(resizeTimer)
  }
}
