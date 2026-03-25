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
}

export interface Section {
  context: string[] // paragraph(s) before links — supports inline HTML for links
  projects: Project[]
}

export const sections: Section[] = [
  {
    context: [
      'I own product problems\u2009—\u2009from setting direction with leadership to shipping the details. Lately, that means building AI into how my team designs and ships.',
    ],
    projects: [
      { id: 'mochi-billing', title: 'Improving billing UX for our core subscriptions model', projectId: 'cip', href: '/project/mochi-subscriptions', isLink: true, company: 'Mochi Health', year: '2025', caseStudySlug: 'mochi-subscriptions', videoPreview: '/images/preview-mochi-subs.mp4', summary: 'Mochi\u2019s billing and medication fulfillment ran on independent systems\u2009\u2014\u2009patients got charged whether their medication shipped or not. I redesigned subscriptions around event-driven billing, gave patients control over their refill schedule, and cut $200\u2013300k/month in infrastructure costs.' },
      { id: 'mochi-tracker', title: 'Boosting engagement with our in-app weight tracker', projectId: 'mochi-tracker', href: '/project/mochi-progress-tracker', isLink: true, company: 'Mochi Health', year: '2025', caseStudySlug: 'mochi-progress-tracker', videoPreview: '/images/preview-mochi-tracker.mp4', summary: 'Mochi\u2019s progress tracker existed but nobody used it. I drove a 53% increase in weekly active users, then identified its real value\u2009\u2014\u2009a single source of truth for patient weight data\u2009\u2014\u2009and built the integration that made it critical to the clinical workflow.' },
      { id: 'mochi-ai-tooling', title: 'AI tooling to automate internal workflows', projectId: 'mochi-ai', href: '/project/mochi-ai-tooling', isLink: true, company: 'Mochi Health', year: '2026', caseStudySlug: 'mochi-ai-tooling', videoPreview: '/images/preview-mochi-tooling.mp4', summary: 'Mochi\u2019s institutional knowledge lived in individuals\u2019 heads. I built a shared context layer and a Claude Code plugin on top of it\u2009\u2014\u2009composable skills that automate specs, bug triage, database queries, and project management for anyone at the company.' },
    ],
  },
  {
    context: [
      'Outside of work, I\u2019m always building\u2009—\u2009apps, tools, experiments. I try to ship something every day.',
    ],
    projects: [
      { id: 'todo-priority', title: 'A todo list for focus and prioritization', projectId: 'todo', href: '/project/trio-todo-list', isLink: true, company: 'Personal project', year: '2026', caseStudySlug: 'trio-todo-list', videoPreview: '/images/preview-todo-priority.mp4', summary: 'I\u2019ve never had a todo list I actually liked. I designed and built a native iOS/macOS app around one constraint: your active list can only hold three tasks. Add as many as you want to the backlog\u2009\u2014\u2009comparison-based ranking keeps everything prioritized so you never have to decide what\u2019s next.' },
      { id: 'detect-manip', title: 'Detecting manipulative language on the web', projectId: 'detect', href: '', isLink: false, company: 'Personal project', year: '2026', previewDescription: '[COMING SOON]\nMisinformation isn\u2019t always spread by lies. More often, perpetrators use subtle manipulation tactics that can be hard to recognize: fear-mongering, false dichotomies, ad hominem attacks. Inspired by my research on misinformation at the UW, I built a Chrome extension that uses LLMs to identify and explain manipulative language on the web.' },
      // { id: 'ai-search', title: 'New patterns for AI search with personal context', projectId: 'ai-search', href: '', isLink: false },
    ],
  },
  {
    context: [
      'Since I started designing in 2020, I’ve explored challenges across different domains.',
    ],
    projects: [
      { id: 'uw-system', title: 'Building the system that builds the system', projectId: 'uw', href: '/project/uw-design-system', isLink: true, company: 'University of Washington Information Technology', year: '2024', caseStudySlug: 'uw-design-system', videoPreview: '/prototypes/uw-preview.mp4', summary: 'UW-IT wanted a design system but progress had stalled at foundations. I kicked off component design, created role-aware documentation templates, and defined the process for building\u2009\u2014\u2009and actually following\u2009\u2014\u2009the system.' },
      { id: 'sony-screenless', title: 'Screenless TV: Designing for shared reality', projectId: 'sony', href: '/project/sony-screenless-tv', isLink: true, company: 'Sony \u00d7 University of Washington', year: '2024', caseStudySlug: 'sony-screenless-tv', videoPreview: '/prototypes/sony-preview.mp4', summary: 'Master\u2019s capstone for Sony\u2019s TV division. We researched how mixed reality could shape home entertainment\u2009\u2014\u2009and learned that the thing people value most about watching together isn\u2019t the content, it\u2019s the connection.' },
      { id: 'cip-misinfo', title: 'Framing election misinformation', projectId: 'cip', href: '/project/cip-election-misinformation', isLink: true, company: 'UW Center for an Informed Public', year: '2024', caseStudySlug: 'cip-election-misinformation', lottiePreview: '/images/preview-cip.json', summary: 'Qualitative research with Dr. Kate Starbird\u2019s group at UW\u2019s Center for an Informed Public. Contributed to two papers presented at CSCW 2025 on how misleading claims about elections take shape through interactions between factual evidence and distorted political frames.' },
      { id: 'duo-flags', title: 'Making Duolingo\u2019s use of flags more inclusive', projectId: 'duo', href: '/project/duolingo-languages-flags', isLink: true, company: 'Personal project', year: '2022', caseStudySlug: 'duolingo-languages-flags', summary: 'A small subset of flags are often used to represent languages, but their relationship is messy. In this personal project, I redesigned Duolingo\u2019s course selection UI to fix a system that excludes, confuses, and often doesn\u2019t follow its own logic. I also mapped out a scalable path to use even more flags to represent more people.' },
      { id: 'acorn-covid', title: 'Connecting farmers and customers during COVID-19', projectId: 'acorn', href: '/project/acorn-eat-local-vt', isLink: true, company: 'Addison County Relocalization Network', year: '2021', caseStudySlug: 'acorn-eat-local-vt', summary: 'COVID-19 shut down farmers markets across Vermont. I gathered eight engineers, taught myself product design, and shipped a cross-platform app that connected 1,100+ customers to 300+ local farms.' },
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
}

// Flat lookup for ImageDisplay: unique project id → Project
export const projectsById: Record<string, Project> = Object.fromEntries(
  sections.flatMap(s => s.projects).map(p => [p.id, p])
)

// Case study slug → project data (for hero images + summary on case study pages)
export function getProjectForSlug(slug: string): Project | undefined {
  return sections.flatMap(s => s.projects).find(p => p.caseStudySlug === slug)
}

