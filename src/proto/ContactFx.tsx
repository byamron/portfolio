import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check } from '@phosphor-icons/react'
import { buildContributionDays } from '@/utils/contributions'

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
// GitHub: a little terminal that writes a command, runs it, shows the result.
// ─────────────────────────────────────────────────────────────────────────

function useContributionSparkline(weeks = 20) {
  return useMemo(() => {
    const { days, total, year } = buildContributionDays()
    const sums: number[] = []
    for (let i = days.length; i > 0 && sums.length < weeks; i -= 7) {
      sums.unshift(days.slice(Math.max(0, i - 7), i).reduce((n, d) => n + d.contributionCount, 0))
    }
    const max = Math.max(1, ...sums)
    // 0 → a 1px baseline tick; otherwise 2–12px, so quiet weeks still show.
    const spark = sums.map(n => (n === 0 ? 1 : 2 + Math.round((n / max) * 10)))
    return { spark, total, year }
  }, [weeks])
}

/** Types `text` at a fast clip, then calls onDone. Reduced motion: instant. */
function Typed({ text, onDone, cps = 70 }: { text: string; onDone?: () => void; cps?: number }) {
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

const termLine: React.CSSProperties = { whiteSpace: 'pre', lineHeight: 1.55 }
const prompt = <span style={{ opacity: 0.5 }}>$ </span>

function Terminal({ stage }: { stage: 1 | 2 }) {
  const { spark, total, year } = useContributionSparkline()
  const [ran1, setRan1] = useState(false)
  const [typed2, setTyped2] = useState(false)
  const [ran2, setRan2] = useState(false)
  // A beat of "running" between typing and output.
  useEffect(() => {
    if (!typed2) return
    const t = setTimeout(() => setRan2(true), 160)
    return () => clearTimeout(t)
  }, [typed2])
  return (
    <div className="term-window">
      <div className="term-bar">
        <span /><span /><span />
        <em>~/byamron</em>
      </div>
      <div className="term-body">
        <div style={termLine}>{prompt}<Typed text={`gh graph --year ${year}`} cps={90} onDone={() => setTimeout(() => setRan1(true), 120)} /></div>
        {ran1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }} style={termLine}>
            <span className="term-spark" aria-hidden="true">
              {spark.map((h, i) => <i key={i} style={{ height: h }} />)}
            </span>{'  '}{total.toLocaleString('en-US')} contributions
          </motion.div>
        )}
        {ran1 && stage === 2 && (
          <div style={termLine}>{prompt}<Typed text={'git commit -m "say hi"'} onDone={() => setTyped2(true)} /></div>
        )}
        {ran2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
            <div style={termLine}><span style={{ opacity: 0.6 }}>[main 3f9c2a1]</span> say hi</div>
            <div style={{ ...termLine, opacity: 0.6 }}> 1 file changed, 1 insertion(+)</div>
          </motion.div>
        )}
        {(!ran1 || ran2) && <span className="term-caret" />}
      </div>
    </div>
  )
}

export function GitHubLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const { stage, handlers } = useHoverStage()
  return (
    <span style={{ position: 'relative', display: 'flex' }} {...handlers}>
      <a data-social className="simple-social" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
      <IconPopover show={stage > 0} width={292}>
        {stage > 0 && <Terminal stage={stage as 1 | 2} />}
      </IconPopover>
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// LinkedIn: a business card flips out; stay and it turns over.
// ─────────────────────────────────────────────────────────────────────────

export function LinkedInLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const { stage, handlers } = useHoverStage()
  const reducedMotion = useReducedMotion()
  return (
    <span style={{ position: 'relative', display: 'flex' }} {...handlers}>
      <a data-social className="simple-social" href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
      <IconPopover show={stage > 0} width={224}>
        <div style={{ perspective: 700 }}>
          <motion.div
            className="biz-card"
            initial={reducedMotion ? false : { rotateY: -70 }}
            animate={{ rotateY: stage === 2 ? 180 : 0 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="biz-face">
              <div className="biz-name">Ben Yamron</div>
              <div className="biz-title">Product Designer</div>
              <div className="biz-org">
                <img src="/images/logo-consensus.svg" alt="" />
                Consensus
              </div>
            </div>
            <div className="biz-face biz-back">
              <div className="biz-mono">BY</div>
              <div className="biz-url">linkedin.com/in/benyamron</div>
            </div>
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
// When the check lands: the plane has folded and left the slot.
const CHECK_AT_MS = 330
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

/** Email: copies the address (no mail client, address never shown). */
export function CopyEmailButton({ icon }: { icon: ReactNode }) {
  const reducedMotion = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const [plane, setPlane] = useState<DOMRect | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))

  const swap = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.4, rotate: -30 },
        animate: { opacity: 1, scale: 1, rotate: 0 },
        exit: { opacity: 0, scale: 0.4, rotate: 30 },
      }
  const flying = !!plane

  return (
    <span style={{ position: 'relative', display: 'flex' }}>
      <button
        ref={btn}
        type="button"
        data-social
        className="simple-social"
        aria-label="Copy email address"
        onClick={async () => {
          // Couldn't copy: fall back to what an envelope usually means.
          if (!(await copyText(EMAIL))) { window.location.href = `mailto:${EMAIL}`; return }
          timers.current.forEach(clearTimeout)
          timers.current = []
          setCopied(false)
          const icon = btn.current?.querySelector('svg')
          if (!reducedMotion && icon && !plane) setPlane(icon.getBoundingClientRect())
          later(reducedMotion ? 0 : CHECK_AT_MS, () => setCopied(true))
          later((reducedMotion ? 0 : CHECK_AT_MS) + COPIED_MS, () => setCopied(false))
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'check' : flying ? 'empty' : 'mail'}
            {...swap}
            transition={ICON_SWAP}
            style={{ display: 'flex', width: 24, height: 24 }}
          >
            {copied ? <Check size={24} weight="regular" aria-hidden="true" /> : flying ? null : icon}
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
