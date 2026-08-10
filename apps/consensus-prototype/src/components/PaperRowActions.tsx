import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../state/AppState'
import { Icon, type IconName } from './icons'
import { useStub } from './StubHint'

/**
 * The row's actions, on hover.
 *
 * A floating bar rather than a ⋯ menu: these are the things you do to a paper
 * often enough that a click to reveal them is a click too many. The menu shape
 * is reserved for threads, where the actions are filing and deletion — rarer,
 * and worth the extra step.
 */
const DELAY = 320

export function PaperRowActions({ paperId }: { paperId: string }) {
  const { referenceInComposer, openSavePopover, savePopoverPaperId } = useAppState()
  const stub = useStub()
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)

  /**
   * Held back a beat. Passing a cursor over a table should not set off a bar
   * under every row it crosses — the delay is what distinguishes travelling
   * through a row from stopping on one. The bar is a descendant of the row, so
   * moving onto it does not count as leaving.
   */
  useEffect(() => {
    const row = anchorRef.current?.closest('tr')
    if (!row) return
    let timer = 0
    const enter = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setOpen(true), DELAY)
    }
    const leave = () => {
      window.clearTimeout(timer)
      setOpen(false)
    }
    row.addEventListener('pointerenter', enter)
    row.addEventListener('pointerleave', leave)
    return () => {
      window.clearTimeout(timer)
      row.removeEventListener('pointerenter', enter)
      row.removeEventListener('pointerleave', leave)
    }
  }, [])

  /**
   * The picker's click-catcher covers the page, so the row reads it as the
   * pointer leaving. The bar stays while its own dropdown is open — a menu
   * should not outlive the control it came from.
   */
  const saving = savePopoverPaperId === paperId
  const stop = (event: React.MouseEvent) => event.stopPropagation()

  return (
    <span ref={anchorRef} onClick={stop} className="absolute left-0 top-full z-20 pt-1">
      {(open || saving) && (
        <span
          className="inline-flex items-center gap-1 rounded-full border
          border-line bg-panel p-1.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.22)]"
      >
        <button
          type="button"
          onClick={() => referenceInComposer({ kind: 'paper', id: paperId })}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-accent-wash px-3
            text-[14px] font-medium text-accent-deep hover:brightness-95"
        >
          <Icon name="chat" size={16} /> Ask
        </button>

        <button
          type="button"
          onClick={(event) => openSavePopover(paperId, event.currentTarget)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3
            text-[14px] font-medium text-ink hover:bg-rail"
        >
          <Icon name="bookmark" size={16} /> Save
          <Icon name="chevronDown" size={14} className="text-muted" />
        </button>

        <span className="mx-0.5 h-5 w-px bg-hairline" />

        <IconAction icon="citationGraph" label="Open in the citation graph" />
        <IconAction icon="quote" label="Copy a formatted citation" />
        <IconAction icon="link" label="Copy a link to this paper" />
        <IconAction icon="download" label="Download the PDF" />
      </span>
      )}
    </span>
  )

  function IconAction({ icon, label }: { icon: IconName; label: string }) {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={(event) => stub(event, label)}
        className="icon-btn size-8 rounded-full"
      >
        <Icon name={icon} size={17} strokeWidth={1.7} />
      </button>
    )
  }
}
