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
 * A face's vertical metrics, in ems (so they scale to any size). We keep both
 * the face's *declared* box (`fontBoundingBox*`, the room the line box reserves)
 * and its *actual* ink reach (`actualBoundingBox*`, how far real glyphs draw):
 * clipping happens precisely when the ink overshoots the declared box by more
 * than the line's leading gives back.
 *
 * `fontBoundingBox` alone — what the previous fix measured — is not enough: many
 * faces, especially script and display, draw descenders well past their own
 * declared descent, so a reserve based on the declared box still shears them.
 */
type FaceMetrics = { fAsc: number; fDesc: number; aAsc: number; aDesc: number }

// Before the real face is loaded, reserve generously rather than measuring a
// system fallback — an over-reserve is invisible slack, an under-reserve clips.
const FALLBACK_METRICS: FaceMetrics = { fAsc: 0.95, fDesc: 0.35, aAsc: 1.0, aDesc: 0.45 }

// Measured metrics per family, cached so the canvas probe runs once per face.
const metricsCache = new Map<string, FaceMetrics>()
let probeCanvas: HTMLCanvasElement | null = null

/**
 * The face's declared box and actual ink reach, in ems, measured off canvas.
 * Returns the fallback *without* caching until the face is genuinely loaded, so
 * a later call (once `state` is ready) measures the real thing.
 */
function faceMetrics(family: string): FaceMetrics {
  const cached = metricsCache.get(family)
  if (cached) return cached

  if (typeof document === 'undefined' || !document.fonts?.check(`100px "${family}"`)) {
    return FALLBACK_METRICS
  }

  try {
    probeCanvas ??= document.createElement('canvas')
    const ctx = probeCanvas.getContext('2d')
    if (!ctx) return FALLBACK_METRICS
    // Probe at 100px so pixel metrics read directly as ems (÷100). The `serif`
    // fallback and the probe strings only satisfy the API; the box metrics are
    // the face's own, independent of the specimen text.
    ctx.font = `400 100px "${family}", serif`
    const deep = ctx.measureText('gjpqyçÇµ') // deep descenders
    const tall = ctx.measureText('HÂÊÎÔÀÉbdfhklß') // caps, tallest accents (circumflex), ascenders
    const fAsc = deep.fontBoundingBoxAscent
    const fDesc = deep.fontBoundingBoxDescent
    // Platforms that don't report the box metrics (older engines) keep the
    // generous fallback rather than a wrong measurement.
    if (typeof fAsc !== 'number' || typeof fDesc !== 'number' || fAsc + fDesc <= 0) {
      return FALLBACK_METRICS
    }
    const m: FaceMetrics = {
      fAsc: fAsc / 100,
      fDesc: fDesc / 100,
      aAsc: (typeof tall.actualBoundingBoxAscent === 'number' ? tall.actualBoundingBoxAscent : fAsc) / 100,
      aDesc: (typeof deep.actualBoundingBoxDescent === 'number' ? deep.actualBoundingBoxDescent : fDesc) / 100,
    }
    metricsCache.set(family, m)
    return m
  } catch {
    return FALLBACK_METRICS
  }
}

/**
 * The padding a block needs so `overflow: hidden` never shears the first line's
 * ascenders or the last line's descenders, for a given size and leading.
 *
 * A line box reserves `fDesc` below the baseline plus half of any extra leading;
 * ink reaches `aDesc`. Whatever the ink has beyond what the box gives back is
 * the overshoot the padding must cover (same reasoning, mirrored, on top). When
 * the leading already clears the ink this is zero, so well-set faces pay nothing.
 */
function edgePads(m: FaceMetrics, size: number, leading: number) {
  const half = (leading / 100 - m.fAsc - m.fDesc) / 2 // half the leading slack, in ems (may be negative)
  // Metrics are probed at 100px and scaled, but glyph ink is non-linear across
  // sizes (hinting), so the scaled value slightly under-predicts the rendered
  // reach. This margin absorbs that; it only ever adds padding where the leading
  // is already tight (e.g. the display line), so body text pays nothing.
  const SAFETY = 0.08
  const reserve = (ink: number, box: number) => Math.min(0.6, Math.max(0, ink - box - half + SAFETY)) * size
  return { top: reserve(m.aAsc, m.fAsc), bottom: reserve(m.aDesc, m.fDesc) }
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
                fontReady={ready}
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
                  fontReady={ready}
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
  fontReady,
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
  /** True once the face's regular weight is loaded — the cue to re-measure ink. */
  fontReady: boolean
  /** The block the control rail is currently acting on. */
  isActive: boolean
  onFocus: () => void
  onChange: (text: string) => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const size = style.size

  // The loaded face's real box + ink metrics, so the padding reserves exactly
  // the room descenders and ascenders actually need instead of a flat guess.
  const [metrics, setMetrics] = useState<FaceMetrics>(() => faceMetrics(metricsKey))
  const pads = edgePads(metrics, size, style.leading)

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
    metrics,
  ])

  // Re-measure the face's ink whenever it becomes ready. `fontReady` is the
  // reliable cue: the previous code leaned on `document.fonts.ready`, which — in
  // a child that renders before the parent kicks off the font request — resolves
  // *before* the round's face is loaded, so it measured a fallback and never
  // corrected, leaving descenders to clip. `document.fonts.ready` stays as a
  // backstop for cached swaps that are already ready on mount.
  useEffect(() => {
    let cancelled = false
    const sync = () => {
      if (cancelled) return
      setMetrics(faceMetrics(metricsKey))
      fit()
    }
    sync()
    document.fonts?.ready.then(sync)
    return () => {
      cancelled = true
    }
  }, [fit, metricsKey, fontReady])

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
        // A line box tighter than the face's own ink reach lets glyphs spill
        // outside the content box, where `overflow: hidden` shears them — the
        // descender of a g on the last line simply vanishes. Reserve exactly the
        // overshoot the ink has beyond the line box, top and bottom independently
        // (see `edgePads`). Padding is inside scrollHeight, so the auto-grow
        // accounts for it. When the leading already clears the ink this is zero.
        paddingTop: `${pads.top}px`,
        paddingBottom: `${pads.bottom}px`,
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
