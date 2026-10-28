import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { animate, AnimatePresence, cancelFrame, frame, motion, useAnimationControls, useMotionValue, useReducedMotion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { PaperTexture } from '@paper-design/shaders-react'
import { protoBySlug } from './data'
import { EASE_OUT, PHONE_QUERY, useProtoSettings } from './protoSettings'

// Contact-row easter eggs for /new/simple, in the X flock's spirit: an
// immediate payoff, plus a little more if you stay. Each one changes the
// icon or pops a small object out of it — never new page chrome.

const POP = { type: 'spring', stiffness: 520, damping: 30, mass: 0.7 } as const
// Hover longer than a glance and the second beat plays.
const LINGER_MS = 1600

const finePointer = () => typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches

/** Hover/focus → stage 1 at once, stage 2 after LINGER_MS; leave, blur or
 *  Escape → 0 (WCAG 1.4.13: dismissible). `viaPointer` tells callers whether
 *  a real hover (vs. keyboard focus) opened it. */
function useHoverStage() {
  const [stage, setStage] = useState<0 | 1 | 2>(0)
  const [viaPointer, setViaPointer] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)
  const enabled = useMemo(finePointer, [])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const open = (pointer: boolean) => {
    if (!enabled || stage) return
    setViaPointer(pointer)
    setStage(1)
    timer.current = setTimeout(() => setStage(2), LINGER_MS)
  }
  const close = () => {
    if (timer.current) clearTimeout(timer.current)
    setStage(0)
  }
  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType !== 'touch') open(true) },
    onPointerLeave: close,
    onFocus: () => open(false),
    onBlur: close,
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Escape') close() },
  }
  return { stage, viaPointer, handlers }
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
const codeFor = (greeting: string) => [
  "const blimp = new Blimp()",
  `blimp.banner('${greeting}')`,
  "blimp.fly('across the top')",
]
// What the banner says — a different hello each flight (never twice running).
const GREETINGS = ['Hi', 'Hello', 'Hey', 'Hey there', 'Hi there', 'Hiya', 'Howdy', 'Ahoy', 'Greetings', 'Good day']
const pickGreeting = (not?: string) => {
  const pool = GREETINGS.filter(g => g !== not)
  return pool[Math.floor(Math.random() * pool.length)]!
}
function highlight(src: string) {
  return src.split(/('[^']*'?)/).map((part, i) =>
    part.startsWith("'")
      ? <span key={i} className="term-str">{part}</span>
      : part.split(/\b(const|new)\b/).map((w, j) =>
          w === 'const' || w === 'new' ? <span key={`${i}${j}`} className="term-kw">{w}</span> : w),
  )
}

function Terminal({ greeting, onRun }: { greeting: string; onRun: () => 'launched' | 'flying' | 'standby' }) {
  const CODE = codeFor(greeting)
  const reducedMotion = useReducedMotion()
  const [line, setLine] = useState(0) // code lines finished
  const [typedRun, setTypedRun] = useState(false)
  const [result, setResult] = useState<[string, string] | null>(null)
  useEffect(() => {
    if (!typedRun) return
    const t = setTimeout(() => {
      if (reducedMotion) { setResult(['hold', 'blimp grounded']); return }
      const r = onRun()
      setResult(r === 'launched' ? ['done', 'blimp launched']
        : r === 'flying' ? ['hold', 'waiting for air traffic control…']
        : ['ready', 'blimp on standby'])
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
          <div style={{ ...termLine, marginTop: 6 }}>{prompt}<Typed text="node hi.js" cps={35} onDone={() => setTypedRun(true)} /></div>
        )}
        {result && (
          <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.16 }} style={termLine}>
            <span className="term-str">{result[0]}</span>  {result[1]}
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
    // ~32 chars/s with a little human unevenness.
    const t = setTimeout(() => setN(v => v + 1), 1000 / 32 * (0.6 + Math.random() * 0.8))
    return () => clearTimeout(t)
  }, [n, text])
  return <>{highlight(text.slice(0, n))}</>
}

const BANNER_A = 'M 118 30 C 92 25, 58 35, 12 29 L 12 67 C 58 73, 92 63, 118 66 Z'
const BANNER_B = 'M 118 30 C 92 35, 58 26, 12 33 L 12 71 C 58 64, 92 72, 118 66 Z'

/** A small, chubby airship: shaded envelope with gores and seams, fins,
 *  gondola, and a greeting banner on a tether. Lit from the top-left. */
const BLIMP = { cx: 214, cy: 50, rx: 70, ry: 33 }
function BlimpArt({ greeting }: { greeting: string }) {
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
      <motion.text
        x="65" textAnchor="middle" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontWeight="500"
        // Mono: ~0.6em per character; longer hellos step down to fit the cloth.
        fontSize={greeting.length <= 5 ? 18 : greeting.length <= 8 ? 15 : 13.5} fill="#2b2620"
        // Rides the cloth, not across it: the banner's centre moves ~0.7 units
        // between its two ripple shapes (cubic midpoints of BANNER_A/B).
        initial={{ y: 55 }} animate={{ y: [55, 55.65, 55] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {greeting}
      </motion.text>

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
        {/* Panels run nose to tail, like an airship's (not a globe's). */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry * 0.38} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry * 0.75} />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#blimp-rim)" />
      <ellipse cx={cx - 10} cy={cy - 20} rx={rx * 0.62} ry="7" fill="#fff" opacity="0.55" filter="url(#blimp-soft)" />

    </svg>
  )
}

// px/s — an unhurried float (≈18s across a 1440px window).
const BLIMP_SPEED = 95

/** Crosses the top of the viewport at a constant cruise, bobbing gently. */
function BlimpFlight({ greeting, onDone }: { greeting: string; onDone: () => void }) {
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
        <BlimpArt greeting={greeting} />
      </motion.div>
    </motion.div>,
    document.body,
  )
}

export function GitHubLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const { stage, viaPointer, handlers } = useHoverStage()
  const [flying, setFlying] = useState(false)
  const flyingRef = useRef(false)
  // Lives here (not in the popover), so the flight outlasts the hover.
  // Only a real hover launches it: a long screen-crossing flight shouldn't
  // start from keyboard focus passing through (WCAG 2.2.2).
  const pointerRef = useRef(false)
  pointerRef.current = viaPointer
  // A new hello for each visit to the terminal (kept while one is in the air,
  // so the code on screen always matches the banner flying).
  const [greeting, setGreeting] = useState(() => pickGreeting())
  const lastStage = useRef(0)
  useEffect(() => {
    if (lastStage.current === 0 && stage > 0 && !flyingRef.current) setGreeting(g => pickGreeting(g))
    lastStage.current = stage
  }, [stage])
  const launch = useCallback((): 'launched' | 'flying' | 'standby' => {
    if (!pointerRef.current) return 'standby'
    if (flyingRef.current) return 'flying'
    flyingRef.current = true
    setFlying(true)
    return 'launched'
  }, [])
  return (
    <span style={{ position: 'relative', display: 'flex' }} {...handlers}>
      <a data-social className="simple-social" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
      <IconPopover show={stage > 0} width={300}>
        {stage > 0 && <Terminal greeting={greeting} onRun={launch} />}
      </IconPopover>
      {flying && <BlimpFlight greeting={greeting} onDone={() => { flyingRef.current = false; setFlying(false) }} />}
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

const EMAIL = protoBySlug.get('email')!.href.replace(/^mailto:/, '')
const COPIED_MS = 1800
// After a hover flight: the plane has folded and left; the envelope returns.
const ENVELOPE_BACK_MS = 520
const DWELL_MS = 150
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

// ── Paper geometry ──────────────────────────────────────────────────────
// Sheet units: portrait sheet, nose up, x ±17, y ±22, crease at x = 0. We
// model the LEFT half; the right half is its mirror, turned about the crease.
// Every face is a polygon; a fold moves its free corners straight across the
// hinge (the true top-down projection), so paper never slides or stretches.

type P2 = [number, number]
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const pathOf = (pts: P2[]) => 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ') + ' Z'

const NOSE: P2 = [0, -22]
// Envelope (icon-sized) → sheet.
const ENVELOPE: P2[] = [[0, -7], [-10, -7], [-10, 7], [0, 7]]
const SHEET: P2[] = [[0, -22], [-17, -22], [-17, 22], [0, 22]]
// Step 2 · corner to crease: hinge NOSE–(-17,-5); (-17,-22) → (0,-5).
const BASE_2: P2[] = [[0, -22], [-17, -5], [-17, 22], [0, 22]]
const CORNER_FREE: [P2, P2] = [[-17, -22], [0, -5]]
// Step 3 · slanted edge to crease: hinge NOSE–(-17,19) (the 112.5° bisector);
// (-17,-5) → (0, 2.04). It cuts the corner flap at (-7.05,-5): the part
// beyond the hinge rides along with the fold, the rest stays put.
const BASE_3: P2[] = [[0, -22], [-17, 19], [-17, 22], [0, 22]]
const EDGE_FREE: [P2, P2] = [[-17, -5], [0, 2.04]]
const H3_AT_Y5: P2 = [-7.05, -5]
// Step 5 · the dart's wing fold, from the nose to (-8.75, 22) — the bottom
// edge's midpoint, so the folded wing's edge meets the crease.
const HINGE_T: P2 = [-8.75, 22]
const KEEL: P2[] = [[0, -22], [-8.75, 22], [0, 22]]
const WING: P2[] = [[0, -22], [-17, 19], [-17, 22], [-8.75, 22]]
// The wing's share of the step-3 flap (its outer line, seen once the wing turns
// its inner face toward us): split where (0,2.04)–(-17,19) crosses the hinge.
const WING_FLAP: P2[] = [[0, -22], [-5.96, 7.96], [-17, 19]]

/** Orthographic view of a wing point turned ψ about the dart hinge (0 = flat,
 *  in the sheet's plane; 180 = folded down onto the keel), with the whole plane
 *  rolled `roll` about its length so an open wing reads. side: +1 near, −1 far. */
// The hinge's unit direction (constant).
const HINGE_U: P2 = (() => {
  const ux = HINGE_T[0] - NOSE[0], uy = HINGE_T[1] - NOSE[1]
  const ul = Math.hypot(ux, uy)
  return [ux / ul, uy / ul]
})()
function wingPoint(p: P2, psi: number, roll: number, side: 1 | -1): P2 {
  const u = HINGE_U
  const dx = p[0] - NOSE[0], dy = p[1] - NOSE[1]
  const a = dx * u[0] + dy * u[1]
  const qx = dx - a * u[0], qy = dy - a * u[1]
  const c = Math.cos(psi), sn = Math.sin(psi)
  const x = NOSE[0] + a * u[0] + qx * c
  const y = NOSE[1] + a * u[1] + qy * c
  const z = side * Math.hypot(qx, qy) * sn
  return [x * Math.cos(roll) + z * Math.sin(roll), y]
}
const keelPoint = (p: P2, roll: number): P2 => [p[0] * Math.cos(roll), p[1]]

/** Side-view faces at a given wing angle and roll (shared by the fold's last
 *  steps and the flying sprite, so the hand-off is exact). */
function sideFaces(psi: number, roll: number) {
  return {
    far: pathOf(WING.map(p => wingPoint(p, psi, roll, -1))),
    keel: pathOf(KEEL.map(p => keelPoint(p, roll))),
    near: pathOf(WING.map(p => wingPoint(p, psi, roll, 1))),
    nearFlap: pathOf(WING_FLAP.map(p => wingPoint(p, psi, roll, 1))),
    hinge: `M ${keelPoint(NOSE, roll).join(' ')} L ${keelPoint(HINGE_T, roll).join(' ')}`,
  }
}
const OPEN_PSI = (95 * Math.PI) / 180 // a touch of dihedral
const OPEN_ROLL = (-55 * Math.PI) / 180 // rolled toward us so the wings read
const FLY_FACES = sideFaces(OPEN_PSI, OPEN_ROLL)

const FOLD_SCALE = 1.25 // px per sheet unit (sheet ≈ 55px tall)
const PAPER_SHADOW = 'drop-shadow(0 2px 3px rgba(0,0,0,0.16))'

type Pt = { x: number; y: number }
const RELEASE_S = 0.3
interface Throw { v0: number; vTrim: number } // launch speed, trim speed (px/s)

const SMOOTH = [0.37, 0, 0.63, 1] as const // sine in-out
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** The fold, beside the icon: a parameter per step, all faces derived from
 *  them every frame, so the paper stays one continuous sheet. */
function PaperFold({ from, onFolded }: { from: DOMRect; onFolded: (at: Pt) => void }) {
  const uid = useId().replace(/:/g, '')
  const stage = useAnimationControls()
  const start = { x: from.left + from.width / 2, y: from.top + from.height / 2 }
  // Just below the icon, in the empty space under the row — clear of the
  // "Email address copied" note to its right. (Sheet ≈ 55px tall at fold
  // scale: centre it half a sheet plus a 12px gap below the 44px button.)
  const at = { x: start.x, y: start.y + 22 + 12 + (44 * FOLD_SCALE) / 2 }

  // Step parameters (0…1 unless noted).
  const open = useMotionValue(0)
  const lift = useMotionValue(1) // right half's scaleX about the crease
  const creased = useMotionValue(0)
  const cornerL = useMotionValue(0), cornerR = useMotionValue(0)
  const edgeL = useMotionValue(0), edgeR = useMotionValue(0)
  const psi = useMotionValue(0) // wing angle (rad)
  const roll = useMotionValue(0)
  const [side, setSide] = useState(false)
  const els = useRef<Record<string, SVGPathElement | null>>({})
  const ref = (k: string) => (el: SVGPathElement | null) => { els.current[k] = el }

  useEffect(() => {
    const set = (k: string, d: string | null, opacity = 1) => {
      const el = els.current[k]
      if (!el) return
      if (d === null) { el.style.display = 'none'; return }
      el.style.display = ''
      el.setAttribute('d', d)
      el.style.opacity = String(opacity)
    }
    // One half's faces, mapped by fx (identity for left; mirror+turn for right).
    const half = (prefix: string, fx: (p: P2) => P2, c: number, e: number, plainBack: boolean) => {
      const o = open.get()
      const base = e > 0 ? BASE_3 : c > 0 ? BASE_2 : ENVELOPE.map((p, i) => lerp2(p, SHEET[i]!, o))
      const baseD = pathOf(base.map(fx))
      set(prefix + 'base', baseD, o)
      set(prefix + 'baseFill', baseD, o)
      if (plainBack) { // turned over: we see the plain back of this half
        ;['cornerFull', 'cornerStatic', 'cornerMove', 'edge'].forEach(k => set(prefix + k, null))
        return
      }
      if (c > 0 && e === 0) {
        set(prefix + 'cornerFull', pathOf(([NOSE, lerp2(CORNER_FREE[0], CORNER_FREE[1], c), [-17, -5]] as P2[]).map(fx)))
      } else set(prefix + 'cornerFull', null)
      if (e > 0) {
        set(prefix + 'cornerStatic', pathOf(([NOSE, [0, -5], H3_AT_Y5] as P2[]).map(fx)))
        set(prefix + 'edge', pathOf(([NOSE, lerp2(EDGE_FREE[0], EDGE_FREE[1], e), [-17, 19]] as P2[]).map(fx)))
        // The corner's outer part rides on the edge fold; past halfway the
        // stack has turned and it's underneath, out of sight.
        set(prefix + 'cornerMove', pathOf(([NOSE, H3_AT_Y5, lerp2(EDGE_FREE[0], EDGE_FREE[1], e)] as P2[]).map(fx)), clamp01(1 - e * 2))
      } else {
        ;['cornerStatic', 'edge', 'cornerMove'].forEach(k => set(prefix + k, null))
      }
    }
    const render = () => {
      if (!side) {
        const s = lift.get()
        half('L', p => p, cornerL.get(), edgeL.get(), false)
        half('R', p => [-p[0] * s, p[1]], cornerR.get(), edgeR.get(), s < 0)
        // Turned over, the right half lies on top of the left half's flaps.
        const top = s < 0 ? pathOf(BASE_3.map(p => [-p[0] * s, p[1]] as P2)) : null
        set('RtopFill', top); set('Rtop', top)
        // Before the crease exists the two halves are one sheet: hide the seam.
        const seam = els.current.seam
        if (seam) {
          // Spans the current sheet (it grows from the envelope), just inside its edges.
          const hy = 7 + (22 - 7) * open.get() - 0.4
          seam.setAttribute('d', `M 0 ${-hy} L 0 ${hy}`)
          seam.style.opacity = String(open.get() * (1 - creased.get()))
        }
        const glyph = els.current.glyph
        if (glyph) glyph.style.opacity = String(1 - open.get())
      } else {
        const f = sideFaces(psi.get(), roll.get())
        set('far', f.far); set('keel', f.keel); set('near', f.near)
        // The wing's inner face (with the flap line) shows once it's past
        // edge-on (ψ > 90°) — the swap happens while it's a line, unseen.
        set('nearFlap', psi.get() > Math.PI / 2 ? f.nearFlap : null)
        // The hinge only becomes a fold line once the wing starts to turn.
        set('hingeCover', f.hinge, 1 - clamp01(psi.get() / 0.35))
      }
    }
    render()
    // Several values often move in the same frame: render once, in Framer's
    // own render step (same frame as the stage transform; deduped per frame).
    const schedule = () => frame.render(render)
    const unsub = [open, lift, creased, cornerL, cornerR, edgeL, edgeR, psi, roll].map(mv => mv.on('change', schedule))
    return () => { unsub.forEach(u => u()); cancelFrame(render) }
  }, [side]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const at$ = (sec: number, fn: () => void) => timers.push(setTimeout(fn, sec * 1000))
    const tw = (duration: number) => ({ duration, ease: SMOOTH })
    // 0 · The envelope slides out of the slot and opens into a sheet.
    animate(open, 1, tw(0.8))
    stage.start({ x: at.x - start.x, y: at.y - start.y, scale: FOLD_SCALE, transition: tw(0.85) })
    // 1 · Crease lengthwise: the right half lifts over and lays back down,
    //     and the crease is there once it lands.
    at$(0.85, () => animate(lift, [1, 0.18, 1], tw(0.8)))
    at$(1.4, () => animate(creased, 1, tw(0.3)))
    // 2 · Top corners to the crease, left then right.
    at$(1.65, () => animate(cornerL, 1, tw(0.6)))
    at$(1.85, () => animate(cornerR, 1, tw(0.6)))
    // 3 · The new slanted edges to the crease.
    at$(2.5, () => animate(edgeL, 1, tw(0.6)))
    at$(2.7, () => animate(edgeR, 1, tw(0.6)))
    // 4 · Fold in half: the right half turns over onto the left.
    at$(3.35, () => animate(lift, -1, tw(0.7)))
    // 5 · Turn to the side (nose right) and fold each wing down.
    at$(4.05, () => {
      setSide(true)
      stage.start({ rotate: 90, transition: tw(0.75) })
    })
    at$(4.75, () => animate(psi, Math.PI, tw(0.7)))
    // 6 · Open the wings (and roll a little so they read), then let go.
    at$(5.5, () => {
      animate(psi, OPEN_PSI, tw(0.6))
      animate(roll, OPEN_ROLL, tw(0.6))
    })
    at$(6.12, () => onFolded(at))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fill = `url(#${uid}-paper)`
  const face = { fill, stroke: EDGE, strokeWidth: 0.45, strokeLinejoin: 'round' as const }
  const halfPaths = (p: string) => (
    <>
      <path ref={ref(p + 'baseFill')} fill={fill} stroke="none" />
      <path ref={ref(p + 'base')} fill="none" stroke={EDGE} strokeWidth={0.45} strokeLinejoin="round" />
    </>
  )
  const flapPaths = (p: string) => (
    <>
      <path ref={ref(p + 'cornerFull')} {...face} />
      <path ref={ref(p + 'cornerStatic')} {...face} />
      <path ref={ref(p + 'edge')} {...face} />
      <path ref={ref(p + 'cornerMove')} {...face} />
    </>
  )
  return createPortal(
    <motion.svg
      aria-hidden="true"
      width={80} height={80} viewBox="-40 -40 80 80"
      initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
      animate={stage}
      style={{
        position: 'fixed', left: start.x - 40, top: start.y - 40, zIndex: 9999, pointerEvents: 'none',
        overflow: 'visible', color: 'var(--text-dark)', willChange: 'transform', filter: PAPER_SHADOW,
      }}
    >
      <defs><PaperPattern id={`${uid}-paper`} pxPerUnit={FOLD_SCALE} /></defs>
      {!side ? (
        <>
          {halfPaths('L')}
          {halfPaths('R')}
          {/* Seam cover: one sheet until the crease is made. */}
          <path ref={ref('seam')} stroke="#fffdf9" strokeWidth={0.9} />
          {flapPaths('L')}
          {flapPaths('R')}
          <path ref={ref('RtopFill')} fill={fill} stroke="none" />
          <path ref={ref('Rtop')} fill="none" stroke={EDGE} strokeWidth={0.45} strokeLinejoin="round" />
          {/* The icon's own outline, handing over to paper as the sheet fills in. */}
          <path ref={ref('glyph')} d="M -10 -7 L 10 -7 L 10 7 L -10 7 Z M -10 -7 L 0 0.5 L 10 -7" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path ref={ref('far')} {...face} />
          <path ref={ref('keel')} {...face} />
          <path ref={ref('near')} {...face} />
          <path ref={ref('nearFlap')} {...face} />
          <path ref={ref('hingeCover')} stroke="#fffdf9" strokeWidth={0.9} />
        </>
      )}
    </motion.svg>,
    document.body,
  )
}

/** Point-mass glider, integrated at 240 Hz and written straight to the DOM.
 *  dv/dt = −D − g·sinγ; the path angle γ follows (L − g·cosγ)/v through a
 *  little pitch inertia, which damps the phugoid to a couple of gentle waves.
 *  Turbulence nudges it; now and then it banks into a turn and reverses. */
function PaperFlight({ from, launch, onDone }: { from: Pt; launch: Throw; onDone: () => void }) {
  const uid = useId().replace(/:/g, '')
  const el = useRef<HTMLDivElement>(null)
  const sprite = useRef<SVGSVGElement>(null)
  useEffect(() => {
    // Every throw is different: speed, trim, glide ratio, the air's
    // character, and whether / when it banks into turns.
    const r = (a: number, b: number) => a + Math.random() * (b - a)
    const G = 240, V_TRIM = launch.vTrim, LD = r(3, 4.5)
    const kL = G / (V_TRIM * V_TRIM), kD = kL / LD
    let x = from.x, y = from.y
    let v = launch.v0, gamma = 0, gdot = 0 // released level
    let dir = 1, bank = 0, turning = 0 // bank: 0 → π over a turn
    const seed = Math.random() * 100
    const gustAmp = r(0.1, 0.3), gustRate = r(0.7, 1.4)
    const turnCount = Math.floor(r(0, 3)) // 0, 1 or 2
    const turns = [r(1.4, 3.2), r(4.2, 7.5)].slice(0, turnCount)
    const turnSecs = r(0.9, 1.3)
    let t = 0, last = performance.now(), raf = 0, fade = 1, leaving = false
    const vw = window.innerWidth, vh = window.innerHeight
    const frame = (now: number) => {
      let dt = Math.min(0.05, (now - last) / 1000)
      const frameDt = dt
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
        const tg = t * gustRate
        const gust = Math.min(1, t / 0.8) * gustAmp * (Math.sin(tg * 1.7 + seed) + 0.6 * Math.sin(tg * 3.1 + seed * 2) + 0.3 * Math.sin(tg * 5.3 + seed * 3))
        // In the hand (release), speed and attitude are held.
        if (t >= RELEASE_S) {
          v = Math.max(45, v + (-drag - G * Math.sin(gamma)) * h)
          const cmd = (lift - G * Math.cos(gamma)) / v + gust
          gdot += (cmd - gdot) * h * 8 // pitch inertia
          gamma += gdot * h
        }
        const facing = turning ? dir * Math.cos(bank) : dir
        const k = t < RELEASE_S ? (t / RELEASE_S) * (t / RELEASE_S) * (3 - 2 * (t / RELEASE_S)) : 1
        x += facing * v * Math.cos(gamma) * h * k
        y -= v * Math.sin(gamma) * h * k
      }
      // Paper doesn't vanish mid-air: it fades only after leaving the window.
      if (x < -90 || x > vw + 90 || y > vh + 90 || y < -160 || t > 30) leaving = true
      if (leaving) fade = Math.max(0, fade - frameDt * 2.5)
      // Banking through a turn, the plane passes edge-on (scaleX through 0).
      const sx = turning ? dir * Math.cos(bank) : dir
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
  const face = { fill: `url(#${uid}-paper)`, stroke: EDGE, strokeWidth: 0.45, strokeLinejoin: 'round' as const }
  return createPortal(
    <div ref={el} aria-hidden="true" style={{ position: 'fixed', left: 0, top: 0, zIndex: 9999, pointerEvents: 'none', willChange: 'transform', transform: `translate3d(${from.x}px, ${from.y}px, 0)` }}>
      <svg
        ref={sprite}
        width={80} height={80} viewBox="-40 -40 80 80"
        style={{ position: 'absolute', left: -40, top: -40, overflow: 'visible', willChange: 'transform', filter: PAPER_SHADOW }}
      >
        {/* The fold's last frame exactly: same faces, same turn and scale. */}
        <g transform={`rotate(90) scale(${FOLD_SCALE})`}>
          <defs><PaperPattern id={`${uid}-paper`} pxPerUnit={FOLD_SCALE} /></defs>
          <path d={FLY_FACES.far} {...face} />
          <path d={FLY_FACES.keel} {...face} />
          <path d={FLY_FACES.near} {...face} />
          <path d={FLY_FACES.nearFlap} {...face} />
        </g>
      </svg>
    </div>,
    document.body,
  )
}

function PaperPlane({ from, onDone }: { from: DOMRect; onDone: () => void }) {
  // Released level from the fold's pose; thrown a little above trim speed so
  // it climbs gently on its own lift.
  const launch = useMemo<Throw>(() => {
    const vTrim = 105 + Math.random() * 30
    return { vTrim, v0: vTrim * (1.15 + Math.random() * 0.25) }
  }, [])
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
  // At most one plane folding or in the air.
  const [plane, setPlane] = useState<DOMRect | null>(null)
  const [slotEmpty, setSlotEmpty] = useState(false)
  const [noteAt, setNoteAt] = useState<{ x: number; y: number; below: boolean } | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const btn = useRef<HTMLButtonElement>(null)
  const canFly = useMemo(finePointer, [])
  const dwell = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => () => { if (dwell.current) clearTimeout(dwell.current) }, [])
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
    // One plane at a time: the next can't be folded until this one has gone.
    if (!canFly || reducedMotion || slotEmpty || copied || plane) return
    const glyph = btn.current?.querySelector('svg')
    if (!glyph) return
    const from = glyph.getBoundingClientRect()
    setPlane(from)
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
        // A short dwell: sweeping across the row shouldn't throw planes.
        onPointerEnter={e => {
          if (e.pointerType === 'touch') return
          if (dwell.current) clearTimeout(dwell.current)
          dwell.current = setTimeout(fly, DWELL_MS)
        }}
        onPointerLeave={() => { if (dwell.current) clearTimeout(dwell.current) }}
        onClick={async () => {
          // Couldn't copy: fall back to what an envelope usually means.
          if (!(await copyText(EMAIL))) { window.location.href = `mailto:${EMAIL}`; return }
          timers.current.forEach(clearTimeout)
          timers.current = []
          setSlotEmpty(false)
          // Off for a frame on a repeat click, so the note replays and the
          // status region re-announces.
          setCopied(false)
          const r = btn.current?.getBoundingClientRect()
          if (r) {
            // Phones: no room beside the last icon — under the row, right-aligned.
            const below = window.matchMedia(PHONE_QUERY).matches
            setNoteAt(below ? { x: r.right, y: r.bottom + 8, below } : { x: r.right + 8, y: r.top + r.height / 2, below })
          }
          requestAnimationFrame(() => setCopied(true))
          later(COPIED_MS, () => setCopied(false))
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'check' : 'mail'}
            {...swap}
            transition={ICON_SWAP}
            style={{ display: 'flex', width: 24, height: 24 }}
          >
            {copied ? <Check size={24} weight="regular" aria-hidden="true" /> : (
              // The paper takes over the glyph's outline in the same frame it
              // lifts off (no double outline), and a fresh envelope springs back.
              <motion.span
                animate={slotEmpty ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                transition={slotEmpty ? { duration: 0 } : ICON_SWAP}
                style={{ display: 'flex' }}
              >
                {icon}
              </motion.span>
            )}
          </motion.span>
        </AnimatePresence>
      </button>
      {plane && <PaperPlane from={plane} onDone={() => setPlane(null)} />}
      {/* Announced in place; drawn in the top layer beside the button, so it
          never shifts the row and a passing paper airplane can't cover it. */}
      <span role="status" className="sr-only">{copied ? 'Email address copied' : ''}</span>
      {noteAt && createPortal(
        <span aria-hidden="true" className="simple-copied-float" style={{ left: noteAt.x, top: noteAt.y }} data-below={noteAt.below || undefined}>
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
        </span>,
        document.body,
      )}
    </span>
  )
}
