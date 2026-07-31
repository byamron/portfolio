import { useMemo } from 'react'
import { choicesFor, type FontEntry } from '../lib/fonts'

type Props = {
  answer: FontEntry
  onGuess: (family: string) => void
  disabled?: boolean
  used: ReadonlySet<string>
}

/**
 * The four-option round.
 *
 * Options are set in the interface font, never in the mystery face — rendering
 * each candidate in its own type would turn the round into a matching exercise
 * and hand over the answer outright.
 */
export function ChoiceInput({ answer, onGuess, disabled, used }: Props) {
  const options = useMemo(() => choicesFor(answer), [answer])

  return (
    <div
      data-pin-id="guess-choices"
      className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${disabled ? 'pointer-events-none opacity-40' : ''}`}
      role="group"
      aria-label="Choose the font"
    >
      {options.map((font) => {
        const spent = used.has(font.family)
        const correct = font.family === answer.family
        return (
          <button
            key={font.family}
            type="button"
            // aria-disabled rather than disabled: a browser moves focus to the
            // document body when the focused element becomes disabled, which
            // dumped keyboard players back to the top of the page mid-round.
            aria-disabled={spent || undefined}
            disabled={disabled}
            onClick={() => !spent && onGuess(font.family)}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-[1.0625rem] transition-colors ${
              spent && correct
                ? 'border-accent/40 bg-accent-soft text-ink'
                : spent
                  ? 'border-rule text-ink-faint'
                  : 'border-rule bg-paper-sunk text-ink hover:border-ink/30 hover:bg-paper'
            }`}
          >
            <span className={spent && !correct ? 'line-through' : undefined}>{font.family}</span>

            {/*
              A mark, not just a colour. The glyph carries the verdict on its
              own, so it survives a colourblind reader and a greyscale
              screenshot — which the green bloom alone did not.
            */}
            {spent && (
              <span
                aria-hidden
                className={`shrink-0 text-sm ${correct ? 'text-accent' : 'text-ink-faint'}`}
              >
                {correct ? '✓' : '✕'}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
