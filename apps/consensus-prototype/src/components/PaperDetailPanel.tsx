import { useState } from 'react'
import { useAppState } from '../state/AppState'
import { BackArrowIcon, CloseIcon, ChatIcon, BookmarkIcon, ChevronDownIcon, ExternalLinkIcon, DocumentIcon } from './icons'

const TABS = ['Overview', 'Snapshot', 'Evidence', 'Metadata', 'Attachment'] as const
type Tab = (typeof TABS)[number]

export function PaperDetailPanel() {
  const { detailPaperId, closePaperDetail, papers, openSavePopover } = useAppState()
  const [tab, setTab] = useState<Tab>('Overview')
  if (!detailPaperId) return null
  const paper = papers[detailPaperId]
  if (!paper) return null

  const tabs = TABS.filter((t) => t !== 'Attachment' || paper.hasPdf)
  const quotes = paper.abstract
    .split(/(?<=[.:])\s+/)
    .filter((s) => s.length > 20)
    .slice(0, 2)

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={closePaperDetail}>
      <div className="flex h-full w-[640px] flex-col bg-surface-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
          <button
            type="button"
            onClick={closePaperDetail}
            className="flex items-center gap-1.5 text-[15.04px] font-medium leading-[22.56px] text-text-secondary hover:text-text-primary"
          >
            <BackArrowIcon size={16} /> Paper
          </button>
          <button
            type="button"
            onClick={closePaperDetail}
            className="rounded-control p-1 text-text-secondary hover:bg-surface-chip-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex gap-6 border-b border-border/60 px-4">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-b-[3px] py-2.5 text-[15.04px] font-medium leading-[22.56px] ${
                tab === t ? 'border-text-primary text-text-primary' : 'border-transparent text-text-secondary'
              }`}
            >
              {t === 'Evidence' ? `Evidence (${paper.supportingQuotes})` : t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h2 className="text-lg font-medium leading-[130%] text-text-primary">{paper.title}</h2>
          <p className="mt-2 text-[13px] text-text-secondary">
            {paper.year} · {paper.authors.join(', ')}
          </p>
          <p className="mt-1 text-[13px] italic text-text-secondary">{paper.journal}</p>

          <div className="mt-3 flex items-center gap-4 text-[13px] text-text-secondary">
            <span>
              <span className="font-mono font-bold text-text-primary">{paper.citationCount}</span> Citations
            </span>
            <a className="flex items-center gap-1 text-accent hover:underline" href={`https://doi.org/${paper.doi}`}>
              DOI {paper.doi} <ExternalLinkIcon size={12} />
            </a>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {paper.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex h-5 items-center rounded-chip bg-surface-chip-secondary px-1.5 font-mono text-[11px] font-semibold uppercase leading-[16.5px] text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>

          {tab === 'Overview' && <p className="mt-4 text-[15px] leading-[150%] text-text-primary">{paper.abstract}</p>}

          {tab === 'Snapshot' && (
            <p className="mt-4 text-[15px] leading-[150%] text-text-primary">
              <span className="font-mono text-[11px] font-semibold">KEY TAKEAWAY·</span>
              {paper.keyTakeaway}
            </p>
          )}

          {tab === 'Evidence' && (
            <div className="mt-4 flex flex-col gap-3">
              {quotes.map((q, i) => (
                <div key={i} className="rounded-control border border-border/40 p-3">
                  <div className="mb-1 font-mono text-[11px] font-semibold text-text-secondary">QUOTE {i + 1}</div>
                  <p className="text-[15px] italic leading-[150%] text-text-primary">"{q.trim()}"</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'Metadata' && (
            <table className="mt-4 w-full text-left text-[13px]">
              <tbody>
                {[
                  ['Name', paper.title],
                  ['Year', String(paper.year)],
                  ['Authors', paper.authors.join(', ')],
                  ['Journal', paper.journal],
                  ['DOI', paper.doi],
                ].map(([field, value]) => (
                  <tr key={field} className="border-b border-border/40">
                    <td className="w-28 py-2 align-top font-medium text-text-secondary">{field}</td>
                    <td className="py-2 text-text-primary">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'Attachment' && (
            <div className="mt-4 flex flex-col items-center justify-center rounded-control border border-border/40 bg-surface-app py-16 text-text-secondary">
              <DocumentIcon size={32} />
              <p className="mt-2 text-[13px]">PDF preview — page 1 of 1</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 px-4 py-3">
          <button
            type="button"
            className="elevated flex h-9 items-center gap-1.5 rounded-control bg-surface-app px-3 text-[15.04px] font-medium leading-[22.56px] text-text-primary"
          >
            <ChatIcon size={16} /> Ask
          </button>
          <button
            type="button"
            onClick={() => openSavePopover(paper.id)}
            className="elevated flex h-9 items-center gap-1.5 rounded-control bg-surface-app px-3 text-[15.04px] font-medium leading-[22.56px] text-text-primary"
          >
            <BookmarkIcon size={16} /> Save <ChevronDownIcon size={14} />
          </button>
          {paper.hasPdf && (
            <button
              type="button"
              className="elevated-accent ml-auto flex h-9 items-center gap-1.5 rounded-control bg-accent px-3 text-[15.04px] font-medium leading-[22.56px] text-white"
            >
              Full text <ExternalLinkIcon size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
