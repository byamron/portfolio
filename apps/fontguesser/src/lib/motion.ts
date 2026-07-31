/**
 * The motion scale. One source for CSS and Framer both.
 *
 * The codebase had grown eighteen durations, eleven delays and nine easing
 * curves for four animated moments. Each value was individually defensible and
 * locally reasoned, which is exactly how it happened — but 380 against 400
 * against 420 is not a scale, and a viewer who cannot perceive the difference
 * between them can absolutely perceive that six things on screen are slightly
 * out of phase. That is what "not quite crisp" feels like.
 *
 * Four durations, one stagger unit, two curves.
 */

export const D = {
  /** Hover, colour, small state changes. */
  fast: 120,
  /** Exits, dropdowns, the between-rounds clear. */
  quick: 200,
  /** The standard arrival: collapses, reels, blocks appearing. */
  base: 300,
  /** The fold-down read as a whole. */
  slow: 480,
} as const

/** The only stagger unit. Below the ~60–80ms sequencing threshold, so a group still reads as one event. */
export const STAGGER = 60

/** Everything that appears or settles. */
export const EASE_ARRIVE = [0.16, 1, 0.3, 1] as const
/** Everything that leaves. */
export const EASE_LEAVE = [0.4, 0, 1, 1] as const
