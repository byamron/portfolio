// Data for the /new home prototype — MVP ship.
// Only entries with real external destinations.

export type ProtoMedia =
  | { type: 'video'; src: string }
  | { type: 'image'; src: string }
  | { type: 'lottie'; src: string }
  | { type: 'blank' }

export interface ProtoEntry {
  id: string
  label: string
  /** External site URL. */
  href: string
  media: ProtoMedia
  aspect: number
}

export const protoEntries: ProtoEntry[] = [
  { id: 'consensus', label: 'Consensus', href: 'https://consensus.app/', media: { type: 'blank' }, aspect: 1.6 },
  { id: 'mochi-health', label: 'Mochi Health', href: 'https://joinmochi.com/', media: { type: 'video', src: '/images/preview-mochi-health.mp4' }, aspect: 1.333 },
  { id: 'github', label: 'GitHub', href: 'https://github.com/byamron', media: { type: 'image', src: '/images/preview-github.png' }, aspect: 1.602 },
  { id: 'x', label: 'X', href: 'https://x.com/benyamron', media: { type: 'image', src: '/images/preview-x.png' }, aspect: 1.602 },
]

export const protoBySlug = new Map(protoEntries.map(e => [e.id, e]))
