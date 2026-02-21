import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useCallback, useRef } from "react"

/**
 * HighlightControls - Interactive dev panel for SectionHighlight
 *
 * Drop on page, publish, tweak glass pill in browser.
 * Click "Copy Config" to paste values into SectionHighlight.
 * Remove component for production.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

// ============================================
// TYPES
// ============================================

interface FramerToken {
    variable: string
    value: string
    label: string
}

interface ConfigState {
    // Shape
    borderRadius: number
    padding: number
    borderWidth: number

    // Texture
    fillMode: "custom" | string
    fillColor: string
    fillOpacity: number
    borderMode: "custom" | string
    borderColor: string
    borderOpacity: number
    lightAngle: number
    highlightIntensity: number
    highlightWidth: number
    innerGlow: number
    surfaceBlur: number
    shadowColor: string
    shadowOpacity: number
    shadowBlur: number
    shadowY: number
    shadowSpread: number

    // Animation
    duration: number
    fadeDuration: number
    easing: string
    stretchAmount: number
    squashAmount: number
    recoveryDuration: number
    overshoot: number

    // Pull
    pullStrength: number
    pullRange: number
    pullCurve: number
    pullEasing: string
    pullBalance: number // 0 = all translate, 1 = all stretch
}

// ============================================
// DEFAULTS
// ============================================

const defaultConfig: ConfigState = {
    borderRadius: 16,
    padding: 0,
    borderWidth: 0,

    fillMode: "custom",
    fillColor: "#000000",
    fillOpacity: 0.04,
    borderMode: "custom",
    borderColor: "#000000",
    borderOpacity: 0.06,
    lightAngle: 180,
    highlightIntensity: 0.15,
    highlightWidth: 85,
    innerGlow: 0.75,
    surfaceBlur: 0,
    shadowColor: "#000000",
    shadowOpacity: 0.01,
    shadowBlur: 8,
    shadowY: 1,
    shadowSpread: 3,

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

// ============================================
// HELPERS
// ============================================

const hexToRgba = (hex: string, opacity: number): string => {
    const h = hex.replace("#", "")
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

const buildColorValue = (
    mode: string,
    hex: string,
    opacity: number
): string => {
    if (mode === "custom") {
        return hexToRgba(hex, opacity)
    }
    // Token mode: use color-mix for opacity with CSS variable
    return `color-mix(in srgb, var(${mode}) ${Math.round(opacity * 100)}%, transparent)`
}

const buildHighlightCSS = (c: ConfigState): Record<string, string> => {
    const fill = buildColorValue(c.fillMode, c.fillColor, c.fillOpacity)
    const border = buildColorValue(c.borderMode, c.borderColor, c.borderOpacity)

    // Glass highlight gradient (light source simulation)
    let background: string
    if (c.highlightIntensity > 0) {
        const hlColor = `rgba(255, 255, 255, ${c.highlightIntensity})`
        const hlMid = `rgba(255, 255, 255, ${c.highlightIntensity * 0.3})`
        background = `linear-gradient(${c.lightAngle}deg, ${hlColor} 0%, ${hlMid} ${c.highlightWidth}%, ${fill} 100%)`
    } else {
        background = fill
    }

    // Box shadow: outer shadow + inner glow
    const shadows: string[] = []
    if (c.shadowOpacity > 0) {
        shadows.push(
            `0 ${c.shadowY}px ${c.shadowBlur}px ${c.shadowSpread}px ${hexToRgba(c.shadowColor, c.shadowOpacity)}`
        )
    }
    if (c.innerGlow > 0) {
        shadows.push(
            `inset 0 0.5px 0 0 rgba(255, 255, 255, ${c.innerGlow})`,
            `inset 0 -0.5px 0 0 rgba(0, 0, 0, ${c.innerGlow * 0.2})`
        )
    }

    return {
        background,
        border: `${c.borderWidth}px solid ${border}`,
        borderRadius: `${c.borderRadius}px`,
        backdropFilter: c.surfaceBlur > 0 ? `blur(${c.surfaceBlur}px)` : "none",
        webkitBackdropFilter:
            c.surfaceBlur > 0 ? `blur(${c.surfaceBlur}px)` : "none",
        boxShadow: shadows.length > 0 ? shadows.join(", ") : "none",
    }
}

const generateCodeString = (c: ConfigState): string => {
    const css = buildHighlightCSS(c)
    const overshootBezier =
        c.overshoot > 0
            ? `cubic-bezier(0.34, ${(1 + c.overshoot * 2).toFixed(2)}, 0.64, 1)`
            : c.easing

    return `const HIGHLIGHT_CONFIG = {
    // Shape
    borderRadius: ${c.borderRadius},
    padding: ${c.padding},

    // Texture (generated CSS)
    background: "${css.background}",
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
    recoveryEasing: "${overshootBezier}",

    // Pull
    pullStrength: ${c.pullStrength},
    pullRange: ${c.pullRange},
    pullCurve: ${c.pullCurve},
    pullEasing: "${c.pullEasing}",
    pullBalance: ${c.pullBalance},
}`
}

// ============================================
// HOOKS
// ============================================

function useFramerTokens(): FramerToken[] {
    const [tokens, setTokens] = useState<FramerToken[]>([])

    useEffect(() => {
        if (typeof window === "undefined") return

        const found: FramerToken[] = []
        const seen = new Set<string>()
        const colorPattern =
            /^#[0-9a-f]{3,8}$|^rgb|^hsl|^oklch|^oklab|^lch|^lab|^color\(/i

        try {
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules as any) {
                        if (!rule.style) continue
                        for (let i = 0; i < rule.style.length; i++) {
                            const prop = rule.style[i]
                            if (!prop.startsWith("--") || seen.has(prop))
                                continue
                            seen.add(prop)

                            const value = getComputedStyle(
                                document.documentElement
                            )
                                .getPropertyValue(prop)
                                .trim()

                            if (colorPattern.test(value)) {
                                // Create a readable label from the variable name
                                const label = prop
                                    .replace(/^--token-/, "")
                                    .replace(/^--/, "")
                                    .slice(0, 12)

                                found.push({ variable: prop, value, label })
                            }
                        }
                    }
                } catch (e) {
                    // Cross-origin stylesheet - skip
                }
            }
        } catch (e) {}

        setTokens(found)
    }, [])

    return tokens
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
}: {
    label: string
    value: number
    min: number
    max: number
    step: number
    unit?: string
    onChange: (v: number) => void
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const displayValue =
        step < 1 ? value.toFixed(step < 0.01 ? 3 : 2) : String(value)
    const pct = ((value - min) / (max - min)) * 100

    const commitDraft = () => {
        const parsed = parseFloat(draft)
        if (!isNaN(parsed)) {
            onChange(Math.min(max, Math.max(min, parsed)))
        }
        setEditing(false)
    }

    return (
        <div style={{ marginBottom: 10, ...panelFont }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 3,
                }}
            >
                <span
                    style={{ fontSize: 10, color: "#999", letterSpacing: 0.2 }}
                >
                    {label}
                </span>

                {editing ? (
                    <input
                        ref={inputRef}
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
                            color: "#ccc",
                            fontVariantNumeric: "tabular-nums",
                            cursor: "text",
                            padding: "1px 4px",
                            borderRadius: 3,
                            transition: "background 100ms ease",
                        }}
                        onMouseEnter={(e) => {
                            ;(e.target as HTMLElement).style.background =
                                "#2a2a2a"
                        }}
                        onMouseLeave={(e) => {
                            ;(e.target as HTMLElement).style.background =
                                "transparent"
                        }}
                    >
                        {displayValue}
                        {unit}
                    </span>
                )}
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{
                    width: "100%",
                    height: 3,
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

function TokenColorInput({
    label,
    mode,
    color,
    tokens,
    onModeChange,
    onColorChange,
}: {
    label: string
    mode: string
    color: string
    tokens: FramerToken[]
    onModeChange: (mode: string) => void
    onColorChange: (hex: string) => void
}) {
    // Resolve current display color
    let displayColor = color
    if (mode !== "custom") {
        const token = tokens.find((t) => t.variable === mode)
        if (token) displayColor = token.value
    }

    return (
        <div style={{ marginBottom: 10, ...panelFont }}>
            <div
                style={{
                    fontSize: 10,
                    color: "#999",
                    marginBottom: 4,
                    letterSpacing: 0.2,
                }}
            >
                {label}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {/* Color swatch / picker (for custom mode) */}
                <div
                    style={{
                        position: "relative",
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        overflow: "hidden",
                        border: "1px solid #444",
                        background: displayColor,
                        flexShrink: 0,
                    }}
                >
                    {mode === "custom" && (
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => onColorChange(e.target.value)}
                            style={{
                                position: "absolute",
                                top: -4,
                                left: -4,
                                width: 36,
                                height: 36,
                                cursor: "pointer",
                                opacity: 0,
                            }}
                        />
                    )}
                </div>

                {/* Dropdown: tokens + custom */}
                <select
                    value={mode}
                    onChange={(e) => onModeChange(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "5px 6px",
                        background: "#2a2a2a",
                        border: "1px solid #444",
                        borderRadius: 5,
                        color: "#ddd",
                        fontSize: 10,
                        cursor: "pointer",
                        outline: "none",
                    }}
                >
                    <option value="custom">Custom {color}</option>
                    {tokens.map((t) => (
                        <option key={t.variable} value={t.variable}>
                            ● {t.label} ({t.value})
                        </option>
                    ))}
                </select>
            </div>
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
                marginBottom: 8,
                marginTop: 6,
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

export default function HighlightControls(props: Props) {
    const { position, startCollapsed } = props

    const [collapsed, setCollapsed] = useState(startCollapsed)
    const [tab, setTab] = useState<"shape" | "texture" | "animation">("shape")
    const [config, setConfig] = useState<ConfigState>(defaultConfig)
    const [copied, setCopied] = useState(false)
    const tokens = useFramerTokens()

    // Push config to global state
    const pushConfig = useCallback((c: ConfigState) => {
        if (typeof window === "undefined") return

        const css = buildHighlightCSS(c)

        ;(window as any).__highlightConfig = {
            ...css,
            borderRadius: c.borderRadius,
            padding: c.padding,
            duration: c.duration,
            fadeDuration: c.fadeDuration,
            easing: c.easing,
            stretchAmount: c.stretchAmount,
            squashAmount: c.squashAmount,
            recoveryDuration: c.recoveryDuration,
            overshoot: c.overshoot,
            pullStrength: c.pullStrength,
            pullRange: c.pullRange,
            pullCurve: c.pullCurve,
            pullEasing: c.pullEasing,
            pullBalance: c.pullBalance,
        }

        // Notify all highlight instances
        const listeners = (window as any).__highlightListeners
        if (listeners) {
            listeners.forEach((fn: () => void) => fn())
        }
    }, [])

    useEffect(() => {
        if (typeof window !== "undefined") {
            ;(window as any).__highlightListeners =
                (window as any).__highlightListeners || new Set()
        }
        pushConfig(config)
    }, [])

    useEffect(() => {
        pushConfig(config)
    }, [config, pushConfig])

    const set = <K extends keyof ConfigState>(
        key: K,
        value: ConfigState[K]
    ) => {
        setConfig((prev) => ({ ...prev, [key]: value }))
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateCodeString(config))
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
                    ✨ Highlight
                </button>
            </div>
        )
    }

    const tabStyle = (t: typeof tab): React.CSSProperties => ({
        flex: 1,
        padding: "7px 0",
        background: tab === t ? "#2a2a2a" : "transparent",
        border: "none",
        borderBottom: tab === t ? "2px solid #3b82f6" : "2px solid transparent",
        color: tab === t ? "#fff" : "#666",
        fontSize: 10,
        cursor: "pointer",
        transition: "all 120ms ease",
        ...panelFont,
    })

    return (
        <div style={pos}>
            <div
                style={{
                    width: 272,
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
                        ✨ Highlight
                    </span>
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                        }}
                    >
                        {tokens.length > 0 && (
                            <span
                                style={{
                                    fontSize: 9,
                                    color: "#3b82f6",
                                    background: "#1e3a5f",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                }}
                            >
                                {tokens.length} tokens
                            </span>
                        )}
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
                </div>

                {/* Tabs */}
                <div style={{ display: "flex" }}>
                    <button
                        style={tabStyle("shape")}
                        onClick={() => setTab("shape")}
                    >
                        Shape
                    </button>
                    <button
                        style={tabStyle("texture")}
                        onClick={() => setTab("texture")}
                    >
                        Texture
                    </button>
                    <button
                        style={tabStyle("animation")}
                        onClick={() => setTab("animation")}
                    >
                        Animation
                    </button>
                </div>

                {/* Content */}
                <div
                    style={{
                        padding: "12px 14px",
                        maxHeight: 380,
                        overflowY: "auto",
                    }}
                >
                    {/* ===== SHAPE TAB ===== */}
                    {tab === "shape" && (
                        <>
                            <Slider
                                label="Border Radius"
                                value={config.borderRadius}
                                min={0}
                                max={32}
                                step={1}
                                unit="px"
                                onChange={(v) => set("borderRadius", v)}
                            />
                            <Slider
                                label="Inset Padding"
                                value={config.padding}
                                min={-8}
                                max={16}
                                step={1}
                                unit="px"
                                onChange={(v) => set("padding", v)}
                            />
                            <Slider
                                label="Border Width"
                                value={config.borderWidth}
                                min={0}
                                max={3}
                                step={0.5}
                                unit="px"
                                onChange={(v) => set("borderWidth", v)}
                            />
                        </>
                    )}

                    {/* ===== TEXTURE TAB ===== */}
                    {tab === "texture" && (
                        <>
                            <SectionLabel text="Fill" />
                            <TokenColorInput
                                label="Fill Color"
                                mode={config.fillMode}
                                color={config.fillColor}
                                tokens={tokens}
                                onModeChange={(m) => set("fillMode", m)}
                                onColorChange={(c) => set("fillColor", c)}
                            />
                            <Slider
                                label="Fill Opacity"
                                value={config.fillOpacity}
                                min={0}
                                max={0.4}
                                step={0.005}
                                onChange={(v) => set("fillOpacity", v)}
                            />
                            <TokenColorInput
                                label="Border Color"
                                mode={config.borderMode}
                                color={config.borderColor}
                                tokens={tokens}
                                onModeChange={(m) => set("borderMode", m)}
                                onColorChange={(c) => set("borderColor", c)}
                            />
                            <Slider
                                label="Border Opacity"
                                value={config.borderOpacity}
                                min={0}
                                max={0.4}
                                step={0.005}
                                onChange={(v) => set("borderOpacity", v)}
                            />

                            <SectionLabel text="Glass Surface" />
                            <Slider
                                label="Light Angle"
                                value={config.lightAngle}
                                min={0}
                                max={360}
                                step={5}
                                unit="°"
                                onChange={(v) => set("lightAngle", v)}
                            />
                            <Slider
                                label="Highlight Intensity"
                                value={config.highlightIntensity}
                                min={0}
                                max={0.3}
                                step={0.005}
                                onChange={(v) => set("highlightIntensity", v)}
                            />
                            <Slider
                                label="Highlight Spread"
                                value={config.highlightWidth}
                                min={10}
                                max={90}
                                step={5}
                                unit="%"
                                onChange={(v) => set("highlightWidth", v)}
                            />
                            <Slider
                                label="Inner Glow"
                                value={config.innerGlow}
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={(v) => set("innerGlow", v)}
                            />
                            <Slider
                                label="Surface Blur"
                                value={config.surfaceBlur}
                                min={0}
                                max={24}
                                step={1}
                                unit="px"
                                onChange={(v) => set("surfaceBlur", v)}
                            />

                            <SectionLabel text="Shadow" />
                            <Slider
                                label="Shadow Opacity"
                                value={config.shadowOpacity}
                                min={0}
                                max={0.4}
                                step={0.005}
                                onChange={(v) => set("shadowOpacity", v)}
                            />
                            <Slider
                                label="Shadow Blur"
                                value={config.shadowBlur}
                                min={0}
                                max={40}
                                step={1}
                                unit="px"
                                onChange={(v) => set("shadowBlur", v)}
                            />
                            <Slider
                                label="Shadow Y"
                                value={config.shadowY}
                                min={0}
                                max={20}
                                step={1}
                                unit="px"
                                onChange={(v) => set("shadowY", v)}
                            />
                            <Slider
                                label="Shadow Spread"
                                value={config.shadowSpread}
                                min={-10}
                                max={10}
                                step={1}
                                unit="px"
                                onChange={(v) => set("shadowSpread", v)}
                            />
                        </>
                    )}

                    {/* ===== ANIMATION TAB ===== */}
                    {tab === "animation" && (
                        <>
                            <SectionLabel text="Timing" />
                            <Slider
                                label="Move Duration"
                                value={config.duration}
                                min={60}
                                max={400}
                                step={10}
                                unit="ms"
                                onChange={(v) => set("duration", v)}
                            />
                            <Slider
                                label="Fade Duration"
                                value={config.fadeDuration}
                                min={0}
                                max={300}
                                step={10}
                                unit="ms"
                                onChange={(v) => set("fadeDuration", v)}
                            />
                            <div style={{ marginBottom: 10, ...panelFont }}>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "#999",
                                        marginBottom: 4,
                                        letterSpacing: 0.2,
                                    }}
                                >
                                    Easing
                                </div>
                                <select
                                    value={config.easing}
                                    onChange={(e) =>
                                        set("easing", e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        padding: "6px 8px",
                                        background: "#2a2a2a",
                                        border: "1px solid #444",
                                        borderRadius: 5,
                                        color: "#ddd",
                                        fontSize: 10,
                                        cursor: "pointer",
                                        outline: "none",
                                    }}
                                >
                                    <option value="cubic-bezier(0.25, 0.46, 0.45, 0.94)">
                                        Smooth
                                    </option>
                                    <option value="cubic-bezier(0.4, 0, 0.2, 1)">
                                        Material
                                    </option>
                                    <option value="cubic-bezier(0.16, 1, 0.3, 1)">
                                        Expo Out
                                    </option>
                                    <option value="cubic-bezier(0.22, 1, 0.36, 1)">
                                        Quint Out
                                    </option>
                                    <option value="ease-out">Ease Out</option>
                                    <option value="ease-in-out">
                                        Ease In Out
                                    </option>
                                </select>
                            </div>

                            <SectionLabel text="Liquid Deformation" />
                            <Slider
                                label="Stretch"
                                value={config.stretchAmount}
                                min={0}
                                max={0.5}
                                step={0.01}
                                onChange={(v) => set("stretchAmount", v)}
                            />
                            <Slider
                                label="Squash"
                                value={config.squashAmount}
                                min={0}
                                max={0.3}
                                step={0.01}
                                onChange={(v) => set("squashAmount", v)}
                            />
                            <Slider
                                label="Recovery"
                                value={config.recoveryDuration}
                                min={50}
                                max={400}
                                step={10}
                                unit="ms"
                                onChange={(v) => set("recoveryDuration", v)}
                            />
                            <Slider
                                label="Overshoot"
                                value={config.overshoot}
                                min={0}
                                max={0.5}
                                step={0.01}
                                onChange={(v) => set("overshoot", v)}
                            />

                            <SectionLabel text="Gravitational Pull" />
                            <Slider
                                label="Pull Strength"
                                value={config.pullStrength}
                                min={0}
                                max={0.5}
                                step={0.01}
                                onChange={(v) => set("pullStrength", v)}
                            />
                            <Slider
                                label="Pull Range"
                                value={config.pullRange}
                                min={0.1}
                                max={0.8}
                                step={0.05}
                                onChange={(v) => set("pullRange", v)}
                            />
                            <Slider
                                label="Pull Curve"
                                value={config.pullCurve}
                                min={1}
                                max={4}
                                step={0.5}
                                onChange={(v) => set("pullCurve", v)}
                            />
                            <Slider
                                label="Move ↔ Stretch"
                                value={config.pullBalance}
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={(v) => set("pullBalance", v)}
                            />
                            <div style={{ marginBottom: 10, ...panelFont }}>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: "#999",
                                        marginBottom: 4,
                                        letterSpacing: 0.2,
                                    }}
                                >
                                    Pull Release Easing
                                </div>
                                <select
                                    value={config.pullEasing}
                                    onChange={(e) =>
                                        set("pullEasing", e.target.value)
                                    }
                                    style={{
                                        width: "100%",
                                        padding: "6px 8px",
                                        background: "#2a2a2a",
                                        border: "1px solid #444",
                                        borderRadius: 5,
                                        color: "#ddd",
                                        fontSize: 10,
                                        cursor: "pointer",
                                        outline: "none",
                                    }}
                                >
                                    <option value="cubic-bezier(0.2, 0, 0, 1)">
                                        Snap (fast start)
                                    </option>
                                    <option value="cubic-bezier(0.16, 1, 0.3, 1)">
                                        Expo Out
                                    </option>
                                    <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">
                                        Spring
                                    </option>
                                    <option value="cubic-bezier(0.25, 0.46, 0.45, 0.94)">
                                        Smooth (same as slide)
                                    </option>
                                    <option value="cubic-bezier(0.4, 0, 0.2, 1)">
                                        Material
                                    </option>
                                </select>
                            </div>

                            {/* Description */}
                            <div
                                style={{
                                    fontSize: 9,
                                    color: "#555",
                                    lineHeight: 1.4,
                                    marginTop: 8,
                                    padding: "8px 0",
                                    borderTop: "1px solid #2a2a2a",
                                }}
                            >
                                <b style={{ color: "#666" }}>Liquid:</b>{" "}
                                Stretch/squash deform the pill during slide.
                                Overshoot adds bounce on settle.
                                <br />
                                <br />
                                <b style={{ color: "#666" }}>Pull:</b> Pill
                                stretches toward adjacent cards as the mouse
                                approaches. Strength controls how far it
                                reaches. Range sets the activation zone from the
                                card edge. Curve controls acceleration (higher =
                                more sudden).
                            </div>
                        </>
                    )}
                </div>

                {/* Footer: Copy button */}
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
                        {copied ? "✓ Copied!" : "Copy Config"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================
// PROPERTY CONTROLS (canvas only)
// ============================================

addPropertyControls(HighlightControls, {
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
