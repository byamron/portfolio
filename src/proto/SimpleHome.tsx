import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { EnvelopeSimple, GithubLogo, LinkedinLogo, XLogo, type Icon } from '@phosphor-icons/react'
import { ContributionStrip } from '@/components/ContributionStrip'
import { FlockX } from '@/components/FlockX'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { CopyEmailButton, GitHubLink, LinkedInLink } from './ContactFx'
import { InlineIcon, ThemePortrait } from './InlineIcon'
import { ProtoLink } from './ProtoLink'
import { COPY_VARIANTS, PHONE_BREAKS, protoBySlug, TEXT_PRESETS, type Seg } from './data'
import { EASE_OUT, fluidSize, PAGE_GLASS_CARDS, PHONE_QUERY, useProtoSettings } from './protoSettings'

// /new/simple — the sketch: one sentence, four ways to reach Ben, the
// contribution strip. Theme + record live in the sidebar (ProtoRoutes).

const LINE_HEIGHT = 1.3

// Glass pill radius for prose links and the icon buttons (matches .simple-social).
const SOCIAL_RADIUS = 12

const CASCADE = { delay: 0.12, stagger: 0.08, duration: 0.45 } // prod's entrance beat

const SOCIALS: { id: string; label: string; Icon: Icon }[] = [
  { id: 'linkedin', label: 'LinkedIn (opens in new tab)', Icon: LinkedinLogo },
  { id: 'github', label: 'GitHub (opens in new tab)', Icon: GithubLogo },
  { id: 'x', label: 'X, formerly Twitter (opens in new tab)', Icon: XLogo },
  { id: 'email', label: 'Email', Icon: EnvelopeSimple },
]

function renderSeg(seg: Seg, i: number, measuring: boolean) {
  if (seg === 'P') return measuring
    ? <span key={i}><InlineIcon src="/images/portrait-square-table.jpg" />{' '}</span>
    : <span key={i}><ThemePortrait />{' '}</span>
  if (seg === 'N') return <span key={i} style={{ color: 'var(--text-dark)' }}>Ben Yamron</span>
  if (seg === 'C') return <ProtoLink key={i} entry={protoBySlug.get('consensus')!} />
  return <span key={i}>{seg}</span>
}

const STRIP_LABEL_INSET = 40 // ContributionStrip's label paddingLeft
const PHONE_MAX_TEXT = 38
const subscribePhone = (cb: () => void) => {
  const mq = window.matchMedia(PHONE_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const usePhone = () => useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_QUERY).matches, () => false)

// Presets size by type, not width: the column may go this wide and the
// block shrink-wraps to the text.
const PRESET_MAX_WIDTH = 1440

export function SimpleHome() {
  const reducedMotion = useReducedMotion()
  const { proseMax, simpleLayout: tuned } = useProtoSettings()
  // A preset (DialKit, or ?preset=… so it works on phones/prod builds) sets
  // copy + target size and lets the column go wide; 'custom' uses the dials.
  const urlPreset = new URLSearchParams(window.location.search).get('preset')
  const preset = TEXT_PRESETS[urlPreset ?? ''] ?? (tuned.preset !== 'custom' ? TEXT_PRESETS[tuned.preset] : undefined)
  // The DialKit S→M slider sets the active preset's size (URL presets keep theirs).
  // (Only for the S presets — it's an S→M fine-tune — so M/L keep their size.)
  const presetName = urlPreset ?? tuned.preset
  const presetSize = preset && !urlPreset && tuned.presetSize && presetName.endsWith('· S') ? tuned.presetSize : preset?.size
  const layout = preset ? { ...tuned, copy: preset.copy, maxText: presetSize!, maxWidth: PRESET_MAX_WIDTH } : tuned
  const pageRef = useRef<HTMLElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)
  const centred = layout.align === 'center'

  const phone = usePhone()
  const phoneLines = phone ? PHONE_BREAKS[layout.copy] : undefined
  const lines = phoneLines ?? COPY_VARIANTS[layout.copy] ?? Object.values(COPY_VARIANTS)[0]!
  // Phones keep the preset's relative size (S < M < L), capped for the measure.
  const maxText = phoneLines ? Math.min(PHONE_MAX_TEXT, Math.round((presetSize ?? 48) * 0.8)) : layout.maxText

  // Fit mode: the text size is whatever makes the longest line exactly fill
  // the column (the measure). Each line's width in em is read from hidden
  // nowrap copies at 100px; the size itself is pure CSS (container-query
  // units), so it tracks resizes with no JS. Icons are em-sized and follow.
  const measureRef = useRef<HTMLDivElement>(null)
  const [lineEms, setLineEms] = useState<number[] | null>(null)
  useLayoutEffect(() => {
    const box = measureRef.current
    if (!box) return
    const measure = () => {
      const ems = [...box.children].map(c => c.getBoundingClientRect().width / 100)
      if (ems.every(e => e > 0)) setLineEms(ems)
    }
    measure()
    // Literata loads lazily (after first use), so fonts.ready can resolve
    // before it swaps in. Watching the copies' own size catches the swap.
    const ro = new ResizeObserver(measure)
    for (const c of box.children) ro.observe(c)
    return () => ro.disconnect()
  }, [layout.copy, phoneLines])
  const longestEm = lineEms ? Math.max(...lineEms) : null
  const fit = layout.sizeMode === 'fit' && longestEm !== null
  const fontSize = fit
    // 1% slack so rounding/hinting differences never wrap a line.
    ? `clamp(${layout.minText}px, calc(99cqi / ${longestEm!.toFixed(4)}), ${maxText}px)`
    : fluidSize(proseMax)

  // Shrink-wrap: a wrapped paragraph's box is as wide as its container, not
  // its longest line, so ragged left-aligned text sits left of centre. Size
  // the block to the widest rendered line and centre that instead.
  const [fitWidth, setFitWidth] = useState<number | null>(null)
  useLayoutEffect(() => {
    const block = blockRef.current
    if (!block || !layout.shrinkWrap || centred) { setFitWidth(null); return }
    const measure = () => {
      const prev = block.style.width
      block.style.width = '' // measure the natural wrap at full width
      const range = document.createRange()
      range.selectNodeContents(block.querySelector('p')!)
      const rects = [...range.getClientRects()].filter(r => r.width > 0)
      block.style.width = prev
      if (!rects.length) return
      const w = Math.ceil(Math.max(...rects.map(r => r.right)) - Math.min(...rects.map(r => r.left))) + 1
      setFitWidth(cur => (cur === w ? cur : w))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(block.parentElement!)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
    // fontSize: a new size re-wraps the text, so the widest line moves too.
  }, [layout.shrinkWrap, layout.maxWidth, layout.wrap, centred, fontSize, layout.copy, phoneLines])

  // On the whole page, so the strip's GitHub link (data-link-card) shares the
  // prose links' glass.
  const glassApi = useGlassHighlight(pageRef, {
    cardSelector: PAGE_GLASS_CARDS,
    borderRadius: SOCIAL_RADIUS,
    clearDelay: 200,
  })


  const item: Variants = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : {
        hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
        visible: (i: number) => ({
          opacity: 1, y: 0, filter: 'blur(0px)',
          // A leftover filter (even blur(0)) is a stacking context, which
          // traps the icons' z-index under the glass pill. Clear it.
          transitionEnd: { filter: 'none' },
          transition: { delay: CASCADE.delay + i * CASCADE.stagger, duration: CASCADE.duration, ease: EASE_OUT },
        }),
      }

  return (
    <motion.main
      ref={pageRef}
      className="simple-home"
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

      <div
        style={{
          maxWidth: layout.maxWidth,
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          // Symmetric, so the column's centre is the page's centre. Phones:
          // left edge on the strip label's 40px inset (centring a narrow
          // block there reads as misalignment, not intent).
          padding: phone ? `96px 24px 64px ${STRIP_LABEL_INSET}px` : '96px clamp(24px, 6vw, 72px) 64px',
          containerType: 'inline-size',
        }}
      >
      <div
        ref={blockRef}
        style={{
          width: fitWidth ?? '100%',
          maxWidth: '100%',
          marginInline: phone && !centred ? 0 : 'auto',
          textAlign: centred ? 'center' : 'left',
        }}
      >
        <motion.p
          className={phoneLines ? 'simple-intro' : 'simple-intro simple-intro--auto-phone'}
          variants={item}
          custom={0}
          style={{
            margin: 0,
            fontFamily: '"Literata", Georgia, serif',
            fontSize,
            fontWeight: 300,
            lineHeight: LINE_HEIGHT,
            color: 'var(--text-grey)',
            textWrap: layout.wrap,
          }}
        >
          {lines.map((line, li) => (
            <span key={`${phoneLines ? 'p' : 'd'}${li}`}>
              {li > 0 && <br />}
              {line.map((seg, i) => renderSeg(seg, i, false))}
            </span>
          ))}
        </motion.p>
        {/* Measuring copies (fit mode): one per line, 100px, never wrapping.
            In a zero-size clipped box so their ~2000px width never adds
            scrollable overflow; their own boxes still measure true. */}
        <div aria-hidden="true" inert style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden' }}>
        <div
          ref={measureRef}
          style={{
            position: 'absolute', visibility: 'hidden', pointerEvents: 'none', top: 0, left: 0,
            fontFamily: '"Literata", Georgia, serif', fontSize: 100, fontWeight: 300,
          }}
        >
          {lines.map((line, li) => (
            <span key={li} style={{ display: 'block', width: 'max-content', whiteSpace: 'nowrap' }}>
              {line.map((seg, i) => renderSeg(seg, i, true))}
            </span>
          ))}
        </div>
        </div>

        <motion.ul
          variants={item}
          custom={1}
          aria-label="Elsewhere"
          // Left: pulled back so the first glyph lines up with the text edge.
          style={{ listStyle: 'none', margin: centred ? '40px 0 0' : '40px 0 0 -10px', padding: 0, display: 'flex', gap: 4, justifyContent: centred ? 'center' : 'flex-start' }}
        >
          {SOCIALS.map(({ id, label, Icon }) => {
            const { href } = protoBySlug.get(id)!
            const icon = <Icon size={24} weight="regular" aria-hidden="true" />
            return (
              <li key={id}>
                {id === 'email' ? (
                  <CopyEmailButton icon={icon} />
                ) : id === 'github' ? (
                  <GitHubLink href={href} label={label} icon={icon} />
                ) : id === 'linkedin' ? (
                  <LinkedInLink href={href} label={label} icon={icon} />
                ) : (
                  // X — the flock easter egg: the glass cracks from behind
                  // the logo, shatters, and birds fly out.
                  <FlockX href={href} className="simple-social" ariaLabel={label} epicenter="center" glassRadius={SOCIAL_RADIUS} glassApi={glassApi}>
                    {icon}
                  </FlockX>
                )}
              </li>
            )
          })}
        </motion.ul>
      </div>
      </div>

      {/* Contribution strip — full-bleed foot of the page (as on /new): at
          the viewport bottom when the content fits, below it when it scrolls. */}
      <motion.div variants={item} custom={2} style={{ alignSelf: 'stretch', flexShrink: 0, paddingBottom: 8 }}>
        <ContributionStrip topGap={0} />
      </motion.div>
    </motion.main>
  )
}
