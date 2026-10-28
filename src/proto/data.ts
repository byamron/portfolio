// Links on the /new home. One rule: an underline means "this goes somewhere";
// ↗ means it leaves the site. Black text and leading logos are about naming
// (people, places, platforms), never on their own a link affordance.

export interface ProtoEntry {
  id: string
  label: string
  href: string
  /** Leading app-icon logo, rendered inside the link so it's one target. */
  icon?: string
  /** Dark-mode variant of `icon` (e.g. the tile flips from white to #27272A). */
  iconDark?: string
}

export const protoEntries: ProtoEntry[] = [
  { id: 'consensus', label: 'Consensus', href: 'https://consensus.app/', icon: '/images/logo-consensus.svg', iconDark: '/images/logo-consensus-dark.svg' },
  { id: 'mochi-health', label: 'Mochi Health', href: 'https://joinmochi.com/', icon: '/images/logo-mochi.svg' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/byamron' },
  { id: 'x', label: 'X', href: 'https://x.com/benyamron' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/benyamron' },
  { id: 'email', label: 'email', href: 'mailto:ben.yamron@icloud.com' },
]

export const protoBySlug = new Map(protoEntries.map(e => [e.id, e]))

// Line-break variants for the intro (DialKit "Copy"). Tokens: P = portrait,
// N = "Ben Yamron", C = Consensus link. Each inner array is one line.
export type Seg = string | 'P' | 'N' | 'C'
export const COPY_VARIANTS: Record<string, Seg[][]> = {
  // Pauses only at line ends; "product designer" and "AI tools" never split.
  // Measured line lengths (% of the longest) in comments.
  'two · even': [['P', 'N', ' is a product designer currently'], ['building AI for researchers at ', 'C', '.']], // 100 / 98
  'two · AI tools': [['P', 'N', ' is a product designer currently'], ['building AI tools for researchers at ', 'C', '.']], // 91 / 100
  'two · research': [['P', 'N', ' is a product designer currently'], ['building AI for research at ', 'C', '.']], // 100 / 91
  'two · original': [['P', 'N', ' is a product designer,'], ['currently building AI for researchers at ', 'C', '.']], // 67 / 100
  'three · byline': [['P', 'N', ', product designer,'], ['currently building AI tools'], ['for researchers at ', 'C', '.']], // 100 / 79 / 99
  'three · designing tools': [['P', 'N', ' is a product designer'], ['currently designing AI tools'], ['for researchers at ', 'C', '.']], // 100 / 77 / 92
  'three · stair': [['P', 'N'], ['is a product designer building'], ['AI tools for researchers at ', 'C', '.']], // 36 / 72 / 100
  'three · stair, currently': [['P', 'N'], ['is a product designer currently'], ['building AI for researchers at ', 'C', '.']], // 33 / 68 / 100
}

/** Phone breaks (≤640px) per copy variant — designed, not left to the
 *  browser: five even lines at a larger size instead of a ragged 26px wrap.
 *  Variants without one fall back to browser-balanced wrapping. */
export const PHONE_BREAKS: Record<string, Seg[][]> = {
  'two · even': [['P', 'N', ' is'], ['a product designer'], ['currently building'], ['AI for researchers'], ['at ', 'C', '.']], // 91/100/99/95/95
  'three · byline': [['P', 'N', ','], ['product designer,'], ['currently building'], ['AI tools for researchers'], ['at ', 'C', '.']], // 67/76/80/100/76
  'three · stair': [['P', 'N', ' is'], ['a product designer'], ['building AI tools'], ['for researchers'], ['at ', 'C', '.']], // 91/100/90/81/95
}

/** Size × line-count presets (DialKit "Text preset", or ?preset=… in the URL
 *  so they can be compared on a phone / prod build). `size` is the target
 *  type size in px; the fit still shrinks it if the longest line won't fit. */
export const TEXT_PRESETS: Record<string, { copy: string; size: number }> = {
  '2 lines · S': { copy: 'two · even', size: 34 },
  '2 lines · M': { copy: 'two · even', size: 46 },
  '2 lines · L': { copy: 'two · even', size: 58 },
  '3 lines · byline · S': { copy: 'three · byline', size: 38 },
  '3 lines · byline · M': { copy: 'three · byline', size: 50 },
  '3 lines · byline · L': { copy: 'three · byline', size: 62 },
  '3 lines · stair · S': { copy: 'three · stair', size: 34 },
  '3 lines · stair · M': { copy: 'three · stair', size: 42 },
  '3 lines · stair · L': { copy: 'three · stair', size: 50 },
}

