import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'

interface HoverContextValue {
  hoveredProjectId: string | null
  setHoveredProjectId: (id: string | null) => void
}

const HoverContext = createContext<HoverContextValue | null>(null)

export function HoverProvider({ children }: { children: ReactNode }) {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null)
  const value = useMemo(() => ({ hoveredProjectId, setHoveredProjectId }), [hoveredProjectId])
  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>
}

export function useHoverContext() {
  const ctx = useContext(HoverContext)
  if (!ctx) throw new Error('useHoverContext must be used within HoverProvider')
  return ctx
}
