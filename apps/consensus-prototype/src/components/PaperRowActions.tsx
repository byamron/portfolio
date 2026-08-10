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
export function PaperRowActions({ paperId }: { paperId: string }) {
  const { referenceInComposer, openSavePopover } = useAppState()
  const stub = useStub()

  const stop = (event: React.MouseEvent) => event.stopPropagation()

  return (
    <span
      onClick={stop}
      className="pointer-events-none absolute left-0 top-full z-20 hidden pt-1
        group-hover/row:block group-focus-within/row:block"
    >
      <span
        className="pointer-events-auto inline-flex items-center gap-1 rounded-full border
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
          onClick={() => openSavePopover(paperId)}
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
