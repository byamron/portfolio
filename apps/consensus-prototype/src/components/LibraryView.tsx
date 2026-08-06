import { useMemo, useState } from 'react'
import { useAppState } from '../state/AppState'
import { Checkbox } from './Checkbox'
import { SurfacedSourceRow } from './SurfacedSourceRow'
import { SuggestionCard } from './SuggestionCard'
import { ThreadRefComposer } from './ThreadRefComposer'
import { suggestions as allSuggestions } from '../data/mockData'
import { UsersIcon, PlusIcon, ChevronDownIcon, DocumentIcon, ChatIcon, SearchIcon, FilterIcon, DownloadIcon } from './icons'

function Breadcrumb({ collectionId }: { collectionId: string }) {
  const { collections, selectCollection } = useAppState()
  const collection = collections[collectionId]
  if (!collection) return null
  const parent = collection.parentId ? collections[collection.parentId] : null

  return (
    <div className="flex items-center gap-3 text-base leading-6">
      <span className="text-[18.08px] font-bold leading-[25.12px] text-text-primary">My Library</span>
      {parent && (
        <>
          <span className="text-text-secondary">/</span>
          <button type="button" onClick={() => selectCollection(parent.id)} className="text-text-secondary hover:underline">
            {parent.name}
          </button>
        </>
      )}
      <span className="text-text-secondary">/</span>
      <span className="text-text-secondary">{collection.name}</span>
    </div>
  )
}

const COLUMN_WIDTHS = { checkbox: 55, title: 460, authors: 200, journal: 200, year: 80, actions: 80 }

export function LibraryView() {
  const { collections, selectedCollectionId, papers, threads, openPaperDetail, isSurfacedDismissed, startCrossThreadThread } =
    useAppState()
  const [tab, setTab] = useState<'items' | 'threads'>('items')

  const collection = selectedCollectionId ? collections[selectedCollectionId] : null

  const collectionThreads = useMemo(
    () => (collection ? collection.threadIds.map((id) => threads[id]).filter((t): t is NonNullable<typeof t> => Boolean(t)) : []),
    [collection, threads],
  )

  // §2 — papers referenced across this collection's threads, not yet saved, not dismissed.
  const surfaced = useMemo(() => {
    if (!collection) return []
    const byPaper = new Map<string, string[]>()
    for (const thread of collectionThreads) {
      for (const paperId of thread.referencedPaperIds) {
        if (collection.paperIds.includes(paperId)) continue
        if (isSurfacedDismissed(collection.id, paperId)) continue
        const list = byPaper.get(paperId) ?? []
        list.push(thread.id)
        byPaper.set(paperId, list)
      }
    }
    return Array.from(byPaper.entries())
      .map(([paperId, threadIds]) => ({ paper: papers[paperId], threadIds }))
      .filter((s): s is { paper: NonNullable<typeof s.paper>; threadIds: string[] } => Boolean(s.paper))
  }, [collection, collectionThreads, papers, isSurfacedDismissed])

  const collectionSuggestions = useMemo(
    () => (collection ? allSuggestions.filter((s) => s.collectionId === collection.id) : []),
    [collection],
  )

  if (!collection) return null

  const items = collection.paperIds.map((id) => papers[id]).filter(Boolean)

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="flex h-16 shrink-0 items-center justify-between bg-surface-panel px-4">
        <Breadcrumb collectionId={collection.id} />
        <div className="flex items-center gap-2">
          <button type="button" className="elevated flex h-9 items-center gap-2 rounded-control bg-surface-app px-3 text-[15.04px] font-medium leading-[22.56px] text-text-primary">
            <UsersIcon size={20} /> Share <ChevronDownIcon size={16} />
          </button>
          <button type="button" className="elevated-accent flex h-9 items-center gap-2 rounded-control bg-accent px-3 text-[15.04px] font-medium leading-[22.56px] text-white">
            <PlusIcon size={20} /> Add <ChevronDownIcon size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border/60 px-6">
        <button
          type="button"
          onClick={() => setTab('items')}
          className={`flex items-center gap-2 border-b-[3px] px-1 py-2.5 text-[15.04px] font-medium leading-[22.56px] ${
            tab === 'items' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-secondary'
          }`}
        >
          <DocumentIcon size={20} /> Items ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('threads')}
          className={`flex items-center gap-2 border-b-[3px] px-1 py-2.5 text-[15.04px] font-medium leading-[22.56px] ${
            tab === 'threads' ? 'border-text-primary text-text-primary' : 'border-transparent text-text-secondary'
          }`}
        >
          <ChatIcon size={20} /> Threads ({collectionThreads.length})
        </button>
      </div>

      <div className="flex h-[62px] shrink-0 items-center gap-2 border-b border-border/60 px-6">
        <div className="flex h-[38px] w-[500px] items-center gap-2 rounded-control border border-border/60 bg-surface-app px-2.5 text-text-secondary">
          <SearchIcon size={16} />
          <input
            placeholder={`Search ${tab === 'items' ? 'items' : 'threads'} in ${collection.name}`}
            className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>
        {tab === 'items' && (
          <>
            <button type="button" className="flex size-9 items-center justify-center rounded-control text-text-secondary hover:bg-surface-panel hover:text-text-primary" aria-label="Filter">
              <FilterIcon size={16} />
            </button>
            <button type="button" className="flex size-9 items-center justify-center rounded-control text-text-secondary hover:bg-surface-panel hover:text-text-primary" aria-label="Download">
              <DownloadIcon size={16} />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {tab === 'items' ? (
          items.length === 0 && surfaced.length === 0 ? (
            <EmptyState label="No items saved here yet" />
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-text-primary">
                Your items <span className="text-text-secondary">{items.length}</span>
              </div>
              <table className="text-left text-[13px]" style={{ tableLayout: 'fixed', width: '100%', minWidth: 1075 }}>
                <colgroup>
                  <col style={{ width: COLUMN_WIDTHS.checkbox }} />
                  <col style={{ width: COLUMN_WIDTHS.title }} />
                  <col style={{ width: COLUMN_WIDTHS.authors }} />
                  <col style={{ width: COLUMN_WIDTHS.journal }} />
                  <col style={{ width: COLUMN_WIDTHS.year }} />
                  <col style={{ width: COLUMN_WIDTHS.actions }} />
                </colgroup>
                <thead>
                  <tr className="h-[52px] bg-surface-panel text-text-primary">
                    <th className="rounded-l-control px-3 font-medium">
                      <Checkbox checked={false} onChange={() => {}} ariaLabel="Select all" />
                    </th>
                    <th className="px-3 font-medium">Title</th>
                    <th className="px-3 font-medium">Authors</th>
                    <th className="px-3 font-medium">Journal</th>
                    <th className="px-3 font-medium">Year</th>
                    <th className="rounded-r-control px-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((paper) => (
                    <ItemRow key={paper.id} title={paper.title} onOpen={() => openPaperDetail(paper.id)}>
                      <td className="truncate px-3 text-text-secondary">{paper.authors.join(', ')}</td>
                      <td className="truncate px-3 italic text-text-secondary">{paper.journal}</td>
                      <td className="px-3 text-text-secondary">{paper.year}</td>
                      <td className="px-3" />
                    </ItemRow>
                  ))}
                </tbody>
              </table>

              {surfaced.length > 0 && (
                <>
                  <div className="mb-2 mt-6 flex items-center gap-2 text-[13px] font-medium text-text-primary">
                    Surfaced from your threads <span className="text-text-secondary">{surfaced.length}</span>
                    <span className="text-text-secondary">· Not yet saved</span>
                  </div>
                  <table className="text-left text-[13px]" style={{ tableLayout: 'fixed', width: '100%', minWidth: 1075 }}>
                    <colgroup>
                      <col style={{ width: COLUMN_WIDTHS.checkbox }} />
                      <col style={{ width: COLUMN_WIDTHS.title }} />
                      <col style={{ width: COLUMN_WIDTHS.authors }} />
                      <col style={{ width: COLUMN_WIDTHS.journal }} />
                      <col style={{ width: COLUMN_WIDTHS.year }} />
                      <col style={{ width: COLUMN_WIDTHS.actions }} />
                    </colgroup>
                    <tbody>
                      {surfaced.map(({ paper, threadIds }) => (
                        <SurfacedSourceRow key={paper.id} paper={paper} threadIds={threadIds} collectionId={collection.id} />
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )
        ) : (
          <>
            <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-text-primary">
              Threads <span className="text-text-secondary">{collectionThreads.length}</span>
            </div>
            {collectionThreads.length === 0 ? (
              <EmptyState label="No threads saved here yet" />
            ) : (
              <table className="text-left text-[13px]" style={{ tableLayout: 'fixed', width: '100%', minWidth: 900 }}>
                <colgroup>
                  <col style={{ width: COLUMN_WIDTHS.checkbox }} />
                  <col style={{ width: 300 }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <thead>
                  <tr className="h-[52px] bg-surface-panel text-text-primary">
                    <th className="rounded-l-control px-3 font-medium">
                      <Checkbox checked={false} onChange={() => {}} ariaLabel="Select all" />
                    </th>
                    <th className="px-3 font-medium">Title</th>
                    <th className="rounded-r-control px-3 font-medium">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {collectionThreads.map((t) => (
                    <ItemRow key={t.id} title={t.title} onOpen={() => {}}>
                      <td className="truncate px-3 text-text-secondary">
                        {t.messages
                          .find((m) => m.role === 'assistant')
                          ?.content.map((s) => (typeof s === 'string' ? s : ''))
                          .join('')}
                      </td>
                    </ItemRow>
                  ))}
                </tbody>
              </table>
            )}

            {collectionSuggestions.length > 0 && (
              <div className="mt-6">
                <div className="mb-1 flex items-center gap-2 text-[13px] font-medium text-text-primary">
                  Keep exploring <span className="text-text-secondary">{collectionSuggestions.length}</span>
                </div>
                {collectionSuggestions.map((s) => (
                  <SuggestionCard key={s.id} suggestion={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {items.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <ThreadRefComposer
            collection={collection}
            itemCount={items.length}
            onSubmit={(segments, scopePaperIds) => startCrossThreadThread(segments, scopePaperIds, collection.id)}
          />
        </div>
      )}
    </div>
  )
}

function ItemRow({ title, onOpen, children }: { title: string; onOpen: () => void; children: React.ReactNode }) {
  const [selected, setSelected] = useState(false)
  return (
    <tr className="h-[43px] border-b border-border/40 hover:bg-surface-panel/50">
      <td className="px-3">
        <Checkbox checked={selected} onChange={() => setSelected((v) => !v)} ariaLabel="Select row" />
      </td>
      <td className="truncate px-3">
        <button type="button" onClick={onOpen} className="truncate text-left text-text-primary hover:underline">
          {title}
        </button>
      </td>
      {children}
    </tr>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <p className="text-[15px] font-medium text-text-primary">{label}</p>
      <p className="mt-1 max-w-sm text-[13px] text-text-secondary">
        Save, organize, and chat with items in your Library! Click the save button on any paper in a thread to
        add it here.
      </p>
    </div>
  )
}
