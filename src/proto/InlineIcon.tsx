import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { THEME_SIDEBAR_STATE, THEME_SIDEBAR_TOGGLE } from '@/components/SidebarThemeControls'

// Sized in em so icons track the prose size at every breakpoint:
// line-height (1.3) × 0.75 ≈ the largest square that sits inside the line box.
const SIZE = '0.975em'

const wrapper: React.CSSProperties = {
  display: 'inline-flex',
  width: SIZE,
  height: SIZE,
  verticalAlign: 'middle',
  // Asymmetric pull: centres on cap height rather than x-height, and the
  // negative margins keep the icon from growing the line box.
  marginTop: '-0.45em',
  marginBottom: '-0.25em',
  flexShrink: 0,
}

const image: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '22%',
  display: 'block',
}

/** Decorative: the name always follows, so the icon stays silent to AT. */
export function InlineIcon({ src }: { src: string }) {
  return (
    <span style={wrapper} aria-hidden="true">
      <img src={src} alt="" style={image} />
    </span>
  )
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const NUDGE_KEY = 'portrait-nudged'

/**
 * Ben's portrait doubles as the theme control: click opens the sidebar
 * (pinned until a click outside or Escape). It wears the same intensity-
 * linked accent glow the sidebar's trigger square used to, so the theme
 * visibly lives here, and nudges once per visit after the page settles.
 */
export function InlinePortrait({ nudgeAfterMs }: { nudgeAfterMs: number }) {
  const { accentColor, bgIntensity } = useTheme()
  const reducedMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const nudge = useAnimationControls()

  useEffect(() => {
    const onState = (e: Event) => setOpen(!!(e as CustomEvent<{ open: boolean }>).detail?.open)
    window.addEventListener(THEME_SIDEBAR_STATE, onState)
    return () => window.removeEventListener(THEME_SIDEBAR_STATE, onState)
  }, [])

  useEffect(() => {
    if (reducedMotion || sessionStorage.getItem(NUDGE_KEY)) return
    const timer = setTimeout(() => {
      sessionStorage.setItem(NUDGE_KEY, '1')
      nudge.start({ rotate: [0, -9, 7, -4, 2, 0], transition: { duration: 0.7, ease: 'easeInOut' } })
    }, nudgeAfterMs)
    return () => clearTimeout(timer)
  }, [nudge, nudgeAfterMs, reducedMotion])

  const lit = hovered || open
  const spread = lerp(0, 14, bgIntensity) + (lit ? 6 : 0)
  const alpha = Math.round((lerp(0, 0.5, bgIntensity) + (lit ? 0.15 : 0)) * 100)

  return (
    <button
      ref={buttonRef}
      type="button"
      data-theme-sidebar-trigger
      aria-label="Customize theme"
      aria-expanded={open}
      onClick={() => window.dispatchEvent(new CustomEvent(THEME_SIDEBAR_TOGGLE, { detail: { opener: buttonRef.current } }))}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="proto-portrait"
      style={{ ...wrapper, padding: 0, border: 'none', background: 'none', font: 'inherit', cursor: 'pointer', borderRadius: '22%' }}
    >
      {/* Lift + glow here; Framer owns transform on the inner span (nudge). */}
      <span
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: '22%',
          transform: lit && !reducedMotion ? 'translateY(-0.04em) scale(1.06)' : 'none',
          boxShadow: spread > 0.5 ? `0 0 ${spread.toFixed(1)}px color-mix(in srgb, var(--swatch) ${alpha}%, transparent)` : 'none',
          transition: 'transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms ease',
        }}
      >
        <motion.span animate={nudge} style={{ display: 'block', width: '100%', height: '100%' }}>
          <img src={`/images/portrait-square-${accentColor}.jpg`} alt="" style={image} />
        </motion.span>
      </span>
    </button>
  )
}
