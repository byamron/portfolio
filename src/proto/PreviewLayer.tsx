import { useEffect, useRef } from 'react'
import { animate as animateUntyped, motion, useMotionValue, useReducedMotion, type AnimationOptions, type MotionValue } from 'framer-motion'
import { usePreview } from './PreviewContext'
import { ProtoMediaFill } from './ProtoMedia'
import { usePreviewDials } from './tuning'

// See tuning.ts: DialKit's transition configs are structurally but not
// nominally compatible with framer-motion's — this narrows `animate()` back
// to the single-value overload so call sites below stay fully typed.
const animate = animateUntyped as (value: MotionValue<number>, target: number, options?: AnimationOptions) => ReturnType<typeof animateUntyped>

const GAP = 14
const MINI_RADIUS = 8
const HERO_RADIUS = 16
const EDGE = 8

export function PreviewLayer() {
  const { state, linkEls, heroEl, settle } = usePreview()
  const reducedMotion = useReducedMotion()
  const dials = usePreviewDials()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const w = useMotionValue(0)
  const h = useMotionValue(0)
  const scale = useMotionValue(1)
  const opacity = useMotionValue(0)
  const radius = useMotionValue(MINI_RADIUS)

  // The link the layer is currently presented on (for link→link dedupe), and the
  // last shown entry (kept mounted while hidden so videos don't restart on re-hover).
  const hoveredId = useRef<string | null>(null)
  const lastEntry = useRef(state.entry)
  if (state.entry) lastEntry.current = state.entry

  useEffect(() => {
    const { phase, entry } = state
    const wasVisible = opacity.get() > 0.01

    if (phase === 'hidden' || !entry) {
      hoveredId.current = null
      animate(opacity, 0, { duration: reducedMotion ? 0 : dials.fadeOut })
      return
    }

    if (phase === 'hover') {
      if (hoveredId.current === entry.id) return
      const linkEl = linkEls.current.get(entry.id)
      if (!linkEl) return
      hoveredId.current = entry.id

      // Mini previews match the media's aspect ratio at a constant area, centered
      // above the link (below if there's no room), clamped to the viewport.
      const enter = () => {
        const mw = Math.round(Math.sqrt(dials.size * dials.size * entry.aspect))
        const mh = Math.round(mw / entry.aspect)
        const r = linkEl.getBoundingClientRect()
        const tx = Math.max(EDGE, Math.min(r.left + r.width / 2 - mw / 2, window.innerWidth - mw - EDGE))
        const below = r.top - mh - GAP < EDGE
        const ty = below ? r.bottom + GAP : r.top - mh - GAP
        x.set(tx); w.set(mw); h.set(mh); radius.set(MINI_RADIUS)
        if (reducedMotion) {
          y.set(ty); scale.set(1)
        } else {
          // Mostly appear, with a slight scale + drift up out of the link.
          y.set(ty + (below ? -dials.rise : dials.rise))
          scale.set(dials.scaleFrom)
          animate(y, ty, dials.enter)
          animate(scale, 1, dials.enter)
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

    // phase === 'morph': fly to the hero, then hand off (settle → hidden branch fades).
    if (!heroEl) return // hero not mounted yet; effect re-runs when it registers
    hoveredId.current = null
    if (reducedMotion || !wasVisible) {
      settle() // touch / keyboard-without-hover / reduced motion: no flight
      return
    }
    const r = heroEl.getBoundingClientRect()
    scale.set(1)
    animate(opacity, 1, { duration: 0.1 })
    Promise.all([
      animate(x, r.left, dials.morph), animate(y, r.top, dials.morph),
      animate(w, r.width, dials.morph), animate(h, r.height, dials.morph),
      animate(radius, HERO_RADIUS, { duration: 0.25 }),
    ]).then(() => settle())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, heroEl, reducedMotion])

  const shown = state.entry ?? lastEntry.current

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x, y, width: w, height: h, scale, opacity, borderRadius: radius,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 50,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.22)',
        background: 'var(--bg)',
      }}
    >
      {shown && <ProtoMediaFill key={shown.id} media={shown.media} label={shown.label} />}
    </motion.div>
  )
}
