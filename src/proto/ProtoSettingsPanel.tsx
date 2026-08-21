import { useRef, useState } from 'react'
import { Monitor, Moon, NavigationArrow, Sun } from '@phosphor-icons/react'
import { useTheme, VALID_ACCENTS, type AppearanceMode } from '@/contexts/ThemeContext'
import { useCursor, type CursorMode } from '@/contexts/CursorContext'

const APPEARANCE: { mode: AppearanceMode; label: string; Icon: typeof Monitor }[] = [
  { mode: 'system', label: 'System theme', Icon: Monitor },
  { mode: 'light', label: 'Light theme', Icon: Sun },
  { mode: 'dark', label: 'Dark theme', Icon: Moon },
]

// Hairline divider between control groups — same recipe as the sidebar's
// trigger↔swatches dividers (design-language.md § Control placement), adapted
// to a full-width horizontal line since this panel stacks groups vertically
// rather than the sidebar's single vertical column.
function Divider() {
  return <div style={{ height: 1, background: 'var(--text-dark)', opacity: 0.15 }} />
}

/** Press feedback shared by every direct-click control in this panel — the
 * site's one intentional overshoot (design-language.md § Imagery), reserved
 * for direct user-initiated presses. Scales down on press, springs back on
 * release/leave. */
function usePress(springTransition: string) {
  const [pressed, setPressed] = useState(false)
  return {
    style: {
      transform: pressed ? 'scale(0.94)' : 'scale(1)',
      transition: pressed ? 'transform 80ms ease-out' : springTransition,
    } as React.CSSProperties,
    handlers: {
      onPointerDown: () => setPressed(true),
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
    },
  }
}

function IconButton({
  active, label, onClick, springPress, children,
}: { active: boolean; label: string; onClick: () => void; springPress: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  const press = usePress(springPress)
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      {...press.handlers}
      style={{
        width: 40, height: 40, display: 'grid', placeItems: 'center',
        background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer',
        opacity: active ? 1 : hovered ? 0.75 : 0.4,
        transition: 'opacity 160ms ease',
        padding: 0,
        ...press.style,
      }}
    >
      <span
        style={{
          width: 24, height: 24, display: 'grid', placeItems: 'center', borderRadius: 6,
          background: hovered ? 'color-mix(in srgb, var(--swatch) 12%, transparent)' : 'transparent',
          outline: active ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
          outlineOffset: 3,
          transition: 'background 160ms ease',
        }}
      >
        {children}
      </span>
    </button>
  )
}

function Swatch({
  accent, selected, onClick, springPress,
}: { accent: string; selected: boolean; onClick: () => void; springPress: string }) {
  const [hovered, setHovered] = useState(false)
  const press = usePress(springPress)
  return (
    <button
      type="button"
      aria-label={`${accent} accent`}
      aria-pressed={selected}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      {...press.handlers}
      style={{
        width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer',
        background: `var(--swatch-${accent})`,
        outline: selected
          ? `1.5px solid color-mix(in srgb, var(--swatch-${accent}) 50%, transparent)`
          : hovered
            ? `1.5px solid color-mix(in srgb, var(--swatch-${accent}) 30%, transparent)`
            : 'none',
        outlineOffset: 3, padding: 0,
        ...press.style,
      }}
    />
  )
}

/**
 * The customization surface — accent, intensity, appearance, cursor. Wired to
 * the real ThemeContext / CursorContext. Swatch colors come from the theme.css
 * `--swatch-*` custom properties so they can never drift from the site palette.
 */
export function ProtoSettingsPanel({ springPress }: { springPress: string }) {
  const { accentColor, setAccentColor, appearanceMode, setAppearanceMode, bgIntensity, setBgIntensity } = useTheme()
  const { cursorMode, setCursorMode } = useCursor()
  const stripRect = useRef<DOMRect | null>(null)

  const setFromPointer = (clientX: number) => {
    const r = stripRect.current
    if (!r) return
    setBgIntensity(Math.max(0, Math.min(1, (clientX - r.left) / r.width)))
  }

  const cursorModes: { mode: CursorMode; label: string; render: React.ReactNode }[] = [
    { mode: 'standard', label: 'Standard cursor', render: <NavigationArrow size={18} color="var(--text-dark)" /> },
    { mode: 'figpal', label: 'Figpal cursor', render: <img src="/images/figpal.png" alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} /> },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: '20px 24px',
        borderRadius: 16,
        background: 'color-mix(in srgb, var(--swatch) 5%, var(--bg))',
        backdropFilter: 'blur(1px) saturate(1.2)',
        border: '0.5px solid color-mix(in srgb, var(--swatch) 20%, transparent)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.10), 0 12px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* Accent swatches + intensity strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          {VALID_ACCENTS.map(accent => (
            <Swatch
              key={accent}
              accent={accent}
              selected={accent === accentColor}
              onClick={() => setAccentColor(accent)}
              springPress={springPress}
            />
          ))}
        </div>

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
      </div>

      <Divider />

      {/* Appearance modes */}
      <div style={{ display: 'flex', gap: 6, marginLeft: -8 }}>
        {APPEARANCE.map(({ mode, label, Icon }) => (
          <IconButton key={mode} active={appearanceMode === mode} label={label} onClick={() => setAppearanceMode(mode)} springPress={springPress}>
            <Icon size={18} color="var(--text-dark)" />
          </IconButton>
        ))}
      </div>

      <Divider />

      {/* Cursor modes */}
      <div style={{ display: 'flex', gap: 6, marginLeft: -8 }}>
        {cursorModes.map(({ mode, label, render }) => (
          <IconButton key={mode} active={cursorMode === mode} label={label} onClick={() => setCursorMode(mode)} springPress={springPress}>
            {render}
          </IconButton>
        ))}
      </div>
    </div>
  )
}
