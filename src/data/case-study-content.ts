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
