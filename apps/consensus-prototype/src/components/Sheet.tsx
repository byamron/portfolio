import { useEffect, type ReactNode } from 'react'
import { Icon } from './icons'

/**
 * A popover's phone form.
 *
 * Anchoring to a trigger only works when there is somewhere to anchor to; at
 * 375px a two-panel menu is wider than the screen. On a phone these become
 * sheets from the bottom edge instead — near the thumb, full width, and
 * impossible to position off-screen.
 */
export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-50 bg-ink/20" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col overflow-hidden
          rounded-t-[20px] border-t border-line bg-panel
          shadow-[0_-12px_32px_-12px_rgba(0,0,0,0.28)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
          <span className="text-[16px] font-medium leading-6 text-ink">{title}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="icon-btn size-8">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto pb-[max(12px,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </>
  )
}
