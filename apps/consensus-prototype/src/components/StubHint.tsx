import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'

interface Hint {
  text: string
  x: number
  y: number
  /** Flipped below the control when there is no room above it. */
  below: boolean
}

/** Roughly the hint's own height plus its offset. */
const HINT_CLEARANCE = 36
/** Keep the hint off the very edge of the window. */
const EDGE = 8

const StubContext = createContext<((event: MouseEvent, text?: string) => void) | null>(null)

/**
 * Feedback for controls that are real in the product but out of scope here.
 *
 * Anchored to the control rather than parked in a corner: the corners already
 * carry the variant switch and the annotation toolbar, and a corner toast makes
 * you work out which of several things you just clicked. This appears directly
 * above what you pressed, says so, and leaves.
 */
export function StubHintProvider({ children }: { children: ReactNode }) {
  const [hint, setHint] = useState<Hint | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const stub = useCallback((event: MouseEvent, text = 'Not wired up in this prototype') => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    window.clearTimeout(timer.current)

    // A control near the top of the window has no room above it, so the hint
    // flips under it rather than off-screen. Half the estimated width keeps the
    // centred hint inside the viewport horizontally.
    const below = rect.top < HINT_CLEARANCE
    const half = Math.min(text.length * 3.6, 160)
    setHint({
      text,
      x: Math.min(Math.max(rect.left + rect.width / 2, half + EDGE), window.innerWidth - half - EDGE),
      y: below ? rect.bottom : rect.top,
      below,
    })
    timer.current = window.setTimeout(() => setHint(null), 1900)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <StubContext.Provider value={stub}>
      {children}
      {hint && (
        <div
          style={{
            left: hint.x,
            top: hint.y,
            transform: hint.below ? 'translate(-50%, 8px)' : 'translate(-50%, calc(-100% - 8px))',
          }}
          className="pointer-events-none fixed z-[60] max-w-[min(320px,calc(100vw-16px))]"
        >
          <div
            role="status"
            aria-live="polite"
            className="animate-[stub-in_140ms_ease-out] rounded-[8px] bg-inverse px-2.5 py-1.5
              text-balance text-[12px] font-medium leading-4 text-on-inverse
              shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)]"
          >
            {hint.text}
          </div>
        </div>
      )}
    </StubContext.Provider>
  )
}

/**
 * `stub(event)` on a control's onClick marks it as deliberately inert.
 * Optionally pass what it *would* do, which is more useful than "coming soon".
 */
export function useStub() {
  const stub = useContext(StubContext)
  if (!stub) throw new Error('useStub must be used within StubHintProvider')
  return stub
}
