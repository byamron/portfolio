import type { ReactNode } from 'react'
import { CloseIcon } from './icons'

// Sources/items/collections scope the conversation — rendered as rectangles, distinct
// from thread references which are inline chips *within* the sentence (never conflated).
export function ScopeChip({ icon, label, onRemove }: { icon: ReactNode; label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-chip bg-surface-chip-secondary px-2 text-[13px] text-text-primary">
      {icon}
      <span className="max-w-[220px] truncate">{label}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 text-text-secondary hover:text-text-primary" aria-label={`Remove ${label}`}>
          <CloseIcon size={12} />
        </button>
      )}
    </span>
  )
}
