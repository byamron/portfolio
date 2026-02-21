import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useCallback } from "react"

/**
 * GlassHighlightControls - Simplified glass property controls
 *
 * Controls:
 * - Fill: Inherits hue from theme, with adjustable saturation & brightness
 * - Inner Glow: Soft inner highlight
 * - Shadow: Traditional x, y, blur, color+opacity
 * - Border: Auto-derived from fill color (glass edge light simulation)
 * - Border Radius: 0-40px
 *
 * Works with GlassHighlight which overlays ON TOP of content.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

// ============================================
// TYPES
// ============================================

interface ConfigState {
    // Shape
    borderRadius: number
    padding: number

    // Fill (HSB-based, hue from theme)
    fillSaturation: number // 0-1
    fillBrightness: number // 0-1
    fillOpacity: number // 0-1

    // Inner Glow
    innerGlowIntensity: number // 0-1

    // Shadow (traditional)
    shadowX: number
    shadowY: number
    shadowBlur: number
    shadowOpacity: number
    shadowColor: string

    // Border (auto-derived from fill)
    borderWidth: number

    // Blur
    surfaceBlur: number

    // Animation
    duration: number
    fadeDuration: number
    easing: string
    stretchAmount: number
    squashAmount: number
    recoveryDuration: number
    overshoot: number

    // Pull (simplified)
    pullStrength: number
    edgeZone: number // How much of edge responds (0.3 = outer 30%)
    pullLerp: number // Smoothing speed
}

// Simplified UI state
interface GlassUIState {
    fillSaturation: number // 0-1
    fillBrightness: number // 0-1
    fillOpacity: number // 0-1
    innerGlow: number // 0-1
    shadowX: number // -20 to 20
    shadowY: number // -20 to 20
    shadowBlur: number // 0 to 40
    shadowOpacity: number // 0-1
    borderWidth: number // 0 to 2
    borderRadius: number // 0 to 40
    surfaceBlur: number // 0 to 4
}

// ============================================
// DEFAULTS
// ============================================

const defaultConfig: ConfigState = {
    // Shape
    borderRadius: 16,
    padding: 0,

    // Fill
    fillSaturation: 0.1,
    fillBrightness: 0.45,
    fillOpacity: 0.05,

    // Inner Glow
    innerGlowIntensity: 0.8,

    // Shadow
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowOpacity: 0,
    shadowColor: "#000000",

    // Border
    borderWidth: 0.1,

    // Blur
    surfaceBlur: 1,

    // Animation
    duration: 200,
    fadeDuration: 200,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    stretchAmount: 0.05,
    squashAmount: 0.01,
    recoveryDuration: 150,
    overshoot: 0.05,

    // Pull (edge-only)
    pullStrength: 0.15,
    edgeZone: 0.2,
    pullLerp: 0.12,
}

const defaultUIState: GlassUIState = {
    fillSaturation: 0.1,
    fillBrightness: 0.45,
    fillOpacity: 0.05,
    innerGlow: 0.8,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowOpacity: 0,
    borderWidth: 0.1,
    borderRadius: 16,
    surfaceBlur: 1,
}

// Note: Inner glow default 0.2 produces the box-shadow values in the config above

// ============================================
// COLOR HELPERS
// ============================================

/**
 * Get the current theme's background color from Theme_Overrides
 * Returns the resolved color value (hex or rgb)
 */
const getThemeBackgroundColor = (): string | null => {
    if (typeof window === "undefined") return null
    if (typeof document === "undefined") return null

    const themeState = (window as any).__themeState
    if (!themeState) return null

    const currentTheme = themeState.currentTheme || "table"

    // Theme token mapping (matches Theme_Overrides.tsx)
    const themeTokens: Record<string, string> = {
        table: "--token-6e011c17-43ed-4fd8-a339-24b221b0d151",
        portrait: "--token-46108f2b-176a-46e4-9b43-86659a7e84fe",
        sky: "--token-3d2aa91d-45c7-47c2-9222-441a0888f22b",
        pizza: "--token-318c44a5-6682-4b5e-a766-7ae56da308c4",
    }

    const tokenVar = themeTokens[currentTheme]
    if (!tokenVar) return null

    // Try multiple elements where Framer might define CSS variables
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

/**
 * Parse a color string to RGB
 */
const parseColorToRGB = (
    color: string
): { r: number; g: number; b: number } | null => {
    if (!color) return null

    // Handle hex
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

    // Handle rgb/rgba
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

/**
 * Convert RGB to HSL
 */
const rgbToHSL = (
    r: number,
    g: number,
    b: number
): { h: number; s: number; l: number } => {
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

/**
 * Convert HSL to RGB
 */
const hslToRGB = (
    h: number,
    s: number,
    l: number
): { r: number; g: number; b: number } => {
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

/**
 * Get fill color: inherit hue from theme, apply custom saturation/brightness
 */
const getFillColor = (
    saturation: number,
    brightness: number,
    opacity: number
): string => {
    const themeColor = getThemeBackgroundColor()
    const rgb = themeColor ? parseColorToRGB(themeColor) : null

    if (rgb) {
        // Get hue from theme color
        const hsl = rgbToHSL(rgb.r, rgb.g, rgb.b)
        // Apply custom saturation and brightness (lightness)
        const newRgb = hslToRGB(hsl.h, saturation, brightness)
        return `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${opacity})`
    }

    // Fallback to neutral gray
    const gray = Math.round(brightness * 255)
    return `rgba(${gray}, ${gray}, ${gray}, ${opacity})`
}

/**
 * Get border color based on fill - simulates glass edge catching light
 * Subtle gradient: top slightly brighter, bottom slightly darker
 */
const getBorderColors = (
    saturation: number,
    brightness: number,
    borderWidth: number
): {
    top: string
    side: string
    bottom: string
} => {
    // Subtle glass edge light simulation
    // Top 1.2x, sides 1.0x, bottom 0.8x for natural look
    const baseIntensity = 0.12 + brightness * 0.15

    return {
        top: `rgba(255, 255, 255, ${baseIntensity * 1.2})`,
        side: `rgba(255, 255, 255, ${baseIntensity})`,
        bottom: `rgba(255, 255, 255, ${baseIntensity * 0.8})`,
    }
}

// ============================================
// BUILD CSS
// ============================================

const hexToRgba = (hex: string, opacity: number): string => {
    const h = hex.replace("#", "")
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

const buildHighlightCSS = (
    c: ConfigState,
    ui: GlassUIState
): Record<string, string> => {
    // Get fill color (inherits hue from theme)
    const fillColor = getFillColor(
        ui.fillSaturation,
        ui.fillBrightness,
        ui.fillOpacity
    )

    // Build background with subtle radial highlight
    const highlightIntensity = 0.15 + ui.fillBrightness * 0.1
    const background = `
        radial-gradient(ellipse 150% 120% at 50% 10%,
            rgba(255, 255, 255, ${highlightIntensity}) 0%,
            rgba(255, 255, 255, ${highlightIntensity * 0.4}) 50%,
            rgba(255, 255, 255, ${highlightIntensity * 0.1}) 85%,
            transparent 120%),
        ${fillColor}
    `

    // Build shadows array
    const shadows: string[] = []

    // Main drop shadow
    if (ui.shadowOpacity > 0) {
        shadows.push(
            `${ui.shadowX}px ${ui.shadowY}px ${ui.shadowBlur}px ${hexToRgba(c.shadowColor, ui.shadowOpacity)}`
        )
    }

    // Inner glow (top light, bottom shadow for depth)
    if (ui.innerGlow > 0) {
        shadows.push(
            `inset 0 1px 0 0 rgba(255, 255, 255, ${ui.innerGlow * 0.4})`,
            `inset 0 -1px 0 0 rgba(0, 0, 0, ${ui.innerGlow * 0.15})`
        )
    }

    // Border simulation via inset shadows (glass edge light)
    if (ui.borderWidth > 0) {
        const borderColors = getBorderColors(
            ui.fillSaturation,
            ui.fillBrightness,
            ui.borderWidth
        )
        shadows.push(
            `inset 0 ${ui.borderWidth}px 0 0 ${borderColors.top}`,
            `inset ${ui.borderWidth}px 0 0 0 ${borderColors.side}`,
            `inset -${ui.borderWidth}px 0 0 0 ${borderColors.side}`,
            `inset 0 -${ui.borderWidth}px 0 0 ${borderColors.bottom}`
        )
    }

    return {
        background,
        border: ui.borderWidth > 0 ? `${ui.borderWidth}px solid transparent` : "none",
        borderRadius: `${ui.borderRadius}px`,
        backdropFilter:
            ui.surfaceBlur > 0
                ? `blur(${ui.surfaceBlur}px) saturate(1.2)`
                : "none",
        webkitBackdropFilter:
            ui.surfaceBlur > 0
                ? `blur(${ui.surfaceBlur}px) saturate(1.2)`
                : "none",
        boxShadow: shadows.length > 0 ? shadows.join(", ") : "none",
    }
}

const generateCodeString = (c: ConfigState, ui: GlassUIState): string => {
    const css = buildHighlightCSS(c, ui)

    return `const HIGHLIGHT_CONFIG = {
    // Shape
    borderRadius: ${ui.borderRadius},
    padding: ${c.padding},

    // Texture (generated CSS)
    background: "${css.background.replace(/\s+/g, " ").trim()}",
    border: "${css.border}",
    backdropFilter: "${css.backdropFilter}",
    boxShadow: "${css.boxShadow}",

    // Animation
    duration: ${c.duration},
    fadeDuration: ${c.fadeDuration},
    easing: "${c.easing}",
    stretchAmount: ${c.stretchAmount},
    squashAmount: ${c.squashAmount},
    recoveryDuration: ${c.recoveryDuration},
    overshoot: ${c.overshoot},

    // Pull (edge-only)
    pullStrength: ${c.pullStrength},
    edgeZone: ${c.edgeZone},
    pullLerp: ${c.pullLerp},
}`
}

// ============================================
// SUBCOMPONENTS
// ============================================

const panelFont: React.CSSProperties = {
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

function Slider({
    label,
    value,
    min,
    max,
    step,
    unit = "",
    onChange,
    description,
}: {
    label: string
    value: number
    min: number
    max: number
    step: number
    unit?: string
    onChange: (v: number) => void
    description?: string
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState("")

    const displayValue =
        step < 1 ? value.toFixed(step < 0.01 ? 3 : 2) : String(Math.round(value))
    const pct = ((value - min) / (max - min)) * 100

    const commitDraft = () => {
        const parsed = parseFloat(draft)
        if (!isNaN(parsed)) {
            onChange(Math.min(max, Math.max(min, parsed)))
        }
        setEditing(false)
    }

    return (
        <div style={{ marginBottom: 16, ...panelFont }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                }}
            >
                <span
                    style={{ fontSize: 11, color: "#ddd", fontWeight: 500 }}
                >
                    {label}
                </span>

                {editing ? (
                    <input
                        type="text"
                        inputMode="decimal"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={commitDraft}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commitDraft()
                            if (e.key === "Escape") setEditing(false)
                        }}
                        style={{
                            width: 52,
                            fontSize: 10,
                            color: "#fff",
                            background: "#2a2a2a",
                            border: "1px solid #3b82f6",
                            borderRadius: 3,
                            padding: "1px 4px",
                            textAlign: "right",
                            outline: "none",
                            fontVariantNumeric: "tabular-nums",
                            ...panelFont,
                        }}
                        autoFocus
                    />
                ) : (
                    <span
                        onClick={() => {
                            setDraft(displayValue)
                            setEditing(true)
                        }}
                        style={{
                            fontSize: 10,
                            color: "#888",
                            fontVariantNumeric: "tabular-nums",
                            cursor: "text",
                            padding: "1px 4px",
                            borderRadius: 3,
                        }}
                    >
                        {displayValue}
                        {unit}
                    </span>
                )}
            </div>
            {description && (
                <div
                    style={{
                        fontSize: 9,
                        color: "#555",
                        marginBottom: 6,
                    }}
                >
                    {description}
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{
                    width: "100%",
                    height: 4,
                    appearance: "none",
                    WebkitAppearance: "none",
                    background: `linear-gradient(to right, #3b82f6 ${pct}%, #333 ${pct}%)`,
                    borderRadius: 2,
                    cursor: "pointer",
                    outline: "none",
                }}
            />
        </div>
    )
}

function SectionLabel({ text }: { text: string }) {
    return (
        <div
            style={{
                fontSize: 9,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
                marginTop: 8,
                ...panelFont,
            }}
        >
            {text}
        </div>
    )
}

// ============================================
// MAIN COMPONENT
// ============================================

interface Props {
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
    startCollapsed: boolean
}

export default function GlassHighlightControls(props: Props) {
    const { position, startCollapsed } = props

    const [collapsed, setCollapsed] = useState(startCollapsed)
    const [tab, setTab] = useState<"fill" | "shadow" | "motion">("fill")
    const [config, setConfig] = useState<ConfigState>(defaultConfig)
    const [uiState, setUIState] = useState<GlassUIState>(defaultUIState)
    const [copied, setCopied] = useState(false)

    // Push config to global state
    const pushConfig = useCallback(
        (c: ConfigState, ui: GlassUIState) => {
            if (typeof window === "undefined") return

            const css = buildHighlightCSS(c, ui)

            ;(window as any).__highlightConfig = {
                ...css,
                borderRadius: ui.borderRadius,
                padding: c.padding,
                fillOpacity: ui.fillOpacity,
                fillSaturation: ui.fillSaturation,
                fillBrightness: ui.fillBrightness,
                // Signal to GlassHighlight to use these HSB values
                useThemeColor: true,
                duration: c.duration,
                fadeDuration: c.fadeDuration,
                easing: c.easing,
                stretchAmount: c.stretchAmount,
                squashAmount: c.squashAmount,
                recoveryDuration: c.recoveryDuration,
                overshoot: c.overshoot,
                pullStrength: c.pullStrength,
                edgeZone: c.edgeZone,
                pullLerp: c.pullLerp,
            }

            const listeners = (window as any).__highlightListeners
            if (listeners) {
                listeners.forEach((fn: () => void) => fn())
            }
        },
        []
    )

    useEffect(() => {
        if (typeof window !== "undefined") {
            ;(window as any).__highlightListeners =
                (window as any).__highlightListeners || new Set()
        }
        pushConfig(defaultConfig, defaultUIState)
    }, [])

    useEffect(() => {
        pushConfig(config, uiState)
    }, [config, uiState, pushConfig])

    // UI state setters
    const setUI = <K extends keyof GlassUIState>(
        key: K,
        value: GlassUIState[K]
    ) => {
        setUIState((prev) => ({ ...prev, [key]: value }))
    }

    // Config setters for animation tab
    const setConf = <K extends keyof ConfigState>(
        key: K,
        value: ConfigState[K]
    ) => {
        setConfig((prev) => ({ ...prev, [key]: value }))
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateCodeString(config, uiState))
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (e) {
            console.error("Copy failed:", e)
        }
    }

    // Position
    const pos: React.CSSProperties = {
        position: "fixed",
        zIndex: 99999,
        ...(position.includes("top") ? { top: 16 } : { bottom: 16 }),
        ...(position.includes("left") ? { left: 16 } : { right: 16 }),
    }

    if (collapsed) {
        return (
            <div style={pos}>
                <button
                    onClick={() => setCollapsed(false)}
                    style={{
                        background: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: 10,
                        padding: "8px 14px",
                        color: "#ddd",
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        ...panelFont,
                    }}
                >
                    Glass
                </button>
            </div>
        )
    }

    const tabStyle = (t: typeof tab): React.CSSProperties => ({
        flex: 1,
        padding: "8px 0",
        background: tab === t ? "#2a2a2a" : "transparent",
        border: "none",
        borderBottom: tab === t ? "2px solid #3b82f6" : "2px solid transparent",
        color: tab === t ? "#fff" : "#666",
        fontSize: 11,
        cursor: "pointer",
        transition: "all 120ms ease",
        ...panelFont,
    })

    return (
        <div style={pos}>
            <div
                style={{
                    width: 260,
                    background: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                    ...panelFont,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderBottom: "1px solid #2a2a2a",
                    }}
                >
                    <span
                        style={{ color: "#eee", fontSize: 12, fontWeight: 600 }}
                    >
                        Glass Effect
                    </span>
                    <button
                        onClick={() => setCollapsed(true)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#555",
                            cursor: "pointer",
                            fontSize: 18,
                            padding: 0,
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex" }}>
                    <button style={tabStyle("fill")} onClick={() => setTab("fill")}>
                        Fill
                    </button>
                    <button style={tabStyle("shadow")} onClick={() => setTab("shadow")}>
                        Shadow
                    </button>
                    <button style={tabStyle("motion")} onClick={() => setTab("motion")}>
                        Motion
                    </button>
                </div>

                {/* Content */}
                <div
                    style={{
                        padding: "14px 14px",
                        maxHeight: 400,
                        overflowY: "auto",
                    }}
                >
                    {/* ===== FILL TAB ===== */}
                    {tab === "fill" && (
                        <>
                            <SectionLabel text="Color (Hue from Theme)" />
                            <Slider
                                label="Saturation"
                                value={uiState.fillSaturation}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(v) => setUI("fillSaturation", v)}
                                description="Color intensity (0 = gray, 1 = vivid)"
                            />
                            <Slider
                                label="Brightness"
                                value={uiState.fillBrightness}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(v) => setUI("fillBrightness", v)}
                                description="Light/dark (0 = black, 1 = white)"
                            />
                            <Slider
                                label="Opacity"
                                value={uiState.fillOpacity}
                                min={0}
                                max={0.5}
                                step={0.01}
                                onChange={(v) => setUI("fillOpacity", v)}
                            />

                            <SectionLabel text="Surface" />
                            <Slider
                                label="Blur"
                                value={uiState.surfaceBlur}
                                min={0}
                                max={4}
                                step={0.1}
                                unit="px"
                                onChange={(v) => setUI("surfaceBlur", v)}
                                description="Backdrop blur amount"
                            />
                            <Slider
                                label="Inner Glow"
                                value={uiState.innerGlow}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(v) => setUI("innerGlow", v)}
                                description="Soft inner highlight"
                            />

                            <SectionLabel text="Edge" />
                            <Slider
                                label="Border Width"
                                value={uiState.borderWidth}
                                min={0}
                                max={2}
                                step={0.1}
                                unit="px"
                                onChange={(v) => setUI("borderWidth", v)}
                                description="Glass edge (auto-colored from fill)"
                            />
                            <Slider
                                label="Border Radius"
                                value={uiState.borderRadius}
                                min={0}
                                max={40}
                                step={1}
                                unit="px"
                                onChange={(v) => setUI("borderRadius", v)}
                            />
                        </>
                    )}

                    {/* ===== SHADOW TAB ===== */}
                    {tab === "shadow" && (
                        <>
                            <SectionLabel text="Drop Shadow" />
                            <Slider
                                label="X Offset"
                                value={uiState.shadowX}
                                min={-20}
                                max={20}
                                step={1}
                                unit="px"
                                onChange={(v) => setUI("shadowX", v)}
                            />
                            <Slider
                                label="Y Offset"
                                value={uiState.shadowY}
                                min={-20}
                                max={20}
                                step={1}
                                unit="px"
                                onChange={(v) => setUI("shadowY", v)}
                            />
                            <Slider
                                label="Blur"
                                value={uiState.shadowBlur}
                                min={0}
                                max={40}
                                step={1}
                                unit="px"
                                onChange={(v) => setUI("shadowBlur", v)}
                            />
                            <Slider
                                label="Opacity"
                                value={uiState.shadowOpacity}
                                min={0}
                                max={0.3}
                                step={0.01}
                                onChange={(v) => setUI("shadowOpacity", v)}
                            />
                        </>
                    )}

                    {/* ===== MOTION TAB ===== */}
                    {tab === "motion" && (
                        <>
                            <SectionLabel text="Timing" />
                            <Slider
                                label="Duration"
                                value={config.duration}
                                min={60}
                                max={400}
                                step={10}
                                unit="ms"
                                onChange={(v) => setConf("duration", v)}
                            />
                            <Slider
                                label="Fade"
                                value={config.fadeDuration}
                                min={0}
                                max={300}
                                step={10}
                                unit="ms"
                                onChange={(v) => setConf("fadeDuration", v)}
                            />

                            <SectionLabel text="Deformation" />
                            <Slider
                                label="Stretch"
                                value={config.stretchAmount}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(v) => setConf("stretchAmount", v)}
                                description="Deformation in direction of movement"
                            />
                            <Slider
                                label="Squash"
                                value={config.squashAmount}
                                min={0}
                                max={0.5}
                                step={0.01}
                                onChange={(v) => setConf("squashAmount", v)}
                            />
                            <Slider
                                label="Bounce"
                                value={config.overshoot}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(v) => setConf("overshoot", v)}
                                description="Overshoot on recovery (0 = none)"
                            />

                            <SectionLabel text="Edge Pull" />
                            <Slider
                                label="Strength"
                                value={config.pullStrength}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(v) => setConf("pullStrength", v)}
                                description="How far pill trails cursor at edges"
                            />
                            <Slider
                                label="Edge Zone"
                                value={config.edgeZone}
                                min={0.1}
                                max={1}
                                step={0.05}
                                onChange={(v) => setConf("edgeZone", v)}
                                description="Responsive area (1 = entire card)"
                            />
                        </>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "8px 14px 12px",
                        borderTop: "1px solid #2a2a2a",
                    }}
                >
                    <button
                        onClick={handleCopy}
                        style={{
                            width: "100%",
                            padding: "8px 0",
                            background: copied ? "#22c55e" : "#3b82f6",
                            border: "none",
                            borderRadius: 8,
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 150ms ease",
                            ...panelFont,
                        }}
                    >
                        {copied ? "Copied!" : "Copy Config"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================
// PROPERTY CONTROLS
// ============================================

addPropertyControls(GlassHighlightControls, {
    position: {
        type: ControlType.Enum,
        title: "Position",
        options: ["top-left", "top-right", "bottom-left", "bottom-right"],
        optionTitles: ["Top Left", "Top Right", "Bottom Left", "Bottom Right"],
        defaultValue: "bottom-right",
    },
    startCollapsed: {
        type: ControlType.Boolean,
        title: "Start Collapsed",
        defaultValue: false,
    },
})
