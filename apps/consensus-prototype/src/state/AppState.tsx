import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  papers as seedPapers,
  collections as seedCollections,
  threads as seedThreads,
  buildNewThreadAnswer,
  buildFollowUpAnswer,
  buildCrossThreadAnswer,
  type Paper,
  type Thread,
  type Collection,
  type Message,
  type MessageSegment,
  type Suggestion,
} from '../data/mockData'

export type View = 'home' | 'thread' | 'library'

let nextId = 1
function makeId(prefix: string) {
  return `${prefix}-${nextId++}`
}

function surfacedKey(collectionId: string, paperId: string) {
  return `${collectionId}|${paperId}`
}

interface AppStateShape {
  view: View
  papers: Record<string, Paper>
  threads: Record<string, Thread>
  activeThreadId: string | null
  collections: Record<string, Collection>
  selectedCollectionId: string | null
  referencesOpen: boolean
  detailPaperId: string | null
  isGenerating: boolean
  savePopoverPaperId: string | null
  dismissedSurfaced: Set<string>

  goHome: () => void
  goLibrary: (collectionId?: string) => void
  openThread: (threadId: string) => void
  startNewThread: (query: string) => void
  sendFollowUp: (text: string) => void
  selectCollection: (collectionId: string) => void
  openPaperDetail: (paperId: string) => void
  closePaperDetail: () => void
  toggleReferences: () => void
  openSavePopover: (paperId: string) => void
  closeSavePopover: () => void
  toggleCollectionForPaper: (collectionId: string, paperId: string) => void
  createCollection: (name: string, parentId: string | null) => void
  startCrossThreadThread: (segments: MessageSegment[], scopePaperIds: string[], originCollectionId: string) => void
  startSuggestedThread: (suggestion: Suggestion) => void
  dismissSurfacedPaper: (collectionId: string, paperId: string) => void
  isSurfacedDismissed: (collectionId: string, paperId: string) => boolean
}

const AppStateContext = createContext<AppStateShape | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('home')
  const [papers] = useState(seedPapers)
  const [threads, setThreads] = useState(seedThreads)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [collections, setCollections] = useState(seedCollections)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>('my-health')
  const [referencesOpen, setReferencesOpen] = useState(true)
  const [detailPaperId, setDetailPaperId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [savePopoverPaperId, setSavePopoverPaperId] = useState<string | null>(null)
  const [followUpTurns, setFollowUpTurns] = useState(0)
  const [dismissedSurfaced, setDismissedSurfaced] = useState<Set<string>>(new Set())

  const goHome = useCallback(() => {
    setView('home')
    setActiveThreadId(null)
  }, [])

  const goLibrary = useCallback((collectionId?: string) => {
    setView('library')
    if (collectionId) setSelectedCollectionId(collectionId)
  }, [])

  const openThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId)
    setView('thread')
    setReferencesOpen(true)
    setFollowUpTurns(0)
  }, [])

  const startNewThread = useCallback((query: string) => {
    const id = makeId('thread')
    const userMessage: Message = { id: makeId('msg'), role: 'user', content: [query] }
    const newThread: Thread = {
      id,
      title: query.length > 60 ? `${query.slice(0, 57)}...` : query,
      messages: [userMessage],
      referencedPaperIds: ['tiller2019', 'podlogar2022'],
    }
    setThreads((prev) => ({ ...prev, [id]: newThread }))
    setActiveThreadId(id)
    setView('thread')
    setReferencesOpen(true)
    setFollowUpTurns(0)
    setIsGenerating(true)

    window.setTimeout(() => {
      const assistantMessage: Message = {
        id: makeId('msg'),
        role: 'assistant',
        content: buildNewThreadAnswer(),
      }
      setThreads((prev) => {
        const thread = prev[id]
        if (!thread) return prev
        return { ...prev, [id]: { ...thread, messages: [...thread.messages, assistantMessage] } }
      })
      setIsGenerating(false)
    }, 1100)
  }, [])

  const sendFollowUp = useCallback(
    (text: string) => {
      if (!activeThreadId) return
      const userMessage: Message = { id: makeId('msg'), role: 'user', content: [text] }
      setThreads((prev) => {
        const thread = prev[activeThreadId]
        if (!thread) return prev
        return { ...prev, [activeThreadId]: { ...thread, messages: [...thread.messages, userMessage] } }
      })
      setIsGenerating(true)
      const turn = followUpTurns + 1
      setFollowUpTurns(turn)

      window.setTimeout(() => {
        const assistantMessage: Message = {
          id: makeId('msg'),
          role: 'assistant',
          content: buildFollowUpAnswer(turn),
        }
        setThreads((prev) => {
          const thread = prev[activeThreadId]
          if (!thread) return prev
          return { ...prev, [activeThreadId]: { ...thread, messages: [...thread.messages, assistantMessage] } }
        })
        setIsGenerating(false)
      }, 900)
    },
    [activeThreadId, followUpTurns],
  )

  const selectCollection = useCallback((collectionId: string) => {
    setSelectedCollectionId(collectionId)
  }, [])

  const openPaperDetail = useCallback((paperId: string) => setDetailPaperId(paperId), [])
  const closePaperDetail = useCallback(() => setDetailPaperId(null), [])
  const toggleReferences = useCallback(() => setReferencesOpen((v) => !v), [])
  const openSavePopover = useCallback((paperId: string) => setSavePopoverPaperId(paperId), [])
  const closeSavePopover = useCallback(() => setSavePopoverPaperId(null), [])

  const toggleCollectionForPaper = useCallback((collectionId: string, paperId: string) => {
    setCollections((prev) => {
      const collection = prev[collectionId]
      if (!collection) return prev
      const has = collection.paperIds.includes(paperId)
      const paperIds = has
        ? collection.paperIds.filter((id) => id !== paperId)
        : [...collection.paperIds, paperId]
      return { ...prev, [collectionId]: { ...collection, paperIds } }
    })
  }, [])

  const createCollection = useCallback((name: string, parentId: string | null) => {
    const id = makeId('collection')
    setCollections((prev) => ({ ...prev, [id]: { id, name, parentId, paperIds: [], threadIds: [] } }))
  }, [])

  // §1 — cross-thread referencing: segments carry free text and {threadRefId} inline pills
  // (typed via the @ picker); scopePaperIds are items/sources pinned as chips, never inline —
  // the two reference types stay visually distinct, never conflated.
  const startCrossThreadThread = useCallback(
    (segments: MessageSegment[], scopePaperIds: string[], originCollectionId: string) => {
      const referencedThreadIds = segments
        .filter((s): s is { threadRefId: string } => typeof s === 'object' && 'threadRefId' in s)
        .map((s) => s.threadRefId)
      const basedOnThreads = referencedThreadIds.map((tid) => threads[tid]).filter((t): t is Thread => Boolean(t))
      const id = makeId('thread')
      const titleText = segments
        .map((s) => (typeof s === 'string' ? s : 'threadRefId' in s ? threads[s.threadRefId]?.title ?? '' : ''))
        .join(' ')
        .trim()
      const userMessage: Message = { id: makeId('msg'), role: 'user', content: segments }
      const newThread: Thread = {
        id,
        title: titleText.length > 60 ? `${titleText.slice(0, 57)}...` : titleText || 'New cross-thread question',
        messages: [userMessage],
        referencedPaperIds: scopePaperIds.length > 0 ? scopePaperIds : ['tiller2019', 'podlogar2022'],
        originCollectionId,
        scopePaperIds,
      }
      setThreads((prev) => ({ ...prev, [id]: newThread }))
      setActiveThreadId(id)
      setView('thread')
      setReferencesOpen(true)
      setFollowUpTurns(0)
      setIsGenerating(true)

      window.setTimeout(() => {
        const { steps, content } = buildCrossThreadAnswer(basedOnThreads)
        const assistantMessage: Message = { id: makeId('msg'), role: 'assistant', steps, content }
        setThreads((prev) => {
          const thread = prev[id]
          if (!thread) return prev
          return { ...prev, [id]: { ...thread, messages: [...thread.messages, assistantMessage] } }
        })
        setIsGenerating(false)
      }, 1400)
    },
    [threads],
  )

  // §3 — proactive synthesis: "Start thread" on a suggestion card seeds a new thread grounded
  // in the same threads the suggestion was based on. Also carries ambient context — it's still
  // started from within a Collection, same as the composer flow above.
  const startSuggestedThread = useCallback(
    (suggestion: Suggestion) => {
      const basedOnThreads = suggestion.basedOnThreadIds
        .map((tid) => threads[tid])
        .filter((t): t is Thread => Boolean(t))
      const id = makeId('thread')
      const userMessage: Message = { id: makeId('msg'), role: 'user', content: [suggestion.question] }
      const newThread: Thread = {
        id,
        title: suggestion.question,
        messages: [userMessage],
        referencedPaperIds: ['tiller2019', 'podlogar2022'],
        originCollectionId: suggestion.collectionId,
      }
      setThreads((prev) => ({ ...prev, [id]: newThread }))
      setActiveThreadId(id)
      setView('thread')
      setReferencesOpen(true)
      setFollowUpTurns(0)
      setIsGenerating(true)

      window.setTimeout(() => {
        const { steps, content } = buildCrossThreadAnswer(basedOnThreads)
        const assistantMessage: Message = { id: makeId('msg'), role: 'assistant', steps, content }
        setThreads((prev) => {
          const thread = prev[id]
          if (!thread) return prev
          return { ...prev, [id]: { ...thread, messages: [...thread.messages, assistantMessage] } }
        })
        setIsGenerating(false)
      }, 1400)
    },
    [threads],
  )

  // §2 — surfacing: dismissing a not-yet-saved paper hides it for that collection permanently
  // (never re-surfaced, never nags).
  const dismissSurfacedPaper = useCallback((collectionId: string, paperId: string) => {
    setDismissedSurfaced((prev) => new Set(prev).add(surfacedKey(collectionId, paperId)))
  }, [])
  const isSurfacedDismissed = useCallback(
    (collectionId: string, paperId: string) => dismissedSurfaced.has(surfacedKey(collectionId, paperId)),
    [dismissedSurfaced],
  )

  const value = useMemo<AppStateShape>(
    () => ({
      view,
      papers,
      threads,
      activeThreadId,
      collections,
      selectedCollectionId,
      referencesOpen,
      detailPaperId,
      isGenerating,
      savePopoverPaperId,
      dismissedSurfaced,
      goHome,
      goLibrary,
      openThread,
      startNewThread,
      sendFollowUp,
      selectCollection,
      openPaperDetail,
      closePaperDetail,
      toggleReferences,
      openSavePopover,
      closeSavePopover,
      toggleCollectionForPaper,
      createCollection,
      startCrossThreadThread,
      startSuggestedThread,
      dismissSurfacedPaper,
      isSurfacedDismissed,
    }),
    [
      view,
      papers,
      threads,
      activeThreadId,
      collections,
      selectedCollectionId,
      referencesOpen,
      detailPaperId,
      isGenerating,
      savePopoverPaperId,
      dismissedSurfaced,
      goHome,
      goLibrary,
      openThread,
      startNewThread,
      sendFollowUp,
      selectCollection,
      openPaperDetail,
      closePaperDetail,
      toggleReferences,
      openSavePopover,
      closeSavePopover,
      toggleCollectionForPaper,
      createCollection,
      startCrossThreadThread,
      startSuggestedThread,
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
