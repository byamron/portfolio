import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { useTheme, VALID_ACCENTS } from '@/contexts/ThemeContext'
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

const ACCENTS = ['table', 'portrait', 'pizza', 'vineyard', 'sky'] as const
const portraitSrc = (accent: string) => `/images/portrait-square-${accent}.jpg`

/**
 * Ben's portrait as the theme's face (/new/simple): click cycles the accent,
 * as clicking the big portrait does on prod, and it pops whenever the theme
 * changes (from here or from the sidebar).
 */
export function ThemePortrait() {
  const { accentColor, cycleAccent } = useTheme()
  const reducedMotion = useReducedMotion()
  const pop = useAnimationControls()
  const prevAccent = useRef(accentColor)
  // Empty until the theme actually changes, so it isn't read out on load.
  const [announce, setAnnounce] = useState('')

  useEffect(() => {
    if (prevAccent.current === accentColor) return
    // Tilt with the direction the theme moved through the swatch order, so
    // repeat clicks turn like cards in a stack rather than replaying one move.
    // (Cycle order — what a portrait click steps through; wrap counts as forward.)
    const n = VALID_ACCENTS.length
    const step = (VALID_ACCENTS.indexOf(accentColor) - VALID_ACCENTS.indexOf(prevAccent.current) + n) % n
    const forward = step <= n / 2
    prevAccent.current = accentColor
    setAnnounce(`Theme changed to ${accentColor}`)
    if (reducedMotion) return
    // Snap to a squash on the same frame as the swap, then spring past 1 and
    // settle: reads as the new photo bouncing in.
    pop.set({ scale: 0.82, rotate: forward ? -5 : 5 })
    pop.start({ scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 520, damping: 13, mass: 0.6 } })
  }, [accentColor, pop, reducedMotion])

  return (
    <>
    <button
      type="button"
      aria-label="Change theme color"
      onClick={() => {
        cycleAccent()
        document.dispatchEvent(new CustomEvent('accent-cycled'))
      }}
      className="proto-portrait theme-portrait"
      style={{ ...wrapper, padding: 0, border: 'none', background: 'none', font: 'inherit', cursor: 'pointer', borderRadius: '22%' }}
    >
      <motion.span animate={pop} style={{ position: 'relative', display: 'block', width: '100%', height: '100%' }}>
        {/* All five crops stay mounted (already decoded), so a theme change
            swaps the visible one on the same frame — no load or decode lag. */}
        {ACCENTS.map(a => (
          <img
            key={a}
            src={portraitSrc(a)}
            alt=""
            decoding="sync"
            style={{ ...image, position: 'absolute', inset: 0, visibility: a === accentColor ? 'visible' : 'hidden' }}
          />
        ))}
      </motion.span>
    </button>
    {/* Announced from outside the sentence, so browse mode doesn't read it
        as part of the intro. */}
    {createPortal(<span className="sr-only" role="status">{announce}</span>, document.body)}
    </>
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
