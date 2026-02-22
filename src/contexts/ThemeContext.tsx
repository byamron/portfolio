import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

export type AccentColor = 'table' | 'portrait' | 'sky' | 'pizza'
export type AppearanceMode = 'system' | 'light' | 'dark'
type ResolvedAppearance = 'light' | 'dark'

interface ThemeContextValue {
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
  appearanceMode: AppearanceMode
  setAppearanceMode: (mode: AppearanceMode) => void
  resolvedAppearance: ResolvedAppearance
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const ACCENT_KEY = 'accentColor'
const APPEARANCE_KEY = 'appearanceMode'

function getSystemPreference(): ResolvedAppearance {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const stored = localStorage.getItem(ACCENT_KEY)
    return (stored as AccentColor) || 'table'
  })

  const [appearanceMode, setAppearanceModeState] = useState<AppearanceMode>(() => {
    const stored = localStorage.getItem(APPEARANCE_KEY)
    return (stored as AppearanceMode) || 'system'
  })

  const [systemPref, setSystemPref] = useState<ResolvedAppearance>(getSystemPreference)
  const resolvedAppearance = appearanceMode === 'system' ? systemPref : appearanceMode

  // Listen for system preference changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemPref(e.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // Sync data-theme and data-accent attributes on <html>
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', resolvedAppearance)
    html.setAttribute('data-accent', accentColor)
  }, [resolvedAppearance, accentColor])

  // Update <meta name="theme-color"> for browser chrome
  // Deferred to next frame so CSS has recalculated after data-attribute changes
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) {
        meta.remove()
        const fresh = document.createElement('meta')
        fresh.name = 'theme-color'
        fresh.content = bg
        document.head.appendChild(fresh)
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [resolvedAppearance, accentColor])

  const setAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color)
    localStorage.setItem(ACCENT_KEY, color)
  }, [])

  const setAppearanceMode = useCallback((mode: AppearanceMode) => {
    setAppearanceModeState(mode)
    localStorage.setItem(APPEARANCE_KEY, mode)
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({
    accentColor,
    setAccentColor,
    appearanceMode,
    setAppearanceMode,
    resolvedAppearance,
  }), [accentColor, setAccentColor, appearanceMode, setAppearanceMode, resolvedAppearance])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
