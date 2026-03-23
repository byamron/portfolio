import { useEffect } from 'react'
import { useCursor } from '@/contexts/CursorContext'
import { useIsWide } from '@/hooks/useMediaQuery'
import { projectsById } from '@/data/projects'

const OFFSET_X = 18
const LEAVE_DELAY = 120

// Arrow: 36px Onest 400, "coming soon": 22px Literata 300
// Matches the original invert cursor morph typography — plain text, no box
const ARROW_FONT_SIZE = 36
const COMING_SOON_FONT_SIZE = 22

export function CursorCompanion() {
  const { cursorMode } = useCursor()
  const isWide = useIsWide()

  useEffect(() => {
    if (cursorMode !== 'standard' || !isWide) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Clean up any orphaned companion from previous runs (StrictMode / HMR)
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
      fontSize: `${ARROW_FONT_SIZE}px`,
      fontFamily: "'Onest', sans-serif",
      fontWeight: '400',
      lineHeight: '1',
      transition: reducedMotion ? 'none' : 'opacity 180ms ease-in-out',
    })
    document.body.appendChild(label)

    let visible = false
    let currentContent = ''
    let leftSide = false   // true when label should appear left of cursor (back arrow)
    let leaveTimer: ReturnType<typeof setTimeout> | null = null

    function skinLabel() {
      const hue = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--accent-hue').trim()
      ) || 34
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      // Theme-aware accent color: warm tint, darkish, good contrast on both modes
      label.style.color = isDark
        ? `hsl(${hue}, 30%, 60%)`
        : `hsl(${hue}, 25%, 40%)`
    }

    skinLabel()

    document.addEventListener('theme-changed', skinLabel)

    function show(text: string, placeLeft = false) {
      if (leaveTimer) {
        clearTimeout(leaveTimer)
        leaveTimer = null
      }
      leftSide = placeLeft
      if (currentContent !== text) {
        currentContent = text
        if (text === 'coming soon') {
          label.style.fontFamily = "'Literata', serif"
          label.style.fontWeight = '300'
          label.style.fontSize = `${COMING_SOON_FONT_SIZE}px`
        } else {
          label.style.fontFamily = "'Onest', sans-serif"
          label.style.fontWeight = '400'
          label.style.fontSize = `${ARROW_FONT_SIZE}px`
        }
        label.textContent = text
      }
      if (!visible) {
        visible = true
        label.style.opacity = '1'
      }
    }

    function hide() {
      if (!visible) return
      if (leaveTimer) return
      leaveTimer = setTimeout(() => {
        leaveTimer = null
        visible = false
        currentContent = ''
        label.style.opacity = '0'
      }, LEAVE_DELAY)
    }

    function handlePointerMove(e: PointerEvent) {
      // Only respond to mouse — no companion on touch devices
      if (e.pointerType !== 'mouse') return

      // Detect what's under the cursor first so leftSide is correct before positioning
      const target = document.elementFromPoint(e.clientX, e.clientY)
      if (!target) { hide(); return }

      // Back link → left arrow, placed to the left of cursor
      if (target.closest('[data-back-link]')) {
        show('\u2190', true)
      } else {
        // Project link card → arrow or "coming soon"
        const linkCard = target.closest('[data-link-card]')
        if (linkCard) {
          const projectId = linkCard.getAttribute('data-project-id')
          if (projectId) {
            const project = projectsById[projectId]
            if (project) {
              show(project.isLink ? '\u2192' : 'coming soon')
            } else {
              show('\u2192')
            }
          } else {
            // Link card without project data (e.g., heatmap GitHub link)
            show('\u2192')
          }
        } else if (target.closest('[data-contact-card]')) {
          // Contact card → arrow
          show('\u2192')
        } else {
          hide()
          // Still position while fading out so it doesn't freeze in place
        }
      }

      // Position the label inline with the cursor — same vertical center
      const lw = label.offsetWidth || 0
      const lh = label.offsetHeight || 0
      let x = leftSide
        ? e.clientX - OFFSET_X - lw   // left of cursor for back arrow
        : e.clientX + OFFSET_X         // right of cursor for everything else
      let y = e.clientY - lh / 2       // vertically center on cursor tip
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
      visible = false
      currentContent = ''
    }
  }, [cursorMode, isWide])

  return null
}
