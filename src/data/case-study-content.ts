export interface PaperLink {
  title: string
  href: string
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
}

export const sonyScreenlessTv: CaseStudy = {
  id: 'sony-screenless-tv',
  title: 'Screenless TV: Designing for shared reality',
  subtitle:
    'Vision concept for Sony\u2019s TV division. My team explored how immersive technology could shape home entertainment \u2014 and found that the real design challenge wasn\u2019t personalization, it was preserving the shared experience that makes watching together meaningful.',
  timeline: 'Q1 \u2013 Q3 2024',
  narrative: [
    '<strong>People don\u2019t watch together for the content\u2009\u2014\u2009they watch together for the connection.</strong> Master\u2019s capstone for Sony\u2019s TV division. We expected to hear about picture quality; instead we heard about compromise\u2009\u2014\u2009subtitles, volume, lighting\u2009\u2014\u2009and the fact that people kept watching together anyway. The value is presence, not content.',
    '<strong>We rejected wearables\u2009\u2014\u2009a values decision, not a technical one.</strong> Apple Vision Pro had just launched, but you can\u2019t catch someone\u2019s eye during a tense scene through a headset. We designed a volumetric display with angle-specific imagery and directional audio\u2009\u2014\u2009personalization without isolation.',
  ],
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
