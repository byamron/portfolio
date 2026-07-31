import rawIndex from '../data/font-index.json'

export type FontEntry = {
  family: string
  category: string
  /** 1-based popularity rank across the whole Latin pool. Lower is better known. */
  rank: number
  variable: boolean
  /** Roman weights this family actually ships, ascending. Never empty. */
  weights: number[]
  /** [min, max] when the family is variable on weight — one file covers the range. */
  wghtAxis: [number, number] | null
}

export const FONTS = rawIndex as FontEntry[]

export const BY_FAMILY = new Map(FONTS.map((f) => [f.family, f]))

/**
 * Difficulty is expressed purely as how deep into the popularity ranking we are
 * willing to draw from. It is the only dimension that honestly scales — a face
 * is hard to name because few people have seen it, not because of anything
 * intrinsic to the design.
 *
 * Chosen explicitly by the player rather than ramped off a hidden streak. A
 * difficulty that moves on its own, driven by a counter that is shown nowhere,
 * is a difficulty nobody can reason about.
 */
export const DEPTHS = [
  { label: 'Top 100', depth: 100 },
  { label: 'Top 500', depth: 500 },
  { label: 'All', depth: Number.MAX_SAFE_INTEGER },
] as const

export type Depth = (typeof DEPTHS)[number]['label']

export function depthFor(label: Depth): number {
  return DEPTHS.find((d) => d.label === label)?.depth ?? 100
}

/**
 * The daily draws from a fixed, moderate depth. Everyone gets the same puzzle,
 * so it has to be winnable by a reasonably well-read designer rather than
 * scaling to any one player's streak.
 */
const DAILY_DEPTH = 250

/** Deterministic 32-bit hash, so a given date always yields the same font. */
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Local calendar date as YYYY-MM-DD — the daily rolls over at the player's midnight. */
export function todayKey(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Day one. The puzzle serial in the header counts from here, so this must be
 * the date the game actually goes live — set it to launch day and the first
 * player sees "No. 1". Any earlier date silently claims a history the game
 * doesn't have.
 */
const EPOCH = Date.UTC(2026, 6, 28)
export function dayNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return Math.floor((Date.UTC(y, m - 1, d) - EPOCH) / 86_400_000) + 1
}

export function dailyFont(dateKey: string): FontEntry {
  const pool = FONTS.slice(0, DAILY_DEPTH)
  return pool[hash(`specimen:${dateKey}`) % pool.length]
}

/** Endless draw from the chosen pool depth, excluding anything already seen. */
export function randomFont(limit: number, exclude: ReadonlySet<string>): FontEntry {
  const within = FONTS.slice(0, limit)
  const unseen = within.filter((f) => !exclude.has(f.family))
  const source = unseen.length > 0 ? unseen : within
  return source[Math.floor(Math.random() * source.length)]
}

/** Deterministic 0–1 generator, so a round's options never reshuffle on re-render. */
function lcg(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

/**
 * The answer plus three decoys, for multiple-choice rounds.
 *
 * Distractors are drawn from the same category and the nearest slice of the
 * popularity ranking, so the four options are genuinely confusable. Padding a
 * grotesque out with three scripts would make the mode a formality rather than
 * an easier way to play.
 *
 * Seeded by the answer, which keeps the options stable across re-renders and
 * means everyone sees the same four on a given daily.
 */
export function choicesFor(answer: FontEntry, count = 4): FontEntry[] {
  const sameCategory = FONTS.filter(
    (f) => f.family !== answer.family && f.category === answer.category,
  ).sort((a, b) => Math.abs(a.rank - answer.rank) - Math.abs(b.rank - answer.rank))

  // Fall back to the whole pool for categories too small to fill the slate.
  const near = (sameCategory.length >= count ? sameCategory : FONTS.filter((f) => f.family !== answer.family)).slice(0, 30)

  const rand = lcg(hash(`choices:${answer.family}`))
  const picked: FontEntry[] = []
  const used = new Set<number>()

  while (picked.length < count - 1 && used.size < near.length) {
    const i = Math.floor(rand() * near.length)
    if (used.has(i)) continue
    used.add(i)
    picked.push(near[i])
  }

  const slate = [answer, ...picked]
  for (let i = slate.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[slate[i], slate[j]] = [slate[j], slate[i]]
  }
  return slate
}
