import { plural, type Paper } from '../data/mock'
import { useAppState } from '../state/AppState'
import { Badge } from './chips'
import { Icon } from './icons'
import { useIsMobile } from '../hooks/useIsMobile'

/** The thread's References drawer — the product's existing right-hand surface. */
export function ReferencesDrawer({
  open,
  papers,
  onClose,
}: {
  open: boolean
  papers: Paper[]
  onClose: () => void
}) {
  const { openPaperDetail } = useAppState()
  const isMobile = useIsMobile()

  return (
    <aside
      inert={!open}
      aria-hidden={!open}
      className={
        isMobile
          ? `fixed inset-0 z-50 flex flex-col bg-panel transition-transform duration-300
             ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
               open ? 'translate-x-0' : 'translate-x-full'
             }`
          : `h-full shrink-0 overflow-hidden bg-panel transition-[width,max-width] duration-300
             ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
               open ? 'w-[420px] max-w-[46vw] border-l border-line' : 'w-0 max-w-0'
             }`
      }
    >
      <div className="flex h-full w-full flex-col md:w-[420px] md:max-w-[46vw]">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-line px-4 pr-2">
        <span className="panel-heading">References</span>
        <div className="flex items-center gap-1">
          <span className="label text-faint">{papers.length}</span>
          <button type="button" onClick={onClose} className="icon-btn" aria-label="Close references">
            <Icon name="close" size={15} />
          </button>
        </div>
      </header>

      <div className="scroll-y">
        {papers.map((paper, index) => (
          <article key={paper.id} className="border-b border-hairline px-4 py-3">
            <div className="flex gap-3">
              <span className="label mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-fill text-muted">
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => openPaperDetail(paper.id)}
                className="text-left text-[16px] font-medium leading-[24px] text-ink hover:underline"
              >
                {paper.title}
              </button>
            </div>
            <p className="mt-2 text-[15px] leading-[23px] text-ink">
              <span className="label text-muted">Key takeaway · </span>
              {paper.keyTakeaway}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {paper.tags.map((tag) => (
                <Badge key={tag} fill="var(--color-fill)" ink="var(--color-muted)">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-[12.96px] leading-[20px] text-muted">
              {paper.year} · {plural(paper.citationCount, 'citation')} · {paper.authors[0]} et al. ·{' '}
              <span className="italic">{paper.journal}</span>
            </p>
          </article>
        ))}
      </div>
      </div>
    </aside>
  )
}
