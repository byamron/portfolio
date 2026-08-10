import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAppState, type PanelView } from '../../state/AppState'
import { Icon, type IconName } from '../icons'
import { SuggestedView, SurfacedView } from './views'
import { CitationGraphView } from './CitationGraphView'
import { ObjectDetail, objectLabel } from './details'
import { useIsMobile } from '../../hooks/useIsMobile'

/** The tab an opened object gets — its own icon, and its own name. */
const OBJECT_ICON: Record<'paper' | 'thread' | 'artifact', IconName> = {
  paper: 'file',
  thread: 'chat',
  artifact: 'fileText',
}

const DEFAULT_WIDTH = 400
const MIN_WIDTH = 300
const MAX_WIDTH = 720
const DETENT = 14
/** The rail is 208px; leave the collection column at least this much. */
const MIN_MAIN = 320
const ceiling = () => Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, window.innerWidth - 208 - MIN_MAIN))

const VIEWS: { key: PanelView; label: string; icon: IconName }[] = [
  { key: 'surfaced', label: 'Read', icon: 'sparkle' },
  { key: 'suggested', label: 'Explore', icon: 'chat' },
  { key: 'graph', label: 'Citation Graph', icon: 'citationGraph' },
]

function viewBody(key: PanelView): ReactNode {
  if (key === 'surfaced') return <SurfacedView />
  if (key === 'suggested') return <SuggestedView />
  return <CitationGraphView />
}

/**
 * The collection's side panel. It holds only what the tabs do not — Items and
 * Artifacts are tabs, instructions sit above them — so nothing appears twice.
 * What is left is the three things the system is telling you about your
 * collection, plus whatever object you have opened.
 */
export function ProjectPanel() {
  const {
    panelOpen,
    panelView,
    setPanelView,
    setPanelOpen,
    openObject,
    objectFocused,
    focusObject,
    closeOpenObject,
    papers,
    threads,
    artifacts,
  } = useAppState()

  // The tab carries the object's own name, truncated, with the full title on
  // hover — "Thread" told you the kind, which the icon already does.
  const objectName = !openObject
    ? null
    : (openObject.kind === 'paper'
        ? papers[openObject.id]?.title
        : openObject.kind === 'thread'
          ? threads[openObject.id]?.title
          : artifacts[openObject.id]?.title) ?? objectLabel[openObject.kind]

  const isMobile = useIsMobile()
  /**
   * The width you asked for, and the width there is room for. Keeping them
   * apart matters: a narrow window used to overwrite the chosen width, so the
   * panel came back at the minimum on a wide screen long after the squeeze
   * that caused it — narrow enough for the paper footer to wrap at its default.
   */
  const [preferredWidth, setPreferredWidth] = useState(DEFAULT_WIDTH)
  const [available, setAvailable] = useState(ceiling)
  const width = Math.min(preferredWidth, available)
  const [snapped, setSnapped] = useState(false)
  const [resizing, setResizing] = useState(false)
  const panelRef = useRef<HTMLElement>(null)

  /** Drag the left edge; the default width is a detent so it can be found again. */
  const onPointerDown = useCallback((event: React.PointerEvent) => {
    const right = panelRef.current?.getBoundingClientRect().right ?? 0
    setResizing(true)
    event.preventDefault()

    const move = (e: PointerEvent) => {
      let next = right - e.clientX
      const onDetent = Math.abs(next - DEFAULT_WIDTH) < DETENT
      if (onDetent) next = DEFAULT_WIDTH
      setSnapped(onDetent)
      setPreferredWidth(Math.round(Math.min(ceiling(), Math.max(MIN_WIDTH, next))))
    }
    const up = () => {
      setResizing(false)
      setSnapped(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }, [])

  // The shell tracks the window exactly, so the panel — not the page — is what
  // gives when the window narrows. Without this it would push the layout wider
  // than the viewport and strand the panel past the right edge.
  useEffect(() => {
    const measure = () => setAvailable(ceiling())
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Dragging over text selects it otherwise, which is what leaves the panel
  // highlighted blue when you let go.
  useEffect(() => {
    document.body.style.cursor = resizing ? 'col-resize' : ''
    document.body.style.userSelect = resizing ? 'none' : ''
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [resizing])

  // Stays mounted when closed so it can slide, and so reopening returns you to
  // the tab you left. `inert` keeps the hidden content out of the tab order.
  return (
    <aside
      ref={panelRef}
      style={isMobile ? undefined : { width: panelOpen ? width : 0 }}
      inert={!panelOpen}
      aria-hidden={!panelOpen}
      className={
        isMobile
          ? `fixed inset-0 z-50 flex flex-col bg-panel transition-transform duration-300
             ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
               panelOpen ? 'translate-x-0' : 'translate-x-full'
             }`
          : `relative h-full shrink-0 overflow-hidden bg-panel ${
              // The easing belongs to opening and closing. Left on during a drag
              // it animates towards each new width in turn, so the edge eases
              // after the cursor instead of tracking it.
              resizing
                ? ''
                : `transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                   motion-reduce:transition-none`
            } ${panelOpen ? 'border-l border-line' : ''}`
      }
      aria-label="Project panel"
    >
      {/* Pinned to the panel's width so the contents slide in rather than
          reflowing as it opens — but not while dragging, where holding the old
          width is what pushes them off the edge. Then they simply fill it. */}
      <div
        style={isMobile || resizing ? undefined : { width }}
        className="flex h-full w-full flex-col"
      >
      {!isMobile && (
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize project panel"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 48 : 16
          if (event.key === 'ArrowLeft') setPreferredWidth((w) => Math.min(ceiling(), w + step))
          else if (event.key === 'ArrowRight') setPreferredWidth((w) => Math.max(MIN_WIDTH, w - step))
          else if (event.key === 'Home') setPreferredWidth(DEFAULT_WIDTH)
          else return
          event.preventDefault()
        }}
        className="absolute inset-y-0 -left-[3px] z-10 w-[9px] cursor-col-resize"
      >
        <span
          className={`absolute inset-y-0 left-[3px] w-[3px] transition-colors ${
            resizing ? 'bg-line-strong' : 'bg-transparent hover:bg-line-strong'
          }`}
        />
        <span
          className={`absolute left-[3px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-[2px] bg-ink transition-all ${
            snapped ? 'opacity-100' : resizing ? 'opacity-25' : 'opacity-0'
          }`}
        />
      </div>
      )}

      <header className="flex min-h-16 shrink-0 items-stretch justify-between gap-2 border-b border-line pl-1 pr-2">
        <div className="flex min-w-0 gap-0.5 overflow-x-auto [scrollbar-width:none]">
          {/* First, not last: what you just opened is what you are looking at. */}
          {openObject && objectName && (
            <PanelTab
              icon={OBJECT_ICON[openObject.kind]}
              label={objectName}
              title={objectName}
              active={objectFocused}
              onClick={focusObject}
              onClose={closeOpenObject}
            />
          )}
          {VIEWS.map((view) => (
            <PanelTab
              key={view.key}
              icon={view.icon}
              label={view.label}
              active={!objectFocused && panelView === view.key}
              onClick={() => setPanelView(view.key)}
            />
          ))}
        </div>
        <div className="flex shrink-0 items-center self-center">
          <button
            type="button"
            className="icon-btn"
            aria-label="Close panel"
            title="Close panel"
            onClick={() => setPanelOpen(false)}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      </header>

      {/* The graph owns its own viewport; every other view scrolls. */}
      {openObject && objectFocused ? (
        <div className="scroll-y">
          <ObjectDetail object={openObject} />
        </div>
      ) : panelView === 'graph' ? (
        viewBody(panelView)
      ) : (
        <div className="scroll-y">{viewBody(panelView)}</div>
      )}
      </div>
    </aside>
  )
}

function PanelTab({
  icon,
  label,
  title,
  active,
  onClick,
  onClose,
}: {
  icon: IconName
  label: string
  title?: string
  active: boolean
  onClick: () => void
  onClose?: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)

  // At 300px the row scrolls; the tab you just switched to must be the one you
  // can see.
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      title={title}
      aria-current={active}
      className={`-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-2 text-[13px] font-medium leading-5 ${
        active ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
      }`}
    >
      <Icon name={icon} size={16} />
      <span className="max-w-28 truncate">{label}</span>
      {onClose && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Close"
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onClose()
          }}
          className="ml-0.5 flex size-4 items-center justify-center rounded-[5px] opacity-60 hover:bg-line hover:opacity-100"
        >
          <Icon name="close" size={12} />
        </span>
      )}
    </button>
  )
}
