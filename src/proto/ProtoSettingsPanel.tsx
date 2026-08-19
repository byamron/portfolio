import { useRef } from 'react'
import { useTheme, VALID_ACCENTS, type AccentColor, type AppearanceMode } from '@/contexts/ThemeContext'

// Swatch identity colors (constant across modes) — from design-language.md § Color.
const SWATCH: Record<AccentColor, string> = {
  table: 'hsl(34, 50%, 60%)',
  portrait: 'hsl(43, 22%, 62%)',
  sky: 'hsl(204, 50%, 70%)',
  pizza: 'hsl(15, 53%, 64%)',
  vineyard: 'hsl(90, 36%, 48%)',
}

// Phosphor paths (256 viewBox) lifted from the Paper HH-0 frame.
const APPEARANCE: { mode: AppearanceMode; label: string; path: string }[] = [
  { mode: 'system', label: 'System theme', path: 'M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224Z' },
  { mode: 'light', label: 'Light theme', path: 'M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z' },
  { mode: 'dark', label: 'Dark theme', path: 'M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z' },
]

function IconButton({
  active, label, onClick, children,
}: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      style={{
        width: 40, height: 40, display: 'grid', placeItems: 'center',
        background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer',
        opacity: active ? 1 : 0.4, transition: 'opacity 160ms ease',
      }}
    >
      <span
        style={{
          width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: 6,
          outline: active ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
          outlineOffset: 3,
        }}
      >
        {children}
      </span>
    </button>
  )
}

/** The customization surface — accent, intensity, appearance. Wired to the real ThemeContext. */
export function ProtoSettingsPanel() {
  const { accentColor, setAccentColor, appearanceMode, setAppearanceMode, bgIntensity, setBgIntensity } = useTheme()
  const stripRef = useRef<HTMLDivElement>(null)

  const setFromPointer = (clientX: number) => {
    const el = stripRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setBgIntensity(Math.max(0, Math.min(1, (clientX - r.left) / r.width)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Accent swatches + intensity strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          {VALID_ACCENTS.map(accent => {
            const selected = accent === accentColor
            return (
              <button
                key={accent}
                type="button"
                aria-label={`${accent} accent`}
                aria-pressed={selected}
                onClick={() => setAccentColor(accent)}
                style={{
                  width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: SWATCH[accent],
                  outline: selected ? `1.5px solid color-mix(in srgb, ${SWATCH[accent]} 50%, transparent)` : 'none',
                  outlineOffset: 3, padding: 0,
                }}
              />
            )
          })}
        </div>

        <div
          ref={stripRef}
          role="slider"
          aria-label="Background intensity"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(bgIntensity * 100)}
          tabIndex={0}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setFromPointer(e.clientX) }}
          onPointerMove={e => { if (e.buttons) setFromPointer(e.clientX) }}
          onKeyDown={e => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setBgIntensity(Math.min(1, bgIntensity + 0.05))
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setBgIntensity(Math.max(0, bgIntensity - 0.05))
          }}
          style={{ position: 'relative', width: 72, height: 11, cursor: 'grab', touchAction: 'none' }}
        >
          <div
            style={{
              position: 'absolute', top: 1.5, left: 0, width: 72, height: 8, borderRadius: 4,
              background: `linear-gradient(to right, color-mix(in srgb, ${SWATCH[accentColor]} 8%, transparent), color-mix(in srgb, ${SWATCH[accentColor]} 55%, transparent))`,
            }}
          />
          <div
            style={{
              position: 'absolute', top: 0, left: `calc(${bgIntensity * 100}% - 5.5px)`, width: 11, height: 11,
              borderRadius: '50%', background: SWATCH[accentColor],
              border: '1.5px solid color-mix(in srgb, var(--text-dark) 25%, transparent)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            }}
          />
        </div>
      </div>

      {/* Appearance modes */}
      <div style={{ display: 'flex', gap: 6 }}>
        {APPEARANCE.map(({ mode, label, path }) => (
          <IconButton key={mode} active={appearanceMode === mode} label={label} onClick={() => setAppearanceMode(mode)}>
            <svg width="18" height="18" viewBox="0 0 256 256" style={{ display: 'block' }}>
              <path d={path} fill="var(--text-dark)" />
            </svg>
          </IconButton>
        ))}
      </div>
    </div>
  )
}
