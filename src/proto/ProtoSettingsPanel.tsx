import { useRef } from 'react'
import { Monitor, Moon, NavigationArrow, Sun } from '@phosphor-icons/react'
import { useTheme, VALID_ACCENTS, type AccentColor, type AppearanceMode } from '@/contexts/ThemeContext'
import { useCursor, type CursorMode } from '@/contexts/CursorContext'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useSettingsDials } from './tuning'

const APPEARANCE: { mode: AppearanceMode; label: string; Icon: typeof Monitor }[] = [
  { mode: 'system', label: 'System theme', Icon: Monitor },
  { mode: 'light', label: 'Light theme', Icon: Sun },
  { mode: 'dark', label: 'Dark theme', Icon: Moon },
]

const CURSOR_MODES: { mode: CursorMode; label: string }[] = [
  { mode: 'standard', label: 'Standard cursor' },
  { mode: 'figpal', label: 'Figpal cursor' },
]

function Divider() {
  return <div style={{ height: 1, background: 'var(--text-dark)', opacity: 0.10, marginBlock: 8 }} />
}

/**
 * Settings panel — accent (as portrait thumbnails with swatch-colored border
 * rings), intensity strip, appearance modes, cursor modes. No container
 * enclosure — the controls breathe directly against the page background,
 * like the sidebar's own toolbar. Hover feedback uses the real glass-pill
 * system from main (`useGlassHighlight`).
 */
export function ProtoSettingsPanel() {
  const { accentColor, setAccentColor, appearanceMode, setAppearanceMode, bgIntensity, setBgIntensity } = useTheme()
  const { cursorMode, setCursorMode } = useCursor()
  const { swatchSize, borderWidth, controlSize, iconSize } = useSettingsDials()
  const stripRect = useRef<DOMRect | null>(null)

  // Glass pill for each control group — same per-group isolation as the sidebar.
  const accentGroupRef = useRef<HTMLDivElement>(null)
  const modeGroupRef = useRef<HTMLDivElement>(null)
  const cursorGroupRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(accentGroupRef, { cardSelector: '[data-settings-card]', borderRadius: swatchSize * 0.12, clearDelay: 120 })
  useGlassHighlight(modeGroupRef, { cardSelector: '[data-settings-card]', borderRadius: 12, clearDelay: 120 })
  useGlassHighlight(cursorGroupRef, { cardSelector: '[data-settings-card]', borderRadius: 12, clearDelay: 120 })

  const setFromPointer = (clientX: number) => {
    const r = stripRect.current
    if (!r) return
    setBgIntensity(Math.max(0, Math.min(1, (clientX - r.left) / r.width)))
  }

  const outerSize = swatchSize + borderWidth * 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Accent: portrait thumbnails with swatch-colored border rings */}
      <div ref={accentGroupRef} style={{ display: 'flex', gap: 14, position: 'relative' }}>
        {VALID_ACCENTS.map((accent: AccentColor) => {
          const selected = accent === accentColor
          return (
            <button
              key={accent}
              data-settings-card
              data-link-card
              type="button"
              aria-label={`${accent} accent`}
              aria-pressed={selected}
              onClick={() => setAccentColor(accent)}
              style={{
                width: outerSize,
                height: outerSize,
                padding: borderWidth,
                borderRadius: swatchSize * 0.14,
                border: 'none',
                cursor: 'pointer',
                background: `var(--swatch-${accent})`,
                outline: selected
                  ? `2px solid color-mix(in srgb, var(--swatch-${accent}) 60%, transparent)`
                  : 'none',
                outlineOffset: 3,
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
              }}
            >
              <img
                src={`/images/portrait-square-${accent}.jpg`}
                alt={accent}
                style={{
                  width: swatchSize,
                  height: swatchSize,
                  objectFit: 'cover',
                  borderRadius: swatchSize * 0.10,
                  display: 'block',
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Intensity strip */}
      <div
        role="slider"
        aria-label="Background intensity"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(bgIntensity * 100)}
        aria-valuetext={`${Math.round(bgIntensity * 100)}%`}
        tabIndex={0}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId)
          stripRect.current = e.currentTarget.getBoundingClientRect()
          setFromPointer(e.clientX)
        }}
        onPointerMove={e => { if (e.buttons) setFromPointer(e.clientX) }}
        onKeyDown={e => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setBgIntensity(Math.min(1, bgIntensity + 0.05))
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setBgIntensity(Math.max(0, bgIntensity - 0.05))
        }}
        style={{ position: 'relative', width: 72, height: 11, cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            position: 'absolute', top: 1.5, left: 0, width: 72, height: 8, borderRadius: 4,
            background: 'linear-gradient(to right, color-mix(in srgb, var(--swatch) 8%, transparent), color-mix(in srgb, var(--swatch) 55%, transparent))',
          }}
        />
        <div
          style={{
            position: 'absolute', top: 0, left: `calc(${bgIntensity * 100}% - 5.5px)`, width: 11, height: 11,
            borderRadius: '50%', background: 'var(--swatch)',
            border: '1.5px solid color-mix(in srgb, var(--text-dark) 25%, transparent)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        />
      </div>

      <Divider />

      {/* Appearance modes */}
      <div ref={modeGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        {APPEARANCE.map(({ mode, label, Icon }) => {
          const active = appearanceMode === mode
          return (
            <button
              key={mode}
              data-settings-card
              data-link-card
              type="button"
              aria-label={label}
              aria-pressed={active}
              onClick={() => setAppearanceMode(mode)}
              style={{
                width: controlSize, height: controlSize,
                display: 'grid', placeItems: 'center',
                background: 'transparent', border: 'none', borderRadius: 8,
                cursor: 'pointer', opacity: active ? 1 : 0.4, padding: 0,
                position: 'relative', zIndex: 1,
              }}
            >
              <span
                style={{
                  width: iconSize, height: iconSize, display: 'grid', placeItems: 'center', borderRadius: 6,
                  outline: active ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
                  outlineOffset: 3,
                }}
              >
                <Icon size={iconSize * 0.75} color="var(--text-dark)" />
              </span>
            </button>
          )
        })}
      </div>

      <Divider />

      {/* Cursor modes */}
      <div ref={cursorGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        {CURSOR_MODES.map(({ mode, label }) => {
          const active = cursorMode === mode
          return (
            <button
              key={mode}
              data-settings-card
              data-link-card
              type="button"
              aria-label={label}
              aria-pressed={active}
              onClick={() => setCursorMode(mode)}
              style={{
                width: controlSize, height: controlSize,
                display: 'grid', placeItems: 'center',
                background: 'transparent', border: 'none', borderRadius: 8,
                cursor: 'pointer', opacity: active ? 1 : 0.4, padding: 0,
                position: 'relative', zIndex: 1,
              }}
            >
              <span style={{ width: iconSize, height: iconSize, display: 'grid', placeItems: 'center', borderRadius: 6, outline: active ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none', outlineOffset: 3 }}>
                {mode === 'standard'
                  ? <NavigationArrow size={iconSize * 0.75} color="var(--text-dark)" />
                  : <img src="/images/figpal.png" alt="" style={{ width: iconSize, height: iconSize, objectFit: 'contain' }} />
                }
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
