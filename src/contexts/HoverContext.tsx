import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

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
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null)
  const [hoveringLink, setHoveringLink] = useState(false)
  const [navigatingProjectId, setNavigatingProjectId] = useState<string | null>(null)

  const value = useMemo<HoverContextValue>(() => ({
    hoveredProjectId,
    setHoveredProjectId,
    hoveringLink,
    setHoveringLink,
    navigatingProjectId,
    setNavigatingProjectId,
  }), [hoveredProjectId, hoveringLink, navigatingProjectId])

  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>
}

export function useHover() {
  const ctx = useContext(HoverContext)
  if (!ctx) throw new Error('useHover must be used within HoverProvider')
  return ctx
}
