import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { usePreview } from './PreviewContext'
import { protoBySlug } from './data'
import { ProtoMediaFill } from './ProtoMedia'

export function ProtoCaseStudy() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const { registerHero, heroVisible } = usePreview()
  const heroRef = useRef<HTMLDivElement>(null)

  const entry = slug ? protoBySlug.get(slug) : undefined

  useEffect(() => {
    registerHero(heroRef.current)
    return () => registerHero(null)
  }, [registerHero])

  if (!entry) {
    return (
      <main style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--text-dark)' }}>
        <p>Not found. <a href="/new" style={{ color: 'inherit' }}>Back home</a></p>
      </main>
    )
  }

  // Text choreographs around the morphing media: it fades/rises independently,
  // while the hero slot itself never animates (the preview layer flies into it).
  const textMotion = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, transition: { duration: reducedMotion ? 0 : 0.22 } },
    transition: { duration: reducedMotion ? 0 : 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.22 } }}
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

        <div
          ref={heroRef}
          style={{
            position: 'relative',
            width: 'min(800px, 100%)',
            aspectRatio: '8 / 5',
            borderRadius: 16,
            overflow: 'hidden',
            flexShrink: 0,
            // The preview layer paints on top until it docks; keep the slot present
            // (so it can be measured) but visually silent until handoff.
            opacity: heroVisible ? 1 : 0,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.10)',
          }}
        >
          <ProtoMediaFill media={entry.media} label={entry.label} />
        </div>

        <motion.div {...textMotion} style={{ width: '100%', maxWidth: 528 }}>
          <p
            style={{
              fontFamily: '"Onest", system-ui, sans-serif',
              fontSize: 20,
              fontWeight: 300,
              lineHeight: 1.35,
              color: 'var(--text-dark)',
              margin: 0,
            }}
          >
            {entry.body}
          </p>
        </motion.div>
      </div>
    </motion.main>
  )
}
