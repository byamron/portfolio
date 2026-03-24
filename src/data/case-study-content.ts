export interface CaseStudyVisual {
  id: string
  caption: string
  /** Optional iframe src for live prototype embeds */
  prototypeSrc?: string
  /** Aspect ratio override for prototypes (default: '16 / 10') */
  aspectRatio?: string
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
  /** Optional iframe src for live prototype embeds */
  prototypeSrc?: string
  /** Aspect ratio override for prototypes (default: '16 / 10') */
  aspectRatio?: string
}

export interface PaperLink {
  title: string
  href: string
}

export interface CaseStudy {
  id: string
  title: string
  subtitle: string
  timeline: string
  heroVisual?: CaseStudyVisual
  sections: CaseStudySection[]
  gallery: GalleryItem[]
  /** Condensed flowing paragraphs (HTML strings). When present, the layout renders these instead of sections. */
  narrative?: string[]
  /** External paper/publication links rendered as card-like items below the narrative. */
  paperLinks?: PaperLink[]
  /** Custom contact line (HTML string). Defaults to "Interested in the details? Get in touch." */
  contactCta?: string
}

export const mochiAiTooling: CaseStudy = {
  id: 'mochi-ai-tooling',
  title: 'AI tooling to automate internal workflows',
  subtitle: 'Mochi had no central repository of institutional knowledge. I built a shared context layer and a Claude Code plugin on top of it\u2009\u2014\u2009making previously inaccessible information available to anyone at the company.',
  timeline: '2025\u20132026',
  narrative: [
    '<strong>Mochi had no single source of truth for how the product works.</strong> Institutional knowledge\u2009\u2014\u2009how the code is structured, how database tables map to features, when changes went in and why\u2009\u2014\u2009lived in individuals\u2019 heads. When people started using AI tools, they hit the same wall: without that context, AI could only offer generic help. I built a shared context repository and a Claude Code plugin on top of it\u2009\u2014\u2009one system that knows everything, available to anyone at the company.',
    '<strong>The plugin is structured as composable skills, each optimized for a different workflow</strong>\u2009\u2014\u2009writing product specs, tracing bugs to the code changes that caused them, querying the database across tables that only made sense if you understood the codebase, managing Linear issues with full product context. The skills work together: a bug report can pull from GitHub, the database, and Linear to surface the full picture. Distributed through GitHub so designers, engineers, or anyone else at the company can use it without building their own.',
  ],
  sections: [],
  gallery: [],
}

export const mochiProgressTracker: CaseStudy = {
  id: 'mochi-progress-tracker',
  title: 'Empowering weight loss through progress tracking',
  subtitle:
    'Mochi\u2019s progress tracker existed but nobody used it. I drove a 53% increase in weekly active users, then identified its real value \u2014 a single source of truth for patient weight data \u2014 and built the integration that made it critical to the clinical workflow.',
  timeline: 'Q3 2025 \u2013 Q1 2026',
  narrative: [
    '<strong>Only 30% of patients had ever used our progress tracker.</strong> I redesigned it with mobile support and cleaner data visualization\u2009\u2014\u200953% increase in weekly active users within two weeks. But adoption wasn\u2019t the real problem.',
    '<strong>Mochi had two separate systems tracking patient weight that didn\u2019t talk to each other.</strong> I unified them so health check data automatically populates the tracker. Patients get a filled-out history without extra effort; providers get the timestamped data they need to approve refills. The feature nobody would invest in is now infrastructure they can\u2019t operate without.',
  ],
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
  title: 'Improving billing UX for our core subscriptions model',
  subtitle:
    'Mochi billed its patients for monthly medication whether it shipped or not. I rebuilt subscriptions so billing triggers when an order is processed, gave patients control over their schedule, and eliminated $200\u2013300k/month in infrastructure costs. 90%+ of patients have been successfully migrated.',
  timeline: 'Q3 2025 \u2013 Q1 2026',
  narrative: [
    '<strong>Billing and fulfillment were two independent systems\u2009\u2014\u2009patients paid the price.</strong> Mochi charged monthly on Stripe\u2019s automation while medication delivery depended on a multi-step refill process. When they diverged, charges continued without medication. I replaced calendar-based billing with event-driven logic tied to fulfillment\u2009\u2014\u2009patients only pay when medication ships. Eliminated $200\u2013300k/month in infrastructure costs; 90%+ of users migrated.',
    '<strong>Provider denial rates spiked 3\u00d7 after removing required health checks</strong>\u2009\u2014\u2009a timing problem, not a data problem. Providers reviewed refills before patients could respond to prompts. I moved data collection 14 days upstream. <strong>20% of subscription churn was preventable</strong>\u2009\u2014\u2009patients just wanted a break. I designed a delay feature: push your next order out up to 3 months, subscription stays active.',
  ],
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
  title: 'Building the system that builds the system',
  subtitle:
    'UW-IT had colors and principles but no components, no documentation, and no process for building either. I designed the first components and the system for how the system gets built.',
  timeline: '',
  narrative: [
    '<strong>UW-IT manages digital services for 90,000+ students, faculty, and staff.</strong> Their design system existed only as colors and principles\u2009\u2014\u2009no components, no documentation, no process for building either. I designed the first three components. The real deliverable was everything around them: a documentation template for engineers and non-technical designers, a process for translating Bootstrap patterns into constrained components, and clear guidance on what the system shouldn\u2019t do.',
    '<strong>Design systems get adopted when they accommodate existing workflows instead of demanding new ones.</strong> Code snippets toggled on or off depending on your role. A framework dropdown let teams grab code in their stack. A system needs opinions\u2009\u2014\u2009infinite customization isn\u2019t flexibility, it\u2019s abdication.',
  ],
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
      visual: null,
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
  title: 'Screenless TV: Designing for shared reality',
  subtitle:
    'A speculative vision project for Sony\u2019s TV division. My team explored how immersive technology could shape home entertainment \u2014 and found that the real design challenge wasn\u2019t personalization, it was preserving the shared experience that makes watching together meaningful.',
  timeline: 'Q1 \u2013 Q3 2024',
  narrative: [
    '<strong>People don\u2019t watch together for the content\u2009\u2014\u2009they watch together for the connection.</strong> For my master\u2019s capstone at the University of Washington, my team took on a speculative vision project for Sony\u2019s TV division. We interviewed people about how they watch with others, expecting to hear about picture quality. Instead we heard about compromise\u2009\u2014\u2009subtitles, volume, lighting\u2009\u2014\u2009and the fact that people kept watching together anyway. The value is presence, not content.',
    '<strong>We rejected wearables\u2009\u2014\u2009a values decision, not a technical one.</strong> Apple Vision Pro had just launched, but you can\u2019t catch someone\u2019s eye during a tense scene through a headset. We designed a volumetric display with angle-specific imagery and directional audio\u2009\u2014\u2009personalization without isolation.',
  ],
  sections: [
    {
      id: 'sony-research',
      heading: 'People don\u2019t watch together for the content \u2014 they watch together for the connection',
      paragraphs: [
        'A speculative vision project for Sony\u2019s TV division (master\u2019s capstone, 2024). Sony asked us to explore how AR/MR might shape home entertainment. We expected to hear about picture quality. Instead we heard about compromise \u2014 subtitles, volume, lighting \u2014 and the fact that people kept watching together anyway. The value is presence, not content.',
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
  subtitle: 'Two papers published at CSCW 2025, co-authored with Dr. Kate Starbird\u2019s research group at the University of Washington\u2019s Center for an Informed Public.',
  timeline: '2022\u20132025',
  narrative: [
    '<strong>Election rumors aren\u2019t about getting the facts wrong\u2009\u2014\u2009they\u2019re about framing.</strong> Working with Dr. Kate Starbird\u2019s research group at UW\u2019s Center for an Informed Public, I did qualitative coding and analysis of rumoring dynamics on Twitter during the 2020 and 2022 U.S. elections. Misleading claims about election integrity take shape through interactions between often-factual evidence and distorted political frames. We built an evidence-frame framework that makes this process structurally legible.',
    '<em>What is going on?</em> introduces the framework. <em>Deep Storytelling</em> examines how these stories evolved across election cycles. Both were presented at <a href="https://cscw.acm.org/2025/" target="_blank" rel="noopener noreferrer" data-contact-card style="color: var(--text-grey); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">CSCW 2025</a>.',
  ],
  paperLinks: [
    { title: 'What is going on? An evidence-frame framework for analyzing online rumors about election integrity', href: 'https://dl.acm.org/doi/10.1145/3757522' },
    { title: 'Deep Storytelling: Collective Sensemaking and Layers of Meaning in U.S. Elections', href: 'https://dl.acm.org/doi/10.1145/3757576' },
  ],
  contactCta: 'Both papers are publicly available at the links above.',
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
      id: 'cip-paper-1',
      heading: '<a href="https://dl.acm.org/doi/10.1145/3757522" target="_blank" rel="noopener noreferrer" data-paper-link style="color: var(--text-dark); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">What is going on? An evidence-frame framework for analyzing online rumors about election integrity</a>',
      paragraphs: [
        '<em>Kate Starbird, Stephen Prochaska, Ben Yamron \u00b7 Proceedings of the ACM on Human-Computer Interaction, Volume 9, Issue 7</em>',
        'Pervasive falsehoods that erode trust in election processes are of increasing concern to democracies around the world. Misleading claims like these are often understood as simply \u201cgetting the facts wrong\u201d. Using a grounded, interpretative, mixed-method approach to study Twitter activity during the 2022 U.S. Midterm Election in Arizona, our work paints a more nuanced picture. We adapt Klein\u2019s data-frame theory of collective sensemaking to online rumors, demonstrating how misleading claims about election administration take shape online through interactions between (often factual) evidence and frames. We introduce a methodological approach for analyzing rumors through this evidence-frame lens and provide insights into the dynamics of online rumoring around claims of \u201crigged elections\u201d. Our work highlights how rumors are as much about political framing as they are about faulty facts, and locates the crux of the problem of misinformation in the interactions with and between evidence and distorted political frames.',
      ],
      visual: null,
    },
    {
      id: 'cip-paper-2',
      heading: '<a href="https://dl.acm.org/doi/10.1145/3757576" target="_blank" rel="noopener noreferrer" data-paper-link style="color: var(--text-dark); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">Deep Storytelling: Collective Sensemaking and Layers of Meaning in U.S. Elections</a>',
      paragraphs: [
        '<em>Stephen Prochaska, Julie Vera, Douglas Lew Tan, Ben Yamron, Sylvie Venuto, Amaya Kejriwal, Sarah Chu, Kate Starbird \u00b7 Proceedings of the ACM on Human-Computer Interaction, Volume 9, Issue 7</em>',
        'Misinformation and disinformation about elections remain pressing concerns for researchers, policymakers, and the public. Critics, however, argue that fears surrounding these issues are exaggerated due to a lack of evidence of impact. This debate highlights the challenges inherent in assessing the impacts of misinformation, as the drivers of false and misleading content often exist in the context of a specific claim. To address this issue, we examined false and misleading information surrounding the 2020 and 2022 U.S. national elections, focusing on the contextual features of online conversations that fueled various rumors. We developed two qualitative codebooks, creating the second after realizing that the first, which labeled individual tweets, failed to capture broader rumoring dynamics. By integrating multi-layered qualitative coding with thematic analysis and quantitative visualizations, we show how influencers, political elites, and audiences collaboratively told deep stories from 2020 through 2022. As these stories were told, audiences interpreted events in 2022 through the lens of the 2020 story, guided by influencers\u2019 cues, leading to an evolution in storytelling style between the two election cycles. This ongoing performance was tailored to align with the incentive structures, affordances, and attention economy of social media. We combine deep stories with theories of collective sensemaking and rumoring, creating a framework to better assess the contextual features surrounding false and misleading information.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const duolingoLanguagesFlags: CaseStudy = {
  id: 'duolingo-languages-flags',
  title: 'Making Duolingo\u2019s use of flags more inclusive',
  subtitle: 'Duolingo redesign \u00b7 Personal project, 2020',
  timeline: 'Personal project, 2020',
  narrative: [
    '<strong>Duolingo represents every language with a flag, but which flag represents Spanish\u2009\u2014\u2009Spain? Mexico?</strong> The mapping can\u2019t follow logic because no logic exists. When it breaks down completely\u2009\u2014\u2009the Arab League for Arabic, Hawaii\u2019s state flag for Hawaiian\u2009\u2014\u2009the fallback is flags most users couldn\u2019t identify anyway. Users call this out regularly. Duolingo\u2019s CEO has acknowledged it\u2019s flawed. The W3C recommends against it.',
    '<strong>Remove flags from course selection; add them everywhere else.</strong> Replace with ISO-639 language codes\u2009\u2014\u2009standardized, uniform, immediately implementable. Then repurpose flags in stories, roleplay scenarios, and loading screens to highlight the cultural diversity the current system erases. One change removes the problem; the other turns flags into an asset.',
  ],
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
  title: 'Connecting farmers and customers during COVID-19',
  subtitle:
    'COVID-19 shut down farmers markets across Vermont. As a college student with no design experience, I gathered eight engineers and taught myself product design to solve a problem I could see.',
  timeline: '2020\u20132021',
  narrative: [
    '<strong>COVID-19 shut down farmers markets across Vermont.</strong> As a college student with no design experience, I gathered eight engineers and taught myself product design to ship a cross-platform app connecting customers to local farms. 300+ farms onboarded, 1,100+ downloads, local news coverage.',
    '<strong>None of us had built an app before.</strong> I sat in engineering meetings not because I understood everything, but because I wanted to be a real partner\u2009\u2014\u2009not someone who hands off specs and disappears. That instinct stuck. Today I treat engineering collaboration as the starting point, not the handoff.',
  ],
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
  narrative: [
    '<strong>I\u2019ve never had a todo list I actually liked.</strong> They\u2019d pile up and I\u2019d stall\u2009\u2014\u2009not because I didn\u2019t know what to do, but because I couldn\u2019t decide what to do <em>next</em>. I wanted to take the decision-making out of prioritization. Inspired by apps like Beli, where simple comparisons produce a ranked order, I applied the same idea to tasks: instead of setting your priorities, you just compare two tasks at a time, and the system keeps everything in order for you.',
    '<strong>Your backlog can be as long as you want, but your day stays focused.</strong> Every task you add gets ranked through pairwise comparisons, so the list is always prioritized. When you\u2019re ready to work, you pull tasks into today\u2009\u2014\u2009but you can only hold three at a time. Finish one, add the next. The constraint keeps you moving instead of staring at a wall of tasks.',
    '<strong>This was the first app I built with Claude Code.</strong> Since I designed it for myself and use it every day, I can iterate quickly\u2009\u2014\u2009testing ideas against my own workflow and shipping improvements the same day.',
  ],
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
