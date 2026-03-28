import { useEffect } from 'react'
import { projectsById } from '@/data/projects'

const OFFSET_X = 18
const FONT_SIZE = 22 // matches --text-size-narrative

/**
 * Minimal cursor companion — only shows "coming soon" on non-link project cards.
 * Works in all cursor modes.
 */
export function CursorCompanion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    document.querySelectorAll('[data-cursor-companion]').forEach(el => el.remove())

    const label = document.createElement('div')
    label.setAttribute('aria-hidden', 'true')
    label.setAttribute('data-cursor-companion', '')
    Object.assign(label.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '9998',
      top: '0',
      left: '0',
      opacity: '0',
      willChange: 'transform',
      whiteSpace: 'nowrap',
      fontSize: `${FONT_SIZE}px`,
      fontFamily: "'Literata', serif",
      fontWeight: '300',
      lineHeight: '1',
      transition: reducedMotion ? 'none' : 'opacity 180ms ease-in-out',
    })
    document.body.appendChild(label)

    let visible = false
    let leaveTimer: ReturnType<typeof setTimeout> | null = null

    function skinLabel() {
      const hue = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim()
      ) || 34
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      label.style.color = isDark
        ? `hsl(${hue}, 30%, 60%)`
        : `hsl(${hue}, 25%, 40%)`
    }

    skinLabel()
    document.addEventListener('theme-changed', skinLabel)

    function show() {
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null }
      if (!visible) {
        label.textContent = 'coming soon'
        visible = true
        label.style.transition = reducedMotion ? 'none' : 'opacity 180ms ease-in-out'
        label.style.opacity = '1'
      }
    }

    function hide() {
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null }
      if (!visible) return
      visible = false
      // Instant hide — no transition so the label doesn't linger over active project cards
      label.style.transition = 'none'
      label.style.opacity = '0'
    }

    function handlePointerMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return

      const target = document.elementFromPoint(e.clientX, e.clientY)
      if (!target) { hide(); return }

      const linkCard = target.closest('[data-link-card]')
      if (linkCard) {
        const projectId = linkCard.getAttribute('data-project-id')
        if (projectId) {
          const project = projectsById[projectId]
          if (project && !project.isLink) {
            show()
          } else {
            hide()
          }
        } else {
          hide()
        }
      } else {
        hide()
      }

      // Position to the right of cursor, vertically centered
      const lw = label.offsetWidth || 0
      const lh = label.offsetHeight || 0
      let x = e.clientX + OFFSET_X
      let y = e.clientY - lh / 2
      if (x + lw > window.innerWidth - 4) x = e.clientX - lw - 8
      if (x < 4) x = 4
      if (y < 4) y = 4
      if (y + lh > window.innerHeight - 4) y = window.innerHeight - lh - 4
      label.style.transform = `translate(${x}px, ${y}px)`
    }

    document.addEventListener('pointermove', handlePointerMove)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      if (leaveTimer) clearTimeout(leaveTimer)
      document.removeEventListener('theme-changed', skinLabel)
      label.remove()
    }
  }, [])

  return null
}
