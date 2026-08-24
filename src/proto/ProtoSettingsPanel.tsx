import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Monitor, Moon, NavigationArrow, Sun } from '@phosphor-icons/react'
import { useTheme, VALID_ACCENTS, type AccentColor, type AppearanceMode } from '@/contexts/ThemeContext'
import { useCursor, type CursorMode } from '@/contexts/CursorContext'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useLayoutDials, useExperimentDials } from './tuning'

const SPRING_PRESS = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'

function ControlButton({
  active, label, onClick, size, pressStyle, pressHandlers, children,
  onMouseEnter, onMouseLeave,
}: {
  active: boolean; label: string; onClick: () => void; size: number
  pressStyle: React.CSSProperties; pressHandlers: Record<string, (() => void) | undefined>
  children: React.ReactNode
  onMouseEnter?: () => void; onMouseLeave?: () => void
}) {
  return (
    <button
      data-settings-card data-link-card
      type="button" aria-label={label} aria-pressed={active}
      onClick={onClick}
      onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
      {...pressHandlers}
      style={{
        width: size, height: size,
        display: 'grid', placeItems: 'center',
        background: active ? 'color-mix(in srgb, var(--swatch) 12%, var(--bg))' : 'transparent',
        border: 'none', borderRadius: size * 0.18,
        cursor: 'pointer', opacity: active ? 1 : 0.45,
        padding: 0, position: 'relative', zIndex: 1,
        transition: 'opacity 160ms ease, background 200ms ease',
        ...pressStyle,
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--text-dark)', opacity: 0.10, marginBlock: 8 }} />
}

function MomentumThumb({ value, onChange, enabled }: { value: number; onChange: (v: number) => void; enabled: boolean }) {
  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 28 })
  const trackRef = useRef<HTMLDivElement>(null)
  const trackW = useRef(72)

  useEffect(() => {
    if (trackRef.current) trackW.current = trackRef.current.offsetWidth
    x.set(value * trackW.current)
  }, [value, x])

  const displayX = enabled ? springX : x
  const left = useTransform(displayX, v => `${v - 5.5}px`)

  return (
    <div
      ref={trackRef} role="slider" aria-label="Background intensity"
      aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)} aria-valuetext={`${Math.round(value * 100)}%`}
      tabIndex={0}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId)
        if (trackRef.current) trackW.current = trackRef.current.offsetWidth
        const r = e.currentTarget.getBoundingClientRect()
        onChange(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
      }}
      onPointerMove={e => { if (!e.buttons) return; const r = e.currentTarget.getBoundingClientRect(); onChange(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))) }}
      onPointerUp={() => window.dispatchEvent(new CustomEvent('proto-glow-pulse'))}
      onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(1, value + 0.05))
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(0, value - 0.05))
      }}
      style={{ position: 'relative', height: 11, cursor: 'grab', touchAction: 'none', userSelect: 'none', flex: 1 }}
    >
      <div style={{ position: 'absolute', top: 1.5, left: 0, right: 0, height: 8, borderRadius: 4, background: 'linear-gradient(to right, color-mix(in srgb, var(--swatch) 8%, transparent), color-mix(in srgb, var(--swatch) 55%, transparent))' }} />
      <motion.div style={{ position: 'absolute', top: 0, left, width: 11, height: 11, borderRadius: '50%', background: 'var(--swatch)', border: '1.5px solid color-mix(in srgb, var(--text-dark) 25%, transparent)', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </div>
  )
}

const APPEARANCE: { mode: AppearanceMode; label: string; Icon: typeof Monitor }[] = [
  { mode: 'system', label: 'System theme', Icon: Monitor },
  { mode: 'light', label: 'Light theme', Icon: Sun },
  { mode: 'dark', label: 'Dark theme', Icon: Moon },
]
const CURSORS: { mode: CursorMode; label: string }[] = [
  { mode: 'standard', label: 'Standard cursor' },
  { mode: 'figpal', label: 'Figpal cursor' },
]

export function ProtoSettingsPanel({ onHoverAccent }: { onHoverAccent?: (accent: AccentColor | null) => void }) {
  const { accentColor, setAccentColor, appearanceMode, setAppearanceMode, bgIntensity, setBgIntensity } = useTheme()
  const { cursorMode, setCursorMode } = useCursor()
  const layout = useLayoutDials()
  const exp = useExperimentDials()

  const accentGroupRef = useRef<HTMLDivElement>(null)
  const modeGroupRef = useRef<HTMLDivElement>(null)
  const cursorGroupRef = useRef<HTMLDivElement>(null)
  const nullRef = useRef<HTMLDivElement>(null)

  const glassCfg = (radius: number) => ({
    cardSelector: '[data-settings-card]', borderRadius: radius, clearDelay: 120,
    pillMaxLean: exp['Lean + tilt on hover'] ? 1.0 : 0,
    pillMaxTilt: exp['Lean + tilt on hover'] ? 1.0 : 0,
    pullStrength: exp['Edge pull between items'] ? 0.20 : 0,
  })

  useGlassHighlight(exp['Glass pill hover'] ? accentGroupRef : nullRef, glassCfg(layout.controlSize * 0.18))
  useGlassHighlight(exp['Glass pill hover'] ? modeGroupRef : nullRef, glassCfg(layout.controlSize * 0.18))
  useGlassHighlight(exp['Glass pill hover'] ? cursorGroupRef : nullRef, glassCfg(layout.controlSize * 0.18))

  const [pressedId, setPressedId] = useState<string | null>(null)
  const mkPressStyle = useCallback((id: string): React.CSSProperties => {
    if (!exp['Spring press on click']) return {}
    return {
      transform: pressedId === id ? `scale(${exp['Press depth']})` : 'scale(1)',
      transition: pressedId === id ? 'transform 80ms ease-out' : SPRING_PRESS,
    }
  }, [pressedId, exp])

  const mkPressHandlers = (id: string) => exp['Spring press on click'] ? ({
    onPointerDown: () => setPressedId(id),
    onPointerUp: () => setPressedId(null),
    onPointerLeave: () => setPressedId(null),
  }) : ({})

  const iconPx = layout.controlSize * 0.5
  const swatchInner = layout.controlSize - 6

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div ref={accentGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
          {VALID_ACCENTS.map((accent: AccentColor) => (
            <ControlButton
              key={accent} active={accent === accentColor}
              label={`${accent} accent`}
              onClick={() => setAccentColor(accent)}
              size={layout.controlSize}
              pressStyle={mkPressStyle(`accent-${accent}`)}
              pressHandlers={mkPressHandlers(`accent-${accent}`)}
              onMouseEnter={exp['Preview accent on hover'] ? () => onHoverAccent?.(accent) : undefined}
              onMouseLeave={exp['Preview accent on hover'] ? () => onHoverAccent?.(null) : undefined}
            >
              <div style={{ width: swatchInner, height: swatchInner, borderRadius: layout.controlSize * 0.14, background: `var(--swatch-${accent})` }} />
            </ControlButton>
          ))}
        </div>
        <MomentumThumb value={bgIntensity} onChange={setBgIntensity} enabled={exp['Momentum slider thumb']} />
      </div>

      <Divider />

      <div ref={modeGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        {APPEARANCE.map(({ mode, label, Icon }) => (
          <ControlButton
            key={mode} active={appearanceMode === mode}
            label={label} onClick={() => setAppearanceMode(mode)}
            size={layout.controlSize}
            pressStyle={mkPressStyle(`mode-${mode}`)}
            pressHandlers={mkPressHandlers(`mode-${mode}`)}
          >
            <Icon size={iconPx} color="var(--text-dark)" />
          </ControlButton>
        ))}
      </div>

      <Divider />

      <div ref={cursorGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        {CURSORS.map(({ mode, label }) => (
          <ControlButton
            key={mode} active={cursorMode === mode}
            label={label} onClick={() => setCursorMode(mode)}
            size={layout.controlSize}
            pressStyle={mkPressStyle(`cursor-${mode}`)}
            pressHandlers={mkPressHandlers(`cursor-${mode}`)}
          >
            {mode === 'standard'
              ? <NavigationArrow size={iconPx} color="var(--text-dark)" />
              : <img src="/images/figpal.png" alt="" style={{ width: iconPx, height: iconPx, objectFit: 'contain' }} />
            }
          </ControlButton>
        ))}
      </div>
    </div>
  )
}
