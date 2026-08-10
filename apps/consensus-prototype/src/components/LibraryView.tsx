import { useState } from 'react'
import { useAppState } from '../state/AppState'
import { plural } from '../data/mock'
import { Icon } from './icons'
import { Composer } from './Composer'
import { ThreadMenu } from './ThreadMenu'
import { AddMenu } from './AddMenu'
import { Cell, Empty, Row, Table } from './Table'

/**
 * My Library — everything you saved, across every collection (D30).
 *
 * Deliberately thinner than a collection: no instructions, no panel. A
 * collection is a project with a point of view; the library is the shelf.
 */
export function LibraryView() {
  const {
    papers,
    threads,
    libraryPaperIds,
    libraryThreadIds,
    openInPanel,
    openThread,
    startNewThread,
  } = useAppState()
  const [tab, setTab] = useState<'items' | 'threads'>('items')
  const [search, setSearch] = useState('')

  const match = (text: string) => text.toLowerCase().includes(search.trim().toLowerCase())
  const items = libraryPaperIds.filter((id) => papers[id] && match(papers[id].title))
  const threadRows = libraryThreadIds.filter((id) => threads[id] && match(threads[id].title))

  const TABS = [
    { key: 'items' as const, label: 'Items', icon: 'file' as const, count: libraryPaperIds.length },
    { key: 'threads' as const, label: 'Threads', icon: 'chat' as const, count: libraryThreadIds.length },
  ]

  return (
    <div className="@container relative flex min-w-0 flex-1 flex-col">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 px-4">
        <h1 className="truncate text-[22px] font-medium leading-[30px] text-ink">My Library</h1>
        {/* No collection here, so no authoring group — the library imports only. */}
        <AddMenu />
      </header>

      <div className="flex shrink-0 gap-6 overflow-x-auto border-b border-line px-4 [scrollbar-width:none]">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setTab(entry.key)}
            aria-current={tab === entry.key}
            className={`-mb-px inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap border-b-[3px] text-[15.04px] font-medium leading-6 ${
              tab === entry.key ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Icon name={entry.icon} size={20} strokeWidth={1.5} />
            {entry.label} ({entry.count})
          </button>
        ))}
      </div>

      <div className="scroll-y pb-40">
        <div className="flex items-center gap-3 bg-rail px-4 py-3">
          <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[12px] border border-line bg-panel px-3">
            <Icon name="search" size={16} className="text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${tab} in My Library`}
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="icon-btn size-6"
                aria-label="Clear search"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>

        {tab === 'items' &&
          (items.length === 0 ? (
            <Empty
              search={search}
              noun="items"
              hint="Save a paper from a thread or a collection and it lands here."
            />
          ) : (
            <Table headers={['Title', 'Type', 'Authors', 'Journal', 'Year']} drop={[1, 2, 3]}>
              {items.map((id) => {
                const paper = papers[id]
                return (
                  <Row key={id} onClick={() => openInPanel({ kind: 'paper', id })}>
                    <Cell bold>{paper.title}</Cell>
                    <Cell muted drop={0}>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="search" size={16} className="text-muted" />
                        Journal Article
                      </span>
                    </Cell>
                    <Cell muted drop={1}>
                      {paper.authors.join(', ')}
                    </Cell>
                    <Cell muted drop={2}>
                      {paper.journal}
                    </Cell>
                    <Cell muted>{paper.year}</Cell>
                  </Row>
                )
              })}
            </Table>
          ))}

        {tab === 'threads' &&
          (threadRows.length === 0 ? (
            <Empty
              search={search}
              noun="threads"
              hint="Threads you save from the ⋯ menu appear here. Unsaved ones stay in Recents."
            />
          ) : (
            <Table headers={['Title', 'Collections', 'Updated']} drop={[1]}>
              {threadRows.map((id) => {
                const thread = threads[id]
                return (
                  <Row key={id} onClick={() => openThread(id)}>
                    <Cell bold>
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 grow truncate">{thread.title}</span>
                        <ThreadMenu threadId={id} />
                      </span>
                    </Cell>
                    <Cell muted drop={0}>
                      <CollectionsFor threadId={id} />
                    </Cell>
                    <Cell muted>{thread.updated}</Cell>
                  </Row>
                )
              })}
            </Table>
          ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-surface via-surface to-transparent pt-10">
        <div className="pointer-events-auto mx-auto max-w-3xl px-4 pb-4">
          <Composer
            placeholder="Ask these papers…"
            scopeLabel={`My Library · ${plural(libraryPaperIds.length, 'item')}`}
            onSubmit={(segments) => {
              const text = segments
                .map((s) => (typeof s === 'string' ? s : ''))
                .join(' ')
                .trim()
              if (text) startNewThread(text)
            }}
          />
        </div>
      </div>
    </div>
  )
}

/** Where a saved thread is filed — the column that makes the library legible. */
function CollectionsFor({ threadId }: { threadId: string }) {
  const { collections, collectionsForThread, openCollection } = useAppState()
  const ids = collectionsForThread(threadId)

  if (ids.length === 0) return <span className="text-faint">Unfiled</span>

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            openCollection(id)
          }}
          className="inline-flex h-5 items-center gap-1 rounded-[8px] bg-fill px-1.5 text-[12.96px] leading-[20px] text-muted hover:text-ink"
        >
          <Icon name="folder" size={12} />
          {collections[id]?.name}
        </button>
      ))}
    </span>
  )
}
