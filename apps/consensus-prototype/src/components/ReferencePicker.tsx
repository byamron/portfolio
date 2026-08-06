import { useAppState } from '../state/AppState'
import type { MessageSegment, Paper, Thread } from '../data/mockData'
import { DocumentIcon, ChatIcon, ChevronRightIcon } from './icons'

export function ReferencePicker({
  query,
  onSelect,
}: {
  query: string
  onSelect: (segment: MessageSegment) => void
}) {
  const { papers, threads } = useAppState()
  const q = query.toLowerCase()

  const matchedPapers = Object.values(papers)
    .filter((p) => p.title.toLowerCase().includes(q))
    .slice(0, 4)
  const matchedThreads = Object.values(threads)
    .filter((t) => t.title.toLowerCase().includes(q))
    .slice(0, 4)

  if (matchedPapers.length === 0 && matchedThreads.length === 0) {
    return (
      <div className="absolute bottom-full left-0 mb-2 w-[380px] rounded-popover border border-border/60 bg-surface-panel p-3 shadow-popover">
        <p className="text-[13px] text-text-secondary">No items or threads match "{query}"</p>
      </div>
    )
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 max-h-80 w-[380px] overflow-y-auto rounded-popover border border-border/60 bg-surface-panel p-2 shadow-popover">
      {matchedPapers.length > 0 && (
        <>
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">Items</div>
          {matchedPapers.map((p: Paper) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect({ citePaperId: p.id })}
              className="flex w-full items-center justify-between gap-2 rounded-control px-2 py-2 text-left hover:bg-surface-chip-secondary"
            >
              <span className="flex min-w-0 items-center gap-2">
                <DocumentIcon size={16} className="shrink-0 text-text-secondary" />
                <span className="truncate text-[14px] text-text-primary">{p.title}</span>
              </span>
              <ChevronRightIcon size={14} className="shrink-0 text-text-secondary" />
            </button>
          ))}
        </>
      )}
      {matchedThreads.length > 0 && (
        <>
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            Threads
          </div>
          {matchedThreads.map((t: Thread) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect({ threadRefId: t.id })}
              className="flex w-full items-center justify-between gap-2 rounded-control px-2 py-2 text-left hover:bg-surface-chip-secondary"
            >
              <span className="flex min-w-0 items-center gap-2">
                <ChatIcon size={16} className="shrink-0 text-text-secondary" />
                <span className="truncate text-[14px] text-text-primary">{t.title}</span>
              </span>
              <ChevronRightIcon size={14} className="shrink-0 text-text-secondary" />
            </button>
          ))}
        </>
      )}
    </div>
  )
}
