import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FONTS, type FontEntry } from '../lib/fonts'

const MAX_RESULTS = 7

/**
 * Ranks candidates for a query. Prefix matches beat word-start matches, which
 * beat plain substrings; ties break toward the more popular face, since that is
 * overwhelmingly the one being reached for.
 */
function search(query: string): FontEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const scored: { font: FontEntry; score: number }[] = []

  for (const font of FONTS) {
    const name = font.family.toLowerCase()
    let score = -1

    if (name === q) score = 0
    else if (name.startsWith(q)) score = 1
    else if (name.split(' ').some((word) => word.startsWith(q))) score = 2
    else if (name.includes(q)) score = 3

    if (score >= 0) scored.push({ font, score })
  }

  return scored
    .sort((a, b) => a.score - b.score || a.font.rank - b.font.rank)
    .slice(0, MAX_RESULTS)
    .map((s) => s.font)
}

type Props = {
  onGuess: (family: string) => void
  disabled?: boolean
  /** Families already guessed this round, shown struck through rather than hidden. */
  used: ReadonlySet<string>
}

export function GuessInput({ onGuess, disabled, used }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = 'font-suggestions'

  const results = useMemo(() => search(query), [query])
  const open = results.length > 0 && !disabled

  useEffect(() => setActive(0), [query])

  // The input is the only thing to do on this screen, so it should always be live.
  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  function commit(font: FontEntry) {
    if (used.has(font.family)) return
    onGuess(font.family)
    setQuery('')
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commit(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setQuery('')
    }
  }

  return (
    <div className="relative">
      {/*
        Read as a field, not as more page content.

        An underline-only input sitting under a full type specimen reads as one
        more line of the sheet — the eye has no reason to treat it as somewhere
        to put something. A recessed well, a hairline border, a search mark and
        a UI-scaled type size are the smallest set of signals that say "input"
        without importing a chunky form control into a page of typography.
      */}
      <div
        className={`flex items-center gap-3 rounded-xl border bg-paper-sunk px-4 transition-colors ${
          disabled ? 'opacity-40' : ''
        } ${open ? 'border-ink/25' : 'border-rule'} focus-within:border-ink/40 focus-within:bg-paper`}
      >
        <svg
          viewBox="0 0 16 16"
          className="size-4 shrink-0 text-ink-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5 14 14" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="Name the font…"
          data-pin-id="guess-input"
          aria-label="Guess the font"
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-expanded={open}
          // Without this, arrowing through the list is silent — `active` only
          // drove a background colour. Options must also not contain focusable
          // children, so each row is now the option itself, not a button inside
          // one.
          aria-activedescendant={open ? `${listId}-${active}` : undefined}
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent py-3.5 text-[1.0625rem] text-ink caret-accent outline-none placeholder:text-ink-faint"
        />

        {query && (
          <kbd className="label shrink-0 border-none" aria-hidden>
            ↵
          </kbd>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-rule bg-paper shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)]"
          >
            {results.map((font, i) => {
              const spent = used.has(font.family)
              return (
                <li
                  key={font.family}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  aria-disabled={spent || undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(font)}
                  className={`flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2.5 transition-colors ${
                    i === active && !spent ? 'bg-paper-sunk' : ''
                  } ${spent ? 'cursor-default opacity-35' : ''}`}
                >
                  <span className={`text-[0.9375rem] text-ink ${spent ? 'line-through' : ''}`}>
                    {font.family}
                  </span>
                  <span className="label shrink-0">{font.category}</span>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
