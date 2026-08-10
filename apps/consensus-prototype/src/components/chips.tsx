import type { ReactNode } from 'react'
import { useAppState } from '../state/AppState'
import { Icon } from './icons'

/**
 * A thread citation. Deliberately unlike a paper citation (D17) — threads are
 * lines of inquiry, papers are sources, and conflating them muddies provenance.
 */
export function ThreadChip({
  threadId,
  onClick,
}: {
  threadId: string
  onClick?: () => void
}) {
  const { threads, openThread } = useAppState()
  const thread = threads[threadId]
  if (!thread) return null

  return (
    <button
      type="button"
      onClick={onClick ?? (() => openThread(threadId))}
      title={thread.title}
      data-thread={threadId}
      contentEditable={false}
      className="inline-flex h-5 max-w-full shrink-0 items-center gap-1 rounded-[8px]
        bg-accent-wash px-1.5 align-middle text-[12.96px] leading-[20px]
        text-accent-deep hover:brightness-95"
    >
      <Icon name="chat" size={12} />
      <span className="truncate">{thread.title}</span>
    </button>
  )
}

/** An artifact reference — a document you wrote, distinct from both of the above. */
export function ArtifactChip({ artifactId }: { artifactId: string }) {
  const { artifacts, openArtifact } = useAppState()
  const artifact = artifacts[artifactId]
  if (!artifact) return null

  return (
    <button
      type="button"
      onClick={() => openArtifact(artifactId)}
      title={artifact.title}
      data-artifact={artifactId}
      contentEditable={false}
      className="inline-flex h-5 max-w-full shrink-0 items-center gap-1 rounded-[8px]
        bg-mint-wash px-1.5 align-middle text-[12.96px] leading-[20px]
        text-mint-ink hover:brightness-95"
    >
      <Icon name="fileText" size={12} />
      <span className="truncate">{artifact.title}</span>
    </button>
  )
}

/** A paper citation — AUTHOR YEAR in mono, the product's own chip. */
export function CitationChip({ paperId }: { paperId: string }) {
  const { papers, openPaperDetail } = useAppState()
  const paper = papers[paperId]
  if (!paper) return null
  const author = paper.authors[0]?.split(' ').pop()?.toUpperCase() ?? 'UNKNOWN'

  return (
    <button
      type="button"
      onClick={() => openPaperDetail(paperId)}
      title={paper.title}
      data-cite={paperId}
      contentEditable={false}
      className="label mx-0.5 inline-flex h-5 items-center gap-1 rounded-[8px] bg-fill px-1.5
        align-middle text-ink hover:bg-line"
    >
      {author} <span className="text-muted">{paper.year}</span>
    </button>
  )
}

export function Badge({
  children,
  fill = 'var(--color-line)',
  ink = 'var(--color-ink)',
  icon,
}: {
  children: ReactNode
  fill?: string
  ink?: string
  icon?: ReactNode
}) {
  return (
    <span
      className="inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-[8px] px-1.5"
      style={{ background: fill }}
    >
      {icon}
      <span className="label" style={{ color: ink }}>
        {children}
      </span>
    </span>
  )
}

/** Scope attached to the composer — items and collections, never inline. */
export function ScopeChip({
  icon,
  label,
  onRemove,
}: {
  icon: ReactNode
  label: string
  onRemove?: () => void
}) {
  return (
    <span className="relative inline-flex max-w-[280px] items-center gap-2 rounded-[10px] bg-fill py-1.5 pl-2 pr-2.5">
      <span className="text-muted">{icon}</span>
      <span className="truncate text-[13px] leading-[20px] text-ink">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-inverse text-on-inverse"
        >
          <Icon name="close" size={10} strokeWidth={3} />
        </button>
      )}
    </span>
  )
}
