import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
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

const SPRING_PRESS = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'

function Divider() {
  return <div style={{ height: 1, background: 'var(--text-dark)', opacity: 0.10, marginBlock: 8 }} />
}

function MomentumThumb({ value, onChange, enabled }: { value: number; onChange: (v: number) => void; enabled: boolean }) {
  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 28 })
  const trackRef = useRef<HTMLDivElement>(null)
  const trackW = useRef(72)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (trackRef.current) trackW.current = trackRef.current.offsetWidth
    x.set(value * trackW.current)
  }, [value, x])

  const displayX = enabled && !reducedMotion ? springX : x
  const left = useTransform(displayX, v => `${v - 5.5}px`)

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Background intensity"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={`${Math.round(value * 100)}%`}
      tabIndex={0}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId)
        if (trackRef.current) trackW.current = trackRef.current.offsetWidth
        const r = e.currentTarget.getBoundingClientRect()
        onChange(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
      }}
      onPointerMove={e => {
        if (!e.buttons) return
        const r = e.currentTarget.getBoundingClientRect()
        onChange(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
      }}
      onPointerUp={() => window.dispatchEvent(new CustomEvent('proto-glow-pulse'))}
      onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(1, value + 0.05))
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(0, value - 0.05))
      }}
      style={{ position: 'relative', width: 72, height: 11, cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
    >
      <div style={{ position: 'absolute', top: 1.5, left: 0, width: 72, height: 8, borderRadius: 4, background: 'linear-gradient(to right, color-mix(in srgb, var(--swatch) 8%, transparent), color-mix(in srgb, var(--swatch) 55%, transparent))' }} />
      <motion.div style={{ position: 'absolute', top: 0, left, width: 11, height: 11, borderRadius: '50%', background: 'var(--swatch)', border: '1.5px solid color-mix(in srgb, var(--text-dark) 25%, transparent)', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </div>
  )
}

function CursorLightOverlay({ enabled, intensity }: { enabled: boolean; intensity: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const onMove = useCallback((e: React.PointerEvent) => {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }, [enabled])
  if (!enabled) return null
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'auto',
        background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,${intensity}) 0%, transparent 55%)`,
        mixBlendMode: 'overlay',
      }}
    />
  )
}

export function ProtoSettingsPanel({ onHoverAccent }: { onHoverAccent?: (accent: AccentColor | null) => void }) {
  const { accentColor, setAccentColor, appearanceMode, setAppearanceMode, bgIntensity, setBgIntensity } = useTheme()
  const { cursorMode, setCursorMode } = useCursor()
  const dials = useSettingsDials()
  // Glass pill — toggleable so we can compare with/without
  const accentGroupRef = useRef<HTMLDivElement>(null)
  const modeGroupRef = useRef<HTMLDivElement>(null)
  const cursorGroupRef = useRef<HTMLDivElement>(null)

  const glassCfg = (radius: number, k: number, c: number) => ({
    cardSelector: '[data-settings-card]',
    borderRadius: radius,
    clearDelay: 120,
    springStiffness: k,
    springDamping: c,
    pillMaxLean: dials.leanOnHover ? 1.0 : 0,
    pillMaxTilt: dials.leanOnHover ? 1.0 : 0,
    pullStrength: dials.edgePull ? 0.20 : 0,
  })

  // Hooks must be called unconditionally — disable the container ref when glass pill is off
  const nullRef = useRef<HTMLDivElement>(null)
  const useGlass = (dials as Record<string, unknown>).glassPill as boolean
  useGlassHighlight(useGlass ? accentGroupRef : nullRef, glassCfg(dials.swatchSize * 0.12, dials.swatchSpringK, dials.swatchSpringC))
  useGlassHighlight(useGlass ? modeGroupRef : nullRef, glassCfg(12, dials.iconSpringK, dials.iconSpringC))
  useGlassHighlight(useGlass ? cursorGroupRef : nullRef, glassCfg(12, dials.iconSpringK, dials.iconSpringC))

  // Spring press
  const [pressedId, setPressedId] = useState<string | null>(null)
  const pressStyle = useCallback((id: string, isLarge: boolean): React.CSSProperties => {
    if (!dials.springPress) return {}
    const depth = isLarge ? dials.pressDepthLarge : dials.pressDepthSmall
    return {
      transform: pressedId === id ? `scale(${depth})` : 'scale(1)',
      transition: pressedId === id ? 'transform 80ms ease-out' : SPRING_PRESS,
    }
  }, [pressedId, dials.springPress, dials.pressDepthLarge, dials.pressDepthSmall])

  const pressHandlers = (id: string) => dials.springPress ? ({
    onPointerDown: () => setPressedId(id),
    onPointerUp: () => setPressedId(null),
    onPointerLeave: () => setPressedId(null),
  }) : ({})

  const outerSize = dials.swatchSize + dials.borderWidth * 2
  const br = dials.swatchSize * 0.14

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Accent portraits — ONE selection indicator: the swatch-color border.
          No outline ring, no scale difference. Selected = opaque border. Unselected = transparent border. */}
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
              onMouseEnter={dials.previewOnHover ? () => onHoverAccent?.(accent) : undefined}
              onMouseLeave={dials.previewOnHover ? () => onHoverAccent?.(null) : undefined}
              {...pressHandlers(`accent-${accent}`)}
              style={{
                width: outerSize,
                height: outerSize,
                padding: dials.borderWidth,
                borderRadius: br,
                border: 'none',
                cursor: 'pointer',
                background: selected ? `var(--swatch-${accent})` : 'color-mix(in srgb, var(--text-dark) 8%, var(--bg))',
                transition: 'background 300ms ease-in-out',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                ...pressStyle(`accent-${accent}`, true),
              }}
            >
              <div style={{ position: 'relative', width: dials.swatchSize, height: dials.swatchSize, borderRadius: dials.swatchSize * 0.10, overflow: 'hidden' }}>
                <img
                  src={`/images/portrait-square-${accent}.jpg`}
                  alt={accent}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <CursorLightOverlay enabled={dials.cursorLight} intensity={dials.cursorLightIntensity} />
              </div>
            </button>
          )
        })}
      </div>

      <MomentumThumb value={bgIntensity} onChange={setBgIntensity} enabled={dials.momentumThumb} />

      <Divider />

      {/* Appearance + cursor — consistent sizing, ONE selection indicator: opacity.
          All buttons same size. No outline rings. Selected = full opacity. Unselected = 0.4. */}
      <div ref={modeGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        {APPEARANCE.map(({ mode, label, Icon }) => (
          <button
            key={mode}
            data-settings-card
            data-link-card
            type="button"
            aria-label={label}
            aria-pressed={appearanceMode === mode}
            onClick={() => setAppearanceMode(mode)}
            {...pressHandlers(`mode-${mode}`)}
            style={{
              width: dials.controlSize, height: dials.controlSize,
              display: 'grid', placeItems: 'center',
              background: 'transparent', border: 'none', borderRadius: 8,
              cursor: 'pointer', opacity: appearanceMode === mode ? 1 : 0.4, padding: 0,
              position: 'relative', zIndex: 1,
              transition: 'opacity 160ms ease',
              ...pressStyle(`mode-${mode}`, false),
            }}
          >
            <Icon size={dials.iconSize * 0.75} color="var(--text-dark)" />
          </button>
        ))}
      </div>

      <Divider />

      <div ref={cursorGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        {CURSOR_MODES.map(({ mode, label }) => (
          <button
            key={mode}
            data-settings-card
            data-link-card
            type="button"
            aria-label={label}
            aria-pressed={cursorMode === mode}
            onClick={() => setCursorMode(mode)}
            {...pressHandlers(`cursor-${mode}`)}
            style={{
              width: dials.controlSize, height: dials.controlSize,
              display: 'grid', placeItems: 'center',
              background: 'transparent', border: 'none', borderRadius: 8,
              cursor: 'pointer', opacity: cursorMode === mode ? 1 : 0.4, padding: 0,
              position: 'relative', zIndex: 1,
              transition: 'opacity 160ms ease',
              ...pressStyle(`cursor-${mode}`, false),
            }}
          >
            {mode === 'standard'
              ? <NavigationArrow size={dials.iconSize * 0.75} color="var(--text-dark)" />
              : <img src="/images/figpal.png" alt="" style={{ width: dials.iconSize, height: dials.iconSize, objectFit: 'contain' }} />
            }
          </button>
        ))}
      </div>
    </div>
  )
}
