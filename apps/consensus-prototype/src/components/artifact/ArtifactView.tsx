import { useAppState } from '../../state/AppState'
import { Badge } from '../chips'
import { Icon } from '../icons'
import { useStub } from '../StubHint'
import { ArtifactDoc } from './ArtifactDoc'
import { ArtifactPanel } from './ArtifactPanel'

/**
 * The artifact, full width — the same geometry as every other view: the object
 * in the main column, its other half in the panel (D27).
 */
export function ArtifactView() {
  const { artifacts, collections, activeArtifactId, openCollection, setArtifactTab } = useAppState()
  const stub = useStub()

  const artifact = activeArtifactId ? artifacts[activeArtifactId] : null
  if (!artifact) return null

  const collection = collections[artifact.collectionId]

  return (
    <div className="flex min-w-0 flex-1">
      <div className="@container relative flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => openCollection(artifact.collectionId)}
              className="icon-btn size-8"
              aria-label={`Back to ${collection?.name ?? 'collection'}`}
              title={`Back to ${collection?.name ?? 'collection'}`}
            >
              <Icon name="arrowLeft" size={16} />
            </button>
            <h1 className="truncate text-[16px] font-medium leading-[24px] text-ink">
              {artifact.title}
            </h1>
            <Badge fill="var(--color-fill)" ink="var(--color-muted)">
              {artifact.kind}
            </Badge>
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

      <ArtifactPanel artifactId={artifact.id} />
    </div>
  )
}
