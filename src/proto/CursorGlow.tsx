import { useEffect, useRef, useSyncExternalStore } from 'react'
import { GLIDE_TARGETS } from '@/components/SidebarThemeControls'
import { GLASS_DEFAULTS } from '@/hooks/useGlassHighlight'
import { onWindowLeave } from '@/hooks/useWindowLeave'
import { PAGE_GLASS_CARDS, useProtoSettings } from './protoSettings'

const MELT_MS = 220
// Over these the glass pill already lights the cursor; the page glow steps
// aside so the two don't stack.
const LIT_BY_PILL = `${PAGE_GLASS_CARDS}, ${GLIDE_TARGETS}`

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}

/** The glow's coverage (0–255, fractional) per pixel: a candle-like falloff
 *  (soft core, long tail, zero at the rim), written in terms of t² so
 *  there's no sqrt. Cached: it doesn't depend on the hue, so an accent
 *  change only re-tints it. */
const masks = new Map<string, Float32Array>()
function glowMask(size: number, peak: number) {
  const key = `${size}|${peak}`
  const hit = masks.get(key)
  if (hit) return hit
  const mask = new Float32Array(size * size)
  const half = size / 2
  const inv = 1 / (half * half)
  for (let y = 0; y < size; y++) {
    const dy = y + 0.5 - half
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - half
      const u = (dx * dx + dy * dy) * inv // t²
      if (u >= 1) continue
      const v = 1 - u
      mask[y * size + x] = Math.min(255, peak * Math.exp(-3.5 * u) * v * Math.sqrt(v) * 255)
    }
  }
  // Light and dark peaks differ; a couple of radius/intensity tweaks at most.
  if (masks.size >= 4) masks.delete(masks.keys().next().value!)
  masks.set(key, mask)
  return mask
}

/** Everything the texture depends on, as a key, so callers can skip
 *  identical repaints. */
function glowKey(radius: number, intensity: number, tint: number) {
  const root = document.documentElement
  const dark = root.getAttribute('data-theme') === 'dark'
  const hue = parseFloat(getComputedStyle(root).getPropertyValue('--accent-hue')) || 34
  return { dark, hue, key: [dark, hue, radius, intensity, tint].join('|') }
}

/** Paints the glow into its canvas. At these intensities it's only a few
 *  8-bit levels above the page, so a smooth gradient bands into a flat disc
 *  with a visible rim; random dithering dissolves those steps. The canvas
 *  stores colour premultiplied by alpha, so the dither is done there, per
 *  channel: at alpha 1–3 a plain RGBA write would round the hue away (a
 *  grey core inside a yellow ring). Each premultiplied channel is dithered
 *  on its own and written back un-premultiplied, so the browser's own
 *  conversion lands on exactly that value — on average, the true falloff in
 *  the true colour. Painted at 1×: for a glow this soft, extra density
 *  only costs paint time. */
function renderGlow(c: HTMLCanvasElement, radius: number, intensity: number, tint: number, dark: boolean, hue: number) {
  // The glass pill's cursor light (useGlassHighlight): light mode from its
  // defaults; dark mode is fixed there too (hsl(hue 15% 90%) at cursorLight).
  const G = GLASS_DEFAULTS
  const [r, g, b] = dark
    ? hslToRgb(hue, 0.15 * tint, 0.9)
    : hslToRgb(hue, Math.min(1, (G.lightCursorSaturation / 100) * tint), G.lightCursorLightness / 100)
  const peak = G.cursorLight * (dark ? 1 : G.lightCursorIntensity) * intensity
  const size = Math.round(radius * 2)
  const mask = glowMask(size, peak)
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const d = img.data
  const kr = r / 255, kg = g / 255, kb = b / 255
  const ch = (k: number, A: number, a: number) => Math.round((Math.min(a, Math.floor(k * A + Math.random())) * 255) / a)
  for (let i = 0; i < mask.length; i++) {
    const A = mask[i]!
    if (A === 0) continue
    const a = Math.floor(A + Math.random())
    if (a === 0) continue
    const o = i * 4
    d[o] = ch(kr, A, a); d[o + 1] = ch(kg, A, a); d[o + 2] = ch(kb, A, a); d[o + 3] = a
  }
  ctx.putImageData(img, 0, 0)
}

// Mouse/pen only, and off under reduced motion (like the pill's own light).
// Live, so a mid-session settings change applies without a reload; when it's
// off there's no canvas, so nothing is painted that nobody sees.
const GLOW_QUERIES = ['(pointer: coarse)', '(prefers-reduced-motion: reduce)']
const canGlow = () => GLOW_QUERIES.every(q => !window.matchMedia(q).matches)
function subscribeGlow(cb: () => void) {
  const lists = GLOW_QUERIES.map(q => window.matchMedia(q))
  lists.forEach(l => l.addEventListener('change', cb))
  return () => lists.forEach(l => l.removeEventListener('change', cb))
}

/**
 * Experiment (/new/simple): the glass pill's cursor light, everywhere — a
 * dithered canvas on a fixed, compositor-only layer under the page content.
 */
export function CursorGlow() {
  const { cursorGlow } = useProtoSettings()
  const ref = useRef<HTMLCanvasElement>(null)
  const on = useSyncExternalStore(subscribeGlow, canGlow, () => false) && cursorGlow.on

  // The texture: repainted only when something it depends on changes
  // (ThemeContext fires 'theme-changed' for every theme update, incl. the
  // background-intensity slider, which the glow ignores — hence the key).
  useEffect(() => {
    const el = ref.current
    if (!el || !on) return
    let last = ''
    const repaint = () => {
      const { dark, hue, key } = glowKey(cursorGlow.radius, cursorGlow.intensity, cursorGlow.tint)
      if (key === last) return
      last = key
      renderGlow(el, cursorGlow.radius, cursorGlow.intensity, cursorGlow.tint, dark, hue)
    }
    repaint()
    document.addEventListener('theme-changed', repaint)
    return () => document.removeEventListener('theme-changed', repaint)
  }, [on, cursorGlow.radius, cursorGlow.intensity, cursorGlow.tint])

  useEffect(() => {
    const el = ref.current
    if (!el || !on) return
    // Composited: the texture is painted once on a 2r×2r layer and only ever
    // moved/scaled with transform (and faded with opacity) — no per-frame
    // repaint.
    // Over a link the glow melts into the pill: it slides to the pill's
    // centre and shrinks as it fades. Leaving re-grows it back to the cursor.
    // Both glide with an exponential ease-out toward a moving target (the
    // cursor keeps going), then it tracks the pointer exactly again — no
    // re-targeted CSS transition, so no snap when the glide ends.
    let raf = 0
    let lastT = 0
    let x = 0, y = 0 // pointer
    const cur = { x: 0, y: 0, s: 1 }
    let gliding = false
    let melted: Element | null = null
    let meltTimer = 0
    const TAU = MELT_MS / 4.4 // ~99% of the way there in MELT_MS
    const place = () => {
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%) scale(${cur.s})`
    }
    const melt = () => {
      // data-melt only retimes the opacity fade (CSS).
      window.clearTimeout(meltTimer)
      el.setAttribute('data-melt', '')
      meltTimer = window.setTimeout(() => el.removeAttribute('data-melt'), MELT_MS + 40)
      gliding = true
      lastT = 0
    }
    const step = (now: number) => {
      raf = 0
      let tx = x, ty = y, ts = 1
      if (melted) {
        const r = melted.getBoundingClientRect()
        tx = r.left + r.width / 2; ty = r.top + r.height / 2; ts = 0.35
      }
      if (gliding) {
        const dt = lastT ? Math.min(64, now - lastT) : 16
        lastT = now
        const k = 1 - Math.exp(-dt / TAU)
        cur.x += (tx - cur.x) * k; cur.y += (ty - cur.y) * k; cur.s += (ts - cur.s) * k
        const done = Math.abs(tx - cur.x) < 0.3 && Math.abs(ty - cur.y) < 0.3 && Math.abs(ts - cur.s) < 0.002
        if (done) { cur.x = tx; cur.y = ty; cur.s = ts; gliding = false } else raf = requestAnimationFrame(step)
      } else if (!melted) {
        cur.x = tx; cur.y = ty; cur.s = 1
      }
      place()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      x = e.clientX
      y = e.clientY
      const card = (e.target as Element).closest?.(LIT_BY_PILL) ?? null
      if (card && card !== melted) {
        melted = card
        melt()
        el.removeAttribute('data-on')
      } else if (!card && melted) {
        melted = null
        melt()
        el.setAttribute('data-on', '')
      } else if (!card) {
        if (!el.hasAttribute('data-on')) {
          // First sighting (or back from outside the window): start here.
          if (!gliding) { cur.x = x; cur.y = y; cur.s = 1 }
          el.setAttribute('data-on', '')
        }
      }
      if (!raf) raf = requestAnimationFrame(step)
    }
    const onLeave = () => el.removeAttribute('data-on')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    // Switching apps / Spaces sends no pointerleave.
    const offWindow = onWindowLeave(onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      offWindow()
      cancelAnimationFrame(raf)
      window.clearTimeout(meltTimer)
      el.removeAttribute('data-on')
    }
  }, [on])

  if (!on) return null
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="cursor-glow"
      style={{ width: cursorGlow.radius * 2, height: cursorGlow.radius * 2 }}
    />
  )
}
