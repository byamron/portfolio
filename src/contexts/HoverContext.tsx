import { createContext, useContext, useState, useMemo, useRef, useCallback, type ReactNode } from 'react'

/** How long to wait before clearing hover state to null (ms).
 *  Matches the glass pill's clearDelay so both systems stay in sync. */
const HOVER_CLEAR_DELAY = 150

interface HoverContextValue {
  hoveredProjectId: string | null
  setHoveredProjectId: (id: string | null) => void
  hoveringLink: boolean
  setHoveringLink: (hovering: boolean) => void
  navigatingProjectId: string | null
  setNavigatingProjectId: (id: string | null) => void
}

const HoverContext = createContext<HoverContextValue | null>(null)

export function HoverProvider({ children }: { children: ReactNode }) {
  const [hoveredProjectId, setHoveredProjectIdRaw] = useState<string | null>(null)
  const [hoveringLink, setHoveringLink] = useState(false)
  const [navigatingProjectId, setNavigatingProjectId] = useState<string | null>(null)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setHoveredProjectId = useCallback((id: string | null) => {
    // Always cancel any pending clear
    if (clearTimerRef.current !== null) {
      clearTimeout(clearTimerRef.current)
      clearTimerRef.current = null
    }

    if (id !== null) {
      // Immediately show the new project's preview
      setHoveredProjectIdRaw(id)
    } else {
      // Delay clearing — gives the cursor time to reach the next card
      clearTimerRef.current = setTimeout(() => {
        clearTimerRef.current = null
        setHoveredProjectIdRaw(null)
      }, HOVER_CLEAR_DELAY)
    }
  }, [])

  const value = useMemo<HoverContextValue>(() => ({
    hoveredProjectId,
    setHoveredProjectId,
    hoveringLink,
    setHoveringLink,
    navigatingProjectId,
    setNavigatingProjectId,
  }), [hoveredProjectId, setHoveredProjectId, hoveringLink, navigatingProjectId])

  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>
}

export function useHover() {
  const ctx = useContext(HoverContext)
  if (!ctx) throw new Error('useHover must be used within HoverProvider')
  return ctx
}
