import { useState } from 'react'
import { useAppState } from '../state/AppState'
import { Checkbox } from './Checkbox'
import { FolderIcon, PlusIcon } from './icons'

export function SaveToCollectionPopover() {
  const { savePopoverPaperId, closeSavePopover, collections, toggleCollectionForPaper, createCollection, papers } =
    useAppState()
  const [query, setQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  if (!savePopoverPaperId) return null
  const paper = papers[savePopoverPaperId]
  if (!paper) return null

  const allCollections = Object.values(collections).filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  )

  function submitNewCollection() {
    const trimmed = newName.trim()
    if (!trimmed) return
    createCollection(trimmed, null)
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={closeSavePopover}>
      <div
        className="shadow-popover mt-16 mr-8 w-[340px] rounded-popover border border-border/60 bg-surface-panel p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 line-clamp-2 text-[13px] font-medium text-text-primary">{paper.title}</div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your Library..."
          className="mb-2 w-full rounded-control border border-border/60 bg-surface-app px-2.5 py-1.5 text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none"
        />

        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          Add to collection
        </div>

        <div className="flex max-h-60 flex-col gap-0.5 overflow-y-auto">
          {allCollections.map((collection) => {
            const checked = collection.paperIds.includes(savePopoverPaperId)
            return (
              <div
                key={collection.id}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-control px-1.5 py-1.5 hover:bg-surface-chip-secondary"
                onClick={() => toggleCollectionForPaper(collection.id, savePopoverPaperId)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FolderIcon size={16} className="shrink-0 text-text-secondary" />
                  <span className="truncate text-[13px] text-text-primary">
                    {collection.parentId ? `↳ ${collection.name}` : collection.name}
                  </span>
                  <span className="shrink-0 text-[12px] text-text-secondary">{collection.paperIds.length} items</span>
                </span>
                <Checkbox
                  checked={checked}
                  onChange={() => toggleCollectionForPaper(collection.id, savePopoverPaperId)}
                  ariaLabel={`Save to ${collection.name}`}
                />
              </div>
            )
          })}
        </div>

        {creating ? (
          <div className="mt-2 flex gap-1.5">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNewCollection()}
              placeholder="Collection name"
              className="flex-1 rounded-control border border-border/60 bg-surface-app px-2.5 py-1.5 text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
            <button
              type="button"
              onClick={submitNewCollection}
              className="rounded-control bg-accent px-2.5 text-[13px] font-medium text-text-primary"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-control border border-dashed border-border-dashed py-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary"
          >
            <PlusIcon size={14} /> New Collection
          </button>
        )}
      </div>
    </div>
  )
}
