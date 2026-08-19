import { useEffect, useRef } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { usePreview } from './PreviewContext'
import { ProtoMediaFill } from './ProtoMedia'

// Mini preview keeps the hero's 8:5 (800×500) aspect so the morph is a pure scale.
const MINI_W = 288
const MINI_H = 180
const GAP = 14
const MINI_RADIUS = 8
const HERO_RADIUS = 16
const EDGE = 8

const MORPH_SPRING = { type: 'spring', stiffness: 340, damping: 30 } as const
const GROW_SPRING = { type: 'spring', stiffness: 420, damping: 32 } as const
const FOLLOW_SPRING = { type: 'spring', stiffness: 160, damping: 24 } as const

interface Rect { x: number; y: number; w: number; h: number }

function miniRectFor(linkEl: HTMLElement, pointerX: number | null, placement: string): Rect {
  const r = linkEl.getBoundingClientRect()
  let x: number
  if (pointerX == null || placement === 'static') {
    x = r.left + r.width / 2 - MINI_W / 2
  } else {
    x = pointerX - MINI_W / 2
    // Keep the frame visually attached to its link even when the pointer sits at an edge.
    x = Math.max(r.left - 48, Math.min(x, r.right + 48 - MINI_W))
  }
  x = Math.max(EDGE, Math.min(x, window.innerWidth - MINI_W - EDGE))
  let y = r.top - MINI_H - GAP
  if (y < EDGE) y = r.bottom + GAP
  return { x, y, w: MINI_W, h: MINI_H }
}

function heroRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, w: r.width, h: r.height }
}

export function PreviewLayer() {
  const { state, placement, entrance, measureVersion, linkEls, heroEl, dock, settle } = usePreview()
  const reducedMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const w = useMotionValue(MINI_W)
  const h = useMotionValue(MINI_H)
  const scale = useMotionValue(1)
  const opacity = useMotionValue(0)
  const radius = useMotionValue(MINI_RADIUS)

  // The link the layer is currently presented on (null when not in a hover presentation).
  const hoveredId = useRef<string | null>(null)

  useEffect(() => {
    const { phase, entry, pointerX } = state

    const snapTo = (r: Rect, rad: number) => { x.set(r.x); y.set(r.y); w.set(r.w); h.set(r.h); radius.set(rad) }

    if (phase === 'hidden' || !entry) {
      hoveredId.current = null
      animate(opacity, 0, { duration: reducedMotion ? 0 : 0.16 })
      return
    }

    if (phase === 'hover') {
      const linkEl = linkEls.current.get(entry.id)
      if (!linkEl) return
      const target = miniRectFor(linkEl, pointerX, placement)

      if (hoveredId.current === entry.id) {
        // Same link: only `follow` placement repositions, with a damped drift.
        if (placement === 'follow' && !reducedMotion) {
          animate(x, target.x, FOLLOW_SPRING)
          animate(y, target.y, FOLLOW_SPRING)
        }
        return
      }

      // New presentation — always local to the link: fade in place, or grow out of it.
      // Never travel from wherever the layer last was.
      const wasVisible = hoveredId.current !== null && opacity.get() > 0.01
      hoveredId.current = entry.id
      const enter = () => {
        snapTo(target, MINI_RADIUS)
        if (entrance === 'grow' && !reducedMotion) {
          scale.set(0.82)
          animate(scale, 1, GROW_SPRING)
        } else {
          scale.set(1)
        }
        animate(opacity, 1, { duration: reducedMotion ? 0 : 0.18 })
      }
      if (wasVisible && !reducedMotion) {
        // Moving link → link: dip out at the old spot, re-enter at the new one.
        animate(opacity, 0, { duration: 0.08 }).then(enter)
      } else {
        enter()
      }
      return
    }

    if (phase === 'morph') {
      const el = heroEl.current
      if (!el) return // hero not mounted yet; re-run on measureVersion bump
      const wasVisible = hoveredId.current !== null && opacity.get() > 0.01
      hoveredId.current = null
      if (reducedMotion || !wasVisible) {
        // Touch / keyboard-without-hover / reduced motion: no flight, just hand off.
        dock()
        return
      }
      const target = heroRect(el)
      scale.set(1)
      animate(opacity, 1, { duration: 0.1 })
      const t = MORPH_SPRING
      const anims = [
        animate(x, target.x, t), animate(y, target.y, t),
        animate(w, target.w, t), animate(h, target.h, t),
        animate(radius, HERO_RADIUS, { duration: 0.25 }),
      ]
      Promise.all(anims).then(() => dock())
      return
    }

    if (phase === 'docked') {
      // In-page hero is now visible underneath; release the layer.
      animate(opacity, 0, { duration: 0.12 }).then(() => {
        // Reset so a later hover never inherits the hero geometry.
        settle()
      })
      return
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, placement, entrance, measureVersion, reducedMotion])

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x, y, width: w, height: h, scale, opacity, borderRadius: radius,
        transformOrigin: '50% 100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 50,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
        background: 'var(--bg)',
      }}
    >
      <AnimatePresence mode="sync">
        {state.entry && (
          <motion.div
            key={state.entry.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <ProtoMediaFill media={state.entry.media} label={state.entry.label} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
