import { addPropertyControls, ControlType } from "framer"
import { useEffect, useState } from "react"

/**
 * Theme Background Layer
 *
 * An independent background layer that syncs with your theme system.
 * Does NOT wrap your content - works as a separate layer.
 *
 * SETUP - Two Options:
 *
 * Option A - Absolute Positioning (Recommended):
 * 1. Add ThemeBackgroundLayer to your frame/page
 * 2. Set Position: Absolute
 * 3. Set constraints: Left: 0, Right: 0, Top: 0, Bottom: 0
 * 4. Move to back of layer stack (bottom)
 * 5. Your content layers sit on top with z-index automatically
 *
 * Option B - Inside Container Frame:
 * 1. Create a parent Frame that contains everything
 * 2. Add ThemeBackgroundLayer as first child (bottom of stack)
 * 3. Set it to Fill width & height
 * 4. Add your actual content as siblings above it
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

// Theme configuration - these tokens automatically handle light/dark mode
const THEME_COLORS = {
    table: "var(--token-6e011c17-43ed-4fd8-a339-24b221b0d151)",
    portrait: "var(--token-46108f2b-176a-46e4-9b43-86659a7e84fe)",
    sky: "var(--token-3d2aa91d-45c7-47c2-9222-441a0888f22b)",
    pizza: "var(--token-318c44a5-6682-4b5e-a766-7ae56da308c4)",
}

export default function ThemeBackgroundLayer({
    manualColor,
    useManualColor,
    transitionDuration,
    opacity,
    borderRadius,
    blur,
    style,
}) {
    // Connect to the global theme state
    const [currentTheme, setCurrentTheme] = useState("table")
    const [isConnected, setIsConnected] = useState(false)
    const [, forceUpdate] = useState(0) // Force re-render when appearance changes

    useEffect(() => {
        console.log("🎨 ThemeBackgroundLayer mounted")

        let cleanup: (() => void) | undefined

        const tryConnect = () => {
            // Try to access the theme state
            let themeState = null

            if (typeof window !== "undefined") {
                themeState = (window as any).__themeState

                // Try alternate locations if not found
                if (!themeState) {
                    const possibleKeys = Object.keys(window).filter(
                        (key) => key.includes("theme") || key.includes("Theme")
                    )

                    for (const key of possibleKeys) {
                        const obj = (window as any)[key]
                        if (obj && obj.currentTheme && obj.listeners) {
                            themeState = obj
                            break
                        }
                    }
                }
            }

            if (!themeState) {
                return false
            }

            console.log("✅ Theme state connected!")
            setIsConnected(true)

            // Set initial theme
            setCurrentTheme(themeState.currentTheme)
            console.log("📊 Initial theme:", themeState.currentTheme)

            // Listen for theme changes
            const themeListener = (theme: string) => {
                console.log(
                    "🔔 ThemeBackgroundLayer received theme update:",
                    theme
                )
                setCurrentTheme(theme)
            }

            themeState.listeners.add(themeListener)

            // Listen for appearance mode changes
            const appearanceListener = () => {
                console.log(
                    "🌓 ThemeBackgroundLayer: appearance mode changed, forcing update"
                )
                forceUpdate((n) => n + 1)
            }

            window.addEventListener("appearanceModeChanged", appearanceListener)

            cleanup = () => {
                themeState.listeners.delete(themeListener)
                window.removeEventListener(
                    "appearanceModeChanged",
                    appearanceListener
                )
            }

            return true
        }

        // Try to connect immediately
        if (!tryConnect()) {
            // If failed, retry with interval
            const interval = setInterval(() => {
                if (tryConnect()) {
                    clearInterval(interval)
                }
            }, 100)

            // Stop trying after 5 seconds
            const timeout = setTimeout(() => {
                clearInterval(interval)
                console.error(
                    "❌ Failed to connect to theme state after 5 seconds"
                )
            }, 5000)

            return () => {
                clearInterval(interval)
                clearTimeout(timeout)
                cleanup?.()
            }
        }

        return () => cleanup?.()
    }, [])

    // Get the background color - uses CSS variables that automatically handle light/dark mode
    const getBackgroundColor = () => {
        if (useManualColor) {
            return manualColor
        }

        // Return the CSS variable directly - it will automatically resolve to the correct light/dark value
        return THEME_COLORS[currentTheme] || THEME_COLORS.table
    }

    const backgroundColor = getBackgroundColor()

    return (
        <div
            style={{
                ...style,
                backgroundColor,
                opacity,
                borderRadius,
                backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
                WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
                width: "100%",
                height: "100%",
                position: "relative",
                transition: `background-color ${transitionDuration}s ease-in-out, opacity ${transitionDuration}s ease-in-out`,
                pointerEvents: "none", // Allow clicks to pass through to content above
            }}
        />
    )
}

// Enable full responsiveness
ThemeBackgroundLayer.supportsConstraints = true

addPropertyControls(ThemeBackgroundLayer, {
    useManualColor: {
        type: ControlType.Boolean,
        title: "Manual Color",
        defaultValue: false,
        description: "Override theme color",
    },
    manualColor: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "#FFFFFF",
        hidden: (props) => !props.useManualColor,
    },
    opacity: {
        type: ControlType.Number,
        title: "Opacity",
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.01,
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 1,
    },
    blur: {
        type: ControlType.Number,
        title: "Blur",
        defaultValue: 0,
        min: 0,
        max: 40,
        step: 1,
        description: "Backdrop blur effect (px)",
    },
    transitionDuration: {
        type: ControlType.Number,
        title: "Transition",
        defaultValue: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
        unit: "s",
    },
})
