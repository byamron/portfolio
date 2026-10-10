import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { ContributionStrip } from '@/components/ContributionStrip'
import { SignatureAnimation } from '@/components/SignatureAnimation'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { InlineIcon, InlinePortrait } from './InlineIcon'
import { ProtoLink } from './ProtoLink'
import { protoBySlug } from './data'
import { RecordDock } from './RecordDock'
import { fluidSize, SIDEBAR_GUTTER, useProtoSettings } from './protoSettings'

const L = (id: string) => <ProtoLink entry={protoBySlug.get(id)!} />

// Prose size is fluid (see fluidSize); everything else on the page (icons,
// gaps, pill padding) is in em, so it follows.
const LINE_HEIGHT = 1.3

// The record sits in the strip's label row only when that row has room for
// the label, the switch, and the sidebar gutter; otherwise it ends the page.
const ROW_FITS_QUERY = '(min-width: 640px)'
const subscribeRow = (cb: () => void) => {
  const mq = window.matchMedia(ROW_FITS_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useRowFits = () => useSyncExternalStore(subscribeRow, () => window.matchMedia(ROW_FITS_QUERY).matches, () => true)

// Entrance (after nelson.co): each paragraph rises out of a soft blur, top to
// bottom, then the strip at the foot of the page; the signature starts as
// the last item settles. Explicit per-item delays keep the order spatial.
const CASCADE = { delay: 0.15, stagger: 0.1, duration: 0.7 }
const CASCADE_ITEMS = 6 // 5 paragraphs + strip
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
  const { proseMax, recordPlacement, stickyStrip } = useProtoSettings()
  const rowFits = useRowFits()
  const recordInStrip = recordPlacement === 'strip' && rowFits
  const proseRef = useRef<HTMLDivElement>(null)

  useGlassHighlight(proseRef, {
    cardSelector: '[data-proto-link]',
    borderRadius: 12,
    clearDelay: 200,
  })

  // The sidebar trigger is the same 16px accent square as a contribution cell.
  // Align it with the first line of prose, the way prod aligns it with the
  // hero heading; when the text runs into the 56px sidebar gutter (phones),
  // centre it in the empty band above the text instead.
  useLayoutEffect(() => {
    const prose = proseRef.current
    const first = prose?.firstElementChild as HTMLElement | null
    if (!prose || !first) return
    const root = document.documentElement
    const place = () => {
      const lineHeight = parseFloat(getComputedStyle(first).lineHeight)
      const collides = prose.getBoundingClientRect().right > window.innerWidth - SIDEBAR_GUTTER
      const top = collides
        ? prose.offsetTop / 2 - 8
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
        visible: (i: number) => ({
          opacity: 1, y: 0, filter: 'blur(0px)',
          transition: { delay: CASCADE.delay + i * CASCADE.stagger, duration: CASCADE.duration, ease: EASE_OUT },
        }),
      }
  const para = (i: number) => ({ variants: item, custom: i, style: { margin: 0 } })

  return (
    <motion.main
      initial="hidden"
      animate="visible"
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

      <div style={{ maxWidth: 920, width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 24px 48px' }}>
        <div
          ref={proseRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1em', // Ben's tuned 40px at 40px type
            fontFamily: '"Literata", Georgia, serif',
            fontSize: fluidSize(proseMax),
            fontWeight: 300,
            lineHeight: LINE_HEIGHT,
            color: 'var(--text-grey)',
            position: 'relative',
          }}
        >
          <motion.p {...para(0)}>
            <InlinePortrait />{' '}
            <span style={{ color: 'var(--text-dark)' }}>Ben Yamron</span> is a product designer, currently designing AI for scientific research at {L('consensus')}.
          </motion.p>
          <motion.p {...para(1)}>
            Previously, I designed patient experiences at {L('mochi-health')}.
          </motion.p>
          <motion.p {...para(2)}>
            On the side, I build tools and experiments. See more on {L('github')} and {L('x')}.
          </motion.p>
          <motion.p {...para(3)}>
            I studied design at the <Named icon="/images/logo-uw.svg" name="University of Washington" />, and I learned how to think at <Named icon="/images/logo-middlebury.svg" name="Middlebury College" />.
          </motion.p>
          <motion.p {...para(4)}>
            Say hi by {L('email')} or on {L('linkedin')}.
          </motion.p>
        </div>

        <div style={{ marginTop: 56 }}>
          <SignatureAnimation startDelayMs={reducedMotion ? 0 : SIGNATURE_DELAY_MS} />
        </div>

        {!recordInStrip && (
          <div style={{ marginTop: 32, paddingBottom: 48 }}>
            <RecordDock credit="below" />
          </div>
        )}
      </div>

      {/* Contribution strip — full-bleed foot of the page: sits at the viewport
          bottom when the content fits, stacks below it when it scrolls. */}
      <motion.div
        variants={item}
        custom={5}
        style={{
          alignSelf: 'stretch',
          flexShrink: 0,
          paddingBottom: 8,
          ...(stickyStrip && {
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            paddingTop: 32,
            // Text scrolls behind the bar and dissolves into the page colour.
            background: 'linear-gradient(to bottom, transparent, var(--bg) 32px)',
          }),
        }}
      >
        <ContributionStrip
          topGap={0}
          labelAccessory={recordInStrip ? <RecordDock credit="above" /> : undefined}
          accessoryInset={SIDEBAR_GUTTER + 24}
        />
      </motion.div>
    </motion.main>
  )
}
