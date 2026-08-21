import { useEffect, useState } from 'react'
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

export function ProtoHome() {
  const reducedMotion = useReducedMotion()
  const { accentColor, bgIntensity } = useTheme()
  const { headingSize, headingLineHeight, bodySize, thumb } = useTypeDials()
  const page = usePageDials()
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (!settingsOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSettingsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settingsOpen])

  const fade = { duration: reducedMotion ? 0 : 0.24, ease: EASE }

  // Same atmospheric glow formula as the sidebar's intensity trigger dot
  // (SidebarThemeControls.tsx) — the thumbnail's aura now tracks the same
  // background-intensity slider instead of a fixed warm-gold glow.
  const glow = bgIntensity > 0.01
    ? `0 0 ${lerp(0, 14, bgIntensity).toFixed(1)}px color-mix(in srgb, var(--swatch) ${Math.round(lerp(0, 0.5, bgIntensity) * 100)}%, transparent)`
    : 'none'

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
          Back button — same element/position/style as the case-study back
          button, appearing ABOVE the header (never overlaid on the thumbnail).
          It's the dedicated close affordance; the thumbnail itself stays a
          plain, undimmed photo at all times and remains clickable to toggle.
        */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              transition={fade}
              style={{ marginBottom: 24 }}
            >
              <button type="button" aria-label="Back to home" onClick={() => setSettingsOpen(false)} style={backButtonStyle}>
                ←
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnail + prose + panel all anchor to this box, independent of the back button above. */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-label={settingsOpen ? 'Close customization' : 'Customize appearance'}
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen(o => !o)}
            style={{
              position: 'absolute',
              top: 2,
              left: 0,
              width: thumb,
              height: thumb,
              padding: 0,
              border: '1px solid color-mix(in srgb, var(--swatch) 25%, transparent)',
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'transparent',
              boxShadow: glow,
              transition: 'box-shadow 300ms ease-in-out, border-color 300ms ease-in-out',
              zIndex: 2,
            }}
          >
            <img
              src={`/images/portrait-square-${accentColor}.jpg`}
              alt="Ben Yamron"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>

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
