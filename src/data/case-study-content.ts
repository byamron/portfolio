export interface PaperLink {
  title: string
  href: string
}

export interface CaseStudySection {
  id: string
  heading: string
  paragraphs: string[]
  visual: { id: string; caption: string } | null
}

export interface CaseStudy {
  id: string
  title: string
  subtitle: string
  timeline: string
  narrative: string[]
  /** External paper/publication links rendered as card-like items below the narrative. */
  paperLinks?: PaperLink[]
  /** Custom contact line (HTML string). Defaults to "Interested in the details? Get in touch." */
  contactCta?: string
  /** Structured content sections (alternative to narrative paragraphs). */
  sections?: CaseStudySection[]
  /** Hero visual for the case study page. */
  heroVisual?: { id: string; caption: string }
  /** Gallery items for the case study. */
  gallery?: unknown[]
}

export const mochiAiTooling: CaseStudy = {
  id: 'mochi-ai-tooling',
  title: 'AI tooling to automate internal workflows',
  subtitle: 'AI tools are only as good as the context they have. I built a documentation layer and a Claude Code plugin that gives anyone at the company an AI assistant that actually knows the product.',
  timeline: '2025\u20132026',
  narrative: [
    '<strong>AI tools are only as good as the context they have.</strong> At Mochi, that context\u2009\u2014\u2009how the code maps to features, when things changed and why, how database tables connect\u2009\u2014\u2009lived in people\u2019s heads. I built a documentation layer and a Claude Code plugin on top of it that gives anyone at the company an AI assistant that actually knows the product.',
    '<strong>The plugin uses Claude Code skills for different workflows:</strong> writing product specs, tracing bugs to the code changes that caused them, querying the database, managing project tickets. The skills compose\u2009\u2014\u2009a single bug report can pull from version history, the database, and project management to surface the full picture without switching tools. Anyone\u2009\u2014\u2009designers, engineers, PMs\u2009\u2014\u2009can install it and use it immediately.',
    '<strong>Now I\u2019m turning the knowledge layer into a reusable context repository</strong>\u2009\u2014\u2009a foundation other people can build specialized tools on top of without starting from scratch. Lower the barrier, and useful internal tools get built fast.',
  ],
}

export const mochiProgressTracker: CaseStudy = {
  id: 'mochi-progress-tracker',
  title: 'Empowering weight loss through progress tracking',
  subtitle:
    'Mochi tracked weight in two places that didn\u2019t talk to each other. I unified them so provider-recorded weights appear automatically in the patient\u2019s tracker. Separately, I redesigned the tracker with mobile support: 53% increase in weekly active users within two weeks.',
  timeline: 'Q3 2025 \u2013 Q1 2026',
  narrative: [
    '<strong>Patients reported their weight to their provider every month, yet most still saw nothing in their own progress tracker.</strong> Mochi tracked weight in two places that didn\u2019t talk to each other\u2009\u2014\u2009one for patients, one for providers. I killed the split. Provider-recorded weights now appear automatically in the patient\u2019s tracker. Patients get a filled-out history without logging anything; providers get the data they need to approve refills. What started as a low-priority feature is now infrastructure the clinical team can\u2019t operate without.',
    '<strong>The surface layer mattered too.</strong> The progress tracker had 30% lifetime usage\u2009\u2014\u2009mostly because it didn\u2019t work on mobile. I redesigned it with mobile support and cleaner data visualization. 53% increase in weekly active users within two weeks.',
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
        'Mochi had two separate systems tracking patient weight \u2014 one for patients, one for providers \u2014 and neither talked to the other. Patients logged weight in the app; providers recorded it separately during check-ins. I unified them so provider-recorded weights automatically appear in the patient\u2019s tracker. Patients get a filled-out history without extra effort; providers get the timestamped data they need to approve refills. What started as a low-priority feature is now infrastructure the clinical team can\u2019t operate without.',
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
    'Billing and fulfillment were two independent systems\u2009\u2014\u2009patients got charged whether their medication shipped or not. I worked with two engineers to rebuild billing so charges only trigger on shipment, gave patients control over their schedule, and eliminated >$200k/month in infrastructure costs. 90%+ of users migrated.',
  timeline: 'Q3 2025 \u2013 Q1 2026',
  narrative: [
    '<strong>Mochi is a telehealth subscription\u2009\u2014\u2009patients pay monthly for weight loss medication and ongoing care.</strong> But billing and fulfillment were two independent systems. Patients got charged on a fixed monthly schedule regardless of whether their medication had shipped. When the two diverged, people paid for medication they hadn\u2019t received. I worked with two engineers to rebuild our billing scheduling logic from scratch, replacing a third-party service\u2009\u2014\u2009defining every status, error state, and edge case from the ground up. Charges now only trigger on shipment. Eliminated >$200k/month in payment processing overhead; 90%+ of users migrated.',
    '<strong>With the foundation fixed, I tackled the problems around it.</strong> Refill denial rates had spiked 3\u00d7\u2009\u2014\u2009providers were reviewing refills before patients had a chance to submit updated health information. I moved data collection 14 days earlier in the cycle so the information is already there when the provider looks. Separately, 20% of subscription churn was patients who just wanted a break. I designed a delay feature that lets users push their next order out up to three months, and a restart flow so that if they do cancel, they can pick up where they left off instead of being treated like a new patient.',
    '<strong>Now we\u2019re building the subscription entity to handle any medication type</strong>\u2009\u2014\u2009not just GLP-1s. The same system, flexible enough to scale as Mochi\u2019s offering grows.',
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
        'I redesigned billing so patients only pay when medication ships',
      paragraphs: [
        'I defined the timing rules, states, edge cases, and billing triggers that engineering built to spec. This also eliminated >$200k/month in payment processing overhead. Over 90% of users have migrated.',
      ],
      visual: null,
    },
    {
      id: 'timing-problem',
      heading:
        'Refill denial rates spiked 3x \u2014 a timing problem, not a data problem',
      paragraphs: [
        'Removing required check-ins caused providers to deny refills they couldn\u2019t confidently approve. The intuitive fix \u2014 prompting patients for updated health information \u2014 didn\u2019t work because providers reviewed refills before patients could respond. I moved data collection 14 days earlier in the cycle so the information is already there when providers review.',
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
    'UW-IT\u2019s design system existed only as colors and principles. I designed the first three components and\u2009\u2014\u2009more importantly\u2009\u2014\u2009the process and documentation structure for everything that would follow.',
  timeline: '2024',
  narrative: [
    '<strong>UW-IT manages digital services for 90,000+ students, faculty, and staff.</strong> Their design system existed only as colors and principles\u2009\u2014\u2009no components, no documentation, no process for building either. I designed the first three components and\u2009\u2014\u2009more importantly\u2009\u2014\u2009the process and documentation structure for everything that would follow. Documentation toggled code snippets by role. A framework dropdown let teams grab code in their stack. Engineers could adopt without changing how they already worked.',
    '<strong>The hard part was deciding what the system shouldn\u2019t do.</strong> Infinite customization isn\u2019t flexibility\u2009\u2014\u2009it\u2019s abdication. I scoped components with strong defaults and limited overrides, and wrote explicit guidance on when to break from the system rather than pretending it covers everything.',
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
        'But the real deliverable was building the system that builds the system: a documentation template accommodating engineers and non-technical designers, a process for turning existing UI patterns into opinionated, reusable components, and clear guidance on what the system shouldn\u2019t do.',
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
    'People watch TV together for connection, not just content. For my master\u2019s capstone at UW, I led design on a speculative project for Sony\u2019s TV division\u2009\u2014\u2009a volumetric display with personalization without isolation.',
  timeline: 'Q1 \u2013 Q3 2024',
  narrative: [
    '<strong>People watch TV together for connection, not just content.</strong> They compromise constantly\u2009\u2014\u2009subtitles, volume, lighting\u2009\u2014\u2009and keep watching together anyway. Every attempt at personalization has meant isolation: headphones, second screens, headsets. We wanted personalization without isolation.',
    '<strong>For my master\u2019s capstone at UW, I led design on a speculative project for Sony\u2019s TV division exploring the future of television.</strong> We designed around a volumetric display\u2009\u2014\u2009technology that exists today\u2009\u2014\u2009that projects into physical space without a physical footprint. The screen can be moved, resized, and disappears completely when you turn it off. Angle-specific imagery and directional audio let everyone in the room have personalized subtitles, volume, and lighting without wearing anything. I kept interaction patterns deliberately familiar\u2009\u2014\u2009a remote control with Wiimote-style gestures for new functions. The product had to feel like a TV, not a tech demo. We prototyped in Figma, Adobe Aero (AR spatial), and After Effects (video walkthrough), and presented to Sony\u2019s directors and product planners.',
  ],
  sections: [
    {
      id: 'sony-research',
      heading: 'People don\u2019t watch together for the content \u2014 they watch together for the connection',
      paragraphs: [
        'A speculative vision project for Sony\u2019s TV division (master\u2019s capstone, 2024). Sony asked us to explore how mixed reality might shape home entertainment. We expected to hear about picture quality. Instead we heard about compromise \u2014 subtitles, volume, lighting \u2014 and the fact that people kept watching together anyway. The value is presence, not content.',
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
  subtitle: 'Election misinformation spreads through framing, not fabrication. Working with Dr. Kate Starbird\u2019s research group at UW\u2019s Center for an Informed Public, I helped build a framework mapping how identical evidence gets assembled into opposing claims. Two papers presented at CSCW 2025.',
  timeline: '2022\u20132025',
  narrative: [
    '<strong>Election rumors aren\u2019t about getting the facts wrong\u2009\u2014\u2009they\u2019re about framing.</strong> Working with Dr. Kate Starbird\u2019s research group at UW\u2019s Center for an Informed Public, I analyzed how election misinformation spreads on Twitter\u2009\u2014\u2009not through fabrication, but through framing. A photo, a statistic, a real policy change becomes misleading depending on the narrative wrapped around it. I helped build a framework mapping how identical evidence gets assembled into opposing claims. Two papers presented at CSCW 2025.',
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
        'I analyzed how misleading claims spread on Twitter during the 2020 and 2022 U.S. elections. The core finding: these claims often start with real evidence\u2009\u2014\u2009a photo, a statistic, a policy change\u2009\u2014\u2009and become misleading through the political frame applied to them. We built a framework that maps how the same evidence gets assembled into fundamentally different narratives depending on who\u2019s telling the story.',
      ],
      visual: null,
    },
    {
      id: 'cip-paper-1',
      heading: '<a href="https://dl.acm.org/doi/10.1145/3757522" target="_blank" rel="noopener noreferrer" data-paper-link style="color: var(--text-dark); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">What is going on? An evidence-frame framework for analyzing online rumors about election integrity</a>',
      paragraphs: [
        '<em>Kate Starbird, Stephen Prochaska, Ben Yamron \u00b7 Proceedings of the ACM on Human-Computer Interaction, Volume 9, Issue 7</em>',
        'Misleading claims about elections are often understood as simply \u201cgetting the facts wrong.\u201d Our research paints a more nuanced picture. Studying Twitter activity during the 2022 U.S. Midterm Election in Arizona, we show how misleading claims take shape through interactions between often-factual evidence and political frames. We introduce a framework for analyzing how the same evidence gets assembled into different narratives depending on the frame applied, and provide insights into how \u201crigged election\u201d claims spread. The crux of misinformation isn\u2019t faulty facts\u2009\u2014\u2009it\u2019s the framing.',
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
  subtitle: 'Duolingo represents every language with a flag, but the mapping can\u2019t follow logic because no logic exists. One change removes the problem; another turns flags into an asset.',
  timeline: '2020',
  narrative: [
    '<strong>Duolingo represents every language with a flag, but which flag represents Spanish\u2009\u2014\u2009Spain? Mexico?</strong> The mapping can\u2019t follow logic because no logic exists. When it breaks down completely\u2009\u2014\u2009the Arab League for Arabic, Hawaii\u2019s state flag for Hawaiian\u2009\u2014\u2009the fallback is flags most users couldn\u2019t identify anyway. Users call this out regularly. Duolingo\u2019s CEO has acknowledged it\u2019s flawed. The W3C recommends against it.',
    '<strong>The fix is one change:</strong> replace flags with ISO-639 language codes in course selection\u2009\u2014\u2009\u201cES\u201d for Spanish, \u201cAR\u201d for Arabic, \u201cHAW\u201d for Hawaiian. Standardized, uniform, and easily stylized to match Duolingo\u2019s visual language. Ships tomorrow. Then repurpose flags everywhere else\u2009\u2014\u2009in stories, roleplay scenarios, and loading screens\u2009\u2014\u2009to highlight the cultural diversity the current system erases. One change removes the problem; the other turns flags into an asset.',
  ],
}

export const acornEatLocalVt: CaseStudy = {
  id: 'eat-local-vt',
  title: 'Connecting farmers and customers during COVID-19',
  subtitle:
    'First app I ever shipped. Taught myself product design as a college student, gathered a team of eight, and built a cross-platform app connecting Vermont customers to local farms after COVID shut down farmers markets.',
  timeline: '2020\u20132021',
  narrative: [
    '<strong>First app I ever shipped.</strong> Taught myself product design as a college student, gathered a team of eight, and built a cross-platform app connecting Vermont customers to local farms after COVID shut down farmers markets. 300+ farms, 1,100+ downloads. None of us had built anything before.',
    '<strong>I sat in every engineering meeting</strong>\u2009\u2014\u2009not because I understood everything, but because I wanted to be a real partner. That instinct stuck. I still treat engineering collaboration as the starting point, not the handoff.',
  ],
}

export const trioTodoList: CaseStudy = {
  id: 'trio-todo-list',
  title: 'A todo list for focus and prioritization',
  subtitle:
    'Most todo apps give you a list and leave the rest to you. I built one that maintains itself\u2009\u2014\u2009pairwise comparisons keep everything ranked, and your active list can only hold three at a time.',
  timeline: 'Jan \u2013 Mar 2026',
  narrative: [
    '<strong>You have a finite day and too many things to do.</strong> Most todo apps give you a list and leave the rest to you\u2009\u2014\u2009ordering, prioritizing, deciding what actually matters today. It gets out of hand fast, and once it does, the list works against you instead of for you.',
    '<strong>I built a todo app that maintains itself through light infrastructure on input.</strong> Every task you add gets ranked through pairwise comparisons\u2009\u2014\u2009you just pick between two tasks at a time, and the system keeps a running priority order. No dragging, no labels, no maintenance. When you\u2019re ready to work, you pull tasks into today\u2009\u2014\u2009but you can only hold three at a time. Finish one, pull the next. The constraint keeps you moving instead of staring.',
  ],
  sections: [
    {
      id: 'trio-product',
      heading: 'Three tasks. That\u2019s the whole product.',
      paragraphs: [
        'Most todo apps show you everything. Trio forces one question: what are the three things that matter today? A queue of three, a ranked backlog behind it, and a simple ranking system\u2009\u2014\u2009you compare two tasks at a time, and the app keeps everything in order for you. No scrolling through 40 items hoping the right one jumps out. Small surface area, deep design space.',
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
        'I structured my AI workflow the same way I\u2019d structure a team\u2009\u2014\u2009with clear roles, documented decisions, and guardrails that catch mistakes. When the AI silently undid a bug fix during an unrelated change, I didn\u2019t just fix it\u2009\u2014\u2009I designed a review process that prevents it from happening again. Using AI well isn\u2019t about prompting; it\u2019s about building systems around it.',
      ],
      visual: null,
    },
    {
      id: 'trio-craft',
      heading: 'Craft shows up where nobody\u2019s looking',
      paragraphs: [
        'Seven iterations on a single drawer animation. A backlog panel that morphs from a capsule button to a full-width sheet, with corner radius, width, height, and opacity all controlled by a single value\u2009\u2014\u2009so the transition feels like one continuous movement, not four things changing at once. Every spring animation is named, tuned to a specific feel (snappy, gentle, bouncy), and documented. The font switcher went through seven iterations of its own just on the color picker\u2009\u2014\u2009getting the staggered fan animation to feel right when each swatch travels a different distance.',
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

export const forge: CaseStudy = {
  id: 'forge',
  title: 'Optimizing your AI development workflow',
  subtitle:
    'Claude Code\u2019s configuration infrastructure is powerful, but keeping it optimized is real work. Forge watches your sessions, detects patterns, and proposes improvements\u2009\u2014\u2009rules, hooks, skills, scoped artifacts. Everything is a proposal you review. Nothing auto-applies.',
  timeline: '2026',
  narrative: [
    '<strong>Claude Code\u2019s configuration infrastructure is powerful\u2009\u2014\u2009rules, hooks, skills, agents, references, all scoped and layered.</strong> Keeping it optimized as your project evolves is real work. Forge does it for you. It\u2019s a Claude Code plugin that treats your configuration as a living body of work\u2009\u2014\u2009watching your sessions, detecting patterns in your workflow, and continuously proposing improvements that keep your setup sharp.',
    '<strong>Keep correcting Claude about the same thing? Forge drafts a rule.</strong> Always running pytest after an edit? Forge drafts a hook. A bloated CLAUDE.md? Forge breaks it into scoped artifacts that only load when relevant. Stale rules get flagged for removal. Proposals go through a two-stage pipeline\u2009\u2014\u2009Python preprocessing to detect candidates, then an LLM quality gate to filter noise. Forge also learns from your feedback: dismiss a proposal for low impact and it deflates similar scores next time; approve one and it monitors whether the pattern actually stops. Everything is a proposal you review. Nothing auto-applies.',
    '<strong>I got a working version in two days</strong> and run it actively across my other projects, iterating on the results.',
  ],
}

export const caseStudiesBySlug: Record<string, CaseStudy> = {
  'mochi-ai-tooling': mochiAiTooling,
  'mochi-progress-tracker': mochiProgressTracker,
  'mochi-subscriptions': mochiSubscriptions,
  'uw-design-system': uwDesignSystem,
  'sony-screenless-tv': sonyScreenlessTv,
  'cip-election-misinformation': cipElectionMisinformation,
  'duolingo-languages-flags': duolingoLanguagesFlags,
  'eat-local-vt': acornEatLocalVt,
  'trio-todo-list': trioTodoList,
  'forge': forge,
}
