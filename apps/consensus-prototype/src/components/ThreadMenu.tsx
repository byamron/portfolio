import { useLayoutEffect, useRef, useState } from 'react'
import { useAppState } from '../state/AppState'
import { Icon } from './icons'
import { CollectionPicker } from './CollectionPicker'
import { ConfirmDialog } from './ConfirmDialog'
import { Sheet } from './Sheet'
import { useIsMobile } from '../hooks/useIsMobile'

/**
 * The per-thread menu, in the rail and on a row in the Threads tab.
 *
 * A thread belongs to any number of collections and to none — a thread started
 * from Home is not homeless, it is just unfiled, and this is where it gets
 * filed. Same menu in both places so the gesture is learned once.
 */
const ACTIONS_W = 210
const PICKER_W = 300
const PICKER_H = 380

export function ThreadMenu({ threadId }: { threadId: string }) {
  const {
    threads,
    toggleCollectionForThread,
    collectionsForThread,
    deleteThread,
    libraryThreadIds,
    libraryPaperIds,
    toggleLibraryForThread,
  } = useAppState()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0, flip: false })
  const triggerRef = useRef<HTMLButtonElement>(null)

  // The actions panel sits against the control that opened it; the picker takes
  // whichever side has room, so neither ends up across the screen from the row
  // you clicked.
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const left = Math.min(rect.right + 6, window.innerWidth - ACTIONS_W - 12)
      setPosition({
        left: Math.max(12, left),
        top: Math.max(12, Math.min(rect.top, window.innerHeight - (saving ? PICKER_H : 120) - 12)),
        flip: left + ACTIONS_W + 8 + PICKER_W > window.innerWidth - 12,
      })
    }
    place()
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', close)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('keydown', close)
      window.removeEventListener('resize', place)
    }
  }, [open, saving])

  const member = collectionsForThread(threadId)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Thread options"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((v) => !v)
          setSaving(false)
          setConfirming(false)
        }}
        className={`icon-btn size-6 shrink-0 ${open ? 'bg-fill text-ink' : ''}`}
      >
        <Icon name="more" size={15} />
      </button>

      {open && isMobile && (
        <Sheet title="Thread" onClose={() => setOpen(false)}>
          <div className="px-2 pb-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setConfirming(true)
              }}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-left text-[15.04px] font-medium leading-[23px] text-red hover:bg-red-wash"
            >
              <Icon name="trash" size={18} /> Delete
            </button>
          </div>
          <div className="border-t border-hairline">
            <CollectionPicker
              isMember={(id) => member.includes(id)}
              onToggle={(id) => toggleCollectionForThread(id, threadId)}
              inLibrary={libraryThreadIds.includes(threadId)}
              onToggleLibrary={() => toggleLibraryForThread(threadId)}
              libraryCount={libraryPaperIds.length}
              full
            />
          </div>
        </Sheet>
      )}

      {open && !isMobile && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Two panels, as the product does it: the actions, and the collection
              picker beside them. */}
          <div
            role="dialog"
            aria-label="Thread options"
            style={
              position.flip
                ? { right: window.innerWidth - position.left - ACTIONS_W, top: position.top }
                : { left: position.left, top: position.top }
            }
            onClick={(event) => event.stopPropagation()}
            className={`fixed z-50 flex items-start gap-2 ${
              position.flip ? 'flex-row-reverse' : ''
            }`}
          >
            <div className="w-[210px] shrink-0 overflow-hidden rounded-[14px] border border-line bg-panel p-1 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18)]">
              <button
                type="button"
                onClick={() => setSaving((v) => !v)}
                aria-expanded={saving}
                className={`flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[14px] font-medium text-ink ${
                  saving ? 'bg-fill' : 'hover:bg-rail'
                }`}
              >
                <Icon name="bookmark" size={16} className="text-muted" />
                <span className="grow">Save to Collection</span>
                <Icon name="chevronRight" size={14} className="text-faint" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setConfirming(true)
                }}
                className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[14px] font-medium text-red hover:bg-red-wash"
              >
                <Icon name="trash" size={16} />
                Delete
              </button>
            </div>

            {saving && (
              <CollectionPicker
                isMember={(id) => member.includes(id)}
                onToggle={(id) => toggleCollectionForThread(id, threadId)}
                inLibrary={libraryThreadIds.includes(threadId)}
                onToggleLibrary={() => toggleLibraryForThread(threadId)}
                libraryCount={libraryPaperIds.length}
              />
            )}
          </div>
        </>
      )}

      {confirming && (
        <ConfirmDialog
          title="Delete thread?"
          body={
            <>
              Are you sure you want to delete{' '}
              <span className="font-medium text-ink">“{threads[threadId]?.title}”</span>? This
              action cannot be undone.
            </>
          }
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            deleteThread(threadId)
          }}
        />
      )}
    </>
  )
}
