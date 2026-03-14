import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'

export type CursorMode = 'standard' | 'invert' | 'figpal'
const VALID_CURSOR_MODES: CursorMode[] = ['standard', 'invert', 'figpal']

export type CursorTintMode = 'tint-bold' | 'tint-subtle'
const VALID_TINT_MODES: CursorTintMode[] = ['tint-bold', 'tint-subtle']

interface CursorContextValue {
  cursorMode: CursorMode
  setCursorMode: (mode: CursorMode) => void
  cursorTintMode: CursorTintMode
}

const CursorContext = createContext<CursorContextValue | null>(null)

const CURSOR_KEY = 'cursorMode'
const TINT_KEY = 'cursorTintMode'

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorMode, setCursorModeState] = useState<CursorMode>(() => {
    const stored = localStorage.getItem(CURSOR_KEY)
    return VALID_CURSOR_MODES.includes(stored as CursorMode) ? (stored as CursorMode) : 'invert'
  })

  const [cursorTintMode] = useState<CursorTintMode>(() => {
    const stored = localStorage.getItem(TINT_KEY)
    return VALID_TINT_MODES.includes(stored as CursorTintMode) ? (stored as CursorTintMode) : 'tint-bold'
  })

  const setCursorMode = useCallback((mode: CursorMode) => {
    setCursorModeState(mode)
    localStorage.setItem(CURSOR_KEY, mode)
  }, [])

  const value = useMemo<CursorContextValue>(() => ({
    cursorMode,
    setCursorMode,
    cursorTintMode,
  }), [cursorMode, setCursorMode, cursorTintMode])

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>
}

export function useCursor() {
  const ctx = useContext(CursorContext)
  if (!ctx) throw new Error('useCursor must be used within CursorProvider')
  return ctx
}
