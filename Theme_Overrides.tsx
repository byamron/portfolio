import type { ComponentType } from "react"
import * as React from "react"

/**
 * Theme Overrides for Custom Themes
 *
 * Themes: Table, Portrait, Sky, Pizza
 * Default Theme: Table
 *
 * Features:
 * - Color theme switching (Table/Portrait/Sky/Pizza)
 * - Appearance mode switching (System/Light/Dark)
 * - Body background color syncing
 * - Browser theme-color meta tag (Arc/Dia compatible)
 * - Hover state management (for ProjectItem/Hover_Preview system)
 * - NEW: Variant-driven theme selection via ThemeSelectorButton
 *
 * Usage:
 * - Apply ThemeSelectorButton() to your unified theme selector component
 * - OR use legacy ThemeSelector() for event-based buttons
 * - Apply ThemeImageVariant() to Theme_Image_Final component
 * - Use ThemeToggle component for appearance mode switching
 */

// ============================================================================
// THEME STATE MANAGEMENT
// ============================================================================

interface ThemeState {
    currentTheme: string
    appearanceMode: "light" | "dark" | "system"
    listeners: Set<(theme: string) => void>
}

const themeState: ThemeState = {
    currentTheme: "table",
    appearanceMode: "system",
    listeners: new Set(),
}

// Make theme state globally accessible
if (typeof window !== "undefined") {
    ;(window as any).__themeState = themeState
}

/**
 * Update the current theme and notify all listeners
 */
export const setTheme = (themeName: string) => {
    // Guard: Don't do anything if already on this theme
    if (themeState.currentTheme === themeName) {
        console.log("⏭️ Already on theme:", themeName, "- skipping")
        return
    }

    console.log("🎨 setTheme called with:", themeName)
    themeState.currentTheme = themeName

    updateBrowserThemeColor(themeName)
    updateBodyBackgroundColor(themeName)

    themeState.listeners.forEach((listener) => {
        listener(themeName)
    })

    console.log("✅ All listeners notified")
}

/**
 * Find where Framer's CSS variables are defined
 */
const findFramerTokenElement = (): Element => {
    // Check body first (most common in Framer)
    const bodyStyles = getComputedStyle(document.body)
    const bodyTestVar = bodyStyles
        .getPropertyValue("--token-6e011c17-43ed-4fd8-a339-24b221b0d151")
        .trim()

    console.log("🔍 Checking document.body for tokens...")
    console.log(
        "  Body has theme-toggle:",
        document.body.getAttribute("theme-toggle")
    )
    console.log(
        "  Body has data-framer-theme:",
        document.body.getAttribute("data-framer-theme")
    )
    console.log(
        "  HTML has toggle-theme:",
        document.documentElement.getAttribute("toggle-theme")
    )
    console.log(
        "  HTML has data-framer-theme:",
        document.documentElement.getAttribute("data-framer-theme")
    )

    if (bodyTestVar) {
        console.log("✅ Found tokens on document.body")
        return document.body
    }

    // Check document.documentElement
    const rootStyles = getComputedStyle(document.documentElement)
    const testVar = rootStyles
        .getPropertyValue("--token-6e011c17-43ed-4fd8-a339-24b221b0d151")
        .trim()

    if (testVar) {
        console.log("✅ Found tokens on document.documentElement")
        return document.documentElement
    }

    // Check for Framer-specific containers
    const framerRoot =
        document.querySelector("[data-framer-name]") ||
        document.querySelector(".framer-page-root") ||
        document.querySelector("main")

    if (framerRoot) {
        const framerStyles = getComputedStyle(framerRoot)
        const framerTestVar = framerStyles
            .getPropertyValue("--token-6e011c17-43ed-4fd8-a339-24b221b0d151")
            .trim()

        if (framerTestVar) {
            console.log("✅ Found tokens on Framer container:", framerRoot)
            return framerRoot
        }
    }

    // Fallback to body
    console.log("⚠️ No token element found, falling back to body")
    return document.body
}

/**
 * Convert rgb/rgba string to hex
 */
const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!match) return rgb

    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])

    const toHex = (n: number) => {
        const hex = n.toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Get the actual color value from a Framer token CSS variable
 * CRITICAL: Always queries fresh from the DOM to get current light/dark value
 */
const getTokenColor = (tokenVar: string): string => {
    if (typeof window === "undefined") return tokenVar

    // If it's already a hex/rgb color, return it
    if (!tokenVar.startsWith("var(")) {
        return tokenVar
    }

    // Extract the CSS variable name from var(--token-xxx)
    const match = tokenVar.match(/var\((--[^)]+)\)/)
    if (!match) {
        return tokenVar
    }

    const varName = match[1]

    // DIAGNOSTIC: Check how this variable is defined in the stylesheets
    console.log("🔍 DIAGNOSTIC: Checking CSS definition for", varName)
    for (const sheet of Array.from(document.styleSheets)) {
        try {
            for (const rule of Array.from(sheet.cssRules || [])) {
                const cssText = rule.cssText
                if (cssText.includes(varName)) {
                    console.log(
                        "  Found in stylesheet:",
                        cssText.substring(0, 200)
                    )
                }
            }
        } catch (e) {
            // Cross-origin stylesheet, skip
        }
    }

    // CRITICAL: Force browser to recalculate styles before querying
    // This ensures we get the latest values after appearance mode changes
    document.body.offsetHeight // Force reflow

    // CRITICAL: Always query fresh from the element to get current appearance mode value
    const tokenElement = findFramerTokenElement()
    const rootStyles = getComputedStyle(tokenElement)
    let computedValue = rootStyles.getPropertyValue(varName).trim()

    console.log(`🔍 getTokenColor: ${varName} = "${computedValue}"`)

    // If the computed value is another CSS variable, resolve it recursively
    let iterations = 0
    while (computedValue.startsWith("var(") && iterations < 5) {
        const nestedMatch = computedValue.match(/var\((--[^)]+)\)/)
        if (nestedMatch) {
            const nestedVar = nestedMatch[1]
            const previousValue = computedValue
            computedValue = rootStyles.getPropertyValue(nestedVar).trim()
            console.log(`  ↳ Resolved ${nestedVar} = "${computedValue}"`)
        } else {
            break
        }
        iterations++
    }

    // If we still don't have a value, return the original variable
    if (!computedValue) {
        console.warn(`⚠️ Could not resolve ${varName}`)
        return tokenVar
    }

    // Convert rgb() to hex if needed
    if (computedValue.startsWith("rgb")) {
        const hexColor = rgbToHex(computedValue)
        console.log(`  ↳ Converted to hex: ${hexColor}`)
        return hexColor
    }

    return computedValue
}

/**
 * Update the browser's theme-color meta tag
 * CRITICAL: Arc/Dia browsers cache meta tags, so we remove and recreate
 */
const updateBrowserThemeColor = (themeName: string) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
        console.warn("⚠️ Not in browser environment, skipping meta tag")
        return
    }

    if (!document.head) {
        console.warn("⚠️ document.head not available yet, skipping meta tag")
        return
    }

    try {
        const themeTokens = {
            table: "var(--token-6e011c17-43ed-4fd8-a339-24b221b0d151)",
            portrait: "var(--token-46108f2b-176a-46e4-9b43-86659a7e84fe)",
            sky: "var(--token-3d2aa91d-45c7-47c2-9222-441a0888f22b)",
            pizza: "var(--token-318c44a5-6682-4b5e-a766-7ae56da308c4)",
        }

        const tokenVar = themeTokens[themeName] || themeTokens.table
        const color = getTokenColor(tokenVar)

        console.log("🔍 Updating meta tag with color:", color)

        // CRITICAL FOR ARC/DIA: Remove existing meta tag completely
        const existingMetaTag = document.querySelector(
            'meta[name="theme-color"]'
        )
        if (existingMetaTag) {
            console.log(
                "🗑️ Removing existing meta tag to force browser refresh"
            )
            existingMetaTag.remove()
        }

        // Small delay to ensure removal is processed
        setTimeout(() => {
            // Create new meta tag
            console.log("📝 Creating fresh theme-color meta tag")
            const metaThemeColor = document.createElement("meta")
            metaThemeColor.setAttribute("name", "theme-color")
            metaThemeColor.setAttribute("content", color)

            // Append to head
            document.head.appendChild(metaThemeColor)

            console.log("✅ Meta tag created with color:", color)

            // Verify it was added
            const verification = document.querySelector(
                'meta[name="theme-color"]'
            )
            if (verification) {
                console.log(
                    "✅ Meta tag verified in DOM:",
                    verification.getAttribute("content")
                )
            }
        }, 10)
    } catch (error) {
        console.error("❌ Error updating browser theme-color:", error)
    }
}

/**
 * Update the body background color
 * Uses resolved color value to ensure immediate visual update
 */
const updateBodyBackgroundColor = (themeName: string) => {
    try {
        const themeTokens = {
            table: "var(--token-6e011c17-43ed-4fd8-a339-24b221b0d151)",
            portrait: "var(--token-46108f2b-176a-46e4-9b43-86659a7e84fe)",
            sky: "var(--token-3d2aa91d-45c7-47c2-9222-441a0888f22b)",
            pizza: "var(--token-318c44a5-6682-4b5e-a766-7ae56da308c4)",
        }

        const tokenVar = themeTokens[themeName] || themeTokens.table

        // Query the current color value (respects current appearance mode)
        const resolvedColor = getTokenColor(tokenVar)
        console.log("🎨 Setting body background to:", resolvedColor)

        // Set the resolved color directly
        document.body.style.backgroundColor = resolvedColor
        document.body.style.transition = "background-color 0.5s ease-in-out"

        document.documentElement.style.backgroundColor = resolvedColor
        document.documentElement.style.transition =
            "background-color 0.5s ease-in-out"

        console.log("✅ Body background updated")
    } catch (error) {
        console.error("❌ Error updating body background:", error)
    }
}

/**
 * Setup listeners for theme changes
 */
const setupThemeListener = () => {
    // Listen for system theme changes
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)")

        darkModeQuery.addEventListener("change", (e) => {
            if (themeState.appearanceMode === "system") {
                console.log(
                    "🌓 System theme changed to:",
                    e.matches ? "dark" : "light"
                )
                // Add small delay to let browser recalculate styles
                setTimeout(() => {
                    updateBodyBackgroundColor(themeState.currentTheme)
                    updateBrowserThemeColor(themeState.currentTheme)
                }, 50)
            }
        })
    }

    // Listen for manual appearance mode changes from ThemeToggle
    window.addEventListener("appearanceModeChanged", ((e: CustomEvent) => {
        console.log("🔔 Appearance mode changed to:", e.detail)

        // CRITICAL: Add delay to allow Framer to update its CSS variables
        // Framer needs time to recalculate styles after appearance mode changes
        setTimeout(() => {
            console.log("🔄 Re-querying colors after appearance change...")
            updateBodyBackgroundColor(themeState.currentTheme)
            updateBrowserThemeColor(themeState.currentTheme)
        }, 100)
    }) as EventListener)
}

export const getCurrentTheme = () => themeState.currentTheme

// ============================================================================
// HOVER STATE MANAGEMENT (for ProjectItem/Hover_Preview system)
// ============================================================================

interface HoverState {
    currentId: string | null
    listeners: Set<(id: string | null) => void>
}

const hoverState: HoverState = {
    currentId: null,
    listeners: new Set(),
}

// Make hover state globally accessible
if (typeof window !== "undefined") {
    ;(window as any).__hoverState = hoverState
}

/**
 * Update the current hovered project ID and notify all listeners
 */
export const setGlobalHoverId = (id: string | null) => {
    console.log("📡 setGlobalHoverId called with:", id)
    console.log("📡 Current listeners count:", hoverState.listeners.size)

    hoverState.currentId = id

    hoverState.listeners.forEach((listener) => {
        listener(id)
    })

    console.log("✅ All hover listeners notified")
}

/**
 * Get the hover state object (for components to access)
 */
export const getHoverState = () => hoverState

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const THEMES = {
    table: {
        name: "Table",
        backgroundColor: "var(--token-6e011c17-43ed-4fd8-a339-24b221b0d151)",
        variant: "variant1",
    },
    portrait: {
        name: "Portrait",
        backgroundColor: "var(--token-46108f2b-176a-46e4-9b43-86659a7e84fe)",
        variant: "variant2",
    },
    sky: {
        name: "Sky",
        backgroundColor: "var(--token-3d2aa91d-45c7-47c2-9222-441a0888f22b)",
        variant: "variant3",
    },
    pizza: {
        name: "Pizza",
        backgroundColor: "var(--token-318c44a5-6682-4b5e-a766-7ae56da308c4)",
        variant: "variant4",
    },
}

// ============================================================================
// INITIALIZE
// ============================================================================

if (typeof window !== "undefined") {
    const initBodyBackground = () => {
        console.log("🚀 Initializing theme system...")

        updateBodyBackgroundColor(themeState.currentTheme)
        updateBrowserThemeColor(themeState.currentTheme)
        setupThemeListener()

        console.log("✅ Theme system initialized")
    }

    // Wait for document to be fully ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(initBodyBackground, 100)
        })
    } else if (document.readyState === "interactive") {
        setTimeout(initBodyBackground, 100)
    } else {
        setTimeout(initBodyBackground, 100)
    }
}

// ============================================================================
// THEME SELECTOR OVERRIDES
// ============================================================================

/**
 * NEW: Apply this override to your themeSelectorButton component
 *
 * This watches for variant changes using a ref and effect pattern.
 * Works even when Framer doesn't re-run the override on variant change.
 *
 * IMPORTANT: Update the variantToTheme mapping with YOUR actual variant IDs!
 * To find your variant IDs, check the console log on page load.
 */
export function ThemeSelectorButton(props): Override {
    const { variant } = props

    console.log("🎯 ThemeSelectorButton override called with variant:", variant)

    // TODO: UPDATE THESE WITH YOUR ACTUAL VARIANT IDS FROM CONSOLE
    // Check console on page load to see: "ThemeSelectorButton override called with variant: [YOUR_ID]"
    // Then update this mapping with your component's actual variant IDs
    const variantToTheme = {
        // Try readable names first (if you renamed them)
        Table: "table",
        Portrait: "portrait",
        Sky: "sky",
        Pizza: "pizza",

        // ADD YOUR FRAMER-GENERATED IDs HERE:
        // Example: "zlAf3QsFV": "table",  // Replace with your actual IDs
        // Find them by clicking each button and checking console
    }

    // Use a more aggressive tracking pattern
    const lastVariantRef = React.useRef<string | null>(null)
    const [currentVariant, setCurrentVariant] = React.useState(variant)

    // Track variant changes with both ref and state
    React.useEffect(() => {
        console.log(
            "🔍 ThemeSelectorButton useEffect triggered. Variant:",
            variant
        )

        if (variant !== lastVariantRef.current) {
            console.log(
                "📝 Variant changed from",
                lastVariantRef.current,
                "to",
                variant
            )
            lastVariantRef.current = variant
            setCurrentVariant(variant)

            const themeName = variantToTheme[variant]
            if (themeName) {
                console.log(
                    "🎨 Variant changed to:",
                    variant,
                    "→ Setting theme:",
                    themeName
                )
                setTheme(themeName)
            } else {
                console.warn("⚠️ Unknown variant:", variant)
                console.log("💡 Add this to variantToTheme mapping:")
                console.log(`"${variant}": "table",  // or portrait/sky/pizza`)
                console.log("Available mappings:", Object.keys(variantToTheme))
            }
        }
    }, [variant])

    // Also watch for changes on every render (more aggressive)
    if (variant !== lastVariantRef.current && lastVariantRef.current !== null) {
        const themeName = variantToTheme[variant]
        if (themeName) {
            console.log(
                "🎨 Detected variant change in render:",
                variant,
                "→",
                themeName
            )
            lastVariantRef.current = variant
            setTheme(themeName)
        }
    }

    // Return empty override
    return {}
}

/**
 * LEGACY: Event-based theme selector for backward compatibility
 * Use ThemeSelectorButton instead for new implementations
 */
export function ThemeSelector(): Override {
    return {
        onSkyClick: () => {
            console.log("🌤️ Sky theme selected")
            setTheme("sky")
        },

        onTableClick: () => {
            console.log("🪑 Table theme selected")
            setTheme("table")
        },

        onPortraitClick: () => {
            console.log("🖼️ Portrait theme selected")
            setTheme("portrait")
        },

        onPizzaClick: () => {
            console.log("🍕 Pizza theme selected")
            setTheme("pizza")
        },
    }
}

// ============================================================================
// BACKGROUND COLOR OVERRIDE
// ============================================================================

export function BackgroundColor(): Override {
    const [currentTheme, setCurrentTheme] = React.useState(
        themeState.currentTheme
    )

    React.useEffect(() => {
        const listener = (theme: string) => {
            setCurrentTheme(theme)
        }

        themeState.listeners.add(listener)

        return () => {
            themeState.listeners.delete(listener)
        }
    }, [])

    const bgColor =
        THEMES[currentTheme]?.backgroundColor || THEMES.table.backgroundColor

    return {
        fill: bgColor,

        transition: {
            fill: {
                duration: 0.5,
                ease: "easeInOut",
            },
        },
    }
}

// ============================================================================
// THEME IMAGE VARIANT OVERRIDE
// ============================================================================

export function ThemeImageVariant(): Override {
    const [currentTheme, setCurrentTheme] = React.useState(
        themeState.currentTheme
    )

    React.useEffect(() => {
        const listener = (theme: string) => {
            setCurrentTheme(theme)
        }

        themeState.listeners.add(listener)

        return () => {
            themeState.listeners.delete(listener)
        }
    }, [])

    const variant = THEMES[currentTheme]?.variant || "variant1"

    return {
        theme: variant,
    }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Override {
    [key: string]: any
}

export type ThemeName = keyof typeof THEMES
