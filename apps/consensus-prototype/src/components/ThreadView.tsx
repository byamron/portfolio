import { useEffect, useRef } from 'react'
import { useAppState } from '../state/AppState'
import { MessageBubble } from './MessageBubble'
import { Composer } from './Composer'
import { ReferencesDrawer } from './ReferencesDrawer'
import { ScopeChip } from './ScopeChip'
import { BookmarkIcon, FolderIcon, DocumentIcon } from './icons'

export function ThreadView() {
  const { activeThreadId, threads, collections, papers, isGenerating, sendFollowUp, referencesOpen, toggleReferences } =
    useAppState()
  const scrollRef = useRef<HTMLDivElement>(null)
  const thread = activeThreadId ? threads[activeThreadId] : null

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread?.messages.length])

  if (!thread) return null

  const originCollection = thread.originCollectionId ? collections[thread.originCollectionId] : null

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 shrink-0 items-center justify-between bg-surface-panel px-4">
          <div className="truncate text-[15.04px] font-medium leading-[22.56px] text-text-primary">{thread.title}</div>
          <div className="flex items-center gap-3 text-text-secondary">
            <button type="button" aria-label="Bookmark thread" className="hover:text-text-primary">
              <BookmarkIcon size={18} />
            </button>
            <button
              type="button"
              onClick={toggleReferences}
              className="elevated h-9 rounded-control bg-surface-app px-3 text-[15.04px] font-medium leading-[22.56px] text-text-primary"
            >
              References
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {thread.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isGenerating && <p className="text-[13px] text-text-secondary">Researching…</p>}
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-border/60 px-6 py-4">
          {originCollection && (
            <div className="flex w-full max-w-3xl flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-text-secondary">Context:</span>
              <ScopeChip icon={<FolderIcon size={14} />} label={originCollection.name} />
              {thread.scopePaperIds?.map((id) => {
                const paper = papers[id]
                if (!paper) return null
                return <ScopeChip key={id} icon={<DocumentIcon size={14} />} label={paper.title} />
              })}
            </div>
          )}
          <Composer placeholder="Ask a follow up..." onSubmit={sendFollowUp} disabled={isGenerating} large />
        </div>
      </div>

      {referencesOpen && <ReferencesDrawer paperIds={thread.referencedPaperIds} />}
    </div>
  )
}
