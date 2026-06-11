/**
 * Shatter system — physics-based glass break-apart. Ported from the
 * `ui-playground` Flock demo. Draws jagged crack spokes on a still-visible
 * pill, then breaks the pill into wedge shards that fall under gravity.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

const SHATTER_DURATION_S = 1.25
const SHATTER_GRAVITY = 1400
const SHATTER_DRAG_PER_FRAME = 0.985
const SHATTER_FADE_START_S = 0.45
const SHATTER_INITIAL_SPEED_MIN = 220
const SHATTER_INITIAL_SPEED_MAX = 420
const SHATTER_UPWARD_BOOST = 90
const SHATTER_ANGULAR_VEL_MAX = 720
const SHATTER_PERIM_POINTS_MIN = 3
const SHATTER_PERIM_POINTS_MAX = 5
const SHATTER_PILL_BORDER_RADIUS = 8

export const FRACTURE_CRACK_DRAW_MS = 240
export const FRACTURE_CRACK_OPACITY = 0.70

export interface ShatterColors {
  fill: string
  stroke: string
  highlight: string
}

export interface FractureOptions {
  previewMs: number
  onBreak: () => void
}

export interface ShatterAPI {
  fracture: (
    pillRect: { left: number; top: number; width: number; height: number },
    epicenter: { x: number; y: number },
    colors: ShatterColors,
    opts: FractureOptions,
  ) => () => void
  cleanup: () => void
}

interface Shard {
  el: SVGGElement
  worldX: number
  worldY: number
  vx: number
  vy: number
  rot: number
  angVel: number
  age: number
  alive: boolean
  appliedOpacity: string
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

// Jagged polyline from start to end, jitter tapered via sin so the path
// anchors at endpoints and only wanders in the middle — reads as a single
// fracture line rather than a zig-zag.
function buildJaggedSpoke(
  start: { x: number; y: number },
  end: { x: number; y: number },
  segments: number,
  maxJitter: number,
): { x: number; y: number }[] {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const len = Math.hypot(dx, dy)
  if (len < 1 || segments < 2) return [start, end]
  const px = -dy / len
  const py = dx / len
  const pts: { x: number; y: number }[] = [start]
  for (let i = 1; i < segments; i++) {
    const t = i / segments
    const taper = Math.sin(t * Math.PI)
    const baseX = start.x + dx * t
    const baseY = start.y + dy * t
    const j = (Math.random() - 0.5) * 2 * maxJitter * taper
    pts.push({ x: baseX + px * j, y: baseY + py * j })
  }
  pts.push(end)
  return pts
}

function pointsToPathD(points: { x: number; y: number }[]): string {
  const p0 = points[0]!
  let d = `M${p0.x.toFixed(2)} ${p0.y.toFixed(2)}`
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!
    d += ` L${p.x.toFixed(2)} ${p.y.toFixed(2)}`
  }
  return d
}

function polylineLength(points: { x: number; y: number }[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i]!
    const b = points[i - 1]!
    total += Math.hypot(a.x - b.x, a.y - b.y)
  }
  return total
}

export function setupShatter(svgLayer: SVGSVGElement): ShatterAPI {
  const shards: Shard[] = []
  let rafId: number | null = null
  let lastTime = 0

  let activeJob: {
    crackEls: SVGPathElement[]
    defsEl: SVGDefsElement | null
    breakTimer: number
    cancelled: boolean
  } | null = null

  function clearShards(): void {
    for (const s of shards) {
      s.alive = false
      s.el.remove()
    }
    shards.length = 0
  }

  function generateGeometry(
    pillRect: { left: number; top: number; width: number; height: number },
    epicenter: { x: number; y: number },
  ) {
    const W = pillRect.width
    const H = pillRect.height
    const exLocal = epicenter.x - pillRect.left
    const eyLocal = epicenter.y - pillRect.top
    const ep = { x: exLocal, y: eyLocal }

    const perimPointCount = randInt(SHATTER_PERIM_POINTS_MIN, SHATTER_PERIM_POINTS_MAX)
    const perim: { x: number; y: number }[] = []
    const perimeter = 2 * (W + H)
    const stride = perimeter / perimPointCount
    for (let i = 0; i < perimPointCount; i++) {
      let d = i * stride + rand(-stride * 0.15, stride * 0.15)
      d = ((d % perimeter) + perimeter) % perimeter
      let x: number
      let y: number
      if (d < W) { x = d; y = 0 }
      else if (d < W + H) { x = W; y = d - W }
      else if (d < 2 * W + H) { x = W - (d - W - H); y = H }
      else { x = 0; y = H - (d - 2 * W - H) }
      perim.push({ x, y })
    }

    const spokes = perim.map(p => {
      const dist = Math.hypot(p.x - exLocal, p.y - eyLocal)
      const segments = Math.max(3, Math.min(6, Math.round(dist / 6)))
      const maxJitter = Math.min(dist * 0.13, 3.2)
      return buildJaggedSpoke(ep, p, segments, maxJitter)
    })

    return { perim, exLocal, eyLocal, spokes }
  }

  function spawnShards(
    pillRect: { left: number; top: number; width: number; height: number },
    colors: ShatterColors,
    geometry: {
      perim: { x: number; y: number }[]
      exLocal: number
      eyLocal: number
      spokes: { x: number; y: number }[][]
    },
  ): void {
    const { perim, exLocal, eyLocal, spokes } = geometry
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < perim.length; i++) {
      const j = (i + 1) % perim.length
      const spokeA = spokes[i]!
      const spokeB = spokes[j]!

      const polyPoints: { x: number; y: number }[] = [
        ...spokeA,
        perim[j]!,
        ...spokeB.slice(1, -1).reverse(),
      ]

      let cx = 0
      let cy = 0
      for (const p of polyPoints) { cx += p.x; cy += p.y }
      cx /= polyPoints.length
      cy /= polyPoints.length

      const relPoints = polyPoints.map(p => ({ x: p.x - cx, y: p.y - cy }))

      const dx = cx - exLocal
      const dy = cy - eyLocal
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const speed = rand(SHATTER_INITIAL_SPEED_MIN, SHATTER_INITIAL_SPEED_MAX)
      const vx = (dx / dist) * speed
      const vy = (dy / dist) * speed - SHATTER_UPWARD_BOOST

      const g = document.createElementNS(SVG_NS, 'g')
      g.setAttribute('aria-hidden', 'true')

      const path = document.createElementNS(SVG_NS, 'path')
      path.setAttribute('d', pointsToPathD(relPoints) + ' Z')
      path.setAttribute('fill', colors.fill)
      path.setAttribute('stroke', colors.stroke)
      path.setAttribute('stroke-width', '0.6')
      path.setAttribute('stroke-linejoin', 'round')
      g.appendChild(path)

      if (relPoints.length >= 2) {
        const r0 = relPoints[0]!
        const r1 = relPoints[1]!
        const highlightLine = document.createElementNS(SVG_NS, 'line')
        highlightLine.setAttribute('x1', r0.x.toFixed(2))
        highlightLine.setAttribute('y1', r0.y.toFixed(2))
        highlightLine.setAttribute('x2', r1.x.toFixed(2))
        highlightLine.setAttribute('y2', r1.y.toFixed(2))
        highlightLine.setAttribute('stroke', colors.highlight)
        highlightLine.setAttribute('stroke-width', '0.8')
        highlightLine.setAttribute('stroke-linecap', 'round')
        g.appendChild(highlightLine)
      }

      fragment.appendChild(g)

      shards.push({
        el: g,
        worldX: pillRect.left + cx,
        worldY: pillRect.top + cy,
        vx,
        vy,
        rot: rand(-8, 8),
        angVel: rand(-SHATTER_ANGULAR_VEL_MAX, SHATTER_ANGULAR_VEL_MAX),
        age: 0,
        alive: true,
        appliedOpacity: '',
      })
    }
    svgLayer.appendChild(fragment)
  }

  function fracture(
    pillRect: { left: number; top: number; width: number; height: number },
    epicenter: { x: number; y: number },
    colors: ShatterColors,
    opts: FractureOptions,
  ): () => void {
    if (activeJob && !activeJob.cancelled) {
      activeJob.cancelled = true
      clearTimeout(activeJob.breakTimer)
      for (const el of activeJob.crackEls) el.remove()
    }

    const geometry = generateGeometry(pillRect, epicenter)

    const clipId = `flock-clip-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
    const defsEl = document.createElementNS(SVG_NS, 'defs')
    const clipPathEl = document.createElementNS(SVG_NS, 'clipPath')
    clipPathEl.setAttribute('id', clipId)
    const clipRect = document.createElementNS(SVG_NS, 'rect')
    clipRect.setAttribute('x', pillRect.left.toFixed(1))
    clipRect.setAttribute('y', pillRect.top.toFixed(1))
    clipRect.setAttribute('width', pillRect.width.toFixed(1))
    clipRect.setAttribute('height', pillRect.height.toFixed(1))
    clipRect.setAttribute('rx', String(SHATTER_PILL_BORDER_RADIUS))
    clipRect.setAttribute('ry', String(SHATTER_PILL_BORDER_RADIUS))
    clipPathEl.appendChild(clipRect)
    defsEl.appendChild(clipPathEl)
    svgLayer.appendChild(defsEl)

    const crackEls: SVGPathElement[] = []
    for (let i = 0; i < geometry.spokes.length; i++) {
      const worldSpoke = geometry.spokes[i]!.map(p => ({
        x: pillRect.left + p.x,
        y: pillRect.top + p.y,
      }))
      const len = polylineLength(worldSpoke)
      const path = document.createElementNS(SVG_NS, 'path')
      path.setAttribute('d', pointsToPathD(worldSpoke))
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', colors.stroke)
      path.setAttribute('stroke-width', '1.0')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')
      path.setAttribute('stroke-dasharray', len.toFixed(1))
      path.setAttribute('stroke-dashoffset', len.toFixed(1))
      path.setAttribute('clip-path', `url(#${clipId})`)
      path.setAttribute('opacity', String(FRACTURE_CRACK_OPACITY))
      path.style.animation = `flock-crack-draw ${FRACTURE_CRACK_DRAW_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards`
      path.style.animationDelay = `${i * 10}ms`
      svgLayer.appendChild(path)
      crackEls.push(path)
    }

    const job = { crackEls, defsEl, breakTimer: 0, cancelled: false }
    activeJob = job

    job.breakTimer = window.setTimeout(() => {
      if (job.cancelled) return
      activeJob = null
      for (const el of crackEls) el.remove()
      defsEl.remove()
      spawnShards(pillRect, colors, geometry)
      opts.onBreak()
      lastTime = 0
      if (rafId === null) rafId = requestAnimationFrame(loop)
    }, opts.previewMs)

    return () => {
      if (job.cancelled) return
      job.cancelled = true
      clearTimeout(job.breakTimer)
      for (const el of crackEls) {
        el.style.transition = 'opacity 180ms ease'
        el.style.opacity = '0'
      }
      window.setTimeout(() => {
        for (const el of crackEls) el.remove()
        defsEl.remove()
      }, 220)
      if (activeJob === job) activeJob = null
    }
  }

  function loop(now: number): void {
    rafId = null
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.033) : 0.016
    lastTime = now

    let aliveCount = 0
    let anyDied = false
    for (const s of shards) {
      if (!s.alive) continue
      s.age += dt

      s.vy += SHATTER_GRAVITY * dt
      s.vx *= SHATTER_DRAG_PER_FRAME
      s.worldX += s.vx * dt
      s.worldY += s.vy * dt
      s.rot += s.angVel * dt

      let opacity = 1
      if (s.age > SHATTER_FADE_START_S) {
        const fadeT = (s.age - SHATTER_FADE_START_S) /
                      (SHATTER_DURATION_S - SHATTER_FADE_START_S)
        opacity = Math.max(0, 1 - fadeT)
      }
      const opacityStr = opacity.toFixed(2)
      if (s.appliedOpacity !== opacityStr) {
        s.el.setAttribute('opacity', opacityStr)
        s.appliedOpacity = opacityStr
      }
      s.el.setAttribute(
        'transform',
        `translate(${s.worldX.toFixed(1)} ${s.worldY.toFixed(1)}) rotate(${s.rot.toFixed(1)})`,
      )

      if (s.age > SHATTER_DURATION_S) {
        s.alive = false
        s.el.remove()
        anyDied = true
      } else {
        aliveCount++
      }
    }

    if (anyDied) {
      for (let i = shards.length - 1; i >= 0; i--) {
        if (!shards[i]!.alive) shards.splice(i, 1)
      }
    }

    if (aliveCount > 0) {
      rafId = requestAnimationFrame(loop)
    }
  }

  return {
    fracture,
    cleanup: () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
      clearShards()
      if (activeJob) {
        activeJob.cancelled = true
        clearTimeout(activeJob.breakTimer)
        for (const el of activeJob.crackEls) el.remove()
        activeJob.defsEl?.remove()
        activeJob = null
      }
    },
  }
}
