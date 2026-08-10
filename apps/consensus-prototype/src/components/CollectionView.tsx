import { useMemo, useState } from 'react'
import { useAppState, type CollectionTab } from '../state/AppState'
import { citedInArtifact, plural, threadsInArtifact } from '../data/mock'
import { Badge } from './chips'
import { Icon, type IconName } from './icons'
import { Composer } from './Composer'
import { ProjectPanel } from './panel/ProjectPanel'
import { useStub } from './StubHint'
import { InstructionsBlock } from './InstructionsBlock'
import { ThreadMenu } from './ThreadMenu'
import { AddMenu } from './AddMenu'
import { Cell, Empty, Row, Table } from './Table'

const TABS: { key: CollectionTab; label: string; icon: IconName }[] = [
  { key: 'items', label: 'Items', icon: 'file' },
  { key: 'threads', label: 'Threads', icon: 'chat' },
  { key: 'artifacts', label: 'Artifacts', icon: 'fileText' },
]

export function CollectionView() {
  const {
    collections,
    papers,
    threads,
    artifacts,
    selectedCollectionId,
    collectionTab,
    setCollectionTab,
    panelOpen,
    setPanelOpen,
    openInPanel,
    startCrossThreadThread,
    newArtifact,
  } = useAppState()
  const stub = useStub()
  const [search, setSearch] = useState('')

  const collection = collections[selectedCollectionId]
  const match = (text: string) => text.toLowerCase().includes(search.trim().toLowerCase())

  const visible = useMemo(
    () => ({
      items: collection.paperIds.filter((id) => match(papers[id]?.title ?? '')),
      threads: collection.threadIds.filter((id) => match(threads[id]?.title ?? '')),
      artifacts: collection.artifactIds.filter((id) => match(artifacts[id]?.title ?? '')),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collection, papers, threads, artifacts, search],
  )
  const counts: Record<CollectionTab, number> = {
    items: collection.paperIds.length,
    threads: collection.threadIds.length,
    artifacts: collection.artifactIds.length,
  }

  return (
    <div className="flex min-w-0 flex-1">
      <div className="@container relative flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 px-4">
          <h1 className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[22px] font-medium leading-[30px] text-ink @max-[430px]:text-[18px]">
            <span className="hidden shrink-0 @[520px]:inline">My Library</span>
            <span className="hidden shrink-0 text-faint @[520px]:inline">/</span>
            <span className="truncate text-muted">{collection.name}</span>
          </h1>
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn"
                aria-label="Share"
                onClick={(e) => stub(e, 'Share this collection with collaborators')}
              >
                <Icon name="share" size={16} />
                <span className="hidden @[440px]:inline">Share</span>
              </button>
              <AddMenu collectionId={collection.id} />
            </div>
            {/* Sits against the panel it controls, mirroring the rail toggle. */}
            <button
              type="button"
              onClick={() => setPanelOpen(!panelOpen)}
              aria-pressed={panelOpen}
              title="Project panel"
              className={`icon-btn size-9 rounded-[12px] ${panelOpen ? 'bg-fill text-ink' : ''}`}
            >
              <Icon name="panel" size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <InstructionsBlock />

        <div className="flex shrink-0 gap-6 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] @max-[520px]:gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCollectionTab(tab.key)}
              aria-current={collectionTab === tab.key}
              className={`-mb-px inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap border-b-[3px] text-[15.04px] font-medium leading-6 ${
                collectionTab === tab.key
                  ? 'border-ink text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Icon name={tab.icon} size={20} strokeWidth={1.5} />
              {tab.label} ({counts[tab.key]})
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
                placeholder={`Search ${collectionTab} in ${collection.name}`}
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
            {collectionTab === 'artifacts' && (
              <button
                type="button"
                className="btn shrink-0"
                onClick={() => newArtifact(collection.id)}
              >
                <Icon name="plus" size={16} /> New artifact
              </button>
            )}
          </div>

          {collectionTab === 'items' && visible.items.length === 0 && (
            <Empty
              search={search}
              noun="items"
              hint="Save a paper from the Read tab, or add one to this collection."
            />
          )}
          {collectionTab === 'threads' && visible.threads.length === 0 && (
            <Empty
              search={search}
              noun="threads"
              hint="Ask a question below, or save an existing thread into this collection from its ⋯ menu."
            />
          )}
          {collectionTab === 'artifacts' && visible.artifacts.length === 0 && (
            <Empty
              search={search}
              noun="artifacts"
              hint="Turn a thread into an artifact, or start one with New artifact."
            />
          )}

          {collectionTab === 'items' && visible.items.length > 0 && (
            <Table headers={['Title', 'Type', 'Authors', 'Journal', 'Year']} drop={[1, 2, 3]}>
              {visible.items.map((id) => {
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
          )}

          {collectionTab === 'threads' && visible.threads.length > 0 && (
            <Table headers={['Title', 'Preview', 'Updated']} drop={[1]}>
              {visible.threads.map((id) => {
                const thread = threads[id]
                if (!thread) return null
                const preview = thread.messages
                  .flatMap((m) => m.content)
                  .map((s) => (typeof s === 'string' ? s : ''))
                  .join(' ')
                  .trim()
                return (
                  <Row key={id} onClick={() => openInPanel({ kind: 'thread', id })}>
                    <Cell bold>
                      <span className="flex items-center gap-2">
                        <span className="min-w-0 grow truncate">{thread.title}</span>
                        <ThreadMenu threadId={id} />
                      </span>
                    </Cell>
                    <Cell muted drop={0}>
                      {preview}
                    </Cell>
                    <Cell muted>{thread.updated}</Cell>
                  </Row>
                )
              })}
            </Table>
          )}

          {collectionTab === 'artifacts' && visible.artifacts.length > 0 && (
            <Table headers={['Title', 'Type', 'Built from', 'Updated']} drop={[2]}>
              {visible.artifacts.map((id) => {
                const artifact = artifacts[id]
                return (
                  <Row key={id} onClick={() => openInPanel({ kind: 'artifact', id })}>
                    <Cell bold>
                      <span className="inline-flex items-center gap-2">
                        <Icon name="fileText" size={16} className="text-muted" />
                        {artifact.title}
                      </span>
                    </Cell>
                    <Cell>
                      <Badge fill="var(--color-fill)" ink="var(--color-muted)">
                        {artifact.kind}
                      </Badge>
                    </Cell>
                    <Cell muted drop={0}>
                      {plural(citedInArtifact(artifact).length, 'source')} ·{' '}
                      {plural(threadsInArtifact(artifact).length, 'thread')}
                    </Cell>
                    <Cell muted>{artifact.updated}</Cell>
                  </Row>
                )
              })}
            </Table>
          )}
        </div>

        {/* Anchored to the column, so it is centred, never scrolls with a table,
            and is present on every tab. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-surface via-surface to-transparent pt-10">
          <div className="pointer-events-auto mx-auto max-w-3xl px-4 pb-4">
            <Composer
              placeholder="Ask these papers…"
              onSubmit={(segments, scopePaperIds, scopeArtifactIds) =>
                startCrossThreadThread(segments, scopePaperIds, scopeArtifactIds)
              }
            />
          </div>
        </div>
      </div>

      <ProjectPanel />
    </div>
  )
}
