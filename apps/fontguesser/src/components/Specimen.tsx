import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Composition } from '../lib/specimens'
import type { FontEntry } from '../lib/fonts'
import type { LoadState } from '../lib/useFontLoader'

type Props = {
  composition: Composition
  font: FontEntry
  state: LoadState
  weightsReady: boolean
  /** True once the round is answered: the answer layer becomes the live one. */
  compact?: boolean
  /**
   * The answer. When present the display line stops being specimen text and
   * resolves into the font's name, so the reveal happens on the line the player
   * has been reading rather than in a second heading underneath it.
   */
  answerText?: string
  /** The guess UI. Stacked with `answerSlot` so neither swap moves the layout. */
  questionSlot?: React.ReactNode
  /** The reveal. */
  answerSlot?: React.ReactNode
}

type BlockKey = 'heading' | 'deck' | 'body'

type BlockStyle = {
  text: string
  /** px */
  size: number
  weight: number
  /** thousandths of an em, so the slider can stay integer */
  tracking: number
  /** hundredths, so 106 renders as line-height 1.06 */
  leading: number
}

type BlockSpec = {
  key: BlockKey
  label: string
  sizeRange: [number, number]
  defaults: Omit<BlockStyle, 'text'>
  measure: string
  tone: string
}

/**
 * Three blocks, each independently editable and independently styled.
 *
 * A real specimen is a set of registers, not one string — the display line
 * shows terminals and joins, the subhead shows how the face behaves at a middle
 * size, the paragraph shows colour and rhythm. Letting each be set separately is
 * what turns the sheet from a preview into something you can actually
 * interrogate.
 *
 * Size ceilings differ per block on purpose: a display line wants to go to
 * 240px the way foundry specimens do, while a body paragraph pushed past ~40px
 * stops being a body paragraph and stops telling you anything.
 */
const BLOCKS: BlockSpec[] = [
  {
    key: 'heading',
    label: 'Display',
    sizeRange: [28, 240],
    defaults: { size: 76, weight: 400, tracking: -15, leading: 106 },
    measure: 'max-w-none',
    tone: 'text-ink',
  },
  {
    key: 'deck',
    label: 'Subhead',
    sizeRange: [14, 72],
    defaults: { size: 24, weight: 400, tracking: 0, leading: 134 },
    measure: 'max-w-[34ch]',
    tone: 'text-ink',
  },
  {
    key: 'body',
    label: 'Body',
    sizeRange: [11, 40],
    defaults: { size: 15, weight: 400, tracking: 0, leading: 166 },
    measure: 'max-w-[62ch]',
    tone: 'text-ink-muted',
  },
]

/**
 * The fallback ascender-to-descender extent, in hundredths of an em.
 *
 * Roughly 1.3em covers a typical text face, but it badly under-covers script
 * and display faces, whose descenders can reach past 1.8em — those are exactly
 * the ones that were clipping. So this is only the value we use before the real
 * metrics are available, or when the platform can't report them; otherwise we
 * measure the actual face (see `faceExtent`).
 */
const SAFE_LEADING = 130

// Measured extent per family, in hundredths of an em, cached so the canvas
// probe runs once per face rather than once per render.
const extentCache = new Map<string, number>()
let probeCanvas: HTMLCanvasElement | null = null

/**
 * The face's own ascender-to-descender extent as a leading (hundredths of em),
 * measured from its declared font metrics. A line box tighter than this lets
 * glyphs spill outside the content box, where `overflow: hidden` shears them.
 */
function faceExtent(family: string): number {
  const cached = extentCache.get(family)
  if (cached !== undefined) return cached

  // Before the real face is loaded the canvas falls back to a system font and
  // reports the wrong extent. Return the flat assumption *without* caching, so a
  // later call (after `document.fonts.ready`) measures the real thing.
  if (typeof document === 'undefined' || !document.fonts?.check(`100px "${family}"`)) {
    return SAFE_LEADING
  }

  let extent = SAFE_LEADING
  try {
    probeCanvas ??= document.createElement('canvas')
    const ctx = probeCanvas.getContext('2d')
    if (ctx) {
      // Probe at 100px so the returned pixel metrics read directly as hundredths
      // of an em. `fontBoundingBox*` is the face's own declared extent — the
      // string only satisfies the API — so it's independent of the specimen text.
      ctx.font = `400 100px "${family}", serif`
      const { fontBoundingBoxAscent: asc, fontBoundingBoxDescent: desc } = ctx.measureText('Hg')
      if (typeof asc === 'number' && typeof desc === 'number' && asc + desc > 0) {
        // Never reserve *less* than the flat assumption, and cap absurd values so
        // one broken metric can't inflate the sheet without bound.
        extent = Math.min(300, Math.max(SAFE_LEADING, Math.round(asc + desc)))
      }
    }
  } catch {
    // Keep the fallback — a missing canvas or metric must never break the sheet.
  }

  extentCache.set(family, extent)
  return extent
}

/** The padding a line needs when its box is tighter than the face's extent. */
function overshoot(leading: number, size: number, safe: number) {
  return Math.max(0, (safe - leading) / 100) * size
}

/**
 * How the display line is set on the answer screen.
 *
 * Deliberately the block defaults at a fixed size rather than whatever the
 * player left the sliders on. Carrying their tuning over meant the reveal
 * inherited, say, a 2.0 leading under 52px text — a tall empty line box under a
 * short line — and the answer screen looked different every round depending on
 * what you had been doing thirty seconds earlier. The specimen is a tool for
 * the question; the answer is a fixed page.
 */
const ANSWER_STYLE = { size: 52, weight: 400, tracking: -15, leading: 106 }

/** Snaps to a weight the family actually ships, so static families never render synthetic. */
function nearestWeight(weights: number[], value: number) {
  return weights.reduce((best, w) => (Math.abs(w - value) < Math.abs(best - value) ? w : best))
}

function initialBlocks(composition: Composition): Record<BlockKey, BlockStyle> {
  return {
    heading: { text: composition.heading, ...BLOCKS[0].defaults },
    deck: { text: composition.deck, ...BLOCKS[1].defaults },
    body: { text: composition.body, ...BLOCKS[2].defaults },
  }
}

export function Specimen({
  composition,
  font,
  state,
  weightsReady,
  compact,
  answerText,
  questionSlot,
  answerSlot,
}: Props) {
  const [blocks, setBlocks] = useState(() => initialBlocks(composition))
  const [active, setActive] = useState<BlockKey>('heading')
  const [dirty, setDirty] = useState(false)

  // Each new round resets the sheet; carrying settings over would let a player
  // arrive at a specimen already scaled to something unrepresentative.
  const reset = useCallback(() => {
    setBlocks(initialBlocks(composition))
    setActive('heading')
    setDirty(false)
  }, [composition])

  useEffect(() => {
    reset()
  }, [font.family, reset])

  const patch = useCallback((key: BlockKey, next: Partial<BlockStyle>) => {
    setBlocks((b) => ({ ...b, [key]: { ...b[key], ...next } }))
    setDirty(true)
  }, [])

  const ready = state === 'ready'
  // Gate on `ready` so the answer never appears over a fallback face.
  const revealed = Boolean(compact && answerText && ready)

  const spec = BLOCKS.find((b) => b.key === active)!
  const style = blocks[active]

  const adjustable = font.weights.length > 1
  const wMin = font.wghtAxis?.[0] ?? font.weights[0]
  const wMax = font.wghtAxis?.[1] ?? font.weights[font.weights.length - 1]

  if (state === 'error') {
    return (
      <div className="flex min-h-[24rem] items-center justify-center">
        <p data-fade className="max-w-sm text-center text-sm text-ink-muted">
          This font didn’t load. Skip to the next one — it won’t count against you.
        </p>
      </div>
    )
  }

  return (
    /*
      Sheet and apparatus sit side by side once there is width for it, the way a
      foundry specimen keeps its settings in a rail rather than under the type.
      Below `lg` the rail stacks back beneath the sheet.
    */
    <div className="min-h-[24rem] lg:relative lg:pr-56">
      <div style={{ fontFamily: `"${font.family}", serif` }}>
        <article data-pin-id="specimen-sheet" aria-label="Type specimen of the mystery font">
          {/*
            The display line is a stacked pair, not a swap.

            Question text and answer name sit in one cell at their own sizes, so
            the cell is already as tall as the taller of them. Changing the text
            in place — which is what the letter reels did — resized this line,
            and every resize here shifts the whole page below it.

            This is also the one deliberate cross-dissolve in the app: the
            headline the player has been reading resolves into the answer's
            name. Everything else waits its turn; this line is the continuity.
          */}
          <div className="grid [grid-template-areas:'stack']">
            <div data-line data-state={revealed ? 'out' : 'in'} inert={revealed} aria-hidden={revealed}>
              <Editable
                spec={BLOCKS[0]}
                style={blocks.heading}
                first
                compact={compact}
                metricsKey={font.family}
                isActive={!compact && active === 'heading'}
                onFocus={() => setActive('heading')}
                onChange={(text) => patch('heading', { text })}
              />
            </div>

            <div data-line data-state={revealed ? 'in' : 'out'} inert={!revealed} aria-hidden={!revealed}>
              <div
                style={{
                  fontSize: `${ANSWER_STYLE.size}px`,
                  fontWeight: ANSWER_STYLE.weight,
                  letterSpacing: `${ANSWER_STYLE.tracking / 1000}em`,
                  lineHeight: ANSWER_STYLE.leading / 100,
                }}
                className="text-ink"
              >
                {answerText}
              </div>
            </div>
          </div>
        </article>

        {/*
          One cell, two states, and a floor above both — so the document height
          is identical whichever state is live and nothing below can ever shift.
        */}
        <div className="grid min-h-0 [grid-template-areas:'stack'] sm:min-h-[36rem]">
          <div data-layer data-state={compact ? 'out' : 'in'} inert={compact} aria-hidden={compact}>
            {BLOCKS.slice(1).map((block, index) => (
              <div key={block.key} data-fade style={{ ['--i' as string]: index + 1 }}>
                <Editable
                  spec={block}
                  style={blocks[block.key]}
                  first={false}
                  metricsKey={font.family}
                  isActive={active === block.key}
                  onFocus={() => setActive(block.key)}
                  onChange={(text) => patch(block.key, { text })}
                />
              </div>
            ))}

            {/*
              One control row, retargeted to whichever block has focus, rather
              than a rail of controls per block. Three sets of sliders on screen
              at once is how a specimen page turns into a control panel; a single
              row that names what it is editing stays quiet and still reaches
              everything.
            */}
            <div
              data-fade
              style={{ ['--i' as string]: 3 }}
              data-pin-id="specimen-controls"
              className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-rule pt-4 lg:absolute lg:top-0 lg:right-0 lg:mt-0 lg:w-44 lg:flex-col lg:items-stretch lg:gap-y-4 lg:border-t-0 lg:border-l lg:pt-1 lg:pl-6"
            >
              <span className="label shrink-0">{spec.label}</span>

              <Control
                label="Size"
                short="Size"
                value={style.size}
                min={spec.sizeRange[0]}
                max={spec.sizeRange[1]}
                display={`${style.size}`}
                onChange={(n) => patch(active, { size: n })}
              />

              {adjustable ? (
                <Control
                  label="Weight"
                  short="Weight"
                  value={style.weight}
                  min={wMin}
                  max={wMax}
                  step={font.wghtAxis ? 1 : 25}
                  display={`${style.weight}`}
                  dimmed={!weightsReady}
                  onChange={(n) =>
                    patch(active, {
                      // Variable families interpolate, so any value is
                      // legitimate; static families must land on a shipped
                      // weight or the browser fakes one, distorting the very
                      // letterforms being read.
                      weight: font.wghtAxis ? n : nearestWeight(font.weights, n),
                    })
                  }
                />
              ) : (
                <span className="text-xs text-ink-faint">Single weight</span>
              )}

              {/*
                Tracking reads in thousandths of an em with no unit shown —
                which is exactly how InDesign expresses it, so the number is
                already familiar to this audience.
              */}
              <Control
                label="Tracking, in thousandths of an em"
                short="Tracking"
                value={style.tracking}
                min={-60}
                max={120}
                display={`${style.tracking}`.replace('-', '−')}
                onChange={(n) => patch(active, { tracking: n })}
              />

              <Control
                label="Leading"
                short="Leading"
                value={style.leading}
                min={85}
                max={220}
                display={(style.leading / 100).toFixed(2)}
                onChange={(n) => patch(active, { leading: n })}
              />

              {dirty && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
                >
                  Reset
                </button>
              )}
            </div>

            {questionSlot}
          </div>

          <div data-layer data-state={compact ? 'in' : 'out'} inert={!compact} aria-hidden={!compact}>
            {answerSlot}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * A block of specimen text.
 *
 * A textarea rather than contentEditable: it keeps the text in React state
 * without the caret-jumping that comes from writing back into a live
 * contentEditable node, and it inherits the specimen's typography cleanly. It
 * auto-grows so there is never a scrollbar inside the sheet.
 */
function Editable({
  spec,
  style,
  first,
  compact,
  metricsKey,
  isActive,
  onFocus,
  onChange,
}: {
  spec: BlockSpec
  style: BlockStyle
  first: boolean
  compact?: boolean
  /** Changes when the face changes, so the auto-grow re-measures its metrics. */
  metricsKey: string
  /** The block the control rail is currently acting on. */
  isActive: boolean
  onFocus: () => void
  onChange: (text: string) => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const size = style.size

  // The loaded face's real ascender-to-descender extent, so the padding below
  // reserves the right room for descenders instead of a flat 1.3em guess.
  const [safeLeading, setSafeLeading] = useState(() => faceExtent(metricsKey))

  const fit = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  // `metricsKey` is in here because a new face re-wraps the text without
  // changing the element's width — different advances mean a different line
  // count for the same string in the same box. Rounds swap while the stage is
  // hidden and only enter once the face is loaded, so these measurements run
  // against the real font, off-screen.
  useLayoutEffect(fit, [
    fit,
    metricsKey,
    style.text,
    size,
    style.leading,
    style.tracking,
    style.weight,
    safeLeading,
  ])

  // Belt and braces for faces that finish loading outside the round's own
  // lifecycle — a cached swap, or a stylesheet that lands late.
  useEffect(() => {
    let cancelled = false
    const sync = () => {
      if (cancelled) return
      // Measure the real face now that it may be present, then re-fit so the
      // auto-grow accounts for the padding the new extent reserves.
      setSafeLeading(faceExtent(metricsKey))
      fit()
    }
    // A cached face may already be loaded; otherwise wait for the load to land.
    sync()
    document.fonts?.ready.then(sync)
    return () => {
      cancelled = true
    }
  }, [fit, metricsKey])

  /*
    Re-fit whenever the element's *width* changes — window resizes, and the cold
    load where the first layout pass happens before the stylesheet applies,
    leaving an unstyled 20-column textarea that wraps one character per line and
    reports a scrollHeight several thousand pixels tall.
  */
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return

    let lastWidth = el.clientWidth
    const observer = new ResizeObserver(() => {
      // Width only — reacting to height would feed our own writes back in.
      if (el.clientWidth === lastWidth) return
      lastWidth = el.clientWidth
      fit()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [fit])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={style.text}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      readOnly={compact}
      spellCheck={false}
      autoComplete="off"
      data-pin-id={`specimen-${spec.key}`}
      aria-label={`${spec.label} — edit to test the letterforms`}
      /*
        A rule in the margin marks the block the rail is acting on — matched to
        the rail's own hairline (1px, --rule) so the two read as one system: the
        line beside the type and the line beside the sliders are the same line.

        A rule rather than a tinted field, because a darkened background changes
        the ground the type sits on — and perceived weight and colour of a face
        depend on exactly that, so tinting the block corrupts the thing the
        player is being asked to judge.
      */
      className={`-ml-4 block w-[calc(100%+1rem)] resize-none overflow-hidden border-l border-transparent bg-transparent pl-[calc(1rem-1px)] outline-none transition-[border-color] duration-200 ease-out ${spec.measure} ${spec.tone} ${
        first ? '' : 'mt-6'
      }`}
      style={{
        borderLeftColor: isActive ? 'var(--rule)' : 'transparent',
        fontSize: `${size}px`,
        fontWeight: style.weight,
        letterSpacing: `${style.tracking / 1000}em`,
        lineHeight: style.leading / 100,
        // A line box tighter than the face's own ascender-to-descender extent
        // lets glyphs spill outside the content box, where `overflow: hidden`
        // shears them — the descender of a g on the last line simply vanishes.
        // Reserve the shortfall (measured extent minus this leading) as padding,
        // weighted downward since descenders overshoot further than ascenders.
        // Padding is inside scrollHeight, so the auto-grow accounts for it. When
        // the leading already clears the face's extent this is zero.
        paddingTop: `${overshoot(style.leading, size, safeLeading) * 0.35}px`,
        paddingBottom: `${overshoot(style.leading, size, safeLeading) * 0.65}px`,
      }}
    />
  )
}

function Control({
  label,
  short,
  value,
  min,
  max,
  step = 1,
  display,
  dimmed,
  onChange,
}: {
  label: string
  /** Compact form so all four controls hold one line; the full word stays for screen readers. */
  short: string
  value: number
  min: number
  max: number
  step?: number
  display: string
  dimmed?: boolean
  onChange: (n: number) => void
}) {
  return (
    <label
      className={`flex items-center gap-1.5 transition-opacity lg:justify-between ${dimmed ? 'opacity-40' : ''}`}
    >
      <span className="label" aria-hidden>
        {short}
      </span>
      <input
        type="range"
        className="ctl"
        value={value}
        min={min}
        max={max}
        step={step}
        // The only visible text in this label is aria-hidden, so without an
        // explicit name all four sliders announced as "slider, 76". valuetext
        // carries the unit: leading otherwise reads "134", not "1.34".
        aria-label={label}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="w-8 text-right text-[0.6875rem] tabular-nums text-ink-muted">{display}</span>
    </label>
  )
}
