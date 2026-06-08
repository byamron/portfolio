import { useRef, useEffect, useCallback, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  setupBirdSwarm,
  resolveEpicenter,
  FLOCK_DEFAULTS,
  type FlockConfig,
  type BirdSwarmAPI,
} from '../utils/birdSwarm'
import {
  setupShatter,
  FRACTURE_CRACK_DRAW_MS,
  type ShatterAPI,
  type ShatterColors,
} from '../utils/shatter'
import type { GlassHighlightHandle } from '../hooks/useGlassHighlight'

const ORIGIN_MODE = 'cursor' as const
const BURST_MIN = 4
const BURST_MAX = 10
const STRAGGLER1_MIN_COUNT = 1
const STRAGGLER1_MAX_COUNT = 3
const STRAGGLER2_COUNT = 1
const STRAGGLER1_MS = 2000
const STRAGGLER2_MS = 5000
const PILL_SPIKE_AMOUNT = 0.15
// 150ms — tightened from the playground's 200ms. The pill still has time to
// land on the X but the crack starts feel more "caused" by the hover.
const FRACTURE_START_DELAY_MS = 150
const FRACTURE_PREVIEW_MS = 500

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function readShatterColors(): ShatterColors {
  const root = document.documentElement
  const isDark = root.getAttribute('data-theme') === 'dark'
  const hueStr = getComputedStyle(root).getPropertyValue('--accent-hue').trim()
  const hue = parseFloat(hueStr) || 34
  if (isDark) {
    return {
      fill: `hsla(${hue}, 25%, 65%, 0.24)`,
      stroke: `hsla(${hue}, 30%, 80%, 0.58)`,
      highlight: 'rgba(255, 255, 255, 0.35)',
    }
  }
  return {
    fill: `hsla(${hue}, 40%, 28%, 0.30)`,
    stroke: `hsla(${hue}, 55%, 20%, 0.62)`,
    highlight: 'rgba(255, 255, 255, 0.55)',
  }
}

interface FlockXProps {
  href: string
  children: ReactNode
  style?: CSSProperties
  onLinkEnter?: () => void
  onLinkLeave?: () => void
  glassApi: GlassHighlightHandle
}

/**
 * X link with the Flock easter egg attached. Renders an `<a>` with the
 * existing contact-card markup, then portals bird + shatter layers to
 * document.body so they sit above all page chrome. Skips on coarse pointers
 * and `prefers-reduced-motion`.
 */
export function FlockX({ href, children, style, onLinkEnter, onLinkLeave, glassApi }: FlockXProps) {
  const xLinkRef = useRef<HTMLAnchorElement>(null)
  const birdLayerRef = useRef<HTMLDivElement>(null)
  const shatterLayerRef = useRef<SVGSVGElement>(null)
  const swarmRef = useRef<BirdSwarmAPI | null>(null)
  const shatterApiRef = useRef<ShatterAPI | null>(null)

  // Decide once whether to enable the effect. matchMedia is read at mount;
  // remounting on theme change isn't needed because the colors are read
  // fresh at trigger time.
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false
    if (window.matchMedia('(pointer: coarse)').matches) return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return true
  })

  // Mutable config the swarm reads each frame.
  const flockConfigRef = useRef<FlockConfig>({ ...FLOCK_DEFAULTS })

  // Hover state + cursor + pending timers.
  const isHoveringRef = useRef(false)
  const cursorRef = useRef<{ x: number; y: number } | null>(null)
  const stragglerTimersRef = useRef<number[]>([])
  const pendingFractureCancelRef = useRef<(() => void) | null>(null)

  const clearStragglerTimers = useCallback(() => {
    for (const t of stragglerTimersRef.current) clearTimeout(t)
    stragglerTimersRef.current = []
  }, [])

  useEffect(() => {
    if (!enabled) return
    const layer = birdLayerRef.current
    if (!layer) return
    const swarm = setupBirdSwarm(layer, flockConfigRef)
    swarmRef.current = swarm
    return () => {
      swarmRef.current = null
      swarm.cleanup()
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const layer = shatterLayerRef.current
    if (!layer) return
    const api = setupShatter(layer)
    shatterApiRef.current = api
    return () => {
      shatterApiRef.current = null
      api.cleanup()
    }
  }, [enabled])

  useEffect(() => () => clearStragglerTimers(), [clearStragglerTimers])

  const spawnWave = useCallback((count: number, opts?: { lastLook?: boolean }) => {
    const xEl = xLinkRef.current
    const swarm = swarmRef.current
    if (!xEl || !swarm || count <= 0) return
    const rect = xEl.getBoundingClientRect()
    const cursor = cursorRef.current
    swarm.spawn(
      { mode: ORIGIN_MODE, rect, cursorX: cursor?.x, cursorY: cursor?.y },
      count,
      opts,
    )
  }, [])

  const triggerFlock = useCallback(() => {
    clearStragglerTimers()

    const fireBurst = () => {
      if (!isHoveringRef.current) return
      spawnWave(randInt(BURST_MIN, BURST_MAX))
      glassApi.spikePressure(PILL_SPIKE_AMOUNT)

      const r1Count = randInt(STRAGGLER1_MIN_COUNT, STRAGGLER1_MAX_COUNT)
      stragglerTimersRef.current.push(
        window.setTimeout(() => {
          if (isHoveringRef.current) spawnWave(r1Count)
        }, STRAGGLER1_MS),
      )
      stragglerTimersRef.current.push(
        window.setTimeout(() => {
          if (isHoveringRef.current) spawnWave(STRAGGLER2_COUNT, { lastLook: true })
        }, STRAGGLER2_MS),
      )
    }

    const shatterApi = shatterApiRef.current
    const xEl = xLinkRef.current
    if (!shatterApi || !xEl) {
      fireBurst()
      return
    }

    // Wait for the glass pill to settle on the X before drawing cracks.
    const startTimerId = window.setTimeout(() => {
      if (!isHoveringRef.current) return
      const liveXEl = xLinkRef.current
      if (!liveXEl) return
      const xRect = liveXEl.getBoundingClientRect()
      if (xRect.width < 4) return

      const epicenter = resolveEpicenter(ORIGIN_MODE, xRect, cursorRef.current)
      const colors = readShatterColors()

      glassApi.shakeFor(FRACTURE_CRACK_DRAW_MS)
      const fractureCancel = shatterApi.fracture(
        { left: xRect.left, top: xRect.top, width: xRect.width, height: xRect.height },
        epicenter,
        colors,
        {
          previewMs: FRACTURE_PREVIEW_MS,
          onBreak: () => {
            pendingFractureCancelRef.current = null
            glassApi.setPillVisible(false)
            fireBurst()
          },
        },
      )
      pendingFractureCancelRef.current = () => {
        fractureCancel()
        glassApi.cancelShake()
      }
    }, FRACTURE_START_DELAY_MS)

    pendingFractureCancelRef.current = () => clearTimeout(startTimerId)
  }, [spawnWave, clearStragglerTimers, glassApi])

  const endHover = useCallback(() => {
    isHoveringRef.current = false
    clearStragglerTimers()
    pendingFractureCancelRef.current?.()
    pendingFractureCancelRef.current = null
    glassApi.setPillVisible(true)
  }, [clearStragglerTimers, glassApi])

  const onMouseEnter = useCallback((e: React.MouseEvent) => {
    onLinkEnter?.()
    if (!enabled) return
    if (isHoveringRef.current) return
    isHoveringRef.current = true
    cursorRef.current = { x: e.clientX, y: e.clientY }
    triggerFlock()
  }, [enabled, onLinkEnter, triggerFlock])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enabled) return
    cursorRef.current = { x: e.clientX, y: e.clientY }
  }, [enabled])

  const onMouseLeave = useCallback(() => {
    onLinkLeave?.()
    if (!enabled) return
    endHover()
  }, [enabled, onLinkLeave, endHover])

  const onFocus = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    onLinkEnter?.()
    if (!enabled) return
    if (isHoveringRef.current) return
    isHoveringRef.current = true
    const r = e.currentTarget.getBoundingClientRect()
    cursorRef.current = { x: r.right, y: r.top + r.height / 2 }
    triggerFlock()
  }, [enabled, onLinkEnter, triggerFlock])

  const onBlur = useCallback(() => {
    onLinkLeave?.()
    if (!enabled) return
    endHover()
  }, [enabled, onLinkLeave, endHover])

  return (
    <>
      <a
        ref={xLinkRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-contact-card
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {children}
      </a>
      {enabled && typeof document !== 'undefined' && createPortal(
        <>
          <style>{`@keyframes flock-crack-draw { to { stroke-dashoffset: 0; } }`}</style>
          <div
            ref={birdLayerRef}
            aria-hidden="true"
            data-flock-bird-layer
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
          <svg
            ref={shatterLayerRef}
            aria-hidden="true"
            data-flock-shatter-layer
            style={{
              position: 'fixed',
              inset: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 9998,
            }}
          />
        </>,
        document.body,
      )}
    </>
  )
}
