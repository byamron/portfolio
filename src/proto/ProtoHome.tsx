import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { ProtoLink } from './ProtoLink'
import { ProtoSettingsPanel } from './ProtoSettingsPanel'
import { protoBySlug } from './data'
import { EASE, usePageDials, useTypeDials } from './tuning'

const L = (id: string) => <ProtoLink entry={protoBySlug.get(id)!} />

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const bodyStyle: React.CSSProperties = {
  fontFamily: '"Onest", system-ui, sans-serif',
  fontSize: 'var(--text-size-body)',
  fontWeight: 300,
  lineHeight: 1.35,
  color: 'var(--text-dark)',
  margin: 0,
}

// Matches the case-study back button exactly (ProtoCaseStudy.tsx).
const backButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'grid',
  placeItems: 'center',
  background: 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))',
  color: 'var(--text-dark)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 18,
  fontFamily: '"Onest", system-ui, sans-serif',
}

const THUMB_GAP = 10
const BACK_BUTTON_OFFSET = 56 // back button height (40) + gap (16), floated above the anchor

export function ProtoHome() {
  const reducedMotion = useReducedMotion()
  const { accentColor, bgIntensity } = useTheme()
  const { headingSize, headingLineHeight, bodySize, thumb } = useTypeDials()
  const page = usePageDials()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [thumbHovered, setThumbHovered] = useState(false)
  const thumbRef = useRef<HTMLButtonElement>(null)

  const closeSettings = () => {
    setSettingsOpen(false)
    thumbRef.current?.focus()
  }

  useEffect(() => {
    if (!settingsOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSettings() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen])

  const fade = { duration: reducedMotion ? 0 : 0.24, ease: EASE }

  // Same atmospheric two-channel formula as the sidebar's intensity trigger dot
  // (SidebarThemeControls.tsx: opacity lerp(0.45,1,t) + glow lerp(0,14,t)).
  // Applying the opacity channel to the photo itself would fade Ben's face in
  // and out while dragging the slider, so it's redirected to the border's
  // alpha instead — same two-channel read (glow intensity + frame presence),
  // without dimming the image.
  const glowT = lerp(0.45, 1.0, bgIntensity)
  const glow = bgIntensity > 0.01
    ? `0 0 ${lerp(0, 14, bgIntensity).toFixed(1)}px color-mix(in srgb, var(--swatch) ${Math.round(lerp(0, 0.5, bgIntensity) * 100)}%, transparent)`
    : 'none'
  const hoverGlow = thumbHovered
    ? `0 0 ${(lerp(0, 14, bgIntensity) + 6).toFixed(1)}px color-mix(in srgb, var(--swatch) ${Math.round((lerp(0, 0.5, bgIntensity) + 0.12) * 100)}%, transparent)`
    : glow

  return (
    <motion.main
      initial={{ opacity: 0, y: reducedMotion ? 0 : page.enterRise }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : page.exitDuration } }}
      transition={{ duration: reducedMotion ? 0 : page.enterDuration, ease: EASE }}
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 24px',
      }}
    >
      <div style={{ maxWidth: 528, width: '100%', marginBlock: 'auto' }}>
        {/*
          Thumbnail + back button + prose + panel all anchor to this single box.
          Its height is driven only by the prose (panel is absolute), so opening
          the panel never changes this box's height — and therefore never moves
          the thumbnail, which stays screen-fixed the way round 3 established.
        */}
        <div style={{ position: 'relative' }}>
          <button
            ref={thumbRef}
            type="button"
            aria-label={settingsOpen ? 'Close customization' : 'Customize appearance'}
            aria-expanded={settingsOpen}
            onClick={() => (settingsOpen ? closeSettings() : setSettingsOpen(true))}
            onMouseEnter={() => setThumbHovered(true)}
            onMouseLeave={() => setThumbHovered(false)}
            onFocus={() => setThumbHovered(true)}
            onBlur={() => setThumbHovered(false)}
            style={{
              position: 'absolute',
              top: 2,
              left: 0,
              width: thumb,
              height: thumb,
              padding: 0,
              border: `1px solid color-mix(in srgb, var(--swatch) ${Math.round(glowT * 25)}%, transparent)`,
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'transparent',
              boxShadow: hoverGlow,
              transform: thumbHovered && !reducedMotion ? 'scale(1.04)' : 'scale(1)',
              transition: 'box-shadow 300ms ease-in-out, border-color 300ms ease-in-out, transform 200ms ease-out',
              zIndex: 2,
            }}
          >
            <img
              src={`/images/portrait-square-${accentColor}.jpg`}
              alt="Ben Yamron"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>

          {/*
            Back button — visually ABOVE the thumbnail (negative-offset absolute,
            never in normal flow, so it can't push the anchor down) and AFTER the
            thumbnail in DOM order, so Tab from the thumbnail reaches it before
            the panel controls below.
          */}
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                transition={fade}
                style={{ position: 'absolute', top: -BACK_BUTTON_OFFSET, left: 0 }}
              >
                <button type="button" aria-label="Back to home" onClick={closeSettings} style={backButtonStyle}>
                  ←
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={{
              opacity: settingsOpen ? 0 : 1,
              transitionEnd: { visibility: settingsOpen ? 'hidden' : 'visible' },
            }}
            transition={fade}
            style={{ display: 'flex', flexDirection: 'column', gap: 40 }}
          >
            <h1
              style={{
                fontFamily: '"Literata", Georgia, serif',
                fontSize: headingSize,
                fontWeight: 300,
                lineHeight: headingLineHeight,
                color: 'var(--text-dark)',
                margin: 0,
                // First line clears the absolute thumbnail so the name reads inline after it.
                textIndent: thumb + THUMB_GAP,
              }}
            >
              Ben Yamron is a product designer, currently designing AI for scientific research at {L('consensus')}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, ...bodyStyle, fontSize: bodySize }}>
              <p style={{ margin: 0 }}>
                Previously designed {L('mochi-subscriptions')} and {L('mochi-ai-tooling')} at {L('mochi-health')}.
              </p>
              <p style={{ margin: 0 }}>
                On the side, I build {L('flow')}, {L('distill')}, {L('trio')}, {L('ripe')}, {L('havana')}, and a
                bunch of other tools and experiments. See more in my {L('arcade')}, {L('github')}, and {L('x')}.
              </p>
              <p style={{ margin: 0 }}>
                I studied Human Centered Design at the University of Washington. I worked with {L('uw')}, {L('sony')},
                and the {L('cip')}. I learned how to think at Middlebury College.
              </p>
            </div>
          </motion.div>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                transition={fade}
                style={{ position: 'absolute', top: thumb + 2 + 28, left: 0, right: 0 }}
              >
                <ProtoSettingsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  )
}
