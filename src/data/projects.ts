import type { AccentColor } from '@/contexts/ThemeContext'

export interface Project {
  id: string
  title: string
  projectId: string // maps to preview image: "uw" | "sony" | "cip" | "acorn"
  href: string
  isLink: boolean
  company?: string // e.g. "Mochi Health", "Personal project"
  year?: string // e.g. "2025", "2020"
  caseStudySlug?: string // maps to markdown filename in data/case-studies/
  lottiePreview?: string // optional Lottie JSON path (overrides projectImageMap)
  videoPreview?: string // optional video path (overrides projectImageMap)
  summary?: string // "quick version" from case study, shown below image on hover
  previewDescription?: string // text-only preview shown centered in the image area on hover (no media)
  status?: string // e.g. 'In progress', 'In TestFlight' — shown as dot + label on the card
}

export interface Section {
  label?: string // short uppercase label (e.g. "Work", "Building", "Earlier")
  context: string[] // paragraph(s) before links — supports inline HTML for links
  projects: Project[]
}

export const sections: Section[] = [
  {
    label: '',
    context: [
      'I own product problems\u2009—\u2009from setting direction to shipping the details. Right now I\u2019m deep in AI tooling\u2009—\u2009designing it for my team and using it to ship my own apps.',
    ],
    projects: [
      { id: 'mochi-ai-tooling', title: 'AI tooling to automate internal workflows', projectId: 'mochi-ai', href: '/project/mochi-ai-tooling', isLink: true, company: 'Mochi Health', year: '2026', caseStudySlug: 'mochi-ai-tooling', videoPreview: '/images/preview-mochi-tooling.mp4', summary: 'AI tools are only as good as the context they have. I built a documentation layer and a Claude Code plugin that gives anyone at the company an AI assistant that actually knows the product.' },
      { id: 'mochi-billing', title: 'Improving billing UX for our core subscriptions model', projectId: 'cip', href: '/project/mochi-subscriptions', isLink: true, company: 'Mochi Health', year: '2025', caseStudySlug: 'mochi-subscriptions', videoPreview: '/images/preview-mochi-subs.mp4', summary: 'Billing and fulfillment were two independent systems\u2009\u2014\u2009patients got charged whether their medication shipped or not. I worked with two engineers to rebuild billing scheduling logic from scratch so charges only trigger on shipment. Eliminated $200\u2013300k/month in payment processing overhead; 90%+ of users migrated.' },
      { id: 'mochi-tracker', title: 'Boosting engagement with our in-app weight tracker', projectId: 'mochi-tracker', href: '/project/mochi-progress-tracker', isLink: true, company: 'Mochi Health', year: '2025', caseStudySlug: 'mochi-progress-tracker', videoPreview: '/images/preview-mochi-tracker.mp4', summary: 'Mochi tracked weight in two places that didn\u2019t talk to each other. I unified them\u2009\u2014\u2009provider-recorded weights now appear automatically in the patient\u2019s tracker. Separately, I redesigned the tracker with mobile support: 53% increase in weekly active users within two weeks.' },
    ],
  },
  {
    label: 'Building tools on the side',
    context: [],
    projects: [
      { id: 'forge', title: 'Optimizing your AI development workflow', projectId: 'forge', href: '/project/forge', isLink: true, company: 'Personal project', year: '2026', caseStudySlug: 'forge', videoPreview: '/images/preview-forge.mp4', status: 'In progress', summary: 'Claude Code\u2019s configuration infrastructure is powerful, but keeping it optimized is real work. Forge watches your sessions, detects patterns, and proposes improvements\u2009\u2014\u2009rules, hooks, skills, scoped artifacts. Everything is a proposal you review. Nothing auto-applies.' },
      { id: 'language-app', title: 'Voice-first language practice with personalized feedback', projectId: 'language-app', href: '', isLink: false, company: 'Personal project', year: '2026', status: 'In progress', previewDescription: '[IN PROGRESS]\nMost language apps teach you to tap and swipe\u2009\u2014\u2009not speak. I\u2019m building a native iOS app with two modes: real-time voice conversations powered by native audio models, and an async feed of corrections generated from things you actually said. Practice speaking when you can, consume personalized feedback when you can\u2019t.' },
      { id: 'detect-manip', title: 'Detecting manipulative language on the web', projectId: 'detect', href: '', isLink: false, company: 'Personal project', year: '2026', status: 'In progress', previewDescription: '[IN PROGRESS]\nI\u2019m building a Chrome extension that uses LLMs to identify and explain manipulative language on the web\u2009\u2014\u2009fear-mongering, false dichotomies, ad hominem attacks. The subtle tactics that are hardest to recognize. Inspired by my research on misinformation at UW.' },
      { id: 'todo-priority', title: 'A todo list for focus and prioritization', projectId: 'todo', href: '/project/trio-todo-list', isLink: true, company: 'Personal project', year: '2026', caseStudySlug: 'trio-todo-list', videoPreview: '/images/preview-todo-priority.mp4', summary: 'Most todo apps give you a list and leave the rest to you. I built one that maintains itself\u2009\u2014\u2009every task gets ranked through pairwise comparisons, and your active list can only hold three at a time. Finish one, pull the next.', status: 'In progress' },
    ],
  },
  {
    label: 'Earlier work',
    context: [],
    projects: [
      { id: 'sony-screenless', title: 'Screenless TV: Designing for shared reality', projectId: 'sony', href: '/project/sony-screenless-tv', isLink: true, company: 'Sony \u00d7 University of Washington', year: '2024', caseStudySlug: 'sony-screenless-tv', videoPreview: '/prototypes/sony-preview.mp4', summary: 'People watch TV together for connection, not just content. For my master\u2019s capstone at UW, I led design on a speculative project for Sony\u2019s TV division\u2009\u2014\u2009a volumetric display with angle-specific imagery and directional audio. Personalization without isolation.' },
      { id: 'cip-misinfo', title: 'Framing election misinformation', projectId: 'cip', href: '/project/cip-election-misinformation', isLink: true, company: 'UW Center for an Informed Public', year: '2024', caseStudySlug: 'cip-election-misinformation', lottiePreview: '/images/preview-cip.json', summary: 'Working with Dr. Kate Starbird\u2019s research group at UW\u2019s Center for an Informed Public, I analyzed how election misinformation spreads through framing, not fabrication. I helped build a framework mapping how identical evidence gets assembled into opposing claims. Two papers presented at CSCW 2025.' },
      { id: 'uw-system', title: 'Building the system that builds the system', projectId: 'uw', href: '/project/uw-design-system', isLink: true, company: 'University of Washington Information Technology', year: '2024', caseStudySlug: 'uw-design-system', videoPreview: '/prototypes/uw-preview.mp4', summary: 'UW-IT\u2019s design system existed only as colors and principles. I designed the first three components and\u2009\u2014\u2009more importantly\u2009\u2014\u2009the process and documentation structure for everything that would follow.' },
      { id: 'duo-flags', title: 'Making Duolingo\u2019s use of flags more inclusive', projectId: 'duo', href: '/project/duolingo-languages-flags', isLink: true, company: 'Personal project', year: '2022', caseStudySlug: 'duolingo-languages-flags', summary: 'Duolingo represents every language with a flag, but the mapping can\u2019t follow logic because no logic exists. Replace flags with ISO-639 language codes in course selection; repurpose flags everywhere else to highlight the cultural diversity the current system erases.' },
      { id: 'acorn-covid', title: 'Connecting farmers and customers during COVID-19', projectId: 'acorn', href: '/project/eat-local-vt', isLink: true, company: 'Addison County Relocalization Network', year: '2021', caseStudySlug: 'eat-local-vt', summary: 'First app I ever shipped. Taught myself product design as a college student, gathered a team of eight, and built a cross-platform app connecting Vermont customers to local farms after COVID shut down farmers markets. 300+ farms, 1,100+ downloads.' },
    ],
  },
]

// projectId → preview image (only static-image projects; video/lottie projects are handled separately)
export const projectImageMap: Record<string, string> = {
  acorn: '/images/preview-acorn.png',
  duo: '/images/preview-duo.png',
}

// accent → default portrait image
export const defaultImageMap: Record<AccentColor, string> = {
  table: '/images/portrait-table.jpeg',
  portrait: '/images/portrait-portrait.jpeg',
  sky: '/images/portrait-sky.jpeg',
  pizza: '/images/portrait-pizza.jpeg',
  vineyard: '/images/portrait-vineyard.jpeg',
}

// Non-project link previews (resume, LinkedIn, email, Mochi Health)
export interface LinkPreview {
  id: string
  image?: string
  video?: string
  alt: string
  backgroundColor: string // edge color so contain-mode padding blends seamlessly
  summary?: string
}

export const linkPreviews: Record<string, LinkPreview> = {
  resume: {
    id: 'resume',
    image: '/images/preview-resume.png',
    alt: 'Ben Yamron resume',
    backgroundColor: '#ffffff',
  },
  mochi: {
    id: 'mochi',
    video: '/images/preview-mochi-health.mp4',
    alt: 'Mochi Health website',
    backgroundColor: '#2b2ba0',
  },
  email: {
    id: 'email',
    video: '/images/preview-email.mp4',
    alt: 'Email Ben Yamron',
    backgroundColor: '#282828',
  },
  linkedin: {
    id: 'linkedin',
    image: '/images/preview-linkedin.png',
    alt: 'Ben Yamron LinkedIn profile',
    backgroundColor: '#ffffff',
  },
  x: {
    id: 'x',
    image: '/images/preview-x.png',
    alt: 'Ben Yamron on X',
    backgroundColor: '#000000',
  },
  github: {
    id: 'github',
    image: '/images/preview-github.png',
    alt: 'Ben Yamron on GitHub',
    backgroundColor: '#0d1117',
  },
}

// Flat lookup for ImageDisplay: unique project id → Project
export const projectsById: Record<string, Project> = Object.fromEntries(
  sections.flatMap(s => s.projects).map(p => [p.id, p])
)

// Case study slug → project data (for hero images + summary on case study pages)
export function getProjectForSlug(slug: string): Project | undefined {
  return sections.flatMap(s => s.projects).find(p => p.caseStudySlug === slug)
}

