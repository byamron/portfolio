import type { Paper } from '../data/mockData'
import { useAppState } from '../state/AppState'
import { Checkbox } from './Checkbox'
import { ProvenancePopover } from './ProvenancePopover'
import { BookmarkIcon, CloseIcon } from './icons'

export function SurfacedSourceRow({
  paper,
  threadIds,
  collectionId,
}: {
  paper: Paper
  threadIds: string[]
  collectionId: string
}) {
  const { openPaperDetail, toggleCollectionForPaper, dismissSurfacedPaper } = useAppState()

  return (
    <tr className="h-[43px] border-b border-border/40 bg-surface-panel/30 hover:bg-surface-panel/60">
      <td className="px-3">
        <Checkbox checked={false} onChange={() => {}} ariaLabel="Select row" />
      </td>
      <td className="px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openPaperDetail(paper.id)}
            className="truncate text-left text-text-primary hover:underline"
          >
            {paper.title}
          </button>
          <ProvenancePopover threadIds={threadIds} />
        </div>
      </td>
      <td className="truncate px-3 text-text-secondary">{paper.authors.join(', ')}</td>
      <td className="truncate px-3 italic text-text-secondary">{paper.journal}</td>
      <td className="px-3 text-text-secondary">{paper.year}</td>
      <td className="px-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleCollectionForPaper(collectionId, paper.id)}
            className="rounded-control p-1.5 text-accent hover:bg-surface-chip-secondary"
            aria-label="Save to library"
            title="Save to library"
          >
            <BookmarkIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => dismissSurfacedPaper(collectionId, paper.id)}
            className="rounded-control p-1.5 text-text-secondary hover:bg-surface-chip-secondary hover:text-text-primary"
            aria-label="Dismiss"
            title="Not relevant — dismiss"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}
