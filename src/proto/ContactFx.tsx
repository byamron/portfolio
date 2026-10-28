import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { animate, AnimatePresence, motion, useAnimationControls, useMotionValue, useReducedMotion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { PaperTexture } from '@paper-design/shaders-react'
import { useProtoSettings } from './protoSettings'

// Contact-row easter eggs for /new/simple, in the X flock's spirit: an
// immediate payoff, plus a little more if you stay. Each one changes the
// icon or pops a small object out of it — never new page chrome.

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const POP = { type: 'spring', stiffness: 520, damping: 30, mass: 0.7 } as const
// Hover longer than a glance and the second beat plays.
const LINGER_MS = 1600

const finePointer = () => typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches

/** Hover/focus → stage 1 at once, stage 2 after LINGER_MS; leave → 0. */
function useHoverStage() {
  const [stage, setStage] = useState<0 | 1 | 2>(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)
  const enabled = useMemo(finePointer, [])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const open = () => {
    if (!enabled || stage) return
    setStage(1)
    timer.current = setTimeout(() => setStage(2), LINGER_MS)
  }
  const close = () => {
    if (timer.current) clearTimeout(timer.current)
    setStage(0)
  }
  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType !== 'touch') open() },
    onPointerLeave: close,
    onFocus: open,
    onBlur: close,
  }
  return { stage, handlers }
}

/** Popover anchored under an icon button: springs out of the icon. */
function IconPopover({ show, children, width }: { show: boolean; children: ReactNode; width: number }) {
  const reducedMotion = useReducedMotion()
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden="true"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: reducedMotion ? { duration: 0.12 } : POP }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.9, transition: { duration: 0.12, ease: 'easeIn' } }}
          style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: 0, width,
            transformOrigin: '22px -10px', // the icon's centre
            zIndex: 30, pointerEvents: 'none',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// GitHub: a little editor writes a blimp, runs it, and the blimp flies
// across the top of the page (it finishes its trip even after you leave).
// ─────────────────────────────────────────────────────────────────────────

/** Types `text` at a fast clip, then calls onDone. Reduced motion: instant. */
function Typed({ text, onDone, cps = 110 }: { text: string; onDone?: () => void; cps?: number }) {
  const reducedMotion = useReducedMotion()
  const [n, setN] = useState(reducedMotion ? text.length : 0)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (n >= text.length) { done.current?.(); return }
    const t = setTimeout(() => setN(v => v + Math.max(1, Math.round(cps / 30))), 1000 / 30)
    return () => clearTimeout(t)
  }, [n, text, cps])
  return <>{text.slice(0, n)}</>
}

const termLine: React.CSSProperties = { whiteSpace: 'pre', lineHeight: 1.6 }
const prompt = <span style={{ opacity: 0.5 }}>$ </span>

// The program, one line at a time. Plain text is typed; colour comes from a
// tiny highlighter so the half-typed line is coloured too.
const CODE = [
  "const blimp = new Blimp()",
  "blimp.banner('Hi')",
  "blimp.fly('across the top')",
]
function highlight(src: string) {
  return src.split(/('[^']*'?)/).map((part, i) =>
    part.startsWith("'")
      ? <span key={i} className="term-str">{part}</span>
      : part.split(/\b(const|new)\b/).map((w, j) =>
          w === 'const' || w === 'new' ? <span key={`${i}${j}`} className="term-kw">{w}</span> : w),
  )
}

function Terminal({ onRun }: { onRun: () => boolean }) {
  const reducedMotion = useReducedMotion()
  const [line, setLine] = useState(0) // code lines finished
  const [typedRun, setTypedRun] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  useEffect(() => {
    if (!typedRun) return
    const t = setTimeout(() => {
      if (reducedMotion) { setResult('blimp grounded (reduced motion)'); return }
      setResult(onRun() ? 'blimp launched' : 'blimp already in the air')
    }, 180)
    return () => clearTimeout(t)
  }, [typedRun, onRun, reducedMotion])
  return (
    <div className="term-window">
      <div className="term-bar">
        <span /><span /><span />
        <em>hi.js</em>
      </div>
      <div className="term-body">
        {CODE.map((src, i) => i <= line && (
          <div key={i} style={termLine}>
            <span className="term-ln">{i + 1}</span>
            {i < line ? highlight(src) : <TypedHighlighted text={src} onDone={() => setLine(l => l + 1)} />}
          </div>
        ))}
        {line >= CODE.length && (
          <div style={{ ...termLine, marginTop: 6 }}>{prompt}<Typed text="node hi.js" cps={45} onDone={() => setTypedRun(true)} /></div>
        )}
        {result && (
          <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.16 }} style={termLine}>
            <span className="term-str">done</span>  {result}
          </motion.div>
        )}
        {!result && <span className="term-caret" />}
      </div>
    </div>
  )
}

function TypedHighlighted({ text, onDone }: { text: string; onDone: () => void }) {
  const reducedMotion = useReducedMotion()
  const [n, setN] = useState(reducedMotion ? text.length : 0)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (n >= text.length) { const t = setTimeout(() => done.current(), 140); return () => clearTimeout(t) }
    // ~42 chars/s with a little human unevenness.
    const t = setTimeout(() => setN(v => v + 1), 1000 / 42 * (0.6 + Math.random() * 0.8))
    return () => clearTimeout(t)
    return () => clearTimeout(t)
  }, [n, text])
  return <>{highlight(text.slice(0, n))}</>
}

const BANNER_A = 'M 118 30 C 92 25, 58 35, 12 29 L 12 67 C 58 73, 92 63, 118 66 Z'
const BANNER_B = 'M 118 30 C 92 35, 58 26, 12 33 L 12 71 C 58 64, 92 72, 118 66 Z'

/** A small, chubby airship: shaded envelope with gores and seams, fins,
 *  gondola, and a "Hi" banner on a tether. Lit from the top-left. */
const BLIMP = { cx: 214, cy: 50, rx: 70, ry: 33 }
function BlimpArt() {
  const tint = (s: number, l: number) => ({ stopColor: `hsl(var(--accent-hue) ${s}% ${l}%)` })
  const { cx, cy, rx, ry } = BLIMP
  const tail = cx - rx
  return (
    <svg width={300} height={104} viewBox="0 0 300 104" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="blimp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: '#fdfcfa' }} />
          <stop offset="0.45" style={tint(12, 85)} />
          <stop offset="1" style={tint(14, 58)} />
        </linearGradient>
        <radialGradient id="blimp-rim" cx="0.52" cy="0.38" r="0.6">
          <stop offset="0.62" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </radialGradient>
        <linearGradient id="blimp-fin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={tint(14, 72)} />
          <stop offset="1" style={tint(16, 50)} />
        </linearGradient>
        <clipPath id="blimp-clip"><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <filter id="blimp-soft"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      {/* Tether + banner (trails behind; the cloth ripples) */}
      <path d={`M 118 48 Q 128 52 ${tail + 4} 50`} fill="none" stroke="rgba(60,50,40,0.45)" strokeWidth="1" />
      <motion.path
        initial={{ d: BANNER_A }}
        animate={{ d: [BANNER_A, BANNER_B, BANNER_A] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        fill="#f6f1e6" stroke="rgba(60,50,40,0.25)" strokeWidth="0.75"
      />
      <text x="65" y="55" textAnchor="middle" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontWeight="500" fontSize="18" fill="#2b2620">Hi</text>

      {/* Fins: short and stubby to match the round body */}
      <path d={`M ${tail + 22} 27 L ${tail + 4} 10 L ${tail - 6} 12 L ${tail + 8} 32 Z`} fill="url(#blimp-fin)" />
      <path d={`M ${tail + 22} 73 L ${tail + 4} 90 L ${tail - 6} 88 L ${tail + 8} 68 Z`} fill="url(#blimp-fin)" />
      <path d={`M ${tail + 16} 50 L ${tail - 6} 44 L ${tail - 7} 56 Z`} fill="url(#blimp-fin)" opacity="0.9" />

      {/* Gondola, centred under the body */}
      <rect x={cx - 20} y={cy + ry - 4} width="40" height="12" rx="6" style={{ fill: 'hsl(var(--accent-hue) 10% 38%)' }} />
      {[-12, -4, 4].map(dx => <rect key={dx} x={cx + dx} y={cy + ry} width="5" height="4" rx="1" fill="#f3efe6" opacity="0.8" />)}

      {/* Envelope */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#blimp-body)" />
      <g clipPath="url(#blimp-clip)" fill="none" stroke="rgba(40,30,20,0.08)" strokeWidth="1">
        <ellipse cx={cx} cy={cy} rx={rx * 0.6} ry={ry} />
        <ellipse cx={cx} cy={cy} rx={rx * 0.25} ry={ry} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry * 0.38} />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#blimp-rim)" />
      <ellipse cx={cx - 10} cy={cy - 20} rx={rx * 0.62} ry="7" fill="#fff" opacity="0.55" filter="url(#blimp-soft)" />

    </svg>
  )
}

// px/s — an unhurried float (≈18s across a 1440px window).
const BLIMP_SPEED = 95

/** Crosses the top of the viewport at a constant cruise, bobbing gently. */
function BlimpFlight({ onDone }: { onDone: () => void }) {
  const vw = window.innerWidth
  const distance = vw + 340
  return createPortal(
    <motion.div
      aria-hidden="true"
      initial={{ x: -320 }}
      animate={{ x: vw + 20 }}
      // Linear on purpose: an airship cruises at constant speed.
      transition={{ duration: distance / BLIMP_SPEED, ease: 'linear' }}
      onAnimationComplete={onDone}
      style={{ position: 'fixed', top: 56, left: 0, zIndex: 9990, pointerEvents: 'none', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.12))' }}
    >
      <motion.div
        animate={{ y: [0, -5, 0, 4, 0], rotate: [0, -1.2, 0, 1, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BlimpArt />
      </motion.div>
    </motion.div>,
    document.body,
  )
}

export function GitHubLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const { stage, handlers } = useHoverStage()
  const [flying, setFlying] = useState(false)
  const flyingRef = useRef(false)
  // Lives here (not in the popover), so the flight outlasts the hover.
  const launch = useMemo(() => () => {
    if (flyingRef.current) return false
    flyingRef.current = true
    setFlying(true)
    return true
  }, [])
  return (
    <span style={{ position: 'relative', display: 'flex' }} {...handlers}>
      <a data-social className="simple-social" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
      <IconPopover show={stage > 0} width={300}>
        {stage > 0 && <Terminal onRun={launch} />}
      </IconPopover>
      {flying && <BlimpFlight onDone={() => { flyingRef.current = false; setFlying(false) }} />}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// LinkedIn: a printed business card (Ben's Consensus-style template — cream
// stock, light-blue ruled grid, bold blue name, mono details), turning over
// and over in the hand while you hover.
// ─────────────────────────────────────────────────────────────────────────

// Long enough between turns to read each side.
const FLIP_FIRST_MS = 1800
const FLIP_EVERY_MS = 4000

/** Card stock: Paper's paper-texture shader, static and barely there. */
function CardStock() {
  return (
    <PaperTexture
      className="biz-stock"
      colorBack="#fbf8f1"
      colorPaper="#fdfbf6"
      colorShadow="#e9e2d2"
      roughness={0.12}
      roughnessSize={0.25}
      fiber={0.14}
      fiberSize={0.25}
      folds={0}
      crumples={0}
      wrinkles={0}
      drops={0}
      seed={21}
      angle={300}
      fit="cover"
      speed={0}
    />
  )
}

export function LinkedInLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const { stage, handlers } = useHoverStage()
  const reducedMotion = useReducedMotion()
  const { cardCase } = useProtoSettings()
  const [turns, setTurns] = useState(0)
  useEffect(() => {
    if (!stage || reducedMotion) { setTurns(0); return }
    let iv: ReturnType<typeof setInterval>
    const first = setTimeout(() => {
      setTurns(t => t + 1)
      iv = setInterval(() => setTurns(t => t + 1), FLIP_EVERY_MS)
    }, FLIP_FIRST_MS)
    return () => { clearTimeout(first); clearInterval(iv) }
  }, [stage > 0, reducedMotion]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span style={{ position: 'relative', display: 'flex' }} {...handlers}>
      <a data-social className="simple-social" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
      <IconPopover show={stage > 0} width={248}>
        <div style={{ perspective: 800 }}>
          {/* A barely-there drift — held, not pinned; you'd only see it if
              you looked for it. */}
          <motion.div
            animate={reducedMotion ? {} : { y: [0, -1, 0], rotateZ: [-0.25, 0.2, -0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className={`biz-card biz-card--${cardCase}`}
              initial={reducedMotion ? false : { rotateY: -70 }}
              animate={{ rotateY: turns * 180 }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 16 }}
            >
              <div className="biz-face">
                <CardStock />
                <div className="biz-grid">
                  <div className="biz-name-cell">Ben<br />Yamron</div>
                  <div className="biz-row">Product designer</div>
                  <div className="biz-row">linkedin.com/in/benyamron</div>
                  <div className="biz-logo-cell"><img src="/images/logo-consensus-mark.svg" alt="" /></div>
                </div>
              </div>
              <div className="biz-face biz-back">
                <CardStock />
                <div className="biz-grid biz-grid-back">
                  <div className="biz-logo-cell"><img src="/images/logo-consensus-mark.svg" alt="" /></div>
                  <div className="biz-row">Consensus</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </IconPopover>
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Email: copy → the envelope becomes paper, folds into a plane, flies off.
// ─────────────────────────────────────────────────────────────────────────

const EMAIL = 'ben.yamron@icloud.com'
const COPIED_MS = 1800
// After a hover flight: the plane has folded and left; the envelope returns.
const ENVELOPE_BACK_MS = 520
const ICON_SWAP = { type: 'spring', stiffness: 700, damping: 26 } as const

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Insecure context / permissions: the old selection route still works.
    const ta = Object.assign(document.createElement('textarea'), { value: text })
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

// ── Paper airplane: a real dart fold, then a physical glide ─────────────
//
// Fold (classic dart), drawn top-down on a portrait sheet, nose up, in sheet
// units (x ±17, y ±22; crease at x = 0). Every fold moves its free corner
// straight across the hinge — the true top-down projection of paper turning
// over a fold line:
//   1. crease lengthwise (and open)          2. top corners to the crease
//   3. new slanted edges to the crease       4. fold in half along the crease
//   5. turn to the side; each wing down so its edge meets the crease
//   6. open the wings → launch
// Then a point-mass glider (lift ∝ v², drag ∝ v², gravity) takes over — the
// phugoid it produces is the swoop-climb-stall-dip of a real paper plane.

const EDGE = 'rgba(40,30,20,0.3)'

// Grain as a pattern fill, not a filter: rasterised once from a small noise
// tile, so animating the paper never re-runs a filter (that was the jank).
let paperTile: string | null = null
function paperTexture() {
  if (paperTile) return paperTile
  const c = document.createElement('canvas')
  c.width = c.height = 96
  const g = c.getContext('2d')!
  const img = g.createImageData(96, 96)
  for (let i = 0; i < img.data.length; i += 4) {
    // Paper white with fine luminance grain and a few darker fibres.
    const n = Math.random()
    const d = n * 10 + (n > 0.985 ? 18 : 0)
    img.data[i] = 255 - d
    img.data[i + 1] = 253 - d * 1.05
    img.data[i + 2] = 249 - d * 1.15
    img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  return (paperTile = c.toDataURL())
}
/** <pattern> sized so one tile pixel ≈ one screen pixel at `pxPerUnit`. */
function PaperPattern({ id, pxPerUnit }: { id: string; pxPerUnit: number }) {
  const w = 96 / pxPerUnit
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={w} height={w}>
      <image href={paperTexture()} width={w} height={w} />
    </pattern>
  )
}

// Envelope-sized sheet halves (so it can grow out of the icon), then the
// sheet, then the shapes after each fold. Left half; right half mirrors x.
const L_ENVELOPE = 'M 0 -7 L -10 -7 L -10 7 L 0 7 Z'
const L_SHEET = 'M 0 -22 L -17 -22 L -17 22 L 0 22 Z'
const L_AFTER_CORNER = 'M 0 -22 L -17 -5 L -17 22 L 0 22 Z'
const L_AFTER_EDGE = 'M 0 -22 L -17 19 L -17 22 L 0 22 Z'
// Corner flap: hinge (0,-22)–(-17,-5); free corner (-17,-22) → (0,-5).
const L_CORNER_OPEN = 'M 0 -22 L -17 -22 L -17 -5 Z'
const L_CORNER_SHUT = 'M 0 -22 L 0 -5 L -17 -5 Z'
// Edge flap: hinge from the nose at the 112.5° bisector to (-17,19); the
// slanted edge's end (-17,-5) → (0, 2) on the crease.
const L_EDGE_OPEN = 'M 0 -22 L -17 -5 L -17 19 Z'
const L_EDGE_SHUT = 'M 0 -22 L 0 2 L -17 19 Z'
// After folding in half (right onto left): keel (crease side) + wing, split
// at x = -8.5; the wing folds down over that line so its edge meets the crease.
const L_KEEL = 'M 0 -22 L -8.5 -1.5 L -8.5 22 L 0 22 Z'
const L_WING_UP = 'M -8.5 -1.5 L -17 19 L -17 22 L -8.5 22 Z'
const L_WING_DOWN = 'M -8.5 -1.5 L 0 19 L 0 22 L -8.5 22 Z'
const mapPts = (d: string, f: (x: number, y: number) => [number, number]) =>
  d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => f(parseFloat(x), parseFloat(y)).map(v => +v.toFixed(2)).join(' '))
const mirror = (d: string) => mapPts(d, (x, y) => [-x, y])

// Flying sprite (3/4 view, nose right), in sprite units. Point order matches
// the side-view fold shapes corner-for-corner (nose, fold line, tail…) so the
// "open the wings" morph never cross-wires.
const FLY_WING = 'M 14 0 L -5 1.5 L -5 1.5 L -13 -7 Z'
const FLY_KEEL = 'M 14 0 L -5 1.5 L -8 6 L -8 8 Z'

const FOLD_SCALE = 1.25 // px per sheet unit while folding (sheet ≈ 55px tall)
// The folded dart is the sheet's full height long (44 × FOLD_SCALE ≈ 55px);
// the flying sprite's nose-to-tail (−13…14) is scaled to match.
const FLY_SCALE = (44 * FOLD_SCALE) / 27
// The fold's last frame *is* the flight sprite: map sprite units into the
// fold stage's local frame (stage turned 90° cw: screen (X,Y) = (−y, x)).
const toStage = (d: string) => mapPts(d, (fx, fy) => [(FLY_SCALE / FOLD_SCALE) * fy, -(FLY_SCALE / FOLD_SCALE) * fx])
const STAGE_WING = toStage(FLY_WING)
const STAGE_KEEL = toStage(FLY_KEEL)

type Pt = { x: number; y: number }
const RELEASE_S = 0.3
interface Throw { v0: number; gamma0: number } // launch speed (px/s), angle (rad)

const SMOOTH = [0.37, 0, 0.63, 1] as const // sine in-out

/** The fold, beside the icon: one overlapping timeline — each fold begins
 *  as the last settles — ending on the exact flight pose. */
function PaperFold({ from, onFolded }: { from: DOMRect; onFolded: (at: Pt) => void }) {
  const stage = useAnimationControls()
  // The right half's fold about the crease (x = 0), as scaleX. Written to the
  // SVG transform *attribute* — CSS transforms on an SVG <g> didn't apply.
  const rightFold = useMotionValue(1)
  const rightRef = useRef<SVGGElement>(null)
  useEffect(() => rightFold.on('change', v => rightRef.current?.setAttribute('transform', `scale(${v} 1)`)), [rightFold])
  const baseL = useAnimationControls(), baseR = useAnimationControls()
  const cornerL = useAnimationControls(), cornerR = useAnimationControls()
  const edgeL = useAnimationControls(), edgeR = useAnimationControls()
  const keel = useAnimationControls(), wing = useAnimationControls()
  const crease = useAnimationControls()
  const flap = useAnimationControls()
  const [phase, setPhase] = useState<'top' | 'side'>('top')
  const start = { x: from.left + from.width / 2, y: from.top + from.height / 2 }
  // Fold in the empty space to the right of the icon row.
  const at = { x: start.x + 78, y: start.y - 4 }

  useEffect(() => {
    // Every motion is started at its own moment. (Queuing several delayed
    // .start() calls on one control at once lets the later ones cancel the
    // earlier — that's what used to skip the sheet opening and the crease.)
    const timers: ReturnType<typeof setTimeout>[] = []
    const at$ = (sec: number, fn: () => void) => timers.push(setTimeout(fn, sec * 1000))
    const tw = (duration: number) => ({ duration, ease: SMOOTH })

    // 0 · The envelope slides out of the slot and opens into a flat sheet.
    flap.start({ opacity: 0, transition: { duration: 0.35 } })
    baseL.start({ d: L_SHEET, transition: tw(0.7) })
    baseR.start({ d: mirror(L_SHEET), transition: tw(0.7) })
    stage.start({ x: at.x - start.x, y: at.y - start.y, scale: FOLD_SCALE, transition: tw(0.8) })
    // 1 · Crease lengthwise: the right half lifts over and lays back down.
    at$(0.8, () => {
      crease.start({ pathLength: 1, opacity: 1, transition: tw(0.6) })
      animate(rightFold, [1, 0.18, 1], tw(0.8))
    })
    // 2 · Top corners to the crease, left then right.
    at$(1.55, () => {
      cornerL.set({ opacity: 1 }); cornerR.set({ opacity: 1 })
      baseL.start({ d: L_AFTER_CORNER, transition: tw(0.6) })
      cornerL.start({ d: L_CORNER_SHUT, transition: tw(0.6) })
    })
    at$(1.75, () => {
      baseR.start({ d: mirror(L_AFTER_CORNER), transition: tw(0.6) })
      cornerR.start({ d: mirror(L_CORNER_SHUT), transition: tw(0.6) })
    })
    // 3 · The new slanted edges to the crease.
    at$(2.38, () => {
      cornerL.set({ opacity: 0 }); cornerR.set({ opacity: 0 })
      edgeL.set({ opacity: 1 }); edgeR.set({ opacity: 1 })
      baseL.start({ d: L_AFTER_EDGE, transition: tw(0.6) })
      edgeL.start({ d: L_EDGE_SHUT, transition: tw(0.6) })
    })
    at$(2.58, () => {
      baseR.start({ d: mirror(L_AFTER_EDGE), transition: tw(0.6) })
      edgeR.start({ d: mirror(L_EDGE_SHUT), transition: tw(0.6) })
    })
    // 4 · Fold in half: the right half turns over onto the left.
    at$(3.2, () => { animate(rightFold, -1, tw(0.7)) })
    // 5 · Turn to the side (nose right), then the wing comes down.
    at$(3.9, () => {
      setPhase('side')
      stage.start({ rotate: 90, transition: tw(0.75) })
    })
    at$(4.6, () => { wing.start({ d: L_WING_DOWN, transition: tw(0.6) }) })
    // 6 · Open the wings into the flying pose — level, in place — and let go.
    at$(5.15, () => {
      wing.start({ d: STAGE_WING, transition: tw(0.55) })
      keel.start({ d: STAGE_KEEL, transition: tw(0.55) })
    })
    at$(5.72, () => onFolded(at))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const paper = { fill: 'url(#paper-fold)', stroke: EDGE, strokeWidth: 0.45, strokeLinejoin: 'round' as const }
  return createPortal(
    <motion.svg
      aria-hidden="true"
      width={80} height={80} viewBox="-40 -40 80 80"
      initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
      animate={stage}
      style={{
        position: 'fixed', left: start.x - 40, top: start.y - 40, zIndex: 9999, pointerEvents: 'none',
        overflow: 'visible', color: 'var(--text-dark)', willChange: 'transform',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.16))',
      }}
    >
      <defs><PaperPattern id="paper-fold" pxPerUnit={FOLD_SCALE} /></defs>
      {phase === 'top' ? (
        <>
          <g>
            <motion.path initial={{ d: L_ENVELOPE }} animate={baseL} {...paper} />
            <motion.path initial={{ d: L_CORNER_OPEN, opacity: 0 }} animate={cornerL} {...paper} />
            <motion.path initial={{ d: L_EDGE_OPEN, opacity: 0 }} animate={edgeL} {...paper} />
          </g>
          {/* Right half pivots on the crease (x = 0) for steps 1 and 4. */}
          <g ref={rightRef}>
            <motion.path initial={{ d: mirror(L_ENVELOPE) }} animate={baseR} {...paper} />
            <motion.path initial={{ d: mirror(L_CORNER_OPEN), opacity: 0 }} animate={cornerR} {...paper} />
            <motion.path initial={{ d: mirror(L_EDGE_OPEN), opacity: 0 }} animate={edgeR} {...paper} />
          </g>
          <motion.path d="M 0 -22 L 0 22" stroke={EDGE} strokeWidth={0.4} initial={{ pathLength: 0, opacity: 0 }} animate={crease} />
          {/* The envelope's flap, fading as it opens into a sheet. */}
          <motion.path d="M -10 -7 L 0 0.5 L 10 -7" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round" initial={{ opacity: 0.8 }} animate={flap} />
        </>
      ) : (
        <>
          <motion.path initial={{ d: L_KEEL }} animate={keel} {...paper} />
          <motion.path initial={{ d: L_WING_UP }} animate={wing} {...paper} />
        </>
      )}
    </motion.svg>,
    document.body,
  )
}

/** Point-mass glider, integrated at 240 Hz and written straight to the DOM.
 *  dv/dt = −D − g·sinγ, dγ/dt = (L − g·cosγ)/v, L = kL·v², D = L/LD. Launched
 *  faster than trim it climbs, slows, noses over and swoops — the phugoid.
 *  Turbulence nudges γ; now and then it banks into a turn and reverses. */
function PaperFlight({ from, launch, onDone }: { from: Pt; launch: Throw; onDone: () => void }) {
  const el = useRef<HTMLDivElement>(null)
  const sprite = useRef<SVGSVGElement>(null)
  useEffect(() => {
    // Every throw is different: launch speed and angle, trim, glide ratio,
    // the air's character, and whether / when it banks into turns.
    const r = (a: number, b: number) => a + Math.random() * (b - a)
    const G = 240, V_TRIM = r(105, 135), LD = r(4, 6.5)
    const kL = G / (V_TRIM * V_TRIM), kD = kL / LD
    let x = from.x, y = from.y
    let v = launch.v0, gamma = launch.gamma0 // a hard throw can loop
    let dir = 1, bank = 0, turning = 0 // bank: 0 → π over a turn
    const seed = Math.random() * 100
    const gustAmp = r(0.12, 0.38), gustRate = r(0.7, 1.4)
    const turnCount = Math.floor(r(0, 3)) // 0, 1 or 2
    const turns = [r(1.2, 3.2), r(4.2, 7.5)].slice(0, turnCount)
    const turnSecs = r(0.8, 1.2)
    let t = 0, last = performance.now(), raf = 0, fade = 1
    const vw = window.innerWidth, vh = window.innerHeight
    const frame = (now: number) => {
      let dt = Math.min(0.05, (now - last) / 1000)
      last = now
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240)
        dt -= h
        t += h
        if (!turning && turns.length && t >= turns[0]!) { turns.shift(); turning = 1 }
        if (turning) {
          bank += (Math.PI / turnSecs) * h
          if (bank >= Math.PI) { bank = 0; turning = 0; dir = -dir }
        }
        const lift = kL * v * v * (turning ? Math.abs(Math.cos(bank)) * 0.4 + 0.6 : 1)
        const drag = kD * v * v * (turning ? 1.5 : 1)
        // Smooth turbulence: a few incommensurate sines (faded in after release).
        const tg = t * gustRate
        const gust = Math.min(1, t / 0.6) * gustAmp * (Math.sin(tg * 1.7 + seed) + 0.6 * Math.sin(tg * 3.1 + seed * 2) + 0.3 * Math.sin(tg * 5.3 + seed * 3))
        v = Math.max(35, v + (-drag - G * Math.sin(gamma)) * h)
        gamma += ((lift - G * Math.cos(gamma)) / v + gust) * h
        const facing = turning ? dir * Math.cos(bank) : dir
        // Release: the hand eases it up to speed over the first 0.3s.
        const k = t < RELEASE_S ? (t / RELEASE_S) * (t / RELEASE_S) * (3 - 2 * (t / RELEASE_S)) : 1
        x += facing * v * Math.cos(gamma) * h * k
        y -= v * Math.sin(gamma) * h * k
      }
      const out = x < -90 || x > vw + 90 || y > vh + 90 || y < -160
      if (out || t > 14) fade = Math.max(0, fade - 0.04)
      const facing = turning ? dir * Math.cos(bank) : dir
      const sx = Math.sign(facing || 1) * Math.max(0.12, Math.abs(facing))
      if (el.current) {
        el.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
        el.current.style.opacity = String(fade)
      }
      if (sprite.current) sprite.current.style.transform = `scaleX(${sx}) rotate(${(-gamma * 180) / Math.PI}deg)`
      if (fade <= 0) { onDone(); return }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return createPortal(
    <div ref={el} aria-hidden="true" style={{ position: 'fixed', left: 0, top: 0, zIndex: 9999, pointerEvents: 'none', willChange: 'transform', transform: `translate3d(${from.x}px, ${from.y}px, 0)` }}>
      <svg
        ref={sprite}
        width={64} height={64} viewBox="-32 -32 64 64"
        style={{
          position: 'absolute', left: -32, top: -32, overflow: 'visible', willChange: 'transform',
          transform: `rotate(${(-launch.gamma0 * 180) / Math.PI}deg)`,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.16))',
        }}
      >
        <defs><PaperPattern id="paper-fly" pxPerUnit={FLY_SCALE} /></defs>
        <g transform={`scale(${FLY_SCALE})`}>
          <path d={FLY_KEEL} fill="url(#paper-fly)" stroke={EDGE} strokeWidth={0.3} strokeLinejoin="round" />
          <path d={FLY_WING} fill="url(#paper-fly)" stroke={EDGE} strokeWidth={0.3} strokeLinejoin="round" />
        </g>
      </svg>
    </div>,
    document.body,
  )
}

function PaperPlane({ from, onDone }: { from: DOMRect; onDone: () => void }) {
  // Released level from the fold's pose (no tilt); thrown above trim speed,
  // lift exceeds weight and it climbs on its own.
  const launch = useMemo<Throw>(() => ({ v0: 175 + Math.random() * 85, gamma0: 0 }), [])
  const [flight, setFlight] = useState<Pt | null>(null)
  return flight
    ? <PaperFlight from={flight} launch={launch} onDone={onDone} />
    : <PaperFold from={from} onFolded={setFlight} />
}

/** Email. Hover: the envelope turns to paper, folds into a plane and flies
 *  off, then a fresh envelope springs back into the slot. Click: copies the
 *  address (never shown) — check + "Email address copied". */
export function CopyEmailButton({ icon }: { icon: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const [copied, setCopied] = useState(false)
  // Up to a few planes in the air at once — a new hover throws another.
  const [planes, setPlanes] = useState<{ id: number; from: DOMRect }[]>([])
  const nextId = useRef(0)
  const [slotEmpty, setSlotEmpty] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const btn = useRef<HTMLButtonElement>(null)
  const canFly = useMemo(finePointer, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))

  const swap = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.4, rotate: -30 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.4, rotate: 30 },
      }

  const fly = () => {
    if (!canFly || reducedMotion || slotEmpty || copied || planes.length >= 3) return
    const glyph = btn.current?.querySelector('svg')
    if (!glyph) return
    const from = glyph.getBoundingClientRect()
    setPlanes(ps => [...ps, { id: nextId.current++, from }])
    setSlotEmpty(true)
    // The plane has folded and left the slot by now; a new envelope arrives.
    later(ENVELOPE_BACK_MS, () => setSlotEmpty(false))
  }

  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <button
        ref={btn}
        type="button"
        data-social
        className="simple-social"
        aria-label="Copy email address"
        onPointerEnter={e => { if (e.pointerType !== 'touch') fly() }}
        onClick={async () => {
          // Couldn't copy: fall back to what an envelope usually means.
          if (!(await copyText(EMAIL))) { window.location.href = `mailto:${EMAIL}`; return }
          timers.current.forEach(clearTimeout)
          timers.current = []
          setSlotEmpty(false)
          // Off for a frame on a repeat click, so the note replays and the
          // status region re-announces.
          setCopied(false)
          requestAnimationFrame(() => setCopied(true))
          later(COPIED_MS, () => setCopied(false))
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'check' : slotEmpty ? 'empty' : 'mail'}
            {...swap}
            transition={ICON_SWAP}
            style={{ display: 'flex', width: 24, height: 24 }}
          >
            {copied ? <Check size={24} weight="regular" aria-hidden="true" /> : slotEmpty ? null : icon}
          </motion.span>
        </AnimatePresence>
      </button>
      {planes.map(pl => (
        <PaperPlane key={pl.id} from={pl.from} onDone={() => setPlanes(ps => ps.filter(x => x.id !== pl.id))} />
      ))}
      {/* Out of flow, so the row never shifts; read out politely. */}
      <span role="status" className="simple-copied-slot">
        <AnimatePresence>
          {copied && (
            <motion.span
              key="toast"
              className="simple-copied"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -6, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -4, filter: 'blur(2px)' }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              style={{ display: 'inline-block' }}
            >
              Email address copied
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  )
}
