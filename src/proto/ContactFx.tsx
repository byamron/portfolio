import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { animate, AnimatePresence, cancelFrame, frame, motion, useAnimationControls, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionStyle } from 'framer-motion'
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
// A pop-out develops only once the pointer has stayed this long (the glass
// pill answers at once) — sweeping along the row doesn't set them all off.
const DWELL_OPEN_MS = 220
// One pop-out at a time: opening one tells the others to close.
const EGG_OPEN = 'contact-egg-open'
const announceOpen = (id: string) => document.dispatchEvent(new CustomEvent(EGG_OPEN, { detail: id }))
function useOthersOpening(id: string, onOther: () => void) {
  const cb = useRef(onOther)
  cb.current = onOther
  useEffect(() => {
    const on = (e: Event) => { if ((e as CustomEvent<string>).detail !== id) cb.current() }
    document.addEventListener(EGG_OPEN, on)
    return () => document.removeEventListener(EGG_OPEN, on)
  }, [id])
}
/** Focus opens a pop-out only when it's keyboard focus — not the browser
 *  restoring focus to the last-clicked button when the window comes back
 *  (which can arrive as :focus-visible, so the window's own return is
 *  checked too). */
let windowFocusedAt = -Infinity
if (typeof window !== 'undefined') window.addEventListener('focus', () => { windowFocusedAt = performance.now() })
const keyboardFocus = (e: React.FocusEvent) =>
  performance.now() - windowFocusedAt > 120 && ((e.target as Element).matches?.(':focus-visible') ?? false)

const finePointer = () => typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches

/** Leaving the window (another app or macOS Space) never sends a
 *  pointerleave: run `onLeave` when the window blurs or is hidden. */
function useWindowLeave(onLeave: () => void, active: boolean) {
  const cb = useRef(onLeave)
  cb.current = onLeave
  useEffect(() => {
    if (!active) return
    const run = () => cb.current()
    const onVis = () => { if (document.hidden) run() }
    window.addEventListener('blur', run)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('blur', run)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [active])
}

/** Hover (after a short dwell) or keyboard focus → stage 1, stage 2 after
 *  LINGER_MS; leave, blur, Escape or another pop-out opening → 0 (WCAG
 *  1.4.13: dismissible). `viaPointer` tells callers whether a real hover
 *  (vs. keyboard focus) opened it. */
function useHoverStage() {
  const id = useId()
  const [stage, setStage] = useState<0 | 1 | 2>(0)
  const [viaPointer, setViaPointer] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)
  const dwell = useRef<ReturnType<typeof setTimeout>>(null)
  const enabled = useMemo(finePointer, [])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (dwell.current) clearTimeout(dwell.current) }, [])
  const open = (pointer: boolean) => {
    if (!enabled || stage) return
    setViaPointer(pointer)
    setStage(1)
    announceOpen(id)
    timer.current = setTimeout(() => setStage(2), LINGER_MS)
  }
  const close = () => {
    if (timer.current) clearTimeout(timer.current)
    if (dwell.current) clearTimeout(dwell.current)
    setStage(0)
  }
  useOthersOpening(id, close)
  // Opened by hover, focus may be anywhere: Escape dismisses from the page.
  useEffect(() => {
    if (!stage) return
    // Capture phase + preventDefault: Escape closes only this top layer, not
    // an open settings rail underneath as well.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      e.preventDefault()
      if (timer.current) clearTimeout(timer.current)
      setStage(0)
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [stage])
  useWindowLeave(close, stage > 0)
  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') return
      if (dwell.current) clearTimeout(dwell.current)
      dwell.current = setTimeout(() => open(true), DWELL_OPEN_MS)
    },
    onPointerLeave: close,
    onFocus: (e: React.FocusEvent) => { if (keyboardFocus(e)) open(false) },
    onBlur: close,
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
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, width,
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
const pickGreeting = (...not: (string | null)[]) => {
  const pool = GREETINGS.filter(g => !not.includes(g))
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

function Terminal({ greeting, onRun, cleared }: {
  greeting: string
  onRun: () => 'launched' | 'flying' | 'standby'
  /** A held launch was cleared (the sky emptied while you waited). */
  cleared: boolean
}) {
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
        : r === 'flying' ? ['hold', 'waiting for air traffic control']
        : ['ready', 'blimp on standby'])
    }, 180)
    return () => clearTimeout(t)
  }, [typedRun, onRun, reducedMotion])
  useEffect(() => {
    if (cleared) setResult(r => (r?.[0] === 'hold' ? ['done', 'cleared · blimp launched'] : r))
  }, [cleared])
  const holding = result?.[0] === 'hold' && !reducedMotion
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
            {/* Holding: the caret stays on the line — still running, not frozen. */}
            {holding && <> <span className="term-caret" /></>}
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
  // Mono: ~0.6em per character; longer hellos step down to fit the cloth.
  const bannerSize = greeting.length <= 5 ? 18 : greeting.length <= 8 ? 15 : 13.5
  // Capitals centred on the cloth at every size (Plex Mono caps ≈ 0.7em).
  const bannerY = 48.7 + 0.35 * bannerSize
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
        fontSize={bannerSize} fill="#2b2620"
        // Rides the cloth, not across it: the banner's centre moves ~0.7 units
        // between its two ripple shapes (cubic midpoints of BANNER_A/B).
        initial={{ y: bannerY }} animate={{ y: [bannerY, bannerY + 0.65, bannerY] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
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
  // A new hello for each visit to the terminal; the blimp in the air keeps
  // the one it launched with, and the next never repeats it.
  const [greeting, setGreeting] = useState(() => pickGreeting())
  const [flightGreeting, setFlightGreeting] = useState<string | null>(null)
  const greetingRef = useRef(greeting)
  greetingRef.current = greeting
  const flightGreetingRef = useRef(flightGreeting)
  flightGreetingRef.current = flightGreeting
  const lastStage = useRef(0)
  useEffect(() => {
    if (lastStage.current === 0 && stage > 0) setGreeting(g => pickGreeting(g, flightGreetingRef.current))
    lastStage.current = stage
  }, [stage])
  // One blimp at a time. A run while one is up is held for air traffic
  // control, and cleared to launch when that one lands — if you're still here.
  const [flightId, setFlightId] = useState(0)
  const queuedRef = useRef(false)
  const stageRef = useRef(stage)
  stageRef.current = stage
  const [cleared, setCleared] = useState(false)
  useEffect(() => { if (stage === 0) { queuedRef.current = false; setCleared(false) } }, [stage])
  const takeOff = useCallback(() => {
    flyingRef.current = true
    setFlightGreeting(greetingRef.current)
    setFlightId(n => n + 1)
    setFlying(true)
  }, [])
  const launch = useCallback((): 'launched' | 'flying' | 'standby' => {
    if (!pointerRef.current) return 'standby'
    if (flyingRef.current) { queuedRef.current = true; return 'flying' }
    takeOff()
    return 'launched'
  }, [takeOff])
  const landed = useCallback(() => {
    flyingRef.current = false
    setFlying(false)
    if (queuedRef.current && stageRef.current > 0 && pointerRef.current) {
      queuedRef.current = false
      setCleared(true)
      takeOff()
    }
  }, [takeOff])
  return (
    <span style={{ position: 'relative', display: 'flex' }} {...handlers}>
      <a data-social className="simple-social" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
      <IconPopover show={stage > 0} width={300}>
        {stage > 0 && <Terminal greeting={greeting} onRun={launch} cleared={cleared} />}
      </IconPopover>
      {flying && flightGreeting && <BlimpFlight key={flightId} greeting={flightGreeting} onDone={landed} />}
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
const CARD_TILT = 4 // degrees at most, toward the pointer

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

/** The Consensus mark, inline (it ships with the code: an <img> request
 *  could fail or arrive late when the card mounts). */
function ConsensusMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M9.79869 15.2C10.824 14.8285 11.9988 14.8417 12.9976 15.2322L13.5972 15.4667C14.4812 15.8124 15.1111 16.4066 15.5467 17.0954C15.711 16.7986 15.9009 16.5146 16.1154 16.2471C16.9596 15.1941 18.1341 14.4565 19.4492 14.1533C20.7643 13.8502 22.1432 13.9993 23.3631 14.5765C23.6695 14.7215 23.9614 14.8914 24.2362 15.0836C25.5939 16.0334 27.3756 16.7378 28.86 16.0017C30.3443 15.2656 30.9749 13.4309 29.8945 12.1748C28.806 10.9093 27.4581 9.87632 25.9293 9.15299C23.4895 7.99854 20.7317 7.70037 18.1015 8.30664C15.4713 8.91292 13.1223 10.3882 11.434 12.4942C10.7675 13.3257 10.2193 14.2363 9.79869 15.2Z" fill="#3BCDAA" />
      <path d="M30.5442 26.8816C31.5106 25.5358 30.7219 23.7634 29.1789 23.16L28.5793 22.9255C27.3673 22.4516 26.0249 23.1012 25.1233 24.0395C24.5773 24.6077 23.9249 25.0628 23.2031 25.3787C22.4813 25.6947 21.7043 25.8654 20.9165 25.8812C20.1288 25.8969 19.3457 25.7573 18.6118 25.4704C17.878 25.1834 17.2079 24.7547 16.6397 24.2088C16.0716 23.6629 15.6165 23.0104 15.3005 22.2886C14.9845 21.5668 14.8138 20.7898 14.7981 20.0021C14.7721 18.701 14.2264 17.3132 13.0145 16.8393L12.4149 16.6048C10.8718 16.0014 9.09002 16.7687 8.88716 18.4131C8.8174 18.9786 8.78785 19.5496 8.79926 20.1218C8.8307 21.6974 9.17216 23.2513 9.80415 24.6949C9.89379 24.8996 9.98903 25.1016 10.0897 25.3006L8.8784 29.9821C8.56987 31.1746 9.66787 32.2538 10.8548 31.9248L15.4832 30.6418C15.7911 30.7938 16.1059 30.9329 16.4268 31.0583C17.8944 31.6322 19.4607 31.9114 21.0363 31.88C22.6118 31.8486 24.1657 31.5071 25.6093 30.8751C27.0529 30.2431 28.3579 29.333 29.4497 28.1967C29.8463 27.784 30.2119 27.3444 30.5442 26.8816Z" fill="#068EF1" />
    </svg>
  )
}

export function LinkedInLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const { stage, handlers } = useHoverStage()
  const reducedMotion = useReducedMotion()
  const { cardCase } = useProtoSettings()
  const [turns, setTurns] = useState(0)
  // A very slight tilt toward the pointer (soft spring), for character.
  const tiltEl = useRef<HTMLDivElement>(null)
  const tiltX = useSpring(0, { stiffness: 90, damping: 20 })
  const tiltY = useSpring(0, { stiffness: 90, damping: 20 })
  useEffect(() => {
    if (!stage || reducedMotion) { tiltX.set(0); tiltY.set(0); return }
    const onMove = (e: PointerEvent) => {
      const r = tiltEl.current?.getBoundingClientRect()
      if (!r) return
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 180))
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 180))
      tiltY.set(nx * CARD_TILT)
      tiltX.set(-ny * CARD_TILT)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [stage > 0, reducedMotion]) // eslint-disable-line react-hooks/exhaustive-deps
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
          {/* A gentle drift — held, not pinned — with a faint 3D sway (out
              of step, so it never repeats exactly) and the pointer tilt on
              top. */}
          <motion.div
            animate={reducedMotion ? {} : { y: [0, -2, 0], rotateZ: [-0.4, 0.35, -0.4], rotateX: [1.2, -1.2, 1.2], rotateY: [-1.6, 1.6, -1.6] }}
            transition={{
              duration: 7, repeat: Infinity, ease: 'easeInOut',
              rotateX: { duration: 8.3, repeat: Infinity, ease: 'easeInOut' },
              rotateY: { duration: 9.7, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
          <motion.div ref={tiltEl} style={{ rotateX: tiltX, rotateY: tiltY }}>
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
                  <div className="biz-logo-cell"><ConsensusMark /></div>
                </div>
              </div>
              <div className="biz-face biz-back">
                <CardStock />
                <div className="biz-grid biz-grid-back">
                  <div className="biz-logo-cell"><ConsensusMark /></div>
                  <div className="biz-row">consensus.app</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          </motion.div>
        </div>
      </IconPopover>
    </span>
  )
}


// ─────────────────────────────────────────────────────────────────────────
// Email. Hover: a note to Ben types itself out under the button. Click:
// copies the address; the note lands on a sheet of paper, the sheet folds
// into a plane (the message inside) and is thrown — and "Email address
// copied" is revealed in its wake.
// ─────────────────────────────────────────────────────────────────────────

const EMAIL = protoBySlug.get('email')!.href.replace(/^mailto:/, '')
const COPIED_MS = 1800
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

// The note (Ben's prod email preview, tongue in cheek), set like the terminal.
// Each one someone reads or sends this session, the next is more excited —
// the same note, the tone climbing until it's just LET'S CHAT.
// Each ends in a P.S. that hints at the click (and the plane). The sheet
// is sized to the longest line across all of them.
const NOTE_PS = [
  'p.s. click to copy address',
  'p.s. click to copy address',
  'p.s. click to copy address!',
  'p.s. CLICK to copy address',
  'p.s. CLICK TO COPY ADDRESS',
  'p.s. CLICK!! TO!! COPY!!',
]
const NOTES = ([
  "Hi Ben,\n\nI love your portfolio and\nyou seem cool.\nLet's chat!\n\nBest,\n[Your name]",
  "Hi Ben!\n\nI really love your\nportfolio, and you seem\nreally cool.\nLet's chat!!\n\nBest,\n[Your name]",
  "Hi Ben!!\n\nI LOVE your portfolio.\nYou seem SO cool.\nWe should totally chat!!\n\nBest!!\n[Your name]",
  "BEN!!\n\nYour portfolio is SO\ngood and you seem SO\ncool. LET'S CHAT!!!\n\nBest!!!\n[Your name]",
  "BEN!!!!\n\nLOVE THE PORTFOLIO!!!\nYOU SEEM SO COOL!!!\nLET'S CHAT!!! LET'S CHAT!!\n\n[YOUR NAME]!!!",
  "BEN!!!!!!!!\n\nLET'S CHAT LET'S CHAT\nLET'S CHAT LET'S CHAT\nLET'S CHAT LET'S CHAT!!!\n\n[YOUR NAME]",
]).map((body, i) => `${body}\n\n${NOTE_PS[i]}`)
const NOTE_MAX_CHARS = Math.max(...NOTES.flatMap(n => n.split('\n').map(l => l.length)))
// How each note types: faster, fewer pauses, and — once composure goes —
// typos, noticed and backspaced.
const NOTE_TEMPO = [
  { speed: 1, beat: 3.5, typo: 0 },
  { speed: 1.2, beat: 3, typo: 0 },
  { speed: 1.45, beat: 2.5, typo: 0 },
  { speed: 1.75, beat: 2, typo: 0.04 },
  { speed: 2.1, beat: 1.6, typo: 0.07 },
  { speed: 2.6, beat: 1.25, typo: 0.1 },
]
// While the last note is still folding / flying: the system's voice, not the note's.
const HELD_NOTE = 'One at a time \u2014 the last\none is still in the air.'
// For this page load only (Ben): a reload starts calm again. Module scope so
// it survives the button remounting (route changes) within the visit.
let noteLevel = 0
const LETTER_PX = 11
const LETTER_LH = 16 // matches .email-letter (8-grid)
const LETTER_FONT = "'IBM Plex Mono', ui-monospace, monospace"
const INK = '#2b2620'

// The sheet the note lands on: a portrait sheet (34 × 44 sheet units), the
// note inset like a letter — text at the top, the rest of the page blank.
// Sized to the notes: the longest line (mono, 0.6em a character) plus margins.
const PAD_X = 16
const PAD_TOP = 16
const PAPER_W = Math.round(NOTE_MAX_CHARS * 0.6 * LETTER_PX + 2 * PAD_X)
const PAPER_K = PAPER_W / 34 // px per sheet unit at note size
const PAPER_H = 44 * PAPER_K
// The note sits so its sheet starts 8px below the button.
const LETTER_GAP = 8 + PAD_TOP

/** Baseline of note line `i` on the sheet (px from its top), matching the
 *  DOM note's CSS line boxes (half-leading around the font's ascent+descent),
 *  so the text doesn't shift when the paper takes it over. */
let letterMetrics: { asc: number; desc: number } | null = null
function letterBaseline(i: number) {
  if (!letterMetrics) {
    const font = `400 ${LETTER_PX}px ${LETTER_FONT}`
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.font = font
    const m = ctx.measureText('Hg')
    const metrics = { asc: m.fontBoundingBoxAscent || LETTER_PX * 1.025, desc: m.fontBoundingBoxDescent || LETTER_PX * 0.275 }
    // Only cache once the real face is in (the fallback's metrics differ).
    if (document.fonts?.check(font)) letterMetrics = metrics
    return PAD_TOP + i * LETTER_LH + (LETTER_LH - metrics.asc - metrics.desc) / 2 + metrics.asc
  }
  const { asc, desc } = letterMetrics
  return PAD_TOP + i * LETTER_LH + (LETTER_LH - asc - desc) / 2 + asc
}

/** Types a note out, a keystroke at a time with a little human unevenness
 *  and a beat at line ends and punctuation. With `typo` > 0, now and then a
 *  wrong key goes in, is noticed, and is backspaced. */
const NEAR_KEYS = 'asdfghjklqwertyuiopzxcvbnm'
function TypedLetter({ text, cps, beat = 3.5, typo = 0, complete, caret }: {
  text: string; cps: number; beat?: number; typo?: number; complete: boolean; caret: boolean
}) {
  // The keystrokes (null = backspace), drawn once per note.
  const keys = useMemo(() => {
    const out: (string | null)[] = []
    for (const ch of text) {
      if (typo && /[a-z]/i.test(ch) && Math.random() < typo) {
        const wrong = NEAR_KEYS[Math.floor(Math.random() * NEAR_KEYS.length)]!
        out.push(ch === ch.toUpperCase() ? wrong.toUpperCase() : wrong, null)
      }
      out.push(ch)
    }
    return out
  }, [text, typo])
  const [n, setN] = useState(complete ? keys.length : 0)
  useEffect(() => { if (complete) setN(keys.length) }, [complete, keys.length])
  useEffect(() => {
    if (n >= keys.length) return
    const prev = keys[n - 1], next = keys[n]
    const pause = next === null ? 2.2 // noticing the typo
      : prev === null ? 0.6 // the backspace was quick
      : prev === '\n' || prev === ',' || prev === '.' || prev === '!' ? beat : 1
    const t = setTimeout(() => setN(v => v + 1), (1000 / cps) * (0.6 + Math.random() * 0.8) * pause)
    return () => clearTimeout(t)
  }, [n, cps, beat, keys])
  let shown = ''
  for (let i = 0; i < n; i++) { const k = keys[i]; shown = k === null ? shown.slice(0, -1) : shown + k }
  return <>{shown}{caret && <span className="term-caret" />}</>
}

/** Keeps a floating element mounted while shown and for its 160ms CSS
 *  fade-out, then unmounts it. (Not AnimatePresence: a note keeps typing
 *  through its exit, and that re-rendering could leave an invisible exited
 *  copy behind.) */
function useFadeMount(pos: Pt | null, key: number) {
  const [mount, setMount] = useState<{ pos: Pt; key: number } | null>(null)
  useEffect(() => {
    if (pos) { setMount({ pos, key }); return }
    const t = setTimeout(() => setMount(null), 200)
    return () => clearTimeout(t)
  }, [pos?.x, pos?.y, key]) // eslint-disable-line react-hooks/exhaustive-deps
  return mount
}

// ── Paper airplane: a real dart fold, then a physical glide ─────────────
//
// Fold (classic dart), drawn top-down on a portrait sheet, nose up, in sheet
// units (x ±17, y ±22; crease at x = 0). Every fold turns a flap about its
// hinge; drawn top-down, that's the flap's own region under an affine map
// (1−c)·I + c·reflection, so the printed side shows (foreshortened) until
// the flap passes edge-on and its blank back shows after:
//   1. crease lengthwise                     2. top corners to the crease
//   3. new slanted edges to the crease       4. fold in half along the crease
//   5. turn to the side, lift into the hand; each wing down to the crease
//   6. open the wings → throw
// Then a point-mass glider (lift ∝ v², drag ∝ v², gravity) takes over — the
// phugoid it produces is the swoop-climb-stall-dip of a real paper plane.

// The plane's paper edges (side view only — the flat folds read by light).
const EDGE = 'rgba(40,30,20,0.2)'
// Paper's shade when it turns from the light.
const SHADE = 'rgb(62,46,30)'

// Paper as a pattern fill, not a filter: rasterised once into a tile, so
// animating the paper never re-runs a filter (that was the jank). Fine,
// quiet grain; a faint, slow mottle; a few soft fibres — paper, not noise.
const TILE = 256
let paperTile: string | null = null
function paperTexture() {
  if (paperTile) return paperTile
  const c = document.createElement('canvas')
  c.width = c.height = TILE
  const g = c.getContext('2d')!
  const img = g.createImageData(TILE, TILE)
  // Slow mottle: smooth value noise on a tileable 8×8 lattice.
  const N = 8, lattice = Array.from({ length: N * N }, () => Math.random())
  const at = (x: number, y: number) => lattice[((y % N) + N) % N * N + ((x % N) + N) % N]!
  const smooth = (t: number) => t * t * (3 - 2 * t)
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const fx = (x / TILE) * N, fy = (y / TILE) * N
      const ix = Math.floor(fx), iy = Math.floor(fy), tx = smooth(fx - ix), ty = smooth(fy - iy)
      const m = (at(ix, iy) * (1 - tx) + at(ix + 1, iy) * tx) * (1 - ty) + (at(ix, iy + 1) * (1 - tx) + at(ix + 1, iy + 1) * tx) * ty
      const d = Math.random() * 6 + (m - 0.5) * 7
      const i = (y * TILE + x) * 4
      img.data[i] = 253 - d
      img.data[i + 1] = 251 - d * 1.05
      img.data[i + 2] = 246 - d * 1.15
      img.data[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  // Fibres: short, soft, slightly curved.
  g.lineCap = 'round'
  for (let k = 0; k < 46; k++) {
    const x = Math.random() * TILE, y = Math.random() * TILE, len = 6 + Math.random() * 16, ang = Math.random() * Math.PI
    g.strokeStyle = `rgba(120,95,70,${0.04 + Math.random() * 0.05})`
    g.lineWidth = 0.4 + Math.random() * 0.5
    g.beginPath()
    g.moveTo(x, y)
    g.quadraticCurveTo(x + Math.cos(ang + 0.5) * len * 0.5, y + Math.sin(ang + 0.5) * len * 0.5, x + Math.cos(ang) * len, y + Math.sin(ang) * len)
    g.stroke()
  }
  return (paperTile = c.toDataURL())
}
/** <pattern> sized so one tile pixel ≈ one screen pixel at `pxPerUnit`. */
function PaperPattern({ id, pxPerUnit }: { id: string; pxPerUnit: number }) {
  const w = TILE / pxPerUnit
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={w} height={w}>
      <image href={paperTexture()} width={w} height={w} />
    </pattern>
  )
}
/** The printed side: paper grain with the note set on it, in sheet units. */
function LetterPattern({ id, grainId, inked, lines }: { id: string; grainId: string; inked: boolean; lines: string[] }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" x={-17} y={-22} width={34} height={44}>
      <rect width={34} height={44} fill={`url(#${grainId})`} />
      {/* Off until the typed note hands over (same frame), so the two never double up. */}
      <text fontFamily={LETTER_FONT} fontWeight={400} fontSize={LETTER_PX / PAPER_K} fill={INK} opacity={inked ? 1 : 0}>
        {lines.map((line, i) => (
          <tspan key={i} x={PAD_X / PAPER_K} y={letterBaseline(i) / PAPER_K}>{line}</tspan>
        ))}
      </text>
    </pattern>
  )
}

// ── Paper geometry ──────────────────────────────────────────────────────
// Sheet units: portrait sheet, nose up, x ±17, y ±22, crease at x = 0. We
// model the LEFT half; the right half is its mirror, turned about the crease.

type P2 = [number, number]
type M6 = [number, number, number, number, number, number] // SVG matrix(a b c d e f)
const pathOf = (pts: P2[]) => 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ') + ' Z'
const IDENTITY: M6 = [1, 0, 0, 1, 0, 0]
const matrixOf = (m: M6) => `matrix(${m.map(v => v.toFixed(4)).join(' ')})`
const mirrorP = (p: P2): P2 => [-p[0], p[1]]
/** The same map seen in the mirrored half (Mx · M · Mx). */
const mirrorM = (m: M6): M6 => [m[0], -m[1], -m[2], m[3], -m[4], m[5]]
/** Top-down view of a flap turned by `c` (0 flat → 1 folded flat) about the
 *  hinge a–b: (1−c)·I + c·(reflection across the hinge). det = 1 − 2c, so
 *  the front shows below c = ½ and the back above. */
function foldMatrix(a: P2, b: P2, c: number): M6 {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1])
  const ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l
  const k = 1 - 2 * c
  const l00 = k + 2 * c * ux * ux, l01 = 2 * c * ux * uy, l11 = k + 2 * c * uy * uy
  return [l00, l01, l01, l11, a[0] - (l00 * a[0] + l01 * a[1]), a[1] - (l01 * a[0] + l11 * a[1])]
}

/** The polygon with its hinge-side vertices pushed `eps` across the hinge
 *  a–b, so adjoining faces overlap a hair instead of leaving an
 *  antialiased seam (the paper is one piece there). */
function acrossHinge(poly: P2[], a: P2, b: P2, eps: number): P2[] {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1])
  let nx = -(b[1] - a[1]) / l, ny = (b[0] - a[0]) / l
  const cx = poly.reduce((t, p) => t + p[0], 0) / poly.length, cy = poly.reduce((t, p) => t + p[1], 0) / poly.length
  if ((cx - a[0]) * nx + (cy - a[1]) * ny > 0) { nx = -nx; ny = -ny } // away from the polygon
  return poly.map(p => (Math.abs((p[0] - a[0]) * nx + (p[1] - a[1]) * ny) < 1e-6 ? [p[0] + nx * eps, p[1] + ny * eps] as P2 : p))
}
/** How dark paper reads when turned θ from lying flat in the light. */
const shadeOf = (theta: number) => 0.17 * Math.pow(Math.abs(Math.sin(theta)), 1.4)

const NOSE: P2 = [0, -22]
const FULL_SHEET: P2[] = [[-17, -22], [17, -22], [17, 22], [-17, 22]]
const SHEET: P2[] = [[0, -22], [-17, -22], [-17, 22], [0, 22]] // left half
// Step 2 · corner to crease: hinge NOSE–(-17,-5); (-17,-22) → (0,-5).
const HINGE_2: P2 = [-17, -5]
const CORNER: P2[] = [NOSE, [-17, -22], [-17, -5]]
const BASE_2: P2[] = [[0, -22], [-17, -5], [-17, 22], [0, 22]]
// Step 3 · slanted edge to crease: hinge NOSE–(-17,19) (the 112.5° bisector);
// (-17,-5) → (0, 2.04). It cuts the folded corner at (-7.05,-5): the part
// beyond the hinge rides along with the fold, the rest stays put.
const HINGE_3: P2 = [-17, 19]
const EDGE_FLAP: P2[] = [NOSE, [-17, -5], [-17, 19]]
const BASE_3: P2[] = [[0, -22], [-17, 19], [-17, 22], [0, 22]]
const H3_AT_Y5: P2 = [-7.05, -5]
const CORNER_STATIC: P2[] = [NOSE, [0, -5], H3_AT_Y5] // folded corner, crease side of hinge 3
const CORNER_MOVE: P2[] = [NOSE, H3_AT_Y5, [-17, -5]] // folded corner, riding the edge flap
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
/** The open plane's true extent (sheet units, before its turn to nose-right):
 *  the wings' trailing corners swing out past the sheet's own length, so
 *  placing it by half its length would let a wingtip overlap the button. */
const FLY_BOUNDS = (() => {
  const pts = [
    ...WING.map(p => wingPoint(p, OPEN_PSI, OPEN_ROLL, -1)),
    ...WING.map(p => wingPoint(p, OPEN_PSI, OPEN_ROLL, 1)),
    ...KEEL.map(p => keelPoint(p, OPEN_ROLL)),
  ]
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  // Turned nose-right (rotate 90°): screen x = −y, screen y = x.
  return { tail: Math.max(...ys), top: Math.min(...xs), bottom: Math.max(...xs) }
})()

const PAPER_SHADOW = 'drop-shadow(0 2px 3px rgba(0,0,0,0.16))'
// Hairline paper edges, the same on screen at every scale and fold.

type Pt = { x: number; y: number }
// After the wind-up the hand only follows through briefly before letting go.
const RELEASE_S = 0.1
// Launch speed, trim speed (px/s), and the nose-up angle it leaves the hand at.
interface Throw { v0: number; vTrim: number; gamma0?: number }

const SMOOTH = [0.37, 0, 0.63, 1] as const // sine in-out
// The sheet materialises under the note (it resolves out of a soft blur as
// it fades in), and only then takes the words over — never mid-fade.
const PAPER_IN_S = 0.6
// The fold's own timeline, in seconds at pace 1 (first crease → wings open).
const FOLD_STEPS_S = 6.1
// The throw, at its own (unscaled) tempo: draw back and tip the nose up,
// a beat, let go.
const WIND_UP_S = 0.3
const WIND_UP_HOLD_S = 0.1
const WIND_UP_PX = 4 // mostly the nose tipping up; the tail stays clear of the button
const WIND_UP_DEG = 7
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

// Side-view shading, shared by the fold's last steps and the flying sprite
// so the hand-off is exact: the far wing sits in the plane's own shade; the
// near wing darkens as it turns edge-on.
const farShade = 0.1
const nearShade = (psi: number) => 0.04 + 0.12 * Math.abs(Math.cos(psi))
const sideStroke = { stroke: EDGE, strokeWidth: 0.5, strokeLinejoin: 'round' as const, vectorEffect: 'non-scaling-stroke' as const }
// Paper has no lines: a folded edge reads only by the flap's own shading
// and the contact shadow it casts; a pressed-and-reopened crease is a tonal
// valley in the paper (a shade on one side of the fold, light catching the
// other), painted into the sheet between its base and the flaps.
const VALLEY_HALF = 0.45 // sheet units each side of the centre crease (~3px)
const SEAM = 0.12 // sheet units each face reaches across its hinge (no seams)

/** The note's sheet: fades in under the typed note, folds (a parameter per
 *  step, every face derived from them each frame, so the paper stays one
 *  continuous sheet), then is lifted into the throwing hand at `launch`.
 *  Folds read by light, not outlines: a flap darkens as it turns edge-on and
 *  casts a contact shadow that tightens as it's pressed flat; a crease (a
 *  soft valley and its lit shoulder) only forms as the fold lands. */
function LetterFold({ at, launch, kPlane, pace, lines, onPaperIn, onFolded }: {
  at: Pt; launch: Pt; kPlane: number; pace: number; lines: string[]; onPaperIn: () => void; onFolded: (at: Pt) => void
}) {
  const uid = useId().replace(/:/g, '')
  const stage = useAnimationControls()

  // Step parameters (0…1 unless noted).
  const split = useMotionValue(0) // 0: one flat sheet; 1: two halves about the crease
  const lift = useMotionValue(1) // right half's scaleX about the crease
  const creased = useMotionValue(0) // the centre crease, pressed in as the half lands
  const cornerL = useMotionValue(0), cornerR = useMotionValue(0)
  const edgeL = useMotionValue(0), edgeR = useMotionValue(0)
  const psi = useMotionValue(0) // wing angle (rad)
  const roll = useMotionValue(0)
  const [side, setSide] = useState(false)
  const [inked, setInked] = useState(false)
  const els = useRef<Record<string, SVGElement | null>>({})
  const ref = (k: string) => (el: SVGElement | null) => { els.current[k] = el }

  // A layout effect: when the fold turns to the side view, the new faces get
  // their paths before that frame paints (an effect would leave one frame
  // with no paper).
  useLayoutEffect(() => {
    const FRONT = `url(#${uid}-front)`, BACK = `url(#${uid}-back)`
    const hide = (k: string) => { const el = els.current[k]; if (el) el.style.display = 'none' }
    const put = (k: string, d: string, m: M6, opacity?: number) => {
      const el = els.current[k]
      if (!el) return
      el.style.display = ''
      el.setAttribute('d', d)
      el.setAttribute('transform', matrixOf(m))
      if (opacity !== undefined) el.style.opacity = String(opacity)
    }
    /** A face: paper fill, its shade (turning from the light), and — for a
     *  lifted flap — the shadow it casts, offset downward by its height. */
    const face = (k: string, poly: P2[] | null, m: M6 = IDENTITY, fill = BACK, shade = 0, lifted = -1) => {
      if (!poly) { hide(k); hide(k + 'Shade'); hide(k + 'Cast'); return }
      const d = pathOf(poly)
      put(k, d, m)
      const el = els.current[k]
      if (el && el.getAttribute('fill') !== fill) el.setAttribute('fill', fill)
      if (shade > 0.004) put(k + 'Shade', d, m, shade); else hide(k + 'Shade')
      if (lifted >= 0) {
        // Down only, so it reads the same in the mirrored half.
        const dy = 0.18 + 1.5 * lifted
        put(k + 'Cast', d, [m[0], m[1], m[2], m[3], m[4], m[5] + dy], 0.07 + 0.07 * lifted)
      } else hide(k + 'Cast')
    }
    const VALLEY = `M ${-VALLEY_HALF} -22 L ${VALLEY_HALF} -22 L ${VALLEY_HALF} 22 L ${-VALLEY_HALF} 22 Z`
    const FACES = ['base', 'cornerFlap', 'cornerStatic', 'edgeFlap', 'cornerMove']
    // One half's faces; the right half is drawn mirrored (and its group is
    // turned about the crease by `lift`, which also shades it).
    const half = (p: string, mirror: boolean, c: number, e: number, hidden: boolean, tilt: number, flat: boolean) => {
      if (hidden) { FACES.forEach(k => face(p + k, null)); return }
      const P = (pts: P2[]) => (mirror ? pts.map(mirrorP) : pts)
      const M = (m: M6) => (mirror ? mirrorM(m) : m)
      const tiltShade = shadeOf(tilt)
      const mix = (a: number) => 1 - (1 - a) * (1 - tiltShade)
      // While both halves lie flat side by side, the base reaches a hair
      // across the centre crease (no seam between them); once the other half
      // lifts, that sliver would show its printing, so it doesn't.
      const reach = flat ? SEAM : 0
      const base = (e > 0 ? BASE_3 : c > 0 ? BASE_2 : SHEET).map(q => (q[0] === 0 ? [reach, q[1]] as P2 : q))
      face(p + 'base', P(base), IDENTITY, FRONT, mix(0))
      if (e === 0) {
        const th = Math.PI * c
        face(p + 'cornerFlap', c > 0 ? P(acrossHinge(CORNER, NOSE, HINGE_2, SEAM)) : null, M(foldMatrix(NOSE, HINGE_2, c)), c < 0.5 ? FRONT : BACK, mix(shadeOf(th)), Math.sin(th))
        ;['cornerStatic', 'edgeFlap', 'cornerMove'].forEach(k => face(p + k, null))
      } else {
        const th = Math.PI * e
        const m3 = M(foldMatrix(NOSE, HINGE_3, e))
        face(p + 'cornerFlap', null)
        face(p + 'cornerStatic', P(CORNER_STATIC), IDENTITY, BACK, mix(0), 0)
        face(p + 'edgeFlap', P(acrossHinge(EDGE_FLAP, NOSE, HINGE_3, SEAM)), m3, e < 0.5 ? FRONT : BACK, mix(shadeOf(th)), Math.sin(th))
        // Rides on the edge flap's face; past edge-on it's underneath.
        face(p + 'cornerMove', e < 0.5 ? P(acrossHinge(CORNER_MOVE, NOSE, H3_AT_Y5, SEAM)) : null, m3, BACK, mix(shadeOf(th)))
      }
    }
    const render = () => {
      if (!side) {
        const whole = split.get() === 0
        const s = lift.get()
        // The right half's tilt off the table (s = cos θ).
        const tilt = Math.acos(Math.max(-1, Math.min(1, s)))
        face('whole', whole ? FULL_SHEET : null, IDENTITY, FRONT)
        els.current.rightBase?.setAttribute('transform', `scale(${s} 1)`)
        els.current.rightFlaps?.setAttribute('transform', `scale(${s} 1)`)
        const flat = s > 0.97
        half('L', false, cornerL.get(), edgeL.get(), whole, 0, flat)
        // The centre crease's valley, pressed in as the half lands; folded
        // over, it's the paper's edge (and underneath).
        const valley = whole || s < 0 ? 0 : creased.get()
        if (valley > 0.01) put('valley', VALLEY, IDENTITY, valley); else hide('valley')
        // Past edge-on, the right half shows its plain back, on top.
        half('R', true, cornerR.get(), edgeR.get(), whole || s < 0, tilt, flat)
        // Reaching a hair past the crease, over the left half's seam allowance.
        // (Its outline is whatever the right half is at this step — the whole
        // half on the first crease, the folded dart on the fold in half.)
        const rShape = edgeR.get() > 0 ? BASE_3 : cornerR.get() > 0 ? BASE_2 : SHEET
        face('Rback', !whole && s < 0 ? rShape.map(q => (q[0] === 0 ? [-SEAM, q[1]] as P2 : mirrorP(q))) : null, IDENTITY, BACK, shadeOf(tilt))
      } else {
        const f = sideFaces(psi.get(), roll.get())
        const setD = (k: string, d: string | null, opacity = 1) => {
          const el = els.current[k]
          if (!el) return
          if (d === null) { el.style.display = 'none'; return }
          el.style.display = ''
          el.setAttribute('d', d)
          el.style.opacity = String(opacity)
        }
        const near = nearShade(psi.get())
        setD('far', f.far); setD('farShade', f.far, farShade)
        setD('keel', f.keel)
        setD('near', f.near); setD('nearShade', f.near, near)
        // The wing's inner face (with the flap line) shows once it's past
        // edge-on (ψ > 90°) — the swap happens while it's a line, unseen.
        const inner = psi.get() > Math.PI / 2
        setD('nearFlap', inner ? f.nearFlap : null); setD('nearFlapShade', inner ? f.nearFlap : null, near)
        // The hinge only becomes a fold line once the wing starts to turn.
        setD('hingeCover', f.hinge, 1 - clamp01(psi.get() / 0.35))
      }
    }
    render()
    // Several values often move in the same frame: render once, in Framer's
    // own render step (same frame as the stage transform; deduped per frame).
    const schedule = () => frame.render(render)
    const unsub = [split, lift, creased, cornerL, cornerR, edgeL, edgeR, psi, roll].map(mv => mv.on('change', schedule))
    return () => { unsub.forEach(u => u()); cancelFrame(render) }
  }, [side]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const at$ = (sec: number, fn: () => void) => timers.push(setTimeout(fn, (PAPER_IN_S + 0.05 + sec * pace) * 1000))
    const tw = (duration: number) => ({ duration: duration * pace, ease: SMOOTH })
    // 0 · The sheet materialises under the note.
    stage.start({
      opacity: 1, scale: 1, filter: 'blur(0px)',
      transition: { duration: PAPER_IN_S, ease: [0.33, 0, 0.2, 1], filter: { duration: PAPER_IN_S * 0.85, ease: 'easeOut' } },
      transitionEnd: { filter: 'none' },
    })
    // Fully there: the typed note hands its words to the sheet in one render.
    timers.push(setTimeout(() => { setInked(true); onPaperIn() }, PAPER_IN_S * 1000 + 20))
    // 1 · Crease lengthwise: the right half folds all the way over onto the
    //     left, is pressed, and opens back out — the crease is made by the
    //     fold, then shows as the half lays back down.
    at$(0.25, () => { split.set(1); animate(lift, [1, -1, -1, 1], { ...tw(1.05), times: [0, 0.44, 0.56, 1] }) })
    at$(0.25 + 1.05 * 0.6, () => animate(creased, 1, tw(0.4)))
    // 2 · Top corners to the crease, left then right.
    at$(1.4, () => animate(cornerL, 1, tw(0.6)))
    at$(1.6, () => animate(cornerR, 1, tw(0.6)))
    // 3 · The new slanted edges to the crease.
    at$(2.25, () => animate(edgeL, 1, tw(0.6)))
    at$(2.45, () => animate(edgeR, 1, tw(0.6)))
    // 4 · Fold in half: the right half turns over onto the left.
    at$(3.1, () => animate(lift, -1, tw(0.7)))
    // 5 · Picked up and carried to the hand in one motion: turning onto its
    //     side, receding to a throwable size, across and up into place
    //     beside the button. One eased progress drives every property, so
    //     nothing reads as a separate beat; the path bows out to the right
    //     mid-way so the turning sheet never sweeps over the button.
    const dx = launch.x - at.x, dy = launch.y - at.y
    const CARRY = 1.3
    const BOW = 14 // px outward at the middle of the carry
    const shrink = (t: number) => 1 - Math.pow(1 - t, 3.5) // picked up: small, soon
    const out = (t: number) => 1 - Math.pow(1 - t, 2.2) // across, early
    const rise = (t: number) => { const u = Math.pow(t, 1.4); return u * u * (3 - 2 * u) } // up, building
    const k0 = 1, k1 = kPlane / PAPER_K
    at$(3.8, () => {
      setSide(true)
      // A spring, not a curve: it accelerates, carries a little past the
      // hand and settles back, like a hand bringing it into place. Past 1
      // the shapes extend linearly, so the overshoot reads as momentum.
      animate(0, 1, {
        type: 'spring', visualDuration: Math.max(0.7, CARRY * pace), bounce: 0.15,
        onUpdate: p => {
          const t = Math.min(1, Math.max(0, p)), over = p - t
          stage.set({
            rotate: 90 * p,
            scale: k0 + (k1 - k0) * shrink(t),
            x: dx * out(t) + BOW * Math.sin(Math.PI * t) + dx * over,
            y: dy * rise(t) + dy * over,
          })
        },
      })
    })
    at$(5.1, () => animate(psi, Math.PI, tw(0.5)))
    // 6 · Open the wings (and roll a little so they read)…
    at$(5.6, () => {
      animate(psi, OPEN_PSI, tw(0.5))
      animate(roll, OPEN_ROLL, tw(0.5))
    })
    // …draw back with the nose tipped up, a beat, and let go.
    at$(FOLD_STEPS_S, () => {
      stage.start({ x: dx - WIND_UP_PX, rotate: 90 - WIND_UP_DEG, transition: { duration: WIND_UP_S, ease: [0.45, 0, 0.55, 1] } })
      timers.push(setTimeout(() => onFolded({ x: launch.x - WIND_UP_PX, y: launch.y }), (WIND_UP_S + WIND_UP_HOLD_S) * 1000))
    })
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Draw order per face: cast shadow, paper, shade.
  const faceEls = (k: string) => (
    <>
      <path ref={ref(k + 'Cast')} fill={SHADE} style={{ display: 'none' }} />
      <path ref={ref(k)} style={{ display: 'none' }} />
      <path ref={ref(k + 'Shade')} fill={SHADE} style={{ display: 'none' }} />
    </>
  )
  // Bottom to top: both halves' bases, the centre crease's valley, then
  // each half's corner piece, the edge flap, and what rides on it.
  const flapEls = (p: string) => (
    <>
      {faceEls(p + 'cornerStatic')}
      {faceEls(p + 'cornerFlap')}
      {faceEls(p + 'edgeFlap')}
      {faceEls(p + 'cornerMove')}
    </>
  )
  const back = `url(#${uid}-back)`
  // The shadow sits on a wrapper that stays put, so it always falls straight
  // down instead of turning with the paper.
  return createPortal(
    <div aria-hidden="true" style={{ position: 'fixed', left: at.x - PAPER_W / 2, top: at.y - PAPER_H / 2, width: PAPER_W, height: PAPER_H, zIndex: 9999, pointerEvents: 'none', filter: PAPER_SHADOW }}>
      <motion.svg
        width={PAPER_W} height={PAPER_H} viewBox="-17 -22 34 44"
        initial={{ opacity: 0, scale: 0.985, x: 0, y: 0, rotate: 0, filter: 'blur(3px)' }}
        animate={stage}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', willChange: 'transform' }}
      >
        <defs>
          <PaperPattern id={`${uid}-back`} pxPerUnit={PAPER_K} />
          <LetterPattern id={`${uid}-front`} grainId={`${uid}-back`} inked={inked} lines={lines} />
          {/* The valley across the centre crease: shade falling into it on
              one side, light catching the far slope on the other. */}
          <linearGradient id={`${uid}-valley`} gradientUnits="userSpaceOnUse" x1={-VALLEY_HALF} y1={0} x2={VALLEY_HALF} y2={0}>
            <stop offset="0" stopColor={SHADE} stopOpacity={0} />
            <stop offset="0.42" stopColor={SHADE} stopOpacity={0.07} />
            <stop offset="0.5" stopColor={SHADE} stopOpacity={0.1} />
            <stop offset="0.6" stopColor="#ffffff" stopOpacity={0.28} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Keyed, so the side view never inherits a front-view node. */}
        {!side ? (
          <g key="front">
            {faceEls('whole')}
            {faceEls('Lbase')}
            {/* The right half's two layers share its turn about the crease. */}
            <g ref={ref('rightBase')}>{faceEls('Rbase')}</g>
            <path ref={ref('valley')} fill={`url(#${uid}-valley)`} style={{ display: 'none' }} />
            {flapEls('L')}
            <g ref={ref('rightFlaps')}>
              {flapEls('R')}
              {faceEls('Rback')}
            </g>
          </g>
        ) : (
          <g key="side">
            <path ref={ref('far')} fill={back} {...sideStroke} />
            <path ref={ref('farShade')} fill={SHADE} />
            <path ref={ref('keel')} fill={back} {...sideStroke} />
            <path ref={ref('near')} fill={back} {...sideStroke} />
            <path ref={ref('nearShade')} fill={SHADE} />
            <path ref={ref('nearFlap')} fill={back} {...sideStroke} />
            <path ref={ref('nearFlapShade')} fill={SHADE} />
            <path ref={ref('hingeCover')} stroke="#fffdf9" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </motion.svg>
    </div>,
    document.body,
  )
}

/** Point-mass glider, integrated at 240 Hz and written straight to the DOM.
 *  dv/dt = −D − g·sinγ; the path angle γ follows (L − g·cosγ)/v through a
 *  little pitch inertia, which damps the phugoid to a couple of gentle waves.
 *  Turbulence nudges it; now and then it banks into a turn and reverses.
 *  `onTail` reports the tail's x each frame (for the reveal behind it). */
function PaperFlight({ from, launch, scale, onTail, onDone }: {
  from: Pt; launch: Throw; scale: number; onTail?: (x: number) => void; onDone: () => void
}) {
  const uid = useId().replace(/:/g, '')
  const el = useRef<HTMLDivElement>(null)
  const sprite = useRef<SVGSVGElement>(null)
  useEffect(() => {
    // Every throw is different: speed, trim, glide ratio, the air's
    // character, and whether / when it banks into turns.
    const r = (a: number, b: number) => a + Math.random() * (b - a)
    // A clean glide ratio: it carries its speed (Ben: more momentum).
    const G = 240, V_TRIM = launch.vTrim, LD = r(4.5, 6)
    const kL = G / (V_TRIM * V_TRIM), kD = kL / LD
    const tailLen = FLY_BOUNDS.tail * scale
    let x = from.x, y = from.y
    let v = launch.v0, gamma = launch.gamma0 ?? 0, gdot = 0 // released nose-up, as wound up
    let dir = 1, bank = 0, turning = 0 // bank: 0 → π over a turn
    const seed = Math.random() * 100
    const gustAmp = r(0.1, 0.3), gustRate = r(0.7, 1.4)
    const turnCount = Math.floor(r(0, 3)) // 0, 1 or 2
    const turns = [r(1.6, 3.2), r(4.2, 7.5)].slice(0, turnCount)
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
          v = Math.max(60, v + (-drag - G * Math.sin(gamma)) * h)
          const cmd = (lift - G * Math.cos(gamma)) / v + gust
          gdot += (cmd - gdot) * h * 8 // pitch inertia
          gamma += gdot * h
        }
        const facing = turning ? dir * Math.cos(bank) : dir
        const k = t < RELEASE_S ? (t / RELEASE_S) * (t / RELEASE_S) * (3 - 2 * (t / RELEASE_S)) : 1
        x += facing * v * Math.cos(gamma) * h * k
        y -= v * Math.sin(gamma) * h * k
      }
      if (dir > 0 && !turning) onTail?.(x - tailLen * Math.cos(gamma))
      // Paper doesn't vanish mid-air: it fades only after leaving the window.
      if (x < -160 || x > vw + 160 || y > vh + 160 || y < -200 || t > 30) leaving = true
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
  const fill = `url(#${uid}-paper)`
  return createPortal(
    // Shadow on the wrapper (translate only), not the pitching sprite.
    <div ref={el} aria-hidden="true" style={{ position: 'fixed', left: 0, top: 0, zIndex: 9999, pointerEvents: 'none', willChange: 'transform', transform: `translate3d(${from.x}px, ${from.y}px, 0)`, filter: PAPER_SHADOW }}>
      <svg
        ref={sprite}
        width={80} height={80} viewBox="-40 -40 80 80"
        style={{ position: 'absolute', left: -40, top: -40, overflow: 'visible', willChange: 'transform' }}
      >
        {/* The fold's last frame exactly: same faces, same turn and scale. */}
        <g transform={`rotate(90) scale(${scale})`}>
          <defs><PaperPattern id={`${uid}-paper`} pxPerUnit={PAPER_K} /></defs>
          <path d={FLY_FACES.far} fill={fill} {...sideStroke} />
          <path d={FLY_FACES.far} fill={SHADE} opacity={farShade} />
          <path d={FLY_FACES.keel} fill={fill} {...sideStroke} />
          <path d={FLY_FACES.near} fill={fill} {...sideStroke} />
          <path d={FLY_FACES.near} fill={SHADE} opacity={nearShade(OPEN_PSI)} />
          <path d={FLY_FACES.nearFlap} fill={fill} {...sideStroke} />
          <path d={FLY_FACES.nearFlap} fill={SHADE} opacity={nearShade(OPEN_PSI)} />
        </g>
      </svg>
    </div>,
    document.body,
  )
}

/** The note → sheet → fold → throw, as one object. */
function LetterPlane({ text, lines, launch, kPlane, pace, speed, onPaperIn, onLaunch, onTail, onDone }: {
  text: Pt; lines: string[]; launch: Pt; kPlane: number; pace: number; speed: number
  onPaperIn: () => void; onLaunch: () => void; onTail: (x: number) => void; onDone: () => void
}) {
  // Released level from the fold's pose; thrown well above trim speed so it
  // shoots out, then climbs gently on its own lift.
  const toss = useMemo<Throw>(() => {
    const vTrim = (130 + Math.random() * 35) * speed
    return { vTrim, v0: vTrim * (1.3 + Math.random() * 0.25), gamma0: (WIND_UP_DEG * Math.PI) / 180 }
  }, [speed])
  // The sheet sits so the note's text lands exactly where it was typed.
  const at = useMemo(() => ({ x: text.x - PAD_X + PAPER_W / 2, y: text.y - PAD_TOP + PAPER_H / 2 }), [text])
  const [flight, setFlight] = useState<Pt | null>(null)
  return flight
    ? <PaperFlight from={flight} launch={toss} scale={kPlane} onTail={onTail} onDone={onDone} />
    : <LetterFold at={at} launch={launch} kPlane={kPlane} pace={pace} lines={lines} onPaperIn={onPaperIn} onFolded={p => { setFlight(p); onLaunch() }} />
}

type Throwing = { text: Pt; lines: string[]; launch: Pt; noteLeft: number }

/** Email. Hover: a note to Ben types out under the button. Click: copies
 *  the address (never shown) — the icon turns to a check; the note lands on
 *  a sheet, which folds into a plane and is thrown, revealing "Email
 *  address copied" behind it. Touch, phones, reduced motion: check + note. */
export function CopyEmailButton({ icon }: { icon: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const { emailFx } = useProtoSettings()
  const [copied, setCopied] = useState(false)
  const [noteAt, setNoteAt] = useState<{ x: number; y: number; below: boolean } | null>(null)
  // The typed note (its text's top-left), while hovered/focused.
  const [letterAt, setLetterAt] = useState<Pt | null>(null)
  const [letterKey, setLetterKey] = useState(0)
  // At most one note in the air: from the click until the plane has gone.
  const [throwing, setThrowing] = useState<Throwing | null>(null)
  const [onPaper, setOnPaper] = useState(false)
  const [airborne, setAirborne] = useState(false)
  // This session's escalation (see NOTES).
  const [level, setLevel] = useState(noteLevel)
  const bumpLevel = () => {
    noteLevel = Math.min(NOTES.length - 1, noteLevel + 1)
    setLevel(noteLevel)
  }
  const openedAt = useRef<number | null>(null)
  // Hovered while the last note is still folding / flying.
  const [held, setHeld] = useState<Pt | null>(null)
  const shake = useAnimationControls()
  const eggId = useId()
  const dwell = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => () => { if (dwell.current) clearTimeout(dwell.current) }, [])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const btn = useRef<HTMLButtonElement>(null)
  const noteEl = useRef<HTMLSpanElement>(null)
  const canFold = useMemo(finePointer, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  // The plane's tail sweeps the note into view (a soft-edged mask).
  const revealX = useMotionValue(1e6)
  const noteLeft = useRef(0)
  const revealed = useRef(true)
  const maskEdge = useTransform(revealX, v => `${Math.round(v - noteLeft.current)}px`)

  const live = useRef({ throwing, letterAt, held, copied })
  useLayoutEffect(() => { live.current = { throwing, letterAt, held, copied } })
  // Screen readers hear every copy at once; cleared so a repeat re-announces.
  const [status, setStatus] = useState('')
  useEffect(() => {
    if (!status) return
    const t = setTimeout(() => setStatus(''), 4000)
    return () => clearTimeout(t)
  }, [status])

  const swap = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.4, rotate: -30 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.4, rotate: 30 },
      }

  const placeNote = useCallback(() => {
    const r = btn.current?.getBoundingClientRect()
    if (!r) return
    // Phones: no room beside the last icon — under the row, right-aligned.
    const below = window.matchMedia(PHONE_QUERY).matches
    setNoteAt(below ? { x: r.right, y: r.bottom + 8, below } : { x: r.right + 8, y: r.top + r.height / 2, below })
    noteLeft.current = below ? r.right : r.right + 8
  }, [])
  // The note sits in the top layer, so it follows the button if the layout
  // moves while it's showing (not mid-throw: the plane launched from where
  // the note was).
  useEffect(() => {
    if (!copied || throwing) return
    // Crossing the phone breakpoint re-lays the row out on React's next
    // render, after 'resize' fires — so place again once that has landed.
    let raf = 0
    const onResize = () => {
      placeNote()
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => { raf = requestAnimationFrame(placeNote) })
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', placeNote, { capture: true, passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', placeNote, { capture: true })
    }
  }, [copied, throwing, placeNote])

  // Hover/focus: the note types out (mouse/pen, wider than a phone).
  const openLetter = () => {
    if (!canFold || live.current.letterAt) return
    if (window.matchMedia(PHONE_QUERY).matches) return
    const r = btn.current?.getBoundingClientRect()
    if (!r) return
    const at = { x: r.left, y: r.bottom + LETTER_GAP }
    if (live.current.throwing) {
      // Not another one yet: the icon shakes its head and — once the sheet
      // has left the space under the button — says why. When the plane has
      // gone, the next note starts by itself.
      if (!reducedMotion) shake.start({ x: [0, -2, 2, -1.2, 0.6, 0], transition: { duration: 0.32, ease: 'easeOut' } })
      setHeld(at)
      return
    }
    openedAt.current = performance.now()
    announceOpen(eggId)
    // A new note means the last one's done: its check and note step aside.
    if (live.current.copied) { clearTimers(); setCopied(false) }
    setLetterAt(at)
    setLetterKey(k => k + 1)
  }
  const closeLetter = () => {
    if (dwell.current) clearTimeout(dwell.current)
    // A note someone stayed to read counts as an attempt to get in touch.
    if (openedAt.current !== null && performance.now() - openedAt.current > 600) bumpLevel()
    openedAt.current = null
    setLetterAt(null)
    setHeld(null)
  }
  useWindowLeave(closeLetter, !!letterAt || !!held)
  useOthersOpening(eggId, () => { if (live.current.letterAt || live.current.held) closeLetter() })
  // Escape dismisses the note (or the hold) wherever focus is (capture:
  // before a rail underneath, which then ignores the handled key).
  useEffect(() => {
    if ((!letterAt || throwing) && !held) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      e.preventDefault()
      closeLetter()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [letterAt, throwing, held]) // eslint-disable-line react-hooks/exhaustive-deps

  const finishReveal = () => {
    if (revealed.current) return
    revealed.current = true
    later(COPIED_MS, () => setCopied(false))
  }
  const onTail = (x: number) => {
    if (x > revealX.get()) revealX.set(x)
    const right = noteEl.current?.getBoundingClientRect().right
    if (right !== undefined && x > right + 16) finishReveal()
  }

  const onClick = async () => {
    // A press settles it: no note starts typing afterwards from the hover
    // dwell (it would replace the toast this press shows).
    if (dwell.current) clearTimeout(dwell.current)
    // Couldn't copy: fall back to what an envelope usually means.
    if (!(await copyText(EMAIL))) { window.location.href = `mailto:${EMAIL}`; return }
    // Announced at once, every time (the visible note may wait for a plane).
    setStatus('')
    requestAnimationFrame(() => setStatus('Email address copied'))
    // Every press is confirmed on the spot: a repeat press re-pops the check.
    if (live.current.copied) popCheck()
    // A note already folding / in the air: copied again. The toast stays the
    // plane's reveal — not shown early; kept up if it's already out — and
    // "one at a time" steps aside (this press worked).
    if (live.current.throwing) {
      setHeld(null)
      if (revealed.current) { clearTimers(); later(COPIED_MS, () => setCopied(false)) }
      return
    }
    clearTimers()
    const r = btn.current?.getBoundingClientRect()
    // The plane carries the note you can see: no note on screen (a press
    // quicker than the hover dwell, or the last toast still up) → just the
    // check and the toast.
    const fold = canFold && !reducedMotion && live.current.letterAt && r && !window.matchMedia(PHONE_QUERY).matches
    if (fold) {
      setCopied(true)
      const text = live.current.letterAt ?? { x: r.left, y: r.bottom + LETTER_GAP }
      const lines = NOTES[level]!.split('\n')
      // The note now belongs to the throw (and the next will be keener);
      // once the plane has gone, a new one types on the next hover.
      openedAt.current = null
      bumpLevel()
      setLetterAt(null)
      setAirborne(false)
      placeNote()
      // Held in the hand just right of the button — its real outline clear of
      // the button and its focus ring (+4px) — over where the note will be,
      // so its tail uncovers the note as it goes. Centred on the row.
      const kPlane = emailFx.planeLength / 44
      const launch = {
        x: r.right + 8 + FLY_BOUNDS.tail * kPlane, // 8px from the button, like the note
        y: r.top + r.height / 2 - ((FLY_BOUNDS.top + FLY_BOUNDS.bottom) / 2) * kPlane,
      }
      revealed.current = false
      revealX.set(-1e6)
      setOnPaper(false)
      setThrowing({ text, lines, launch, noteLeft: r.right + 8 })
      // If the plane never clears the note (it turned back early, or the tab
      // was hidden), finish the reveal anyway.
      later((PAPER_IN_S + emailFx.foldSeconds + WIND_UP_S + WIND_UP_HOLD_S + 2.6) * 1000, () => {
        if (revealed.current) return
        const right = noteEl.current?.getBoundingClientRect().right ?? revealX.get()
        animate(revealX, right + 24, { duration: 0.35, ease: EASE_OUT })
        finishReveal()
      })
      return
    }
    setCopied(true)
    placeNote()
    revealed.current = true
    revealX.set(1e6)
    later(COPIED_MS, () => setCopied(false))
  }
  const popCheck = () => {
    if (reducedMotion) return
    shake.set({ scale: 0.82 })
    shake.start({ scale: 1, transition: { type: 'spring', stiffness: 520, damping: 13, mass: 0.6 } })
  }

  const kPlane = emailFx.planeLength / 44
  const letterPos = throwing ? (onPaper ? null : throwing.text) : letterAt
  const letterMount = useFadeMount(letterPos, letterKey)
  const handedOver = !!throwing && onPaper
  const tempo = NOTE_TEMPO[level]!
  // The hold line shows once the plane is in the air (the sheet was there).
  const heldPos = held && airborne ? held : null
  const heldMount = useFadeMount(heldPos, 0)

  return (
    <span
      style={{ position: 'relative', display: 'flex' }}
      onPointerEnter={e => {
        if (e.pointerType === 'touch') return
        if (dwell.current) clearTimeout(dwell.current)
        dwell.current = setTimeout(openLetter, DWELL_OPEN_MS)
      }}
      onPointerLeave={closeLetter}
    >
      <button
        ref={btn}
        type="button"
        data-social
        className="simple-social"
        aria-label="Copy email address"
        onFocus={e => { if (keyboardFocus(e)) openLetter() }}
        onBlur={closeLetter}
        onClick={onClick}
      >
        <motion.span animate={shake} style={{ display: 'flex' }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'check' : 'mail'}
            {...swap}
            transition={ICON_SWAP}
            style={{ display: 'flex', width: 24, height: 24 }}
          >
            {copied ? <Check size={24} weight="regular" aria-hidden="true" /> : icon}
          </motion.span>
        </AnimatePresence>
        </motion.span>
      </button>
      {throwing && (
        <LetterPlane
          text={throwing.text}
          lines={throwing.lines}
          launch={throwing.launch}
          kPlane={kPlane}
          // The dial is the fold's length in seconds.
          pace={emailFx.foldSeconds / FOLD_STEPS_S}
          speed={emailFx.throwSpeed}
          onPaperIn={() => setOnPaper(true)}
          onLaunch={() => setAirborne(true)}
          onTail={onTail}
          onDone={() => {
            setThrowing(null)
            setOnPaper(false)
            setAirborne(false)
            // Still waiting: the hold line clears and the next note starts.
            if (live.current.held) { setHeld(null); later(220, openLetter) }
          }}
        />
      )}
      {letterMount && createPortal(
        <div
          key={letterMount.key}
          aria-hidden="true"
          className="email-letter"
          data-on-paper={throwing ? '' : undefined}
          data-shown={letterPos ? '' : undefined}
          // Handed to the paper: gone in the same frame the sheet's own
          // (identical) text appears. Otherwise a soft fade.
          style={{ left: letterMount.pos.x, top: letterMount.pos.y, transition: handedOver ? 'none' : undefined }}
        >
          <TypedLetter
            text={throwing ? throwing.lines.join('\n') : NOTES[level]!}
            cps={emailFx.typeCps * tempo.speed}
            beat={tempo.beat}
            typo={tempo.typo}
            complete={!!throwing || !!reducedMotion}
            caret={!throwing}
          />
        </div>,
        document.body,
      )}
      {heldMount && createPortal(
        <div
          aria-hidden="true"
          className="email-letter"
          data-status=""
          data-shown={heldPos ? '' : undefined}
          style={{ left: heldMount.pos.x, top: heldMount.pos.y }}
        >
          <TypedLetter text={HELD_NOTE} cps={emailFx.typeCps * 2} beat={2} complete={!!reducedMotion} caret />
        </div>,
        document.body,
      )}
      {/* Announced in place at once; drawn in the top layer beside the button. */}
      <span role="status" className="sr-only">{status}</span>
      {noteAt && createPortal(
        <motion.span
          aria-hidden="true"
          className="simple-copied-float"
          data-below={noteAt.below || undefined}
          data-reveal={throwing ? '' : undefined}
          style={{ left: noteAt.x, top: noteAt.y, '--rx': maskEdge } as unknown as MotionStyle}
        >
          <AnimatePresence>
            {copied && (
              <motion.span
                ref={noteEl}
                key="toast"
                className="simple-copied"
                // Thrown: the plane's tail does the reveal. Otherwise a soft slide in.
                initial={throwing || reducedMotion ? { opacity: throwing ? 1 : 0 } : { opacity: 0, x: -6, filter: 'blur(3px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -4, filter: 'blur(2px)' }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                style={{ display: 'inline-block' }}
              >
                Email address copied
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>,
        document.body,
      )}
    </span>
  )
}
