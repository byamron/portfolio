import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'

export type AccentColor = 'table' | 'portrait' | 'sky' | 'pizza' | 'vineyard'
export const VALID_ACCENTS: AccentColor[] = ['table', 'portrait', 'sky', 'pizza', 'vineyard']
export type AppearanceMode = 'system' | 'light' | 'dark'
const VALID_MODES: AppearanceMode[] = ['system', 'light', 'dark']
type ResolvedAppearance = 'light' | 'dark'

// Base HSL values for each accent × mode (from tokens.md)
const BG_BASE: Record<AccentColor, Record<'light' | 'dark', [number, number, number]>> = {
  sky:      { light: [200, 23, 95], dark: [200, 22, 8] },
  table:    { light: [30, 17, 91],  dark: [33, 18, 12] },
  portrait: { light: [39, 15, 92],  dark: [41, 14, 10] },
  pizza:    { light: [10, 30, 96],  dark: [8, 22, 7] },
  vineyard: { light: [86, 18, 93], dark: [88, 18, 9] },
}

// Named intensity presets (kept for reference / future labeling)
export const INTENSITY_LEVELS = [
  { name: 'Whisper',  t: 0 },
  { name: 'Subtle',   t: 0.33 },
  { name: 'Tinted',   t: 0.67 },
  { name: 'Warm',     t: 1 },
]

// Continuous intensity: t ∈ [0, 1]
// t=0 → satMult 1.0, no lightness shift  |  t=1 → satMult 2.8, full shift

export function computeBg(accent: AccentColor, mode: 'light' | 'dark', t: number): string {
  const entry = BG_BASE[accent]
  if (!entry) return mode === 'dark' ? 'hsl(33, 18%, 12%)' : 'hsl(30, 17%, 91%)'
  const [h, s, l] = entry[mode]
  const satMult = 1.0 + 1.8 * t
  const lightShift = mode === 'light' ? -10 * t : 2 * t
  const newS = Math.min(100, s * satMult)
  const newL = l + lightShift
  return `hsl(${h}, ${newS.toFixed(1)}%, ${newL.toFixed(1)}%)`
}

interface ThemeContextValue {
  accentColor: AccentColor
  setAccentColor: (color: AccentColor) => void
  cycleAccent: () => void
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
    return VALID_ACCENTS.includes(stored as AccentColor) ? (stored as AccentColor) : 'table'
  })

  const [appearanceMode, setAppearanceModeState] = useState<AppearanceMode>(() => {
    const stored = localStorage.getItem(APPEARANCE_KEY)
    return VALID_MODES.includes(stored as AppearanceMode) ? (stored as AppearanceMode) : 'system'
  })

  const [bgIntensity, setBgIntensityState] = useState<number>(() => {
    const stored = localStorage.getItem(INTENSITY_KEY)
    if (!stored) return 0.2
    const parsed = parseFloat(stored)
    // Migrate old 0–3 integer values to 0–1 range
    const value = (Number.isInteger(parsed) && parsed >= 1 && parsed <= 3) ? parsed / 3 : parsed
    return Math.min(1, Math.max(0, value))
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

  // Sync attributes, --bg, and meta theme-color in one pass
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', resolvedAppearance)
    html.setAttribute('data-accent', accentColor)

    const bg = computeBg(accentColor, resolvedAppearance, bgIntensity)
    if (bgIntensity < 0.001) {
      html.style.removeProperty('--bg')
    } else {
      html.style.setProperty('--bg', bg)
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', bg)

    document.dispatchEvent(new CustomEvent('theme-changed'))
  }, [accentColor, resolvedAppearance, bgIntensity])

  const setAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color)
    localStorage.setItem(ACCENT_KEY, color)
  }, [])

  const cycleAccent = useCallback(() => {
    setAccentColorState(prev => {
      const next = VALID_ACCENTS[(VALID_ACCENTS.indexOf(prev) + 1) % VALID_ACCENTS.length] ?? 'table'
      localStorage.setItem(ACCENT_KEY, next)
      return next
    })
  }, [])

  const setAppearanceMode = useCallback((mode: AppearanceMode) => {
    setAppearanceModeState(mode)
    localStorage.setItem(APPEARANCE_KEY, mode)
  }, [])

  const setBgIntensity = useCallback((level: number) => {
    const clamped = Math.min(1, Math.max(0, level))
    setBgIntensityState(clamped)
    localStorage.setItem(INTENSITY_KEY, String(clamped))
  }, [])

  const value = useMemo<ThemeContextValue>(() => ({
    accentColor,
    setAccentColor,
    cycleAccent,
    appearanceMode,
    setAppearanceMode,
    resolvedAppearance,
    bgIntensity,
    setBgIntensity,
  }), [accentColor, setAccentColor, cycleAccent, appearanceMode, setAppearanceMode, resolvedAppearance,
       bgIntensity, setBgIntensity])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
