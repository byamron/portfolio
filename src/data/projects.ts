import type { AccentColor } from '@/contexts/ThemeContext'

export interface Project {
  id: string
  title: string
  projectId: string // maps to preview image: "uw" | "sony" | "cip" | "acorn"
  href: string
  isLink: boolean
  caseStudySlug?: string // maps to markdown filename in data/case-studies/
  lottiePreview?: string // optional Lottie JSON path (overrides projectImageMap)
  videoPreview?: string // optional video path (overrides projectImageMap)
  summary?: string // "quick version" from case study, shown below image on hover
}

export interface Section {
  context: string[] // paragraph(s) before links — supports inline HTML for links
  projects: Project[]
}

export const sections: Section[] = [
  {
    context: [
      'I own product problems\u2009—\u2009from setting direction with leadership to shipping the details. These days, I\u2019m deep in AI workflows across design and dev.',
    ],
    projects: [
      { id: 'mochi-tracker', title: 'Boosting engagement with our in-app weight tracker', projectId: 'mochi-tracker', href: '/project/mochi-progress-tracker', isLink: true, caseStudySlug: 'mochi-progress-tracker', summary: 'Mochi\u2019s progress tracker existed but nobody used it. I drove a 53% increase in weekly active users, then identified its real value\u2009\u2014\u2009a single source of truth for patient weight data\u2009\u2014\u2009and built the integration that made it critical to the clinical workflow.' },
      { id: 'mochi-billing', title: 'Improving billing UX for our core subscriptions model', projectId: 'cip', href: '/project/mochi-subscriptions', isLink: true, caseStudySlug: 'mochi-subscriptions', videoPreview: '/images/preview-mochi-subs.mp4', summary: 'Mochi billed its patients for monthly medication whether it shipped or not. I rebuilt subscriptions so billing triggers when an order is processed, gave patients control over their schedule, and eliminated $200\u2013300k/month in infrastructure costs. 90%+ of patients have been successfully migrated.' },
      { id: 'mochi-ai-tooling', title: 'AI tooling to automate internal workflows', projectId: 'uw', href: '/project/mochi-ai-tooling', isLink: true, caseStudySlug: 'mochi-ai-tooling' },
    ],
  },
  {
    context: [
      'Before Mochi, I took on design and research problems across different domains.',
    ],
    projects: [
      { id: 'uw-system', title: 'Building the system that builds the system', projectId: 'uw', href: '/project/uw-design-system', isLink: true, caseStudySlug: 'uw-design-system', summary: 'UW-IT had colors and principles but no components, no documentation, and no process for building either. I designed the first components and the system for how the system gets built.' },
      { id: 'sony-screenless', title: 'Screenless TV: Designing for shared reality', projectId: 'sony', href: '/project/sony-screenless-tv', isLink: true, caseStudySlug: 'sony-screenless-tv', summary: 'Vision concept for Sony\u2019s TV division. My team explored how immersive technology could shape home entertainment\u2009\u2014\u2009and found that the real design challenge wasn\u2019t personalization, it was preserving the shared experience that makes watching together meaningful.' },
      { id: 'cip-misinfo', title: 'Framing election misinformation (CSCW 2025)', projectId: 'cip', href: '/project/cip-election-misinformation', isLink: true, caseStudySlug: 'cip-election-misinformation', lottiePreview: '/images/preview-cip.json' },
      { id: 'duo-flags', title: 'Making Duolingo\u2019s use of flags more inclusive', projectId: 'cip', href: '/project/duolingo-languages-flags', isLink: true, caseStudySlug: 'duolingo-languages-flags', summary: 'Languages don\u2019t map to flags. I redesigned Duolingo\u2019s course selection to fix a system that excludes, confuses, and can\u2019t follow its own logic.' },
      { id: 'acorn-covid', title: 'Connecting farmers and customers during COVID-19', projectId: 'acorn', href: '/project/acorn-eat-local-vt', isLink: true, caseStudySlug: 'acorn-eat-local-vt', summary: 'As a college student with no design experience, I gathered eight engineers and taught myself product design to solve a problem I could see.' },
    ],
  },
  {
    context: [
      'On the side, I design and build tools that solve my own problems in life and work.',
    ],
    projects: [
      { id: 'todo-priority', title: 'A todo list that keeps tasks perfectly prioritized', projectId: 'uw', href: '', isLink: false },
      { id: 'detect-manip', title: 'Detecting manipulative language on the web', projectId: 'cip', href: '', isLink: false },
      { id: 'ai-search', title: 'New patterns for AI search with personal context', projectId: 'uw', href: '', isLink: false },
    ],
  },
]

// projectId → preview image (only 4 unique previews, not 11)
export const projectImageMap: Record<string, string> = {
  uw: '/images/preview-uw.png',
  sony: '/images/preview-sony.gif',
  cip: '/images/preview-cip.jpg',
  acorn: '/images/preview-acorn.png',
  'mochi-tracker': '/images/preview-mochi-tracker.jpg',
}

// accent → default portrait image
export const defaultImageMap: Record<AccentColor, string> = {
  table: '/images/portrait-table.jpeg',
  portrait: '/images/portrait-portrait.jpeg',
  sky: '/images/portrait-sky.jpeg',
  pizza: '/images/portrait-pizza.jpeg',
  vineyard: '/images/portrait-vineyard.jpeg',
}

// Flat lookup for ImageDisplay: unique project id → Project
export const projectsById: Record<string, Project> = Object.fromEntries(
  sections.flatMap(s => s.projects).map(p => [p.id, p])
)

// Case study slug → project data (for hero images + summary on case study pages)
export function getProjectForSlug(slug: string): Project | undefined {
  return sections.flatMap(s => s.projects).find(p => p.caseStudySlug === slug)
}

// Case study slug → markdown filename mapping
export const caseStudySlugs: Record<string, string> = {
  'mochi-ai-tooling': 'mochi-ai-tooling',
  'mochi-progress-tracker': 'mochi-progress-tracker',
  'mochi-subscriptions': 'mochi-subscriptions',
  'uw-design-system': 'uw-design-system',
  'sony-screenless-tv': 'sony-screenless-tv',
  'cip-election-misinformation': 'cip-election-misinformation',
  'duolingo-languages-flags': 'duolingo-languages-flags',
  'acorn-eat-local-vt': 'acorn-eat-local-vt',
}
