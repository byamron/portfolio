import { useAppState } from '../state/AppState'
import { ObjectDetail } from './panel/details'
import { Icon } from './icons'

/**
 * Clicking a citation inside a thread opens the paper without leaving the
 * answer — the product's own behaviour, kept as an overlay here because the
 * thread's right-hand surface is already the References drawer.
 */
export function PaperDetailModal() {
  const { detailPaperId, closePaperDetail } = useAppState()
  if (!detailPaperId) return null

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-ink/20"
      role="dialog"
      aria-modal="true"
      onClick={closePaperDetail}
    >
      <div
        className="flex h-full w-[440px] flex-col overflow-hidden border-l border-line bg-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex min-h-12 shrink-0 items-center justify-end border-b border-line px-2">
          <button type="button" className="icon-btn" onClick={closePaperDetail} aria-label="Close">
            <Icon name="close" size={15} />
          </button>
        </header>
        <div className="scroll-y">
          <ObjectDetail object={{ kind: 'paper', id: detailPaperId }} />
        </div>
      </div>
    </div>
  )
}
