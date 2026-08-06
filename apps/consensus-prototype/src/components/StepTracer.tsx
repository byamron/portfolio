import { useState } from 'react'
import type { StepRow } from '../data/mockData'
import { ThreadPill } from './ThreadPill'
import { SearchIcon, ChevronRightIcon, ChevronDownIcon } from './icons'

export function StepTracer({ steps }: { steps: StepRow[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary"
      >
        <SearchIcon size={14} /> Pro · {steps.length} {steps.length === 1 ? 'step' : 'steps'}
        {open ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-1.5 border-l border-border/60 pl-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-[13px] text-text-secondary">
              <span className="flex min-w-0 items-center gap-1.5">
                <SearchIcon size={13} className="shrink-0" />
                {step.type === 'read-thread' ? (
                  <>
                    Reading <ThreadPill threadId={step.threadRefId} />
                  </>
                ) : (
                  <span className="truncate">{step.label}</span>
                )}
              </span>
              <span className="shrink-0 font-mono text-[12px]">{step.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
