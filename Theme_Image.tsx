import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

/**
 * Theme_Image_Final - Default display with theme variant support
 *
 * Features:
 * - Visible by default, hides when ANY ProjectItem is hovered
 * - Supports 5 variant slots for different themes
 * - Stays visible during theme transitions (smooth variant switching)
 * - Works with theme override system
 * - Accesses shared hover state from Theme_Overrides via window
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

// Helper to get hover state from window (shared via Theme_Overrides)
const getHoverState = () => {
    if (typeof window !== "undefined" && (window as any).__hoverState) {
        return (window as any).__hoverState
    }
    // Fallback if not yet initialized
    return { currentId: null, listeners: new Set() }
}

export function Theme_Image_Final(props) {
    const {
        theme = "variant1",
        variant1,
        variant2,
        variant3,
        variant4,
        variant5,
        transitionDuration = 0.5,
        transitionType = "fade",
        style,
    } = props

    // Debug: Log what theme prop is being received
    console.log("🖼️ Theme_Image_Final received props.theme:", theme)

    const [isHovering, setIsHovering] = useState(false)

    // Listen to global hover state
    useEffect(() => {
        console.log("🖼️ Theme_Image_Final: Setting up hover listener")

        const hoverState = getHoverState()

        const listener = (hoveredId) => {
            console.log(
                "🔔 Theme_Image_Final received hover update:",
                hoveredId
            )
            // Track if ANY project is being hovered
            setIsHovering(hoveredId !== null)
        }

        hoverState.listeners.add(listener)
        console.log(
            "✅ Theme_Image_Final listener added. Total listeners:",
            hoverState.listeners.size
        )

        // Initial sync
        listener(hoverState.currentId)

        return () => {
            hoverState.listeners.delete(listener)
        }
    }, [])

    // Map theme prop to variant content
    const variants = {
        variant1,
        variant2,
        variant3,
        variant4,
        variant5,
    }

    const activeVariant = variants[theme] || variant1

    // Animation variants for theme switching
    const themeTransitions = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        crossfade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        scale: {
            initial: { opacity: 0, scale: 0.98 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.98 },
        },
    }

    // Animation for hover hide/show
    const hoverTransitions = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
    }

    const currentTransition =
        themeTransitions[transitionType] || themeTransitions.fade

    // Wrapper styles for Framer constraints
    const wrapperStyle = {
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    }

    const contentStyle = {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }

    // If hovering any project, hide completely
    if (isHovering) {
        console.log("❌ Theme_Image_Final: HIDING (project is hovered)")
        return (
            <div style={wrapperStyle}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key="hidden"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                        }}
                        style={contentStyle}
                    />
                </AnimatePresence>
            </div>
        )
    }

    // Not hovering - show current theme variant with smooth transition
    console.log("✅ Theme_Image_Final: VISIBLE (no project hovered)")
    return (
        <div style={wrapperStyle}>
            <AnimatePresence mode="wait">
                {activeVariant && (
                    <motion.div
                        key={`theme-${theme}`}
                        initial={currentTransition.initial}
                        animate={currentTransition.animate}
                        exit={currentTransition.exit}
                        transition={{
                            duration: transitionDuration,
                            ease: "easeInOut",
                        }}
                        style={contentStyle}
                    >
                        {activeVariant}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Default props
Theme_Image_Final.defaultProps = {
    theme: "variant1",
    transitionType: "fade",
    transitionDuration: 0.5,
}

// Enable Framer constraints
Theme_Image_Final.supportsConstraints = true

// Property controls
addPropertyControls(Theme_Image_Final, {
    theme: {
        type: ControlType.Enum,
        title: "Theme",
        options: ["variant1", "variant2", "variant3", "variant4", "variant5"],
        optionTitles: [
            "Variant 1",
            "Variant 2",
            "Variant 3",
            "Variant 4",
            "Variant 5",
        ],
        defaultValue: "variant1",
        description:
            "Controlled by theme override - or set manually for testing",
    },

    // Variant content slots
    variant1: {
        type: ControlType.ComponentInstance,
        title: "Variant 1",
        description: "Content for theme 1 (e.g., Blue)",
    },
    variant2: {
        type: ControlType.ComponentInstance,
        title: "Variant 2",
        description: "Content for theme 2 (e.g., Pink)",
    },
    variant3: {
        type: ControlType.ComponentInstance,
        title: "Variant 3",
        description: "Content for theme 3 (e.g., Green)",
    },
    variant4: {
        type: ControlType.ComponentInstance,
        title: "Variant 4",
        description: "Content for theme 4 (optional)",
    },
    variant5: {
        type: ControlType.ComponentInstance,
        title: "Variant 5",
        description: "Content for theme 5 (optional)",
    },

    // Animation controls
    transitionType: {
        type: ControlType.Enum,
        title: "Theme Transition",
        options: ["fade", "crossfade", "scale"],
        optionTitles: ["Fade", "Crossfade", "Scale"],
        defaultValue: "fade",
        description: "Animation when switching themes",
    },
    transitionDuration: {
        type: ControlType.Number,
        title: "Transition Duration",
        defaultValue: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
        unit: "s",
        description: "Speed of theme transitions",
    },
})

export default Theme_Image_Final
