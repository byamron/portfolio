import { useEffect, useRef } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { usePreview } from './PreviewContext'
import type { ProtoMedia } from './data'

// Mini preview keeps the hero's 8:5 (800×500) aspect so the morph is a pure scale.
const MINI_W = 288
const MINI_H = 180
const GAP = 14
const MINI_RADIUS = 8
const HERO_RADIUS = 16
const EDGE = 8

const SPRING = { type: 'spring', stiffness: 340, damping: 30 } as const
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

function MediaContent({ media, label }: { media: ProtoMedia; label: string }) {
  const fill = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } as const
  if (media.type === 'video') {
    return <video src={media.src} style={fill} autoPlay muted loop playsInline preload="metadata" />
  }
  if (media.type === 'image') {
    return <img src={media.src} alt={label} style={fill} />
  }
  return <div style={{ ...fill, background: 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))' }} />
}

export function PreviewLayer() {
  const { state, placement, measureVersion, linkEls, heroEl, dock, settle } = usePreview()
  const reducedMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const w = useMotionValue(MINI_W)
  const h = useMotionValue(MINI_H)
  const opacity = useMotionValue(0)
  const radius = useMotionValue(MINI_RADIUS)

  // Whether the layer currently has a meaningful on-screen position to animate from.
  const placed = useRef(false)

  useEffect(() => {
    const { phase, entry, pointerX } = state

    const snapTo = (r: Rect, rad: number) => { x.set(r.x); y.set(r.y); w.set(r.w); h.set(r.h); radius.set(rad) }
    const springTo = (r: Rect, rad: number, spring: typeof SPRING | typeof FOLLOW_SPRING = SPRING) => {
      const t = reducedMotion ? { duration: 0 } : spring
      return [
        animate(x, r.x, t), animate(y, r.y, t),
        animate(w, r.w, t), animate(h, r.h, t),
        animate(radius, rad, reducedMotion ? { duration: 0 } : { duration: 0.25 }),
      ]
    }

    if (phase === 'hidden' || !entry) {
      placed.current = false
      animate(opacity, 0, { duration: reducedMotion ? 0 : 0.18 })
      return
    }

    if (phase === 'hover') {
      const linkEl = linkEls.current.get(entry.id)
      if (!linkEl) return
      const target = miniRectFor(linkEl, pointerX, placement)
      if (!placed.current) {
        snapTo(target, MINI_RADIUS)
        placed.current = true
        animate(opacity, 1, { duration: reducedMotion ? 0 : 0.2 })
        if (!reducedMotion) {
          // Breathe in: slight scale-up from beneath the settle point.
          y.set(target.y + 6)
          animate(y, target.y, SPRING)
        }
      } else {
        animate(opacity, 1, { duration: 0.15 })
        springTo(target, MINI_RADIUS, placement === 'follow' ? FOLLOW_SPRING : SPRING)
      }
      return
    }

    if (phase === 'morph') {
      const el = heroEl.current
      if (!el) return // hero not mounted yet; re-run on measureVersion bump
      const target = heroRect(el)
      if (reducedMotion || !placed.current) {
        // Touch / keyboard-without-hover / reduced motion: no flight, just hand off.
        dock()
        return
      }
      animate(opacity, 1, { duration: 0.1 })
      const anims = springTo(target, HERO_RADIUS)
      Promise.all(anims).then(() => dock())
      return
    }

    if (phase === 'docked') {
      // In-page hero is now visible underneath; release the layer.
      placed.current = true
      animate(opacity, 0, { duration: 0.12 })
      return
    }

    if (phase === 'return') {
      const linkEl = linkEls.current.get(entry.id)
      if (!linkEl) {
        // Home not mounted yet (re-run on measureVersion), or link gone — fade out.
        if (measureVersion >= 0 && document.readyState) { /* no-op, keeps lint quiet */ }
        return
      }
      if (reducedMotion || !placed.current) { settle(); return }
      const target = miniRectFor(linkEl, null, 'static')
      animate(opacity, 1, { duration: 0.1 })
      const anims = springTo(target, MINI_RADIUS)
      Promise.all(anims).then(() => {
        animate(opacity, 0, { duration: 0.2 }).then(() => settle())
      })
      return
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, placement, measureVersion, reducedMotion])

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x, y, width: w, height: h, opacity, borderRadius: radius,
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
            <MediaContent media={state.entry.media} label={state.entry.label} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
