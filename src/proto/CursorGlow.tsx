import { useEffect, useRef } from 'react'
import { useProtoSettings } from './protoSettings'

// Over these the glass pill already lights the cursor; the page glow steps
// aside so the two don't stack.
const MELT_MS = 220
const LIT_BY_PILL = '[data-proto-link], [data-social], [data-contact-card], [data-link-card], [data-sidebar-control], .sidebar-icon-trigger, [data-sidebar] [role=slider], [data-sidebar] [role=switch]'

// The glow's falloff (candle-like: soft core, long tail, zero at the rim).
const falloff = (t: number) => Math.exp(-3.5 * t * t) * Math.pow(Math.max(0, 1 - t * t), 1.5)

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}

/** Paints the glow once into a canvas — per-pixel alpha from the falloff,
 *  with random dithering before rounding. At these intensities the glow is
 *  only a few 8-bit levels above the page, so a CSS gradient bands into a
 *  flat disc with a visible rim; dithering dissolves those steps. */
function renderGlow(radius: number, intensity: number, tint: number): string {
  const root = document.documentElement
  const dark = root.getAttribute('data-theme') === 'dark'
  const hue = parseFloat(getComputedStyle(root).getPropertyValue('--accent-hue')) || 34
  // Same light as the glass pill's cursor light (useGlassHighlight).
  const [r, g, b] = dark ? hslToRgb(hue, 0.15 * tint, 0.9) : hslToRgb(hue, Math.min(1, 0.45 * tint), 0.5)
  const peak = (dark ? 0.04 : 0.072) * intensity
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const size = Math.round(radius * 2 * dpr)
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const half = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = Math.hypot(x + 0.5 - half, y + 0.5 - half) / half
      if (t >= 1) continue
      const i = (y * size + x) * 4
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b
      img.data[i + 3] = Math.max(0, Math.min(255, Math.floor(peak * falloff(t) * 255 + Math.random())))
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}

/**
 * Experiment (/new/simple): the glass pill's cursor light, everywhere. Same
 * accent-tinted radial as useGlassHighlight's pill fill (proto.css), on a
 * fixed layer under the page content. Mouse/pen only; off under
 * reduced motion, like the pill's own light.
 */
export function CursorGlow() {
  const { cursorGlow } = useProtoSettings()
  const ref = useRef<HTMLDivElement>(null)

  // The texture: re-rendered only when the glow's settings or the theme change.
  useEffect(() => {
    const el = ref.current
    if (!el || !cursorGlow.on) return
    const paint = () => { el.style.backgroundImage = `url(${renderGlow(cursorGlow.radius, cursorGlow.intensity, cursorGlow.tint)})` }
    paint()
    const mo = new MutationObserver(paint)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] })
    document.addEventListener('theme-changed', paint)
    return () => { mo.disconnect(); document.removeEventListener('theme-changed', paint) }
  }, [cursorGlow.on, cursorGlow.radius, cursorGlow.intensity, cursorGlow.tint])

  useEffect(() => {
    const el = ref.current
    if (!el || !cursorGlow.on) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let x = 0
    let y = 0
    let scale = 1
    // Composited: the gradient is painted once on a 2r×2r layer and only
    // ever moved/scaled with transform (and faded with opacity) — no
    // per-frame repaint of a full-screen gradient.
    // Over a link the glow melts into the pill: it slides to the pill's
    // centre and shrinks as it fades (data-melt turns on the transform /
    // opacity transitions). Leaving re-grows it back to the cursor, then it
    // tracks the pointer directly again.
    let melted: Element | null = null
    let meltTimer = 0
    const place = (px: number, py: number) => {
      el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) scale(${scale})`
    }
    const melt = () => {
      window.clearTimeout(meltTimer)
      el.setAttribute('data-melt', '')
      meltTimer = window.setTimeout(() => el.removeAttribute('data-melt'), MELT_MS + 40)
    }
    const paint = () => {
      raf = 0
      if (!melted) place(x, y)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      x = e.clientX
      y = e.clientY
      const card = (e.target as Element).closest?.(LIT_BY_PILL) ?? null
      if (card && card !== melted) {
        melted = card
        const r = card.getBoundingClientRect()
        melt()
        scale = 0.35
        place(r.left + r.width / 2, r.top + r.height / 2)
        el.removeAttribute('data-on')
      } else if (!card && melted) {
        melted = null
        melt()
        scale = 1
        place(x, y)
        el.setAttribute('data-on', '')
      } else if (!card) {
        el.setAttribute('data-on', '')
      }
      if (!raf) raf = requestAnimationFrame(paint)
    }
    const onLeave = () => el.removeAttribute('data-on')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
      window.clearTimeout(meltTimer)
      el.removeAttribute('data-on')
    }
  }, [cursorGlow.on])

  if (!cursorGlow.on) return null
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="cursor-glow"
      style={{ width: cursorGlow.radius * 2, height: cursorGlow.radius * 2 }}
    />
  )
}
