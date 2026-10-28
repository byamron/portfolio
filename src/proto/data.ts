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
  // Pauses only at line ends (Ben). Measured line lengths, % of the longest.
  // Two lines
  'two · even (no comma)': [['P', 'N', ' is a product designer currently'], ['building AI for researchers at ', 'C', '.']], // 100 / 98
  'two · research': [['P', 'N', ' is a product designer currently'], ['building AI for research at ', 'C', '.']], // 100 / 91
  'two · no "currently"': [['P', 'N', ' is a product designer building'], ['AI for researchers at ', 'C', '.']], // 100 / 80
  'two · original': [['P', 'N', ' is a product designer,'], ['currently building AI for researchers at ', 'C', '.']], // 66 / 100
  // Three lines
  'three · gentle stair': [['P', 'N', ' is a product'], ['designer currently building AI'], ['for researchers at ', 'C', '.']], // 81 / 91 / 100
  'three · name first': [['P', 'N'], ['is a product designer currently'], ['building AI for researchers at ', 'C', '.']], // 33 / 68 / 100
  'three · steep stair': [['P', 'N', ' is a'], ['product designer currently'], ['building AI for researchers at ', 'C', '.']], // 41 / 60 / 100
  'three · pause, then tail': [['P', 'N', ' is a product designer,'], ['currently building AI for researchers'], ['at ', 'C', '.']], // 100 / 100 / 48
}

