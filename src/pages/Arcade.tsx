import { useCallback } from 'react'
import { ArcadeGallery } from '@/components/arcade/ArcadeGallery'
import { PlaygroundWrapper } from '@/components/PlaygroundWrapper'
import { useTheme } from '@/contexts/ThemeContext'

// Numeric hue per accent — must match arcade-themes.css and ui-playground.
const ACCENT_HUES = {
  table: 34,
  portrait: 43,
  sky: 204,
  pizza: 15,
  vineyard: 90,
} as const

export function Arcade() {
  const { accentColor, setAccentColor, resolvedAppearance, setAppearanceMode } = useTheme()

  // ArcadeGallery's appearance change writes "dark" | "light"; bridge into
  // the portfolio's tri-state by overriding the user's system preference.
  const handleAppearanceChange = useCallback(
    (a: 'dark' | 'light') => setAppearanceMode(a),
    [setAppearanceMode]
  )

  return (
    <PlaygroundWrapper>
      <ArcadeGallery
        audio={false}
        coinInsert="tip"
        refill="pop"
        accent={accentColor}
        accentHue={ACCENT_HUES[accentColor]}
        hueSource="accent"
        font="ibm-plex-mono"
        appearance={resolvedAppearance}
        themeControls="footer"
        onAccentChange={setAccentColor}
        onAppearanceChange={handleAppearanceChange}
      />
    </PlaygroundWrapper>
  )
}
