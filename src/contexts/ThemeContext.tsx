import { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from 'react'
import type { AccentColor } from '@/data/projects'

type AppearanceMode = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
  appearanceMode: AppearanceMode
  setAppearanceMode: (mode: AppearanceMode) => void
  resolvedAppearance: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemPreference(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    () => (document.documentElement.getAttribute('data-accent') as AccentColor) || 'table'
  )
  const [appearanceMode, setAppearanceModeState] = useState<AppearanceMode>(
    () => (localStorage.getItem('appearanceMode') as AppearanceMode) || 'system'
  )

  const resolvedAppearance = appearanceMode === 'system' ? getSystemPreference() : appearanceMode

  const setAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color)
    document.documentElement.setAttribute('data-accent', color)
  }, [])

  const setAppearanceMode = useCallback((mode: AppearanceMode) => {
    setAppearanceModeState(mode)
    localStorage.setItem('appearanceMode', mode)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedAppearance)
  }, [resolvedAppearance])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor)
  }, [accentColor])

  useEffect(() => {
    if (appearanceMode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setAppearanceModeState(prev => prev === 'system' ? 'system' : prev)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [appearanceMode])

  const value = useMemo(() => ({
    accentColor, setAccentColor, appearanceMode, setAppearanceMode, resolvedAppearance,
  }), [accentColor, setAccentColor, appearanceMode, setAppearanceMode, resolvedAppearance])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider')
  return ctx
}
