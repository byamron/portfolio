import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../../state/AppState'
import type { ArtifactBlock, MessageSegment } from '../../data/mock'
import { renderSegment } from '../ThreadView'
import { Icon } from '../icons'

/**
 * Rebuild the segment list from an edited block.
 *
 * Citations are rendered as `contentEditable=false` elements carrying their id,
 * so a human edit keeps them intact rather than flattening the paragraph to
 * plain text and losing every reference in it.
 */
function segmentsFromDom(node: HTMLElement): MessageSegment[] {
  const out: MessageSegment[] = []
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? ''
      if (!text) return
      const last = out[out.length - 1]
      if (typeof last === 'string') out[out.length - 1] = last + text
      else out.push(text)
      return
    }
    const el = child as HTMLElement
    const cite = el.dataset?.cite
    const ref = el.dataset?.thread
    if (cite) out.push({ citePaperId: cite })
    else if (ref) out.push({ threadRefId: ref })
    else if (el.textContent) out.push(el.textContent)
  })
  return out
}

/**
 * The document surface.
 *
 * Blocks are directly editable; an agent rewrite of a block that already said
 * something arrives as a proposal shown against the current text, and nothing
 * changes until you accept it (D25).
 */
export function ArtifactDoc({ artifactId }: { artifactId: string }) {
  const { artifacts, editBlock, resolveProposal, setFocusedBlock, focusedBlockId, findSupport } =
    useAppState()
  const artifact = artifacts[artifactId]

  /**
   * While a block is being typed into, it renders the content it had at focus.
   * React diffs vnode against vnode, so identical children mean it never
   * touches the DOM — which is what stops an agent turn arriving mid-sentence
   * from resetting the paragraph and dropping the caret.
   */
  const [editingId, setEditingId] = useState<string | null>(null)
  const frozen = useRef<MessageSegment[]>([])
  const dirty = useRef(false)

  /**
   * A claim you doubt is the artifact's way back into research: select it and
   * it becomes a real collection thread, whose answer can be cited straight
   * back into this block. Threads feed the artifact; the artifact makes threads.
   */
  const [selection, setSelection] = useState<{
    claim: string
    blockId: string
    left: number
    top: number
  } | null>(null)

  useEffect(() => {
    const read = () => {
      const sel = window.getSelection()
      const text = sel?.toString().trim() ?? ''
      if (!sel || sel.isCollapsed || text.length < 12) return setSelection(null)
      const node = sel.anchorNode
      const host = (node instanceof Element ? node : node?.parentElement)?.closest('[data-block]')
      if (!host) return setSelection(null)
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      setSelection({
        claim: text,
        blockId: (host as HTMLElement).dataset.block!,
        left: rect.left + rect.width / 2,
        top: rect.top,
      })
    }
    document.addEventListener('selectionchange', read)
    return () => document.removeEventListener('selectionchange', read)
  }, [])

  if (!artifact) return null

  return (
    <div className="mx-auto flex max-w-[46rem] flex-col gap-1 px-8 pb-32 pt-6">
      {selection && (
        <button
          type="button"
          style={{ left: selection.left, top: selection.top }}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            findSupport(artifactId, selection.blockId, selection.claim)
            setSelection(null)
          }}
          className="fixed z-40 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-[10px]
            bg-inverse px-2.5 py-1.5 text-[12px] font-medium leading-4 text-on-inverse
            shadow-[0_6px_16px_-4px_rgba(0,0,0,0.35)] hover:brightness-110"
        >
          <span className="flex items-center gap-1.5">
            <Icon name="search" size={13} /> Find support
          </span>
        </button>
      )}
      {artifact.blocks.map((block) => (
        <Block
          key={block.id}
          block={
            editingId === block.id ? { ...block, content: frozen.current, placeholder: undefined } : block
          }
          focused={focusedBlockId === block.id}
          onFocus={() => {
            frozen.current = block.content
            dirty.current = false
            setEditingId(block.id)
            setFocusedBlock(block.id)
          }}
          onInput={() => {
            dirty.current = true
          }}
          onCommit={(node) => {
            setEditingId(null)
            if (!dirty.current) return
            dirty.current = false
            editBlock(artifactId, block.id, segmentsFromDom(node))
          }}
          onResolve={(accept) => resolveProposal(artifactId, block.id, accept)}
        />
      ))}
    </div>
  )
}

function Block({
  block,
  focused,
  onFocus,
  onInput,
  onCommit,
  onResolve,
}: {
  block: ArtifactBlock
  focused: boolean
  onFocus: () => void
  onInput: () => void
  onCommit: (node: HTMLElement) => void
  onResolve: (accept: boolean) => void
}) {
  const heading = block.kind === 'heading'

  const body = (
    <div
      contentEditable
      suppressContentEditableWarning
      data-block={block.id}
      role="textbox"
      tabIndex={0}
      onFocus={onFocus}
      onInput={onInput}
      onBlur={(event) => onCommit(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') event.currentTarget.blur()
      }}
      className={`-mx-2 rounded-[8px] px-2 py-1 outline-none focus:bg-rail ${
        heading
          ? 'mt-5 text-[19px] font-medium leading-[28px] text-ink'
          : 'text-[16px] leading-[26px] text-ink'
      } ${focused ? 'bg-rail/60' : ''}`}
    >
      {block.placeholder && block.content.length === 0 ? (
        <span className="text-faint">{block.placeholder}</span>
      ) : (
        block.content.map(renderSegment)
      )}
    </div>
  )

  if (!block.proposal) return body

  return (
    <div className="-mx-3 my-1 rounded-[12px] border border-accent/40 bg-accent-wash/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="label text-accent-deep">Proposed change</span>
        <span className="min-w-0 grow truncate text-[12.96px] leading-[20px] text-muted">
          {block.proposal.note}
        </span>
      </div>

      {/* Labelled current-vs-proposed rather than struck-through: the rewrite is
          not claimed to remove every word, and pretending otherwise would make
          the diff lie. */}
      <div className="rounded-[8px] bg-panel/70 px-2 py-1.5">
        <div className="label mb-0.5 text-faint">Current</div>
        <div className="text-[15px] leading-[24px] text-muted">{block.content.map(renderSegment)}</div>
      </div>
      <div className="mt-1.5 rounded-[8px] bg-panel px-2 py-1.5">
        <div className="label mb-0.5 text-accent-deep">Proposed</div>
        <div className="text-[16px] leading-[26px] text-ink">
          {block.proposal.content.map(renderSegment)}
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <button type="button" className="btn-sm btn-accent" onClick={() => onResolve(true)}>
          <Icon name="check" size={14} /> Accept
        </button>
        <button type="button" className="btn-sm text-muted" onClick={() => onResolve(false)}>
          <Icon name="close" size={14} /> Reject
        </button>
      </div>
    </div>
  )
}
