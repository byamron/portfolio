import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, cloneElement, isValidElement } from "react"

/**
 * Theme Toggle Component
 *
 * A 3-icon toggle for System / Light / Dark appearance modes.
 * Integrates seamlessly with your Theme_Overrides system.
 *
 * Features:
 * - Custom icon slots for each mode
 * - Color-coded selected/unselected states
 * - Remembers user preference in localStorage
 * - Scale animation on hover
 * - Actually switches Framer's appearance mode
 *
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */

export default function ThemeToggle({
    icon_system,
    icon_light,
    icon_dark,
    color_selected,
    color_unselected,
    iconSize,
    buttonGap,
    buttonPadding,
    hoverScale,
    style,
}) {
    // Track current mode
    const [currentMode, setCurrentMode] = useState<"system" | "light" | "dark">(
        "system"
    )
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)

    useEffect(() => {
        // Load saved preference from localStorage
        try {
            const saved = localStorage.getItem("appearanceMode") as
                | "system"
                | "light"
                | "dark"
                | null
            if (saved) {
                console.log("📂 Loaded saved appearance mode:", saved)
                setCurrentMode(saved)

                // Apply the saved mode
                applyFramerAppearanceMode(saved)

                // Update theme state
                if (
                    typeof window !== "undefined" &&
                    (window as any).__themeState
                ) {
                    const themeState = (window as any).__themeState
                    themeState.appearanceMode = saved

                    // Trigger initial update
                    const event = new CustomEvent("appearanceModeChanged", {
                        detail: saved,
                    })
                    window.dispatchEvent(event)
                }
            }
        } catch (e) {
            console.log("Could not load saved preference")
        }
    }, [])

    /**
     * Apply appearance mode to Framer's system
     * Uses data-theme attribute on html and body (matching Framer's native toggle)
     */
    const applyFramerAppearanceMode = (mode: "system" | "light" | "dark") => {
        try {
            if (mode === "system") {
                // Detect system preference
                const isDarkMode =
                    window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                const systemMode = isDarkMode ? "dark" : "light"

                // Remove data-theme to use system preference
                document.documentElement.removeAttribute("data-theme")
                document.body.removeAttribute("data-theme")

                // Set based on system
                document.documentElement.setAttribute("data-theme", systemMode)
                document.body.setAttribute("data-theme", systemMode)

                console.log("🎨 Framer: Using system theme:", systemMode)
            } else {
                // Set to light or dark
                document.documentElement.setAttribute("data-theme", mode)
                document.body.setAttribute("data-theme", mode)
                console.log("🎨 Framer: Set data-theme to", mode)
            }

            // Force a style recalculation
            void document.documentElement.offsetHeight
        } catch (error) {
            console.error("❌ Error applying Framer appearance mode:", error)
        }
    }

    const handleModeChange = (mode: "system" | "light" | "dark") => {
        console.log("🔘 ThemeToggle: Mode changed to", mode)
        setCurrentMode(mode)

        // CRITICAL: Apply to Framer's system FIRST
        applyFramerAppearanceMode(mode)

        // Update theme state and trigger event
        if (typeof window !== "undefined" && (window as any).__themeState) {
            const themeState = (window as any).__themeState
            themeState.appearanceMode = mode

            console.log("📊 Updated themeState.appearanceMode to:", mode)

            // Dispatch event to trigger color updates (with delay for Framer to update)
            setTimeout(() => {
                const event = new CustomEvent("appearanceModeChanged", {
                    detail: mode,
                })
                window.dispatchEvent(event)
                console.log("✅ Dispatched appearanceModeChanged event:", mode)
            }, 50)
        } else {
            console.error("❌ Could not find __themeState on window")
        }

        // Save preference
        try {
            localStorage.setItem("appearanceMode", mode)
            console.log("💾 Saved appearance mode:", mode)
        } catch (e) {
            console.log("Could not save preference")
        }
    }

    // Helper to inject color into icon components
    const renderIconWithColor = (icon: any, isActive: boolean) => {
        const color = isActive ? color_selected : color_unselected

        if (isValidElement(icon)) {
            // Clone the icon and inject color prop
            return cloneElement(icon as any, {
                color: color,
                style: { color: color },
            })
        }

        return icon
    }

    const buttonStyle = (buttonId: string, isActive: boolean) => ({
        padding: buttonPadding,
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: iconSize + buttonPadding * 2,
        height: iconSize + buttonPadding * 2,
        transform:
            hoveredButton === buttonId && !isActive
                ? `scale(${hoverScale})`
                : "scale(1)",
    })

    const iconWrapperStyle = (isActive: boolean) => ({
        width: iconSize,
        height: iconSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.2s ease-in-out",
        opacity: isActive ? 1 : 0.5, // Visual feedback
    })

    const iconColorStyle = (isActive: boolean) => ({
        color: isActive ? color_selected : color_unselected,
        fill: isActive ? color_selected : color_unselected,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.2s ease-in-out",
    })

    return (
        <div
            style={{
                ...style,
                display: "flex",
                gap: buttonGap,
                alignItems: "center",
            }}
        >
            {/* System button */}
            <button
                style={buttonStyle("system", currentMode === "system")}
                onClick={() => handleModeChange("system")}
                onMouseEnter={() => setHoveredButton("system")}
                onMouseLeave={() => setHoveredButton(null)}
                aria-label="System theme"
            >
                <div style={iconWrapperStyle(currentMode === "system")}>
                    <div style={iconColorStyle(currentMode === "system")}>
                        {renderIconWithColor(
                            icon_system,
                            currentMode === "system"
                        )}
                    </div>
                </div>
            </button>

            {/* Light button */}
            <button
                style={buttonStyle("light", currentMode === "light")}
                onClick={() => handleModeChange("light")}
                onMouseEnter={() => setHoveredButton("light")}
                onMouseLeave={() => setHoveredButton(null)}
                aria-label="Light theme"
            >
                <div style={iconWrapperStyle(currentMode === "light")}>
                    <div style={iconColorStyle(currentMode === "light")}>
                        {renderIconWithColor(
                            icon_light,
                            currentMode === "light"
                        )}
                    </div>
                </div>
            </button>

            {/* Dark button */}
            <button
                style={buttonStyle("dark", currentMode === "dark")}
                onClick={() => handleModeChange("dark")}
                onMouseEnter={() => setHoveredButton("dark")}
                onMouseLeave={() => setHoveredButton(null)}
                aria-label="Dark theme"
            >
                <div style={iconWrapperStyle(currentMode === "dark")}>
                    <div style={iconColorStyle(currentMode === "dark")}>
                        {renderIconWithColor(icon_dark, currentMode === "dark")}
                    </div>
                </div>
            </button>
        </div>
    )
}

ThemeToggle.supportsConstraints = true

addPropertyControls(ThemeToggle, {
    icon_system: {
        type: ControlType.ComponentInstance,
        title: "System Icon",
    },
    icon_light: {
        type: ControlType.ComponentInstance,
        title: "Light Icon",
    },
    icon_dark: {
        type: ControlType.ComponentInstance,
        title: "Dark Icon",
    },
    color_selected: {
        type: ControlType.Color,
        title: "Selected",
        defaultValue: "#000000",
    },
    color_unselected: {
        type: ControlType.Color,
        title: "Unselected",
        defaultValue: "#999999",
    },
    iconSize: {
        type: ControlType.Number,
        title: "Icon Size",
        defaultValue: 24,
        min: 16,
        max: 48,
        step: 1,
        unit: "px",
    },
    buttonGap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 8,
        min: 0,
        max: 32,
        step: 1,
        unit: "px",
    },
    buttonPadding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 8,
        min: 0,
        max: 24,
        step: 1,
        unit: "px",
    },
    hoverScale: {
        type: ControlType.Number,
        title: "Hover Scale",
        defaultValue: 1.1,
        min: 1,
        max: 1.5,
        step: 0.05,
        description: "Scale factor on hover (inactive buttons only)",
    },
})
