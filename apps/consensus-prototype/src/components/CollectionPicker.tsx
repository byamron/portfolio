import { useState } from 'react'
import { useAppState } from '../state/AppState'
import { plural } from '../data/mock'
import { Icon } from './icons'

/**
 * The product's Save-to-Collection panel, matching the live UI: My Library at
 * the top with its count, a search over collections, then the collections
 * themselves, then New Collection.
 *
 * My Library is a real target (D30). Unchecking it takes the object out of the
 * library and therefore out of every collection under it, which is what makes
 * the hierarchy true rather than decorative.
 */
export function CollectionPicker({
  isMember,
  onToggle,
  inLibrary,
  onToggleLibrary,
  libraryCount,
}: {
  isMember: (collectionId: string) => boolean
  onToggle: (collectionId: string) => void
  inLibrary: boolean
  onToggleLibrary: () => void
  libraryCount: number
}) {
  const { collections, createCollection } = useAppState()
  const [query, setQuery] = useState('')
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const matches = Object.values(collections).filter((collection) =>
    collection.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="flex w-[300px] flex-col rounded-[14px] border border-line bg-panel shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18)]">
      <button
        type="button"
        onClick={onToggleLibrary}
        title={
          inLibrary
            ? 'Remove from your library, and from every collection in it'
            : 'Save to your library'
        }
        className="flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-rail"
      >
        <Icon name="bookmark" size={18} className="shrink-0 text-muted" />
        <span className="min-w-0 grow">
          <span className="block truncate text-[14px] font-medium leading-5 text-ink">
            My Library
          </span>
          <span className="block text-[12px] leading-[18px] text-muted">
            {plural(libraryCount, 'item')}
          </span>
        </span>
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-[5px] border ${
            inLibrary ? 'border-accent bg-accent text-on-accent' : 'border-line-strong'
          }`}
        >
          {inLibrary && <Icon name="check" size={12} strokeWidth={3} />}
        </span>
      </button>

      <div className="border-t border-hairline px-3 pb-2 pt-2.5">
        <div className="label pb-1.5 text-muted">Add to collection</div>
        <div className="flex h-8 items-center gap-2 rounded-[8px] border border-line px-2">
          <Icon name="search" size={14} className="text-faint" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your Library…"
            className="min-w-0 grow bg-transparent text-[13px] text-ink placeholder:text-faint focus:outline-none"
          />
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto pb-1">
        {matches.length === 0 && (
          <p className="m-0 px-3 py-3 text-[12.96px] leading-[20px] text-muted">
            {query ? `No collection matches “${query}”.` : 'No collections yet.'}
          </p>
        )}
        {matches.map((collection) => {
          const checked = isMember(collection.id)
          return (
            <button
              key={collection.id}
              type="button"
              onClick={() => onToggle(collection.id)}
              className={`flex w-full items-center gap-2.5 py-2 pr-3 text-left hover:bg-rail ${
                collection.parentId ? 'pl-7' : 'pl-3'
              }`}
            >
              <Icon name="folder" size={18} className="shrink-0 text-muted" />
              <span className="min-w-0 grow">
                <span className="block truncate text-[14px] font-medium leading-5 text-ink">
                  {collection.name}
                </span>
                <span className="block text-[12px] leading-[18px] text-muted">
                  {plural(collection.paperIds.length, 'item')}
                </span>
              </span>
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-[5px] border ${
                  checked ? 'border-accent bg-accent text-on-accent' : 'border-line-strong'
                }`}
              >
                {checked && <Icon name="check" size={12} strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>

      <div className="border-t border-hairline p-2">
        {naming ? (
          <form
            className="flex items-center gap-1.5"
            onSubmit={(event) => {
              event.preventDefault()
              const created = createCollection(name.trim())
              if (created) onToggle(created)
              setName('')
              setNaming(false)
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && setNaming(false)}
              placeholder="Collection name"
              className="h-8 min-w-0 grow rounded-[8px] border border-line px-2 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
            />
            <button type="submit" className="btn-sm btn-accent shrink-0" disabled={!name.trim()}>
              Create
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setNaming(true)}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border border-line text-[13px] font-medium text-ink hover:bg-rail"
          >
            <Icon name="folderPlus" size={16} /> New Collection
          </button>
        )}
      </div>
    </div>
  )
}
