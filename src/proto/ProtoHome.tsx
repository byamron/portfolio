import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ContributionStrip } from '@/components/ContributionStrip'
import { SignatureAnimation } from '@/components/SignatureAnimation'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { InlineIcon, InlinePortrait } from './InlineIcon'
import { ProtoLink } from './ProtoLink'
import { protoBySlug } from './data'

const L = (id: string) => <ProtoLink entry={protoBySlug.get(id)!} />

const EASE = [0.25, 0.46, 0.45, 0.94] as const

// Baked layout values (were DialKit-tunable — these are the final Uniform preset values)
const LAYOUT = {
  bodySize: 40,
  bodyLineHeight: 1.3,
  bodyFont: 'Literata',
  paragraphGap: 40,
  contentMaxWidth: 920,
  contentTopPadding: 80,
  iconScale: 0.75,
}

export function ProtoHome() {
  const reducedMotion = useReducedMotion()

  // Glass pill hover on inline prose links
  const proseRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(proseRef, {
    cardSelector: '[data-proto-link]',
    borderRadius: 8,
    clearDelay: 200,
  })

  return (
    <motion.main
      initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.22 } }}
      transition={{ duration: reducedMotion ? 0 : 0.35, ease: EASE }}
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
      {/* Contribution strip — top */}
      <div style={{ alignSelf: 'stretch', flexShrink: 0 }}>
        <ContributionStrip labelPosition="bottom" />
      </div>

      <div style={{ maxWidth: LAYOUT.contentMaxWidth, width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `${LAYOUT.contentTopPadding}px 24px 48px` }}>
        <div ref={proseRef} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: LAYOUT.paragraphGap,
          fontFamily: `"${LAYOUT.bodyFont}", Georgia, serif`,
          fontSize: LAYOUT.bodySize,
          fontWeight: 300,
          lineHeight: LAYOUT.bodyLineHeight,
          color: 'var(--text-grey)',
          position: 'relative',
        }}>
          <p style={{ margin: 0 }}>
            <InlinePortrait />{' '}
            <span style={{ color: 'var(--text-dark)' }}>Ben Yamron</span> is a product designer, currently designing AI for scientific research at{' '}
            <span style={{ whiteSpace: 'nowrap', color: 'var(--text-dark)' }}><InlineIcon src="/images/logo-consensus.svg" alt="Consensus" href="https://consensus.app/" />{' '}{L('consensus')}</span>.
          </p>
          <p style={{ margin: 0 }}>
            Previously, I designed patient experiences at{' '}
            <span style={{ whiteSpace: 'nowrap', color: 'var(--text-dark)' }}><InlineIcon src="/images/logo-mochi.svg" alt="Mochi Health" href="https://joinmochi.com/" context="body" />{' '}{L('mochi-health')}</span>.
          </p>
          <p style={{ margin: 0 }}>
            On the side, I build tools and experiments. See more on {L('github')} and {L('x')}.
          </p>
          <p style={{ margin: 0 }}>
            I studied design at the{' '}
            <span style={{ whiteSpace: 'nowrap', color: 'var(--text-dark)' }}><InlineIcon src="/images/logo-uw.svg" alt="University of Washington" context="body" />{' '}University of Washington</span>, and I learned how to think at{' '}
            <span style={{ whiteSpace: 'nowrap', color: 'var(--text-dark)' }}><InlineIcon src="/images/logo-middlebury.svg" alt="Middlebury College" context="body" />{' '}Middlebury College</span>.
          </p>
        </div>

        {/* Signature */}
        <div style={{ marginTop: 56 }}>
          <SignatureAnimation />
        </div>
      </div>

      {/* Bottom spacer for the fixed record toggle */}
      <div style={{ height: 80, flexShrink: 0 }} />
    </motion.main>
  )
}
