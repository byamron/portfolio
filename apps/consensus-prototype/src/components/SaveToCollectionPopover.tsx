import { useLayoutEffect, useState } from 'react'
import { useAppState } from '../state/AppState'
import { CollectionPicker } from './CollectionPicker'

const WIDTH = 300
const HEIGHT = 380

/**
 * Saving a paper uses the same collection picker as saving a thread, dropped
 * from whatever control opened it. A centred modal would be a bigger
 * interruption than the decision warrants — this is a checkbox, not a commitment.
 */
export function SaveToCollectionPopover() {
  const {
    savePopoverPaperId,
    savePopoverAnchor,
    closeSavePopover,
    collections,
    toggleCollectionForPaper,
    libraryPaperIds,
    toggleLibraryForPaper,
  } = useAppState()
  const [position, setPosition] = useState({ left: 0, top: 0 })

  useLayoutEffect(() => {
    if (!savePopoverPaperId) return
    const anchor = savePopoverAnchor
    if (anchor) {
      const below = anchor.bottom + 6
      setPosition({
        left: Math.min(Math.max(12, anchor.left), window.innerWidth - WIDTH - 12),
        top: below + HEIGHT > window.innerHeight ? Math.max(12, anchor.top - HEIGHT - 6) : below,
      })
    } else {
      setPosition({
        left: (window.innerWidth - WIDTH) / 2,
        top: (window.innerHeight - HEIGHT) / 2,
      })
    }
    const close = (event: KeyboardEvent) => event.key === 'Escape' && closeSavePopover()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [closeSavePopover, savePopoverAnchor, savePopoverPaperId])

  if (!savePopoverPaperId) return null

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={closeSavePopover} />
      <div
        style={{ left: position.left, top: position.top }}
        onClick={(event) => event.stopPropagation()}
        className="fixed z-50"
      >
        <CollectionPicker
          isMember={(id) => collections[id]?.paperIds.includes(savePopoverPaperId) ?? false}
          onToggle={(id) => toggleCollectionForPaper(id, savePopoverPaperId)}
          inLibrary={libraryPaperIds.includes(savePopoverPaperId)}
          onToggleLibrary={() => toggleLibraryForPaper(savePopoverPaperId)}
          libraryCount={libraryPaperIds.length}
        />
      </div>
    </>
  )
}
