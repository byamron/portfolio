import { useEffect, useRef } from 'react'
import { FONTS, type FontEntry } from '../lib/fonts'
import { specimenUrl, type AboutEntry } from '../lib/about'

type Props = {
  font: FontEntry
  /**
   * Loaded by App during the round's hidden "hold" phase, never fetched here.
   * The reveal used to load its own data after mounting, which meant facts and
   * prose popped into a section that was already visible — one of the flashes.
   * By the time this renders, the data either exists or is null for good.
   */
  about: AboutEntry | null
  /** True while the reveal is the live layer; drives focus, nothing visual. */
  active: boolean
  solved: boolean
  guessCount: number
  onNext: () => void
  nextLabel: string
}

/**
 * The payoff.
 *
 * This is where the game stops being a quiz and starts being useful. The face
 * names itself in the display line above; this section hands over provenance,
 * the designer, and Google's own notes on the design.
 *
 * It renders in a single pass from data that is already in memory, and it owns
 * no animation — arrival order comes from the shared stagger (data-fade), so
 * this component can never be out of step with the rest of the page.
 */
export function Reveal({ font, about, active, solved, guessCount, onNext, nextLabel }: Props) {
  const nextRef = useRef<HTMLButtonElement>(null)

  // Focus the continue button when the reveal becomes the live layer — with
  // preventScroll, since the browser nudging the page to reach it was once a
  // visible 2px jump. Never on mount: this component is always mounted now.
  useEffect(() => {
    if (active) nextRef.current?.focus({ preventScroll: true })
  }, [active])

  const year = about?.dateAdded?.slice(0, 4)

  return (
    <section
      data-pin-id="reveal"
      // The round is over, so there is no legibility risk to the game and no
      // hint to leak — the spec sheet reading in the face it describes is the
      // point of a specimen.
      style={{ fontFamily: `"${font.family}", ui-sans-serif, system-ui, sans-serif` }}
    >
      {/*
        Only the miss gets a label. A correct answer is announced by the green
        bloom and by the face naming itself in the display line; a line of text
        saying "correct" narrates something the player just watched happen. A
        guess count of zero means the round was restored from storage.
      */}
      {!solved && (
        <p data-fade style={{ ['--i' as string]: 1 }} className="label text-warn">
          {guessCount === 0 ? 'Today’s answer' : 'The answer was'}
        </p>
      )}

      <dl
        data-fade
        style={{ ['--i' as string]: 2 }}
        data-pin-id="reveal-facts"
        className={`columns-1 gap-x-12 sm:columns-2 ${solved ? '' : 'mt-4'}`}
      >
        <Fact label="Designer" value={about?.designers.join(', ') || '—'} />
        <Fact label="Classification" value={font.category} />
        {year && <Fact label="Added" value={year} />}
        <Fact label="Popularity" value={`No. ${font.rank} of ${FONTS.length.toLocaleString()}`} />
        {about?.totalViews != null && (
          <Fact label="Times served" value={compactCount(about.totalViews)} />
        )}
        {about?.weekViews != null && (
          <Fact label="Past week" value={compactCount(about.weekViews)} />
        )}
        {font.variable && <Fact label="Format" value="Variable" />}
      </dl>

      {about && about.about.length > 0 && (
        <div
          data-fade
          style={{ ['--i' as string]: 3 }}
          data-pin-id="reveal-about"
          className="mt-8 max-w-[64ch] space-y-4"
        >
          {about.about.slice(0, 2).map((para, i) => (
            <p key={i} className="text-[0.9375rem] leading-[1.7] text-ink-muted">
              {para}
            </p>
          ))}
        </div>
      )}

      <div
        data-fade
        style={{ ['--i' as string]: 4 }}
        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
      >
        <button
          type="button"
          ref={nextRef}
          onClick={onNext}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85"
        >
          {nextLabel}
        </button>

        <a
          href={specimenUrl(font.family)}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-ink-muted underline decoration-rule underline-offset-4 transition-colors hover:text-ink"
        >
          View in Google Fonts
        </a>
      </div>
    </section>
  )
}

/**
 * Google reports these as raw view counts in the tens of billions, which is a
 * number nobody can hold. Abbreviated, it lands as a sense of scale instead.
 */
function compactCount(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return `${n}`
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4 break-inside-avoid">
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-[0.9375rem] text-ink">{value}</dd>
    </div>
  )
}
