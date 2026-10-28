import { useEffect, useRef } from 'react'
import { useProtoSettings } from './protoSettings'

// Over these the glass pill already lights the cursor; the page glow steps
// aside so the two don't stack.
const MELT_MS = 220
const LIT_BY_PILL = '[data-proto-link], [data-social], [data-contact-card], [data-link-card], [data-sidebar-control], .sidebar-icon-trigger, [data-sidebar] [role=slider], [data-sidebar] [role=switch]'

/**
 * Experiment (/new/simple): the glass pill's cursor light, everywhere. Same
 * accent-tinted radial as useGlassHighlight's pill fill (proto.css), on a
 * fixed layer under the page content. Mouse/pen only; off under
 * reduced motion, like the pill's own light.
 */
export function CursorGlow() {
  const { cursorGlow } = useProtoSettings()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !cursorGlow.on) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let x = 0
    let y = 0
    // Over a link the glow melts into the pill: it slides to the pill's
    // centre and shrinks as it fades (data-melt turns on transitions for the
    // @property-registered position/scale). Leaving re-grows it from there
    // back to the cursor, then it tracks the pointer directly again.
    let melted: Element | null = null
    let meltTimer = 0
    const setPos = (px: number, py: number) => {
      el.style.setProperty('--gx', `${px}px`)
      el.style.setProperty('--gy', `${py}px`)
    }
    const melt = () => {
      window.clearTimeout(meltTimer)
      el.setAttribute('data-melt', '')
      meltTimer = window.setTimeout(() => el.removeAttribute('data-melt'), MELT_MS + 40)
    }
    const paint = () => {
      raf = 0
      if (!melted) setPos(x, y)
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
        setPos(r.left + r.width / 2, r.top + r.height / 2)
        el.style.setProperty('--glow-scale', '0.35')
        el.removeAttribute('data-on')
      } else if (!card && melted) {
        melted = null
        melt()
        setPos(x, y)
        el.style.setProperty('--glow-scale', '1')
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
      style={{
        '--glow-r': `${cursorGlow.radius}px`,
        '--glow-k': cursorGlow.intensity,
        '--glow-stop': `${cursorGlow.falloff}%`,
        '--glow-tint': cursorGlow.tint,
      } as React.CSSProperties}
    />
  )
}
