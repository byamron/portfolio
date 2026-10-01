import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { ContributionStrip } from '@/components/ContributionStrip'
import { FlockX } from '@/components/FlockX'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { InlineIcon, InlinePortrait } from './InlineIcon'
import { ProtoLink } from './ProtoLink'
import { ProtoSettingsPanel } from './ProtoSettingsPanel'
import { protoBySlug } from './data'
import { EASE, useLayoutDials, useExperimentDials, usePageDials } from './tuning'

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

export function ProtoHome() {
  const reducedMotion = useReducedMotion()
  const { accentColor, bgIntensity } = useTheme()
  const layout = useLayoutDials()
  const experiments = useExperimentDials()
  const page = usePageDials()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [thumbHovered, setThumbHovered] = useState(false)
  const thumbRef = useRef<HTMLButtonElement>(null)

  // Glass pill hover on inline prose links (excluding the X link, which has its own)
  const proseRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(proseRef, {
    cardSelector: '[data-proto-link]',
    borderRadius: 8,
    clearDelay: 200,
  })

  // FlockX gets its own isolated glass pill instance — exactly like production's
  // AboutSection contactRef pattern. Sharing a pill with the prose container
  // causes the shatter cracks to misalign and the pill lifecycle to conflict.
  const xLinkContainerRef = useRef<HTMLSpanElement>(null)
  const xGlassApi = useGlassHighlight(xLinkContainerRef, {
    cardSelector: '[data-contact-card]',
    borderRadius: 8,
    clearDelay: 300,
    pillMaxLean: 0.5,
    pillMaxTilt: 0.5,
    cardMaxLean: 0,
    pullStrength: 0,
  })

  const [glowPulse, setGlowPulse] = useState(false)
  useEffect(() => {
    if (!experiments['Glow pulse on release']) return
    const handler = () => { setGlowPulse(true); setTimeout(() => setGlowPulse(false), 500) }
    window.addEventListener('proto-glow-pulse', handler)
    return () => window.removeEventListener('proto-glow-pulse', handler)
  }, [experiments])

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

  const glowT = lerp(0.45, 1.0, bgIntensity)
  const pulseBoost = glowPulse ? 10 : 0
  const baseSpread = lerp(0, 14, bgIntensity) + pulseBoost
  const baseAlpha = lerp(0, 0.5, bgIntensity) + (glowPulse ? 0.15 : 0)
  const glow = bgIntensity > 0.01 || glowPulse
    ? `0 0 ${(thumbHovered ? baseSpread + 6 : baseSpread).toFixed(1)}px color-mix(in srgb, var(--swatch) ${Math.round((thumbHovered ? baseAlpha + 0.12 : baseAlpha) * 100)}%, transparent)`
    : 'none'

  // Portrait is 3:4 aspect, width = portraitHeight * 0.75
  const portraitW = Math.round(layout.portraitHeight * 0.75)

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
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Contribution strip — top position */}
      {layout.contribOnTop && (
        <div style={{ alignSelf: 'stretch', flexShrink: 0 }}>
          <ContributionStrip labelPosition="bottom" />
        </div>
      )}

      <div style={{ maxWidth: layout.contentMaxWidth, width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ position: 'relative' }}>
          {/* Back button — absolutely positioned above */}
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
                transition={fade}
                style={{ position: 'absolute', top: -56, left: 0 }}
              >
                <button
                  type="button" aria-label="Back to home" onClick={closeSettings}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'transparent' }}
                  onFocus={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))' }}
                  onBlur={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'transparent' }}
                  style={backButtonStyle}
                >←</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Portrait thumbnail — 3:4 aspect, above the heading */}
          {layout.showPortrait && <button
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
              width: portraitW,
              height: layout.portraitHeight,
              padding: 0,
              border: `1px solid color-mix(in srgb, var(--swatch) ${Math.round(glowT * 25)}%, transparent)`,
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'transparent',
              boxShadow: glow,
              transform: thumbHovered && !reducedMotion ? 'scale(1.03)' : 'scale(1)',
              transition: 'border-color 300ms ease-in-out, transform 200ms ease-out',
              marginBottom: layout.thumbGap,
              display: 'block',
            }}
          >
            <img
              src={`/images/portrait-thumb-${accentColor}.jpg`}
              alt="Ben Yamron"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>}

          {/* Prose */}
          <motion.div
            animate={{
              opacity: settingsOpen ? 0 : 1,
              transitionEnd: { visibility: settingsOpen ? 'hidden' : 'visible' },
            }}
            transition={fade}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <h1
              style={{
                fontFamily: `"${layout.headingFont}", Georgia, serif`,
                fontSize: layout.headingSize,
                fontWeight: 300,
                lineHeight: layout.headingLineHeight,
                color: 'var(--text-dark)',
                margin: 0,
              }}
            >
              <InlinePortrait />{' '}Ben Yamron is a product designer, currently designing AI for scientific research at{' '}
              <span style={{ whiteSpace: 'nowrap' }}><InlineIcon src="/images/logo-consensus.svg" alt="Consensus" href="https://consensus.app/" />{' '}{L('consensus')}</span>
            </h1>

            <div ref={proseRef} style={{ marginTop: layout.headingBodyGap, display: 'flex', flexDirection: 'column', gap: layout.paragraphGap, fontFamily: `"${layout.bodyFont}", system-ui, sans-serif`, fontSize: layout.bodySize, fontWeight: 300, lineHeight: layout.bodyLineHeight, color: 'var(--text-dark)', position: 'relative' }}>
              <p style={{ margin: 0 }}>
                Previously designed {L('mochi-subscriptions')} and {L('mochi-ai-tooling')} at{' '}
                <span style={{ whiteSpace: 'nowrap' }}><InlineIcon src="/images/logo-mochi.svg" alt="Mochi Health" href="https://joinmochi.com/" context="body" />{' '}{L('mochi-health')}</span>.
              </p>
              <p style={{ margin: 0 }}>
                On the side, I build tools and experiments like {L('flow')}, {L('distill')}, {L('havana')}, and {L('ripe')}. See more in my {L('arcade')}, {L('github')}, and{' '}
                <span ref={xLinkContainerRef} style={{ position: 'relative', display: 'inline' }}>
                  <FlockX
                    href="https://x.com/benyamron"
                    glassApi={xGlassApi}
                    style={{ color: 'inherit', textDecoration: 'none', whiteSpace: 'nowrap', padding: '4px 6px', margin: '0 -6px' }}
                  >X</FlockX>
                </span>.
              </p>
              <p style={{ margin: 0 }}>
                I studied Human-Centered Design at the{' '}
                <span style={{ whiteSpace: 'nowrap' }}><InlineIcon src="/images/logo-uw.svg" alt="University of Washington" context="body" />{' '}University of Washington</span>, where I worked with {L('uw')},{' '}
                <span style={{ whiteSpace: 'nowrap' }}><InlineIcon src="/images/logo-sony.svg" alt="Sony" context="body" />{' '}{L('sony')}</span>, and the {L('cip')}. I learned how to think at{' '}
                <span style={{ whiteSpace: 'nowrap' }}><InlineIcon src="/images/logo-middlebury.svg" alt="Middlebury College" context="body" />{' '}Middlebury College</span>.
              </p>
            </div>
          </motion.div>

          {/* Settings panel */}
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                transition={fade}
                style={{ position: 'absolute', top: layout.portraitHeight + layout.thumbGap + 20, left: 0, right: 0 }}
              >
                <ProtoSettingsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Contribution strip — bottom position */}
      {!layout.contribOnTop && (
        <div style={{ alignSelf: 'stretch', marginTop: 48, paddingBottom: layout.bottomMargin, flexShrink: 0 }}>
          <ContributionStrip />
        </div>
      )}
    </motion.main>
  )
}
