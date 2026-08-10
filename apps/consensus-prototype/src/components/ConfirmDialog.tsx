import { useEffect, type ReactNode } from 'react'
import { Icon } from './icons'

/**
 * The product's destructive-action dialog.
 *
 * A modal rather than an inline confirm: deleting is the one thing in here that
 * cannot be undone, and it should cost a deliberate look away from whatever you
 * were doing rather than a second click in the same place your finger already
 * is.
 */
export function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  title: string
  body: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-ink/20" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[520px] overflow-hidden rounded-[16px] border border-line
          bg-panel shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)]"
      >
        <div className="px-5 pb-5 pt-4">
          <div className="flex items-start gap-3">
            <h2 className="m-0 grow text-[20px] font-medium leading-[28px] text-ink">{title}</h2>
            <button type="button" aria-label="Close" onClick={onCancel} className="icon-btn">
              <Icon name="close" size={16} />
            </button>
          </div>
          <p className="m-0 mt-2 max-w-[52ch] text-[15px] leading-[23px] text-muted">{body}</p>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <button type="button" className="btn" onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button type="button" className="btn-accent" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
