/**
 * Seed data for the Context-Aware Collections prototype.
 *
 * Carried over from `prototype/src/data/mockData.ts` and extended with what the
 * Paper artboards added: standing instructions, artifacts, and the surfaced /
 * suggested content that the collection panel shows.
 */

export interface Paper {
  id: string
  title: string
  authors: string[]
  journal: string
  year: number
  citationCount: number
  influential: number
  keyTakeaway: string
  abstract: { head: string; text: string }[]
  tags: string[]
  doi: string
  hasPdf: boolean
  type: string
  addedAt?: string
}

/**
 * Plain prose, or a named object inside it.
 *
 * Any of the three can be mentioned inline; what an inline mention means is
 * always the same — the agent reads it. Placement is about how the sentence
 * reads, not about what the reference does (D31).
 */
export type MessageSegment =
  | string
  | { citePaperId: string }
  | { threadRefId: string }
  | { artifactRefId: string }

/** One row of the answer's tool-call trace. */
export type StepRow =
  | { type: 'read-thread'; threadRefId: string; count: string }
  | { type: 'search'; label: string; count: string }

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: MessageSegment[]
  steps?: StepRow[]
}

/**
 * How a paper ended up in a thread. Checkable facts only — which query
 * surfaced it, what the answer used it for. Never a claim about *why* the
 * ranker placed it where it did, because a hybrid ranker cannot honestly say
 * (D13). This is the property no reference manager has: nothing in Zotero
 * knows what question you were answering (D8).
 */
export interface PaperProvenance {
  paperId: string
  /** The search that surfaced it, verbatim from the thread's trace. */
  query: string
  /** What the answer cited it for, when it did. */
  quotedFor?: string
}

export interface Thread {
  id: string
  title: string
  messages: Message[]
  /** Papers the thread surfaced, saved or not — the raw material for §2. */
  sources: PaperProvenance[]
  updated: string
  /** Set when started from a collection; drives the ambient context chip. */
  originCollectionId?: string
  /** Items pinned as scope via the composer — chips, never inline. */
  scopePaperIds?: string[]
  /** Set when the thread was started from a claim in an artifact. */
  originArtifactId?: string
  originBlockId?: string
  claim?: string
  /** Artifacts pinned as scope. Chips too, never inline (D26). */
  scopeArtifactIds?: string[]
}

export interface Collection {
  id: string
  name: string
  parentId: string | null
  paperIds: string[]
  threadIds: string[]
  artifactIds: string[]
  instructions: string
}

/**
 * A block of an artifact. Content reuses `MessageSegment`, so a citation in a
 * draft is the same object as a citation in an answer — which is what lets the
 * provenance popover work identically in both places (D8, D13).
 */
export interface ArtifactBlock {
  id: string
  kind: 'heading' | 'paragraph'
  content: MessageSegment[]
  /**
   * An agent rewrite awaiting a decision. Set only for blocks that already had
   * content — writing into empty space lands directly (D25).
   */
  proposal?: {
    content: MessageSegment[]
    /** Why the agent is proposing it, in one line. */
    note: string
    /** Set when the change was requested from a thread rather than here (D24). */
    fromThreadId?: string
  }
  /** An undrafted section. The agent may fill it without asking. */
  placeholder?: string
}

/**
 * One turn of an artifact's persistent conversation — its production log.
 * Reached through the artifact, never listed in the Threads tab (D23).
 */
export interface ArtifactTurn {
  id: string
  role: 'user' | 'assistant'
  content: MessageSegment[]
  /** The thread this request came from, when it came from elsewhere (D24). */
  fromThreadId?: string
  change?: {
    blockId: string
    summary: string
    state: 'applied' | 'pending' | 'accepted' | 'rejected' | 'undone'
    /** What the block said before, so any landed change can be taken back. */
    previous?: MessageSegment[]
  }
}

export interface Artifact {
  id: string
  collectionId: string
  title: string
  kind: string
  updated: string
  blocks: ArtifactBlock[]
  log: ArtifactTurn[]
  /** The thread it was made from, when it was made from one. */
  originThreadId?: string
}

export type ObservationKind = 'Tension' | 'Gap' | 'Theme'

export interface Suggestion {
  id: string
  collectionId: string
  kind: ObservationKind
  observation: string
  question: string
  basedOnThreadIds: string[]
  evidence: string
}

export const papers: Record<string, Paper> = {
  prokopidis2022: {
    id: 'prokopidis2022',
    title:
      'Effects of creatine supplementation on memory in healthy individuals: a systematic review and meta-analysis of randomized controlled trials',
    authors: ['K. Prokopidis', 'P. Giannos', 'K. Triantafyllidis', 'D. Candow'],
    journal: 'Nutrition Reviews',
    year: 2022,
    citationCount: 52,
    influential: 2,
    keyTakeaway:
      'Creatine supplementation improves memory performance in healthy individuals, particularly in older adults (66–76 years), without affecting dose, duration, sex or geographical origin.',
    abstract: [
      {
        head: 'Context',
        text: 'From an energy perspective, the brain is very metabolically demanding. Creatine plays a key role in brain bioenergetics, and supplementation can augment brain creatine stores, which could increase memory.',
      },
      {
        head: 'Objective',
        text: 'A systematic review and meta-analysis of randomized controlled trials was conducted to determine the effects of creatine supplementation on memory performance in healthy humans.',
      },
      {
        head: 'Data analysis',
        text: 'Creatine supplementation improved measures of memory compared with placebo (SMD = 0.29, 95%CI 0.04–0.53). Subgroup analyses revealed a significant improvement in older adults (66–76 years) compared with younger counterparts (11–31 years).',
      },
      {
        head: 'Conclusion',
        text: 'Creatine supplementation enhanced measures of memory performance in healthy individuals, especially in older adults.',
      },
    ],
    tags: ['Meta-Analysis', 'Very Rigorous Journal'],
    doi: '10.1093/nutrit/nuac064',
    hasPdf: true,
    type: 'Journal Article · Meta-analysis',
    addedAt: 'Aug 5 · by You',
  },
  vethaak2021: {
    id: 'vethaak2021',
    title: 'Microplastics and human health',
    authors: ['D. Vethaak', 'J. Legler'],
    journal: 'Science',
    year: 2021,
    citationCount: 1204,
    influential: 38,
    keyTakeaway:
      'Microplastics are pervasive in food, water and air; exposure is essentially universal, but direct evidence of human harm is still emerging.',
    abstract: [
      {
        head: 'Context',
        text: 'Microplastics — plastic particles smaller than 5 mm, including nanosized plastics below 1 µm — are now ubiquitous across aquatic, terrestrial and atmospheric environments, making human exposure inevitable.',
      },
      {
        head: 'Objective',
        text: 'Review what is known about human exposure via ingestion, inhalation and dermal contact, and identify the measurement gaps that keep the question open.',
      },
      {
        head: 'Conclusion',
        text: 'Exposure is established; dose–response in humans is not. Standardised measurement is the bottleneck.',
      },
    ],
    tags: ['Literature Review'],
    doi: '10.1126/science.abe5041',
    hasPdf: true,
    type: 'Journal Article · Literature review',
    addedAt: 'Aug 5 · by You',
  },
  moriarty2023: {
    id: 'moriarty2023',
    title:
      'Dose–Response of Creatine Supplementation on Cognitive Function in Healthy Young Adults',
    authors: ['T. Moriarty', 'C. Bourbeau'],
    journal: 'Brain Sciences',
    year: 2023,
    citationCount: 15,
    influential: 1,
    keyTakeaway:
      'Six weeks of creatine at a moderate or high dose does not improve cognitive performance or change prefrontal cortex activation in young adults.',
    abstract: [
      {
        head: 'Objective',
        text: 'Determine whether a dose–response relationship exists between creatine supplementation and cognitive performance in healthy young adults.',
      },
      {
        head: 'Results',
        text: 'Neither moderate nor high dose changed cognitive performance or prefrontal cortex oxygenation over six weeks.',
      },
    ],
    tags: ['RCT', 'Very Rigorous Journal'],
    doi: '10.3390/brainsci13091276',
    hasPdf: true,
    type: 'Journal Article · RCT',
  },
  rawson2008: {
    id: 'rawson2008',
    title: 'Creatine supplementation does not improve cognitive function in young adults',
    authors: ['E. Rawson', 'M. Lieberman'],
    journal: 'Physiology & behavior',
    year: 2008,
    citationCount: 68,
    influential: 4,
    keyTakeaway:
      'No effect on cognitive processing in non-sleep-deprived young adults; may only help those already impaired.',
    abstract: [
      {
        head: 'Results',
        text: 'Creatine supplementation had no measurable effect on cognitive processing in rested young adults, suggesting benefit may be limited to populations under metabolic stress.',
      },
    ],
    tags: ['RCT'],
    doi: '10.1016/j.physbeh.2008.04.029',
    hasPdf: false,
    type: 'Journal Article · RCT',
  },
  kumar2023: {
    id: 'kumar2023',
    title: 'Microplastic exposure routes and measured human burden: a systematic review',
    authors: ['S. Kumar', 'A. Prasad'],
    journal: 'Environment International',
    year: 2023,
    citationCount: 41,
    influential: 3,
    keyTakeaway:
      'Ingestion dominates measured burden; inhalation is the least characterised route despite comparable exposure.',
    abstract: [
      {
        head: 'Objective',
        text: 'Quantify the relative contribution of ingestion, inhalation and dermal contact to measured microplastic burden in human tissue.',
      },
    ],
    tags: ['Meta-Analysis'],
    doi: '10.1016/j.envint.2023.107852',
    hasPdf: true,
    type: 'Journal Article · Meta-analysis',
  },
  podlogar2022: {
    id: 'podlogar2022',
    title: 'New horizons in carbohydrate research and application for endurance athletes',
    authors: ['T. Podlogar', 'G. Wallis'],
    journal: 'Sports Medicine',
    year: 2022,
    citationCount: 97,
    influential: 6,
    keyTakeaway:
      'Multiple-transportable-carbohydrate strategies allow substantially higher exogenous carbohydrate oxidation than single-source intake during prolonged exercise.',
    abstract: [
      {
        head: 'Context',
        text: 'Recent advances in carbohydrate feeding for endurance athletes, including multiple-transportable formulations, gut training and periodised availability.',
      },
    ],
    tags: ['Literature Review'],
    doi: '10.1007/s40279-022-01705-x',
    hasPdf: false,
    type: 'Journal Article · Literature review',
  },
  tiller2019: {
    id: 'tiller2019',
    title:
      'International Society of Sports Nutrition Position Stand: nutritional concerns of the female athlete',
    authors: ['N. Tiller', 'K. Roberts'],
    journal: 'Journal of the International Society of Sports Nutrition',
    year: 2019,
    citationCount: 149,
    influential: 9,
    keyTakeaway:
      'Endurance athletes in heavy training require carbohydrate at the upper end of standard guidelines to support recovery and prevent relative energy deficiency.',
    abstract: [
      {
        head: 'Results',
        text: 'Carbohydrate periodisation, adequate protein distribution and sufficient energy availability are the primary levers for supporting adaptation without compromising health.',
      },
    ],
    tags: ['Literature Review', 'Very Rigorous Journal'],
    doi: '10.1186/s12970-019-0329-0',
    hasPdf: true,
    type: 'Journal Article · Literature review',
  },
}

export const threads: Record<string, Thread> = {
  'creatine-aging': {
    id: 'creatine-aging',
    title: 'Creatine Cognitive Effects Aging',
    updated: '2 days ago',
    originCollectionId: 'my-health',
    sources: [
      {
        paperId: 'prokopidis2022',
        query: 'creatine supplementation and cognitive performance',
        quotedFor: 'gains concentrated in adults 66–76',
      },
      {
        paperId: 'moriarty2023',
        query: 'creatine supplementation and executive function, memory',
        quotedFor: 'null result in rested younger adults',
      },
      {
        paperId: 'rawson2008',
        query: 'creatine improve cognition',
        quotedFor: 'no effect in non-sleep-deprived adults',
      },
    ],
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: ['Does creatine improve cognition?'],
      },
      {
        id: 'm2',
        role: 'assistant',
        steps: [
          { type: 'search', label: 'creatine improve cognition', count: '27 / 4.8M' },
          {
            type: 'search',
            label: 'creatine supplementation and cognitive performance',
            count: '31 / 9.8M',
          },
          {
            type: 'search',
            label: 'creatine supplementation and executive function, memory',
            count: '18 / 5.8M',
          },
        ],
        content: [
          'Yes, creatine modestly improves memory and processing speed, but effects are context-dependent. ',
          { citePaperId: 'prokopidis2022' },
          ' found gains concentrated in adults 66–76, while ',
          { citePaperId: 'moriarty2023' },
          ' and ',
          { citePaperId: 'rawson2008' },
          ' report null results in rested younger adults — so the evidence supports small but statistically significant gains in specific cognitive domains rather than broad enhancement across all populations.',
        ],
      },
    ],
  },
  'macro-marathon': {
    id: 'macro-marathon',
    title: 'Macronutrient Breakdown Marathon Training',
    updated: '5 days ago',
    originCollectionId: 'my-health',
    sources: [
      {
        paperId: 'tiller2019',
        query: 'carbohydrate periodisation endurance training load',
        quotedFor: 'periodising intake around training load',
      },
      {
        paperId: 'podlogar2022',
        query: 'multiple-transportable-carbohydrate endurance',
        quotedFor: 'higher oxidation during prolonged exercise',
      },
      { paperId: 'moriarty2023', query: 'creatine concurrent training recovery' },
    ],
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: ['What macronutrient split fits marathon training with concurrent lifting?'],
      },
      {
        id: 'm2',
        role: 'assistant',
        steps: [
          { type: 'search', label: 'multiple-transportable-carbohydrate endurance', count: '31 / 210K' },
        ],
        content: [
          'A high-carb plan with 1.6–2.1 g/kg protein best fits marathon training, muscle retention and recovery. ',
          { citePaperId: 'tiller2019' },
          ' recommends periodising intake around training load rather than holding it constant, and ',
          { citePaperId: 'podlogar2022' },
          ' shows multiple-transportable-carbohydrate strategies allow meaningfully higher oxidation during prolonged exercise.',
        ],
      },
    ],
  },
  'microplastics-health': {
    id: 'microplastics-health',
    title: 'Microplastics Impact on Health',
    updated: 'yesterday',
    originCollectionId: 'my-health',
    sources: [
      {
        paperId: 'vethaak2021',
        query: 'microplastics human exposure burden',
        quotedFor: 'exposure is essentially universal',
      },
      {
        paperId: 'kumar2023',
        query: 'microplastic exposure routes measured burden',
        quotedFor: 'inhalation least characterised route',
      },
    ],
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: ['What do we actually know about microplastics and human health?'],
      },
      {
        id: 'm2',
        role: 'assistant',
        steps: [{ type: 'search', label: 'microplastics human exposure burden', count: '23 / 1.1M' }],
        content: [
          'Microplastics are ubiquitous across exposure routes, but measured human burden is dominated by ingestion. ',
          { citePaperId: 'vethaak2021' },
          ' establishes that exposure is essentially universal, while ',
          { citePaperId: 'kumar2023' },
          ' finds inhalation is the least characterised route despite comparable exposure.',
        ],
      },
    ],
  },
}

export const collections: Record<string, Collection> = {
  'my-health': {
    id: 'my-health',
    name: 'My Health',
    parentId: null,
    paperIds: ['prokopidis2022', 'vethaak2021'],
    threadIds: ['creatine-aging', 'macro-marathon', 'microplastics-health'],
    artifactIds: ['synthesis-creatine', 'outline-microplastics'],
    instructions:
      'Prioritise human RCTs and meta-analyses. Flag effects that only hold in animal models. Plain-language takeaways — this is for a lay-audience review.',
  },
  'sub-section': {
    id: 'sub-section',
    name: 'Sub section',
    parentId: 'my-health',
    paperIds: [],
    threadIds: [],
    artifactIds: [],
    instructions: '',
  },
}

export const artifacts: Record<string, Artifact> = {
  'synthesis-creatine': {
    id: 'synthesis-creatine',
    collectionId: 'my-health',
    title: 'Creatine & Cognition — Evidence Synthesis',
    kind: 'Synthesis',
    updated: 'Edited 2h ago',
    originThreadId: 'creatine-aging',
    blocks: [
      { id: 'b1', kind: 'heading', content: ['1. What the evidence supports'] },
      {
        id: 'b2',
        kind: 'paragraph',
        content: [
          'Creatine supplementation produces small but statistically significant gains in memory and processing speed. The effect is clearest in older adults: ',
          { citePaperId: 'prokopidis2022' },
          ' reports gains concentrated in adults 66–76, and the direction of effect is consistent across the trials that sampled this group.',
        ],
      },
      { id: 'b3', kind: 'heading', content: ['2. Where the trials disagree'] },
      {
        id: 'b4',
        kind: 'paragraph',
        content: [
          'The disagreement tracks study population rather than dose. ',
          { citePaperId: 'moriarty2023' },
          ' finds no effect on cognitive processing in non-sleep-deprived young adults, and ',
          { citePaperId: 'rawson2008' },
          ' reports the same null in rested undergraduates — a contrast established in ',
          { threadRefId: 'creatine-aging' },
          '.',
        ],
      },
      { id: 'b5', kind: 'heading', content: ['3. Populations with no coverage'] },
      {
        id: 'b6',
        kind: 'paragraph',
        placeholder: 'Not drafted yet — which groups the trials never sampled.',
        content: [],
      },
      { id: 'b7', kind: 'heading', content: ['4. Practical read for a lay audience'] },
      {
        id: 'b8',
        kind: 'paragraph',
        content: [
          'For a general reader the honest summary is narrow: creatine is well tolerated and may help memory if you are older or short of sleep, and probably does nothing measurable if you are neither.',
        ],
      },
    ],
    log: [
      {
        id: 'a1',
        role: 'user',
        content: ['Draft a synthesis from ', { threadRefId: 'creatine-aging' }, '.'],
      },
      {
        id: 'a2',
        role: 'assistant',
        content: [
          'Drafted four sections from that thread, carrying its citations across. Section 3 is left as a stub — the thread never established which populations are uncovered.',
        ],
        change: { blockId: 'b2', summary: 'Drafted sections 1, 2 and 4', state: 'applied' },
      },
    ],
  },
  'outline-microplastics': {
    id: 'outline-microplastics',
    collectionId: 'my-health',
    title: 'Microplastics review — Outline',
    kind: 'Outline',
    updated: 'Edited yesterday',
    blocks: [
      { id: 'c1', kind: 'heading', content: ['1. Introduction'] },
      {
        id: 'c2',
        kind: 'paragraph',
        content: [
          'Framing: microplastics are now measurable in human tissue, and the open question is exposure route rather than presence. ',
          { citePaperId: 'vethaak2021' },
          ' is the anchor for the health-effects framing.',
        ],
      },
      { id: 'c3', kind: 'heading', content: ['2. Exposure routes'] },
      {
        id: 'c4',
        kind: 'paragraph',
        content: [
          'Ingestion, inhalation and dermal contact, with bottled water and seafood the best-quantified sources. ',
          { citePaperId: 'kumar2023' },
          ' gives per-route burden estimates.',
        ],
      },
      { id: 'c5', kind: 'heading', content: ['3. Measured human burden'] },
      {
        id: 'c6',
        kind: 'paragraph',
        placeholder: 'Not drafted yet — what has actually been measured in tissue, and how.',
        content: [],
      },
      { id: 'c7', kind: 'heading', content: ['4. Evidence gaps'] },
      {
        id: 'c8',
        kind: 'paragraph',
        content: [
          'Almost all dose–response work is in animal models. The review should be explicit that no human trial establishes a threshold.',
        ],
      },
    ],
    log: [
      { id: 'd1', role: 'user', content: ['Outline a review of what we actually know.'] },
      {
        id: 'd2',
        role: 'assistant',
        content: ['Outlined four sections. Sections 3 is a stub pending measurement data.'],
        change: { blockId: 'c2', summary: 'Drafted the outline', state: 'applied' },
      },
    ],
  },
}

export const suggestions: Suggestion[] = [
  {
    id: 'sugg-tension',
    collectionId: 'my-health',
    kind: 'Tension',
    observation:
      'Two threads disagree on whether creatine helps younger adults. The aging thread reports gains concentrated in 66–76-year-olds; the marathon thread cites two null results in adults under 30.',
    question: 'Does baseline brain creatine explain the age split?',
    basedOnThreadIds: ['creatine-aging', 'macro-marathon'],
    evidence: '3 sources',
  },
  {
    id: 'sugg-gap',
    collectionId: 'my-health',
    kind: 'Gap',
    observation:
      'None of the 19 sampled studies report results for women over 60, though that is the population your saved set skews toward.',
    question: 'What does the evidence say for postmenopausal women?',
    basedOnThreadIds: ['creatine-aging'],
    evidence: '19 studies sampled',
  },
  {
    id: 'sugg-theme',
    collectionId: 'my-health',
    kind: 'Theme',
    observation:
      'Your six sources split into two camps on effect size — four report small but significant gains, two report none, and the split tracks trial duration.',
    question: 'Does trial duration explain the disagreement?',
    basedOnThreadIds: ['creatine-aging', 'microplastics-health'],
    evidence: '6 sources',
  },
]

export const observationStyles: Record<ObservationKind, { fill: string; ink: string }> = {
  Tension: { fill: 'var(--color-orange-wash)', ink: 'var(--color-orange)' },
  Gap: { fill: 'var(--color-accent-wash)', ink: 'var(--color-accent-deep)' },
  Theme: { fill: 'var(--color-mint-wash)', ink: '#1c8d74' },
}

export const homeSuggestions = [
  {
    label: 'Marathon macronutrient breakdown',
    query:
      "As a 27 year old male, what should my macronutrient breakdown be if I'm training for a marathon — multiple runs, lifts and other workouts per week?",
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

/** Papers that appeared in a collection's threads but were never saved (§2). */
export const paperIdsOf = (thread: Thread) => thread.sources.map((s) => s.paperId)

/** Every thread a paper appeared in, with the query behind each appearance. */
export function provenanceFor(
  paperId: string,
  threadIds: string[],
  allThreads: Record<string, Thread>,
): { threadId: string; entry: PaperProvenance }[] {
  return threadIds
    .map((threadId) => ({
      threadId,
      entry: allThreads[threadId]?.sources.find((s) => s.paperId === paperId),
    }))
    .filter((row): row is { threadId: string; entry: PaperProvenance } => Boolean(row.entry))
}

export function surfacedFor(
  collection: Collection,
  allThreads: Record<string, Thread>,
): { paper: Paper; threadIds: string[] }[] {
  const seen = new Map<string, string[]>()
  for (const threadId of collection.threadIds) {
    for (const paperId of paperIdsOf(allThreads[threadId] ?? ({ sources: [] } as never))) {
      if (collection.paperIds.includes(paperId)) continue
      seen.set(paperId, [...(seen.get(paperId) ?? []), threadId])
    }
  }
  return [...seen.entries()]
    .map(([paperId, threadIds]) => ({ paper: papers[paperId], threadIds }))
    .filter((row) => Boolean(row.paper))
    .sort((a, b) => b.threadIds.length - a.threadIds.length)
}

/** "1 thread", "2 threads" — a count and its noun, agreeing. */
export const plural = (count: number, noun: string, plural = `${noun}s`) =>
  `${count} ${count === 1 ? noun : plural}`

/** Headings are the outline; there is no second source of truth for it. */
export const outlineOf = (artifact: Artifact) =>
  artifact.blocks.filter((b) => b.kind === 'heading')

/** Distinct papers cited anywhere in the draft. */
export function citedInArtifact(artifact: Artifact): string[] {
  const ids = new Set<string>()
  for (const block of artifact.blocks) {
    for (const segment of block.content) {
      if (typeof segment === 'object' && 'citePaperId' in segment) ids.add(segment.citePaperId)
    }
  }
  return [...ids]
}

/** Threads referenced in the draft, plus the one it was made from. */
export function threadsInArtifact(artifact: Artifact): string[] {
  const ids = new Set<string>(artifact.originThreadId ? [artifact.originThreadId] : [])
  for (const block of artifact.blocks) {
    for (const segment of block.content) {
      if (typeof segment === 'object' && 'threadRefId' in segment) ids.add(segment.threadRefId)
    }
  }
  return [...ids]
}


/* ------------------------------------------------------------------------- *
 * Standing in for the editing model.
 *
 * There is no backend, so an artifact edit is produced by deterministic
 * operations over the text that is actually there — hedging, trimming, adding
 * a caveat, a plain-language pass — rather than echoing the instruction back.
 * The point is that the diff reads like an edit, so accepting or rejecting it
 * is a real decision.
 * ------------------------------------------------------------------------- */

type Revision = 'soften' | 'tighten' | 'caveat' | 'plain' | 'cite' | 'expand'

const INTENTS: { test: RegExp; kind: Revision }[] = [
  // Authoring comes first: writing is the thing you most often want, and D25
  // makes it the agent's least constrained move.
  { test: /draft|write|expand|flesh|elaborate|more detail|fill (this|it) (in|out)|help me/i, kind: 'expand' },
  { test: /soften|hedge|less strong|overstat|caution|careful|weaken/i, kind: 'soften' },
  { test: /tighten|shorten|concise|trim|cut|brief/i, kind: 'tighten' },
  { test: /caveat|limitation|weakness|sample size|confound|generalis|generaliz/i, kind: 'caveat' },
  { test: /plain|lay|simpl|jargon|accessible|readable/i, kind: 'plain' },
  { test: /cite|source|reference|evidence for|support/i, kind: 'cite' },
]

const HEDGES: [RegExp, string][] = [
  [/\bproduces\b/g, 'appears to produce'],
  [/\bshows\b/g, 'suggests'],
  [/\bfinds\b/g, 'reports'],
  [/\bis clearest\b/g, 'is most consistent'],
  [/\bdoes not improve\b/g, 'has not been shown to improve'],
  [/\bthe honest summary is\b/g, 'the most defensible summary is'],
  [/\bwill\b/g, 'may'],
]

const PLAIN: [RegExp, string][] = [
  [/\bstatistically significant\b/g, 'real but small'],
  [/\bcognitive processing\b/g, 'thinking speed'],
  [/\bsupplementation\b/g, 'taking it'],
  [/\bheterogeneity\b/g, 'variation between studies'],
  [/\bmeta-analysis\b/g, 'pooled review'],
]

const SAMPLE_CAVEAT =
  ' The trials behind this are small — most enrol fewer than a hundred participants — so the pooled estimate is more fragile than the effect size alone suggests.'

const mapText = (content: MessageSegment[], fn: (text: string) => string) =>
  content.map((segment) => (typeof segment === 'string' ? fn(segment) : segment))

const applyAll = (text: string, table: [RegExp, string][]) =>
  table.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text)

const countHits = (content: MessageSegment[], table: [RegExp, string][]) =>
  content.reduce((n, segment) => {
    if (typeof segment !== 'string') return n
    return n + table.reduce((m, [pattern]) => m + (segment.match(pattern)?.length ?? 0), 0)
  }, 0)

/**
 * Revise a block in the direction the request asks for, and say what was done.
 * Returns null when the request maps to no operation, so the caller can fall
 * back rather than pretend it understood.
 */
export function reviseBlock(
  content: MessageSegment[],
  request: string,
  availablePaperIds: string[],
): { content: MessageSegment[]; summary: string } | null {
  const kind = INTENTS.find((intent) => intent.test.test(request))?.kind
  if (!kind) return null

  if (kind === 'soften' || kind === 'plain') {
    const table = kind === 'soften' ? HEDGES : PLAIN
    const hits = countHits(content, table)
    if (!hits) return null
    return {
      content: mapText(content, (text) => applyAll(text, table)),
      summary:
        kind === 'soften'
          ? `Hedged ${hits} claim${hits === 1 ? '' : 's'}`
          : `Plain-language pass · ${hits} term${hits === 1 ? '' : 's'}`,
    }
  }

  if (kind === 'tighten') {
    // Drop the trailing subordinate clause, which is where the padding is.
    const last = content[content.length - 1]
    if (typeof last !== 'string') return null
    const trimmed = last.replace(/\s*(?:—|,\s+(?:and|so|which))\s+[^.]*\./, '.')
    if (trimmed === last) return null
    return { content: [...content.slice(0, -1), trimmed], summary: 'Cut the trailing clause' }
  }

  if (kind === 'caveat') {
    return { content: [...content, SAMPLE_CAVEAT], summary: 'Added a sample-size caveat' }
  }

  // cite and expand both reach for a saved source the block does not lean on.
  const already = new Set(
    content.flatMap((segment) =>
      typeof segment === 'object' && 'citePaperId' in segment ? [segment.citePaperId] : [],
    ),
  )
  const next = availablePaperIds.find((id) => !already.has(id))

  if (kind === 'expand') {
    if (!next) {
      return {
        content: [...content, SAMPLE_CAVEAT],
        summary: 'Extended with a note on trial size',
      }
    }
    return {
      content: [
        ...content,
        ' A further source in this collection bears on it directly: ',
        { citePaperId: next },
        '.',
      ],
      summary: 'Extended with a further source',
    }
  }

  if (!next) return null
  return {
    content: [...content, ' See also ', { citePaperId: next }, '.'],
    summary: 'Added a citation',
  }
}

/** A first draft for an undrafted section, built from the collection's own sources. */
export function draftSection(
  paperIds: string[],
  library: Record<string, Paper>,
): MessageSegment[] {
  const picks = paperIds.filter((id) => library[id]).slice(0, 2)
  // The heading sits directly above, so the prose does not repeat it — and no
  // sentence frame has to survive being handed the word "Introduction".
  const out: MessageSegment[] = [
    picks.length > 0
      ? 'Drawing on the sources saved to this collection: '
      : 'Nothing saved to this collection speaks to this yet. ',
  ]
  for (const id of picks) {
    out.push({ citePaperId: id }, ` — ${library[id].keyTakeaway.replace(/\.$/, '')}. `)
  }
  out.push(
    'Nothing saved here settles the question outright, so this section states what is covered and leaves the rest marked as open.',
  )
  return out
}

/** The answer a "find support" thread comes back with. */
export function buildSupportAnswer(claim: string, paperIds: string[]): MessageSegment[] {
  const quoted = claim.length > 90 ? `${claim.slice(0, 87)}…` : claim
  const out: MessageSegment[] = [
    `Searching the corpus for work bearing on “${quoted}” returns partial support. `,
  ]
  paperIds.forEach((id, i) => {
    out.push({ citePaperId: id }, i === 0 ? ' is the closest direct evidence. ' : ' corroborates it. ')
  })
  out.push('Neither settles the claim on its own, so cite them as supporting rather than dispositive.')
  return out
}

export function buildNewThreadAnswer(): MessageSegment[] {
  return [
    'Based on the available literature, endurance athletes in heavy training should aim for carbohydrate intake at the upper end of standard guidelines. ',
    { citePaperId: 'tiller2019' },
    ' recommends periodising carbohydrate and protein intake around training load rather than holding it constant, and ',
    { citePaperId: 'podlogar2022' },
    ' shows that multiple-transportable-carbohydrate strategies allow meaningfully higher oxidation during prolonged exercise. Protein needs also rise with concurrent strength training — most guidance clusters around 1.6–2.1 g/kg.',
  ]
}

export function buildFollowUpAnswer(turn: number): MessageSegment[] {
  if (turn === 1) {
    return [
      'Creatine is a reasonable addition on top of that base — ',
      { citePaperId: 'prokopidis2022' },
      ' documents efficacy for memory alongside a long safety record, and it can support recovery between the concurrent sessions you described.',
    ]
  }
  return [
    "That's a fair follow-up. Based on what we've covered so far I'd weigh it against your training load and existing stack before changing anything — happy to go deeper on any of the papers referenced above.",
  ]
}

/**
 * §1 — an answer that draws on other threads. The threads it read appear as
 * their own rows in the trace and as thread citations in the prose, kept
 * visually distinct from paper citations (D17).
 */
export function buildCrossThreadAnswer(basedOn: Thread[]): {
  steps: StepRow[]
  content: MessageSegment[]
} {
  const steps: StepRow[] = [
    ...basedOn.map((t) => ({ type: 'read-thread' as const, threadRefId: t.id, count: `${t.messages.length} msgs` })),
    { type: 'search', label: 'related recent literature', count: '14 / 290K' },
  ]
  const content: MessageSegment[] = ['Reading across this collection, ']
  basedOn.forEach((thread, i) => {
    if (i > 0) content.push(i === basedOn.length - 1 ? ' and ' : ', ')
    content.push({ threadRefId: thread.id })
  })
  content.push(
    ' make related arguments but differ in emphasis. The disagreement tracks study population rather than dose — ',
    { citePaperId: 'prokopidis2022' },
    ' samples older adults where ',
    { citePaperId: 'moriarty2023' },
    ' samples rested undergraduates. Full source list in References.',
  )
  return { steps, content }
}
