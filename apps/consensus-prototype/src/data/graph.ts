/**
 * The citation graph behind a collection.
 *
 * Modelled on the product's Citation Graph artboard: papers laid out left to
 * right by publication date, sized by influence, coloured by the cluster they
 * fall into. A cluster's *seed* — the paper the cluster is named after — is
 * drawn solid; its members are drawn in the same hue at low saturation.
 *
 * Nodes carry an explicit `y` rather than running a force simulation. The
 * layout is a design artefact, not a computation: it should be identical every
 * time you open the panel, and it should read well at 300px.
 */

export interface Cluster {
  id: string
  /** Named after its seed paper, matching the legend copy on the artboard. */
  label: string
  seedId: string
  ink: string
  wash: string
}

export interface GraphNode {
  id: string
  /** Set when the node is a paper the app knows about, so it can be opened. */
  paperId?: string
  /** "D. Vethaak, 2021" — first author and year, as the artboard labels them. */
  label: string
  author: string
  year: number
  citations: number
  clusterId: string | null
  /** Layout position in world units (0–1000 × 0–620). */
  x: number
  y: number
}

/** A citation: `from` (newer) cites `to` (older). */
export interface GraphEdge {
  from: string
  to: string
}

export const clusters: Cluster[] = [
  {
    id: 'microplastics',
    label: '2021 · Vethaak et al. cluster',
    seedId: 'vethaak2021',
    ink: '#6929C4',
    wash: '#E4D8F4',
  },
  {
    id: 'cognition',
    label: '2022 · Prokopidis et al. cluster',
    seedId: 'prokopidis2022',
    ink: '#1192E8',
    wash: '#D4EBFB',
  },
  {
    id: 'muscle',
    label: '2017 · Kreider et al. cluster',
    seedId: 'kreider2017',
    ink: '#005D5D',
    wash: '#D1E2E2',
  },
]

export const UNCLUSTERED_INK = '#A1A1AA'
export const UNCLUSTERED_WASH = '#FFFFFF'

/**
 * x is derived from `year` at build time below; the authored value is `y`
 * only, so the time axis can never drift out of agreement with the labels.
 */
const NODES: (Omit<GraphNode, 'x'> & { x?: number })[] = [
  // Creatine · muscle metabolism -------------------------------------------
  { id: 'hultman1996', label: 'E. Hultman, 1996', author: 'E. Hultman', year: 1996, citations: 1140, clusterId: 'muscle', y: 250 },
  { id: 'rawson2008', paperId: 'rawson2008', label: 'E. Rawson, 2008', author: 'E. Rawson', year: 2008, citations: 68, clusterId: 'muscle', y: 122 },
  { id: 'wallimann2011', label: 'T. Wallimann, 2011', author: 'T. Wallimann', year: 2011, citations: 812, clusterId: 'muscle', y: 300 },
  { id: 'alves2013', label: 'C. R. R. Alves, 2013', author: 'C. R. R. Alves', year: 2013, citations: 96, clusterId: 'muscle', y: 420 },
  { id: 'kreider2017', label: 'R. Kreider, 2017', author: 'R. Kreider', year: 2017, citations: 1460, clusterId: 'muscle', y: 292 },
  { id: 'butts2017', label: 'J. Butts, 2017', author: 'J. Butts', year: 2017, citations: 141, clusterId: 'muscle', y: 430 },

  // Creatine · cognition ----------------------------------------------------
  { id: 'avgerinos2018', label: 'K. Avgerinos, 2018', author: 'K. Avgerinos', year: 2018, citations: 244, clusterId: 'cognition', y: 372 },
  { id: 'roschel2021', label: 'H. Roschel, 2021', author: 'H. Roschel', year: 2021, citations: 188, clusterId: 'cognition', y: 300 },
  { id: 'prokopidis2022', paperId: 'prokopidis2022', label: 'K. Prokopidis, 2022', author: 'K. Prokopidis', year: 2022, citations: 52, clusterId: 'cognition', y: 408 },
  { id: 'forbes2022', label: 'S. C. Forbes, 2022', author: 'S. C. Forbes', year: 2022, citations: 130, clusterId: 'cognition', y: 340 },
  { id: 'moriarty2023', paperId: 'moriarty2023', label: 'T. Moriarty, 2023', author: 'T. Moriarty', year: 2023, citations: 15, clusterId: 'cognition', y: 250 },
  { id: 'candow2025', label: 'D. G. Candow, 2025', author: 'D. G. Candow', year: 2025, citations: 6, clusterId: 'cognition', y: 396 },

  // Microplastics -----------------------------------------------------------
  { id: 'koelmans2019', label: 'A. Koelmans, 2019', author: 'A. Koelmans', year: 2019, citations: 1620, clusterId: 'microplastics', y: 96 },
  { id: 'kutralam2020', label: 'G. Kutralam-Muniasamy, 2020', author: 'G. Kutralam-Muniasamy', year: 2020, citations: 402, clusterId: 'microplastics', y: 228 },
  { id: 'vethaak2021', paperId: 'vethaak2021', label: 'D. Vethaak, 2021', author: 'D. Vethaak', year: 2021, citations: 1204, clusterId: 'microplastics', y: 122 },
  { id: 'tan2021', label: 'S. Tan, 2021', author: 'S. Tan', year: 2021, citations: 74, clusterId: 'microplastics', y: 520 },
  { id: 'bian2023', label: 'X. Bian, 2023', author: 'X. Bian', year: 2023, citations: 58, clusterId: 'microplastics', y: 470 },
  { id: 'kumar2023', paperId: 'kumar2023', label: 'S. Kumar, 2023', author: 'S. Kumar', year: 2023, citations: 41, clusterId: 'microplastics', y: 190 },

  // Unclustered — the "More details" tier -----------------------------------
  { id: 'gerber2005', label: 'I. Gerber, 2005', author: 'I. Gerber', year: 2005, citations: 44, clusterId: null, y: 360 },
  { id: 'wilkinson2016', label: 'T. Wilkinson, 2016', author: 'T. Wilkinson', year: 2016, citations: 38, clusterId: null, y: 545 },
  { id: 'tiller2019', paperId: 'tiller2019', label: 'N. Tiller, 2019', author: 'N. Tiller', year: 2019, citations: 149, clusterId: null, y: 470 },
  { id: 'ricci2020', label: 'T. Ricci, 2020', author: 'T. Ricci', year: 2020, citations: 27, clusterId: null, y: 452 },
  { id: 'podlogar2022', paperId: 'podlogar2022', label: 'T. Podlogar, 2022', author: 'T. Podlogar', year: 2022, citations: 97, clusterId: null, y: 552 },
]

const EDGES: [string, string][] = [
  ['wallimann2011', 'hultman1996'],
  ['alves2013', 'wallimann2011'],
  ['kreider2017', 'hultman1996'],
  ['kreider2017', 'wallimann2011'],
  ['kreider2017', 'rawson2008'],
  ['butts2017', 'wallimann2011'],
  ['avgerinos2018', 'rawson2008'],
  ['avgerinos2018', 'kreider2017'],
  ['roschel2021', 'kreider2017'],
  ['roschel2021', 'avgerinos2018'],
  ['forbes2022', 'kreider2017'],
  ['forbes2022', 'avgerinos2018'],
  ['prokopidis2022', 'avgerinos2018'],
  ['prokopidis2022', 'roschel2021'],
  ['prokopidis2022', 'rawson2008'],
  ['moriarty2023', 'prokopidis2022'],
  ['moriarty2023', 'avgerinos2018'],
  ['candow2025', 'prokopidis2022'],
  ['candow2025', 'forbes2022'],
  ['candow2025', 'kreider2017'],
  ['vethaak2021', 'koelmans2019'],
  ['kutralam2020', 'koelmans2019'],
  ['tan2021', 'koelmans2019'],
  ['bian2023', 'vethaak2021'],
  ['bian2023', 'kutralam2020'],
  ['kumar2023', 'vethaak2021'],
  ['kumar2023', 'tan2021'],
  ['ricci2020', 'butts2017'],
  ['tiller2019', 'gerber2005'],
  ['podlogar2022', 'tiller2019'],
  ['podlogar2022', 'wilkinson2016'],
  ['wilkinson2016', 'gerber2005'],
]

export const WORLD = { width: 1000, height: 620 }

const years = NODES.map((n) => n.year)
const minYear = Math.min(...years)
const maxYear = Math.max(...years)

/** Time runs left to right, with a margin so labels never touch the edge. */
function xForYear(year: number) {
  const t = (year - minYear) / (maxYear - minYear)
  return 70 + t * (WORLD.width - 150)
}

export const graphNodes: GraphNode[] = NODES.map((node) => ({
  ...node,
  x: node.x ?? xForYear(node.year),
}))

export const graphEdges: GraphEdge[] = EDGES.map(([from, to]) => ({ from, to }))

export const nodeById = Object.fromEntries(graphNodes.map((n) => [n.id, n]))
export const clusterById = Object.fromEntries(clusters.map((c) => [c.id, c]))

/** Influence drives area, not radius, so a 1000-citation paper is not a blob. */
const maxCitations = Math.max(...graphNodes.map((n) => n.citations))
export function radiusOf(node: GraphNode) {
  return 9 + Math.sqrt(node.citations / maxCitations) * 17
}

export function isSeed(node: GraphNode) {
  return node.clusterId !== null && clusterById[node.clusterId]?.seedId === node.id
}

export const neighbours = graphNodes.reduce<Record<string, Set<string>>>((acc, node) => {
  acc[node.id] = new Set()
  return acc
}, {})
for (const edge of graphEdges) {
  neighbours[edge.from]?.add(edge.to)
  neighbours[edge.to]?.add(edge.from)
}

export const yearRange = { min: minYear, max: maxYear }

/**
 * The graph a given collection actually has.
 *
 * A node is in scope when the collection saved it, when one of its threads
 * surfaced it, or when it is cited by something already in scope — one hop, so
 * the graph shows what your papers stand on without becoming the whole corpus.
 * The panel claims to be about *this* collection; the graph has to keep that
 * promise or it undermines everything next to it.
 */
export function graphForPapers(seedIds: string[]): {
  nodes: GraphNode[]
  edges: GraphEdge[]
} {
  const seeds = new Set(
    graphNodes.filter((n) => n.paperId && seedIds.includes(n.paperId)).map((n) => n.id),
  )
  if (seeds.size === 0) return { nodes: [], edges: [] }

  const scope = new Set(seeds)
  for (const edge of graphEdges) {
    if (seeds.has(edge.from)) scope.add(edge.to)
    if (seeds.has(edge.to)) scope.add(edge.from)
  }

  return {
    nodes: graphNodes.filter((n) => scope.has(n.id)),
    edges: graphEdges.filter((e) => scope.has(e.from) && scope.has(e.to)),
  }
}
