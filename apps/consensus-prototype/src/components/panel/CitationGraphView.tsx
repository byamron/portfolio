import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useAppState } from '../../state/AppState'
import { papers, plural, surfacedFor } from '../../data/mock'
import {
  clusterById,
  clusters,
  graphForPapers,
  isSeed,
  neighbours,
  nodeById,
  radiusOf,
  UNCLUSTERED_INK,
  type GraphNode,
} from '../../data/graph'
import { Icon } from '../icons'
import { useIsMobile } from '../../hooks/useIsMobile'
import { PanelEmpty } from './views'

const MIN_ZOOM = 0.25
const MAX_ZOOM = 3.2
/** Below this the field is too dense for every label to be legible at once. */
const LABEL_ZOOM = 0.58
/** How many of the most-cited papers stay labelled at any zoom, for orientation. */
const ALWAYS_LABELLED = 6

interface Transform {
  k: number
  tx: number
  ty: number
}

/**
 * The collection's citation graph, as the product draws it: time on the x axis,
 * influence as area, clusters as hue. A cluster's seed paper is solid; its
 * members share the hue at low saturation; everything unclustered is the
 * "more details" tier the Density control hides.
 *
 * Built to survive a 300px panel. Edges are drawn in an SVG layer and nodes as
 * positioned elements, so labels and hit targets stay a constant size however
 * far you zoom — the alternative, scaling one SVG, gives you 4px type at fit
 * width.
 */
export function CitationGraphView() {
  const {
    openInPanel,
    referenceInComposer,
    collections,
    threads,
    selectedCollectionId,
    setCollectionTab,
    setPanelView,
  } = useAppState()

  const collection = collections[selectedCollectionId]
  const { nodes: scopedNodes, edges: scopedEdges } = useMemo(() => {
    const saved = collection?.paperIds ?? []
    const surfaced = surfacedFor(collection, threads).map((row) => row.paper.id)
    return graphForPapers([...saved, ...surfaced])
  }, [collection, threads])

  const frameRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [transform, setTransform] = useState<Transform>({ k: 1, tx: 0, ty: 0 })
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [dense, setDense] = useState(false)
  const [isolated, setIsolated] = useState<string | null>(null)
  const isMobile = useIsMobile()
  // On a phone the legend would take a third of the canvas, so it starts as a
  // pill — the product's own treatment.
  const [legendOpen, setLegendOpen] = useState(!isMobile)
  const [panning, setPanning] = useState(false)

  const visibleNodes = useMemo(
    () =>
      scopedNodes.filter((node) => {
        if (!dense && node.clusterId === null) return false
        if (isolated === null) return true
        return isolated === 'none' ? node.clusterId === null : node.clusterId === isolated
      }),
    [dense, isolated, scopedNodes],
  )

  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes])
  /** Landmarks: enough labels to orient by without the field turning to type. */
  const landmarks = useMemo(
    () =>
      new Set(
        [...visibleNodes]
          .sort((a, b) => b.citations - a.citations)
          .slice(0, ALWAYS_LABELLED)
          .map((n) => n.id),
      ),
    [visibleNodes],
  )
  const visibleEdges = useMemo(
    () => scopedEdges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [scopedEdges, visibleIds],
  )

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height },
      )
    })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  const rawBox = useMemo(() => {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const node of visibleNodes) {
      const r = radiusOf(node)
      minX = Math.min(minX, node.x - r)
      maxX = Math.max(maxX, node.x + r)
      minY = Math.min(minY, node.y - r)
      maxY = Math.max(maxY, node.y + r)
    }
    return { minX, maxX, minY, maxY, w: Math.max(maxX - minX, 1), h: Math.max(maxY - minY, 1) }
  }, [visibleNodes])

  /**
   * The layout is landscape; a side panel is portrait. Only the x axis carries
   * meaning (publication date), so the y axis stretches to fill the frame
   * rather than leaving two-thirds of the panel empty. Clamped at 1 so a wide
   * panel gets the layout exactly as authored.
   *
   * Held in state and rewritten only by `fit`, never derived live from the
   * frame: selecting a node changes the frame's height, and a live derivation
   * would re-flow the whole graph under the cursor you just clicked with.
   */
  const [yScale, setYScale] = useState(1)
  const worldY = useCallback((node: GraphNode) => node.y * yScale, [yScale])

  const measure = useCallback(
    (width: number, height: number) => {
      const availW = Math.max(width - 60, 1)
      const availH = Math.max(height - 140, 1)
      const ys = Math.min(3.4, Math.max(1, (availH / availW) * (rawBox.w / rawBox.h)))
      const pad = { x: 30, top: legendOpen ? 146 : 28, bottom: 46 }
      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity
      for (const node of visibleNodes) {
        const r = radiusOf(node)
        minX = Math.min(minX, node.x - r)
        maxX = Math.max(maxX, node.x + r)
        minY = Math.min(minY, node.y * ys - r)
        maxY = Math.max(maxY, node.y * ys + r + 20)
      }
      const boxW = Math.max(maxX - minX, 1)
      const boxH = Math.max(maxY - minY, 1)
      const k = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          Math.min((width - pad.x * 2) / boxW, (height - pad.top - pad.bottom) / boxH),
        ),
      )
      return {
        ys,
        transform: {
          k,
          tx: (width - boxW * k) / 2 - minX * k,
          ty: pad.top + (height - pad.top - pad.bottom - boxH * k) / 2 - minY * k,
        },
      }
    },
    [legendOpen, rawBox.h, rawBox.w, visibleNodes],
  )

  /** Frame the visible nodes, label gutter and legend band included. */
  const fit = useCallback(() => {
    if (!size.width || !size.height || visibleNodes.length === 0) return
    const { ys, transform: next } = measure(size.width, size.height)
    setYScale(ys)
    setTransform(next)
  }, [measure, size.height, size.width, visibleNodes.length])

  /**
   * Refit on the things that genuinely invalidate the framing — first measure,
   * a change of visible set, the legend band opening — and on width, since that
   * is what resizing the panel changes. Never on height alone: that is the
   * selection card opening, and the graph must not move when you click a node.
   */
  const lastFit = useRef({ width: 0, nodes: visibleNodes, legendOpen })
  useEffect(() => {
    if (!size.width || !size.height) return
    const last = lastFit.current
    if (last.width === size.width && last.nodes === visibleNodes && last.legendOpen === legendOpen) {
      return
    }
    lastFit.current = { width: size.width, nodes: visibleNodes, legendOpen }
    fit()
  }, [fit, legendOpen, size.height, size.width, visibleNodes])

  const zoomAbout = useCallback(
    (factor: number, px: number, py: number) => {
      setTransform((prev) => {
        const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.k * factor))
        const scale = k / prev.k
        return { k, tx: px - (px - prev.tx) * scale, ty: py - (py - prev.ty) * scale }
      })
    },
    [],
  )

  // React attaches wheel passively, which forbids preventDefault; bind it here
  // so zooming the graph does not also scroll the panel.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const handler = (event: WheelEvent) => {
      const rect = frame.getBoundingClientRect()
      event.preventDefault()
      // deltaMode 1 is lines, 2 is pages; normalise both to pixels first.
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1
      const delta = event.deltaY * unit
      // Pinch arrives as ctrl+wheel with its own scale, so it gets its own rate.
      zoomAbout(
        Math.exp(-delta * (event.ctrlKey ? 0.008 : 0.0042)),
        event.clientX - rect.left,
        event.clientY - rect.top,
      )
    }
    frame.addEventListener('wheel', handler, { passive: false })
    return () => frame.removeEventListener('wheel', handler)
  }, [zoomAbout])

  const transformRef = useRef(transform)
  transformRef.current = transform

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest('[data-node]')) return
    const startX = event.clientX
    const startY = event.clientY
    const origin = transformRef.current
    let moved = false
    setPanning(true)

    // One update per frame; a pointermove can fire several times per frame and
    // re-rendering 23 nodes plus 32 edges on each of them is what makes a drag
    // feel heavy.
    let frame = 0
    let pending: PointerEvent | null = null
    const apply = () => {
      frame = 0
      if (!pending) return
      setTransform({
        k: origin.k,
        tx: origin.tx + (pending.clientX - startX),
        ty: origin.ty + (pending.clientY - startY),
      })
    }
    const move = (e: PointerEvent) => {
      if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > 3) moved = true
      pending = e
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const up = () => {
      if (frame) cancelAnimationFrame(frame)
      apply()
      setPanning(false)
      if (!moved) setSelected(null)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }, [])

  useEffect(() => {
    if (!selected) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const focus = hovered ?? selected
  const active = useMemo(() => {
    if (!focus) return null
    return new Set([focus, ...(neighbours[focus] ?? [])])
  }, [focus])

  const project = (node: GraphNode) => ({
    x: node.x * transform.k + transform.tx,
    y: worldY(node) * transform.k + transform.ty,
    r: Math.max(6, radiusOf(node) * transform.k),
  })

  /**
   * Which labels actually get drawn. Zoom decides how many are eligible; a
   * greedy pass in importance order then drops any that would collide, so the
   * dense middle of the field reads as a graph rather than as overlapping type.
   */
  const labelled = (() => {
    const rank = (node: GraphNode) =>
      node.id === focus || node.id === selected ? 3 : isSeed(node) ? 2 : landmarks.has(node.id) ? 1 : 0
    const boxes: { l: number; r: number; t: number; b: number }[] = []
    const shown = new Set<string>()
    for (const node of [...visibleNodes].sort(
      (a, b) => rank(b) - rank(a) || b.citations - a.citations,
    )) {
      const pinned = node.id === focus || node.id === selected
      if (!pinned && !(rank(node) > 0 || transform.k >= LABEL_ZOOM)) continue
      const p = project(node)
      const box = { l: p.x - 56, r: p.x + 56, t: p.y + p.r + 4, b: p.y + p.r + 34 }
      if (!pinned && boxes.some((o) => box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t)) {
        continue
      }
      boxes.push(box)
      shown.add(node.id)
    }
    return shown
  })()

  const presentClusters = clusters.filter((cluster) =>
    visibleNodes.some((node) => node.clusterId === cluster.id),
  )

  const selectedNode = selected ? nodeById[selected] : null
  const selectedPaper = selectedNode?.paperId ? papers[selectedNode.paperId] : undefined

  if (scopedNodes.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <PanelEmpty
          icon="citationGraph"
          title="No citation graph yet"
          body={`The graph is built from the papers in ${collection?.name ?? 'this collection'} and the work they cite. Save a paper and it appears here.`}
        />
        <button
          type="button"
          className="btn-sm -mt-4"
          onClick={() => {
            setPanelView('surfaced')
            setCollectionTab('items')
          }}
        >
          <Icon name="sparkle" size={14} /> See surfaced sources
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-hairline px-3 py-2">
        <span className="panel-heading">Papers ({visibleNodes.length})</span>
        <span className="grow" />
        <button
          type="button"
          onClick={() => setDense((v) => !v)}
          aria-pressed={dense}
          className="btn-sm text-muted"
          title="Show or hide papers outside the named clusters"
        >
          <Icon name="density" size={14} /> Density {dense ? 'High' : 'Low'}
        </button>
        <button
          type="button"
          onClick={() => setLegendOpen((v) => !v)}
          aria-pressed={legendOpen}
          className={`icon-btn size-7 ${legendOpen ? 'bg-fill text-ink' : ''}`}
          aria-label={legendOpen ? 'Hide legend' : 'Show legend'}
        >
          <Icon name="layers" size={15} />
        </button>
      </div>

      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        className={`relative min-h-[240px] grow touch-none overflow-hidden bg-linear-to-b from-surface to-rail ${
          panning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
          {visibleEdges.map((edge) => {
            const from = nodeById[edge.from]
            const to = nodeById[edge.to]
            const a = project(from)
            const b = project(to)
            const dx = b.x - a.x
            const dy = b.y - a.y
            const len = Math.hypot(dx, dy) || 1
            const ux = dx / len
            const uy = dy / len
            const ex = b.x - ux * (b.r + 5)
            const ey = b.y - uy * (b.r + 5)
            const sx = a.x + ux * a.r
            const sy = a.y + uy * a.r
            const bow = Math.min(len * 0.12, 34)
            const cx = (sx + ex) / 2 - uy * bow
            const cy = (sy + ey) / 2 + ux * bow
            const tx = ex - cx
            const ty = ey - cy
            const tl = Math.hypot(tx, ty) || 1
            const nx = tx / tl
            const ny = ty / tl
            const lit = !active || (active.has(edge.from) && active.has(edge.to))
            return (
              <g key={`${edge.from}-${edge.to}`} opacity={lit ? 1 : 0.15}>
                <path
                  d={`M${sx} ${sy}Q${cx} ${cy} ${ex} ${ey}`}
                  fill="none"
                  stroke={lit && active ? 'var(--color-faint)' : 'var(--color-line)'}
                  strokeWidth={lit && active ? 1.4 : 1}
                />
                <path
                  d={`M${ex} ${ey}L${ex - nx * 6 - ny * 3.2} ${ey - ny * 6 + nx * 3.2}L${
                    ex - nx * 6 + ny * 3.2
                  } ${ey - ny * 6 - nx * 3.2}Z`}
                  fill="var(--color-ink)"
                  opacity={lit && active ? 0.75 : 0.35}
                />
              </g>
            )
          })}
        </svg>

        {visibleNodes.map((node) => {
          const p = project(node)
          const cluster = node.clusterId ? clusterById[node.clusterId] : null
          const seed = isSeed(node)
          const lit = !active || active.has(node.id)
          const named = seed || node.id === focus || node.id === selected
          const showLabel = labelled.has(node.id)
          return (
            <div key={node.id}>
              <button
                type="button"
                data-node
                onPointerEnter={() => setHovered(node.id)}
                onPointerLeave={() => setHovered((prev) => (prev === node.id ? null : prev))}
                onClick={() => setSelected((prev) => (prev === node.id ? null : node.id))}
                aria-label={`${node.label} · ${plural(node.citations, 'citation')}`}
                aria-pressed={selected === node.id}
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.r * 2,
                  height: p.r * 2,
                  background: seed ? cluster?.ink : cluster ? cluster.wash : '#fff',
                  borderColor: seed
                    ? cluster?.ink
                    : cluster
                      ? cluster.wash
                      : 'var(--color-line)',
                  opacity: lit ? 1 : 0.22,
                  boxShadow:
                    selected === node.id
                      ? `0 0 0 3px var(--color-rail), 0 0 0 5px ${cluster?.ink ?? UNCLUSTERED_INK}`
                      : undefined,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px]
                  transition-[opacity,box-shadow] duration-150 hover:brightness-95"
              />
              {showLabel && (
                <span
                  style={{
                    // Clamped so a label on the rim is not cut off by the panel.
                    left: Math.min(Math.max(p.x, 58), Math.max(size.width - 58, 58)),
                    top: p.y + p.r + 5,
                    opacity: lit ? 1 : 0.22,
                  }}
                  className={`pointer-events-none absolute w-[112px] -translate-x-1/2 text-center
                    text-[11.5px] leading-[15px] ${
                      named ? 'font-medium text-ink' : 'text-muted'
                    }`}
                >
                  {node.label}
                </span>
              )}
            </div>
          )
        })}

        {!legendOpen && (
          <button
            type="button"
            onClick={() => setLegendOpen(true)}
            className="absolute right-2 top-2 flex items-center gap-2 rounded-full border
              border-line bg-panel py-1.5 pl-2.5 pr-3 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
          >
            {clusters.map((cluster) => (
              <span
                key={cluster.id}
                className="size-3 shrink-0 rounded-[3px]"
                style={{ background: cluster.ink }}
              />
            ))}
            <span className="text-[13px] font-medium leading-5 text-ink">Legend</span>
          </button>
        )}

        {legendOpen && (
          <div
            className="absolute right-2 top-2 flex max-w-[74%] flex-col rounded-[12px] border
              border-line bg-panel p-1 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
          >
            <button
              type="button"
              onClick={() => setLegendOpen(false)}
              aria-label="Hide legend"
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center
                rounded-full border border-line bg-panel text-muted hover:text-ink"
            >
              <Icon name="close" size={12} />
            </button>
            {presentClusters.map((cluster) => (
              <button
                key={cluster.id}
                type="button"
                onClick={() => setIsolated((prev) => (prev === cluster.id ? null : cluster.id))}
                aria-pressed={isolated === cluster.id}
                className={`flex h-8 min-w-0 shrink-0 items-center gap-2 rounded-[8px] pl-2 pr-3
                  hover:bg-rail ${isolated === cluster.id ? 'bg-fill' : ''}`}
              >
                <span
                  className="size-3 shrink-0 rounded-[3px]"
                  style={{ background: cluster.ink }}
                />
                <span
                  className="size-3 shrink-0 rounded-[3px]"
                  style={{ background: cluster.wash }}
                />
                <span className="line-clamp-1 text-[12.96px] font-medium leading-[19.52px] text-ink">
                  {cluster.label}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setDense(true)
                setIsolated((prev) => (prev === 'none' ? null : 'none'))
              }}
              aria-pressed={isolated === 'none'}
              className={`flex h-8 min-w-0 shrink-0 items-center gap-2 rounded-[8px] pl-2 pr-3
                hover:bg-rail ${isolated === 'none' ? 'bg-fill' : ''}`}
            >
              <span className="size-3 shrink-0 rounded-[3px] bg-line" />
              <span className="line-clamp-1 text-[12.96px] font-medium leading-[19.52px] text-ink">
                More details
              </span>
            </button>
          </div>
        )}

        <div
          className="absolute bottom-2 right-2 flex flex-col overflow-hidden rounded-[10px] border
            border-line bg-panel shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        >
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => zoomAbout(1.3, size.width / 2, size.height / 2)}
            className="icon-btn size-7 rounded-none"
          >
            <Icon name="plus" size={14} />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomAbout(1 / 1.3, size.width / 2, size.height / 2)}
            className="icon-btn size-7 rounded-none border-y border-hairline"
          >
            <Icon name="minus" size={14} />
          </button>
          <button type="button" aria-label="Fit to view" onClick={fit} className="icon-btn size-7 rounded-none">
            <Icon name="fit" size={13} />
          </button>
        </div>

        {/* Time axis — the graph's one structural claim about the x position. */}
        <div className="pointer-events-none absolute inset-x-3 bottom-2 flex items-center gap-2">
          <span className="h-px grow bg-line" />
          <span className="shrink-0 text-[11.5px] leading-[16px] text-faint">
            More recently published
          </span>
          <span className="h-px w-6 shrink-0 bg-line" />
          <Icon name="chevronRight" size={12} className="text-faint" />
        </div>
      </div>

      {selectedNode ? (
        <div className="shrink-0 border-t border-line bg-panel px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 size-2.5 shrink-0 rounded-full border-[1.5px]"
              style={{
                background: selectedNode.clusterId
                  ? isSeed(selectedNode)
                    ? clusterById[selectedNode.clusterId].ink
                    : clusterById[selectedNode.clusterId].wash
                  : '#fff',
                borderColor: selectedNode.clusterId
                  ? clusterById[selectedNode.clusterId].ink
                  : 'var(--color-line)',
              }}
            />
            <div className="min-w-0 grow">
              <p className="m-0 text-[13px] font-medium leading-[19px] text-ink">
                {selectedPaper?.title ?? selectedNode.label}
              </p>
              <p className="m-0 mt-0.5 text-[12px] leading-[18px] text-muted">
                {selectedNode.author} · {selectedNode.year} ·{' '}
                {plural(selectedNode.citations, 'citation')}
                {selectedNode.clusterId
                  ? ` · ${clusterById[selectedNode.clusterId].label.split(' · ')[1]}`
                  : ' · outside the named clusters'}
              </p>
            </div>
            <button
              type="button"
              aria-label="Clear selection"
              onClick={() => setSelected(null)}
              className="icon-btn size-6"
            >
              <Icon name="close" size={13} />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {selectedNode.paperId ? (
              <>
                <button
                  type="button"
                  className="btn-sm"
                  onClick={() => openInPanel({ kind: 'paper', id: selectedNode.paperId! })}
                >
                  <Icon name="external" size={14} /> Open
                </button>
                <button
                  type="button"
                  className="btn-sm"
                  onClick={() => referenceInComposer({ kind: 'paper', id: selectedNode.paperId! })}
                >
                  <Icon name="chat" size={14} /> Ask
                </button>
              </>
            ) : (
              <span className="text-[12px] leading-[18px] text-faint">
                Cited in this graph but not yet in your library.
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="shrink-0 border-t border-hairline px-3 py-2 text-[12px] leading-[18px] text-faint">
          Drag to pan, scroll to zoom, click a paper for detail.
        </p>
      )}
    </div>
  )
}
