import { useState } from 'react'
import { useAppState } from '../../state/AppState'
import { citedInArtifact, outlineOf, plural, threadsInArtifact } from '../../data/mock'
import type { OpenObject } from '../../state/AppState'
import { Badge, ThreadChip } from '../chips'
import { Icon } from '../icons'
import { renderSegment } from '../ThreadView'
import { useStub } from '../StubHint'
import { ProvenancePopover } from '../ProvenancePopover'
import { paperIdsOf } from '../../data/mock'

const PAPER_TABS = ['Overview', 'Snapshot', 'Attachment', 'Metadata'] as const
type PaperTab = (typeof PAPER_TABS)[number]

/**
 * The Paper panel, following the DM6-0 artboard and the live product. The
 * artboard's own tab row has no height — the title collides with it — so the
 * spacing is reconciled against prod: a 40px row with a hairline beneath and
 * the tabs on the same left edge as the title.
 */
function PaperDetail({ paperId }: { paperId: string }) {
  const { papers, threads, collections, selectedCollectionId, referenceInComposer, openSavePopover } =
    useAppState()
  const stub = useStub()
  const [tab, setTab] = useState<PaperTab>('Overview')
  const paper = papers[paperId]
  if (!paper) return null

  const appearsIn = collections[selectedCollectionId].threadIds.filter((id) =>
    paperIdsOf(threads[id] ?? { sources: [] } as never).includes(paperId),
  )

  return (
    <article className="flex min-h-full flex-col">
      <header className="flex items-center gap-2 px-4 pt-3">
        <span className="text-[15.04px] font-medium leading-[23px] text-ink">Paper</span>
      </header>

      <div className="mt-2 flex gap-6 overflow-x-auto border-b border-line px-4">
        {PAPER_TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            aria-current={tab === name}
            className={`-mb-px h-10 shrink-0 border-b-[3px] text-[15.04px] font-medium leading-6 ${
              tab === name ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pb-5 pt-3">
        {tab === 'Overview' && (
          <>
            <h3 className="m-0 mb-1.5 text-[18px] font-medium leading-[26px] text-ink">
              {paper.title}
            </h3>
            <p className="m-0 mb-3 text-[12.96px] leading-[20px] text-muted">
              <span className="font-medium text-ink">{paper.year}</span> · {paper.authors.join(', ')}
            </p>

            <div className="flex flex-wrap gap-5 py-1">
              <Stat value={paper.journal} label="Journal" />
              <Stat value={String(paper.citationCount)} label="Citations" />
              <Stat value={String(paper.influential)} label="Influential" />
            </div>

            <div className="flex flex-wrap items-center gap-2 py-3">
              <span className="label text-faint">DOI</span>
              <span className="text-[12.96px] leading-[20px] text-muted">{paper.doi}</span>
            </div>

            <div className="mb-1 flex flex-wrap items-center gap-2 border-b border-hairline pb-3">
              <Badge fill="var(--color-fill)" ink="var(--color-muted)">
                Indexed
              </Badge>
              {paper.hasPdf && (
                <Badge fill="var(--color-fill)" ink="var(--color-muted)">
                  Full text
                </Badge>
              )}
            </div>

            {paper.abstract.map((para) => (
              <p key={para.head} className="mt-3 text-[12.96px] leading-[20px] text-muted">
                <span className="font-medium text-ink">{para.head}:</span> {para.text}
              </p>
            ))}

            {appearsIn.length > 0 && (
              <div className="mt-4 border-t border-hairline pt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="panel-heading">Where it came up</span>
                  <ProvenancePopover paperId={paper.id} threadIds={appearsIn}>
                    <span className="label inline-flex items-center gap-1 rounded-[8px] bg-fill px-1.5 py-0.5 text-muted">
                      <Icon name="search" size={11} /> Provenance
                    </span>
                  </ProvenancePopover>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {appearsIn.map((id) => (
                    <ThreadChip key={id} threadId={id} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'Snapshot' && (
          <>
            <span className="panel-heading">Key takeaway</span>
            <p className="mb-4 mt-1.5 text-[15px] leading-[23px] text-ink">{paper.keyTakeaway}</p>
            <div className="border-t border-hairline pt-3">
              <span className="panel-heading">Where it came up</span>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {appearsIn.map((id) => (
                  <ThreadChip key={id} threadId={id} />
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'Attachment' && (
          <div className="flex items-center justify-between gap-3 rounded-[12px] border border-line p-3">
            <div className="flex min-w-0 items-center gap-2">
              <Icon name="file" size={20} className="text-muted" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[15px] font-medium leading-[23px] text-ink">
                  {paper.hasPdf ? 'Full text PDF' : 'No attachment'}
                </span>
                <span className="text-[12.96px] leading-[20px] text-muted">
                  {paper.hasPdf ? `Open access · via ${paper.journal}` : 'Not available for this item'}
                </span>
              </div>
            </div>
            {paper.hasPdf && (
              <button
                type="button"
                className="btn-sm"
                onClick={(e) => stub(e, 'Open the full-text PDF')}
              >
                Open
              </button>
            )}
          </div>
        )}

        {tab === 'Metadata' && (
          <dl className="m-0">
            {[
              ['Journal', paper.journal],
              ['Year', String(paper.year)],
              ['Type', paper.type],
              ['Authors', paper.authors.join(', ')],
              ['DOI', paper.doi],
              ['Added', paper.addedAt ?? 'Not saved'],
            ].map(([name, value]) => (
              <div key={name} className="flex items-start gap-3 border-b border-hairline py-2">
                <dt className="label w-[74px] shrink-0 text-faint">{name}</dt>
                <dd className="m-0 text-[12.96px] leading-[20px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <footer className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-panel px-4 py-2.5">
        {/* Ask pins the paper as composer scope — the same place the @ picker
            would put it, so both entry points behave alike. */}
        <button
          type="button"
          className="btn-accent h-8 rounded-[10px] px-3 text-[13px]"
          onClick={() => referenceInComposer({ kind: 'paper', id: paper.id })}
        >
          <Icon name="chat" size={15} /> Ask
        </button>
        <button type="button" className="btn-sm" onClick={(event) => openSavePopover(paper.id, event.currentTarget)}>
          <Icon name="bookmark" size={14} /> Save
        </button>
        <span className="flex items-center gap-0.5">
          <button
            type="button"
            className="icon-btn"
            aria-label="Citation graph"
            onClick={(e) => stub(e, 'Open this paper in the citation graph')}
          >
            <Icon name="citationGraph" size={15} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Cite"
            onClick={(e) => stub(e, 'Copy a formatted citation')}
          >
            <Icon name="quote" size={15} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Copy link"
            onClick={(e) => stub(e, 'Copy a link to this paper')}
          >
            <Icon name="clip" size={15} />
          </button>
        </span>
        {paper.hasPdf && (
          <button
            type="button"
            className="btn-sm ml-auto"
            onClick={(e) => stub(e, 'Open the full-text PDF')}
          >
            PDF <Icon name="external" size={13} />
          </button>
        )}
      </footer>
    </article>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[15.04px] font-medium leading-[23px] text-ink">{value}</span>
      <span className="label text-faint">{label}</span>
    </div>
  )
}

/** Threads can be opened in the panel too — the product cannot do this yet. */
function ThreadDetail({ threadId }: { threadId: string }) {
  const { threads, papers, openThread, referenceInComposer, openInPanel } = useAppState()
  const thread = threads[threadId]
  if (!thread) return null

  const answer = [...thread.messages].reverse().find((m) => m.role === 'assistant')

  return (
    <article className="flex min-h-full flex-col">
      <header className="flex items-center gap-2 px-4 pt-3">
        <Icon name="chat" size={15} className="text-muted" />
        <span className="panel-heading">Thread</span>
      </header>

      <div className="flex-1 px-4 pb-5 pt-2">
        <h3 className="m-0 mb-1 text-[16px] font-medium leading-[24px] text-ink">{thread.title}</h3>
        <p className="m-0 mb-3 text-[12.96px] leading-[20px] text-muted">
          {plural(thread.messages.length, 'message')} · updated {thread.updated}
        </p>

        {answer && (
          <p className="m-0 mb-4 text-[15px] leading-[23px] text-ink">
            {answer.content.map(renderSegment)}
          </p>
        )}

        <div className="border-t border-hairline pt-3">
          <span className="panel-heading">Sources in this thread</span>
          {paperIdsOf(thread).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => openInPanel({ kind: 'paper', id })}
              className="flex w-full items-start gap-2 py-1.5 text-left hover:text-ink"
            >
              <Icon name="bookmark" size={14} className="mt-0.5 text-faint" />
              <span className="text-[12.96px] leading-[20px] text-muted hover:text-ink">
                {papers[id]?.title}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3">
          <button type="button" className="btn-sm" onClick={() => openThread(threadId)}>
            <Icon name="expand" size={14} /> Open thread
          </button>
          {/* §1 — drops this thread into the collection composer as an inline
              reference, ready to be asked across. */}
          <button
            type="button"
            className="btn-sm"
            onClick={() => referenceInComposer({ kind: 'thread', id: threadId })}
          >
            <Icon name="quote" size={14} /> Reference
          </button>
        </div>
      </div>
    </article>
  )
}

/** Artifacts — the next collection-level primitive (D12). */
function ArtifactDetail({ artifactId }: { artifactId: string }) {
  const { artifacts, openArtifact } = useAppState()
  const artifact = artifacts[artifactId]
  if (!artifact) return null

  return (
    <article className="flex min-h-full flex-col">
      <header className="flex items-center gap-2 px-4 pt-3">
        <Icon name="file" size={15} className="text-muted" />
        <span className="panel-heading">Artifact</span>
      </header>

      <div className="flex-1 px-4 pb-5 pt-2">
        <h3 className="m-0 mb-2 text-[16px] font-medium leading-[24px] text-ink">
          {artifact.title}
        </h3>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="label text-faint">
            {plural(citedInArtifact(artifact).length, 'source')} ·{' '}
            {plural(threadsInArtifact(artifact).length, 'thread')} · {artifact.updated}
          </span>
        </div>

        <div className="border-t border-hairline pt-3">
          <span className="panel-heading">Outline</span>
          {outlineOf(artifact).map((row, i) => {
            const body = artifact.blocks[artifact.blocks.indexOf(row) + 1]
            return (
              <div key={i} className="flex items-center justify-between gap-3 py-1.5">
                <span className="truncate text-[12.96px] leading-[20px] text-ink">
                  {row.content.map((seg) => (typeof seg === 'string' ? seg : '')).join('')}
                </span>
                {body?.placeholder && (
                  <span className="label shrink-0 text-faint">Not drafted</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3">
          <button type="button" className="btn-sm" onClick={() => openArtifact(artifact.id)}>
            <Icon name="expand" size={14} /> Open artifact
          </button>
        </div>
      </div>
    </article>
  )
}

export function ObjectDetail({ object }: { object: OpenObject }) {
  if (object.kind === 'paper') return <PaperDetail paperId={object.id} />
  if (object.kind === 'thread') return <ThreadDetail threadId={object.id} />
  return <ArtifactDetail artifactId={object.id} />
}

export const objectLabel: Record<OpenObject['kind'], string> = {
  paper: 'Paper',
  thread: 'Thread',
  artifact: 'Artifact',
}
