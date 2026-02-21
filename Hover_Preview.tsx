import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

/**
 * Hover_Preview - Project-specific display container
 * Shows when its corresponding ProjectItem is hovered
 * Multiple instances can exist - only one visible at a time
 * Accesses shared hover state from Theme_Overrides via window
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

export function Hover_Preview(props) {
    const { listenForId, children, transitionDuration, transitionType, style } =
        props

    const [isVisible, setIsVisible] = useState(false)

    // Listen to global hover state
    useEffect(() => {
        console.log(`🎨 Hover_Preview [${listenForId}]: Setting up listener`)

        const hoverState = getHoverState()

        const listener = (hoveredId) => {
            console.log(
                `🔔 Hover_Preview [${listenForId}] received:`,
                hoveredId
            )
            // Show only when THIS specific ProjectItem is hovered
            const shouldBeVisible = hoveredId === listenForId
            setIsVisible(shouldBeVisible)

            if (shouldBeVisible) {
                console.log(`✅ Hover_Preview [${listenForId}]: VISIBLE`)
            } else {
                console.log(`❌ Hover_Preview [${listenForId}]: HIDDEN`)
            }
        }

        hoverState.listeners.add(listener)
        console.log(
            `✅ Hover_Preview [${listenForId}] listener added. Total listeners:`,
            hoverState.listeners.size
        )

        // Initial sync in case state changed before mount
        listener(hoverState.currentId)

        return () => {
            hoverState.listeners.delete(listener)
        }
    }, [listenForId])

    // Animation variants
    const transitions = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        scale: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
        },
        slideUp: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
        },
        slideDown: {
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
        },
        slideLeft: {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 },
        },
        slideRight: {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -20 },
        },
    }

    const currentTransition = transitions[transitionType] || transitions.fade

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

    return (
        <div style={wrapperStyle}>
            <AnimatePresence mode="wait">
                {isVisible && children && (
                    <motion.div
                        key={`hover-preview-${listenForId}`}
                        initial={currentTransition.initial}
                        animate={currentTransition.animate}
                        exit={currentTransition.exit}
                        transition={{
                            duration: transitionDuration,
                            ease: "easeInOut",
                        }}
                        style={contentStyle}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Default props
Hover_Preview.defaultProps = {
    listenForId: "project-1",
    transitionType: "fade",
    transitionDuration: 0.3,
}

// Enable Framer constraints
Hover_Preview.supportsConstraints = true

// Property controls
addPropertyControls(Hover_Preview, {
    listenForId: {
        type: ControlType.String,
        title: "Listen For ID",
        defaultValue: "project-1",
        description: "Show when ProjectItem with this ID is hovered",
    },
    children: {
        type: ControlType.ComponentInstance,
        title: "Content",
        description: "Native Framer component to display on hover",
    },
    transitionType: {
        type: ControlType.Enum,
        title: "Transition",
        options: [
            "fade",
            "scale",
            "slideUp",
            "slideDown",
            "slideLeft",
            "slideRight",
        ],
        optionTitles: [
            "Fade",
            "Scale",
            "Slide Up",
            "Slide Down",
            "Slide Left",
            "Slide Right",
        ],
        defaultValue: "fade",
    },
    transitionDuration: {
        type: ControlType.Number,
        title: "Duration",
        defaultValue: 0.3,
        min: 0.1,
        max: 2,
        step: 0.1,
        unit: "s",
    },
})

export default Hover_Preview
