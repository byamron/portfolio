import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { animate, AnimatePresence, cancelFrame, frame, motion, useAnimationControls, useMotionValue, useReducedMotion, useTransform, type MotionStyle } from 'framer-motion'
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
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType !== 'touch') open(true) },
    onPointerLeave: close,
    onFocus: () => open(false),
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
                  <div className="biz-row">consensus.app</div>
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
  "Hi Ben,\n\nI love your portfolio and\nyou seem really cool.\nLet's chat!\n\nBest,\n[Your name]",
  "Hi Ben!\n\nI really love your\nportfolio, and you seem\nreally, really cool.\nLet's chat!!\n\nBest,\n[Your name]",
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
  { speed: 1.15, beat: 3, typo: 0 },
  { speed: 1.35, beat: 2.5, typo: 0 },
  { speed: 1.6, beat: 2, typo: 0.04 },
  { speed: 1.9, beat: 1.6, typo: 0.07 },
  { speed: 2.3, beat: 1.25, typo: 0.1 },
]
// While the last note is still folding / flying: the system's voice, not the note's.
const HELD_NOTE = 'One at a time \u2014 the last\none is still in the air.'
const NOTE_LEVEL_KEY = 'email-note-level'
const readNoteLevel = () => {
  try { return Math.min(NOTES.length - 1, Number(sessionStorage.getItem(NOTE_LEVEL_KEY)) || 0) } catch { return 0 }
}
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
const edgeStroke = { stroke: EDGE, strokeWidth: 0.6, strokeLinejoin: 'round' as const, vectorEffect: 'non-scaling-stroke' as const }

type Pt = { x: number; y: number }
const RELEASE_S = 0.3
interface Throw { v0: number; vTrim: number } // launch speed, trim speed (px/s)

const SMOOTH = [0.37, 0, 0.63, 1] as const // sine in-out
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** The note's sheet: fades in under the typed note, folds (a parameter per
 *  step, every face derived from them each frame, so the paper stays one
 *  continuous sheet), then is lifted into the throwing hand at `launch`. */
function LetterFold({ at, launch, kPlane, pace, lines, onPaperIn, onFolded }: {
  at: Pt; launch: Pt; kPlane: number; pace: number; lines: string[]; onPaperIn: () => void; onFolded: (at: Pt) => void
}) {
  const uid = useId().replace(/:/g, '')
  const stage = useAnimationControls()

  // Step parameters (0…1 unless noted).
  const split = useMotionValue(0) // 0: one flat sheet; 1: two halves about the crease
  const lift = useMotionValue(1) // right half's scaleX about the crease
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
    const set = (k: string, poly: P2[] | null, m: M6 = IDENTITY, fill = BACK) => {
      const el = els.current[k]
      if (!el) return
      if (!poly) { el.style.display = 'none'; return }
      el.style.display = ''
      el.setAttribute('d', pathOf(poly))
      el.setAttribute('transform', matrixOf(m))
      if (el.getAttribute('fill') !== fill) el.setAttribute('fill', fill)
    }
    const FACES = ['base', 'cornerFlap', 'cornerStatic', 'edgeFlap', 'cornerMove']
    // One half's faces; the right half is drawn mirrored (and its group is
    // turned about the crease by `lift`).
    const half = (p: string, mirror: boolean, c: number, e: number, hidden: boolean) => {
      if (hidden) { FACES.forEach(k => set(p + k, null)); return }
      const P = (pts: P2[]) => (mirror ? pts.map(mirrorP) : pts)
      const M = (m: M6) => (mirror ? mirrorM(m) : m)
      set(p + 'base', P(e > 0 ? BASE_3 : c > 0 ? BASE_2 : SHEET), IDENTITY, FRONT)
      if (e === 0) {
        set(p + 'cornerFlap', c > 0 ? P(CORNER) : null, M(foldMatrix(NOSE, HINGE_2, c)), c < 0.5 ? FRONT : BACK)
        ;['cornerStatic', 'edgeFlap', 'cornerMove'].forEach(k => set(p + k, null))
      } else {
        const m3 = M(foldMatrix(NOSE, HINGE_3, e))
        set(p + 'cornerFlap', null)
        set(p + 'cornerStatic', P(CORNER_STATIC))
        set(p + 'edgeFlap', P(EDGE_FLAP), m3, e < 0.5 ? FRONT : BACK)
        // Rides on the edge flap's face; past edge-on it's underneath.
        set(p + 'cornerMove', e < 0.5 ? P(CORNER_MOVE) : null, m3)
      }
    }
    const render = () => {
      if (!side) {
        const whole = split.get() === 0
        const s = lift.get()
        set('whole', whole ? FULL_SHEET : null, IDENTITY, FRONT)
        els.current.right?.setAttribute('transform', `scale(${s} 1)`)
        half('L', false, cornerL.get(), edgeL.get(), whole)
        // Past edge-on, the right half shows its plain back, on top.
        half('R', true, cornerR.get(), edgeR.get(), whole || s < 0)
        set('Rback', !whole && s < 0 ? BASE_3.map(mirrorP) : null)
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
        setD('far', f.far); setD('keel', f.keel); setD('near', f.near)
        // The wing's inner face (with the flap line) shows once it's past
        // edge-on (ψ > 90°) — the swap happens while it's a line, unseen.
        setD('nearFlap', psi.get() > Math.PI / 2 ? f.nearFlap : null)
        // The hinge only becomes a fold line once the wing starts to turn.
        setD('hingeCover', f.hinge, 1 - clamp01(psi.get() / 0.35))
      }
    }
    render()
    // Several values often move in the same frame: render once, in Framer's
    // own render step (same frame as the stage transform; deduped per frame).
    const schedule = () => frame.render(render)
    const unsub = [split, lift, cornerL, cornerR, edgeL, edgeR, psi, roll].map(mv => mv.on('change', schedule))
    return () => { unsub.forEach(u => u()); cancelFrame(render) }
  }, [side]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const at$ = (sec: number, fn: () => void) => timers.push(setTimeout(fn, (0.3 + sec * pace) * 1000))
    const tw = (duration: number) => ({ duration: duration * pace, ease: SMOOTH })
    // 0 · The sheet appears under the note; the note is printed on it.
    stage.start({ opacity: 1, scale: 1, transition: { duration: 0.26, ease: EASE_OUT } })
    // The typed note hands its words to the sheet in one render.
    timers.push(setTimeout(() => { setInked(true); onPaperIn() }, 300))
    // 1 · Crease lengthwise: the right half lifts over and lays back down.
    at$(0.25, () => { split.set(1); animate(lift, [1, 0.18, 1], tw(0.8)) })
    // 2 · Top corners to the crease, left then right.
    at$(1.05, () => animate(cornerL, 1, tw(0.6)))
    at$(1.25, () => animate(cornerR, 1, tw(0.6)))
    // 3 · The new slanted edges to the crease.
    at$(1.9, () => animate(edgeL, 1, tw(0.6)))
    at$(2.1, () => animate(edgeR, 1, tw(0.6)))
    // 4 · Fold in half: the right half turns over onto the left.
    at$(2.75, () => animate(lift, -1, tw(0.7)))
    // 5 · Turn to the side (nose right) and lift it into the hand — up to
    //     the icon row, receding to a throwable size — then fold each wing.
    at$(3.45, () => {
      setSide(true)
      stage.start({ x: launch.x - at.x, y: launch.y - at.y, scale: kPlane / PAPER_K, rotate: 90, transition: tw(0.95) })
    })
    at$(4.35, () => animate(psi, Math.PI, tw(0.7)))
    // 6 · Open the wings (and roll a little so they read), then let go.
    at$(5.1, () => {
      animate(psi, OPEN_PSI, tw(0.6))
      animate(roll, OPEN_ROLL, tw(0.6))
    })
    at$(5.72, () => onFolded(launch))
    return () => timers.forEach(clearTimeout)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const face = (k: string) => <path ref={ref(k)} {...edgeStroke} />
  const halfFaces = (p: string) => (
    <>
      {face(p + 'base')}
      {face(p + 'cornerFlap')}
      {face(p + 'cornerStatic')}
      {face(p + 'edgeFlap')}
      {face(p + 'cornerMove')}
    </>
  )
  const back = `url(#${uid}-back)`
  // The shadow sits on a wrapper that stays put, so it always falls straight
  // down instead of turning with the paper.
  return createPortal(
    <div aria-hidden="true" style={{ position: 'fixed', left: at.x - PAPER_W / 2, top: at.y - PAPER_H / 2, width: PAPER_W, height: PAPER_H, zIndex: 9999, pointerEvents: 'none', filter: PAPER_SHADOW }}>
      <motion.svg
        width={PAPER_W} height={PAPER_H} viewBox="-17 -22 34 44"
        initial={{ opacity: 0, scale: 0.97, x: 0, y: 0, rotate: 0 }}
        animate={stage}
        style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', willChange: 'transform' }}
      >
        <defs>
          <PaperPattern id={`${uid}-back`} pxPerUnit={PAPER_K} />
          <LetterPattern id={`${uid}-front`} grainId={`${uid}-back`} inked={inked} lines={lines} />
        </defs>
        {/* Keyed, so the side view never inherits a front-view node. */}
        {!side ? (
          <g key="front">
            {face('whole')}
            {halfFaces('L')}
            <g ref={ref('right')}>
              {halfFaces('R')}
              {face('Rback')}
            </g>
          </g>
        ) : (
          <g key="side">
            <path ref={ref('far')} fill={back} {...edgeStroke} />
            <path ref={ref('keel')} fill={back} {...edgeStroke} />
            <path ref={ref('near')} fill={back} {...edgeStroke} />
            <path ref={ref('nearFlap')} fill={back} {...edgeStroke} />
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
    let v = launch.v0, gamma = 0, gdot = 0 // released level
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
          <path d={FLY_FACES.far} fill={fill} {...edgeStroke} />
          <path d={FLY_FACES.keel} fill={fill} {...edgeStroke} />
          <path d={FLY_FACES.near} fill={fill} {...edgeStroke} />
          <path d={FLY_FACES.nearFlap} fill={fill} {...edgeStroke} />
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
    return { vTrim, v0: vTrim * (1.3 + Math.random() * 0.25) }
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
  const [level, setLevel] = useState(readNoteLevel)
  const bumpLevel = () => setLevel(l => {
    const next = Math.min(NOTES.length - 1, l + 1)
    try { sessionStorage.setItem(NOTE_LEVEL_KEY, String(next)) } catch { /* private mode */ }
    return next
  })
  const openedAt = useRef<number | null>(null)
  // Hovered while the last note is still folding / flying.
  const [held, setHeld] = useState<Pt | null>(null)
  const shake = useAnimationControls()
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

  const live = useRef({ throwing, letterAt, held })
  useLayoutEffect(() => { live.current = { throwing, letterAt, held } })

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
      if (!reducedMotion) shake.start({ x: [0, -3, 3, -2, 1.5, 0], transition: { duration: 0.36, ease: 'easeOut' } })
      setHeld(at)
      return
    }
    openedAt.current = performance.now()
    setLetterAt(at)
    setLetterKey(k => k + 1)
  }
  const closeLetter = () => {
    // A note someone stayed to read counts as an attempt to get in touch.
    if (openedAt.current !== null && performance.now() - openedAt.current > 600) bumpLevel()
    openedAt.current = null
    setLetterAt(null)
    setHeld(null)
  }
  useWindowLeave(closeLetter, !!letterAt || !!held)
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
    // Couldn't copy: fall back to what an envelope usually means.
    if (!(await copyText(EMAIL))) { window.location.href = `mailto:${EMAIL}`; return }
    clearTimers()
    // Off for a frame on a repeat click, so the check replays and the status
    // region re-announces (at once — the visual note may wait for the plane).
    setCopied(false)
    requestAnimationFrame(() => setCopied(true))
    const r = btn.current?.getBoundingClientRect()
    const fold = canFold && !reducedMotion && !live.current.throwing && r && !window.matchMedia(PHONE_QUERY).matches
    if (fold) {
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
      later((5.72 * emailFx.foldPace + 0.3 + 2.6) * 1000, () => {
        if (revealed.current) return
        const right = noteEl.current?.getBoundingClientRect().right ?? revealX.get()
        animate(revealX, right + 24, { duration: 0.35, ease: EASE_OUT })
        finishReveal()
      })
      return
    }
    placeNote()
    revealed.current = true
    revealX.set(1e6)
    later(COPIED_MS, () => setCopied(false))
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
      onPointerEnter={e => { if (e.pointerType !== 'touch') openLetter() }}
      onPointerLeave={closeLetter}
    >
      <button
        ref={btn}
        type="button"
        data-social
        className="simple-social"
        aria-label="Copy email address"
        onFocus={openLetter}
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
          pace={emailFx.foldPace}
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
      <span role="status" className="sr-only">{copied ? 'Email address copied' : ''}</span>
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
