import type { ReactNode } from 'react'

export type AccentColor = 'table' | 'portrait' | 'sky' | 'pizza'

export interface Project {
  id: string
  title: string
  projectId: string
  href: string
  isLink: boolean
}

export interface ContentSection {
  id: string
  contextParagraphs: ReactNode[]
  projects: Project[]
}

export const sections: ContentSection[] = [
  {
    id: 'mochi',
    contextParagraphs: [
      'I focus on making complex information actionable within products and organizations.',
      <>Currently leading patient experience design at <a href="https://joinmochi.com/" style={{ color: 'var(--text-link)', textDecoration: 'underline', textDecorationColor: 'var(--text-underline)' }}>Mochi Health</a>.</>,
    ],
    projects: [
      { id: 'mochi-funnel', title: 'Building a competitive top of funnel experience', projectId: 'uw', href: '#', isLink: true },
      { id: 'mochi-tracker', title: 'Boosting engagement with our in-app weight tracker', projectId: 'sony', href: '#', isLink: true },
      { id: 'mochi-billing', title: 'Improving billing UX for our core subscriptions model', projectId: 'cip', href: '#', isLink: true },
    ],
  },
  {
    id: 'previous',
    contextParagraphs: [
      'Before Mochi, I helped different teams make sense of information in different contexts.',
    ],
    projects: [
      { id: 'uw-system', title: 'Building a system that builds the system', projectId: 'uw', href: '#', isLink: true },
      { id: 'sony-tv', title: 'Screenless TV: Designing for shared reality', projectId: 'sony', href: '#', isLink: true },
      { id: 'cip-misinfo', title: 'Framing election misinformation (CSCW 2025)', projectId: 'cip', href: '#', isLink: true },
      { id: 'cip-flags', title: 'Languages \u2260 Flags', projectId: 'cip', href: '#', isLink: true },
      { id: 'acorn-covid', title: 'Connecting farmers and customers during COVID-19', projectId: 'acorn', href: '#', isLink: true },
    ],
  },
  {
    id: 'side',
    contextParagraphs: [
      'On the side, I design and build tools that solve my own problems in life and work.',
    ],
    projects: [
      { id: 'todo-list', title: 'A todo list that keeps tasks perfectly prioritized', projectId: 'uw', href: '#', isLink: true },
      { id: 'detect-lang', title: 'Detecting manipulative language on the web', projectId: 'cip', href: '#', isLink: true },
      { id: 'ai-search', title: 'Currently exploring new patterns for AI search with personal context (coming soon)', projectId: 'uw', href: '', isLink: false },
    ],
  },
]

export const defaultPortraitMap: Record<AccentColor, string> = {
  table: '/src/assets/images/portrait-table.jpeg',
  portrait: '/src/assets/images/portrait-portrait.jpeg',
  sky: '/src/assets/images/portrait-sky.jpeg',
  pizza: '/src/assets/images/portrait-pizza.jpeg',
}
