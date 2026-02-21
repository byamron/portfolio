import { addPropertyControls, ControlType } from "framer"
import { useCallback } from "react"

/**
 * LinkCard - Accessible link component with global hover state
 *
 * Emits hover events to window.__hoverState for Theme_Image/Hover_Preview
 * components, and includes data-link-card attribute for SectionHighlight override.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

// ============================================
// GLOBAL HOVER STATE (shared with other components)
// ============================================

const setGlobalHoverId = (id: string | null) => {
    if (typeof window === "undefined") return

    const hoverState = (window as any).__hoverState
    if (hoverState) {
        hoverState.currentId = id
        hoverState.listeners.forEach((listener: (id: string | null) => void) =>
            listener(id)
        )
    }
}

// ============================================
// COMPONENT
// ============================================

interface TextDecoration {
    type: "none" | "underline" | "line-through"
    color: string
    style: "solid" | "double" | "dotted" | "dashed" | "wavy"
    thickness: number
    offset: number
}

interface Props {
    projectId: string
    text: string
    href: string
    openInNewTab: boolean
    showArrow: boolean
    arrowChar: string
    font: Record<string, any>
    fontSize: number
    textColor: string
    arrowColor: string
    textDecoration: TextDecoration
    padding: number
    paddingX: number
    gap: number
}

export default function LinkCard(props: Props) {
    const {
        projectId,
        text,
        href,
        openInNewTab,
        showArrow,
        arrowChar,
        font,
        fontSize,
        textColor,
        arrowColor,
        textDecoration,
        padding,
        paddingX,
        gap,
    } = props

    const handleMouseEnter = useCallback(() => {
        setGlobalHoverId(projectId)
    }, [projectId])

    const handleMouseLeave = useCallback(() => {
        setGlobalHoverId(null)
    }, [])

    const handleFocus = useCallback(() => {
        setGlobalHoverId(projectId)
    }, [projectId])

    const handleBlur = useCallback(() => {
        setGlobalHoverId(null)
    }, [])

    // Build text-decoration CSS value
    const buildTextDecoration = () => {
        if (!textDecoration || textDecoration.type === "none") {
            return "none"
        }
        const { type, color, style, thickness } = textDecoration
        const parts = [type]
        if (style && style !== "solid") {
            parts.push(style)
        }
        if (color) {
            parts.push(color)
        }
        if (thickness && thickness !== 1) {
            parts.push(`${thickness}px`)
        }
        return parts.join(" ")
    }

    const getDecorationOffset = () => {
        if (!textDecoration || textDecoration.type === "none") {
            return undefined
        }
        return textDecoration.offset ? `${textDecoration.offset}px` : undefined
    }

    return (
        <a
            data-link-card
            data-project-id={projectId}
            href={href}
            target={openInNewTab ? "_blank" : "_self"}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: `${gap}px`,
                width: "100%",
                height: "100%",
                padding: `${padding}px ${paddingX}px`,
                textDecoration: "none",
                cursor: "pointer",
                position: "relative",
                zIndex: 1,
            }}
        >
            <span
                style={{
                    ...font,
                    fontSize: `${fontSize}px`,
                    color: textColor,
                    textDecoration: buildTextDecoration(),
                    textUnderlineOffset: getDecorationOffset(),
                    lineHeight: 1.4,
                }}
            >
                {text}
            </span>
            {showArrow && (
                <span
                    style={{
                        color: arrowColor,
                        fontSize: `${fontSize}px`,
                        flexShrink: 0,
                    }}
                >
                    {arrowChar}
                </span>
            )}
        </a>
    )
}

// ============================================
// PROPERTY CONTROLS
// ============================================

addPropertyControls(LinkCard, {
    projectId: {
        type: ControlType.String,
        title: "Project ID",
        defaultValue: "project-1",
        description: "Must match Hover_Preview variant name",
    },
    text: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "Link text",
    },
    href: {
        type: ControlType.String,
        title: "URL",
        defaultValue: "#",
    },
    openInNewTab: {
        type: ControlType.Boolean,
        title: "New Tab",
        defaultValue: false,
    },
    showArrow: {
        type: ControlType.Boolean,
        title: "Arrow",
        defaultValue: true,
    },
    arrowChar: {
        type: ControlType.String,
        title: "Arrow Char",
        defaultValue: "→",
        hidden: (props) => !props.showArrow,
    },
    font: {
        type: ControlType.Font,
        title: "Font",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Size",
        defaultValue: 18,
        min: 10,
        max: 72,
        step: 1,
        unit: "px",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#111111",
    },
    arrowColor: {
        type: ControlType.Color,
        title: "Arrow Color",
        defaultValue: "#111111",
        hidden: (props) => !props.showArrow,
    },
    textDecoration: {
        type: ControlType.Object,
        title: "Text Decoration",
        controls: {
            type: {
                type: ControlType.Enum,
                title: "Type",
                options: ["none", "underline", "line-through"],
                optionTitles: ["None", "Underline", "Strikethrough"],
                defaultValue: "underline",
            },
            color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#111111",
                hidden: (props) => props.type === "none",
            },
            style: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "double", "dotted", "dashed", "wavy"],
                optionTitles: ["Solid", "Double", "Dotted", "Dashed", "Wavy"],
                defaultValue: "solid",
                hidden: (props) => props.type === "none",
            },
            thickness: {
                type: ControlType.Number,
                title: "Thickness",
                defaultValue: 1,
                min: 1,
                max: 10,
                step: 1,
                unit: "px",
                hidden: (props) => props.type === "none",
            },
            offset: {
                type: ControlType.Number,
                title: "Offset",
                defaultValue: 2,
                min: -10,
                max: 10,
                step: 1,
                unit: "px",
                hidden: (props) => props.type === "none",
            },
        },
    },
    padding: {
        type: ControlType.Number,
        title: "Padding Y",
        defaultValue: 8,
        min: 0,
        max: 50,
        step: 1,
        unit: "px",
    },
    paddingX: {
        type: ControlType.Number,
        title: "Padding X",
        defaultValue: 12,
        min: 0,
        max: 50,
        step: 1,
        unit: "px",
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: 4,
        min: 0,
        max: 30,
        step: 1,
        unit: "px",
    },
})
