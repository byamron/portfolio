import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTheme, type AccentColor } from '@/contexts/ThemeContext'
import { ProtoLink } from './ProtoLink'
import { ProtoSettingsPanel } from './ProtoSettingsPanel'
import { protoBySlug } from './data'
import { EASE, usePageDials, useSettingsDials, useTypeDials } from './tuning'

const L = (id: string) => <ProtoLink entry={protoBySlug.get(id)!} />

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const backButtonStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'grid',
  placeItems: 'center',
  background: 'transparent',
  color: 'var(--text-dark)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 18,
  fontFamily: '"Onest", system-ui, sans-serif',
  opacity: 0.5,
  transition: 'opacity 160ms ease, background 160ms ease',
}

const BACK_BUTTON_HEIGHT = 40
const BACK_GAP = 16

export function ProtoHome() {
  const reducedMotion = useReducedMotion()
  const { accentColor, bgIntensity } = useTheme()
  const { headingSize, headingLineHeight, bodySize } = useTypeDials()
  const page = usePageDials()
  const settings = useSettingsDials()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [thumbHovered, setThumbHovered] = useState(false)
  const thumbRef = useRef<HTMLButtonElement>(null)

  const [previewAccent, setPreviewAccent] = useState<AccentColor | null>(null)

  const [glowPulse, setGlowPulse] = useState(false)
  useEffect(() => {
    const handler = () => { setGlowPulse(true); setTimeout(() => setGlowPulse(false), 500) }
    window.addEventListener('proto-glow-pulse', handler)
    return () => window.removeEventListener('proto-glow-pulse', handler)
  }, [])

  const closeSettings = () => {
    setSettingsOpen(false)
    setPreviewAccent(null)
    thumbRef.current?.focus()
  }

  useEffect(() => {
    if (!settingsOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSettings() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen])

  const handleHoverAccent = useCallback((accent: AccentColor | null) => {
    setPreviewAccent(accent)
  }, [])

  const fade = { duration: reducedMotion ? 0 : 0.24, ease: EASE }

  const glowT = lerp(0.45, 1.0, bgIntensity)
  const pulseBoost = glowPulse ? 10 : 0
  const baseSpread = lerp(0, 14, bgIntensity) + pulseBoost
  const baseAlpha = lerp(0, 0.5, bgIntensity) + (glowPulse ? 0.15 : 0)
  const glow = bgIntensity > 0.01 || glowPulse
    ? `0 0 ${(thumbHovered ? baseSpread + 6 : baseSpread).toFixed(1)}px color-mix(in srgb, var(--swatch) ${Math.round((thumbHovered ? baseAlpha + 0.12 : baseAlpha) * 100)}%, transparent)`
    : 'none'

  const thumbSize = settings.portraitSize

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
        {/* Back button — absolutely positioned above the content block so it
            doesn't shift the thumbnail when it appears/disappears */}
        <div style={{ position: 'relative' }}>
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                transition={fade}
                style={{ position: 'absolute', top: -(BACK_BUTTON_HEIGHT + BACK_GAP), left: 0 }}
              >
                <button
                  type="button"
                  aria-label="Back to home"
                  onClick={closeSettings}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'transparent' }}
                  onFocus={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))' }}
                  onBlur={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'transparent' }}
                  style={backButtonStyle}
                >
                  ←
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thumbnail — above the heading in normal flow, always the same size */}
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
              width: thumbSize,
              height: thumbSize,
              padding: 0,
              border: `1px solid color-mix(in srgb, var(--swatch) ${Math.round(glowT * 25)}%, transparent)`,
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'transparent',
              boxShadow: glow,
              transform: thumbHovered && !reducedMotion ? 'scale(1.03)' : 'scale(1)',
              transition: 'border-color 300ms ease-in-out, transform 200ms ease-out',
              marginBottom: 16,
              display: 'block',
            }}
          >
            <img
              src={`/images/portrait-square-${previewAccent ?? accentColor}.jpg`}
              alt="Ben Yamron"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>

          {/* Prose — fades out when settings are open, stays mounted for stable height */}
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
              }}
            >
              Ben Yamron is a product designer, currently designing AI for scientific research at {L('consensus')}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22, fontFamily: '"Onest", system-ui, sans-serif', fontSize: bodySize, fontWeight: 300, lineHeight: 1.35, color: 'var(--text-dark)' }}>
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

          {/* Settings panel — positioned below the thumbnail */}
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                transition={fade}
                style={{ position: 'absolute', top: thumbSize + 16 + 20, left: 0, right: 0 }}
              >
                <ProtoSettingsPanel onHoverAccent={handleHoverAccent} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  )
}
