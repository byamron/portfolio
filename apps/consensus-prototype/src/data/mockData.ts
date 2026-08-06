export interface Paper {
  id: string
  title: string
  authors: string[]
  journal: string
  year: number
  citationCount: number
  keyTakeaway: string
  abstract: string
  tags: string[]
  doi: string
  hasPdf: boolean
  supportingQuotes: number
}

export type MessageSegment = string | { citePaperId: string } | { threadRefId: string }

export type StepRow =
  | { type: 'read-thread'; threadRefId: string; count: string }
  | { type: 'search'; label: string; count: string }

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: MessageSegment[]
  steps?: StepRow[]
}

export interface Thread {
  id: string
  title: string
  messages: Message[]
  referencedPaperIds: string[]
  /** Set when the thread was started from a Collection — drives the ambient context chip. */
  originCollectionId?: string
  /** Items pinned as scope via the composer's reference picker — rendered as chips, not inline text. */
  scopePaperIds?: string[]
}

export interface Collection {
  id: string
  name: string
  parentId: string | null
  paperIds: string[]
  /** Threads associated with this collection — the source of both "surfaced" papers (§2) and suggestions (§3). */
  threadIds: string[]
}

export interface Suggestion {
  id: string
  collectionId: string
  question: string
  basedOnThreadIds: string[]
}

export const papers: Record<string, Paper> = {
  kreider2017: {
    id: 'kreider2017',
    title:
      'International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine',
    authors: ['R. Kreider', 'D. Kalman', 'J. Antonio'],
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2017,
    citationCount: 726,
    keyTakeaway:
      'Creatine monohydrate is the most effective ergogenic nutritional supplement currently available, with an extensive safety record across short- and long-term use.',
    abstract:
      'Background: Creatine is one of the most popular nutritional ergogenic aids for athletes. Objectives: This review examines the current literature on the safety and efficacy of creatine supplementation. Results: Creatine monohydrate has been reported to increase intramuscular creatine concentrations, improve high-intensity exercise performance, and support lean body mass accretion during training.',
    tags: ['Literature Review', 'Very Rigorous Journal'],
    doi: '10.1186/s12970-017-0173-z',
    hasPdf: true,
    supportingQuotes: 10,
  },
  prokopidis2022: {
    id: 'prokopidis2022',
    title:
      'Effects of creatine supplementation on memory in healthy individuals: a systematic review and meta-analysis',
    authors: ['K. Prokopidis', 'P. Giannos'],
    journal: 'Nutrition Reviews',
    year: 2022,
    citationCount: 52,
    keyTakeaway:
      'Creatine supplementation modestly improves short-term memory and processing speed, with effects most pronounced under conditions of metabolic stress such as sleep deprivation.',
    abstract:
      'Design: Systematic review and meta-analysis of randomized controlled trials. Setting, participants: Healthy adults across 6 eligible trials. Measurements: Working memory and processing speed tasks. Results: Creatine supplementation produced small but significant improvements in memory performance, particularly under conditions of cognitive fatigue.',
    tags: ['Meta-Analysis', 'Very Rigorous Journal'],
    doi: '10.1093/nutrit/nuac064',
    hasPdf: false,
    supportingQuotes: 4,
  },
  vethaak2021: {
    id: 'vethaak2021',
    title: 'Microplastics and human health',
    authors: ['D. Vethaak', 'J. Legler'],
    journal: 'Science',
    year: 2021,
    citationCount: 480,
    keyTakeaway:
      'Microplastics are pervasive in food, water, and air, and while direct evidence of human harm is still emerging, exposure is now essentially universal.',
    abstract:
      '1. Introduction: Microplastics — plastic particles smaller than 5mm — have been detected throughout the environment and in human tissue. This review synthesizes current evidence on exposure routes and potential health effects, and identifies key research gaps for risk assessment.',
    tags: ['Literature Review'],
    doi: '10.1126/science.abe5041',
    hasPdf: true,
    supportingQuotes: 7,
  },
  tiller2019: {
    id: 'tiller2019',
    title:
      'International Society of Sports Nutrition Position Stand: nutritional concerns of the female athlete',
    authors: ['N. Tiller', 'K. Roberts', 'S. Beasley'],
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2019,
    citationCount: 149,
    keyTakeaway:
      'Endurance athletes in heavy training require carbohydrate intakes at the upper end of standard guidelines to support recovery and prevent relative energy deficiency.',
    abstract:
      'Background: Nutritional strategies for endurance athletes must account for high training loads, recovery demands, and long-term health. Results: Carbohydrate periodization, adequate protein distribution, and sufficient energy availability are the primary levers for supporting adaptation without compromising health.',
    tags: ['Literature Review', 'Very Rigorous Journal', 'PDF'],
    doi: '10.1186/s12970-019-0329-0',
    hasPdf: true,
    supportingQuotes: 6,
  },
  podlogar2022: {
    id: 'podlogar2022',
    title: 'New horizons in carbohydrate research and application for endurance athletes',
    authors: ['T. Podlogar', 'G. Wallis'],
    journal: 'Sports Medicine',
    year: 2022,
    citationCount: 97,
    keyTakeaway:
      'Multiple-transportable-carbohydrate strategies allow substantially higher exogenous carbohydrate oxidation rates during prolonged endurance exercise than single-source carbohydrate intake.',
    abstract:
      'This review covers recent advances in carbohydrate feeding strategies for endurance athletes, including multiple-transportable-carbohydrate formulations, gut training, and periodized carbohydrate availability across a training block.',
    tags: ['Literature Review'],
    doi: '10.1007/s40279-022-01705-x',
    hasPdf: false,
    supportingQuotes: 3,
  },
  gerard2020: {
    id: 'gerard2020',
    title:
      'Modifiable risk factors, cardiovascular disease, and mortality in 155,722 individuals',
    authors: ['T. Gerard', 'A. Owusu', 'M. Fields'],
    journal: 'The Lancet',
    year: 2020,
    citationCount: 67,
    keyTakeaway:
      'Men have about twice the total incidence of coronary heart disease morbidity and mortality compared to women, with men experiencing roughly twice the rate of sudden death.',
    abstract:
      'Design: Prospective cohort study, 155,722 adults. Measurements: Modifiable cardiovascular risk factors tracked against incident coronary heart disease and mortality over a 15-year follow-up window. Results: Sex differences in incidence persisted after adjustment for standard risk factors.',
    tags: ['Prospective Cohort Study', 'Very Rigorous Journal'],
    doi: '10.1016/S0140-6736(20)30045-3',
    hasPdf: true,
    supportingQuotes: 5,
  },
  kording2019: {
    id: 'kording2019',
    title: 'Causality in the human niche: lessons for machine learning',
    authors: ['K. Kording', 'F. Blohm'],
    journal: 'ArXiv',
    year: 2019,
    citationCount: 34,
    keyTakeaway:
      'Human causal reasoning relies on active intervention and structured priors that current machine learning systems largely lack, suggesting a path toward more sample-efficient models.',
    abstract:
      'We argue that the human capacity for causal reasoning emerges from a niche of active intervention on the world, not passive observation. Machine learning systems trained purely on observational data are missing this structural advantage.',
    tags: ['Literature Review'],
    doi: '10.48550/arXiv.1911.01844',
    hasPdf: false,
    supportingQuotes: 2,
  },
}

export const collections: Record<string, Collection> = {
  'my-health': {
    id: 'my-health',
    name: 'My Health',
    parentId: null,
    paperIds: ['kreider2017', 'prokopidis2022', 'vethaak2021'],
    threadIds: ['creatine-effects', 'endurance-carb-research', 'cardiovascular-sex-differences'],
  },
  'sub-section': {
    id: 'sub-section',
    name: 'Sub section',
    parentId: 'my-health',
    paperIds: [],
    threadIds: [],
  },
  favorites: {
    id: 'favorites',
    name: 'Favorites',
    parentId: null,
    paperIds: ['gerard2020'],
    threadIds: [],
  },
}

export const threads: Record<string, Thread> = {
  'creatine-effects': {
    id: 'creatine-effects',
    title: 'Creatine Effects on Muscle and Cognition',
    referencedPaperIds: ['kreider2017', 'prokopidis2022'],
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: ['Does creatine supplementation improve muscle performance and cognition, and is it safe long-term?'],
      },
      {
        id: 'm2',
        role: 'assistant',
        steps: [
          { type: 'search', label: 'creatine supplementation muscle performance', count: '27 / 570K' },
          { type: 'search', label: 'creatine cognitive effects sleep deprivation', count: '18 / 340K' },
        ],
        content: [
          'Yes — creatine monohydrate is well-supported for both muscle performance and safety. ',
          { citePaperId: 'kreider2017' },
          ' identifies it as the most effective ergogenic nutritional supplement currently available, with an extensive long-term safety record across healthy populations. On the cognitive side, ',
          { citePaperId: 'prokopidis2022' },
          " found modest but significant improvements in memory and processing speed, particularly under conditions of cognitive fatigue such as sleep deprivation — so the muscle and cognition benefits appear to share a common mechanism in the brain's phosphocreatine energy buffer.",
        ],
      },
    ],
  },
  'endurance-carb-research': {
    id: 'endurance-carb-research',
    title: 'Endurance Carb Strategies',
    referencedPaperIds: ['podlogar2022'],
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: ['What carbohydrate strategies actually move the needle for endurance athletes?'],
      },
      {
        id: 'm2',
        role: 'assistant',
        steps: [{ type: 'search', label: 'multiple-transportable-carbohydrate endurance', count: '31 / 210K' }],
        content: [
          'Multiple-transportable-carbohydrate strategies are the biggest lever — ',
          { citePaperId: 'podlogar2022' },
          ' shows they allow substantially higher exogenous carbohydrate oxidation than a single carbohydrate source during prolonged exercise, on top of periodizing intake around training load rather than holding it constant.',
        ],
      },
    ],
  },
  'cardiovascular-sex-differences': {
    id: 'cardiovascular-sex-differences',
    title: 'Cardiovascular Risk by Sex',
    referencedPaperIds: ['gerard2020', 'podlogar2022'],
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: ['Do cardiovascular risk factors differ meaningfully by sex, and does training load interact with that?'],
      },
      {
        id: 'm2',
        role: 'assistant',
        steps: [{ type: 'search', label: 'cardiovascular risk factors sex differences cohort', count: '22 / 480K' }],
        content: [
          'Yes — ',
          { citePaperId: 'gerard2020' },
          ' found men have roughly twice the incidence of coronary heart disease morbidity and mortality compared to women, persisting after adjustment for standard risk factors. Training-load interaction isn\'t directly studied here, though ',
          { citePaperId: 'podlogar2022' },
          " suggests recovery demands scale with load regardless of sex, which is worth a dedicated look.",
        ],
      },
    ],
  },
}

export const recentThreadTitles = [
  'Creatine Effects on Muscle and Cognition',
  'Microplastics Impact on Health',
]

export const suggestions: Suggestion[] = [
  {
    id: 'sugg-1',
    collectionId: 'my-health',
    question: 'Does creatine dose-response differ by cognitive outcome?',
    basedOnThreadIds: ['creatine-effects', 'endurance-carb-research'],
  },
  {
    id: 'sugg-2',
    collectionId: 'my-health',
    question: 'Are cardiovascular risk factors relevant to endurance training load?',
    basedOnThreadIds: ['cardiovascular-sex-differences', 'endurance-carb-research'],
  },
  {
    id: 'sugg-3',
    collectionId: 'my-health',
    question: 'Where do these threads disagree on recovery nutrition timing?',
    basedOnThreadIds: ['creatine-effects', 'cardiovascular-sex-differences'],
  },
]

export function buildCrossThreadAnswer(basedOn: Thread[]): { steps: StepRow[]; content: MessageSegment[] } {
  const steps: StepRow[] = [
    ...basedOn.map((t) => ({ type: 'read-thread' as const, threadRefId: t.id, count: '27 / 570K' })),
    { type: 'search', label: 'related recent literature', count: '14 / 290K' },
  ]
  const content: MessageSegment[] = ['Based on my analysis, ']
  basedOn.forEach((t, i) => {
    if (i > 0) content.push(i === basedOn.length - 1 ? ' and ' : ', ')
    content.push({ threadRefId: t.id })
  })
  content.push(
    ' make related arguments but differ in emphasis — the underlying evidence they draw on is summarized below, with the full source list in References.',
  )
  return { steps, content }
}

export const homeSuggestions = [
  {
    label: 'Marathon macronutrient breakdown',
    query:
      "As a 27 year old male, what should my macronutrient breakdown be if I'm training for a marathon — multiple runs, lifts, and other workouts per week?",
  },
  {
    label: 'Compare two approaches',
    query: 'Compare carbohydrate periodization vs. constant intake for endurance training adaptation.',
  },
  {
    label: 'Find studies by method',
    query: 'Find randomized controlled trials on creatine supplementation and cognitive performance.',
  },
]

// Canned assistant answer for any freshly-typed Home query — themed around the marathon/
// macronutrient topic surfaced in the live-product video, so it reads coherently regardless
// of the exact query text.
export function buildNewThreadAnswer(): MessageSegment[] {
  return [
    "Based on the available literature, endurance athletes in heavy training should aim for carbohydrate intake at the upper end of standard guidelines. ",
    { citePaperId: 'tiller2019' },
    ' recommends periodizing carbohydrate and protein intake around training load rather than holding it constant, and ',
    { citePaperId: 'podlogar2022' },
    ' shows that multiple-transportable-carbohydrate strategies allow meaningfully higher carbohydrate oxidation during prolonged exercise than a single carbohydrate source. Protein needs also rise with concurrent strength training — most guidance clusters around 1.6–2.1 g/kg to support recovery and lean mass retention.',
  ]
}

export function buildFollowUpAnswer(turn: number): MessageSegment[] {
  if (turn === 1) {
    return [
      'Creatine is a reasonable addition on top of that base — ',
      { citePaperId: 'kreider2017' },
      ' documents both strong efficacy and a long safety record, and it can support recovery between the concurrent training sessions you described.',
    ]
  }
  return [
    "That's a fair follow-up. Based on what we've covered in this thread so far, I'd weigh it against your specific training load and existing supplement stack before changing anything — happy to go deeper on any of the papers referenced above.",
  ]
}
