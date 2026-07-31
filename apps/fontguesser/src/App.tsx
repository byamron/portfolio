import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Specimen } from './components/Specimen'
import { GuessInput } from './components/GuessInput'
import { ChoiceInput } from './components/ChoiceInput'
import { Reveal } from './components/Reveal'
import { FONTS as ALL_FONTS } from './lib/fonts'
import { compositionFor } from './lib/specimens'
import { loadAbout, warmAbout, type AboutEntry } from './lib/about'
import { prefetchFont, useFontLoader } from './lib/useFontLoader'
import {
  DEPTHS,
  dailyFont,
  dayNumber,
  depthFor,
  randomFont,
  todayKey,
  type Depth,
  type FontEntry,
} from './lib/fonts'

/**
 * Typing gets three attempts because the search space is the whole library.
 * Multiple choice gets two — one retry against four options still leaves a real
 * decision, where three would be pure elimination.
 */
const GUESSES = { type: 3, choose: 2 } as const

/** Slightly past the 160ms departure fade, so the swap always lands on a blank page. */
const EXIT_MS = 190

const STORE_KEY = 'specimen:v1'

type Mode = 'daily' | 'endless'
type Answering = 'type' | 'choose'
type Status = 'playing' | 'solved' | 'failed'

/**
 * The round-change sequence. Every flash this app has ever shown came from one
 * mistake in different costumes: something changed while it could be seen.
 * Content swapped inside a layer that was still fading; data arrived into a
 * reveal that was already visible; a font landed after its sheet had appeared.
 *
 *   exit   the old round fades, and its data is frozen — the swap is *queued*,
 *          not applied, so what fades out is exactly what was on screen
 *   hold   the page is blank. The swap applies, the face loads, the reveal's
 *          data loads, layout settles. Nothing is visible, so nothing can flash
 *   enter  only once everything is verified ready, sections fade in, top to
 *          bottom
 *
 * The invariant this buys: no element is ever visible in a state other than
 * its final one.
 */
type Stage = 'exit' | 'hold' | 'enter'

type Store = {
  /** Date key of the last completed daily, so a finished puzzle stays finished. */
  dailyDone?: string
  dailySolved?: boolean
  /** Legacy counter; kept only so older stored values still parse. */
  streak: number
  /** Remembered so the player isn't re-picking their difficulty every round. */
  answering?: Answering
  /** How deep into the popularity ranking endless draws from. */
  depth?: Depth
}

function readStore(): Store {
  try {
    // Treated as Partial: a value written by an older build may be missing keys.
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return { streak: 0, ...(JSON.parse(raw) as Partial<Store>) }
  } catch {
    // Private browsing or a corrupted value — fall through to defaults.
  }
  return { streak: 0 }
}

export default function App() {
  const [store, setStore] = useState<Store>(readStore)
  const [mode, setMode] = useState<Mode>('daily')

  // A finished daily has to stay finished across a reload, not just across a
  // mode switch — otherwise refreshing the page hands out unlimited attempts at
  // the puzzle everyone is supposed to be sharing.
  const [status, setStatus] = useState<Status>(() => {
    const saved = readStore()
    if (saved.dailyDone !== todayKey()) return 'playing'
    return saved.dailySolved ? 'solved' : 'failed'
  })
  const [guesses, setGuesses] = useState<string[]>([])
  const [shake, setShake] = useState(false)
  const [glow, setGlow] = useState(false)
  /*
    Spoken feedback for a guess.

    Every signal the game gives for right-or-wrong was visual and colour-only: a
    shake, a strikethrough, a green bloom that is aria-hidden, and — for a
    correct answer — the *absence* of the "The answer was" label. A screen
    reader user, or anyone who cannot separate the green, had no way to tell
    whether they had won.
  */
  const [announcement, setAnnouncement] = useState('')
  /*
    Session tally, deliberately not persisted. It answers "how am I doing right
    now", which is a different question from a lifetime record — and a stored
    average only ever gets harder to move, which punishes you for playing more.
    Cleared on reload, like a practice session.
  */
  const [session, setSession] = useState({ rounds: 0, solved: 0 })

  // Starts in 'hold': the first paint is also an intentional arrival, not a
  // page that assembles itself while the fonts trickle in.
  const [stage, setStage] = useState<Stage>('hold')
  /** The reveal's data, loaded during hold so the reveal never fetches for itself. */
  const [roundAbout, setRoundAbout] = useState<AboutEntry | null>(null)
  const pendingSwap = useRef<(() => void) | null>(null)
  const exitTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(exitTimer.current), [])

  const changeRound = useCallback((apply: () => void) => {
    // Re-triggering mid-exit just replaces the queued swap; the timer restarts
    // and the page is inert throughout, so double-clicks cannot interleave.
    pendingSwap.current = apply
    setStage('exit')
    window.clearTimeout(exitTimer.current)
    exitTimer.current = window.setTimeout(() => {
      pendingSwap.current?.()
      pendingSwap.current = null
      setStage('hold')
    }, EXIT_MS)
  }, [])

  // Multiple choice by default: a first-time player who is handed a blank field
  // and 1,225 possible answers has no way in. Four options make the opening
  // round playable, and the toggle is right there for anyone who wants the
  // harder version.
  const answering: Answering = store.answering ?? 'choose'
  const maxGuesses = GUESSES[answering]
  const depth: Depth = store.depth ?? 'Top 100'

  const today = useMemo(() => todayKey(), [])
  const seen = useRef(new Set<string>())

  const [font, setFont] = useState<FontEntry>(() => dailyFont(today))
  const { state: loadState, weightsReady } = useFontLoader(font)

  /*
    Leave 'hold' only when the round can render in its final form: the face is
    genuinely in the font set (checked directly — the hook's state can be stale
    for one commit after a swap), the reveal's data is in memory, and two frames
    have passed so the hidden layout has settled. Until all of that is true the
    page stays blank, which is the entire point: a beat of quiet is calm, while
    content revising itself on screen is a flash.
  */
  useEffect(() => {
    if (stage !== 'hold') return
    if (loadState === 'error') {
      setStage('enter')
      return
    }
    if (!document.fonts.check(`400 72px "${font.family}"`)) return

    let cancelled = false
    let entered = false
    let raf1 = 0
    let raf2 = 0
    let backstop: number | undefined
    const enter = () => {
      if (cancelled || entered) return
      entered = true
      setStage('enter')
    }
    loadAbout(font.family).then((about) => {
      if (cancelled) return
      setRoundAbout(about)
      // Two frames let the hidden layout settle before anything becomes
      // visible. rAF does not run in a backgrounded tab, so a timer backs it
      // up — a player who switches away mid-round-change must still find the
      // page entered when they come back.
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(enter)
      })
      backstop = window.setTimeout(enter, 150)
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      window.clearTimeout(backstop)
    }
  }, [stage, loadState, font.family])

  // Daily shows the same composition for everyone; endless rotates as you go.
  const composition = useMemo(
    () => compositionFor(mode === 'daily' ? dayNumber(today) : seen.current.size),
    [mode, today, font.family],
  )

  useEffect(() => warmAbout(), [])

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store))
    } catch {
      // Non-fatal; the session just won't persist.
    }
  }, [store])

  // Warm the next font's stylesheet while the reveal is being read.
  useEffect(() => {
    if (status === 'playing') return
    prefetchFont(randomFont(depthFor(depth), seen.current).family)
  }, [status, depth])

  const startEndless = useCallback(
    (limit: number) => {
      changeRound(() => {
        const next = randomFont(limit, seen.current)
        seen.current.add(next.family)
        setFont(next)
        setGuesses([])
        setGlow(false)
        setAnnouncement('')
        setStatus('playing')
      })
    },
    [changeRound],
  )

  function switchMode(next: Mode) {
    if (next === mode) return
    // The whole switch is queued into the hidden beat. Applying `setMode`
    // immediately would visibly rewrite the composition text mid-fade, which is
    // exactly the class of flash this machine exists to prevent.
    changeRound(() => {
      setMode(next)
      setGuesses([])
      setGlow(false)
      setAnnouncement('')
      if (next === 'daily') {
        setFont(dailyFont(today))
        setStatus(
          store.dailyDone === today ? (store.dailySolved ? 'solved' : 'failed') : 'playing',
        )
      } else {
        const nf = randomFont(depthFor(depth), seen.current)
        seen.current.add(nf.family)
        setFont(nf)
        setStatus('playing')
      }
    })
  }

  function handleGuess(family: string) {
    if (status !== 'playing') return

    const next = [...guesses, family]
    setGuesses(next)

    if (family === font.family) {
      setStatus('solved')
      setGlow(true)
      setAnnouncement(`Correct. The font is ${font.family}.`)
      if (mode === 'endless') {
        setSession((v) => ({ rounds: v.rounds + 1, solved: v.solved + 1 }))
      }
      setStore((s) => ({
        ...s,
        ...(mode === 'daily' ? { dailyDone: today, dailySolved: true } : {}),
      }))
      return
    }

    // Shake only when the player stays on this specimen. Shaking *and* handing
    // the page to the reveal at the same moment reads as two competing
    // animations rather than one answer landing.
    const spent = next.length >= maxGuesses
    if (!spent) setShake(true)

    const left = maxGuesses - next.length
    setAnnouncement(
      spent
        ? `${family} is wrong. The font was ${font.family}.`
        : `${family} is wrong. ${left} ${left === 1 ? 'guess' : 'guesses'} left.`,
    )

    if (spent) {
      setStatus('failed')
      if (mode === 'endless') setSession((v) => ({ ...v, rounds: v.rounds + 1 }))
      setStore((s) => ({
        ...s,
        ...(mode === 'daily' ? { dailyDone: today, dailySolved: false } : {}),
      }))
    }
  }

  const done = status !== 'playing'
  const remaining = maxGuesses - guesses.length

  return (
    /*
      The mystery face is scoped to the specimen sheet and the reveal, not
      imposed on the page and exempted piecemeal — labels, counters and toggles
      are apparatus, and apparatus should not change shape each round.
    */
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-6 py-8 sm:px-10 sm:py-12 lg:max-w-5xl">
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {glow && <div className="edge-glow" onAnimationEnd={() => setGlow(false)} aria-hidden />}
      <header
        data-pin-id="app-header"
        className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-rule py-4"
      >
        <div className="flex items-baseline gap-3">
          <h1 className="text-[0.9375rem] font-semibold tracking-tight text-ink">Specimen</h1>
          <span className="label hidden sm:inline">
            {mode === 'daily'
              ? `No. ${dayNumber(today)}`
              : `${ALL_FONTS.length.toLocaleString()} faces`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {mode === 'endless' && session.rounds > 0 && (
            <span className="label" title="Solved this session">
              {session.solved}/{session.rounds} correct
            </span>
          )}
          {mode === 'endless' && (
            <div className="flex rounded-full bg-paper-sunk p-0.5" role="group" aria-label="Font pool">
              {DEPTHS.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setStore((s) => ({ ...s, depth: d.label }))}
                  aria-pressed={depth === d.label}
                  className={`min-w-[3.25rem] rounded-full px-2.5 py-1.5 text-center text-xs font-medium whitespace-nowrap transition-colors sm:min-w-[4.25rem] sm:px-3 ${
                    depth === d.label ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}

          <nav className="flex rounded-full bg-paper-sunk p-0.5" aria-label="Game mode">
            {(['daily', 'endless'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                aria-pressed={mode === m}
                className={`min-w-[3.75rem] rounded-full px-3 py-1.5 text-center text-xs font-medium capitalize transition-colors sm:min-w-[4.75rem] sm:px-3.5 ${
                  mode === m ? 'bg-paper text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {m}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/*
        Anchored to the top, never vertically centred: with `justify-center` the
        browser re-centres the whole column whenever content height changes,
        which dragged the headline around. Anchored, it simply cannot move.
      */}
      <main className="flex flex-1 flex-col pt-10 pb-12">
        <div
          data-stage={stage}
          className={`flex flex-1 flex-col ${stage !== 'enter' ? 'pointer-events-none' : ''}`}
        >
          <div
            className={shake ? 'shaking' : undefined}
            onAnimationEnd={(e) => e.target === e.currentTarget && setShake(false)}
          >
            <Specimen
              composition={composition}
              font={font}
              state={loadState}
              weightsReady={weightsReady}
              compact={done}
              answerText={done ? font.family : undefined}
              questionSlot={
                <div data-fade style={{ ['--i' as string]: 4 }} className="mt-14">
                  {answering === 'type' ? (
                    <GuessInput
                      onGuess={handleGuess}
                      disabled={loadState !== 'ready'}
                      used={new Set(guesses)}
                    />
                  ) : (
                    <ChoiceInput
                      answer={font}
                      onGuess={handleGuess}
                      disabled={loadState !== 'ready'}
                      used={new Set(guesses)}
                    />
                  )}

                  <div
                    data-pin-id="guess-meta"
                    className="mt-4 flex min-h-6 flex-wrap items-center justify-between gap-4"
                  >
                    <span className="label">
                      {remaining} {remaining === 1 ? 'guess' : 'guesses'} left
                    </span>

                    <div
                      className="flex rounded-full bg-paper-sunk p-0.5"
                      role="group"
                      aria-label="How to answer"
                    >
                      {(['choose', 'type'] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setStore((v) => ({ ...v, answering: a }))}
                          disabled={guesses.length > 0}
                          aria-pressed={answering === a}
                          className={`min-w-0 rounded-full px-3 py-1 text-center text-xs font-medium whitespace-nowrap transition-colors sm:min-w-[6.5rem] ${
                            answering === a
                              ? 'bg-paper text-ink shadow-sm'
                              : 'text-ink-muted hover:text-ink'
                          } ${guesses.length > 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          {a === 'type' ? 'Type it' : 'Multiple choice'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              }
              answerSlot={
                <div className="mt-14">
                  <Reveal
                    font={font}
                    about={roundAbout}
                    active={done}
                    solved={status === 'solved'}
                    guessCount={guesses.length}
                    nextLabel={mode === 'daily' ? 'Keep playing in Endless Mode' : 'Next font'}
                    onNext={() =>
                      mode === 'daily' ? switchMode('endless') : startEndless(depthFor(depth))
                    }
                  />
                </div>
              }
            />
          </div>
        </div>
      </main>

      <footer className="flex shrink-0 items-center border-t border-rule py-4">
        <p className="text-xs text-ink-faint">
          Type from{' '}
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
          >
            Google Fonts
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
