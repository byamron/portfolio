import { useState } from 'react'
import { useAppState } from '../state/AppState'
import {
  paperIdsOf,
  plural,
  type Message,
  type MessageSegment,
  type StepRow,
} from '../data/mock'
import { ArtifactChip, Badge, CitationChip, ScopeChip, ThreadChip } from './chips'
import { RailToggle } from './RailToggle'
import { Icon } from './icons'
import { Composer } from './Composer'
import { ReferencesDrawer } from './ReferencesDrawer'
import { PaperDetailPanel } from './PaperDetailPanel'
import { useStub } from './StubHint'

export function renderSegment(segment: MessageSegment, key: number) {
  if (typeof segment === 'string') return <span key={key}>{segment}</span>
  if ('citePaperId' in segment) return <CitationChip key={key} paperId={segment.citePaperId} />
  if ('artifactRefId' in segment) return <ArtifactChip key={key} artifactId={segment.artifactRefId} />
  return <ThreadChip key={key} threadId={segment.threadRefId} />
}

/**
 * §1 — the answer shows its work. A thread the agent read gets its own row in
 * the trace, rendered as a thread citation rather than a search string, so
 * cross-thread context is visible as a tool call and not just asserted.
 */
function StepTracer({ steps }: { steps: StepRow[] }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
      >
        <Icon name="search" size={14} />
        Pro · {plural(steps.length, 'step')}
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} />
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-1.5 pl-1">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-[13px] text-muted">
                <Icon name="search" size={14} className="text-faint" />
                {step.type === 'read-thread' ? (
                  <>
                    <span className="shrink-0">Reading</span>
                    <ThreadChip threadId={step.threadRefId} />
                  </>
                ) : (
                  <span className="truncate">{step.label}</span>
                )}
              </span>
              <span className="label shrink-0 text-faint">{step.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[20px] rounded-br-[6px] bg-accent-wash px-4 py-2.5 text-[16px] leading-[24px] text-ink">
          {message.content.map(renderSegment)}
        </div>
      </div>
    )
  }

  return (
    <div className="text-[16px] leading-[24px] text-ink">
      {message.steps && <StepTracer steps={message.steps} />}
      {message.content.map(renderSegment)}
    </div>
  )
}

const OUTCOME = {
  applied: { label: 'Applied', fill: 'var(--color-mint-wash)', ink: 'var(--color-mint-ink)' },
  pending: { label: 'Awaiting your review', fill: 'var(--color-amber-wash)', ink: 'var(--color-amber)' },
  accepted: { label: 'Accepted', fill: 'var(--color-mint-wash)', ink: 'var(--color-mint-ink)' },
  rejected: { label: 'Rejected', fill: 'var(--color-fill)', ink: 'var(--color-muted)' },
  undone: { label: 'Undone', fill: 'var(--color-fill)', ink: 'var(--color-muted)' },
} as const

/**
 * D24's return leg. Ask for a change from a thread and you find out here
 * whether it landed — otherwise the indirection costs you the outcome and you
 * go and do it by hand instead.
 */
function ArtifactChangeCard({ threadId, artifactId }: { threadId: string; artifactId: string }) {
  const { artifacts, openArtifact } = useAppState()
  const artifact = artifacts[artifactId]
  const turn = [...(artifact?.log ?? [])]
    .reverse()
    .find((t) => t.fromThreadId === threadId && t.change)
  if (!artifact) return null

  const outcome = turn?.change ? OUTCOME[turn.change.state] : null

  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-b-2 border-line bg-panel p-3">
      <div className="flex items-center gap-2">
        <Icon name="fileText" size={15} className="text-muted" />
        <button
          type="button"
          onClick={() => openArtifact(artifactId)}
          className="min-w-0 truncate text-[15px] font-medium leading-[23px] text-ink hover:underline"
        >
          {artifact.title}
        </button>
      </div>
      {outcome && turn?.change ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge fill={outcome.fill} ink={outcome.ink}>
            {outcome.label}
          </Badge>
          <span className="text-[12.96px] leading-[20px] text-muted">{turn.change.summary}</span>
        </div>
      ) : (
        <span className="text-[12.96px] leading-[20px] text-muted">Working on the change…</span>
      )}
      <button
        type="button"
        className="btn-sm self-start"
        onClick={() => openArtifact(artifactId)}
      >
        Open artifact <Icon name="chevronRight" size={14} />
      </button>
    </div>
  )
}

/**
 * The return leg of "find support": what this thread established goes back into
 * the sentence that prompted it, so the loop closes instead of leaving the
 * finding stranded in a thread nobody rereads.
 */
function SupportCard({ threadId, artifactId }: { threadId: string; artifactId: string }) {
  const { artifacts, threads, citeSupport, openArtifact } = useAppState()
  const artifact = artifacts[artifactId]
  const thread = threads[threadId]
  if (!artifact || !thread) return null

  const block = artifact.blocks.find((b) => b.id === thread.originBlockId)
  const already = new Set(
    block?.content.flatMap((seg) =>
      typeof seg === 'object' && 'citePaperId' in seg ? [seg.citePaperId] : [],
    ) ?? [],
  )
  const fresh = thread.sources.map((s) => s.paperId).filter((id) => !already.has(id))

  return (
    <div className="flex flex-col gap-2 rounded-[12px] border border-b-2 border-line bg-panel p-3">
      <div className="flex items-center gap-2">
        <Icon name="fileText" size={15} className="text-muted" />
        <button
          type="button"
          onClick={() => openArtifact(artifactId)}
          className="min-w-0 truncate text-[15px] font-medium leading-[23px] text-ink hover:underline"
        >
          {artifact.title}
        </button>
      </div>
      <p className="m-0 text-[12.96px] leading-[20px] text-muted">
        Started from a claim in this artifact: “{thread.claim}”
      </p>
      {fresh.length > 0 ? (
        <button
          type="button"
          className="btn-sm self-start"
          onClick={() => citeSupport(threadId)}
        >
          <Icon name="quote" size={14} /> Cite {fresh.length} source
          {fresh.length === 1 ? '' : 's'} in the draft
        </button>
      ) : (
        <span className="text-[12.96px] leading-[20px] text-faint">
          Already cited in the draft.
        </span>
      )}
    </div>
  )
}

export function ThreadView() {
  const {
    threads,
    collections,
    papers,
    activeThreadId,
    isGenerating,
    referencesOpen,
    detailPaperId,
    toggleReferences,
    sendFollowUp,
    openCollection,
    artifactFromThread,
  } = useAppState()
  const stub = useStub()

  const thread = activeThreadId ? threads[activeThreadId] : null
  if (!thread) return null

  const origin = thread.originCollectionId ? collections[thread.originCollectionId] : null

  return (
    <div className="flex min-w-0 flex-1">
      <div className="@container relative flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
          <RailToggle />
          <h1 className="truncate text-[16px] font-medium leading-[24px] text-ink">{thread.title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="btn-sm"
              aria-label="Turn into artifact"
              title="Turn into artifact"
              onClick={() => artifactFromThread(thread.id)}
            >
              <Icon name="fileText" size={14} />
              <span className="hidden @[560px]:inline">Turn into artifact</span>
            </button>
            <button
              type="button"
              className="btn-sm"
              aria-label="Save"
              onClick={(e) => stub(e, 'Save this thread to a collection')}
            >
              <Icon name="bookmark" size={14} />
              <span className="hidden @[440px]:inline">Save</span>
            </button>
            <button
              type="button"
              className="btn-sm"
              aria-label="Share"
              onClick={(e) => stub(e, 'Share a link to this thread')}
            >
              <Icon name="share" size={14} />
              <span className="hidden @[440px]:inline">Share</span>
            </button>
            <button
              type="button"
              onClick={toggleReferences}
              aria-pressed={referencesOpen}
              className={`icon-btn size-9 ${referencesOpen ? 'bg-fill text-ink' : ''}`}
              title="References"
            >
              <Icon name="panel" size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="scroll-y px-4 pb-44 pt-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {/* Ambient context — a thread opened from a collection carries it. */}
            {origin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openCollection(origin.id)}
                  title={`Back to ${origin.name}`}
                >
                  <ScopeChip icon={<Icon name="folder" size={14} />} label={origin.name} />
                </button>
                <span className="label text-faint">Ambient context</span>
              </div>
            )}

            {thread.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {(thread.scopeArtifactIds ?? []).map((id) => (
              <ArtifactChangeCard key={id} threadId={thread.id} artifactId={id} />
            ))}

            {thread.originArtifactId && !isGenerating && (
              <SupportCard threadId={thread.id} artifactId={thread.originArtifactId} />
            )}

            {isGenerating && (
              <div className="flex items-center gap-2 text-[13px] text-muted">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                Reading sources…
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-surface via-surface to-transparent pt-8">
          <div className="pointer-events-auto mx-auto max-w-3xl px-4 pb-4">
            <Composer
              placeholder="Ask a follow-up…"
              onSubmit={({ segments }) => sendFollowUp(segments)}
            />
          </div>
        </div>
      </div>

      {/* One side surface at a time: a paper takes the references slot rather
          than stacking beside it and squeezing the answer. The drawer comes
          back when the paper closes. */}
      <PaperDetailPanel />

      <ReferencesDrawer
        open={referencesOpen && !detailPaperId}
        papers={paperIdsOf(thread).map((id) => papers[id]).filter(Boolean)}
        onClose={toggleReferences}
      />
    </div>
  )
}
