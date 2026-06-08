/**
 * Bird swarm — Twitter-style flock that emerges from a hover origin, flaps
 * upward, and exits past the top-right of the viewport. Ported from the
 * `ui-playground` Flock demo. See `core-docs/history.md` for context.
 */

const TWITTER_BLUE = '#1DA1F2'
const SVG_NS = 'http://www.w3.org/2000/svg'

// Canonical Twitter bird on a 248×204 viewBox.
const BIRD_PATH =
  'M221.95,51.29c0.15,2.17,0.15,4.34,0.15,6.53c0,66.73-50.8,143.69-143.69,143.69v-0.04C50.97,201.51,24.1,193.65,1,178.83c3.99,0.48,8,0.72,12.02,0.73c22.74,0.02,44.83-7.61,62.72-21.66c-21.61-0.41-40.56-14.5-47.18-35.07c7.57,1.46,15.37,1.16,22.8-0.87C27.8,117.2,10.85,96.5,10.85,72.46c0-0.22,0-0.43,0-0.64c7.02,3.91,14.88,6.08,22.92,6.32C11.58,63.31,4.74,33.79,18.14,10.71c25.64,31.55,63.47,50.73,104.08,52.76c-4.07-17.54,1.49-35.92,14.61-48.25c20.34-19.12,52.33-18.14,71.45,2.19c11.31-2.23,22.15-6.38,32.07-12.26c-3.77,11.69-11.66,21.62-22.2,27.93c10.01-1.18,19.79-3.86,29-7.95C240.37,35.29,231.83,44.14,221.95,51.29z'

// Bird sprite is drawn facing up-right (~-45°); subtract that natural facing
// when aligning with velocity. Only follow part of the heading delta — the
// sprite already reads as "in flight up-right."
const BIRD_NATURAL_HEADING_DEG = -45
const BIRD_HEADING_FOLLOW = 0.5

// Exit target — birds aim for this point just past the top-right of the
// viewport at spawn time, so the flock peels off in roughly one direction.
const EXIT_TARGET_X_MARGIN = 80
const EXIT_TARGET_Y_FRAC = 0.12

const FLAP_JITTER_MIN = 0.86
const FLAP_JITTER_MAX = 1.14
const HEAD_BOB_DEG = 1.5
const MAGIC_EMERGE_SECONDS = 0.28

// Last-look easter egg: well into the flight (~2s), the lone straggler
// pauses for half a second with a slow head-turn arc, then continues.
const LAST_LOOK_START = 2.0
const LAST_LOOK_FREEZE = 0.5
const LAST_LOOK_HEAD_TURN_DEG = 14

// Subtle drop-shadow rendered as a second SVG path offset behind the bird,
// not as a CSS filter — drop-shadow on a transforming layer forces a full
// re-rasterization every frame on Safari/iOS, making the flap choppy.
const BIRD_SHADOW_OFFSET_Y = 10
const BIRD_SHADOW_FILL = 'rgba(0, 0, 0, 0.13)'
const BIRD_SHADOW_CLASS = 'flock-bird-shadow'

export type OriginMode = 'corner' | 'cursor' | 'perched'

export interface FlockConfig {
  flapHz: number
  flightSpeed: number
  bobAmplitude: number
  climbAccel: number
  birdSize: number
  staggerMs: number
  flapJitter: boolean
  headBob: boolean
  magicEmerge: boolean
  lastLook: boolean
}

// Tuned slightly faster than the playground demo: the portfolio's contact
// line sits in the left column, so birds have most of the viewport to cross
// before exiting. +17% flightSpeed and +7% flapHz keep the cadence intact
// without making the burst feel hurried.
export const FLOCK_DEFAULTS: FlockConfig = {
  flapHz: 4.8,
  flightSpeed: 210,
  bobAmplitude: 4,
  climbAccel: 15,
  birdSize: 24,
  staggerMs: 55,
  flapJitter: true,
  headBob: true,
  magicEmerge: true,
  lastLook: true,
}

export interface SpawnOrigin {
  mode: OriginMode
  rect: { left: number; top: number; right: number; bottom: number; width: number; height: number }
  cursorX?: number
  cursorY?: number
}

export interface BirdSwarmAPI {
  spawn: (origin: SpawnOrigin, count: number, opts?: { lastLook?: boolean }) => void
  cleanup: () => void
}

interface RectLike {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

/** Resolve the emergence point of the burst — shared between bird swarm
 *  (corner/cursor; perched adds per-bird random on top) and the fracture
 *  trigger (crack epicenter). */
export function resolveEpicenter(
  mode: OriginMode,
  rect: RectLike,
  cursor?: { x: number; y: number } | null,
): { x: number; y: number } {
  if (mode === 'cursor' && cursor) {
    return { x: rect.right, y: cursor.y }
  }
  if (mode === 'perched') {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }
  return { x: rect.right - rect.width * 0.15, y: rect.top + rect.height * 0.25 }
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

interface Bird {
  el: HTMLDivElement
  x: number
  y: number
  vx: number
  vy: number
  spawnDelay: number
  age: number
  baseSpeed: number
  bobAmp: number
  bobFreq: number
  bobPhase: number
  flapPhase: number
  flapAmp: number
  flapHzMul: number
  formOffsetX: number
  formOffsetY: number
  rotJitter: number
  alive: boolean
  anchorX: number
  anchorY: number
  isLastLook: boolean
}

export function setupBirdSwarm(
  layer: HTMLElement,
  cfgRef: React.MutableRefObject<FlockConfig>,
): BirdSwarmAPI {
  const birds: Bird[] = []
  let rafId: number | null = null
  let lastTime = 0

  // Build the bird SVG once; cloneNode per bird at spawn. Shadow is a
  // second path *behind* the bird offset down — cheap GPU alpha composite
  // instead of a CSS filter rasterization per frame.
  const birdSvgTemplate = document.createElementNS(SVG_NS, 'svg')
  birdSvgTemplate.setAttribute('viewBox', '0 0 248 204')
  birdSvgTemplate.setAttribute('width', '100%')
  birdSvgTemplate.setAttribute('height', '100%')
  birdSvgTemplate.style.display = 'block'
  birdSvgTemplate.style.overflow = 'visible'
  const shadowPathTemplate = document.createElementNS(SVG_NS, 'path')
  shadowPathTemplate.setAttribute('d', BIRD_PATH)
  shadowPathTemplate.setAttribute('fill', BIRD_SHADOW_FILL)
  shadowPathTemplate.setAttribute('transform', `translate(0 ${BIRD_SHADOW_OFFSET_Y})`)
  shadowPathTemplate.setAttribute('class', BIRD_SHADOW_CLASS)
  birdSvgTemplate.appendChild(shadowPathTemplate)
  const birdPathTemplate = document.createElementNS(SVG_NS, 'path')
  birdPathTemplate.setAttribute('d', BIRD_PATH)
  birdPathTemplate.setAttribute('fill', TWITTER_BLUE)
  birdSvgTemplate.appendChild(birdPathTemplate)

  function createBirdEl(size: number): HTMLDivElement {
    const h = size * (204 / 248)
    const wrap = document.createElement('div')
    wrap.setAttribute('aria-hidden', 'true')
    Object.assign(wrap.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${size}px`,
      height: `${h}px`,
      marginLeft: `${-size / 2}px`,
      marginTop: `${-h / 2}px`,
      pointerEvents: 'none',
      willChange: 'transform, opacity',
      transformOrigin: '50% 50%',
      opacity: '0',
    })
    wrap.appendChild(birdSvgTemplate.cloneNode(true))
    return wrap
  }

  function resolveOrigin(origin: SpawnOrigin): { x: number; y: number } {
    if (origin.mode === 'perched') {
      return {
        x: origin.rect.left + rand(0.1, 0.9) * origin.rect.width,
        y: origin.rect.top + rand(0.15, 0.85) * origin.rect.height,
      }
    }
    const cursor = origin.cursorY != null && origin.cursorX != null
      ? { x: origin.cursorX, y: origin.cursorY }
      : null
    return resolveEpicenter(origin.mode, origin.rect as RectLike, cursor)
  }

  function spawn(origin: SpawnOrigin, count: number, opts?: { lastLook?: boolean }): void {
    const cfg = cfgRef.current
    const lastLook = !!opts?.lastLook
    const anchorX = origin.rect.right
    const anchorY = origin.rect.top + origin.rect.height / 2
    const targetX = window.innerWidth + EXIT_TARGET_X_MARGIN
    const targetY = window.innerHeight * EXIT_TARGET_Y_FRAC
    const baseAngle = Math.atan2(targetY - anchorY, targetX - anchorX)

    const fragment = document.createDocumentFragment()

    for (let i = 0; i < count; i++) {
      const size = cfg.birdSize * rand(0.85, 1.05)
      const el = createBirdEl(size)
      fragment.appendChild(el)

      const angle = baseAngle + rand(-0.18, 0.18)
      const speed = cfg.flightSpeed * rand(0.92, 1.10)

      const rank = Math.floor(i / 2)
      const lateral = (i % 2 === 0 ? -1 : 1) * rank * 6 * rand(0.85, 1.15)
      const trail = -rank * 8 * rand(0.85, 1.15)
      const ca = Math.cos(angle)
      const sa = Math.sin(angle)
      const formOffsetX = trail * ca - lateral * sa
      const formOffsetY = trail * sa + lateral * ca

      const startJitterX = rand(-3, 3)
      const startJitterY = rand(-2, 2)

      const { x: ox, y: oy } = resolveOrigin(origin)
      const stagger = cfg.staggerMs / 1000

      birds.push({
        el,
        x: ox + startJitterX,
        y: oy + startJitterY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spawnDelay: i * stagger,
        age: -i * stagger,
        baseSpeed: speed,
        bobAmp: cfg.bobAmplitude * rand(0.7, 1.3),
        bobFreq: rand(1.2, 1.9),
        bobPhase: rand(0, Math.PI * 2),
        flapPhase: rand(0, Math.PI * 2),
        flapAmp: rand(0.12, 0.18),
        flapHzMul: rand(FLAP_JITTER_MIN, FLAP_JITTER_MAX),
        formOffsetX,
        formOffsetY,
        rotJitter: rand(-0.05, 0.05),
        alive: true,
        anchorX: ox,
        anchorY: oy,
        isLastLook: lastLook,
      })
    }

    layer.appendChild(fragment)

    if (rafId === null) {
      lastTime = 0
      rafId = requestAnimationFrame(loop)
    }
  }

  function loop(now: number): void {
    rafId = null
    const cfg = cfgRef.current
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.033) : 0.016
    lastTime = now

    const baseFlapTwoPi = cfg.flapHz * Math.PI * 2
    const vpW = window.innerWidth
    let anyDied = false

    for (const b of birds) {
      if (!b.alive) continue
      b.age += dt

      if (b.age < 0) {
        b.el.style.opacity = '0'
        continue
      }

      const useMagic = cfg.magicEmerge
      const emergeDur = useMagic ? MAGIC_EMERGE_SECONDS : 0.18
      const emerge = Math.min(b.age / emergeDur, 1)
      const emergeScale = useMagic ? emerge : 0.4 + 0.6 * emerge
      const opacity = Math.min(emerge * 2, 1)

      b.vy -= cfg.climbAccel * dt * (1 - Math.min(b.age / 1.8, 1) * 0.6)
      const maxUp = -cfg.flightSpeed * 1.3
      if (b.vy < maxUp) b.vy = maxUp

      let impulseMul = 1
      let lookHeadDeg = 0
      if (cfg.lastLook && b.isLastLook) {
        const lookEnd = LAST_LOOK_START + LAST_LOOK_FREEZE
        if (b.age >= LAST_LOOK_START && b.age < lookEnd) {
          impulseMul = 0
          const k = (b.age - LAST_LOOK_START) / LAST_LOOK_FREEZE
          lookHeadDeg = -LAST_LOOK_HEAD_TURN_DEG * Math.sin(k * Math.PI)
        }
      }

      b.x += b.vx * dt * impulseMul
      b.y += b.vy * dt * impulseMul

      const heading = Math.atan2(b.vy, b.vx)
      const bobT = b.age * b.bobFreq * Math.PI * 2 + b.bobPhase
      const bobOffset = Math.sin(bobT) * b.bobAmp
      const perpX = -Math.sin(heading)
      const perpY = Math.cos(heading)

      let renderX = b.x + b.formOffsetX + perpX * bobOffset
      let renderY = b.y + b.formOffsetY + perpY * bobOffset

      if (useMagic && emerge < 1) {
        renderX = b.anchorX + (renderX - b.anchorX) * emerge
        renderY = b.anchorY + (renderY - b.anchorY) * emerge
      }

      const birdFlapTwoPi = baseFlapTwoPi * (cfg.flapJitter ? b.flapHzMul : 1)
      const flapT = b.age * birdFlapTwoPi + b.flapPhase
      const flap = (Math.sin(flapT) + 1) * 0.5
      const scaleY = 1 + b.flapAmp - b.flapAmp * 2 * flap

      const headingDeg = (heading * 180) / Math.PI
      const headBobDeg = cfg.headBob ? HEAD_BOB_DEG * Math.sin(flapT) : 0
      const rotDeg =
        (headingDeg - BIRD_NATURAL_HEADING_DEG) * BIRD_HEADING_FOLLOW
        + (b.rotJitter * 180) / Math.PI
        + headBobDeg
        + lookHeadDeg

      b.el.style.opacity = opacity.toFixed(2)
      b.el.style.transform =
        `translate(${renderX.toFixed(1)}px, ${renderY.toFixed(1)}px) ` +
        `rotate(${rotDeg.toFixed(1)}deg) ` +
        `scale(${emergeScale.toFixed(3)}, ${(emergeScale * scaleY).toFixed(3)})`

      const M = 80
      if (renderY < -M || renderX > vpW + M) {
        b.alive = false
        b.el.remove()
        anyDied = true
      }
    }

    if (anyDied) {
      for (let i = birds.length - 1; i >= 0; i--) {
        if (!birds[i]!.alive) birds.splice(i, 1)
      }
    }

    if (birds.length > 0) {
      rafId = requestAnimationFrame(loop)
    }
  }

  return {
    spawn,
    cleanup: () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
      for (const b of birds) {
        b.alive = false
        b.el.remove()
      }
      birds.length = 0
    },
  }
}
