// Data for the /new home prototype: inline prose links.
// Entries with `href` open another site (inline ↗, native navigation, no morph);
// the rest are case studies at /new/:id whose hover preview morphs into the hero.
// Media reuses the real hover-preview assets from the current site.

export type ProtoMedia =
  | { type: 'video'; src: string }
  | { type: 'image'; src: string }
  | { type: 'lottie'; src: string }
  | { type: 'blank' }

export interface ProtoEntry {
  id: string
  label: string
  /** External site URL. Absent = case study. */
  href?: string
  media: ProtoMedia
  /** Intrinsic media aspect ratio (w/h) — the mini preview matches it exactly. */
  aspect: number
  /** One-line case-study blurb (placeholder body is appended at render time). */
  blurb?: string
}

export const protoEntries: ProtoEntry[] = [
  // — External sites (↗) —
  { id: 'consensus', label: 'Consensus', href: 'https://consensus.app/', media: { type: 'blank' }, aspect: 1.6 },
  { id: 'mochi-health', label: 'Mochi Health', href: 'https://joinmochi.com/', media: { type: 'video', src: '/images/preview-mochi-health.mp4' }, aspect: 1.333 },
  { id: 'arcade', label: 'Arcade', href: '/playground', media: { type: 'video', src: '/images/preview-font-guesser.mp4' }, aspect: 1.333 },
  { id: 'github', label: 'GitHub', href: 'https://github.com/byamron', media: { type: 'image', src: '/images/preview-github.png' }, aspect: 1.602 },
  { id: 'x', label: 'X', href: 'https://x.com/benyamron', media: { type: 'image', src: '/images/preview-x.png' }, aspect: 1.602 },

  // — Case studies (morph transition) —
  { id: 'flow', label: 'Flow', media: { type: 'video', src: '/images/preview-flow.mp4' }, aspect: 1.333, blurb: 'Flow — designing trust into agentic coding.' },
  { id: 'distill', label: 'Distill', media: { type: 'video', src: '/images/preview-health-tracker.mp4' }, aspect: 0.75, blurb: 'Distill — a health tracker that leads with insight, not dashboards.' },
  { id: 'trio', label: 'Trio', media: { type: 'video', src: '/images/preview-todo-priority.mp4' }, aspect: 0.75, blurb: 'Trio — a todo list for focus and prioritization.' },
  { id: 'ripe', label: 'Ripe', media: { type: 'blank' }, aspect: 1.6, blurb: 'Ripe.' },
  { id: 'havana', label: 'Havana', media: { type: 'video', src: '/images/preview-language-app.mp4' }, aspect: 0.75, blurb: 'Havana — voice-first language practice with personalized feedback.' },
  { id: 'uw', label: 'UW-IT', media: { type: 'video', src: '/prototypes/uw-preview.mp4' }, aspect: 1.333, blurb: 'University of Washington IT — kickstarting an early-stage design system.' },
  { id: 'sony', label: 'Sony', media: { type: 'video', src: '/prototypes/sony-preview.mp4' }, aspect: 1.778, blurb: 'Sony — Screenless TV: designing for shared reality.' },
  { id: 'cip', label: 'Center for an Informed Public', media: { type: 'lottie', src: '/images/preview-cip.json' }, aspect: 0.733, blurb: 'UW Center for an Informed Public — framing election misinformation.' },
]

export const protoBySlug = new Map(protoEntries.map(e => [e.id, e]))
