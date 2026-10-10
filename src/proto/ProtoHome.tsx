import { useLayoutEffect, useRef } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ContributionStrip } from '@/components/ContributionStrip'
import { SignatureAnimation } from '@/components/SignatureAnimation'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { InlineIcon, InlinePortrait } from './InlineIcon'
import { ProtoLink } from './ProtoLink'
import { protoBySlug } from './data'
import { RecordDock, SIDEBAR_GUTTER, useRecordDockPinned } from './RecordDock'

const L = (id: string) => <ProtoLink entry={protoBySlug.get(id)!} />

// 40px on wide screens, easing down to 26px on phones. Everything else on the
// page (icons, gaps, pill padding) is in em, so it follows.
const PROSE_SIZE = 'clamp(26px, calc(20px + 1.4vw), 40px)'
const LINE_HEIGHT = 1.3

// Entrance: strip, then each paragraph rises out of a soft blur, top to
// bottom; the signature starts as the last line settles.
const CASCADE = { delay: 0.12, stagger: 0.09, duration: 0.6 }
const CASCADE_ITEMS = 6 // strip + 4 paragraphs + contact line
const SIGNATURE_DELAY_MS = Math.round(
  (CASCADE.delay + CASCADE.stagger * (CASCADE_ITEMS - 1) + CASCADE.duration) * 1000,
)
const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Name with a leading logo: keep the logo with the first word only, so long
 *  names can still wrap on narrow screens. */
function Named({ icon, name }: { icon: string; name: string }) {
  const [first, ...rest] = name.split(' ')
  return (
    <span style={{ color: 'var(--text-dark)' }}>
      <span style={{ whiteSpace: 'nowrap' }}><InlineIcon src={icon} />{' '}{first}</span>
      {rest.length > 0 && ` ${rest.join(' ')}`}
    </span>
  )
}

export function ProtoHome() {
  const reducedMotion = useReducedMotion()
  const proseRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const pinned = useRecordDockPinned()

  useGlassHighlight(proseRef, {
    cardSelector: '[data-proto-link]',
    borderRadius: 12,
    clearDelay: 200,
  })

  // The sidebar trigger is the same 16px accent square as a contribution cell;
  // parked under the strip it read as a stray day. Align it with the first
  // line of prose instead, the way prod aligns it with the hero heading.
  useLayoutEffect(() => {
    const prose = proseRef.current
    const strip = stripRef.current
    const first = prose?.firstElementChild as HTMLElement | null
    if (!prose || !strip || !first) return
    const root = document.documentElement
    const place = () => {
      const lineHeight = parseFloat(getComputedStyle(first).lineHeight)
      // When the text runs into the sidebar's 56px gutter (phones), the first
      // line is taken; use the empty band between the strip and the text.
      const collides = prose.getBoundingClientRect().right > window.innerWidth - SIDEBAR_GUTTER
      const top = collides
        ? (strip.offsetTop + strip.offsetHeight + prose.offsetTop) / 2 - 8
        : prose.offsetTop + first.offsetTop + (lineHeight - 16) / 2
      root.style.setProperty('--sidebar-trigger-top', `${Math.round(top)}px`)
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(prose)
    window.addEventListener('resize', place)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', place)
      root.style.removeProperty('--sidebar-trigger-top')
    }
  }, [])

  const item: Variants = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: CASCADE.duration, ease: EASE_OUT } },
      }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { delayChildren: reducedMotion ? 0 : CASCADE.delay, staggerChildren: reducedMotion ? 0 : CASCADE.stagger } } }}
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
      <h1 className="sr-only">Ben Yamron, product designer</h1>

      <motion.div ref={stripRef} variants={item} style={{ alignSelf: 'stretch', flexShrink: 0 }}>
        <ContributionStrip labelPosition="bottom" />
      </motion.div>

      <div style={{ maxWidth: 920, width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 24px 48px' }}>
        <motion.div
          ref={proseRef}
          variants={{ visible: { transition: { staggerChildren: reducedMotion ? 0 : CASCADE.stagger } } }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: "1em", // Ben's tuned 40px at 40px type
            fontFamily: '"Literata", Georgia, serif',
            fontSize: PROSE_SIZE,
            fontWeight: 300,
            lineHeight: LINE_HEIGHT,
            color: 'var(--text-grey)',
            position: 'relative',
          }}
        >
          <motion.p variants={item} style={{ margin: 0 }}>
            <InlinePortrait />{' '}
            <span style={{ color: 'var(--text-dark)' }}>Ben Yamron</span> is a product designer, currently designing AI for scientific research at {L('consensus')}.
          </motion.p>
          <motion.p variants={item} style={{ margin: 0 }}>
            Previously, I designed patient experiences at {L('mochi-health')}.
          </motion.p>
          <motion.p variants={item} style={{ margin: 0 }}>
            On the side, I build tools and experiments. See more on {L('github')} and {L('x')}.
          </motion.p>
          <motion.p variants={item} style={{ margin: 0 }}>
            I studied design at the <Named icon="/images/logo-uw.svg" name="University of Washington" />, and I learned how to think at <Named icon="/images/logo-middlebury.svg" name="Middlebury College" />.
          </motion.p>
          <motion.p variants={item} style={{ margin: 0 }}>
            Say hi by {L('email')} or on {L('linkedin')}.
          </motion.p>
        </motion.div>

        <div style={{ marginTop: 56 }}>
          <SignatureAnimation startDelayMs={reducedMotion ? 0 : SIGNATURE_DELAY_MS} />
        </div>

        {/* Narrow screens: the record ends the page instead of floating over
            the text. Room below it for the now-playing credit. */}
        {!pinned && (
          <div style={{ marginTop: 32, paddingBottom: 64 }}>
            <RecordDock placement="inline" />
          </div>
        )}
      </div>

      {/* Clearance so the last content can scroll above the pinned record. */}
      {pinned && <div style={{ height: 120, flexShrink: 0 }} />}
    </motion.main>
  )
}
