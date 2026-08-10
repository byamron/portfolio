import { useAppState } from '../state/AppState'
import { ObjectDetail } from './panel/details'
import { Icon } from './icons'
import { useIsMobile } from '../hooks/useIsMobile'

/**
 * Clicking a citation opens the paper beside the answer, not over it.
 *
 * A scrim would say "deal with this before you carry on", which is the opposite
 * of what checking a citation is: you are still reading the sentence it came
 * from, and you want to see both. So it takes width from the column like every
 * other side panel here rather than covering it.
 */
export function PaperDetailPanel() {
  const { detailPaperId, closePaperDetail } = useAppState()
  const isMobile = useIsMobile()

  return (
    <aside
      inert={!detailPaperId}
      aria-hidden={!detailPaperId}
      aria-label="Paper"
      className={
        isMobile
          ? `fixed inset-0 z-50 flex flex-col bg-panel transition-transform duration-300
             ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
               detailPaperId ? 'translate-x-0' : 'translate-x-full'
             }`
          : `h-full shrink-0 overflow-hidden bg-panel transition-[width,max-width] duration-300
             ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
               detailPaperId ? 'w-[440px] max-w-[46vw] border-l border-line' : 'w-0 max-w-0'
             }`
      }
    >
      <div className="flex h-full w-full flex-col md:w-[440px] md:max-w-[46vw]">
        <header className="flex min-h-16 shrink-0 items-center justify-end border-b border-line px-2">
          <button type="button" className="icon-btn" onClick={closePaperDetail} aria-label="Close">
            <Icon name="close" size={15} />
          </button>
        </header>
        <div className="scroll-y">
          {detailPaperId && <ObjectDetail object={{ kind: 'paper', id: detailPaperId }} />}
        </div>
      </div>
    </aside>
  )
}
