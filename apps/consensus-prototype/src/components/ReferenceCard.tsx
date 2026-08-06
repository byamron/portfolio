import { useState } from 'react'
import type { Paper } from '../data/mockData'
import { useAppState } from '../state/AppState'
import { Checkbox } from './Checkbox'
import { BookmarkIcon, GraphIcon, QuoteIcon, LinkIcon, BookIcon, DocumentIcon, ExternalLinkIcon } from './icons'

const TAG_ICON: Record<string, React.ReactNode> = {
  'Very Rigorous Journal': <GraphIcon size={12} />,
  'Literature Review': <DocumentIcon size={12} />,
  'Meta-Analysis': <DocumentIcon size={12} />,
  'Prospective Cohort Study': <DocumentIcon size={12} />,
}

export function ReferenceCard({ paper, rank }: { paper: Paper; rank: number }) {
  const { openPaperDetail, openSavePopover } = useAppState()
  // Bulk-select checkbox — decorative in this prototype (no bulk toolbar built),
  // distinct from the actual save-to-collection flow (hover row below).
  const [selected, setSelected] = useState(false)

  return (
    <div className="group border-b border-b-border pb-3.5 pt-6 first:pt-0">
      <div className="flex items-start gap-3">
        <div className="flex grow items-center gap-3">
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-lg bg-surface-chip px-1.5 font-mono text-[11px] font-bold leading-[16.5px] text-text-primary">
            {rank}
          </span>
          <button
            type="button"
            onClick={() => openPaperDetail(paper.id)}
            className="line-clamp-2 text-left text-base font-medium leading-[150%] text-text-primary hover:underline"
          >
            {paper.title}
          </button>
        </div>
        <Checkbox checked={selected} onChange={() => setSelected((v) => !v)} ariaLabel="Select paper" />
      </div>

      <p className="mt-3 line-clamp-4 text-[15px] leading-[150%] text-text-primary">
        <span className="font-mono text-[11px] font-semibold">KEY TAKEAWAY·</span>
        {paper.keyTakeaway}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex h-5 items-center gap-1 rounded-chip bg-surface-chip px-1.5 font-mono text-[11px] font-semibold uppercase leading-[16.5px] text-text-primary">
          <BookmarkIcon size={12} filled /> {paper.supportingQuotes} SUPPORTING QUOTES
        </span>
        {paper.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-5 items-center gap-1 rounded-chip bg-surface-chip-secondary px-1.5 font-mono text-[11px] font-semibold uppercase leading-[16.5px] text-text-secondary"
          >
            {TAG_ICON[tag] ?? <DocumentIcon size={12} />} {tag}
          </span>
        ))}
        {paper.hasPdf && (
          <span className="inline-flex h-5 items-center gap-1 rounded-chip bg-surface-chip-secondary px-1.5 font-mono text-[11px] font-semibold uppercase leading-[16.5px] text-text-secondary">
            <DocumentIcon size={12} /> PDF
          </span>
        )}
      </div>

      <div className="mt-4 mb-1 min-h-9">
        <div className="text-[13px] leading-[150%] text-text-secondary">
          <span className="font-mono font-bold text-text-primary">{paper.year}</span> ·{' '}
          <span className="font-mono font-bold text-text-primary">{paper.citationCount}</span> citations ·{' '}
          {paper.authors[0]} et al.
        </div>
        <div className="mt-1 flex items-center gap-1 text-[13px] italic leading-[150%] text-text-secondary">
          <BookIcon size={14} /> {paper.journal}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => openSavePopover(paper.id)}
          className="rounded-control p-1.5 text-text-secondary hover:bg-surface-chip-secondary hover:text-text-primary"
          aria-label="Save to collection"
          title="Save to collection"
        >
          <BookmarkIcon size={16} />
        </button>
        <button type="button" className="rounded-control p-1.5 text-text-secondary hover:bg-surface-chip-secondary hover:text-text-primary" aria-label="Share">
          <GraphIcon size={16} />
        </button>
        <button type="button" className="rounded-control p-1.5 text-text-secondary hover:bg-surface-chip-secondary hover:text-text-primary" aria-label="Quotes">
          <QuoteIcon size={16} />
        </button>
        <button type="button" className="rounded-control p-1.5 text-text-secondary hover:bg-surface-chip-secondary hover:text-text-primary" aria-label="Link">
          <LinkIcon size={16} />
        </button>
        {paper.hasPdf && (
          <button
            type="button"
            className="elevated flex h-9 items-center gap-1.5 rounded-control bg-surface-panel px-3 text-[15.04px] font-medium leading-[22.56px] text-text-primary"
          >
            PDF <ExternalLinkIcon size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
