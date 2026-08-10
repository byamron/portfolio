import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useAppState } from '../state/AppState'
import { provenanceFor } from '../data/mock'
import { Icon } from './icons'

/**
 * "How did this get here." The one thing no reference manager can answer and
 * Consensus can (D8) — so it is a first-class, inspectable property rather than
 * a convention users invent.
 *
 * Shows only checkable facts: which thread, which query, what the answer used
 * it for. It never claims to know *why* the ranker placed a paper where it did,
 * because a hybrid ranker cannot honestly say (D13).
 *
 * Positioned fixed rather than absolute — the panel clips its overflow, and a
 * popover that gets cut off is worse than no popover.
 */
export function ProvenancePopover({
  paperId,
  threadIds,
  children,
}: {
  paperId: string
  threadIds: string[]
  children: ReactNode
}) {
  const { threads, openThread } = useAppState()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  const rows = provenanceFor(paperId, threadIds, threads)

  useLayoutEffect(() => {
    if (!open) return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = 320
    // Keep it on screen, and flip above the trigger when the foot would clip.
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12)
    const below = rect.bottom + 6
    const flip = below + 260 > window.innerHeight
    setPosition({ left, top: flip ? rect.top - 6 : below })
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    const dismiss = () => setOpen(false)
    window.addEventListener('keydown', onKey)
    // Fixed position cannot follow the trigger, so it closes rather than drifts.
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('resize', dismiss)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
    }
  }, [open])

  const flipped = position.top < (triggerRef.current?.getBoundingClientRect().top ?? 0)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="How this got here"
        className="rounded-[8px] transition-opacity hover:opacity-80"
      >
        {children}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="How this got here"
            style={{
              left: position.left,
              top: position.top,
              transform: flipped ? 'translateY(-100%)' : undefined,
            }}
            className="fixed z-50 w-80 overflow-hidden rounded-[14px] border border-line bg-panel
              shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18)]"
          >
            <header className="border-b border-hairline px-3 py-2.5">
              <div className="panel-heading">How this got here</div>
              <p className="m-0 mt-0.5 text-[12px] leading-[18px] text-faint">
                Recorded from the threads, not inferred.
              </p>
            </header>

            <div className="max-h-72 overflow-y-auto py-1">
              {rows.map(({ threadId, entry }) => {
                const thread = threads[threadId]
                if (!thread) return null
                return (
                  <button
                    key={threadId}
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      openThread(threadId)
                    }}
                    className="flex w-full flex-col gap-1 px-3 py-2.5 text-left hover:bg-rail"
                  >
                    <span className="flex w-full items-center gap-2">
                      <Icon name="chat" size={14} className="shrink-0 text-accent-deep" />
                      <span className="grow truncate text-[13px] font-medium text-ink">
                        {thread.title}
                      </span>
                      <Icon name="chevronRight" size={14} className="shrink-0 text-faint" />
                    </span>

                    <span className="flex items-start gap-2 pl-6">
                      <span className="label shrink-0 pt-0.5 text-faint">Query</span>
                      <span className="text-[12.96px] leading-[20px] text-muted">
                        “{entry.query}”
                      </span>
                    </span>

                    {entry.quotedFor && (
                      <span className="flex items-start gap-2 pl-6">
                        <span className="label shrink-0 pt-0.5 text-faint">Cited</span>
                        <span className="text-[12.96px] leading-[20px] text-muted">
                          {entry.quotedFor}
                        </span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
