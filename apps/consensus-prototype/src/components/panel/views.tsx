import { useAppState } from '../../state/AppState'
import { observationStyles, plural, suggestions, surfacedFor } from '../../data/mock'
import { Badge, ThreadChip } from '../chips'
import { Icon, type IconName } from '../icons'
import { ProvenancePopover } from '../ProvenancePopover'

/**
 * §2 — improved source surfacing. Papers that came up across the collection's
 * threads but were never saved, ranked by recurrence. Each is a nomination, not
 * a decision: save promotes it into the bibliography, dismiss retires it for
 * good. Provenance is checkable facts only — which threads it appeared in.
 */
export function SurfacedView() {
  const {
    collections,
    threads,
    selectedCollectionId,
    savePaperToCollection,
    dismissSurfacedPaper,
    isSurfacedDismissed,
    openInPanel,
  } = useAppState()

  const collection = collections[selectedCollectionId]
  const rows = surfacedFor(collection, threads).filter(
    (row) => !isSurfacedDismissed(collection.id, row.paper.id),
  )

  if (rows.length === 0) {
    return (
      <PanelEmpty
        icon="sparkle"
        title="Nothing surfaced"
        body={
          collection.threadIds.length === 0
            ? "Papers appear here once this collection has threads. Ask a question below, or save an existing thread into this collection."
            : "Every paper these threads turned up is either saved or dismissed. New ones appear as you ask more."
        }
      />
    )
  }

  return (
    <>
      <p className="px-4 pb-1 pt-3 text-[12.96px] leading-[20px] text-muted">
        Papers that came up across your threads and were never saved, ranked by how often they
        recur.
      </p>
      {rows.map(({ paper, threadIds }) => (
        <article key={paper.id} className="flex flex-col gap-2 border-b border-hairline px-4 py-3">
          <button
            type="button"
            onClick={() => openInPanel({ kind: 'paper', id: paper.id })}
            className="text-left text-[16px] font-medium leading-[24px] text-ink hover:underline"
          >
            {paper.title}
          </button>

          <p className="text-[15px] leading-[23px] text-ink">{paper.keyTakeaway}</p>

          {/* The recurrence badge is the way in to how it got here. */}
          <div>
            <ProvenancePopover paperId={paper.id} threadIds={threadIds}>
              <Badge
                fill="var(--color-amber-wash)"
                ink="var(--color-amber)"
                icon={<Icon name="sparkle" size={12} className="text-amber" />}
              >
                In {plural(threadIds.length, 'thread')}
              </Badge>
            </ProvenancePopover>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {threadIds.map((id) => (
              <ThreadChip key={id} threadId={id} />
            ))}
          </div>

          <p className="text-[12.96px] leading-[20px] text-muted">
            {paper.year} · {plural(paper.citationCount, 'citation')} · {paper.authors[0]} et al. ·{' '}
            <span className="italic">{paper.journal}</span>
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              className="btn-sm"
              onClick={() => savePaperToCollection(collection.id, paper.id)}
            >
              <Icon name="bookmark" size={14} /> Save
            </button>
            <button
              type="button"
              className="btn-sm text-muted"
              onClick={() => dismissSurfacedPaper(collection.id, paper.id)}
            >
              <Icon name="close" size={14} /> Dismiss
            </button>
          </div>
        </article>
      ))}
    </>
  )
}

/** One empty state for the panel, so all three views fail the same way. */
export function PanelEmpty({
  icon,
  title,
  body,
}: {
  icon: IconName
  title: string
  body: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <Icon name={icon} size={20} className="text-faint" />
      <p className="m-0 text-[15.04px] font-medium leading-[23px] text-ink">{title}</p>
      <p className="m-0 max-w-[42ch] text-[12.96px] leading-[20px] text-muted">{body}</p>
    </div>
  )
}

/**
 * §3 — proactive comparison. Observations lead with their type, name the
 * threads behind them, and turn straight into a seeded thread.
 */
export function SuggestedView() {
  const { collections, selectedCollectionId, startSuggestedThread } = useAppState()
  const rows = suggestions.filter((s) => s.collectionId === selectedCollectionId)
  const collection = collections[selectedCollectionId]

  if (rows.length === 0) {
    return (
      <PanelEmpty
        icon="chat"
        title="Nothing to compare yet"
        body={
          collection.threadIds.length < 2
            ? 'Observations come from reading across threads, so this needs at least two. Ask another question and tensions, gaps and themes appear here.'
            : 'No tensions or gaps stand out across these threads right now. Ask something new and this recalculates.'
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {rows.map((suggestion) => {
        const style = observationStyles[suggestion.kind]
        return (
          <article
            key={suggestion.id}
            className="flex flex-col gap-2 rounded-[12px] border border-b-2 border-line bg-panel p-3"
          >
            <div className="flex items-center gap-2">
              <Badge fill={style.fill} ink={style.ink}>
                {suggestion.kind}
              </Badge>
              <span className="label text-faint">{suggestion.evidence}</span>
            </div>

            <p className="text-[12.96px] leading-[20px] text-muted">{suggestion.observation}</p>

            <div className="flex flex-wrap gap-1.5">
              {suggestion.basedOnThreadIds.map((id) => (
                <ThreadChip key={id} threadId={id} />
              ))}
            </div>

            <div className="mt-1 flex flex-col gap-2 border-t border-hairline pt-2">
              <p className="text-[15px] font-medium leading-[23px] text-ink">
                {suggestion.question}
              </p>
              <button
                type="button"
                className="btn-sm self-start"
                onClick={() => startSuggestedThread(suggestion)}
              >
                Start thread <Icon name="chevronRight" size={14} />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
