import { useEffect, useRef, useState } from 'react'
import { useAppState, type ArtifactTab } from '../../state/AppState'
import type { ArtifactTurn } from '../../data/mock'
import { renderSegment } from '../ThreadView'
import { Badge, ThreadChip } from '../chips'
import { Icon } from '../icons'
import { PanelEmpty } from '../panel/views'

const TABS: { key: ArtifactTab; label: string; icon: 'chat' | 'file' | 'history' }[] = [
  { key: 'chat', label: 'Chat', icon: 'chat' },
  { key: 'history', label: 'History', icon: 'history' },
  { key: 'items', label: 'Items', icon: 'file' },
]

/**
 * The artifact's other half (D27): its one persistent conversation, and the
 * collection's saved items so the sources you cite from are within reach of the
 * sentence you are writing.
 */
export function ArtifactPanel({ artifactId }: { artifactId: string }) {
  const { artifactTab, setArtifactTab } = useAppState()

  return (
    <aside
      className="flex h-full w-[380px] shrink-0 flex-col overflow-hidden border-l border-line bg-panel"
      aria-label="Artifact panel"
    >
      <header className="flex min-h-12 shrink-0 items-stretch gap-0.5 border-b border-line px-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setArtifactTab(tab.key)}
            aria-current={artifactTab === tab.key}
            className={`-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2 text-[13px] font-medium leading-5 ${
              artifactTab === tab.key
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </header>

      {artifactTab === 'chat' && <ChatTab artifactId={artifactId} />}
      {artifactTab === 'history' && <HistoryTab artifactId={artifactId} />}
      {artifactTab === 'items' && <ItemsTab artifactId={artifactId} />}
    </aside>
  )
}

/**
 * The log is the changelog (D23): every turn that changed the document is here
 * with the reason, including the ones requested from another thread (D24).
 */
function ChatTab({ artifactId }: { artifactId: string }) {
  const { artifacts, askArtifact, isGeneratingArtifact } = useAppState()
  const artifact = artifacts[artifactId]
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [artifact?.log.length, isGeneratingArtifact])

  if (!artifact) return null

  function send() {
    const text = draft.trim()
    if (!text) return
    askArtifact(artifactId, text)
    setDraft('')
  }

  return (
    <>
      <div className="scroll-y flex flex-col gap-4 px-3 py-3">
        {artifact.log.length === 0 && (
          <PanelEmpty
            icon="chat"
            title="Nothing written yet"
            body="Ask for a section and it gets drafted. This conversation is the document's history — every change that lands is recorded here with its reason."
          />
        )}
        {artifact.log.map((turn) => (
          <Turn key={turn.id} turn={turn} artifactId={artifactId} />
        ))}
        {isGeneratingArtifact && (
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            Writing…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 border-t border-line p-2.5">
        <div className="flex items-end gap-2 rounded-[14px] border border-line bg-panel px-3 py-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                send()
              }
            }}
            placeholder="Ask for a change…"
            className="min-w-0 grow bg-transparent text-[15px] leading-6 text-ink placeholder:text-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Send"
            className="btn-accent size-8 shrink-0 px-0 disabled:opacity-50"
          >
            <Icon name="arrowUp" size={16} />
          </button>
        </div>
      </div>
    </>
  )
}

const CHANGE_STYLE = {
  applied: { label: 'Applied', fill: 'var(--color-mint-wash)', ink: 'var(--color-mint-ink)' },
  pending: { label: 'Awaiting review', fill: 'var(--color-amber-wash)', ink: 'var(--color-amber)' },
  accepted: { label: 'Accepted', fill: 'var(--color-mint-wash)', ink: 'var(--color-mint-ink)' },
  rejected: { label: 'Rejected', fill: 'var(--color-fill)', ink: 'var(--color-muted)' },
  undone: { label: 'Undone', fill: 'var(--color-fill)', ink: 'var(--color-muted)' },
} as const

function Turn({ turn, artifactId }: { turn: ArtifactTurn; artifactId: string }) {
  const { undoChange } = useAppState()
  if (turn.role === 'user') {
    return (
      <div className="flex flex-col items-end gap-1">
        {turn.fromThreadId && (
          <span className="flex items-center gap-1.5 text-[11px] leading-4 text-faint">
            Asked from <ThreadChip threadId={turn.fromThreadId} />
          </span>
        )}
        <div className="max-w-[88%] rounded-[16px] rounded-br-[6px] bg-accent-wash px-3 py-2 text-[15px] leading-[23px] text-ink">
          {turn.content.map(renderSegment)}
        </div>
      </div>
    )
  }

  const change = turn.change ? CHANGE_STYLE[turn.change.state] : null

  return (
    <div className="flex flex-col gap-1.5">
      <p className="m-0 text-[15px] leading-[23px] text-ink">{turn.content.map(renderSegment)}</p>
      {turn.change && change && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge fill={change.fill} ink={change.ink}>
            {change.label}
          </Badge>
          <span className="min-w-0 grow text-[12.96px] leading-[20px] text-muted">
            {turn.change.summary}
          </span>
          {(turn.change.state === 'applied' || turn.change.state === 'accepted') &&
            turn.change.previous && (
              <button
                type="button"
                className="btn-sm shrink-0 text-muted"
                onClick={() => undoChange(artifactId, turn.id)}
              >
                <Icon name="undo" size={13} /> Undo
              </button>
            )}
        </div>
      )}
    </div>
  )
}

/**
 * The same log, read as a record rather than a conversation: only the turns that
 * changed the document, newest first, each with what it did, where it was asked
 * from, and the way back. Not a second data structure — a lens on the one that
 * already exists (D23).
 */
function HistoryTab({ artifactId }: { artifactId: string }) {
  const { artifacts, undoChange } = useAppState()
  const artifact = artifacts[artifactId]
  if (!artifact) return null

  const changes = [...artifact.log].reverse().filter((turn) => turn.change)

  if (changes.length === 0) {
    return (
      <PanelEmpty
        icon="history"
        title="No changes yet"
        body="Every edit that lands — yours or the agent's — is recorded here with its reason, and can be undone."
      />
    )
  }

  return (
    <div className="scroll-y">
      {changes.map((turn) => {
        const change = turn.change!
        const style = CHANGE_STYLE[change.state]
        return (
          <article
            key={turn.id}
            className="flex flex-col gap-1.5 border-b border-hairline px-3 py-2.5"
          >
            <div className="flex items-start gap-2">
              <span className="min-w-0 grow text-[14px] font-medium leading-[21px] text-ink">
                {change.summary}
              </span>
              <Badge fill={style.fill} ink={style.ink}>
                {style.label}
              </Badge>
            </div>

            {turn.fromThreadId && (
              <span className="flex items-center gap-1.5 text-[12px] leading-[18px] text-faint">
                Asked from <ThreadChip threadId={turn.fromThreadId} />
              </span>
            )}

            {(change.state === 'applied' || change.state === 'accepted') && change.previous && (
              <div>
                <button
                  type="button"
                  className="btn-sm text-muted"
                  onClick={() => undoChange(artifactId, turn.id)}
                >
                  <Icon name="undo" size={13} /> Undo
                </button>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

/** Saved items, one click from a citation in the block you were last in. */
function ItemsTab({ artifactId }: { artifactId: string }) {
  const { artifacts, collections, papers, citeInBlock, focusedBlockId, openInPanel } = useAppState()
  const artifact = artifacts[artifactId]
  const collection = artifact ? collections[artifact.collectionId] : null
  if (!artifact || !collection) return null

  const target = focusedBlockId ?? artifact.blocks.findLast((b) => b.kind === 'paragraph')?.id

  return (
    <div className="scroll-y">
      <p className="px-3 pb-1 pt-3 text-[12.96px] leading-[20px] text-muted">
        Saved items in {collection.name}. Cite drops the reference into the block you were last
        editing.
      </p>
      {collection.paperIds.map((id) => {
        const paper = papers[id]
        if (!paper) return null
        return (
          <article key={id} className="flex flex-col gap-1.5 border-b border-hairline px-3 py-2.5">
            <button
              type="button"
              onClick={() => openInPanel({ kind: 'paper', id })}
              className="text-left text-[14px] font-medium leading-[21px] text-ink hover:underline"
            >
              {paper.title}
            </button>
            <p className="m-0 text-[12px] leading-[18px] text-muted">
              {paper.year} · {paper.authors[0]} et al. · <span className="italic">{paper.journal}</span>
            </p>
            <div>
              <button
                type="button"
                className="btn-sm"
                disabled={!target}
                onClick={() => target && citeInBlock(artifactId, target, id)}
              >
                <Icon name="quote" size={14} /> Cite
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
