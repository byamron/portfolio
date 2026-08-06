import { useAppState } from '../state/AppState'
import { ReferenceCard } from './ReferenceCard'
import { CloseIcon, ListViewIcon, CardViewIcon, TableViewIcon, BookmarkIcon, DownloadIcon } from './icons'

export function ReferencesDrawer({ paperIds }: { paperIds: string[] }) {
  const { papers, toggleReferences, isGenerating } = useAppState()

  return (
    <aside className="flex h-full w-[640px] shrink-0 flex-col border-l border-border/60 bg-surface-app">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
        <div className="text-[15.04px] font-medium leading-[22.56px] text-text-primary">References</div>
        <button
          type="button"
          onClick={toggleReferences}
          className="rounded-control p-1 text-text-secondary hover:bg-surface-panel hover:text-text-primary"
          aria-label="Close references"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-[13px] text-text-secondary">
        <span>
          Results <span className="text-text-primary">{paperIds.length}</span>
        </span>
        <div className="flex items-center gap-1">
          <button type="button" className="rounded-control p-1.5 hover:bg-surface-panel hover:text-text-primary" aria-label="Bookmark all">
            <BookmarkIcon size={16} />
          </button>
          <button type="button" className="rounded-control p-1.5 hover:bg-surface-panel hover:text-text-primary" aria-label="Download all">
            <DownloadIcon size={16} />
          </button>
          <div className="ml-1 flex items-center gap-0.5 rounded-control bg-surface-panel p-0.5">
            <button type="button" className="rounded-[6px] bg-surface-chip-secondary p-1.5 text-text-primary" aria-label="List view">
              <ListViewIcon size={14} />
            </button>
            <button type="button" className="rounded-[6px] p-1.5 text-text-secondary hover:text-text-primary" aria-label="Card view">
              <CardViewIcon size={14} />
            </button>
            <button type="button" className="rounded-[6px] p-1.5 text-text-secondary hover:text-text-primary" aria-label="Table view">
              <TableViewIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isGenerating && paperIds.length === 0 && (
          <p className="mt-8 text-center text-[13px] text-text-secondary">
            Once papers start to be cited, they will appear here.
          </p>
        )}
        <div className="flex flex-col">
          {paperIds.map((id, i) => {
            const paper = papers[id]
            if (!paper) return null
            return <ReferenceCard key={id} paper={paper} rank={i + 1} />
          })}
        </div>
      </div>
    </aside>
  )
}
