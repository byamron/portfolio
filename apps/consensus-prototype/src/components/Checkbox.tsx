// CDL input/x-sm: 20px box, 4px radius (radius/x-sm) — see 05-design-conventions.md §6/audit.
export function Checkbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: () => void
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
        checked ? 'border-accent bg-accent' : 'border-border bg-surface-panel'
      }`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
          <path d="M5 12.5 10 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
