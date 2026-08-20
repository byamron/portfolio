import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { usePreview } from './PreviewContext'
import { protoBySlug } from './data'
import { ProtoMediaFill } from './ProtoMedia'
import { EASE, usePageDials, useTypeDials } from './tuning'

const PLACEHOLDER_BODY =
  'Case study coming soon. This page is a prototype of the new navigation model: the hover preview you clicked morphed into the frame above, the background never changed, and the text crossfaded around it.'

export function ProtoCaseStudy() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const { state, registerHero } = usePreview()
  const { bodySize } = useTypeDials()
  const page = usePageDials()

  const entry = slug ? protoBySlug.get(slug) : undefined

  if (!entry) {
    return (
      <main style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--text-dark)' }}>
        <p>Not found. <a href="/new" style={{ color: 'inherit' }}>Back home</a></p>
      </main>
    )
  }

  // Text choreographs around the morphing media: it fades/rises independently,
  // while the hero slot itself never animates in (the preview layer flies into it).
  const textMotion = {
    initial: { opacity: 0, y: reducedMotion ? 0 : page.enterRise },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, transition: { duration: reducedMotion ? 0 : page.exitDuration } },
    transition: { duration: reducedMotion ? 0 : page.enterDuration, ease: EASE },
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : page.exitDuration } }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, width: '100%', marginBlock: 'auto' }}>
        <motion.div {...textMotion} style={{ width: '100%', maxWidth: 528, display: 'flex' }}>
          <button
            type="button"
            aria-label="Back to home"
            onClick={() => navigate('/new')}
            style={{
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
            }}
          >
            ←
          </button>
        </motion.div>

        {/* Exit shrinks + fades the hero while home crossfades back in. */}
        <motion.div
          ref={registerHero}
          exit={{ scale: reducedMotion ? 1 : page.heroShrink }}
          transition={{ duration: page.exitDuration, ease: EASE }}
          style={{
            position: 'relative',
            width: 'min(800px, 100%)',
            aspectRatio: '8 / 5',
            borderRadius: 16,
            overflow: 'hidden',
            flexShrink: 0,
            // The preview layer paints on top until it docks; keep the slot present
            // (so it can be measured) but visually silent until handoff.
            opacity: state.phase === 'morph' ? 0 : 1,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.10)',
          }}
        >
          <ProtoMediaFill media={entry.media} label={entry.label} />
        </motion.div>

        <motion.div {...textMotion} style={{ width: '100%', maxWidth: 528 }}>
          <p
            style={{
              fontFamily: '"Onest", system-ui, sans-serif',
              fontSize: bodySize + 2,
              fontWeight: 300,
              lineHeight: 1.35,
              color: 'var(--text-dark)',
              margin: 0,
            }}
          >
            {entry.blurb} {PLACEHOLDER_BODY}
          </p>
        </motion.div>
      </div>
    </motion.main>
  )
}
