import { useRef } from 'react'
import { useAppState } from '../../state/AppState'
import { RailToggle } from '../RailToggle'
import { Icon } from '../icons'
import { useStub } from '../StubHint'
import { ArtifactDoc } from './ArtifactDoc'
import { ArtifactPanel } from './ArtifactPanel'
import { PaperDetailPanel } from '../PaperDetailPanel'

/**
 * The artifact, full width — the same geometry as every other view: the object
 * in the main column, its other half in the panel (D27).
 */
export function ArtifactView() {
  const { artifacts, collections, activeArtifactId, openCollection, setArtifactTab, renameArtifact } =
    useAppState()
  const stub = useStub()

  const artifact = activeArtifactId ? artifacts[activeArtifactId] : null
  if (!artifact) return null

  const collection = collections[artifact.collectionId]

  return (
    <div className="flex min-w-0 flex-1">
      <div className="@container relative flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
          <div className="flex min-w-0 items-center gap-2">
            <RailToggle />
            <button
              type="button"
              onClick={() => openCollection(artifact.collectionId)}
              className="icon-btn size-8"
              aria-label={`Back to ${collection?.name ?? 'collection'}`}
              title={`Back to ${collection?.name ?? 'collection'}`}
            >
              <Icon name="arrowLeft" size={16} />
            </button>
            <EditableTitle
              key={artifact.id}
              title={artifact.title}
              onCommit={(next) => renameArtifact(artifact.id, next)}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* The one fact worth stating, and a door rather than a label. */}
            <button
              type="button"
              onClick={() => setArtifactTab('history')}
              title="See what changed, and undo it"
              className="hidden items-center gap-1.5 text-[12.96px] leading-[20px] text-muted hover:text-ink @[600px]:inline-flex"
            >
              <Icon name="history" size={14} />
              {artifact.updated}
            </button>
            <button
              type="button"
              className="btn-sm"
              aria-label="Export"
              onClick={(e) => stub(e, 'Export to Word, LaTeX or Markdown')}
            >
              <Icon name="external" size={14} />
              <span className="hidden @[520px]:inline">Export</span>
            </button>
            <button
              type="button"
              className="btn-sm"
              aria-label="Share"
              onClick={(e) => stub(e, 'Share this artifact with collaborators')}
            >
              <Icon name="share" size={14} />
              <span className="hidden @[520px]:inline">Share</span>
            </button>
          </div>
        </header>

        <div className="scroll-y">
          <ArtifactDoc artifactId={artifact.id} />
        </div>
      </div>

      <PaperDetailPanel />
      <ArtifactPanel artifactId={artifact.id} />
    </div>
  )
}

/**
 * The title is the document's, so it is edited on the document — not in a
 * dialog. Enter commits, Escape puts back what was there.
 */
function EditableTitle({ title, onCommit }: { title: string; onCommit: (next: string) => void }) {
  const ref = useRef<HTMLHeadingElement>(null)

  return (
    <h1
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Artifact title"
      spellCheck={false}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.currentTarget.blur()
        }
        if (event.key === 'Escape') {
          event.currentTarget.textContent = title
          event.currentTarget.blur()
        }
      }}
      onBlur={(event) => {
        const next = event.currentTarget.textContent?.trim() ?? ''
        if (next && next !== title) onCommit(next)
        else event.currentTarget.textContent = title
      }}
      className="-mx-1.5 min-w-[4ch] max-w-full truncate rounded-[6px] px-1.5 text-[16px]
        font-medium leading-[24px] text-ink outline-none hover:bg-fill focus:bg-rail
        focus:text-clip"
    >
      {title}
    </h1>
  )
}
