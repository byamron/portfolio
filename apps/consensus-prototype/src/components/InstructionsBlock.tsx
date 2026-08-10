import { useEffect, useState } from 'react'
import { useAppState } from '../state/AppState'
import { Icon } from './icons'
import { InstructionsModal } from './InstructionsModal'

/**
 * Standing instructions for the collection.
 *
 * Fixed height by construction — a title row plus exactly two clamped lines —
 * so nothing below it moves, whatever the instructions say or how wide the
 * column is. Editing opens a modal rather than swapping a textarea in here:
 * the block is a preview, and a preview is the wrong size for writing.
 */
export function InstructionsBlock() {
  const { collections, selectedCollectionId } = useAppState()
  const collection = collections[selectedCollectionId]
  const [editing, setEditing] = useState(false)

  useEffect(() => setEditing(false), [collection.id])

  return (
    <section className="shrink-0 border-b border-line px-4 pb-4 pt-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[15.04px] font-medium leading-[23px] text-ink">Instructions</span>
        <button
          type="button"
          className="icon-btn"
          aria-label="Edit instructions"
          onClick={() => setEditing(true)}
        >
          <Icon name="pencil" size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => setEditing(true)}
        title={collection.instructions}
        className="mt-0.5 line-clamp-2 min-h-10 w-full max-w-[92ch] text-left text-[12.96px]
          leading-[20px] text-muted hover:text-ink"
      >
        {collection.instructions || (
          <span className="text-faint">
            No standing instructions yet — add some to steer the agents working in this
            collection.
          </span>
        )}
      </button>

      {editing && (
        <InstructionsModal collectionId={collection.id} onClose={() => setEditing(false)} />
      )}
    </section>
  )
}
