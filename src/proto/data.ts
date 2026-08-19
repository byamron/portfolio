// Data for the /new home prototype: inline prose links.
// Two kinds of link:
//   - 'case-study' → mini preview morphs into the case-study hero (/new/:id)
//   - 'external'   → opens another site; inline ↗ arrow, native navigation, no morph
// Media reuses the real hover-preview assets from the current site.

export type ProtoMedia =
  | { type: 'video'; src: string }
  | { type: 'image'; src: string }
  | { type: 'lottie'; src: string }
  | { type: 'blank' }

export interface ProtoEntry {
  id: string
  label: string
  kind: 'case-study' | 'external'
  /** Required when kind === 'external'. */
  href?: string
  media: ProtoMedia
  /** Case-study body copy. Empty for external links. */
  body?: string
}

const PLACEHOLDER_BODY =
  'Case study coming soon. This page is a prototype of the new navigation model: the hover preview you clicked morphed into the frame above, the background never changed, and the text crossfaded around it.'

export const protoEntries: ProtoEntry[] = [
  // — External sites (↗) —
  {
    id: 'consensus',
    label: 'Consensus',
    kind: 'external',
    href: 'https://consensus.app/',
    media: { type: 'blank' },
  },
  {
    id: 'mochi-health',
    label: 'Mochi Health',
    kind: 'external',
    href: 'https://joinmochi.com/',
    media: { type: 'video', src: '/images/preview-mochi-health.mp4' },
  },
  {
    id: 'arcade',
    label: 'Arcade',
    kind: 'external',
    href: '/playground',
    media: { type: 'video', src: '/images/preview-font-guesser.mp4' },
  },
  {
    id: 'github',
    label: 'GitHub',
    kind: 'external',
    href: 'https://github.com/byamron',
    media: { type: 'image', src: '/images/preview-github.png' },
  },
  {
    id: 'x',
    label: 'X',
    kind: 'external',
    href: 'https://x.com/benyamron',
    media: { type: 'image', src: '/images/preview-x.png' },
  },

  // — Case studies (morph transition) —
  {
    id: 'flow',
    label: 'Flow',
    kind: 'case-study',
    media: { type: 'video', src: '/images/preview-flow.mp4' },
    body: 'Flow — designing trust into agentic coding. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'distill',
    label: 'Distill',
    kind: 'case-study',
    media: { type: 'video', src: '/images/preview-health-tracker.mp4' },
    body: 'Distill — a health tracker that leads with insight, not dashboards. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'trio',
    label: 'Trio',
    kind: 'case-study',
    media: { type: 'video', src: '/images/preview-todo-priority.mp4' },
    body: 'Trio — a todo list for focus and prioritization. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'ripe',
    label: 'Ripe',
    kind: 'case-study',
    media: { type: 'blank' },
    body: 'Ripe. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'havana',
    label: 'Havana',
    kind: 'case-study',
    media: { type: 'video', src: '/images/preview-language-app.mp4' },
    body: 'Havana — voice-first language practice with personalized feedback. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'uw',
    label: 'UW-IT',
    kind: 'case-study',
    media: { type: 'video', src: '/prototypes/uw-preview.mp4' },
    body: 'University of Washington IT — kickstarting an early-stage design system. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'sony',
    label: 'Sony',
    kind: 'case-study',
    media: { type: 'video', src: '/prototypes/sony-preview.mp4' },
    body: 'Sony — Screenless TV: designing for shared reality. ' + PLACEHOLDER_BODY,
  },
  {
    id: 'cip',
    label: 'Center for an Informed Public',
    kind: 'case-study',
    media: { type: 'lottie', src: '/images/preview-cip.json' },
    body: 'UW Center for an Informed Public — framing election misinformation. ' + PLACEHOLDER_BODY,
  },
]

export const protoBySlug = new Map(protoEntries.map(e => [e.id, e]))
