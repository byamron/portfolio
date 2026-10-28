import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { PaperTexture } from '@paper-design/shaders-react'

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
  "const blimp = new Blimp('github')",
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
          <div style={{ ...termLine, marginTop: 6 }}>{prompt}<Typed text="node hi.js" cps={150} onDone={() => setTypedRun(true)} /></div>
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
    if (n >= text.length) { const t = setTimeout(() => done.current(), 60); return () => clearTimeout(t) }
    const t = setTimeout(() => setN(v => v + 4), 1000 / 30) // ~120 chars/s
    return () => clearTimeout(t)
  }, [n, text])
  return <>{highlight(text.slice(0, n))}</>
}

// GitHub's mark (simple-icons, 24×24).
const GITHUB_MARK = 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'

const BANNER_A = 'M 118 30 C 92 25, 58 35, 12 29 L 12 67 C 58 73, 92 63, 118 66 Z'
const BANNER_B = 'M 118 30 C 92 35, 58 26, 12 33 L 12 71 C 58 64, 92 72, 118 66 Z'

/** A small airship: shaded envelope with gores and seams, fins, gondola,
 *  the GitHub mark, and a "Hi" banner on a tether. Lit from the top-left. */
function BlimpArt() {
  const tint = (s: number, l: number) => ({ stopColor: `hsl(var(--accent-hue) ${s}% ${l}%)` })
  return (
    <svg width={380} height={104} viewBox="0 0 380 104" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="blimp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: '#fdfcfa' }} />
          <stop offset="0.45" style={tint(12, 85)} />
          <stop offset="1" style={tint(14, 58)} />
        </linearGradient>
        <radialGradient id="blimp-rim" cx="0.58" cy="0.38" r="0.62">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </radialGradient>
        <linearGradient id="blimp-fin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={tint(14, 72)} />
          <stop offset="1" style={tint(16, 50)} />
        </linearGradient>
        <clipPath id="blimp-clip"><ellipse cx="265" cy="50" rx="105" ry="34" /></clipPath>
        <filter id="blimp-soft"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      {/* Tether + banner (trails behind; the cloth ripples) */}
      <path d="M 118 48 Q 136 52 160 50" fill="none" stroke="rgba(60,50,40,0.45)" strokeWidth="1" />
      <motion.path
        initial={{ d: BANNER_A }}
        animate={{ d: [BANNER_A, BANNER_B, BANNER_A] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        fill="#f6f1e6" stroke="rgba(60,50,40,0.25)" strokeWidth="0.75"
      />
      <text x="65" y="56" textAnchor="middle" fontFamily="Literata, Georgia, serif" fontSize="22" fill="#2b2620">Hi</text>

      {/* Fins */}
      <path d="M 182 26 L 160 4 L 148 6 L 166 32 Z" fill="url(#blimp-fin)" />
      <path d="M 182 74 L 160 96 L 148 94 L 166 68 Z" fill="url(#blimp-fin)" />
      <path d="M 176 50 L 150 43 L 148 57 Z" fill="url(#blimp-fin)" opacity="0.9" />

      {/* Gondola */}
      <rect x="246" y="80" width="46" height="13" rx="6.5" style={{ fill: 'hsl(var(--accent-hue) 10% 38%)' }} />
      {[254, 263, 272, 281].map(x => <rect key={x} x={x} y="84" width="5" height="4" rx="1" fill="#f3efe6" opacity="0.8" />)}

      {/* Envelope */}
      <ellipse cx="265" cy="50" rx="105" ry="34" fill="url(#blimp-body)" />
      <g clipPath="url(#blimp-clip)" fill="none" stroke="rgba(40,30,20,0.08)" strokeWidth="1">
        <ellipse cx="265" cy="50" rx="62" ry="34" />
        <ellipse cx="265" cy="50" rx="26" ry="34" />
        <ellipse cx="265" cy="50" rx="105" ry="13" />
      </g>
      <ellipse cx="265" cy="50" rx="105" ry="34" fill="url(#blimp-rim)" />
      <ellipse cx="248" cy="30" rx="66" ry="8" fill="#fff" opacity="0.55" filter="url(#blimp-soft)" />

      {/* GitHub mark on the flank, slightly foreshortened by the curve */}
      <g transform="translate(296 34) scale(1.3 1.25)" opacity="0.88">
        <path d={GITHUB_MARK} fill="#24292f" />
      </g>
    </svg>
  )
}

/** Crosses the top of the viewport at a constant cruise, bobbing gently. */
function BlimpFlight({ onDone }: { onDone: () => void }) {
  const vw = window.innerWidth
  const distance = vw + 420
  return createPortal(
    <motion.div
      aria-hidden="true"
      initial={{ x: -400 }}
      animate={{ x: vw + 20 }}
      // Linear on purpose: an airship cruises at constant speed.
      transition={{ duration: distance / 170, ease: 'linear' }}
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
// LinkedIn: an old-fashioned business card — letterpress on card stock, a
// counterpoint to the site's glass — that keeps turning in the hand.
// ─────────────────────────────────────────────────────────────────────────

const FLIP_FIRST_MS = 1100
const FLIP_EVERY_MS = 2300

/** Card stock: Paper's paper-texture shader, static, warm cream. */
function CardStock() {
  return (
    <PaperTexture
      className="biz-stock"
      colorBack="#f2ecdf"
      colorPaper="#f7f2e7"
      colorShadow="#d3c9b3"
      roughness={0.28}
      roughnessSize={0.3}
      fiber={0.3}
      fiberSize={0.3}
      folds={0}
      crumples={0}
      wrinkles={0}
      drops={0.05}
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
      <IconPopover show={stage > 0} width={236}>
        <div style={{ perspective: 800 }}>
          {/* A slow drift so the card feels held, not pinned. */}
          <motion.div
            animate={reducedMotion ? {} : { y: [0, -3, 0], rotateZ: [-0.8, 0.6, -0.8] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="biz-card"
              initial={reducedMotion ? false : { rotateY: -70 }}
              animate={{ rotateY: turns * 180 }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 16 }}
            >
              <div className="biz-face">
                <CardStock />
                <div className="biz-name">Ben Yamron</div>
                <div className="biz-title">Product Designer</div>
                <div className="biz-rule" />
                <div className="biz-foot">
                  <span>Consensus</span>
                  <span>San Francisco</span>
                </div>
              </div>
              <div className="biz-face biz-back">
                <CardStock />
                <div className="biz-seal"><span>BY</span></div>
                <div className="biz-url">linkedin.com/in/benyamron</div>
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

// Two 4-point shapes per half so the morph is point-for-point: the sheet's
// top/bottom halves become the plane's wing and keel (viewBox centred on 0).
const SHEET_TOP = 'M -10 -7 L 10 -7 L 10 0 L -10 0 Z'
const SHEET_BOTTOM = 'M -10 0 L 10 0 L 10 7 L -10 7 Z'
const WING = 'M -11 -6 L 12 0 L 12 0 L -4 1 Z'
const KEEL = 'M -4 1 L 12 0 L -7 7 L -7 5 Z'

function PaperPlane({ from, onDone }: { from: DOMRect; onDone: () => void }) {
  const cx = from.left + from.width / 2
  const cy = from.top + from.height / 2
  const flyX = window.innerWidth - cx + 60
  const flyY = -(cy + 60)
  const fold = { duration: 0.22, delay: 0.1, ease: EASE_OUT }
  return createPortal(
    <motion.svg
      aria-hidden="true"
      width={48} height={48} viewBox="-24 -24 48 48"
      style={{
        position: 'fixed', left: cx - 24, top: cy - 24, zIndex: 9999, pointerEvents: 'none', overflow: 'visible',
        color: 'var(--text-dark)', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.22))',
      }}
      initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
      // Lift as paper, fold, a small dip on launch, then away up-right.
      animate={{
        x: [0, 0, -4, flyX * 0.35, flyX],
        y: [0, -2, 3, flyY * 0.25, flyY],
        rotate: [0, 0, 6, -14, -22],
        scale: [1, 1.2, 1.25, 1.35, 1.05],
      }}
      transition={{ duration: 1.05, times: [0, 0.1, 0.33, 0.6, 1], ease: 'easeIn' }}
      onAnimationComplete={onDone}
    >
      <defs>
        {/* Paper fibre: low-contrast fractal noise multiplied into the white. */}
        <filter id="paper-grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0" result="grain" />
          <feComposite in="grain" in2="SourceGraphic" operator="in" result="g2" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="g2" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#paper-grain)">
        <motion.path
          initial={{ d: SHEET_TOP }}
          animate={{ d: WING }}
          transition={fold}
          fill="#fffdf9" stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} strokeLinejoin="round"
        />
        <motion.path
          initial={{ d: SHEET_BOTTOM }}
          animate={{ d: KEEL }}
          transition={fold}
          fill="#e9e6e1" stroke="rgba(0,0,0,0.3)" strokeWidth={0.6} strokeLinejoin="round"
        />
        {/* The envelope's flap, fading as it becomes plain paper. */}
        <motion.path
          d="M -10 -7 L 0 0.5 L 10 -7"
          fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round"
          initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.1 }}
        />
      </g>
    </motion.svg>,
    document.body,
  )
}

/** Email. Hover: the envelope turns to paper, folds into a plane and flies
 *  off, then a fresh envelope springs back into the slot. Click: copies the
 *  address (never shown) — check + "Email address copied". */
export function CopyEmailButton({ icon }: { icon: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const [plane, setPlane] = useState<DOMRect | null>(null)
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
    if (!canFly || reducedMotion || plane || copied) return
    const glyph = btn.current?.querySelector('svg')
    if (!glyph) return
    setPlane(glyph.getBoundingClientRect())
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
      {plane && <PaperPlane from={plane} onDone={() => setPlane(null)} />}
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
