import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { useTheme } from '@/contexts/ThemeContext'
import { ProtoLink } from './ProtoLink'
import { ProtoSettingsPanel } from './ProtoSettingsPanel'
import { protoBySlug } from './data'
import { EASE, usePageDials, useTypeDials } from './tuning'

const L = (id: string) => <ProtoLink entry={protoBySlug.get(id)!} />

const THUMB_GAP = 10

export function ProtoHome() {
  const reducedMotion = useReducedMotion()
  const { accentColor } = useTheme()
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
      <div style={{ position: 'relative', maxWidth: 528, width: '100%', marginBlock: 'auto' }}>
        {/*
          The thumbnail leads the first line of the name and never moves — it is
          the shared anchor between the prose and the customization panel. The
          prose stays mounted (opacity 0) while the panel is open so the column
          keeps its height and nothing re-centers.
        */}
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
            border: '1px solid #D9BB9540',
            borderRadius: 4,
            overflow: 'hidden',
            cursor: 'pointer',
            background: 'transparent',
            boxShadow: '#CCA066CC 0px 0px 12px',
            zIndex: 2,
          }}
        >
          <img
            src={`/images/portrait-${accentColor}.jpeg`}
            alt="Ben Yamron"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: settingsOpen ? 'brightness(0.45)' : 'none',
              transition: 'filter 200ms ease',
            }}
          />
          <AnimatePresence>
            {settingsOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
                style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff' }}
              >
                <X size={Math.max(14, thumb * 0.4)} weight="bold" />
              </motion.span>
            )}
          </AnimatePresence>
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
            Ben Yamron is a product designer. Currently designing AI for scientific research at {L('consensus')}.
          </h1>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
              fontFamily: '"Onest", system-ui, sans-serif',
              fontSize: bodySize,
              fontWeight: 300,
              lineHeight: 1.35,
              color: 'var(--text-dark)',
            }}
          >
            <p style={{ margin: 0 }}>
              Previously designed patient experiences and internal tools at {L('mochi-health')}.
            </p>
            <p style={{ margin: 0 }}>
              On the side, I build {L('flow')}, {L('distill')}, {L('trio')}, {L('ripe')}, {L('havana')}, and a
              bunch of other tools and experiments. See more in my {L('arcade')}, {L('github')}, and {L('x')}.
            </p>
            <p style={{ margin: 0 }}>
              I studied Human Centered Design at the University of Washington. Worked with {L('uw')}, {L('sony')},
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
    </motion.main>
  )
}
