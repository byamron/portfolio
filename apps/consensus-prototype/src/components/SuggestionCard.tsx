import type { Suggestion } from '../data/mockData'
import { useAppState } from '../state/AppState'
import { ThreadPill } from './ThreadPill'
import { ChevronRightIcon } from './icons'

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const { startSuggestedThread } = useAppState()

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-3">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-text-primary">{suggestion.question}</p>
        <p className="mt-1 flex flex-wrap items-center gap-1 text-[13px] text-text-secondary">
          Based on
          {suggestion.basedOnThreadIds.map((tid, i) => (
            <span key={tid} className="flex items-center gap-1">
              {i > 0 && <span>and</span>}
              <ThreadPill threadId={tid} clickable={false} />
            </span>
          ))}
        </p>
      </div>
      <button
        type="button"
        onClick={() => startSuggestedThread(suggestion)}
        className="elevated-accent flex h-9 shrink-0 items-center gap-1 rounded-control bg-accent px-3 text-[15.04px] font-medium leading-[22.56px] text-white"
      >
        Start thread <ChevronRightIcon size={16} />
      </button>
    </div>
  )
}
