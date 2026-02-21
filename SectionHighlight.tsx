import type { ComponentType } from "react"
import { useEffect, useRef } from "react"

/**
 * SectionHighlight Override
 *
 * Glass pill that slides between [data-link-card] elements
 * with liquid deformation and gravitational pull.
 *
 * Pull physics use a lerp loop (rAF) so the pill chases the
 * target position smoothly instead of snapping on each mousemove.
 */

// ============================================
// CONFIG
// ============================================

const DEFAULTS = {
    borderRadius: 16,
    padding: 0,
    background:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.045) 85%, rgba(0, 0, 0, 0.04) 100%)",
    border: "0px solid rgba(0, 0, 0, 0.06)",
    backdropFilter: "none",
    boxShadow:
        "0 1px 8px 3px rgba(0, 0, 0, 0.01), inset 0 0.5px 0 0 rgba(255, 255, 255, 0.75), inset 0 -0.5px 0 0 rgba(0, 0, 0, 0.15)",
    duration: 150,
    fadeDuration: 150,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    stretchAmount: 0.1,
    squashAmount: 0.05,
    recoveryDuration: 150,
    overshoot: 0.1,
    pullStrength: 0.05,
    pullRange: 0.2,
    pullCurve: 1,
    pullEasing: "cubic-bezier(0.2, 0, 0, 1)",
    pullBalance: 0.5,
}

function cfg() {
    const ext =
        typeof window !== "undefined" && (window as any).__highlightConfig
    return ext ? { ...DEFAULTS, ...ext } : DEFAULTS
}

// ============================================
// LERP HELPERS
// ============================================

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
}

// ============================================
// SETUP
// ============================================

function setup(container: HTMLElement) {
    const pill = document.createElement("div")
    pill.setAttribute("aria-hidden", "true")
    Object.assign(pill.style, {
        position: "absolute",
        pointerEvents: "none",
        zIndex: "0",
        opacity: "0",
        transformOrigin: "center center",
    })

    if (getComputedStyle(container).position === "static")
        container.style.position = "relative"
    container.insertBefore(pill, container.firstChild)

    // ---- Appearance ----
    function skin() {
        const c = cfg()
        pill.style.background = c.background
        pill.style.border = c.border
        pill.style.borderRadius = c.borderRadius + "px"
        pill.style.backdropFilter = c.backdropFilter
        ;(pill.style as any).webkitBackdropFilter = c.backdropFilter
        pill.style.boxShadow = c.boxShadow
    }

    // ---- Transitions ----
    function setTransition(on: boolean, easing?: string) {
        const c = cfg()
        if (on) {
            const e = easing || c.easing
            pill.style.transition =
                `transform ${c.duration}ms ${e}, ` +
                `width ${c.duration}ms ${e}, ` +
                `height ${c.duration}ms ${e}, ` +
                `opacity ${c.fadeDuration}ms ease`
        } else {
            pill.style.transition = `opacity ${c.fadeDuration}ms ease`
        }
    }

    skin()
    setTransition(true)

    // ================================================================
    // STATE
    // ================================================================
    let showing = false
    let currentCard: HTMLElement | null = null
    let baseX = 0,
        baseY = 0,
        baseW = 0,
        baseH = 0
    let prevBaseX = 0,
        prevBaseY = 0
    let pulling = false
    let sliding = false
    let slideTimer = 0
    let scaleAnim: Animation | null = null

    // Pull lerp state
    let pullTargetX = 0,
        pullTargetY = 0,
        pullTargetW = 0,
        pullTargetH = 0
    let pullCurrentX = 0,
        pullCurrentY = 0,
        pullCurrentW = 0,
        pullCurrentH = 0
    let pullActive = false // true when lerp loop should run
    let pullRafId = 0
    const PULL_LERP_SPEED = 0.15 // per frame, ~0.15 = smooth chase

    // ================================================================
    // HELPERS
    // ================================================================
    function getCards(): HTMLElement[] {
        return Array.from(
            container.querySelectorAll<HTMLElement>("[data-link-card]")
        )
    }

    function isVertical(cards: HTMLElement[]): boolean {
        if (cards.length < 2) return true
        const a = cards[0].getBoundingClientRect()
        const b = cards[1].getBoundingClientRect()
        return Math.abs(b.top - a.top) > Math.abs(b.left - a.left)
    }

    function cardRect(card: HTMLElement) {
        const c = cfg()
        const pad = c.padding || 0
        const cr = container.getBoundingClientRect()
        const er = card.getBoundingClientRect()
        return {
            x: er.left - cr.left + container.scrollLeft - pad,
            y: er.top - cr.top + container.scrollTop - pad,
            w: er.width + pad * 2,
            h: er.height + pad * 2,
        }
    }

    // ================================================================
    // PULL LERP LOOP
    //
    // Runs via rAF. Each frame, current values chase target values.
    // When close enough, loop stops. This gives natural inertia —
    // the pill accelerates into pull and decelerates out of it.
    // ================================================================
    function pullLerpTick() {
        if (!pullActive) return

        const speed = PULL_LERP_SPEED
        pullCurrentX = lerp(pullCurrentX, pullTargetX, speed)
        pullCurrentY = lerp(pullCurrentY, pullTargetY, speed)
        pullCurrentW = lerp(pullCurrentW, pullTargetW, speed)
        pullCurrentH = lerp(pullCurrentH, pullTargetH, speed)

        pill.style.transform = `translate(${pullCurrentX}px, ${pullCurrentY}px)`
        pill.style.width = pullCurrentW + "px"
        pill.style.height = pullCurrentH + "px"

        // Check if we've settled (close enough to target)
        const dx = Math.abs(pullCurrentX - pullTargetX)
        const dy = Math.abs(pullCurrentY - pullTargetY)
        const dw = Math.abs(pullCurrentW - pullTargetW)
        const dh = Math.abs(pullCurrentH - pullTargetH)

        if (dx < 0.3 && dy < 0.3 && dw < 0.3 && dh < 0.3) {
            // Settled — snap to exact target
            pill.style.transform = `translate(${pullTargetX}px, ${pullTargetY}px)`
            pill.style.width = pullTargetW + "px"
            pill.style.height = pullTargetH + "px"
            pullCurrentX = pullTargetX
            pullCurrentY = pullTargetY
            pullCurrentW = pullTargetW
            pullCurrentH = pullTargetH

            // If target is base position, we're done pulling
            if (
                Math.abs(pullTargetX - baseX) < 0.5 &&
                Math.abs(pullTargetY - baseY) < 0.5 &&
                Math.abs(pullTargetW - baseW) < 0.5 &&
                Math.abs(pullTargetH - baseH) < 0.5
            ) {
                pullActive = false
                pulling = false
                return
            }
        }

        pullRafId = requestAnimationFrame(pullLerpTick)
    }

    function startPullLoop() {
        if (!pullActive) {
            pullActive = true
            pullRafId = requestAnimationFrame(pullLerpTick)
        }
    }

    function stopPullLoop() {
        pullActive = false
        cancelAnimationFrame(pullRafId)
    }

    // ================================================================
    // MOVE TO CARD
    // ================================================================
    function moveTo(card: HTMLElement) {
        if (card === currentCard && showing && !pulling) return

        const c = cfg()
        const fromPull = pulling

        // Stop pull loop
        if (pulling) {
            pulling = false
            stopPullLoop()
        }

        // Block pull during slide
        sliding = true
        clearTimeout(slideTimer)
        slideTimer = window.setTimeout(() => {
            sliding = false
        }, c.duration + 20)

        if (scaleAnim) {
            scaleAnim.cancel()
            scaleAnim = null
        }

        const r = cardRect(card)

        if (!showing) {
            pill.style.transition = "none"
            pill.style.transform = `translate(${r.x}px, ${r.y}px)`
            pill.style.width = r.w + "px"
            pill.style.height = r.h + "px"
            void pill.offsetTop
            setTransition(true)
            pill.style.opacity = "1"
        } else {
            setTransition(true, fromPull ? c.pullEasing : undefined)
            pill.style.transform = `translate(${r.x}px, ${r.y}px)`
            pill.style.width = r.w + "px"
            pill.style.height = r.h + "px"

            // Liquid scale deformation on slide
            if (c.stretchAmount > 0 || c.squashAmount > 0) {
                const dx = r.x - prevBaseX
                const dy = r.y - prevBaseY
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist > 5) {
                    const f = Math.min(dist / 200, 1)
                    const hr = Math.abs(dx) / dist
                    const vr = Math.abs(dy) / dist
                    const sx =
                        (1 + c.stretchAmount * f * hr) *
                        (1 - c.squashAmount * f * vr)
                    const sy =
                        (1 + c.stretchAmount * f * vr) *
                        (1 - c.squashAmount * f * hr)

                    const ease =
                        c.overshoot > 0
                            ? `cubic-bezier(0.34, ${(1 + c.overshoot * 2).toFixed(2)}, 0.64, 1)`
                            : c.easing

                    scaleAnim = pill.animate(
                        [{ scale: `${sx} ${sy}` }, { scale: "1 1" }],
                        {
                            duration: c.recoveryDuration,
                            delay: Math.round(c.duration * 0.3),
                            easing: ease,
                            fill: "backwards",
                        }
                    )
                    scaleAnim.onfinish = () => {
                        scaleAnim = null
                    }
                }
            }
        }

        showing = true
        prevBaseX = baseX
        prevBaseY = baseY
        currentCard = card
        baseX = r.x
        baseY = r.y
        baseW = r.w
        baseH = r.h

        // Sync pull current to new base so next pull starts from here
        pullCurrentX = r.x
        pullCurrentY = r.y
        pullCurrentW = r.w
        pullCurrentH = r.h
    }

    // ================================================================
    // HIDE
    // ================================================================
    function hide() {
        pulling = false
        sliding = false
        stopPullLoop()
        clearTimeout(slideTimer)
        pill.style.opacity = "0"
        showing = false
        currentCard = null
        if (scaleAnim) {
            scaleAnim.cancel()
            scaleAnim = null
        }
    }

    // ================================================================
    // GRAVITATIONAL PULL
    //
    // Computes TARGET position. The lerp loop chases it smoothly.
    //
    // pullBalance splits total displacement into:
    //   move  = translate the whole pill (both edges shift)
    //   stretch = extend the leading edge (trailing stays, volume preserved)
    //
    // At balance 0: pure translate, 3× base multiplier for visible movement
    // At balance 1: pure stretch, 2× base multiplier for visible deformation
    // ================================================================
    function handlePull(e: MouseEvent) {
        if (!showing || !currentCard || sliding) return

        const c = cfg()
        if (!c.pullStrength || c.pullStrength <= 0) return

        const cards = getCards()
        const idx = cards.indexOf(currentCard)
        if (idx === -1) return

        const vert = isVertical(cards)
        const cr = currentCard.getBoundingClientRect()

        const ratio = vert
            ? (e.clientY - cr.top) / cr.height
            : (e.clientX - cr.left) / cr.width

        const range = c.pullRange
        let t = 0
        let neighbor: HTMLElement | null = null
        let dir = 0

        if (ratio > 1 - range && idx < cards.length - 1) {
            neighbor = cards[idx + 1]
            dir = 1
            t = (ratio - (1 - range)) / range
        } else if (ratio < range && idx > 0) {
            neighbor = cards[idx - 1]
            dir = -1
            t = (range - ratio) / range
        }

        t = Math.pow(Math.max(0, Math.min(1, t)), c.pullCurve)

        if (!neighbor || t < 0.01) {
            // Return to base
            pullTargetX = baseX
            pullTargetY = baseY
            pullTargetW = baseW
            pullTargetH = baseH

            if (pulling) {
                // Let the lerp loop coast back to base naturally
                startPullLoop()
            }
            return
        }

        // Enter pull mode (disable CSS transitions, lerp loop handles animation)
        if (!pulling) {
            pulling = true
            setTransition(false)
            // Initialize current to base
            pullCurrentX = baseX
            pullCurrentY = baseY
            pullCurrentW = baseW
            pullCurrentH = baseH
        }

        const nr = cardRect(neighbor)
        const strength = c.pullStrength
        const bal = c.pullBalance ?? 0.5

        // Amplify move and stretch independently for visible range
        const moveScale = 3.0 // move is subtle, needs boost
        const stretchScale = 2.0

        if (vert) {
            const gap = dir > 0 ? nr.y - (baseY + baseH) : baseY - (nr.y + nr.h)

            const totalPull = t * (gap + nr.h * 0.5) * strength

            const movePx = totalPull * (1 - bal) * moveScale
            const stretchPx = totalPull * bal * stretchScale

            const newH = baseH + stretchPx
            const newW = baseW * (baseH / newH)

            if (dir > 0) {
                pullTargetX = baseX - (newW - baseW) / 2
                pullTargetY = baseY + movePx
                pullTargetW = newW
                pullTargetH = newH
            } else {
                pullTargetX = baseX - (newW - baseW) / 2
                pullTargetY = baseY - movePx - stretchPx
                pullTargetW = newW
                pullTargetH = newH
            }
        } else {
            const gap = dir > 0 ? nr.x - (baseX + baseW) : baseX - (nr.x + nr.w)

            const totalPull = t * (gap + nr.w * 0.5) * strength

            const movePx = totalPull * (1 - bal) * moveScale
            const stretchPx = totalPull * bal * stretchScale

            const newW = baseW + stretchPx
            const newH = baseH * (baseW / newW)

            if (dir > 0) {
                pullTargetX = baseX + movePx
                pullTargetY = baseY - (newH - baseH) / 2
                pullTargetW = newW
                pullTargetH = newH
            } else {
                pullTargetX = baseX - movePx - stretchPx
                pullTargetY = baseY - (newH - baseH) / 2
                pullTargetW = newW
                pullTargetH = newH
            }
        }

        startPullLoop()
    }

    // ================================================================
    // EVENT HANDLERS
    // ================================================================
    function cardFrom(target: EventTarget | null): HTMLElement | null {
        if (!target || !(target instanceof HTMLElement)) return null
        const card = target.closest("[data-link-card]") as HTMLElement | null
        if (card && container.contains(card)) return card
        return null
    }

    const onMouseOver = (e: MouseEvent) => {
        const card = cardFrom(e.target)
        if (card) moveTo(card)
    }
    const onMouseMove = (e: MouseEvent) => handlePull(e)
    const onMouseLeave = () => hide()
    const onFocusIn = (e: FocusEvent) => {
        const card = cardFrom(e.target)
        if (card) moveTo(card)
    }
    const onFocusOut = (e: FocusEvent) => {
        const related = e.relatedTarget as HTMLElement | null
        if (!related || !container.contains(related)) hide()
    }

    container.addEventListener("mouseover", onMouseOver)
    container.addEventListener("mousemove", onMouseMove)
    container.addEventListener("mouseleave", onMouseLeave)
    container.addEventListener("focusin", onFocusIn)
    container.addEventListener("focusout", onFocusOut)

    // ================================================================
    // EXTERNAL
    // ================================================================
    const onResize = () => {
        if (currentCard && showing) moveTo(currentCard)
    }
    window.addEventListener("resize", onResize)

    const onConfig = () => {
        skin()
        setTransition(true)
        if (currentCard && showing) {
            const prev = currentCard
            currentCard = null
            moveTo(prev)
        }
    }
    const hl = ((window as any).__highlightListeners =
        (window as any).__highlightListeners || new Set())
    hl.add(onConfig)

    const ts = (window as any).__themeState
    if (ts?.listeners) ts.listeners.add(onConfig)
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", onConfig)

    // ================================================================
    // CLEANUP
    // ================================================================
    return () => {
        container.removeEventListener("mouseover", onMouseOver)
        container.removeEventListener("mousemove", onMouseMove)
        container.removeEventListener("mouseleave", onMouseLeave)
        container.removeEventListener("focusin", onFocusIn)
        container.removeEventListener("focusout", onFocusOut)
        window.removeEventListener("resize", onResize)
        mq.removeEventListener("change", onConfig)
        hl.delete(onConfig)
        if (ts?.listeners) ts.listeners.delete(onConfig)
        clearTimeout(slideTimer)
        stopPullLoop()
        if (scaleAnim) scaleAnim.cancel()
        pill.remove()
    }
}

// ============================================
// OVERRIDE
// ============================================

export function SectionHighlight(Component: ComponentType): ComponentType {
    return function WithHighlight(props: any) {
        const ref = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const el = ref.current?.firstElementChild as HTMLElement | null
            if (!el) return
            return setup(el)
        }, [])

        return (
            <div ref={ref} style={{ width: "100%", height: "100%" }}>
                <Component {...props} />
            </div>
        )
    }
}
