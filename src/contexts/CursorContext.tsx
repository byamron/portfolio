import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'

export type CursorMode = 'standard' | 'invert' | 'figpal'

interface CursorContextValue {
  cursorMode: CursorMode
  setCursorMode: (mode: CursorMode) => void
}

const CursorContext = createContext<CursorContextValue | null>(null)

const CURSOR_KEY = 'cursorMode'

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorMode, setCursorModeState] = useState<CursorMode>(() => {
    const stored = localStorage.getItem(CURSOR_KEY)
    return (stored as CursorMode) || 'standard'
  })

  const setCursorMode = useCallback((mode: CursorMode) => {
    setCursorModeState(mode)
    localStorage.setItem(CURSOR_KEY, mode)
  }, [])

  const value = useMemo<CursorContextValue>(() => ({
    cursorMode,
    setCursorMode,
  }), [cursorMode, setCursorMode])

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>
}

export function useCursor() {
  const ctx = useContext(CursorContext)
  if (!ctx) throw new Error('useCursor must be used within CursorProvider')
  return ctx
}
