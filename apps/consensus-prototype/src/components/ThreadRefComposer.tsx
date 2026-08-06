import { useRef, useState, type KeyboardEvent } from 'react'
import { useAppState } from '../state/AppState'
import type { Collection, MessageSegment } from '../data/mockData'
import { renderSegment } from './MessageBubble'
import { ReferencePicker } from './ReferencePicker'
import { ScopeChip } from './ScopeChip'
import { FolderIcon, DocumentIcon, PlusIcon, ChevronDownIcon, FilterIcon, BellIcon, ArrowUpIcon } from './icons'

const MENTION_RE = /(^|\s)@([^\s]*)$/

export function ThreadRefComposer({
  collection,
  itemCount,
  onSubmit,
}: {
  collection: Collection
  itemCount: number
  onSubmit: (segments: MessageSegment[], scopePaperIds: string[]) => void
}) {
  const { papers } = useAppState()
  const [scopePaperIds, setScopePaperIds] = useState<string[]>([])
  const [segments, setSegments] = useState<MessageSegment[]>([])
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const mentionMatch = draft.match(MENTION_RE)
  const mentionQuery = mentionMatch ? mentionMatch[2] : null
  const hasContent = draft.trim().length > 0 || segments.length > 0 || scopePaperIds.length > 0

  function clearMentionText() {
    return mentionMatch ? draft.slice(0, draft.length - mentionMatch[0].length + mentionMatch[1].length) : draft
  }

  function selectMention(segment: MessageSegment) {
    const before = clearMentionText()
    if (typeof segment === 'object' && 'citePaperId' in segment) {
      // Items/sources scope the thread as a chip — never inserted inline.
      setScopePaperIds((prev) => (prev.includes(segment.citePaperId) ? prev : [...prev, segment.citePaperId]))
      setDraft(before)
    } else {
      // Threads are the one inline-chip reference type — part of the sentence.
      setSegments((prev) => [...prev, ...(before.trim() ? [before] : []), segment])
      setDraft('')
    }
    inputRef.current?.focus()
  }

  function removeScopePaper(paperId: string) {
    setScopePaperIds((prev) => prev.filter((id) => id !== paperId))
  }

  function submit() {
    const final = draft.trim() ? [...segments, draft] : segments
    if (final.length === 0 && scopePaperIds.length === 0) return
    onSubmit(final, scopePaperIds)
    setSegments([])
    setScopePaperIds([])
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !mentionQuery) {
      e.preventDefault()
      submit()
    } else if (e.key === 'Backspace' && draft === '' && segments.length > 0) {
      setSegments((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="relative">
      {mentionQuery !== null && <ReferencePicker query={mentionQuery} onSelect={selectMention} />}
      {/* Fixed width + height, always — the box never resizes with content. Overflow scrolls
          internally instead of growing, matching the real composer's constant footprint. */}
      <div className="elevated flex h-44 w-[680px] flex-col justify-between rounded-composer bg-surface-panel px-3 pb-2 pt-3">
        <div className="flex flex-col gap-2 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-1.5">
            <ScopeChip
              icon={<FolderIcon size={14} />}
              label={`${collection.name} · ${itemCount} items, ${itemCount} searchable`}
            />
            {scopePaperIds.map((id) => {
              const paper = papers[id]
              if (!paper) return null
              return (
                <ScopeChip
                  key={id}
                  icon={<DocumentIcon size={14} />}
                  label={paper.title}
                  onRemove={() => removeScopePaper(id)}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-1 text-base leading-6">
            {segments.map((s, i) => renderSegment(s, i))}
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={segments.length === 0 ? 'Ask these papers... (type @ to reference an item or thread)' : ''}
              className="min-w-[160px] flex-1 bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="elevated flex size-9 items-center justify-center rounded-control bg-surface-app text-text-primary"
              aria-label="Add"
            >
              <PlusIcon size={20} />
            </button>
            <button
              type="button"
              className="elevated flex h-9 items-center gap-2 rounded-control bg-surface-app px-3 text-[15.04px] font-medium leading-[22.56px] text-text-primary"
            >
              Corpus <ChevronDownIcon size={14} />
            </button>
            <button
              type="button"
              className="elevated-dashed flex h-9 items-center gap-2 rounded-control px-3 text-[15.04px] font-medium leading-[22.56px] text-text-secondary"
            >
              🦉 Deep <PlusIcon size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-control border border-transparent px-2 text-[15.04px] font-medium leading-[22.56px] text-text-secondary underline decoration-text-secondary/40 underline-offset-2 hover:text-text-primary"
            >
              <FilterIcon size={16} /> Filter
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-control border border-transparent text-text-secondary hover:text-text-primary"
              aria-label="Voice input"
            >
              <BellIcon size={16} />
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!hasContent}
              className="elevated-accent flex size-9 items-center justify-center rounded-control bg-accent text-white disabled:opacity-60"
              aria-label="Send"
            >
              <ArrowUpIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
