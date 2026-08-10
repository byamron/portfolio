import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useAppState } from '../state/AppState'
import type { MessageSegment } from '../data/mock'
import { Badge, ScopeChip } from './chips'
import { Icon } from './icons'
import { useStub } from './StubHint'
import { renderSegment } from './ThreadView'

const MENTION = /(^|\s)@([^\s]*)$/

/**
 * §1 — the reference composer. `@` opens a picker over the collection's threads
 * and items. A thread lands inline, as part of the sentence; an item attaches
 * as a scope chip above it. The two never blur together (D16, D17).
 */
export function Composer({
  placeholder = 'Ask these papers…',
  scopeLabel,
  hideScope = false,
  onSubmit,
}: {
  placeholder?: string
  scopeLabel?: string
  /** Home has no collection to scope to. */
  hideScope?: boolean
  onSubmit: (
    segments: MessageSegment[],
    scopePaperIds: string[],
    scopeArtifactIds: string[],
  ) => void
}) {
  const {
    papers,
    threads,
    artifacts,
    collections,
    selectedCollectionId,
    pendingReference,
    clearPendingReference,
  } = useAppState()
  const [segments, setSegments] = useState<MessageSegment[]>([])
  const [scopePaperIds, setScopePaperIds] = useState<string[]>([])
  const [scopeArtifactIds, setScopeArtifactIds] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [active, setActive] = useState(0)
  /** The + button hands the agent material rather than naming it in a sentence. */
  const [pinning, setPinning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const stub = useStub()

  // "Reference" on a thread and "Ask" on a paper hand their subject here, so
  // the two entry points land in the same place the @ picker would.
  useEffect(() => {
    if (!pendingReference) return
    if (pendingReference.kind === 'thread') {
      setSegments((prev) =>
        prev.some(
          (s) =>
            typeof s === 'object' && 'threadRefId' in s && s.threadRefId === pendingReference.id,
        )
          ? prev
          : [...prev, { threadRefId: pendingReference.id }],
      )
    } else if (pendingReference.kind === 'artifact') {
      setScopeArtifactIds((prev) =>
        prev.includes(pendingReference.id) ? prev : [...prev, pendingReference.id],
      )
    } else {
      setScopePaperIds((prev) =>
        prev.includes(pendingReference.id) ? prev : [...prev, pendingReference.id],
      )
    }
    clearPendingReference()
    inputRef.current?.focus()
  }, [clearPendingReference, pendingReference])

  const collection = collections[selectedCollectionId]
  const match = draft.match(MENTION)
  const query = match ? match[2].toLowerCase() : null
  const hasContent =
    draft.trim() || segments.length > 0 || scopePaperIds.length > 0 || scopeArtifactIds.length > 0

  const threadOptions = (collection?.threadIds ?? [])
    .map((id) => threads[id])
    .filter((t) => t && (!query || t.title.toLowerCase().includes(query)))
  const paperOptions = (collection?.paperIds ?? [])
    .map((id) => papers[id])
    .filter((p) => p && (!query || p.title.toLowerCase().includes(query)))
  const artifactOptions = (collection?.artifactIds ?? [])
    .map((id) => artifacts[id])
    .filter((a) => a && (!query || a.title.toLowerCase().includes(query)))

  const options = [
    ...threadOptions.map((t) => ({ kind: 'thread' as const, id: t.id })),
    ...paperOptions.map((p) => ({ kind: 'paper' as const, id: p.id })),
    ...artifactOptions.map((a) => ({ kind: 'artifact' as const, id: a.id })),
  ]
  const open = (query !== null || pinning) && options.length > 0

  // Keep the highlight in range as you type, and visible as you arrow past the
  // fold — a picker you can only use with the mouse is not a picker.
  useEffect(() => setActive(0), [query])
  useEffect(() => {
    pickerRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function textBeforeMention() {
    return match ? draft.slice(0, draft.length - match[0].length + match[1].length) : draft
  }

  function pickThread(threadId: string) {
    if (pinning) {
      setSegments((prev) => [...prev, { threadRefId: threadId }])
      setPinning(false)
      inputRef.current?.focus()
      return
    }
    const before = textBeforeMention()
    setSegments((prev) => [...prev, ...(before.trim() ? [before] : []), { threadRefId: threadId }])
    setDraft('')
    inputRef.current?.focus()
  }

  function pickPaper(paperId: string) {
    if (pinning) {
      setScopePaperIds((prev) => (prev.includes(paperId) ? prev : [...prev, paperId]))
      setPinning(false)
      inputRef.current?.focus()
      return
    }
    const before = textBeforeMention()
    setSegments((prev) => [...prev, ...(before.trim() ? [before] : []), { citePaperId: paperId }])
    setDraft('')
    inputRef.current?.focus()
  }

  function pickArtifact(artifactId: string) {
    if (pinning) {
      setScopeArtifactIds((prev) => (prev.includes(artifactId) ? prev : [...prev, artifactId]))
      setPinning(false)
      inputRef.current?.focus()
      return
    }
    const before = textBeforeMention()
    setSegments((prev) => [
      ...prev,
      ...(before.trim() ? [before] : []),
      { artifactRefId: artifactId },
    ])
    setDraft('')
    inputRef.current?.focus()
  }

  function submit() {
    const final = draft.trim() ? [...segments, draft] : segments
    if (final.length === 0 && scopePaperIds.length === 0 && scopeArtifactIds.length === 0) return
    onSubmit(final, scopePaperIds, scopeArtifactIds)
    setSegments([])
    setScopePaperIds([])
    setScopeArtifactIds([])
    setDraft('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const step = event.key === 'ArrowDown' ? 1 : -1
        setActive((i) => (i + step + options.length) % options.length)
        return
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        const choice = options[active]
        if (choice.kind === 'thread') pickThread(choice.id)
        else if (choice.kind === 'artifact') pickArtifact(choice.id)
        else pickPaper(choice.id)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        if (pinning) setPinning(false)
        else setDraft(textBeforeMention())
        return
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      submit()
    } else if (event.key === 'Backspace' && draft === '' && segments.length > 0) {
      setSegments((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="relative">
      {open && (
        <div
          ref={pickerRef}
          role="listbox"
          onMouseLeave={() => pinning && setPinning(false)}
          className="absolute bottom-[calc(100%+8px)] left-0 z-20 max-h-72 w-[420px] max-w-full overflow-y-auto rounded-[14px] border border-line bg-panel shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18)]">
          {pinning && (
            <div className="border-b border-hairline px-3 py-2">
              <div className="label text-muted">Add as context</div>
              <p className="m-0 mt-0.5 text-[12px] leading-[18px] text-faint">
                Attached above your question. Type @ instead to name something in the sentence.
              </p>
            </div>
          )}
          {threadOptions.length > 0 && (
            <div className="border-b border-hairline py-1">
              <div className="label px-3 py-1.5 text-faint">Threads</div>
              {threadOptions.map((thread, i) => (
                <button
                  key={thread.id}
                  type="button"
                  role="option"
                  aria-selected={active === i}
                  data-active={active === i}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pickThread(thread.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink ${
                    active === i ? 'bg-rail' : ''
                  }`}
                >
                  <Icon name="chat" size={14} className="text-accent-deep" />
                  <span className="truncate">{thread.title}</span>
                </button>
              ))}
            </div>
          )}
          {artifactOptions.length > 0 && (
            <div className="border-b border-hairline py-1">
              <div className="label px-3 py-1.5 text-faint">Artifacts</div>
              {artifactOptions.map((artifact, i) => {
                const index = threadOptions.length + paperOptions.length + i
                return (
                  <button
                    key={artifact.id}
                    type="button"
                    role="option"
                    aria-selected={active === index}
                    data-active={active === index}
                    onPointerEnter={() => setActive(index)}
                    onClick={() => pickArtifact(artifact.id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink ${
                      active === index ? 'bg-rail' : ''
                    }`}
                  >
                    <Icon name="fileText" size={14} className="text-muted" />
                    <span className="truncate">{artifact.title}</span>
                  </button>
                )
              })}
            </div>
          )}
          {paperOptions.length > 0 && (
            <div className="py-1">
              <div className="label px-3 py-1.5 text-faint">Items</div>
              {paperOptions.map((paper, i) => (
                <button
                  key={paper.id}
                  type="button"
                  role="option"
                  aria-selected={active === threadOptions.length + i}
                  data-active={active === threadOptions.length + i}
                  onPointerEnter={() => setActive(threadOptions.length + i)}
                  onClick={() => pickPaper(paper.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink ${
                    active === threadOptions.length + i ? 'bg-rail' : ''
                  }`}
                >
                  <Icon name="bookmark" size={14} className="text-muted" />
                  <span className="truncate">{paper.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-[20px] border border-line bg-panel/95 px-3 pb-2 pt-3 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] backdrop-blur-[8px]">
        <div className={`flex flex-wrap items-center gap-1.5 ${hideScope && scopePaperIds.length === 0 && scopeArtifactIds.length === 0 ? 'hidden' : ''}`}>
          {!hideScope && (scopeLabel ?? collection) && (
            <ScopeChip
              icon={<Icon name="folder" size={14} />}
              label={scopeLabel ?? collection.name}
            />
          )}
          {scopePaperIds.map((id) => (
            <ScopeChip
              key={id}
              icon={<Icon name="bookmark" size={14} />}
              label={papers[id]?.title ?? id}
              onRemove={() => setScopePaperIds((prev) => prev.filter((p) => p !== id))}
            />
          ))}
          {scopeArtifactIds.map((id) => (
            <ScopeChip
              key={id}
              icon={<Icon name="fileText" size={14} />}
              label={artifacts[id]?.title ?? id}
              onRemove={() => setScopeArtifactIds((prev) => prev.filter((a) => a !== id))}
            />
          ))}
        </div>

        <div className="flex min-h-8 flex-wrap items-center gap-1 text-[16px] leading-[24px]">
          {segments.map(renderSegment)}
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={segments.length === 0 ? `${placeholder} — type @ to reference` : ''}
            className="min-w-[180px] flex-1 bg-transparent text-ink placeholder:text-faint focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn size-9 px-0 ${pinning ? 'bg-fill' : ''}`}
              aria-label="Add context"
              aria-expanded={pinning}
              title="Attach an item, thread or artifact as context"
              onClick={() => {
                setPinning((v) => !v)
                setActive(0)
              }}
            >
              <Icon name="plus" size={20} />
            </button>
            <button
              type="button"
              className="btn"
              onClick={(e) => stub(e, 'Choose which corpus to search')}
            >
              <Icon name="clip" size={16} />
              <span className="hidden @[420px]:inline">Corpus</span>
              <Icon name="chevronDown" size={14} />
            </button>
            <span className="hidden items-center gap-2 rounded-[12px] border border-dashed border-line px-3 py-2 text-[15.04px] font-medium text-faint @[560px]:inline-flex">
              Deep <Icon name="plus" size={14} />
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn-sm border-transparent bg-transparent text-muted"
              onClick={(e) => stub(e, 'Filter by year, study type, journal')}
            >
              <Icon name="filter" size={16} />
              <span className="hidden @[420px]:inline">Filter</span>
            </button>
            <button
              type="button"
              className="icon-btn size-9"
              aria-label="Voice"
              onClick={(e) => stub(e, 'Dictate your question')}
            >
              <Icon name="mic" size={16} />
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!hasContent}
              aria-label="Send"
              className="btn-accent size-9 px-0 disabled:opacity-50"
            >
              <Icon name="arrowUp" size={18} />
            </button>
          </div>
        </div>
      </div>

      {scopeArtifactIds.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <Badge fill="var(--color-amber-wash)" ink="var(--color-amber)">
            Edits artifact
          </Badge>
          <span className="text-[12.96px] leading-[20px] text-muted">
            Changes land on the artifact for review, and are recorded in its log.
          </span>
        </div>
      )}

      {segments.some((s) => typeof s === 'object' && 'threadRefId' in s) && (
        <div className="mt-2 flex items-center gap-2">
          <Badge fill="var(--color-accent-wash)" ink="var(--color-accent-deep)">
            Cross-thread
          </Badge>
          <span className="text-[12.96px] leading-[20px] text-muted">
            This question will read the referenced threads.
          </span>
        </div>
      )}
    </div>
  )
}
