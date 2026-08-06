import { useState, type KeyboardEvent } from 'react'
import { PlusIcon, ChevronDownIcon, FilterIcon, BellIcon, ArrowUpIcon } from './icons'

export function Composer({
  placeholder,
  onSubmit,
  disabled,
  large,
}: {
  placeholder: string
  onSubmit: (text: string) => void
  disabled?: boolean
  large?: boolean
}) {
  const [text, setText] = useState('')

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setText('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="w-full max-w-3xl rounded-composer border border-border bg-surface-rail/[0.96] py-2 pl-4 pr-2 pt-5 shadow-md backdrop-blur">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={large ? 2 : 1}
        className="w-full resize-none bg-transparent text-base leading-6 text-text-primary placeholder:text-text-secondary focus:outline-none"
      />
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="elevated flex size-9 items-center justify-center rounded-control bg-surface-panel text-text-primary"
            aria-label="Add"
          >
            <PlusIcon size={20} />
          </button>
          <button
            type="button"
            className="elevated flex h-9 items-center gap-2 rounded-control bg-surface-panel px-3 text-[15.04px] font-medium leading-[22.56px] text-text-primary"
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
            disabled={disabled || !text.trim()}
            className="elevated-accent flex size-9 items-center justify-center rounded-control bg-accent text-white disabled:opacity-60"
            aria-label="Send"
          >
            <ArrowUpIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
