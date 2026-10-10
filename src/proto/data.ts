// Links on the /new home. One rule: an underline means "this goes somewhere";
// ↗ means it leaves the site. Black text and leading logos are about naming
// (people, places, platforms), never on their own a link affordance.

export interface ProtoEntry {
  id: string
  label: string
  href: string
  /** Leading app-icon logo, rendered inside the link so it's one target. */
  icon?: string
}

export const protoEntries: ProtoEntry[] = [
  { id: 'consensus', label: 'Consensus', href: 'https://consensus.app/', icon: '/images/logo-consensus.svg' },
  { id: 'mochi-health', label: 'Mochi Health', href: 'https://joinmochi.com/', icon: '/images/logo-mochi.svg' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/byamron' },
  { id: 'x', label: 'X', href: 'https://x.com/benyamron' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/benyamron' },
  { id: 'email', label: 'email', href: 'mailto:ben.yamron@icloud.com' },
]

export const protoBySlug = new Map(protoEntries.map(e => [e.id, e]))
