import { motion, useReducedMotion } from 'framer-motion'
import { ProtoLink } from './ProtoLink'
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

export function ProtoHome() {
  const reducedMotion = useReducedMotion()

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
      {/* marginBlock auto = safe centering: falls back to scrollable top-alignment when content overflows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 528, width: '100%', marginBlock: 'auto' }}>
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <img
            src="/images/portrait-table.jpeg"
            alt="Ben Yamron"
            style={{
              width: 36,
              height: 36,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid #D9BB9540',
              boxShadow: '#CCA066CC 0px 0px 12px',
            }}
          />
          <h1
            style={{
              fontFamily: '"Literata", Georgia, serif',
              fontSize: 30,
              fontWeight: 300,
              lineHeight: 1.2,
              color: 'var(--text-dark)',
              margin: 0,
            }}
          >
            Ben Yamron is a product designer. Currently designing AI for scientific research at {L('consensus')}.
          </h1>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <p style={bodyStyle}>
            Previously designed patient experiences and internal tools at {L('mochi-health')}.
          </p>
          <p style={bodyStyle}>
            On the side, I build {L('flow')}, {L('distill')}, {L('trio')}, {L('ripe')}, {L('havana')}, and a bunch of
            other tools and experiments. See more in my {L('arcade')}, {L('github')}, and {L('x')}.
          </p>
          <p style={bodyStyle}>
            I studied Human Centered Design at the University of Washington. Worked with UW-IT, Sony, and the Center
            for an Informed Public. I learned how to think at Middlebury College.
          </p>
        </div>
      </div>
    </motion.main>
  )
}
