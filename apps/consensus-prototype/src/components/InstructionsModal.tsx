import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../state/AppState'
import { Icon } from './icons'

/**
 * Editing instructions gets its own surface rather than a textarea squeezed
 * into the two-line preview. Standing instructions steer every thread in the
 * collection, so writing them deserves room to see the whole thing at once —
 * and the page behind it must not reflow while you type.
 */
export function InstructionsModal({
  collectionId,
  onClose,
}: {
  collectionId: string
  onClose: () => void
}) {
  const { collections, setInstructions } = useAppState()
  const collection = collections[collectionId]
  const [draft, setDraft] = useState(collection?.instructions ?? '')
  const areaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null
    const area = areaRef.current
    area?.focus()
    area?.setSelectionRange(area.value.length, area.value.length)
    return () => returnTo?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!collection) return null

  function commit() {
    setInstructions(collectionId, draft.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-ink/20" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Instructions"
        className="relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-[16px]
          border border-line bg-panel shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)]"
      >
        <header className="flex items-start gap-3 border-b border-hairline px-5 py-4">
          <div className="min-w-0 grow">
            <h2 className="m-0 text-[16px] font-medium leading-[24px] text-ink">Instructions</h2>
            <p className="m-0 mt-0.5 text-[12.96px] leading-[20px] text-muted">
              Standing guidance for agents working in {collection.name}.
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="icon-btn">
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="px-5 py-4">
          <textarea
            ref={areaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) commit()
            }}
            placeholder="How should the agent treat this collection? e.g. prioritise human RCTs and meta-analyses; flag effects that only hold in animal models."
            className="h-56 w-full resize-none rounded-[12px] border border-line bg-panel px-3 py-2.5
              text-[15px] leading-[23px] text-ink outline-none placeholder:text-faint
              focus:border-accent"
          />
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-hairline px-5 py-3">
          <span className="text-[12px] leading-[18px] text-faint">
            ⌘↵ to save · Esc to cancel
          </span>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-sm btn-accent" onClick={commit}>
              <Icon name="check" size={14} /> Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
