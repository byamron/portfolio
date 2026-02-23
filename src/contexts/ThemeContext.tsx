import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

export type AccentColor = 'table' | 'portrait' | 'sky' | 'pizza'
export type AppearanceMode = 'system' | 'light' | 'dark'
type ResolvedAppearance = 'light' | 'dark'

// Base HSL values for each accent × mode (from tokens.md)
const BG_BASE: Record<AccentColor, Record<'light' | 'dark', [number, number, number]>> = {
  sky:      { light: [200, 23, 95], dark: [200, 22, 8] },
  table:    { light: [30, 17, 91],  dark: [33, 18, 12] },
  portrait: { light: [42, 22, 91],  dark: [47, 18, 10] },
  pizza:    { light: [10, 30, 96],  dark: [8, 22, 7] },
}

// Each level scales saturation and shifts lightness away from pure white/black
export const INTENSITY_LEVELS = [
  { name: 'Whisper',  satMult: 1.0, lightShiftLight: 0,   lightShiftDark: 0 },
  { name: 'Subtle',   satMult: 1.5, lightShiftLight: -3,  lightShiftDark: 1 },
  { name: 'Tinted',   satMult: 2.0, lightShiftLight: -6,  lightShiftDark: 1.5 },
  { name: 'Warm',     satMult: 2.8, lightShiftLight: -10, lightShiftDark: 2 },
]

function computeBg(accent: AccentColor, mode: 'light' | 'dark', intensity: number): string {
  const [h, s, l] = BG_BASE[accent][mode]
  const level = INTENSITY_LEVELS[intensity]
  const newS = Math.min(100, s * level.satMult)
  const newL = mode === 'light'
    ? l + level.lightShiftLight
    : l + level.lightShiftDark
  return `hsl(${h}, ${newS.toFixed(1)}%, ${newL}%)`
}

interface ThemeContextValue {
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
  appearanceMode: AppearanceMode
  setAppearanceMode: (mode: AppearanceMode) => void
  resolvedAppearance: ResolvedAppearance
  bgIntensity: number
  setBgIntensity: (level: number) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const ACCENT_KEY = 'accentColor'
const APPEARANCE_KEY = 'appearanceMode'
const INTENSITY_KEY = 'bgIntensity'

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

  const [bgIntensity, setBgIntensityState] = useState<number>(() => {
    const stored = localStorage.getItem(INTENSITY_KEY)
    return stored ? Math.min(INTENSITY_LEVELS.length - 1, Math.max(0, parseInt(stored, 10))) : 0
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

  // Apply dynamic --bg when intensity > 0; remove override at 0 so CSS values are used
  useEffect(() => {
    if (bgIntensity === 0) {
      document.documentElement.style.removeProperty('--bg')
    } else {
      const bg = computeBg(accentColor, resolvedAppearance, bgIntensity)
      document.documentElement.style.setProperty('--bg', bg)
    }
  }, [accentColor, resolvedAppearance, bgIntensity])

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
  }, [resolvedAppearance, accentColor, bgIntensity])

  const setAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color)
    localStorage.setItem(ACCENT_KEY, color)
  }, [])

  const setAppearanceMode = useCallback((mode: AppearanceMode) => {
    setAppearanceModeState(mode)
    localStorage.setItem(APPEARANCE_KEY, mode)
  }, [])

  const setBgIntensity = useCallback((level: number) => {
    const clamped = Math.min(INTENSITY_LEVELS.length - 1, Math.max(0, level))
    setBgIntensityState(clamped)
    localStorage.setItem(INTENSITY_KEY, String(clamped))
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({
    accentColor,
    setAccentColor,
    appearanceMode,
    setAppearanceMode,
    resolvedAppearance,
    bgIntensity,
    setBgIntensity,
  }), [accentColor, setAccentColor, appearanceMode, setAppearanceMode, resolvedAppearance,
       bgIntensity, setBgIntensity])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
