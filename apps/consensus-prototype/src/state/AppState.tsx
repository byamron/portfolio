import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  artifacts as seedArtifacts,
  collections as seedCollections,
  papers as seedPapers,
  threads as seedThreads,
  buildCrossThreadAnswer,
  buildFollowUpAnswer,
  buildNewThreadAnswer,
  buildSupportAnswer,
  draftSection,
  reviseBlock,
  type Artifact,
  type ArtifactBlock,
  type ArtifactTurn,
  type Collection,
  type Message,
  type MessageSegment,
  type Paper,
  type Suggestion,
  type Thread,
} from '../data/mock'
import type { Submission } from '../components/Composer'

export type View = 'home' | 'thread' | 'collection' | 'artifact' | 'library'
export type ArtifactTab = 'chat' | 'items' | 'history'
export type Theme = 'system' | 'light' | 'dark'
export type CollectionTab = 'items' | 'threads' | 'artifacts'
export type PanelView = 'surfaced' | 'suggested' | 'graph'

/** What the collection panel is currently showing as a temporary destination. */
export type OpenObject =
  | { kind: 'paper'; id: string }
  | { kind: 'thread'; id: string }
  | { kind: 'artifact'; id: string }

/**
 * A reference handed to the composer from elsewhere — "Reference" on a thread,
 * "Ask" on a paper. The composer picks it up and clears it.
 */
export type PendingReference =
  | { kind: 'thread'; id: string }
  | { kind: 'paper'; id: string }
  | { kind: 'artifact'; id: string }

/** Words too common to identify a section by. */
const STOPWORDS = new Set([
  'what',
  'where',
  'with',
  'this',
  'that',
  'from',
  'read',
  'have',
  'they',
  'them',
  'more',
  'into',
  'over',
])

const segmentsToText = (segments: MessageSegment[]) =>
  segments.map((s) => (typeof s === 'string' ? s : '')).join('').trim()

let nextId = 1
const makeId = (prefix: string) => `${prefix}-${nextId++}`
const surfacedKey = (collectionId: string, paperId: string) => `${collectionId}|${paperId}`

interface AppStateShape {
  view: View
  papers: Record<string, Paper>
  /** What you saved. Collections are subsets of this (D30). */
  libraryPaperIds: string[]
  libraryThreadIds: string[]
  threads: Record<string, Thread>
  collections: Record<string, Collection>
  artifacts: Record<string, Artifact>
  activeThreadId: string | null
  activeArtifactId: string | null
  artifactTab: ArtifactTab
  theme: Theme
  setTheme: (theme: Theme) => void
  /** The block a Cite action would land in — the last one you touched. */
  focusedBlockId: string | null
  selectedCollectionId: string
  collectionTab: CollectionTab
  panelOpen: boolean
  panelView: PanelView
  openObject: OpenObject | null
  /** Whether the open object's tab is the one in front. */
  objectFocused: boolean
  focusObject: () => void
  referencesOpen: boolean
  detailPaperId: string | null
  isGenerating: boolean
  isGeneratingArtifact: boolean
  savePopoverPaperId: string | null
  pendingReference: PendingReference | null

  goHome: () => void
  openCollection: (collectionId?: string) => void
  openLibrary: () => void
  toggleLibraryForPaper: (paperId: string) => void
  toggleLibraryForThread: (threadId: string) => void
  setCollectionTab: (tab: CollectionTab) => void
  openThread: (threadId: string) => void
  startNewThread: (query: string) => void
  sendFollowUp: (text: string) => void

  setPanelOpen: (open: boolean) => void
  setPanelView: (view: PanelView) => void
  openInPanel: (object: OpenObject) => void
  closeOpenObject: () => void

  toggleReferences: () => void
  openPaperDetail: (paperId: string) => void
  closePaperDetail: () => void
  savePopoverAnchor: { left: number; top: number; bottom: number } | null
  openSavePopover: (paperId: string, anchor?: HTMLElement | null) => void
  closeSavePopover: () => void
  toggleCollectionForPaper: (collectionId: string, paperId: string) => void
  toggleCollectionForThread: (collectionId: string, threadId: string) => void
  deleteThread: (threadId: string) => void
  createCollection: (name: string) => string | null
  collectionsForThread: (threadId: string) => string[]
  recentThreadIds: string[]
  setInstructions: (collectionId: string, instructions: string) => void
  referenceInComposer: (reference: PendingReference) => void
  clearPendingReference: () => void

  openArtifact: (artifactId: string) => void
  setFocusedBlock: (blockId: string | null) => void
  setArtifactTab: (tab: ArtifactTab) => void
  askArtifact: (artifactId: string, text: string, fromThreadId?: string) => void
  resolveProposal: (artifactId: string, blockId: string, accept: boolean) => void
  undoChange: (artifactId: string, turnId: string) => void
  editBlock: (artifactId: string, blockId: string, content: MessageSegment[]) => void
  citeInBlock: (artifactId: string, blockId: string, paperId: string) => void
  artifactFromThread: (threadId: string) => void
  renameArtifact: (artifactId: string, title: string) => void
  findSupport: (artifactId: string, blockId: string, claim: string) => void
  citeSupport: (threadId: string) => void
  newArtifact: (collectionId: string) => void

  startCrossThreadThread: (submission: Submission) => void
  startSuggestedThread: (suggestion: Suggestion) => void
  savePaperToCollection: (collectionId: string, paperId: string) => void
  dismissSurfacedPaper: (collectionId: string, paperId: string) => void
  isSurfacedDismissed: (collectionId: string, paperId: string) => boolean
}

const AppStateContext = createContext<AppStateShape | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('collection')
  const [papers] = useState(seedPapers)
  const [threads, setThreads] = useState(seedThreads)
  const [collections, setCollections] = useState(seedCollections)
  const [artifacts, setArtifacts] = useState(seedArtifacts)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null)
  const [artifactTab, setArtifactTab] = useState<ArtifactTab>('chat')

  /**
   * System by default, with an explicit choice remembered. `system` clears the
   * attribute so the media query decides, rather than us re-deriving it and
   * getting out of step when the OS flips mid-session.
   */
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('consensus-theme') as Theme | null) ?? 'system',
  )
  useEffect(() => {
    localStorage.setItem('consensus-theme', theme)
    if (theme === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  const [focusedBlockId, setFocusedBlock] = useState<string | null>(null)

  // Read-only mirrors, for callbacks that need current state without taking it
  // as a dependency — never write through these.
  const artifactsRef = useRef(artifacts)
  artifactsRef.current = artifacts
  const collectionsRef = useRef(collections)
  collectionsRef.current = collections
  const threadsRef = useRef(threads)
  threadsRef.current = threads
  const [selectedCollectionId, setSelectedCollectionId] = useState('my-health')
  const [libraryPaperIds, setLibraryPaperIds] = useState<string[]>(() =>
    Object.values(seedCollections).flatMap((c) => c.paperIds),
  )
  const [libraryThreadIds, setLibraryThreadIds] = useState<string[]>(() =>
    Object.values(seedCollections).flatMap((c) => c.threadIds),
  )
  const [collectionTab, setCollectionTab] = useState<CollectionTab>('threads')
  const [panelOpen, setPanelOpen] = useState(true)
  const [panelView, setPanelView] = useState<PanelView>('surfaced')
  const [openObject, setOpenObject] = useState<OpenObject | null>(null)
  const [objectFocused, setObjectFocused] = useState(false)
  const [referencesOpen, setReferencesOpen] = useState(true)
  const [detailPaperId, setDetailPaperId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false)
  const [savePopoverPaperId, setSavePopoverPaperId] = useState<string | null>(null)
  const [savePopoverAnchor, setSavePopoverAnchor] = useState<{
    left: number
    top: number
    bottom: number
  } | null>(null)
  const [followUpTurns, setFollowUpTurns] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [pendingReference, setPendingReference] = useState<PendingReference | null>(null)

  const goHome = useCallback(() => {
    setView('home')
    setActiveThreadId(null)
  }, [])

  const openCollection = useCallback((collectionId?: string) => {
    setView('collection')
    setActiveThreadId(null)
    if (collectionId) setSelectedCollectionId(collectionId)
  }, [])

  const openLibrary = useCallback(() => {
    setView('library')
    setActiveThreadId(null)
  }, [])

  const openThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId)
    setView('thread')
    setReferencesOpen(true)
    setFollowUpTurns(0)
  }, [])

  /** Append an assistant turn after a beat, so generation is visible. */
  const answerAfter = useCallback(
    (threadId: string, delay: number, build: () => Pick<Message, 'content' | 'steps'>) => {
      setIsGenerating(true)
      window.setTimeout(() => {
        const message: Message = { id: makeId('msg'), role: 'assistant', ...build() }
        setThreads((prev) => {
          const thread = prev[threadId]
          if (!thread) return prev
          return { ...prev, [threadId]: { ...thread, messages: [...thread.messages, message] } }
        })
        setIsGenerating(false)
      }, delay)
    },
    [],
  )

  const startNewThread = useCallback(
    (query: string) => {
      const id = makeId('thread')
      const thread: Thread = {
        id,
        title: query.length > 60 ? `${query.slice(0, 57)}…` : query,
        updated: 'just now',
        messages: [{ id: makeId('msg'), role: 'user', content: [query] }],
        sources: [
          { paperId: 'tiller2019', query, quotedFor: 'periodising intake around training load' },
          { paperId: 'podlogar2022', query, quotedFor: 'higher oxidation during prolonged exercise' },
        ],
      }
      setThreads((prev) => ({ ...prev, [id]: thread }))
      setActiveThreadId(id)
      setView('thread')
      setReferencesOpen(true)
      setFollowUpTurns(0)
      answerAfter(id, 1100, () => ({ content: buildNewThreadAnswer() }))
    },
    [answerAfter],
  )

  const sendFollowUp = useCallback(
    (text: string) => {
      if (!activeThreadId) return
      const message: Message = { id: makeId('msg'), role: 'user', content: [text] }
      setThreads((prev) => {
        const thread = prev[activeThreadId]
        if (!thread) return prev
        return { ...prev, [activeThreadId]: { ...thread, messages: [...thread.messages, message] } }
      })
      const turn = followUpTurns + 1
      setFollowUpTurns(turn)
      answerAfter(activeThreadId, 900, () => ({ content: buildFollowUpAnswer(turn) }))
    },
    [activeThreadId, answerAfter, followUpTurns],
  )

  /**
   * §1 — cross-thread referencing. Segments carry prose plus inline
   * {threadRefId} pills typed through the @ picker; scopePaperIds are items
   * pinned as chips. The two reference types never blur together.
   */
  const startCrossThreadThread = useCallback(
    ({ segments, paperIds, threadIds, artifactIds, inCollection }: Submission) => {
      // Named in the sentence or attached above it — either way the thread is
      // read, so both feed the trace and the answer (D31).
      const referencedIds = [
        ...new Set([
          ...segments.flatMap((s) =>
            typeof s === 'object' && 'threadRefId' in s ? [s.threadRefId] : [],
          ),
          ...threadIds,
        ]),
      ]
      const referenced = referencedIds.map((id) => threads[id]).filter((t): t is Thread => Boolean(t))

      // An inline mention is a reference like any other — naming something in
      // the sentence puts it in scope just as attaching it would (D31).
      const inlinePapers = segments.flatMap((s) =>
        typeof s === 'object' && 'citePaperId' in s ? [s.citePaperId] : [],
      )
      const inlineArtifacts = segments.flatMap((s) =>
        typeof s === 'object' && 'artifactRefId' in s ? [s.artifactRefId] : [],
      )
      const allPapers = [...new Set([...paperIds, ...inlinePapers])]
      const allArtifacts = [...new Set([...artifactIds, ...inlineArtifacts])]

      const id = makeId('thread')
      const title =
        segments
          .map((s) => (typeof s === 'string' ? s : ''))
          .join(' ')
          .trim() ||
        (referenced.length > 0
          ? `About ${referenced.map((t) => t.title).join(' and ')}`
          : 'New cross-thread question')

      const thread: Thread = {
        id,
        title: title.length > 60 ? `${title.slice(0, 57)}…` : title,
        updated: 'just now',
        messages: [{ id: makeId('msg'), role: 'user', content: segments }],
        sources: (allPapers.length > 0 ? allPapers : ['prokopidis2022', 'moriarty2023']).map(
          (paperId) => ({ paperId, query: title }),
        ),
        originCollectionId: inCollection ? selectedCollectionId : undefined,
        scopePaperIds: allPapers,
        scopeArtifactIds: allArtifacts,
      }
      setThreads((prev) => ({ ...prev, [id]: thread }))

      // D24 — a change asked for from a thread lands on the artifact and is
      // recorded in the artifact's own log, tagged with where it was asked.
      for (const artifactId of allArtifacts) askArtifactRef.current(artifactId, title, id)
      setCollections((prev) => {
        const collection = prev[selectedCollectionId]
        if (!collection) return prev
        return {
          ...prev,
          [selectedCollectionId]: { ...collection, threadIds: [...collection.threadIds, id] },
        }
      })
      setActiveThreadId(id)
      setView('thread')
      setReferencesOpen(true)
      setFollowUpTurns(0)
      answerAfter(id, 1400, () => buildCrossThreadAnswer(referenced))
    },
    [answerAfter, selectedCollectionId, threads],
  )

  /** §3 — a suggestion becomes a thread, seeded with the threads behind it. */
  const startSuggestedThread = useCallback(
    (suggestion: Suggestion) => {
      const basedOn = suggestion.basedOnThreadIds
        .map((tid) => threads[tid])
        .filter((t): t is Thread => Boolean(t))
      const id = makeId('thread')
      const thread: Thread = {
        id,
        title: suggestion.question,
        updated: 'just now',
        messages: [{ id: makeId('msg'), role: 'user', content: [suggestion.question] }],
        sources: ['prokopidis2022', 'moriarty2023'].map((paperId) => ({
          paperId,
          query: suggestion.question,
        })),
        originCollectionId: suggestion.collectionId,
      }
      setThreads((prev) => ({ ...prev, [id]: thread }))
      setCollections((prev) => {
        const collection = prev[suggestion.collectionId]
        if (!collection) return prev
        return {
          ...prev,
          [suggestion.collectionId]: { ...collection, threadIds: [...collection.threadIds, id] },
        }
      })
      setActiveThreadId(id)
      setView('thread')
      setReferencesOpen(true)
      setFollowUpTurns(0)
      answerAfter(id, 1400, () => buildCrossThreadAnswer(basedOn))
    },
    [answerAfter, threads],
  )

  const openArtifact = useCallback((artifactId: string) => {
    setActiveArtifactId(artifactId)
    setArtifactTab('chat')
    setView('artifact')
    const collectionId = artifactsRef.current[artifactId]?.collectionId
    if (collectionId) setSelectedCollectionId(collectionId)
  }, [])

  const patchArtifact = useCallback(
    (artifactId: string, patch: (artifact: Artifact) => Artifact) => {
      setArtifacts((prev) => {
        const artifact = prev[artifactId]
        if (!artifact) return prev
        return { ...prev, [artifactId]: patch(artifact) }
      })
    },
    [],
  )

  /**
   * D25 — the agent's authority is set by whether anything is overwritten.
   * An undrafted block is filled straight away; a block that already says
   * something gets a proposal to accept or reject. Either way the exchange is
   * recorded in the artifact's log, which is its changelog (D23), including
   * when the request arrived from another thread (D24).
   */
  const askArtifact = useCallback(
    (artifactId: string, text: string, fromThreadId?: string) => {
      const askId = makeId('turn')
      patchArtifact(artifactId, (artifact) => ({
        ...artifact,
        log: [...artifact.log, { id: askId, role: 'user', content: [text], fromThreadId }],
      }))

      setIsGeneratingArtifact(true)
      window.setTimeout(() => {
        setIsGeneratingArtifact(false)
        setArtifacts((prev) => {
          const artifact = prev[artifactId]
          if (!artifact) return prev

          // Which section the request is about: the one it names, else the
          // first undrafted one, else where you were last working. Naming a
          // section has to win — otherwise every request is swallowed by
          // whatever stub happens to be first.
          const named = artifact.blocks
            .map((block, index) => {
              if (block.kind !== 'heading') return null
              const words = segmentsToText(block.content)
                .toLowerCase()
                .replace(/^\d+\.\s*/, '')
                .split(/\W+/)
                .filter((w) => w.length > 3 && !STOPWORDS.has(w))
              const hits = words.filter((w) => text.toLowerCase().includes(w)).length
              const body = artifact.blocks[index + 1]
              return hits > 0 && body?.kind === 'paragraph' ? { body, hits } : null
            })
            .filter((x): x is { body: ArtifactBlock; hits: number } => x !== null)
            .sort((a, b) => b.hits - a.hits)[0]?.body

          const target =
            named ??
            artifact.blocks.find((b) => b.placeholder) ??
            [...artifact.blocks].reverse().find((b) => b.kind === 'paragraph' && !b.proposal)
          if (!target) return prev
          const stub = Boolean(target.placeholder)

          const heading = (() => {
            const index = artifact.blocks.indexOf(target)
            const before = artifact.blocks.slice(0, index).reverse().find((b) => b.kind === 'heading')
            return before ? segmentsToText(before.content) : 'this section'
          })()

          const available = collectionsRef.current[artifact.collectionId]?.paperIds ?? []

          // A stub is written in place; anything with text already gets a
          // revision proposed against it, or an explanation if the request maps
          // to no operation this stand-in knows how to perform.
          const revision = stub ? null : reviseBlock(target.content, text, available)
          const written: MessageSegment[] = stub
            ? draftSection(available, papers)
            : (revision?.content ?? [])

          if (!stub && !revision) {
            return {
              ...prev,
              [artifactId]: {
                ...artifact,
                log: [
                  ...artifact.log,
                  {
                    id: makeId('turn'),
                    role: 'assistant',
                    fromThreadId,
                    content: [
                      `I can draft or extend a section, hedge a claim, tighten it, add a caveat, run a plain-language pass, or bring in another source. "${text}" is none of those — say which and I will propose it against ${heading}.`,
                    ],
                  },
                ],
              },
            }
          }

          const blocks = artifact.blocks.map((block) =>
            block.id !== target.id
              ? block
              : stub
                ? { ...block, placeholder: undefined, content: written }
                : { ...block, proposal: { content: written, note: text, fromThreadId } },
          )

          const change: ArtifactTurn['change'] = {
            blockId: target.id,
            summary: stub ? `Drafted ${heading}` : `${revision?.summary} in ${heading}`,
            state: stub ? 'applied' : 'pending',
            previous: target.content,
          }

          return {
            ...prev,
            [artifactId]: {
              ...artifact,
              blocks,
              updated: 'Edited just now',
              log: [
                ...artifact.log,
                {
                  id: makeId('turn'),
                  role: 'assistant',
                  content: [
                    stub
                      ? `${heading} was a stub, so I drafted it from the saved sources.`
                      : `${heading} already had text, so this is a proposal — accept it in the draft.`,
                  ],
                  fromThreadId,
                  change,
                },
              ],
            },
          }
        })
      }, 900)
    },
    [patchArtifact],
  )

  /**
   * Undo, rather than a version history. The log already records what changed
   * and why; what it lacked was the ability to take a landed change back, which
   * is the actual fear behind "can I trust the agent with my document".
   */
  const undoChange = useCallback(
    (artifactId: string, turnId: string) => {
      patchArtifact(artifactId, (artifact) => {
        const turn = artifact.log.find((t) => t.id === turnId)
        if (!turn?.change?.previous) return artifact
        const { blockId, previous } = turn.change
        return {
          ...artifact,
          updated: 'Edited just now',
          blocks: artifact.blocks.map((block) =>
            block.id === blockId ? { ...block, content: previous, proposal: undefined } : block,
          ),
          log: artifact.log.map((t) =>
            t.id === turnId && t.change ? { ...t, change: { ...t.change, state: 'undone' } } : t,
          ),
        }
      })
    },
    [patchArtifact],
  )

  const resolveProposal = useCallback(
    (artifactId: string, blockId: string, accept: boolean) => {
      patchArtifact(artifactId, (artifact) => ({
        ...artifact,
        updated: 'Edited just now',
        blocks: artifact.blocks.map((block) =>
          block.id !== blockId
            ? block
            : accept && block.proposal
              ? { ...block, content: block.proposal.content, proposal: undefined }
              : { ...block, proposal: undefined },
        ),
        // The log records the outcome, so the originating thread can report it.
        log: artifact.log.map((turn) =>
          turn.change?.blockId === blockId && turn.change.state === 'pending'
            ? { ...turn, change: { ...turn.change, state: accept ? 'accepted' : 'rejected' } }
            : turn,
        ),
      }))
    },
    [patchArtifact],
  )

  const renameArtifact = useCallback(
    (artifactId: string, title: string) => {
      const next = title.trim()
      if (!next) return
      patchArtifact(artifactId, (artifact) => ({ ...artifact, title: next, updated: 'Edited just now' }))
    },
    [patchArtifact],
  )

  const editBlock = useCallback(
    (artifactId: string, blockId: string, content: MessageSegment[]) => {
      patchArtifact(artifactId, (artifact) => ({
        ...artifact,
        updated: 'Edited just now',
        blocks: artifact.blocks.map((block) =>
          block.id === blockId ? { ...block, content, placeholder: undefined } : block,
        ),
      }))
    },
    [patchArtifact],
  )

  const citeInBlock = useCallback(
    (artifactId: string, blockId: string, paperId: string) => {
      patchArtifact(artifactId, (artifact) => ({
        ...artifact,
        updated: 'Edited just now',
        blocks: artifact.blocks.map((block) =>
          block.id === blockId
            ? { ...block, content: [...block.content, ' ', { citePaperId: paperId }], placeholder: undefined }
            : block,
        ),
      }))
    },
    [patchArtifact],
  )

  /**
   * The entry point that earns its place: the thread's answer becomes the first
   * draft and its citations cross over intact, provenance and all.
   */
  const artifactFromThread = useCallback(
    (threadId: string) => {
      const thread = threads[threadId]
      if (!thread) return
      const answer = [...thread.messages].reverse().find((m) => m.role === 'assistant')
      const id = makeId('artifact')
      const artifact: Artifact = {
        id,
        collectionId: thread.originCollectionId ?? selectedCollectionId,
        title: thread.title,
        updated: 'Edited just now',
        originThreadId: threadId,
        blocks: [
          { id: makeId('block'), kind: 'heading', content: ['1. What this thread established'] },
          { id: makeId('block'), kind: 'paragraph', content: answer?.content ?? [] },
          { id: makeId('block'), kind: 'heading', content: ['2. What is still open'] },
          {
            id: makeId('block'),
            kind: 'paragraph',
            content: [],
            placeholder: 'Not drafted yet — what the thread could not settle.',
          },
        ],
        log: [
          {
            id: makeId('turn'),
            role: 'user',
            content: ['Turn ', { threadRefId: threadId }, ' into an artifact.'],
          },
          {
            id: makeId('turn'),
            role: 'assistant',
            content: [
              "Carried the thread's answer across as the first section, citations and all. Section 2 is a stub.",
            ],
            change: { blockId: 'seed', summary: 'Created from a thread', state: 'applied' },
          },
        ],
      }
      setArtifacts((prev) => ({ ...prev, [id]: artifact }))
      setCollections((prev) => {
        const collection = prev[artifact.collectionId]
        if (!collection) return prev
        return {
          ...prev,
          [artifact.collectionId]: {
            ...collection,
            artifactIds: [...collection.artifactIds, id],
          },
        }
      })
      openArtifact(id)
    },
    [openArtifact, selectedCollectionId, threads],
  )

  /**
   * The artifact → thread half of the loop. A claim in the draft becomes a real
   * collection thread rather than a buried exchange in the artifact's log, so
   * whatever it establishes is referenceable by everything else.
   */
  const findSupport = useCallback(
    (artifactId: string, blockId: string, claim: string) => {
      const artifact = artifactsRef.current[artifactId]
      if (!artifact) return
      const collectionId = artifact.collectionId
      const already = new Set(
        artifact.blocks
          .find((b) => b.id === blockId)
          ?.content.flatMap((seg) =>
            typeof seg === 'object' && 'citePaperId' in seg ? [seg.citePaperId] : [],
          ) ?? [],
      )
      const found = Object.keys(papers)
        .filter((id) => !already.has(id))
        .slice(0, 2)

      const id = makeId('thread')
      const thread: Thread = {
        id,
        title: claim.length > 60 ? `${claim.slice(0, 57)}…` : claim,
        updated: 'just now',
        messages: [
          { id: makeId('msg'), role: 'user', content: [`What supports this? “${claim}”`] },
        ],
        sources: found.map((paperId) => ({ paperId, query: claim })),
        originCollectionId: collectionId,
        originArtifactId: artifactId,
        originBlockId: blockId,
        claim,
      }
      setThreads((prev) => ({ ...prev, [id]: thread }))
      setCollections((prev) => {
        const collection = prev[collectionId]
        if (!collection) return prev
        return { ...prev, [collectionId]: { ...collection, threadIds: [...collection.threadIds, id] } }
      })
      setActiveThreadId(id)
      setView('thread')
      setReferencesOpen(true)
      setFollowUpTurns(0)
      answerAfter(id, 1200, () => ({
        content: buildSupportAnswer(claim, found),
        steps: [{ type: 'search', label: claim.slice(0, 48), count: '18 / 290K' }],
      }))
    },
    [answerAfter],
  )

  /** …and the return leg: the sources it found land back in the block. */
  const citeSupport = useCallback((threadId: string) => {
    const thread = threadsRef.current[threadId]
    if (!thread?.originArtifactId || !thread.originBlockId) return
    const artifactId = thread.originArtifactId
    const blockId = thread.originBlockId

    setArtifacts((prev) => {
      const artifact = prev[artifactId]
      if (!artifact) return prev
      const block = artifact.blocks.find((b) => b.id === blockId)
      if (!block) return prev
      const already = new Set(
        block.content.flatMap((seg) =>
          typeof seg === 'object' && 'citePaperId' in seg ? [seg.citePaperId] : [],
        ),
      )
      const fresh = thread.sources.map((s) => s.paperId).filter((id) => !already.has(id))
      if (fresh.length === 0) return prev

      const added: MessageSegment[] = [' Supported by ']
      fresh.forEach((id, i) => {
        if (i > 0) added.push(' and ')
        added.push({ citePaperId: id })
      })
      added.push('.')

      const heading = (() => {
        const index = artifact.blocks.indexOf(block)
        const before = artifact.blocks.slice(0, index).reverse().find((b) => b.kind === 'heading')
        return before ? segmentsToText(before.content) : 'this section'
      })()

      return {
        ...prev,
        [artifactId]: {
          ...artifact,
          updated: 'Edited just now',
          blocks: artifact.blocks.map((b) =>
            b.id === blockId ? { ...b, content: [...b.content, ...added] } : b,
          ),
          log: [
            ...artifact.log,
            {
              id: makeId('turn'),
              role: 'assistant',
              fromThreadId: threadId,
              content: [
                `Cited ${fresh.length} source${fresh.length === 1 ? '' : 's'} found in `,
                { threadRefId: threadId },
                ` into ${heading}.`,
              ],
              change: {
                blockId,
                summary: `Added ${fresh.length} citation${fresh.length === 1 ? '' : 's'} to ${heading}`,
                state: 'applied',
                previous: block.content,
              },
            },
          ],
        },
      }
    })
    openArtifact(artifactId)
  }, [openArtifact])

  const newArtifact = useCallback(
    (collectionId: string) => {
      const id = makeId('artifact')
      setArtifacts((prev) => ({
        ...prev,
        [id]: {
          id,
          collectionId,
          title: 'Untitled artifact',
          updated: 'Created just now',
          blocks: [
            { id: makeId('block'), kind: 'heading', content: ['1. Introduction'] },
            {
              id: makeId('block'),
              kind: 'paragraph',
              content: [],
              placeholder: 'Not drafted yet — say what this should cover in the chat.',
            },
          ],
          log: [],
        },
      }))
      setCollections((prev) => {
        const collection = prev[collectionId]
        if (!collection) return prev
        return { ...prev, [collectionId]: { ...collection, artifactIds: [...collection.artifactIds, id] } }
      })
      openArtifact(id)
    },
    [openArtifact],
  )

  /** §2 — promoting a surfaced paper moves it into the saved bibliography. */
  const savePaperToCollection = useCallback((collectionId: string, paperId: string) => {
    setLibraryPaperIds((prev) => (prev.includes(paperId) ? prev : [...prev, paperId]))
    setCollections((prev) => {
      const collection = prev[collectionId]
      if (!collection || collection.paperIds.includes(paperId)) return prev
      return { ...prev, [collectionId]: { ...collection, paperIds: [...collection.paperIds, paperId] } }
    })
  }, [])

  const dismissSurfacedPaper = useCallback((collectionId: string, paperId: string) => {
    setDismissed((prev) => new Set(prev).add(surfacedKey(collectionId, paperId)))
  }, [])

  const isSurfacedDismissed = useCallback(
    (collectionId: string, paperId: string) => dismissed.has(surfacedKey(collectionId, paperId)),
    [dismissed],
  )

  /**
   * A thread belongs to any number of collections, and to none (D28). Filing it
   * anywhere also saves it to the library, since collections are subsets (D30).
   */
  const toggleCollectionForThread = useCallback((collectionId: string, threadId: string) => {
    setCollections((prev) => {
      const collection = prev[collectionId]
      if (!collection) return prev
      const threadIds = collection.threadIds.includes(threadId)
        ? collection.threadIds.filter((id) => id !== threadId)
        : [...collection.threadIds, threadId]
      return { ...prev, [collectionId]: { ...collection, threadIds } }
    })
    setLibraryThreadIds((prev) => (prev.includes(threadId) ? prev : [...prev, threadId]))
  }, [])

  /** Leaving the library means leaving every collection under it. */
  const toggleLibraryForThread = useCallback((threadId: string) => {
    setLibraryThreadIds((prev) => {
      if (!prev.includes(threadId)) return [...prev, threadId]
      setCollections((cols) =>
        Object.fromEntries(
          Object.entries(cols).map(([id, c]) => [
            id,
            { ...c, threadIds: c.threadIds.filter((t) => t !== threadId) },
          ]),
        ),
      )
      return prev.filter((id) => id !== threadId)
    })
  }, [])

  const toggleLibraryForPaper = useCallback((paperId: string) => {
    setLibraryPaperIds((prev) => {
      if (!prev.includes(paperId)) return [...prev, paperId]
      setCollections((cols) =>
        Object.fromEntries(
          Object.entries(cols).map(([id, c]) => [
            id,
            { ...c, paperIds: c.paperIds.filter((p) => p !== paperId) },
          ]),
        ),
      )
      return prev.filter((id) => id !== paperId)
    })
  }, [])

  const deleteThread = useCallback(
    (threadId: string) => {
      setThreads((prev) => {
        const next = { ...prev }
        delete next[threadId]
        return next
      })
      setCollections((prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([id, collection]) => [
            id,
            { ...collection, threadIds: collection.threadIds.filter((t) => t !== threadId) },
          ]),
        ),
      )
      if (activeThreadId === threadId) {
        setActiveThreadId(null)
        setView('collection')
      }
      setOpenObject((prev) => (prev?.kind === 'thread' && prev.id === threadId ? null : prev))
    },
    [activeThreadId],
  )

  const createCollection = useCallback((name: string) => {
    if (!name.trim()) return null
    const id = makeId('collection')
    setCollections((prev) => ({
      ...prev,
      [id]: {
        id,
        name: name.trim(),
        parentId: null,
        paperIds: [],
        threadIds: [],
        artifactIds: [],
        instructions: '',
      },
    }))
    return id
  }, [])

  const collectionsForThread = useCallback(
    (threadId: string) =>
      Object.values(collections)
        .filter((collection) => collection.threadIds.includes(threadId))
        .map((collection) => collection.id),
    [collections],
  )

  const toggleCollectionForPaper = useCallback((collectionId: string, paperId: string) => {
    setLibraryPaperIds((prev) => (prev.includes(paperId) ? prev : [...prev, paperId]))
    setCollections((prev) => {
      const collection = prev[collectionId]
      if (!collection) return prev
      const paperIds = collection.paperIds.includes(paperId)
        ? collection.paperIds.filter((id) => id !== paperId)
        : [...collection.paperIds, paperId]
      return { ...prev, [collectionId]: { ...collection, paperIds } }
    })
  }, [])

  const setInstructions = useCallback((collectionId: string, instructions: string) => {
    setCollections((prev) => {
      const collection = prev[collectionId]
      if (!collection) return prev
      return { ...prev, [collectionId]: { ...collection, instructions } }
    })
  }, [])

  /** Hand a thread or item to the composer and bring the collection forward. */
  const referenceInComposer = useCallback((reference: PendingReference) => {
    setPendingReference(reference)
    setView('collection')
  }, [])

  const openInPanel = useCallback((object: OpenObject) => {
    setOpenObject(object)
    setObjectFocused(true)
    setPanelOpen(true)
  }, [])

  // askArtifact is defined above but referenced by the thread flow, which is
  // defined before it; a ref keeps the dependency one-way.
  const askArtifactRef = useRef(askArtifact)
  askArtifactRef.current = askArtifact

  const recentThreadIds = useMemo(() => Object.keys(threads).reverse(), [threads])

  const value = useMemo<AppStateShape>(
    () => ({
      view,
      papers,
      libraryPaperIds,
      libraryThreadIds,
      threads,
      collections,
      artifacts,
      activeThreadId,
      activeArtifactId,
      artifactTab,
      theme,
      setTheme,
      focusedBlockId,
      selectedCollectionId,
      collectionTab,
      panelOpen,
      panelView,
      openObject,
      referencesOpen,
      detailPaperId,
      isGenerating,
      isGeneratingArtifact,
      savePopoverPaperId,
      pendingReference,
      goHome,
      openCollection,
      openLibrary,
      toggleLibraryForPaper,
      toggleLibraryForThread,
      setCollectionTab,
      openThread,
      startNewThread,
      sendFollowUp,
      setPanelOpen,
      openInPanel,
      closeOpenObject: () => {
        setOpenObject(null)
        setObjectFocused(false)
      },
      objectFocused,
      focusObject: () => setObjectFocused(true),
      // Switching views leaves the object open behind its tab; only its own ✕
      // closes it.
      setPanelView: (view: PanelView) => {
        setObjectFocused(false)
        setPanelView(view)
      },
      toggleReferences: () => setReferencesOpen((v) => !v),
      openPaperDetail: setDetailPaperId,
      closePaperDetail: () => setDetailPaperId(null),
      savePopoverAnchor,
      // Anchored to whatever opened it, so the picker drops from the control
      // rather than landing in the middle of the screen.
      openSavePopover: (paperId: string, anchor?: HTMLElement | null) => {
        const rect = anchor?.getBoundingClientRect()
        setSavePopoverAnchor(rect ? { left: rect.left, top: rect.top, bottom: rect.bottom } : null)
        setSavePopoverPaperId(paperId)
      },
      closeSavePopover: () => {
        setSavePopoverPaperId(null)
        setSavePopoverAnchor(null)
      },
      toggleCollectionForPaper,
      toggleCollectionForThread,
      deleteThread,
      createCollection,
      collectionsForThread,
      recentThreadIds,
      setInstructions,
      referenceInComposer,
      clearPendingReference: () => setPendingReference(null),
      openArtifact,
      setArtifactTab,
      setFocusedBlock,
      askArtifact,
      resolveProposal,
      undoChange,
      editBlock,
      citeInBlock,
      artifactFromThread,
      renameArtifact,
      findSupport,
      citeSupport,
      newArtifact,
      startCrossThreadThread,
      startSuggestedThread,
      savePaperToCollection,
      dismissSurfacedPaper,
      isSurfacedDismissed,
    }),
    [
      view,
      papers,
      libraryPaperIds,
      libraryThreadIds,
      threads,
      collections,
      artifacts,
      activeThreadId,
      activeArtifactId,
      artifactTab,
      theme,
      focusedBlockId,
      selectedCollectionId,
      collectionTab,
      panelOpen,
      panelView,
      openObject,
      objectFocused,
      referencesOpen,
      detailPaperId,
      isGenerating,
      isGeneratingArtifact,
      savePopoverPaperId,
      pendingReference,
      goHome,
      openCollection,
      openLibrary,
      toggleLibraryForPaper,
      toggleLibraryForThread,
      openThread,
      startNewThread,
      sendFollowUp,
      openInPanel,
      toggleCollectionForThread,
      deleteThread,
      createCollection,
      collectionsForThread,
      recentThreadIds,
      openArtifact,
      askArtifact,
      resolveProposal,
      undoChange,
      editBlock,
      citeInBlock,
      artifactFromThread,
      renameArtifact,
      findSupport,
      citeSupport,
      newArtifact,
      toggleCollectionForPaper,
      setInstructions,
      referenceInComposer,
      startCrossThreadThread,
      startSuggestedThread,
      savePaperToCollection,
      dismissSurfacedPaper,
      isSurfacedDismissed,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
