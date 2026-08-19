import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ProtoLink } from './ProtoLink'
import { ProtoSettingsPanel } from './ProtoSettingsPanel'
import { protoBySlug } from './data'

const L = (id: string) => <ProtoLink entry={protoBySlug.get(id)!} />

const bodyStyle: React.CSSProperties = {
  fontFamily: '"Onest", system-ui, sans-serif',
  fontSize: 'var(--text-size-body)',
  fontWeight: 300,
  lineHeight: 1.35,
  color: 'var(--text-dark)',
  margin: 0,
}

const THUMB = 36
const THUMB_GAP = 10

export function ProtoHome() {
  const reducedMotion = useReducedMotion()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const swap = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -6 },
    transition: { duration: reducedMotion ? 0 : 0.24, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.22 } }}
      transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
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
        {/* Persistent thumbnail — inline-leading the name, and the toggle into the customization panel. */}
        <button
          type="button"
          aria-label={settingsOpen ? 'Close customization' : 'Customize appearance'}
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen(o => !o)}
          style={{
            position: 'absolute',
            top: 2,
            left: 0,
            width: THUMB,
            height: THUMB,
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
            src="/images/portrait-table.jpeg"
            alt="Ben Yamron"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {!settingsOpen ? (
            <motion.div key="prose" {...swap} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              <h1
                style={{
                  fontFamily: '"Literata", Georgia, serif',
                  fontSize: 30,
                  fontWeight: 300,
                  lineHeight: 1.2,
                  color: 'var(--text-dark)',
                  margin: 0,
                  // First line clears the absolute thumbnail so the name reads inline after it.
                  textIndent: THUMB + THUMB_GAP,
                }}
              >
                Ben Yamron is a product designer. Currently designing AI for scientific research at {L('consensus')}.
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <p style={bodyStyle}>
                  Previously designed patient experiences and internal tools at {L('mochi-health')}.
                </p>
                <p style={bodyStyle}>
                  On the side, I build {L('flow')}, {L('distill')}, {L('trio')}, {L('ripe')}, {L('havana')}, and a
                  bunch of other tools and experiments. See more in my {L('arcade')}, {L('github')}, and {L('x')}.
                </p>
                <p style={bodyStyle}>
                  I studied Human Centered Design at the University of Washington. Worked with {L('uw')}, {L('sony')},
                  and the {L('cip')}. I learned how to think at Middlebury College.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="panel" {...swap} style={{ paddingTop: THUMB + 16 }}>
              <ProtoSettingsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  )
}
