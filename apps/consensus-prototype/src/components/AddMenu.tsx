import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAppState } from '../state/AppState'
import { Icon } from './icons'
import { useStub } from './StubHint'

/** Zotero's mark, approximated — the import it stands for is a stub anyway. */
function ZoteroMark() {
  return (
    <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[4px] bg-[#cc2936] text-[11px] font-bold leading-none text-white">
      Z
    </span>
  )
}

/**
 * The collection's Add menu.
 *
 * Add means "bring in something you already have" — upload, paste, import — so
 * authoring sits below a rule rather than mixed in with it. Threads are not here
 * at all: the composer is on every page of a collection and is a better control
 * than any menu item could be.
 */
export function AddMenu({ collectionId }: { collectionId?: string }) {
  const { newArtifact } = useAppState()
  const stub = useStub()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ right: 0, top: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) setPosition({ right: window.innerWidth - rect.right, top: rect.bottom + 6 })
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Add"
        className="btn-accent"
      >
        <Icon name="plus" size={16} />
        <span className="hidden @[440px]:inline">Add</span>
        <Icon name="chevronDown" size={14} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="Add to collection"
            style={{ right: position.right, top: position.top }}
            className="fixed z-50 w-[268px] overflow-hidden rounded-[14px] border border-line
              bg-panel p-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.24)]"
          >
            <Item
              icon={<Icon name="upload" size={18} className="text-muted" strokeWidth={1.7} />}
              label="Upload"
              detail="PDF, RIS, or BibTeX"
              onClick={(event) => {
                setOpen(false)
                stub(event, 'Upload a PDF, RIS or BibTeX file')
              }}
            />
            <Item
              icon={<Icon name="link" size={18} className="text-muted" strokeWidth={1.7} />}
              label="Paste DOIs"
              onClick={(event) => {
                setOpen(false)
                stub(event, 'Paste a list of DOIs to import')
              }}
            />
            <Item
              icon={<ZoteroMark />}
              label="Import from Zotero"
              onClick={(event) => {
                setOpen(false)
                stub(event, 'Connect a Zotero library')
              }}
            />

            {collectionId && (
              <>
                <div className="my-1 h-px bg-hairline" />
                <Item
                  icon={<Icon name="fileText" size={18} className="text-muted" strokeWidth={1.7} />}
                  label="New artifact"
                  detail="A document you write here"
                  onClick={() => {
                    setOpen(false)
                    newArtifact(collectionId)
                  }}
                />
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}

function Item({
  icon,
  label,
  detail,
  onClick,
}: {
  icon: ReactNode
  label: string
  detail?: string
  onClick: (event: React.MouseEvent) => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left hover:bg-rail"
    >
      {icon}
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-medium leading-5 text-ink">{label}</span>
        {detail && (
          <span className="block truncate text-[12.96px] leading-[20px] text-muted">{detail}</span>
        )}
      </span>
    </button>
  )
}
