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
  title: 'AI tools that know how the product works',
  subtitle:
    'Mochi ran on institutional knowledge held by a few people. I built a shared source of truth for how the product works, and tools on top of it for design, dev, and product work, that let me ship, test, and shape the product well beyond a designer’s usual reach.',
  timeline: '2025–2026',
  narrative: [
    'Like most startups, Mochi optimized for shipping fast over documenting how things worked, so the product ran on institutional knowledge held by a few people. Everyone else waited on them, and those few kept getting pulled off their own work to answer. Progress moved at the speed of whoever held the answer.',
    'So I built a shared source of truth for how the product works — the specialized knowledge about the codebase and the business — and, on top of it, tools for design, dev, and product work. Keeping it current mattered as much as building it. Stale documentation is worse than none, because people and AI trust it and build on the outdated fact. An audit found 1 in 5 facts had drifted, so I made the system maintain itself. A scheduled routine reads each week’s code changes, judges what matters, and rewrites the docs, checking every claim against the source.',
    'For me, it removed the usual limits on what a designer can do alone. With these tools I now ship to production myself (bug fixes, UX polish, and design-system updates, in code), set up and run my own testing, inform product strategy with my own data, and build internal tools on top, like the <a href="/project/patient-state-factory" data-contact-card style="color: var(--text-grey); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">Patient State Factory</a>. Other people use them too, but I’m the clearest example of what they open up.',
  ],
}

export const mochiProgressTracker: CaseStudy = {
  id: 'mochi-progress-tracker',
  title: 'Empowering weight loss through progress tracking',
  subtitle:
    'Mochi tracked weight in two places that didn’t talk to each other. I connected them, so provider-recorded weights now show up automatically in the patient’s tracker. Separately, I redesigned the tracker with mobile support, which drove a 53% increase in weekly active users within two weeks.',
  timeline: 'Q3 2025 \u2013 Q1 2026',
  narrative: [
    'Patients reported their weight to their provider every month, and most still saw nothing in their own progress tracker. Mochi tracked weight in two places that didn’t talk to each other — one for patients, one for providers — so I connected them. Provider-recorded weights now show up in the patient’s tracker automatically. Patients get a filled-out history without logging anything, and providers get the data they need to approve refills. It started as a low-priority feature, and it’s now infrastructure the clinical team can’t operate without.',
    'The surface layer mattered too. The tracker had 30% lifetime usage, mostly because it didn’t work on mobile. I redesigned it with mobile support and cleaner data visualization, and weekly active users went up 53% within two weeks.',
  ],
  sections: [
    {
      id: 'tracker-problem',
      heading: 'Only 30% of patients had ever used our progress tracker',
      paragraphs: [
        'Patients tracked their weight loss in third-party apps instead. The company wanted to invest but couldn’t justify it, since there was no clear connection to revenue. The design reflected that neglect — unclear data visualization, no mobile support, and rigid logging that forced you to enter every metric at once.',
      ],
      visual: null,
    },
    {
      id: 'visual-refresh',
      heading: 'A visual refresh and mobile support drove a 53% increase in weekly active users',
      paragraphs: [
        'I redesigned the tracker on the new design system, added mobile support, separated the logging entry points, and cleaned up the weight graph. Within two weeks, weekly active users were up 53% and logging frequency was up 57%.',
      ],
      visual: {
        id: 'tracker-before-after',
        caption: 'Before/after of the tracker UI \u2014 the contrast should be immediately obvious.',
      },
    },
    {
      id: 'data-unification',
      heading: 'The tracker’s real value was as a data conduit',
      paragraphs: [
        'Mochi had two separate systems tracking patient weight — one for patients, one for providers — and neither talked to the other. Patients logged weight in the app, and providers recorded it separately during check-ins. I connected them so provider-recorded weights show up in the patient’s tracker automatically. Patients get a filled-out history without any extra effort, and providers get the timestamped data they need to approve refills. A feature that started as low-priority is now infrastructure the clinical team can’t operate without.',
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
    'Billing and fulfillment were two independent systems, so patients got charged whether their medication shipped or not. I worked with two engineers to rebuild billing so charges only trigger on shipment, gave patients control over their schedule, and cut more than $200k/month in infrastructure costs. Over 90% of users migrated.',
  timeline: 'Q3 2025 \u2013 Q1 2026',
  narrative: [
    'Mochi is a telehealth subscription — patients pay monthly for weight loss medication and ongoing care. But billing and fulfillment ran as two independent systems. Patients got charged on a fixed monthly schedule regardless of whether their medication had shipped, and when the two diverged, people paid for medication they never received. I worked with two engineers to rebuild our billing scheduling logic from scratch, replacing a third-party service and defining every status, error state, and edge case ourselves. Charges now only trigger on shipment. That cut more than $200k/month in payment processing overhead, and over 90% of users have migrated.',
    'With the foundation fixed, I went after the problems around it. Refill denial rates had spiked 3×, because providers were reviewing refills before patients had a chance to submit updated health information. I moved data collection 14 days earlier in the cycle so the information is already there when the provider looks. Separately, about 20% of subscription churn was just patients who wanted a break. I designed a delay feature that lets users push their next order out up to three months, plus a restart flow — so if they do cancel, they can pick up where they left off instead of being treated like a new patient.',
    'Now we’re building the subscription entity to handle any medication type, not just GLP-1s — the same system, flexible enough to scale as Mochi’s offering grows.',
  ],
  heroVisual: {
    id: 'hero-mochi',
    caption: 'Mochi subscription management dashboard overview.',
  },
  sections: [
    {
      id: 'billing-problem',
      heading:
        'Billing and fulfillment were two independent systems, and patients paid the price',
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
        'I defined the timing rules, states, edge cases, and billing triggers, and engineering built them to spec. It also cut more than $200k/month in payment processing overhead, and over 90% of users have migrated.',
      ],
      visual: null,
    },
    {
      id: 'timing-problem',
      heading:
        'Refill denial rates spiked 3x — and it turned out to be a timing problem',
      paragraphs: [
        'Removing the required check-ins meant providers were denying refills they couldn’t confidently approve. The intuitive fix — prompting patients for updated health information — didn’t work, because providers reviewed refills before patients had a chance to respond. So I moved data collection 14 days earlier in the cycle, and the information is already there by the time providers review.',
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
        'Rigid 28-day cycles meant a patient who wanted a break had to cancel and re-onboard. Leadership wouldn’t approve a true pause, so I designed delay — push your next order out up to three months, and your subscription stays active. It turns full churn into delayed revenue.',
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
  title: 'Kickstarting an early-stage design system',
  subtitle:
    'UW-IT had started a design system that existed only as colors and principles — there were no components yet. I designed the first three components, and the documentation structure for everything that would follow them.',
  timeline: '2024',
  narrative: [
    'UW-IT manages digital services for more than 90,000 students, faculty, and staff. They had started a design system that existed only as colors and principles — no components yet. I designed the first three, plus the documentation structure for everything that would follow. The docs toggled code snippets by role, and a framework dropdown let teams grab code in their own stack, so engineers could adopt the system without changing how they already worked.',
    'The hard part was deciding what the system shouldn’t do. Infinite customization looks like flexibility, but it’s really just abdication — a system needs opinions. I scoped components with strong defaults, kept enough flexibility to be useful in the real world, and wrote explicit guidance on when to break from the system instead of pretending it covers every case.',
  ],
  sections: [
    {
      id: 'uw-context',
      heading: 'UW-IT manages digital services for 90,000+ students, faculty, and staff',
      paragraphs: [
        'They had started building a design system that existed only as colors and principles\u2009\u2014\u2009there were no components yet.',
      ],
      visual: null,
    },
    {
      id: 'uw-components',
      heading: 'I designed the first three components',
      paragraphs: [
        'But the real deliverable was the system that builds the system — a documentation template that works for both engineers and non-technical designers, a process for turning existing UI patterns into opinionated, reusable components, and clear guidance on what the system shouldn’t do.',
      ],
      visual: null,
    },
    {
      id: 'uw-insight',
      heading: 'Design systems get adopted when they fit existing workflows instead of demanding new ones',
      paragraphs: [
        'Code snippets toggled on or off depending on your role, and a framework dropdown let teams grab code in their stack. The system met people where they were on adoption — but it stayed opinionated about the design itself, because infinite customization isn’t really flexibility, it’s just abdication.',
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
    'People watch TV together for the connection, not just the content. For my master’s capstone at UW, I led design on a speculative project for Sony’s TV division — a volumetric display that personalizes the experience for each viewer without isolating anyone.',
  timeline: 'Q1 \u2013 Q3 2024',
  narrative: [
    'People watch TV together for the connection, not just the content. They compromise constantly — subtitles, volume, lighting — and keep watching together anyway. Almost every attempt at personalization so far has meant isolation: headphones, second screens, headsets. We wanted to personalize the experience without splitting the room up.',
    'For my master’s capstone at UW, I led design on a speculative project for Sony’s TV division about the future of television. We designed around a volumetric display — technology that exists today — that projects into physical space without a physical footprint. The screen can be moved and resized, and it disappears completely when you turn it off. Angle-specific imagery and directional audio give everyone in the room their own subtitles, volume, and lighting, without anyone having to wear anything. I kept the interaction patterns deliberately familiar (a remote with Wiimote-style gestures for the new functions) because the product had to feel like a TV, not a tech demo. We prototyped in Figma, Adobe Aero (AR spatial), and After Effects (video walkthrough), and presented to Sony’s directors and product planners.',
  ],
  sections: [
    {
      id: 'sony-research',
      heading: 'People don\u2019t watch together for the content \u2014 they watch together for the connection',
      paragraphs: [
        'A speculative vision project for Sony’s TV division (master’s capstone, 2024). Sony asked us to explore how mixed reality might shape home entertainment. We went in expecting to hear about picture quality, and what we heard about instead was compromise — subtitles, volume, lighting — and the fact that people kept watching together anyway. The value people were protecting was presence, more than the content itself.',
      ],
      visual: null,
    },
    {
      id: 'sony-wearables',
      heading: 'Why we rejected wearables',
      paragraphs: [
        'Apple Vision Pro had just launched, so wearables were the obvious path. But you can’t catch someone’s eye during a tense scene through a headset. This was really a values call more than a technical one — we didn’t want to build separate realities optimized for each person. We wanted to preserve a shared one that works for everyone in the room.',
      ],
      visual: null,
    },
    {
      id: 'sony-concept',
      heading: 'Screenless TV: shared space, personalized experience',
      paragraphs: [
        'A volumetric display projected from a flat device — no screen, no headset. Angle-specific imagery lets each viewer see their own subtitles, and directional audio delivers a different volume to each position in the room. Everyone gets their own experience without leaving the shared one.',
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
    'Election rumors usually aren’t about getting the facts wrong — they’re about how the facts get framed. Working with Dr. Kate Starbird’s research group at UW’s Center for an Informed Public, I analyzed how election misinformation spreads on Twitter. A photo, a statistic, or a real policy change becomes misleading depending on the narrative wrapped around it. I helped build a framework that maps how identical evidence gets assembled into opposing claims. Two papers presented at CSCW 2025.',
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
        'I analyzed how misleading claims spread on Twitter during the 2020 and 2022 U.S. elections. What we kept finding was that these claims often start with real evidence — a photo, a statistic, a policy change — and become misleading through the political frame applied to them. We built a framework that maps how the same evidence gets assembled into very different narratives depending on who’s telling the story.',
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
  subtitle: 'Duolingo represents every language with a flag, but there’s no logic the mapping can actually follow. One change removes the problem, and a second one turns flags into an asset.',
  timeline: '2020',
  narrative: [
    'Duolingo represents every language with a flag — but which flag stands for Spanish? Spain? Mexico? The mapping can’t follow any logic, because there isn’t one to follow. When it breaks down completely — the Arab League flag for Arabic, Hawaii’s state flag for Hawaiian — the fallback is a flag most users couldn’t identify anyway. Users call this out regularly, Duolingo’s CEO has acknowledged it’s flawed, and the W3C recommends against it.',
    'The fix is a single change: replace the flags in course selection with ISO-639 language codes — “ES” for Spanish, “AR” for Arabic, “HAW” for Hawaiian. They’re standardized, uniform, and easy to style to match Duolingo’s visual language, and you could ship it tomorrow. Then repurpose flags everywhere else — in stories, roleplay scenarios, loading screens — to highlight the cultural diversity the current system flattens. One change removes the problem, and the other turns flags into an asset.',
  ],
}

export const acornEatLocalVt: CaseStudy = {
  id: 'eat-local-vt',
  title: 'Connecting farmers and customers during COVID-19',
  subtitle:
    'First app I ever shipped. Taught myself product design as a college student, gathered a team of eight, and built a cross-platform app connecting Vermont customers to local farms after COVID shut down farmers markets.',
  timeline: '2020\u20132021',
  narrative: [
    'First app I ever shipped. Taught myself product design as a college student, gathered a team of eight, and built a cross-platform app connecting Vermont customers to local farms after COVID shut down farmers markets. 300+ farms, 1,100+ downloads. None of us had built anything before.',
    'I sat in on every engineering meeting — not because I understood all of it, but because I wanted to be a real partner in the build. That instinct stuck, and I still treat engineering collaboration as the starting point rather than the handoff.',
  ],
}

export const trioTodoList: CaseStudy = {
  id: 'trio-todo-list',
  title: 'A todo list for focus and prioritization',
  subtitle:
    'Most todo apps give you a list and leave the rest to you. I built one that maintains itself\u2009\u2014\u2009pairwise comparisons keep everything ranked, and your active list can only hold three at a time.',
  timeline: '2026',
  narrative: [
    'You have a finite day and too many things to do. Most todo apps give you a list and leave the rest to you\u2009\u2014\u2009ordering, prioritizing, deciding what actually matters today. It gets out of hand fast, and once it does, the list works against you instead of for you.',
    'So I built a todo app that maintains itself, doing a little work at the moment you add something instead of leaving it all to you. Every task gets ranked through pairwise comparisons — you pick between two tasks at a time, and the system keeps a running priority order. No dragging, no labels, no upkeep. When you’re ready to work, you pull tasks into Today, but you can only hold three at once. Finish one, pull the next. The constraint keeps you moving instead of staring at the list.',
  ],
  sections: [
    {
      id: 'trio-product',
      heading: 'Three tasks at a time is the whole product',
      paragraphs: [
        'Most todo apps show you everything. Trio forces one question — what are the three things that matter today? There’s a queue of three, a ranked backlog behind it, and a ranking system where you compare two tasks at a time and the app keeps the rest in order for you. No scrolling through 40 items hoping the right one jumps out. It’s a small surface with a surprising amount of design space behind it.',
      ],
      visual: null,
    },
    {
      id: 'trio-design-language',
      heading: 'A design language from first principles',
      paragraphs: [
        'I studied 40+ screens across seven apps — Claude, Linear, Waymo, Notion, Asana, Apple Notes, Slack — and pulled out 10 recurring visual patterns. Those became an 8-principle design language: tasks are the only elements that get containers, and everything else sits flat on the surface. Content sits above navigation in a three-layer depth model. Typography carries the whole hierarchy — pushing page titles from 20pt SemiBold to 28pt Bold changed how the entire app feels. And there are five hand-tuned color themes with per-hue HSB saturation curves, because different hues need different saturation to read as equally colorful.',
      ],
      visual: null,
    },
    {
      id: 'trio-ai-partner',
      heading: 'AI as design partner, not autocomplete',
      paragraphs: [
        'I structured my AI workflow the same way I’d structure a team — clear roles, documented decisions, and guardrails that catch mistakes. When the AI silently undid a bug fix during an unrelated change, I didn’t just re-fix it. I built a review process that stops it from happening again. Using AI well has much less to do with prompting than with the systems you build around it.',
      ],
      visual: null,
    },
    {
      id: 'trio-craft',
      heading: 'Craft shows up where nobody\u2019s looking',
      paragraphs: [
        'Seven iterations on a single drawer animation. A backlog panel that morphs from a capsule button into a full-width sheet, with corner radius, width, height, and opacity all driven by one value — so the transition reads as one continuous movement rather than four things changing at once. Every spring animation is named, tuned to a specific feel (snappy, gentle, bouncy), and documented. The font switcher went through seven iterations of its own just on the color picker — getting the staggered fan animation to feel right when each swatch travels a different distance.',
      ],
      visual: null,
    },
    {
      id: 'trio-depth',
      heading: 'Small surface, deep space',
      paragraphs: [
        'A three-task queue, one app, one person. But each constraint generated real design questions. What happens when you add a fourth task? (Bump the lowest-priority one to the backlog and show a toast.) Should the backlog live on its own page? (No — merge it into Today so you see the queue and backlog as one prioritized list.) How should the ranking comparisons feel physically? (A haptic “ta-da” on completion, light taps on each comparison, a success notification when ranking finishes.) Going deep on a narrow product — with AI tools that let one person hold production-grade craft — is where the interesting design problems actually live.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const languageApp: CaseStudy = {
  id: 'language-app',
  title: 'Voice-first language practice with personalized feedback',
  subtitle:
    'Most language apps teach you to tap and swipe — not speak. I’m building an iOS app with two modes: a five-minute voice conversation with an AI partner, and a feed of corrections built from things you actually said.',
  timeline: '2026',
  narrative: [
    'Most language-learning apps underindex on speaking practice, and the ones that let you speak with an AI often run $20–30 a month. I wanted to practice exactly the way I wanted for a fraction of that. So I’m building an app for intermediate-to-advanced learners who don’t need a curriculum — they need to talk, and they need to know what to fix. It has two modes: voice calling with an AI partner powered by the Gemini Live API, and a feed of corrections synthesized from things you actually said. No streaks, no XP, no levels.',
    'I’ve been having fun tuning the AI’s personality so it holds conversations I actually want to have, and keeping the rest of the app quiet around that one core function. I’ve been playing with shaders for some subtle visual accents, and building a delivery system for corrections that are personalized, actionable, and easy to act on.',
    'Built solo on iOS 26. Privacy first. BYOK keeps the app affordable.',
  ],
}

export const manipulationIdentifier: CaseStudy = {
  id: 'manipulation-identifier',
  title: 'Detecting manipulative language on the web',
  subtitle:
    'A Chrome extension that uses LLMs to identify and explain psychological manipulation tactics on the pages you read — fear-mongering, false dichotomies, ad hominem attacks, and others. Highlight and explain, never block.',
  timeline: '2025 – 2026',
  narrative: [
    'In my <a href="/project/cip-election-misinformation" data-contact-card style="color: var(--text-grey); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">research on misinformation</a> at the University of Washington, I learned that misinformation often isn’t about outright lies or incorrect facts — it’s about the way information is framed. Sources use a range of manipulation tactics and logical fallacies to stretch the truth and build alternate realities, whether or not they ever technically lie. In a world of information overload and competing realities, it matters that people can think critically about what they read. I built this browser extension to surface those tactics and fallacies so readers can engage with what they’re reading more deliberately. The goal is to help people spot manipulation rather than be shielded from it — closer to <a href="https://prebunking.withgoogle.com/" target="_blank" rel="noopener noreferrer" data-contact-card style="color: var(--text-grey); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">Jigsaw’s work on "prebunking"</a> at Google (another core inspiration) than to fact-checking. It doesn’t discredit anyone in particular. It gives readers the tools to question and validate what they’re being asked to believe, and to recognize when someone is trying to mislead them.',
    'The extension highlights tactics inline on the page, color-coded by category (logical, rhetorical, credibility), and explains them in a side panel. It never blocks or hides content. By default the UI stays quiet — short definitions, and lower-confidence flags rendered softer. A "Why?" toggle on each flag lets readers zoom in for the full explanation when they want it.',
    'With this many tactics and an LLM doing the labeling, false positives are a bigger risk than missed tactics. I built an evaluation harness around a hand-curated test corpus, so prompt changes can be measured instead of guessed at. BYOK Gemini key, no telemetry, nothing collected.',
  ],
}

export const optimizingMyWorkflow: CaseStudy = {
  id: 'optimizing-my-workflow',
  title: 'Optimizing my AI development workflow',
  subtitle:
    'Claude Code\u2019s configuration infrastructure is powerful, but keeping it optimized is real work. I built a Claude Code plugin that watches your sessions, detects patterns, and proposes improvements\u2009\u2014\u2009rules, hooks, skills, scoped artifacts. Everything is a proposal you review. Nothing auto-applies.',
  timeline: '2026',
  narrative: [
    'Claude Code’s configuration infrastructure is powerful — rules, hooks, skills, agents, references, all scoped and layered. Keeping it optimized as your project evolves is real, ongoing work. I built a plugin that does that part for you: it treats your configuration as a living body of work, watches your sessions, detects patterns in how you work, and keeps proposing improvements that hold the setup sharp.',
    'Keep correcting Claude about the same thing? The plugin drafts a rule. Always running pytest after an edit? It drafts a hook. A bloated CLAUDE.md? It breaks the file into scoped artifacts that only load when they’re relevant. Stale rules get flagged for removal. Proposals run through a two-stage pipeline — Python preprocessing to detect candidates, then an LLM quality gate to filter out noise. It also learns from your feedback: dismiss a proposal as low-impact and it deflates similar scores next time; approve one and it watches whether the pattern actually stops. Everything is a proposal you review. Nothing auto-applies.',
    'I got a working version in two days, and I run it actively across my other projects, iterating on the results.',
  ],
}

export const flow: CaseStudy = {
  id: 'flow',
  title: 'Designing trust into agentic coding',
  subtitle:
    'I build a lot with AI, and Flow is where I make my own coding loops run more autonomously without letting quality slip. It’s a Claude Code plugin with two human gates — approving the plan and merging — with layered design and engineering review in between, a feedback loop that sharpens it over time, and a documented record of every run.',
  timeline: '2026',
  narrative: [
    'I build a lot with AI, and Flow is where I push my own coding loops to run more autonomously — hand off a plan, let the agent execute, and stop steering it prompt by prompt. The challenge is holding quality steady as I hand off more of the work, and that’s what Flow is built for.',
    'Two moments stay mine. I approve the plan before anything is built, and I merge at the end. Everything in between runs through layers of review before it reaches me — design lenses and a visual pass on one side, correctness, accessibility, and security on the other — and any of them can send the work back. I’m closest to the design review, and the engineering reviews cover the parts I’d rather not check by eye. By the merge gate, the work has been vetted the way a good team would vet it.',
    'Flow also learns as it goes. Feedback from the agent critiquing its own work, and from me at the two gates, gets logged and fed back in, so the same mistake gets caught earlier next time and the reviews sharpen as I go. Every run documents itself too — what changed, which checks ran, what got decided. Speed was never the whole point. I wanted a loop I can trust and actually see into.',
  ],
  heroVisual: {
    id: 'hero-flow',
    caption: 'A Flow pull request — the visual walkthrough, the design and engineering reviews, and the merge gate I hold.',
  },
  sections: [
    {
      id: 'flow-trust',
      heading: 'The constraint stopped being what I could build',
      paragraphs: [
        'AI coding removed the ceiling on what I could make, and I was shipping things that used to be out of reach. The new bottleneck was trust. A long autonomous run can produce something that looks done but isn’t, and as a non-technical designer I can’t catch the engineering problems by reading the diff. Building more, faster only matters if I can trust what comes out, so Flow is built to earn that trust rather than to watch the agent work.',
      ],
      visual: null,
    },
    {
      id: 'flow-intent',
      heading: 'The plan gets audited and critiqued before I approve it',
      paragraphs: [
        'I’d rather catch problems in the plan, where they’re cheap, than find them in the output. Flow audits and critiques every plan for unverified assumptions and scope drift, iterates on it automatically, then stops for my approval. I’m reviewing at the altitude I actually think at, direction and scope, rather than implementation. Nothing gets built until the intent is right.',
      ],
      visual: null,
    },
    {
      id: 'flow-design',
      heading: 'Much of the design happens in code, so the walkthrough is how I steer',
      paragraphs: [
        'Much of this design happens in code rather than on a Figma canvas, so the running output is the artifact. That makes the feedback surface the thing I care most about — how fast I can get signal on what the agent produced, and how efficiently I can push it further. Flow hands me a tailored walkthrough that’s already been through the review cycle, so I’m reacting to polished output instead of raw drafts. Inline annotations let me pin a comment to a specific screen, and one click sends the whole set back to the agent. My feedback also updates the project’s design-language docs, so the bar I set holds on the next run.',
      ],
      visual: {
        id: 'flow-walkthrough-render',
        caption: 'The HTML walkthrough that opens every PR — screenshots of what changed, with a click-to-pin layer for dropping feedback exactly where it belongs.',
      },
    },
    {
      id: 'flow-divergence',
      heading: 'The divergent design work happens before I enter the loop',
      paragraphs: [
        'The obvious risk with letting an agent make most of the decisions and only showing me polished output is that I skip the messy, divergent iteration where design actually happens. I handle that before I enter the loop. Early on I curate heavily — talking through the idea in a chat, exploring divergent directions through quick HTML iterations, jumping into Figma when I need to — and I write the design-language documentation that encodes my decision framework, so the hundreds of small choices the agent makes downstream inherit my intent. Once we’ve landed on a direction, I switch to steering. Flow is the convergence-and-verification loop, and I keep the divergence deliberately upstream.',
      ],
      visual: null,
    },
    {
      id: 'flow-engineering',
      heading: 'I trust the merge because the loop reviewed what I can’t',
      paragraphs: [
        'The system supplies the judgment I can’t. The loop is aligned to Anthropic’s agent best practices and runs independent reviews for engineering correctness, accessibility, and security before anything reaches me, and any of them can send the work back. By the time I’m at the merge gate, I’m approving output that already passed the checks an engineer would run, not code I can’t read myself. That’s why the final gate is mine to hold.',
      ],
      visual: null,
    },
    {
      id: 'flow-thesis',
      heading: 'Building beyond my own skill set, without lowering the bar',
      paragraphs: [
        'Flow is infrastructure, but what I’m really designing is the relationship between a designer and an autonomous system. I stay in control where my judgment is real, intent and design; I delegate the verification I can’t do myself; and I hold the bar high on both. The result is production software I could never have built alone, that I trust, and that’s better for the process. I run Flow on everything I build, including itself.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const healthTracker: CaseStudy = {
  id: 'health-tracker',
  title: 'A health tracker that leads with insight, not dashboards',
  subtitle:
    'Most health apps hand you a dashboard and leave the interpreting to you. I’m building one that’s just as comprehensive but far more considerate about your attention. It does the interpreting, leads with what’s worth noticing, and never sounds an alarm to do it. It’s a private, on-device iOS app, still in progress.',
  timeline: '2026',
  narrative: [
    'Most health apps hand you a dashboard and leave the interpreting to you, showing every metric all the time in charts you have to read and rank yourself. I’m building one that’s just as comprehensive but far more considerate about your attention. It does the interpreting, leads with what’s worth noticing, and never sounds an alarm to do it.',
    'The home page reads your data and adapts, surfacing what changed or needs a look and keeping the rest quiet, so a glance tells you where you stand. There’s no red, no readiness score, no ranking your body against yesterday. It tells you what’s going on without telling you how to feel about it.',
    'It’s a private, on-device iOS app, still in progress. It covers a focused set of metrics now, built to grow into a full tracker. The design system is done, and the build is underway.',
  ],
  heroVisual: {
    id: 'hero-health-tracker',
    caption: 'The adaptive home page — the same app rendering calm, a single shift, and a notable trend on three different days.',
  },
  sections: [
    {
      id: 'ht-attention',
      heading: 'Most days, the home screen is a single calm line',
      paragraphs: [
        'The home page doesn’t show the same dashboard every day. It reads what the data is doing and renders at one of three volumes: a quiet sentence when everything is steady, a single row when one metric shifts, or a full chart, which appears only when a trend clears three independent tests for magnitude, persistence, and isolation from correlated noise. It never inflates a level to fill space, so most days it stays quiet. Other apps show you everything and leave you to find what matters. This one does the finding and stays out of the way otherwise.',
      ],
      visual: {
        id: 'ht-home-states',
        caption: 'The three attention volumes — paragraph, rows, and anchor chart — triggered by what the data has earned, not a fixed template.',
      },
    },
    {
      id: 'ht-rangebar',
      heading: 'Heart rate is a range, so I drew it as one',
      paragraphs: [
        'Most apps collapse heart rate to a line or a daily average and throw away its texture, even though it’s sampled hundreds of times a day. I passed on the usual line chart for a range bar: a floor at the period low, a ceiling at the high, and a marker at the median, set against a soft band of your personal baseline. The chart itself shows that heart rate is a range rather than a single number. Every scope, day, week, month, year, uses the same chart, so the eye attends to the data instead of relearning the visual each time.',
      ],
      visual: {
        id: 'ht-range-bar',
        caption: 'The heart-rate range bar — low, high, and median against a personal-baseline band, consistent across every time scope.',
      },
    },
    {
      id: 'ht-voice',
      heading: 'The app observes; it never moralizes your body',
      paragraphs: [
        'The interpretation layer follows one rule. It states what’s true and never tells the user who they are. “Sleep ran short” makes the data the subject, instead of “you didn’t sleep enough,” which is an accusation. Sage means steady and clay means worth noticing; there’s no red, and no good-or-bad coding of your own metrics. When the on-device model writes the prose, those rules are guardrails rather than suggestions. It can state what the data shows and lightly name population-level patterns, but it never claims a story about your life.',
      ],
      visual: null,
    },
    {
      id: 'ht-palette',
      heading: 'An ambient palette that reads the room',
      paragraphs: [
        'The background shifts along two independent axes, and neither is announced. Time of day moves the light, its angle tracking the sun across the day. Mood moves the warmth, a five-step rested-to-activated spectrum driven by heart-rate signals and expressed only as saturation and warmth, never as layout. I kept them separate on purpose, because merging them would imply a story the data doesn’t support, like “evening means relaxed.” Almost no one will consciously notice it, and that’s intentional. The app should feel like it’s paying attention even when it’s silent.',
      ],
      visual: null,
    },
    {
      id: 'ht-workflow',
      heading: 'Conceived in a chat, iterated in HTML, then built with Flow',
      paragraphs: [
        'This is the first project I took through the full process I’ve been building toward. It started in a Claude conversation, pressure-testing the philosophy against its counterarguments before I drew anything. I explored it through seventeen rounds of HTML iteration, each one reframing a specific question and locking a principle rather than polishing pixels, and then built it with Flow. The design-language documentation I wrote along the way — the attention thresholds, the voice rules, the color logic — is the decision framework the agent builds against, which is how a one-person project holds a production-grade bar.',
      ],
      visual: null,
    },
  ],
  gallery: [],
}

export const patientStateFactory: CaseStudy = {
  id: 'patient-state-factory',
  title: 'Patient State Factory: any account, any state',
  subtitle:
    'Testing on Mochi’s platform meant setting up account states by hand — dozens of database fields, every time. I built a panel that puts any account into any state in one click, so testing stops being gated by who’ll do the manual work.',
  timeline: '2026',
  narrative: [
    'Testing anything on Mochi’s platform meant first getting a patient account into the exact state you needed — mid-refill with a failed payment, mid-onboarding, a denied request. That meant changing the account by hand in the database, dozens of interdependent fields at a time. The friction did more than slow people down; it decided who could participate. Engineers often skipped it, non-technical teammates couldn’t do it at all, and testing defaulted to production, where real patient data can slip in a healthcare product.',
    'So I built a panel that puts any account into any state in one click. The right design came from throwing two earlier tries away. First I drove the staging database with an AI prompt, which proved the setup could be automated but not reliably. Then I built the simplest version, faking the state on the frontend, instantly, with no backend changes. It was elegant, but I threw it away, because you can’t follow a real flow against a simulation. The Factory does it for real instead. One click runs the cascading scripts that make every interdependent change, so the account behaves exactly as it would for a patient.',
    'It works because it stands on the <a href="/project/mochi-ai-tooling" data-contact-card style="color: var(--text-grey); text-decoration: underline; text-decoration-color: var(--text-underline); text-underline-offset: 4px; padding: 4px 8px; margin: 0 -8px; display: inline-block;">knowledge layer</a>, where the shared mappings already spell out which dependencies each script needs to touch. It’s also a good sign the layer compounds, because each version of the Factory got more reliable as the mappings grew.',
    'The result is that testing stopped being gated by who would do the manual work. Engineers set up states in seconds, anyone can reproduce a state to see how the product behaves, and more people can test, weigh in, and even contribute. It removes one major barrier in staging rather than all of them, but it’s the one that kept most people out.',
  ],
}

export const caseStudiesBySlug: Record<string, CaseStudy> = {
  'mochi-ai-tooling': mochiAiTooling,
  'patient-state-factory': patientStateFactory,
  // 'mochi-progress-tracker' intentionally unregistered — hidden from UI & URL; mochiProgressTracker export above is preserved for future restore.
  'mochi-subscriptions': mochiSubscriptions,
  'uw-design-system': uwDesignSystem,
  'sony-screenless-tv': sonyScreenlessTv,
  'cip-election-misinformation': cipElectionMisinformation,
  'duolingo-languages-flags': duolingoLanguagesFlags,
  'eat-local-vt': acornEatLocalVt,
  'trio-todo-list': trioTodoList,
  'language-app': languageApp,
  'manipulation-identifier': manipulationIdentifier,
  // 'optimizing-my-workflow' intentionally unregistered — Forge study hidden (superseded by Flow); optimizingMyWorkflow export preserved for restore.
  'flow': flow,
  'health-tracker': healthTracker,
}
