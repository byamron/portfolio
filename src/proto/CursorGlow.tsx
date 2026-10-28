import { useEffect, useRef } from 'react'
import { useProtoSettings } from './protoSettings'

// Over these the glass pill already lights the cursor; the page glow steps
// aside so the two don't stack.
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
    const paint = () => {
      raf = 0
      el.style.setProperty('--gx', `${x}px`)
      el.style.setProperty('--gy', `${y}px`)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      x = e.clientX
      y = e.clientY
      const overLink = !!(e.target as Element).closest?.(LIT_BY_PILL)
      el.toggleAttribute('data-on', !overLink)
      if (!raf) raf = requestAnimationFrame(paint)
    }
    const onLeave = () => el.removeAttribute('data-on')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
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
