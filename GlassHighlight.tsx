import type { ComponentType } from "react"
import { useEffect, useRef } from "react"

/**
 * GlassHighlight Override
 *
 * Glass pill that slides between [data-link-card] elements with subtle
 * physical responses. Prioritizes usability while adding gentle material feel.
 *
 * Philosophy: Simple, centered by default, with subtle physical responses
 * only at the edges. The highlight should feel alive but not distracting.
 */

// ============================================
// CONFIG
// ============================================

const DEFAULTS = {
    // Shape
    borderRadius: 16,
    padding: 0,

    // Texture
    background:
        "radial-gradient(ellipse 150% 120% at 50% 10%, rgba(255, 255, 255, 0.19) 0%, rgba(255, 255, 255, 0.076) 50%, rgba(255, 255, 255, 0.019) 85%, transparent 120%), rgba(133, 88, 71, 0.05)",
    border: "0.1px solid transparent",
    backdropFilter: "blur(1px) saturate(1.2)",
    boxShadow:
        "inset 0 1px 0 0 rgba(255, 255, 255, 0.32), inset 0 -1px 0 0 rgba(0, 0, 0, 0.12), inset 0 0.1px 0 0 rgba(255, 255, 255, 0.216), inset 0.1px 0 0 0 rgba(255, 255, 255, 0.18), inset -0.1px 0 0 0 rgba(255, 255, 255, 0.18), inset 0 -0.1px 0 0 rgba(255, 255, 255, 0.144)",

    // Theme-aware fill
    fillColor: null as string | null,
    fillOpacity: 0.05,
    useThemeColor: true,

    // Animation
    duration: 200,
    fadeDuration: 200,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    stretchAmount: 0.05,
    squashAmount: 0.01,
    recoveryDuration: 150,
    overshoot: 0.05,

    // Pull - gravitational effect at edges
    pullStrength: 0.15,
    edgeZone: 0.2,
    pullLerp: 0.12,
}

function cfg() {
    const ext =
        typeof window !== "undefined" && (window as any).__highlightConfig
    return ext ? { ...DEFAULTS, ...ext } : DEFAULTS
}

// ============================================
// THEME COLOR HELPERS
// ============================================

function getThemeBackgroundColor(): string | null {
    if (typeof window === "undefined") return null
    if (typeof document === "undefined") return null

    const themeState = (window as any).__themeState
    if (!themeState) return null

    const currentTheme = themeState.currentTheme || "table"

    const themeTokens: Record<string, string> = {
        table: "--token-6e011c17-43ed-4fd8-a339-24b221b0d151",
        portrait: "--token-46108f2b-176a-46e4-9b43-86659a7e84fe",
        sky: "--token-3d2aa91d-45c7-47c2-9222-441a0888f22b",
        pizza: "--token-318c44a5-6682-4b5e-a766-7ae56da308c4",
    }

    const tokenVar = themeTokens[currentTheme]
    if (!tokenVar) return null

    const elementsToCheck = [
        document.body,
        document.documentElement,
        document.querySelector("[data-framer-name]"),
        document.querySelector(".framer-page-root"),
        document.querySelector("main"),
    ].filter(Boolean) as Element[]

    for (const el of elementsToCheck) {
        const value = getComputedStyle(el).getPropertyValue(tokenVar).trim()
        if (value && value !== "") {
            return value
        }
    }

    return null
}

function parseColorToRGB(
    color: string
): { r: number; g: number; b: number } | null {
    if (!color) return null

    if (color.startsWith("#")) {
        const h = color.slice(1)
        if (h.length === 3) {
            return {
                r: parseInt(h[0] + h[0], 16),
                g: parseInt(h[1] + h[1], 16),
                b: parseInt(h[2] + h[2], 16),
            }
        }
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
        }
    }

    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
        }
    }

    return null
}

function rgbToHSL(
    r: number,
    g: number,
    b: number
): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6
                break
            case g:
                h = ((b - r) / d + 2) / 6
                break
            case b:
                h = ((r - g) / d + 4) / 6
                break
        }
    }

    return { h: h * 360, s, l }
}

function hslToRGB(
    h: number,
    s: number,
    l: number
): { r: number; g: number; b: number } {
    h /= 360
    let r, g, b

    if (s === 0) {
        r = g = b = l
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    }
}

function getFillColor(
    themeColor: string | null,
    saturation: number,
    brightness: number,
    opacity: number
): string {
    const rgb = themeColor ? parseColorToRGB(themeColor) : null

    if (rgb) {
        const hsl = rgbToHSL(rgb.r, rgb.g, rgb.b)
        const newRgb = hslToRGB(hsl.h, saturation, brightness)
        return `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${opacity})`
    }

    const gray = Math.round(brightness * 255)
    return `rgba(${gray}, ${gray}, ${gray}, ${opacity})`
}

// ============================================
// LERP
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
    pill.setAttribute("data-glass-highlight", "true")
    Object.assign(pill.style, {
        position: "absolute",
        zIndex: "10",
        opacity: "0",
        transformOrigin: "center center",
        pointerEvents: "none",
    })

    if (getComputedStyle(container).position === "static")
        container.style.position = "relative"
    container.insertBefore(pill, container.firstChild)

    // ---- Appearance ----
    function skin() {
        const c = cfg()
        const themeColor = getThemeBackgroundColor()
        const shouldUseTheme = c.useThemeColor !== false && themeColor

        let background = c.background

        if (shouldUseTheme) {
            const fillOpacity = c.fillOpacity || 0.05
            const fillSaturation = c.fillSaturation ?? 0.1
            const fillBrightness = c.fillBrightness ?? 0.5

            const themeFill = getFillColor(
                themeColor,
                fillSaturation,
                fillBrightness,
                fillOpacity
            )

            const highlightIntensity = 0.15 + fillBrightness * 0.1
            background = `
                radial-gradient(ellipse 150% 120% at 50% 10%,
                    rgba(255, 255, 255, ${highlightIntensity}) 0%,
                    rgba(255, 255, 255, ${highlightIntensity * 0.4}) 50%,
                    rgba(255, 255, 255, ${highlightIntensity * 0.1}) 85%,
                    transparent 120%),
                ${themeFill}
            `
        }

        pill.style.background = background
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
    let baseX = 0, baseY = 0, baseW = 0, baseH = 0
    let prevBaseX = 0, prevBaseY = 0
    let sliding = false
    let slideTimer = 0
    let scaleAnim: Animation | null = null

    // Pull state - lerp loop animates position AND size
    let pulling = false
    let pullTargetX = 0, pullTargetY = 0, pullTargetW = 0, pullTargetH = 0
    let pullCurrentX = 0, pullCurrentY = 0, pullCurrentW = 0, pullCurrentH = 0
    let pullActive = false
    let pullRafId = 0

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
    // Smoothly animates position AND size toward target.
    // Creates natural inertia - accelerates into pull, decelerates out.
    // ================================================================
    function pullLerpTick() {
        if (!pullActive) return

        const c = cfg()
        const speed = c.pullLerp || 0.15

        pullCurrentX = lerp(pullCurrentX, pullTargetX, speed)
        pullCurrentY = lerp(pullCurrentY, pullTargetY, speed)
        pullCurrentW = lerp(pullCurrentW, pullTargetW, speed)
        pullCurrentH = lerp(pullCurrentH, pullTargetH, speed)

        pill.style.transform = `translate(${pullCurrentX}px, ${pullCurrentY}px)`
        pill.style.width = pullCurrentW + "px"
        pill.style.height = pullCurrentH + "px"

        // Check if settled
        const dx = Math.abs(pullCurrentX - pullTargetX)
        const dy = Math.abs(pullCurrentY - pullTargetY)
        const dw = Math.abs(pullCurrentW - pullTargetW)
        const dh = Math.abs(pullCurrentH - pullTargetH)

        if (dx < 0.3 && dy < 0.3 && dw < 0.3 && dh < 0.3) {
            // Snap to exact target
            pill.style.transform = `translate(${pullTargetX}px, ${pullTargetY}px)`
            pill.style.width = pullTargetW + "px"
            pill.style.height = pullTargetH + "px"
            pullCurrentX = pullTargetX
            pullCurrentY = pullTargetY
            pullCurrentW = pullTargetW
            pullCurrentH = pullTargetH

            // If back at base position, stop pulling
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

        // Stop any active pull
        if (pulling) {
            pulling = false
            stopPullLoop()
        }

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
            // First appearance - instant placement, no animation
            pill.style.transition = "none"
            pill.style.transform = `translate(${r.x}px, ${r.y}px)`
            pill.style.width = r.w + "px"
            pill.style.height = r.h + "px"
            void pill.offsetTop
            setTransition(true)
            pill.style.opacity = "1"

            // Initialize prev position to current (no stretch on first show)
            prevBaseX = r.x
            prevBaseY = r.y
        } else {
            // Transition to new card
            const dx = r.x - baseX
            const dy = r.y - baseY
            const dist = Math.sqrt(dx * dx + dy * dy)

            // Determine easing based on bounce setting
            // Bounce creates overshoot in the position transition itself
            let transitionEasing = c.easing
            if (c.overshoot > 0 && dist > 5) {
                // Overshoot easing - the second control point > 1 creates bounce
                transitionEasing = `cubic-bezier(0.34, ${(1 + c.overshoot).toFixed(2)}, 0.64, 1)`
            }

            setTransition(true, transitionEasing)
            pill.style.transform = `translate(${r.x}px, ${r.y}px)`
            pill.style.width = r.w + "px"
            pill.style.height = r.h + "px"

            // Apply stretch/squash deformation animation if configured
            if ((c.stretchAmount > 0 || c.squashAmount > 0) && dist > 5) {
                const f = Math.min(dist / 150, 1) // Normalize by distance
                const hr = Math.abs(dx) / dist // Horizontal ratio
                const vr = Math.abs(dy) / dist // Vertical ratio

                // Calculate stretch in direction of movement, squash perpendicular
                const stretchX = 1 + c.stretchAmount * f * hr
                const stretchY = 1 + c.stretchAmount * f * vr
                const squashX = 1 - c.squashAmount * f * vr
                const squashY = 1 - c.squashAmount * f * hr

                const peakSx = stretchX * squashX
                const peakSy = stretchY * squashY

                // Animate: start normal -> peak deformation -> back to normal
                // This creates the "liquid" stretch effect during movement
                scaleAnim = pill.animate(
                    [
                        { scale: "1 1", offset: 0 },
                        { scale: `${peakSx} ${peakSy}`, offset: 0.3 },
                        { scale: "1 1", offset: 1 },
                    ],
                    {
                        duration: c.duration + c.recoveryDuration,
                        easing: "ease-out",
                    }
                )
                scaleAnim.onfinish = () => {
                    scaleAnim = null
                }
            }

            // Update prev position for next transition
            prevBaseX = baseX
            prevBaseY = baseY
        }

        showing = true
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
        stopPullLoop()
        sliding = false
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
    // When cursor moves toward an edge, the highlight stretches and
    // shifts in that direction, like a fluid material being pulled.
    //
    // Physics:
    // - edgeZone: how much of the card edge responds (0.2 = outer 20%)
    // - pullStrength: overall intensity of the effect
    // - The highlight both MOVES (trailing edge shifts) and STRETCHES
    //   (leading edge extends), preserving volume like a liquid
    // ================================================================
    function handlePull(e: MouseEvent) {
        if (!showing || !currentCard || sliding) return

        const c = cfg()
        if (!c.pullStrength || c.pullStrength <= 0) return

        const vert = isVertical(getCards())
        const cr = currentCard.getBoundingClientRect()

        // Cursor position as ratio (0 to 1)
        const ratio = vert
            ? (e.clientY - cr.top) / cr.height
            : (e.clientX - cr.left) / cr.width

        const edgeZone = c.edgeZone || 0.2
        let t = 0
        let dir = 0

        // Check if cursor is in the edge zones
        if (ratio > 1 - edgeZone) {
            // Near bottom/right edge
            dir = 1
            t = (ratio - (1 - edgeZone)) / edgeZone
        } else if (ratio < edgeZone) {
            // Near top/left edge
            dir = -1
            t = (edgeZone - ratio) / edgeZone
        }

        // Clamp and apply curve for natural feel
        t = Math.pow(Math.max(0, Math.min(1, t)), 1.5)

        if (t < 0.01) {
            // Cursor in center - return to base position
            pullTargetX = baseX
            pullTargetY = baseY
            pullTargetW = baseW
            pullTargetH = baseH

            if (pulling) {
                startPullLoop()
            }
            return
        }

        // Enter pull mode
        if (!pulling) {
            pulling = true
            setTransition(false)
            pullCurrentX = baseX
            pullCurrentY = baseY
            pullCurrentW = baseW
            pullCurrentH = baseH
        }

        const strength = c.pullStrength

        // Calculate stretch and move amounts
        // At strength 1.0: up to 25% stretch, 15% move
        const maxStretch = (vert ? baseH : baseW) * 0.25 * strength
        const maxMove = (vert ? baseH : baseW) * 0.15 * strength

        const stretchPx = t * maxStretch
        const movePx = t * maxMove

        if (vert) {
            // Vertical layout: stretch height, preserve volume by adjusting width
            const newH = baseH + stretchPx
            const newW = baseW * (baseH / newH) // Volume preservation

            if (dir > 0) {
                // Pull down: move down, stretch bottom edge
                pullTargetX = baseX - (newW - baseW) / 2
                pullTargetY = baseY + movePx
                pullTargetW = newW
                pullTargetH = newH
            } else {
                // Pull up: move up, stretch top edge
                pullTargetX = baseX - (newW - baseW) / 2
                pullTargetY = baseY - movePx - stretchPx
                pullTargetW = newW
                pullTargetH = newH
            }
        } else {
            // Horizontal layout: stretch width, preserve volume
            const newW = baseW + stretchPx
            const newH = baseH * (baseW / newW)

            if (dir > 0) {
                // Pull right
                pullTargetX = baseX + movePx
                pullTargetY = baseY - (newH - baseH) / 2
                pullTargetW = newW
                pullTargetH = newH
            } else {
                // Pull left
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

export function GlassHighlight(Component: ComponentType): ComponentType {
    return function WithGlassHighlight(props: any) {
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
