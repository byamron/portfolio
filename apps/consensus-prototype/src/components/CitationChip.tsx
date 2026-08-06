import { useAppState } from '../state/AppState'

export function CitationChip({ paperId }: { paperId: string }) {
  const { papers, openPaperDetail } = useAppState()
  const paper = papers[paperId]
  if (!paper) return null
  const author = paper.authors[0]?.split(' ').pop()?.toUpperCase() ?? 'UNKNOWN'

  return (
    <button
      type="button"
      onClick={() => openPaperDetail(paperId)}
      className="mr-1 inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-chip bg-surface-chip px-1.5 align-middle font-mono text-[11px] font-semibold uppercase leading-[16.5px] text-text-primary hover:bg-accent/80"
      title={paper.title}
    >
      {author} <span className="text-text-secondary">{paper.year}</span>
    </button>
  )
}
