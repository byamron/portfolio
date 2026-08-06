import { useState } from 'react'
import { useAppState } from '../state/AppState'
import { ChatIcon, ChevronRightIcon } from './icons'

export function ProvenancePopover({ threadIds }: { threadIds: string[] }) {
  const { threads, openThread } = useAppState()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-6 items-center gap-1 rounded-chip bg-surface-chip-secondary px-1.5 font-mono text-[12px] font-semibold text-text-primary hover:bg-surface-chip"
      >
        <ChatIcon size={12} /> {threadIds.length}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="shadow-popover absolute left-0 top-full z-50 mt-1 w-72 rounded-popover border border-border/60 bg-surface-panel p-1.5">
            {threadIds.map((tid) => {
              const thread = threads[tid]
              if (!thread) return null
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    openThread(tid)
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-control px-2 py-2 text-left hover:bg-surface-chip-secondary"
                >
                  <span className="flex min-w-0 items-center gap-2 text-[13px] text-text-primary">
                    <ChatIcon size={14} className="shrink-0 text-text-secondary" />
                    <span className="truncate">{thread.title}</span>
                  </span>
                  <ChevronRightIcon size={14} className="shrink-0 text-text-secondary" />
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
