import { useAppState } from '../state/AppState'
import { CollectionPicker } from './CollectionPicker'

/**
 * Saving a paper uses the same collection picker as saving a thread — one
 * save-to-collection surface, whatever the object is.
 */
export function SaveToCollectionPopover() {
  const {
    savePopoverPaperId,
    closeSavePopover,
    collections,
    papers,
    toggleCollectionForPaper,
    libraryPaperIds,
    toggleLibraryForPaper,
  } = useAppState()
  if (!savePopoverPaperId) return null

  const paper = papers[savePopoverPaperId]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20"
      onClick={closeSavePopover}
    >
      <div onClick={(event) => event.stopPropagation()} className="flex flex-col gap-2">
        <p className="m-0 line-clamp-2 max-w-[300px] text-[13px] leading-5 font-medium text-on-accent drop-shadow">
          {paper?.title}
        </p>
        <CollectionPicker
          isMember={(id) => collections[id]?.paperIds.includes(savePopoverPaperId) ?? false}
          onToggle={(id) => toggleCollectionForPaper(id, savePopoverPaperId)}
          inLibrary={libraryPaperIds.includes(savePopoverPaperId)}
          onToggleLibrary={() => toggleLibraryForPaper(savePopoverPaperId)}
          libraryCount={libraryPaperIds.length}
        />
      </div>
    </div>
  )
}
