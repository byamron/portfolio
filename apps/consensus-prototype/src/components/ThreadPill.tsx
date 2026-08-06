import { useAppState } from '../state/AppState'
import { ChatIcon } from './icons'

export function ThreadPill({ threadId, clickable = true }: { threadId: string; clickable?: boolean }) {
  const { threads, openThread } = useAppState()
  const thread = threads[threadId]
  if (!thread) return null

  const classes =
    'mx-0.5 inline-flex h-6 items-center gap-1.5 rounded-chip bg-surface-chip-secondary px-2 align-middle text-[13px] font-medium text-text-primary'

  if (!clickable) {
    return (
      <span className={classes}>
        <ChatIcon size={13} /> {thread.title}
      </span>
    )
  }

  return (
    <button type="button" onClick={() => openThread(threadId)} className={`${classes} hover:bg-accent/30`}>
      <ChatIcon size={13} /> {thread.title}
    </button>
  )
}
