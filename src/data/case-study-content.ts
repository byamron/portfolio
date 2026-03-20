export interface CaseStudyVisual {
  id: string
  caption: string
}

export interface CaseStudySection {
  id: string
  heading: string
  paragraphs: string[]
  visual: CaseStudyVisual | null
}

export interface GalleryItem {
  id: string
  caption?: string
  /** 'full' spans the page width; 'half' sits in a 2-up grid */
  size: 'full' | 'half'
}

export interface CaseStudy {
  id: string
  title: string
  subtitle: string
  timeline: string
  heroVisual?: CaseStudyVisual
  sections: CaseStudySection[]
  gallery: GalleryItem[]
}

export const mochiAiTooling: CaseStudy = {
  id: 'mochi-ai-tooling',
  title: 'AI tooling to automate internal workflows',
  subtitle: 'Content coming soon.',
  timeline: '',
  sections: [],
  gallery: [],
}

export const mochiProgressTracker: CaseStudy = {
  id: 'mochi-progress-tracker',
  title: 'Empowering weight loss through progress tracking',
  subtitle:
    'Mochi\u2019s progress tracker existed but nobody used it. I drove a 53% increase in weekly active users, then identified its real value \u2014 a single source of truth for patient weight data \u2014 and built the integration that made it critical to the clinical workflow.',
  timeline: 'Q3 2025 \u2013 Q1 2026',
  sections: [
    {
      id: 'tracker-problem',
      heading: 'Only 30% of patients had ever used our progress tracker',
      paragraphs: [
        'Patients tracked weight loss in third-party apps instead. The company wanted to invest but couldn\u2019t justify it \u2014 no connection to revenue. The design reflected the neglect: unclear data visualization, no mobile support, rigid logging that forced all metrics at once.',
      ],
      visual: null,
    },
    {
      id: 'visual-refresh',
      heading: 'A visual refresh and mobile support drove a 53% increase in weekly active users',
      paragraphs: [
        'I redesigned the tracker with the new design system, added mobile support, separated logging entry points, and cleaned up the weight graph. 53% increase in weekly active users and 57% increase in logging frequency within two weeks.',
      ],
      visual: {
        id: 'tracker-before-after',
        caption: 'Before/after of the tracker UI \u2014 the contrast should be immediately obvious.',
      },
    },
    {
      id: 'data-unification',
      heading: 'The tracker\u2019s real value was as a data conduit, not a feature',
      paragraphs: [
        'Mochi had two separate systems tracking patient weight \u2014 one for patients, one for providers \u2014 and neither talked to the other. I unified them so health check data automatically populates the progress tracker. Patients get a filled-out history without extra effort; providers get the timestamped data they need to approve refills. The feature nobody would invest in is now infrastructure they can\u2019t operate without.',
      ],
      visual: {
        id: 'data-flow-diagram',
        caption: 'Data flow diagram \u2014 old state vs. new state showing unified data routing.',
      },
    },
  ],
  gallery: [],
}

export const mochiSubscriptions: CaseStudy = {
  id: 'mochi-subscriptions',
  title: 'Redesigning Mochi\u2019s medication subscription experience',
  subtitle:
    'Mochi billed its patients for monthly medication whether it shipped or not. I rebuilt subscriptions so billing triggers when an order is processed, gave patients control over their schedule, and eliminated $200\u2013300k/month in infrastructure costs. 90%+ of patients have been successfully migrated.',
  timeline: 'Q3 2025 \u2013 Q1 2026',
  heroVisual: {
    id: 'hero-mochi',
    caption: 'Mochi subscription management dashboard overview.',
  },
  sections: [
    {
      id: 'billing-problem',
      heading:
        'Billing and fulfillment were two independent systems \u2014 patients paid the price',
      paragraphs: [
        'Mochi\u2019s billing ran on Stripe\u2019s monthly automation, but medication delivery depended on a multi-step refill process. When anything deviated \u2014 a missed step, a pharmacy delay, a supply issue \u2014 charges kept going while medication didn\u2019t. A pharmacy shutdown made it impossible to ignore: patients went months without medication while charges continued, fraud claims spiked, and churn accelerated.',
      ],
      visual: {
        id: 'billing-diagram',
        caption:
          'Before/after system diagram showing independent billing vs. event-driven model.',
      },
    },
    {
      id: 'event-driven-billing',
      heading:
        'I replaced calendar-based billing with event-driven logic tied to fulfillment',
      paragraphs: [
        'Patients only pay when medication is on its way. I defined the timing rules, states, edge cases, and billing triggers that engineering built to spec. This also eliminated $200\u2013300k/month in Stripe scheduling costs. Over 90% of users have migrated.',
      ],
      visual: null,
    },
    {
      id: 'timing-problem',
      heading:
        'Provider denial rates spiked 3x \u2014 a timing problem, not a data problem',
      paragraphs: [
        'Removing required health checks caused providers to deny refills they couldn\u2019t confidently approve. The intuitive fix \u2014 prompting patients \u2014 didn\u2019t work because providers reviewed refills before patients could respond. I moved data collection 14 days upstream so the data is already there when providers see the request.',
      ],
      visual: {
        id: 'timing-diagram',
        caption:
          'Timing diagram showing the race condition between provider review and patient prompts.',
      },
    },
    {
      id: 'delay-feature',
      heading:
        'Over 20% of subscription churn was preventable \u2014 patients just wanted a break',
      paragraphs: [
        'Rigid 28-day cycles meant patients who wanted a break had to cancel and re-onboard. Leadership rejected a true pause, so I designed delay: push your next order out up to 3 months, subscription stays active. Delayed revenue rather than full churn.',
      ],
      visual: {
        id: 'delay-ui',
        caption:
          'Delay/scheduling calendar UI showing send date, ship estimate, and delivery window.',
      },
    },
  ],
  gallery: [
    {
      id: 'subscription-management',
      caption: 'Subscription management \u2014 the primary patient view for managing their medication plan.',
      size: 'full',
    },
    {
      id: 'order-states-mobile',
      caption: 'Order status tracking on mobile \u2014 clear visibility into where medication is in the fulfillment pipeline.',
      size: 'half',
    },
    {
      id: 'billing-history',
      caption: 'Billing history \u2014 transparent record connecting every charge to a specific order.',
      size: 'half',
    },
    {
      id: 'delay-flow-full',
      caption: 'The complete delay flow \u2014 from selecting a new date through confirmation and updated delivery estimates.',
      size: 'full',
    },
    {
      id: 'edge-case-states',
      caption: 'Edge case handling \u2014 pharmacy delays, supply issues, and provider holds surfaced clearly to patients.',
      size: 'half',
    },
    {
      id: 'notification-design',
      caption: 'Billing and fulfillment notifications \u2014 email and in-app messaging for key subscription events.',
      size: 'half',
    },
  ],
}

export const uwDesignSystem: CaseStudy = {
  id: 'uw-design-system',
  title: 'Kickstarting a design system',
  subtitle:
    'UW-IT had colors and principles but no components, no documentation, and no process for building either. I designed the first components and the system for how the system gets built.',
  timeline: '',
  sections: [
    {
      id: 'uw-context',
      heading: 'UW-IT manages digital services for 90,000+ students, faculty, and staff',
      paragraphs: [
        'Their design system existed as colors and principles \u2014 no components, no documentation, no established process for building either.',
      ],
      visual: null,
    },
    {
      id: 'uw-components',
      heading: 'I designed the first three components',
      paragraphs: [
        'But the real deliverable was building the system that builds the system: a documentation template accommodating engineers and non-technical designers, a process for translating Bootstrap patterns into opinionated, constrained components, and clear guidance on what the system shouldn\u2019t do.',
      ],
      visual: {
        id: 'uw-doc-template',
        caption: 'Documentation template accommodating engineers and non-technical designers.',
      },
    },
    {
      id: 'uw-insight',
      heading: 'The key insight: design systems get adopted when they accommodate existing workflows instead of demanding new ones',
      paragraphs: [
        'Code snippets toggled on or off depending on your role. A framework dropdown let teams grab code in their stack. Infinite customization isn\u2019t flexibility \u2014 it\u2019s abdication. A system needs opinions.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const sonyScreenlessTv: CaseStudy = {
  id: 'sony-screenless-tv',
  title: 'Screenless TV: Designing for Shared Reality',
  subtitle:
    'Vision concept for Sony\u2019s TV division. My team explored how immersive technology could shape home entertainment \u2014 and found that the real design challenge wasn\u2019t personalization, it was preserving the shared experience that makes watching together meaningful.',
  timeline: 'Q1 \u2013 Q3 2024',
  sections: [
    {
      id: 'sony-research',
      heading: 'People don\u2019t watch together for the content \u2014 they watch together for the connection',
      paragraphs: [
        'Master\u2019s capstone, 2024. Sony\u2019s TV division asked us to explore how AR/MR might shape home entertainment. We expected to hear about picture quality. Instead we heard about compromise \u2014 subtitles, volume, lighting \u2014 and the fact that people kept watching together anyway. The value is presence, not content.',
      ],
      visual: null,
    },
    {
      id: 'sony-wearables',
      heading: 'We rejected wearables \u2014 a values decision, not a technical one',
      paragraphs: [
        'Apple Vision Pro had just launched. Wearables were the obvious path. But you can\u2019t catch someone\u2019s eye during a tense scene through a headset. We weren\u2019t designing separate realities optimized for each person. We were preserving a shared reality that works for everyone.',
      ],
      visual: null,
    },
    {
      id: 'sony-concept',
      heading: 'Screenless TV: shared space, personalized experience',
      paragraphs: [
        'A volumetric display projected from a flat device \u2014 no screen, no headset. Angle-specific imagery lets each viewer see their own subtitles. Directional audio delivers different volumes to different positions. Personalization without isolation.',
      ],
      visual: {
        id: 'sony-concept-render',
        caption: 'Concept renders showing the disappearing display and shared-but-personalized viewing.',
      },
    },
  ],
  gallery: [],
}

export const cipElectionMisinformation: CaseStudy = {
  id: 'cip-election-misinformation',
  title: 'Framing election misinformation',
  subtitle: 'Two papers published at CSCW 2025, co-authored with Kate Starbird\u2019s research group at the University of Washington\u2019s Center for an Informed Public.',
  timeline: '2022\u20132025',
  sections: [
    {
      id: 'cip-research',
      heading: 'Election rumors aren\u2019t about getting the facts wrong \u2014 they\u2019re about framing',
      paragraphs: [
        'I did qualitative coding and analysis of rumoring dynamics on Twitter during the 2020 and 2022 U.S. elections. The core finding: misleading claims about election integrity take shape through interactions between often-factual evidence and distorted political frames. We built an evidence-frame framework that makes this process structurally legible \u2014 showing how the same evidence gets assembled into fundamentally different narratives depending on the frame applied to it.',
      ],
      visual: null,
    },
    {
      id: 'cip-impact',
      heading: 'Published at CSCW 2025 \u2014 the top venue for social computing research',
      paragraphs: [
        'The work produced two peer-reviewed papers analyzing how influencers, political elites, and audiences collaboratively constructed \u201cdeep stories\u201d across election cycles \u2014 and how the 2020 narrative became the interpretive lens for 2022. This is sociological thinking applied to a design problem: making invisible collective processes visible and analyzable.',
        '<a href="https://doi.org/10.1145/3757522" target="_blank" rel="noopener noreferrer" style="color: var(--text-dark); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px;">What is going on? An evidence-frame framework for analyzing online rumors about election integrity</a> — Starbird, Prochaska, Yamron',
        '<a href="https://doi.org/10.1145/3757576" target="_blank" rel="noopener noreferrer" style="color: var(--text-dark); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px;">Deep Storytelling: Collective Sensemaking and Layers of Meaning in U.S. Elections</a> — Prochaska, Vera, Tan, Yamron, Venuto, Kejriwal, Chu, Starbird',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const duolingoLanguagesFlags: CaseStudy = {
  id: 'duolingo-languages-flags',
  title: 'Languages \u2260 Flags',
  subtitle: 'Duolingo redesign \u00b7 Personal project, 2020',
  timeline: 'Personal project, 2020',
  sections: [
    {
      id: 'duo-problem',
      heading: 'The problem',
      paragraphs: [
        'Duolingo represents every language course with a flag. But which flag represents Spanish \u2014 Spain? Mexico? The 19 other countries? The mapping can\u2019t follow logic because no logic exists. And when it breaks down completely \u2014 the Arab League for Arabic, the state flag of Hawaii for Hawaiian \u2014 Duolingo reaches for flags most users couldn\u2019t identify anyway.',
      ],
      visual: {
        id: 'duo-flag-grid',
        caption: 'Grid of Duolingo\u2019s actual flag-language pairings, arranged to make the inconsistency undeniable at a glance.',
      },
    },
    {
      id: 'duo-known-problem',
      heading: 'A known problem, an unknown priority',
      paragraphs: [
        'Users call this out regularly. Duolingo\u2019s CEO has acknowledged it\u2019s flawed. The W3C recommends against it. It persists because it doesn\u2019t cause measurable pain and it\u2019s an industry convention. Neither is a good reason at this scale.',
      ],
      visual: {
        id: 'duo-evidence',
        caption: 'Compact composite of Reddit screenshots, CEO acknowledgment, and Vikram redesign callout.',
      },
    },
    {
      id: 'duo-remove-flags',
      heading: 'Remove flags from course selection',
      paragraphs: [
        'Replace them with ISO-639 language codes \u2014 standardized, uniform length, immediately implementable. They drop into existing UI without changing anything else.',
      ],
      visual: {
        id: 'duo-before-after',
        caption: 'Before/after of the course selection screen \u2014 flags vs. ISO codes styled in Duolingo\u2019s typeface and colors.',
      },
    },
    {
      id: 'duo-add-flags',
      heading: 'Add flags everywhere else',
      paragraphs: [
        'Don\u2019t remove flags from the platform \u2014 increase their use. Repurpose them in stories, roleplay scenarios, and loading screens to highlight the cultural diversity that the current system erases. Flags are great at representing countries. They\u2019re just bad at representing languages.',
      ],
      visual: {
        id: 'duo-flags-in-content',
        caption: 'Mockups showing flags used well inside course content \u2014 stories, loading screens, roleplay scenarios.',
      },
    },
    {
      id: 'duo-result',
      heading: 'One change removes the problem. The other turns flags into an asset.',
      paragraphs: [
        'Low-cost, immediately implementable, and makes the platform better.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const acornEatLocalVt: CaseStudy = {
  id: 'acorn-eat-local-vt',
  title: 'Where it started',
  subtitle:
    'COVID-19 shut down farmers markets across Vermont. As a college student with no design experience, I gathered eight engineers and taught myself product design to solve a problem I could see.',
  timeline: '2020\u20132021',
  sections: [
    {
      id: 'acorn-context',
      heading: 'COVID-19 shut down farmers markets across Vermont',
      paragraphs: [
        'As a college student with no design experience, I gathered eight engineers and taught myself product design to solve a problem I could see.',
      ],
      visual: null,
    },
    {
      id: 'acorn-ship',
      heading: 'We shipped a cross-platform app connecting customers to local farms',
      paragraphs: [
        '300+ farms onboarded. 1,100+ downloads. Local news coverage. Real impact during a hard time.',
      ],
      visual: {
        id: 'acorn-app',
        caption: 'Eat Local VT \u2014 cross-platform app connecting customers to local farms.',
      },
    },
    {
      id: 'acorn-team',
      heading: 'None of us had built an app before',
      paragraphs: [
        'We learned together \u2014 healthy disagreements, testing assumptions, using data to settle debates. I advocated for the user; they taught me what was possible. I sat in on technical conversations not because I understood everything, but because I wanted to be a real partner, not someone who hands off specs and disappears.',
      ],
      visual: null,
    },
    {
      id: 'acorn-instinct',
      heading: 'That instinct stuck',
      paragraphs: [
        'Today I sit in engineering meetings, think through technical constraints early, and treat collaboration as the starting point. It traces back to this project.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const trioTodoList: CaseStudy = {
  id: 'trio-todo-list',
  title: 'A todo list that keeps tasks perfectly prioritized',
  subtitle:
    'I designed and built a native iOS/macOS app to solve my own priority problem\u2009\u2014\u2009using AI tools as a design partner, going deep on craft that personal projects rarely get.',
  timeline: 'Jan \u2013 Mar 2026',
  sections: [
    {
      id: 'trio-product',
      heading: 'Three tasks. That\u2019s the whole product.',
      paragraphs: [
        'Most todo apps show you everything. Trio forces one question: what are the three things that matter today? A queue of three, a ranked backlog behind it, and a comparison-based ranking flow that makes prioritization a decision\u2009\u2014\u2009not a scroll through 40 items hoping the right one jumps out. Small surface area, deep design space.',
      ],
      visual: null,
    },
    {
      id: 'trio-design-language',
      heading: 'A design language from first principles',
      paragraphs: [
        'I studied 40+ screens across seven apps\u2009\u2014\u2009Claude, Linear, Waymo, Notion, Asana, Apple Notes, Slack\u2009\u2014\u2009and extracted 10 visual patterns. Those became an 8-principle design language: tasks are the only elements that get containers; everything else sits flat on surfaces. Content sits above navigation in a 3-layer depth model. Typography carries the entire hierarchy\u2009\u2014\u2009pushing page titles from 20pt SemiBold to 28pt Bold transformed how the app feels. Five hand-tuned color themes with per-hue HSB saturation curves, because different hues need different saturation to look equally colorful.',
      ],
      visual: null,
    },
    {
      id: 'trio-ai-partner',
      heading: 'AI as design partner, not autocomplete',
      paragraphs: [
        'Claude operates as five specialized agents\u2009\u2014\u2009planner, domain architect, UI engineer, tester, docs writer\u2009\u2014\u2009each with its own markdown spec and strict rules about which files to read before touching code. The workflow is as designed as the product: file-based context management, mandatory doc updates before every commit, structured handoff notes between sessions. When AI silently reverted a safety fix during an unrelated refactor\u2009\u2014\u2009reintroducing a silent data loss path that went undetected for 19 days\u2009\u2014\u2009that incident became a commit-tracing protection system with mandatory review rules. The tooling became part of the craft.',
      ],
      visual: null,
    },
    {
      id: 'trio-craft',
      heading: 'Craft shows up where nobody\u2019s looking',
      paragraphs: [
        'Seven iterations on a single drawer animation. Root cause: two-phase state changes split across SwiftUI transactions. A backlog panel that morphs from a capsule button to a full-width sheet, driven by one CGFloat\u2009\u2014\u2009corner radius, width, height, opacity all interpolated from a single progress value. Spring presets tuned with a live debug slider panel, then locked as constants. Each spring has a name, a damping ratio that communicates personality, and a documented reason for existing. The font switcher went through seven iterations of its own just on the swatch picker interaction\u2009\u2014\u2009fixed-position selections, staggered fan animations, per-item offset calculations because <code>.move(edge:)</code> gives every item the same travel distance.',
      ],
      visual: null,
    },
    {
      id: 'trio-depth',
      heading: 'Small surface, deep space',
      paragraphs: [
        'Three-task queue, one app, one person. But each constraint generated real design questions: what happens when you add a fourth task? (Bump the lowest-priority to backlog, show a toast.) Should the backlog live on its own page? (No\u2009\u2014\u2009merge it into Today so the user sees queue and backlog as one prioritized list.) How should ranking comparisons feel physically? (Haptic \u201cta-da\u201d on completion, light taps on each comparison, success notification when ranking finishes.) Going deep on a narrow product\u2009\u2014\u2009with AI tools that let one person maintain production-grade craft\u2009\u2014\u2009is where the interesting design problems live.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const caseStudiesBySlug: Record<string, CaseStudy> = {
  'mochi-ai-tooling': mochiAiTooling,
  'mochi-progress-tracker': mochiProgressTracker,
  'mochi-subscriptions': mochiSubscriptions,
  'uw-design-system': uwDesignSystem,
  'sony-screenless-tv': sonyScreenlessTv,
  'cip-election-misinformation': cipElectionMisinformation,
  'duolingo-languages-flags': duolingoLanguagesFlags,
  'acorn-eat-local-vt': acornEatLocalVt,
  'trio-todo-list': trioTodoList,
}
