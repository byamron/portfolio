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
      heading: 'Patients wanted to track progress \u2014 ours just wasn\u2019t good enough',
      paragraphs: [
        'Patients were already tracking weight loss with third-party apps like MyFitnessPal and Lose It!. Only 30% of active Mochi patients had ever logged in ours. The company wanted to invest but couldn\u2019t justify it \u2014 no connection to revenue, so it kept getting deprioritized. The design reflected it: unclear data visualization, no mobile support, rigid logging that forced all metrics at once.',
      ],
      visual: null,
    },
    {
      id: 'visual-refresh',
      heading: 'A visual refresh and mobile support drove a 53% increase in weekly active users',
      paragraphs: [
        'I gave the tracker a visual refresh with the new design system and made it work on mobile \u2014 where a majority of patients were. I separated logging entry points so patients weren\u2019t forced to log weight before anything else, cleaned up the weight graph with goal visualization, and made log history scannable.',
        '53% increase in weekly active users and 57% increase in logging frequency within two weeks. Proof that demand existed \u2014 but still not enough to change organizational priority.',
      ],
      visual: {
        id: 'tracker-before-after',
        caption: 'Before/after of the tracker UI \u2014 the contrast should be immediately obvious.',
      },
    },
    {
      id: 'data-unification',
      heading: 'Patients were doing the work \u2014 they just weren\u2019t getting value from it',
      paragraphs: [
        'Mochi had two separate systems tracking patient weight: the progress tracker (patient-facing, underused) and health checks stored on refills (used for provider review and approval \u2014 the key clinical workflow). Health check data powered refill decisions but wasn\u2019t saved or surfaced to patients. They filled out health checks every cycle and got nothing back from it. Meanwhile, the progress tracker \u2014 built to store and display exactly this kind of data \u2014 sat mostly empty because patients had to log separately.',
        'I unified them. Both entry points still work, but data flows to one place. Health check data now automatically populates the progress tracker. Patients get a filled-out progress history without any additional effort. Providers get the timestamped weight and side effect data they need to approve refills. Two redundant systems replaced by one \u2014 patients get value from work they were already doing, the provider denial problem is solved, and the backend is significantly simplified.',
        'Tracker usage increased ~60% on top of the previous 53% gain. The number is partly a technicality \u2014 data now routes there automatically \u2014 but the patient value is real. Their tracker reflects their actual journey without requiring extra effort.',
      ],
      visual: {
        id: 'data-flow-diagram',
        caption: 'Data flow diagram \u2014 old state vs. new state showing unified data routing.',
      },
    },
    {
      id: 'tracker-resolution',
      heading: 'The feature nobody would invest in is now infrastructure they can\u2019t operate without',
      paragraphs: [
        'With the tracker tied to the clinical workflow, the backend limitations that previously blocked growth are now in planning \u2014 flexible data models that could expand to nutrition, labs, and physical activity tracking. Visual refresh proved demand. Integration proved strategic value. Investment followed.',
      ],
      visual: null,
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
        'Patients were getting charged for medication that never shipped',
      paragraphs: [
        'Mochi is a telehealth weight loss company where patients subscribe to GLP-1 medications. Billing ran monthly on Stripe\u2019s automation, but actually delivering medication required patients to request a refill, confirm details, complete a health check, and verify again. When everything aligned, it worked. When anything deviated \u2014 a missed step, a pharmacy delay, a supply issue \u2014 patients kept getting charged for medication that never shipped.',
        'A pharmacy shutdown in spring 2025 made the problem impossible to ignore. Patients went months without medication while charges continued. Fraud claims spiked, churn accelerated, and support was overwhelmed. The outage didn\u2019t create the problem. It revealed it.',
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
        'Billing triggers when an order is processed, not on a calendar',
      paragraphs: [
        'I replaced Stripe\u2019s calendar-based scheduling with custom billing logic tied to fulfillment events \u2014 defining timing rules, states, edge cases, and billing triggers that engineering built to spec. Patients only pay when medication is actually on its way.',
        'This also eliminated $200\u2013300k/month in Stripe scheduling costs. The service was expensive and structurally wrong for how medication fulfillment works \u2014 a lose-lose. Over 90% of users have migrated to the new model.',
      ],
      visual: null,
    },
    {
      id: 'timing-problem',
      heading:
        'Providers were denying refills because of a timing problem, not a data problem',
      paragraphs: [
        'A business decision to remove required health checks \u2014 intended to reduce patient friction \u2014 caused provider denial rates to spike 3x. Without recent weight and side effect data, providers couldn\u2019t confidently approve refills.',
        'The intuitive fix was to prompt patients to complete health checks. It didn\u2019t work. Refills were created 7 days before send and routed to providers immediately. Health check prompts went out at the same time. Providers could deny before patients ever responded. This wasn\u2019t a compliance problem \u2014 it was a timing problem.',
        'I moved data collection upstream. Scheduled prompts now start 14 days before a refill is created, feeding weight and side effects into a persistent progress tracker. By the time a provider sees a refill request, the data is already there. I kept the existing health check UI intact and routed data to tracker storage underneath \u2014 infrastructure first, UI migration later.',
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
        'Rigid 28-day cycles didn\u2019t match real patient behavior. If someone wanted to take a break \u2014 missed doses, travel, variable dosing \u2014 they had to cancel and re-onboard as a new user to restart. Delay and pause was one of our most requested features, and the data backed it up: over 20% of medication subscription churn was classified as preventable. These were patients who wanted a break, not an exit.',
        'Leadership rejected a true pause \u2014 unpredictable revenue and subscription state ambiguity. I designed delay instead: push your next order out up to 3 months, subscription stays active. Delayed revenue rather than full churn. A calendar selector gives patients direct control over their order schedule, with send date, estimated ship, and delivery windows updating based on pharmacy partner turnaround times.',
      ],
      visual: {
        id: 'delay-ui',
        caption:
          'Delay/scheduling calendar UI showing send date, ship estimate, and delivery window.',
      },
    },
    {
      id: 'resolution',
      heading: 'The system handles edge cases instead of creating them',
      paragraphs: [
        'Patients can trust that a charge means medication is on its way. Providers make refill decisions with real, timestamped data. The billing infrastructure that was costing $200\u2013300k/month is gone, and over 90% of users are on the new model. The health data routing I built here is what gave the progress tracker its strategic importance \u2014 that story continues in the next case study.',
      ],
      visual: null,
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
      visual: {
        id: 'uw-alert-overview',
        caption: 'Component documentation page \u2014 title, description, and live alert previews.',
        prototypeSrc: '/prototypes/uw-alert.html?view=overview',
        aspectRatio: '1 / 1',
      },
    },
    {
      id: 'uw-components',
      heading: 'I designed the first three components',
      paragraphs: [
        'But the real deliverable was building the system that builds the system: a documentation template accommodating engineers and non-technical designers, a process for translating Bootstrap patterns into opinionated, constrained components, and clear guidance on what the system shouldn\u2019t do.',
      ],
      visual: {
        id: 'uw-alert-dosdonts',
        caption: 'Best practices \u2014 do\u2019s and don\u2019ts with live alert examples.',
        prototypeSrc: '/prototypes/uw-alert.html?view=dosdonts',
        aspectRatio: '3 / 4',
      },
    },
    {
      id: 'uw-insight',
      heading: 'The key insight: design systems get adopted when they accommodate existing workflows instead of demanding new ones',
      paragraphs: [
        'Code snippets toggled on or off depending on your role. A framework dropdown let teams grab code in their stack. Infinite customization isn\u2019t flexibility \u2014 it\u2019s abdication. A system needs opinions.',
      ],
      visual: {
        id: 'uw-alert-code',
        caption: 'Toggle code visibility and switch between HTML, Vue, and Angular.',
        prototypeSrc: '/prototypes/uw-alert.html?view=code',
        aspectRatio: '3 / 4',
      },
    },
  ],
  gallery: [
    {
      id: 'uw-alert-a11y',
      caption: 'Accessibility guidance \u2014 ARIA roles, keyboard navigation, and focus management.',
      size: 'half',
      prototypeSrc: '/prototypes/uw-alert.html?view=a11y',
      aspectRatio: '3 / 4',
    },
    {
      id: 'uw-alert-props',
      caption: 'Properties reference \u2014 component API with types, values, and defaults.',
      size: 'half',
      prototypeSrc: '/prototypes/uw-alert.html?view=props',
      aspectRatio: '3 / 4',
    },
  ],
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
        'Master\u2019s capstone, 2024. Sony\u2019s TV division asked us to explore how AR/MR might shape home entertainment. We interviewed young adults expecting to hear about picture quality. Instead we heard about compromise: subtitles or not, volume levels, lighting preferences. Someone always loses.',
        'Despite the compromises, people kept watching together. The value isn\u2019t the content \u2014 it\u2019s laughing at the same moment, discussing afterward, being present together. Current technology makes that connection harder, not easier. The design challenge was clear: give each person what they need without forcing everyone to settle on the same thing.',
      ],
      visual: null,
    },
    {
      id: 'sony-wearables',
      heading: 'Wearables solve personalization by killing the thing that matters',
      paragraphs: [
        'Apple Vision Pro had just launched. Wearables were the obvious path \u2014 personalized visuals and audio for each viewer. Technically feasible, proven model, industry momentum. We debated it seriously.',
        'But our research kept pulling us back: the reason people watch together is presence. You can\u2019t catch someone\u2019s eye during a tense scene through a headset. Even at the smallest form factor, there\u2019s something between you and your people. We weren\u2019t designing separate realities optimized for each person. We were preserving a shared reality that works for everyone. This is a values decision, not a technical one. That\u2019s the point.',
      ],
      visual: null,
    },
    {
      id: 'sony-concept',
      heading: 'Screenless TV: shared space, personalized experience',
      paragraphs: [
        'A volumetric display projected from a flat device \u2014 no screen on the wall, no headset. The display appears when you want it and disappears when you don\u2019t. Angle-specific imagery means you see subtitles in your language while your partner sees theirs. Directional audio delivers different volumes to different positions. Personalization without isolation.',
      ],
      visual: {
        id: 'sony-concept-render',
        caption: 'Concept renders showing the disappearing display and shared-but-personalized viewing.',
      },
    },
    {
      id: 'sony-testing',
      heading: 'Users didn\u2019t care how it worked \u2014 they cared that it kept them together',
      paragraphs: [
        'We tested through video prototypes and AR simulations. Participants connected with the disappearing moment and with familiar touchpoints like a remote control that grounded novel technology in something they already understood. But the strongest response wasn\u2019t to any specific feature \u2014 it was to the idea that technology could facilitate togetherness instead of fragmenting it.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const cipElectionMisinformation: CaseStudy = {
  id: 'cip-election-misinformation',
  title: 'Framing election misinformation',
  subtitle: 'Publications at CSCW 2025',
  timeline: '',
  sections: [
    {
      id: 'cip-paper-1',
      heading: 'What is going on? An evidence-frame framework for analyzing online rumors about election integrity',
      paragraphs: [
        'Kate Starbird, Stephen Prochaska, Ben Yamron \u2014 Center for an Informed Public & Human Centered Design & Engineering, University of Washington',
        'Pervasive falsehoods that erode trust in election processes are of increasing concern to democracies around the world. Misleading claims like these are often understood as simply \u201cgetting the facts wrong\u201d. Using a grounded, interpretative, mixed-method approach to study Twitter activity during the 2022 U.S. Midterm Election in Arizona, our work paints a more nuanced picture. We adapt Klein\u2019s data-frame theory of collective sensemaking to online rumors, demonstrating how misleading claims about election administration take shape online through interactions between (often factual) evidence and frames.',
        'Our work highlights how rumors are as much about political framing as they are about faulty facts, and locates the crux of the problem of misinformation in the interactions with and between evidence and distorted political frames.',
      ],
      visual: null,
    },
    {
      id: 'cip-paper-2',
      heading: 'Deep Storytelling: Collective Sensemaking and Layers of Meaning in U.S. Elections',
      paragraphs: [
        'Stephen Prochaska, Julie Vera, Douglas Lew Tan, Ben Yamron, Sylvie Venuto, Amaya Kejriwal, Sarah Chu, Kate Starbird \u2014 Center for an Informed Public, Human Centered Design & Engineering & Information School, University of Washington',
        'We examined false and misleading information surrounding the 2020 and 2022 U.S. national elections, focusing on the contextual features of online conversations that fueled various rumors. By integrating multi-layered qualitative coding with thematic analysis and quantitative visualizations, we show how influencers, political elites, and audiences collaboratively told deep stories from 2020 through 2022.',
        'As these stories were told, audiences interpreted events in 2022 through the lens of the 2020 story, guided by influencers\u2019 cues, leading to an evolution in storytelling style between the two election cycles.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const duolingoLanguagesFlags: CaseStudy = {
  id: 'duolingo-languages-flags',
  title: 'Languages \u2260 Flags',
  subtitle:
    'Languages don\u2019t map to flags. I redesigned Duolingo\u2019s course selection to fix a system that excludes, confuses, and can\u2019t follow its own logic.',
  timeline: 'Personal project, 2020',
  sections: [
    {
      id: 'duo-problem',
      heading: 'Before I was a designer, I was an international studies student and a longtime Duolingo user',
      paragraphs: [
        'I noticed something that bothered me: Duolingo represents language courses with flags. But which flag represents Spanish \u2014 Spain? Mexico? The 19 other countries? Which flag gets Portuguese \u2014 Brazil or Portugal? The current system can\u2019t follow logic because languages and flags don\u2019t map cleanly. It excludes, confuses, and the CEO has acknowledged it\u2019s flawed.',
      ],
      visual: null,
    },
    {
      id: 'duo-solution',
      heading: 'Curiosity and a problem worth solving \u2014 that was enough to start',
      paragraphs: [
        'After researching the problem, illustrating flags for 20+ countries, and iterating through possible solutions, I landed on something simple: use ISO-639 language codes for course selection (standardized, uniform length, immediately implementable) and repurpose flags to highlight cultural diversity within course content \u2014 stories, roleplay scenarios, loading screens.',
      ],
      visual: {
        id: 'duo-redesign',
        caption: 'Course selection redesign using ISO-639 language codes.',
      },
    },
    {
      id: 'duo-result',
      heading: 'One change removes the problem. The other turns flags into an asset.',
      paragraphs: [
        'Duolingo, if you\u2019re reading this \u2014 just do it. I\u2019ll wait.',
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

export const caseStudiesBySlug: Record<string, CaseStudy> = {
  'mochi-ai-tooling': mochiAiTooling,
  'mochi-progress-tracker': mochiProgressTracker,
  'mochi-subscriptions': mochiSubscriptions,
  'uw-design-system': uwDesignSystem,
  'sony-screenless-tv': sonyScreenlessTv,
  'cip-election-misinformation': cipElectionMisinformation,
  'duolingo-languages-flags': duolingoLanguagesFlags,
  'acorn-eat-local-vt': acornEatLocalVt,
}
