// Data for the /new home prototype: inline prose links → case study pages.
// Media reuses the real hover-preview assets from the current site.

export type ProtoMedia =
  | { type: 'video'; src: string }
  | { type: 'image'; src: string }
  | { type: 'blank' }

export interface ProtoEntry {
  id: string
  label: string
  /** Absolute or app-external href — navigates natively, no morph transition. */
  external?: string
  media: ProtoMedia
  body: string
}

const PLACEHOLDER_BODY =
  'Case study coming soon. This page is a prototype of the new navigation model: the hover preview you clicked morphed into the frame above, the background never changed, and the text crossfaded around it.'

export const protoEntries: ProtoEntry[] = [
  {
    id: 'consensus',
    label: 'Consensus',
    media: { type: 'blank' },
    body: 'Designing AI for scientific research at Consensus. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'mochi-health',
    label: 'Mochi Health',
    media: { type: 'video', src: '/images/preview-mochi-health.mp4' },
    body: 'Patient experiences and internal tools at Mochi Health. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'flow',
    label: 'Flow',
    media: { type: 'video', src: '/images/preview-flow.mp4' },
    body: 'Flow — a development workflow for working with AI agents. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'distill',
    label: 'Distill',
    media: { type: 'blank' },
    body: 'Distill. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'trio',
    label: 'Trio',
    media: { type: 'blank' },
    body: 'Trio. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'ripe',
    label: 'Ripe',
    media: { type: 'blank' },
    body: 'Ripe. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'havana',
    label: 'Havana',
    media: { type: 'blank' },
    body: 'Havana. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'arcade',
    label: 'Arcade',
    external: '/playground',
    media: { type: 'video', src: '/images/preview-font-guesser.mp4' },
    body: '',
  },
  {
    id: 'github',
    label: 'GitHub',
    external: 'https://github.com/byamron',
    media: { type: 'image', src: '/images/preview-github.png' },
    body: '',
  },
  {
    id: 'x',
    label: 'X',
    external: 'https://x.com/benyamron',
    media: { type: 'image', src: '/images/preview-x.png' },
    body: '',
  },
]

export const protoBySlug = new Map(protoEntries.map(e => [e.id, e]))
