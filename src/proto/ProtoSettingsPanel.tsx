import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Monitor, Moon, NavigationArrow, Sun } from '@phosphor-icons/react'
import { useTheme, VALID_ACCENTS, type AccentColor, type AppearanceMode } from '@/contexts/ThemeContext'
import { useCursor, type CursorMode } from '@/contexts/CursorContext'
import { useGlassHighlight } from '@/hooks/useGlassHighlight'
import { useSettingsDials } from './tuning'

const SPRING_PRESS = 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'

// Accent hues for the continuous slider — matches the site's actual accent definitions.
const ACCENT_HUES: Record<AccentColor, number> = { table: 34, portrait: 43, sky: 204, pizza: 15, vineyard: 90 }
const ACCENTS_ORDERED: AccentColor[] = ['pizza', 'table', 'portrait', 'vineyard', 'sky']
const ACCENT_HUES_SORTED = ACCENTS_ORDERED.map(a => ACCENT_HUES[a])

function nearestAccent(hue: number): AccentColor {
  let best: AccentColor = ACCENTS_ORDERED[0]!
  let bestDist = 360
  for (const a of ACCENTS_ORDERED) {
    const h = ACCENT_HUES[a]
    const d = Math.min(Math.abs(hue - h), 360 - Math.abs(hue - h))
    if (d < bestDist) { bestDist = d; best = a }
  }
  return best
}

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

/** Proposal 9c: continuous hue strip with detent markers at each accent's hue. */
function ContinuousHueStrip({ activeAccent, onSelect, onHover, size }: {
  activeAccent: AccentColor; onSelect: (a: AccentColor) => void
  onHover: (a: AccentColor | null) => void; size: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const activeHue = ACCENT_HUES[activeAccent]

  const hueFromPointer = (clientX: number): number => {
    if (!trackRef.current) return activeHue
    const r = trackRef.current.getBoundingClientRect()
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width))
    return t * 360
  }

  const selectFromHue = (hue: number) => {
    onSelect(nearestAccent(hue))
  }

  // Position of the active accent on the 0–360 strip
  const thumbT = activeHue / 360

  // Build the hue gradient with stops at each accent
  const gradient = `linear-gradient(to right, ${ACCENT_HUES_SORTED.map(h => `hsl(${h}, 50%, 55%) ${(h / 360) * 100}%`).join(', ')})`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        ref={trackRef}
        role="slider"
        aria-label="Accent hue"
        aria-valuemin={0} aria-valuemax={360}
        aria-valuenow={activeHue}
        tabIndex={0}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragging(true)
          const nearest = nearestAccent(hueFromPointer(e.clientX))
          onHover(nearest)
        }}
        onPointerMove={e => {
          if (!e.buttons) return
          const nearest = nearestAccent(hueFromPointer(e.clientX))
          onHover(nearest)
        }}
        onPointerUp={e => {
          setDragging(false)
          selectFromHue(hueFromPointer(e.clientX))
          onHover(null)
        }}
        onKeyDown={e => {
          const idx = ACCENTS_ORDERED.indexOf(activeAccent)
          if (e.key === 'ArrowRight' && idx < ACCENTS_ORDERED.length - 1) onSelect(ACCENTS_ORDERED[idx + 1]!)
          if (e.key === 'ArrowLeft' && idx > 0) onSelect(ACCENTS_ORDERED[idx - 1]!)
        }}
        style={{
          position: 'relative', height: size * 0.4, borderRadius: size * 0.08,
          background: gradient, cursor: 'grab', touchAction: 'none', userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Detent markers at each accent position */}
        {ACCENTS_ORDERED.map(a => (
          <div key={a} style={{
            position: 'absolute', top: 0, bottom: 0, left: `${(ACCENT_HUES[a] / 360) * 100}%`,
            width: 2, background: 'rgba(255,255,255,0.4)', transform: 'translateX(-1px)',
          }} />
        ))}
        {/* Thumb */}
        <div style={{
          position: 'absolute', top: '50%', left: `${thumbT * 100}%`,
          width: size * 0.35, height: size * 0.35,
          borderRadius: '50%',
          background: `var(--swatch)`,
          border: '2px solid rgba(255,255,255,0.7)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          transform: `translate(-50%, -50%) scale(${dragging ? 1.15 : 1})`,
          transition: dragging ? 'none' : 'left 300ms ease-out, transform 200ms ease',
        }} />
      </div>
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
  const dials = useSettingsDials()

  const accentGroupRef = useRef<HTMLDivElement>(null)
  const modeGroupRef = useRef<HTMLDivElement>(null)
  const cursorGroupRef = useRef<HTMLDivElement>(null)
  const nullRef = useRef<HTMLDivElement>(null)
  const useGlass = (dials as Record<string, unknown>).glassPill as boolean
  const continuousHue = (dials as Record<string, unknown>).continuousHue as boolean

  const glassCfg = (radius: number, k: number, c: number) => ({
    cardSelector: '[data-settings-card]', borderRadius: radius, clearDelay: 120,
    springStiffness: k, springDamping: c,
    pillMaxLean: dials.leanOnHover ? 1.0 : 0, pillMaxTilt: dials.leanOnHover ? 1.0 : 0,
    pullStrength: dials.edgePull ? 0.20 : 0,
  })

  useGlassHighlight(useGlass ? accentGroupRef : nullRef, glassCfg(dials.controlSize * 0.18, dials.swatchSpringK, dials.swatchSpringC))
  useGlassHighlight(useGlass ? modeGroupRef : nullRef, glassCfg(dials.controlSize * 0.18, dials.iconSpringK, dials.iconSpringC))
  useGlassHighlight(useGlass ? cursorGroupRef : nullRef, glassCfg(dials.controlSize * 0.18, dials.iconSpringK, dials.iconSpringC))

  const [pressedId, setPressedId] = useState<string | null>(null)
  const mkPressStyle = useCallback((id: string): React.CSSProperties => {
    if (!dials.springPress) return {}
    return {
      transform: pressedId === id ? `scale(${dials.pressDepth})` : 'scale(1)',
      transition: pressedId === id ? 'transform 80ms ease-out' : SPRING_PRESS,
    }
  }, [pressedId, dials.springPress, dials.pressDepth])

  const mkPressHandlers = (id: string) => dials.springPress ? ({
    onPointerDown: () => setPressedId(id),
    onPointerUp: () => setPressedId(null),
    onPointerLeave: () => setPressedId(null),
  }) : ({})

  const iconPx = dials.controlSize * 0.5
  const swatchInner = dials.controlSize - 6

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Row 1: accent selection + intensity strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {continuousHue ? (
          <div style={{ flex: 1 }}>
            <ContinuousHueStrip
              activeAccent={accentColor}
              onSelect={setAccentColor}
              onHover={a => onHoverAccent?.(a)}
              size={dials.controlSize}
            />
          </div>
        ) : (
          <div ref={accentGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
            {VALID_ACCENTS.map((accent: AccentColor) => (
              <ControlButton
                key={accent} active={accent === accentColor}
                label={`${accent} accent`}
                onClick={() => setAccentColor(accent)}
                size={dials.controlSize}
                pressStyle={mkPressStyle(`accent-${accent}`)}
                pressHandlers={mkPressHandlers(`accent-${accent}`)}
                onMouseEnter={dials.previewOnHover ? () => onHoverAccent?.(accent) : undefined}
                onMouseLeave={dials.previewOnHover ? () => onHoverAccent?.(null) : undefined}
              >
                <div style={{ width: swatchInner, height: swatchInner, borderRadius: dials.controlSize * 0.14, background: `var(--swatch-${accent})` }} />
              </ControlButton>
            ))}
          </div>
        )}

        <MomentumThumb value={bgIntensity} onChange={setBgIntensity} enabled={dials.momentumThumb} />
      </div>

      <Divider />

      {/* Row 2: appearance modes */}
      <div ref={modeGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        {APPEARANCE.map(({ mode, label, Icon }) => (
          <ControlButton
            key={mode} active={appearanceMode === mode}
            label={label} onClick={() => setAppearanceMode(mode)}
            size={dials.controlSize}
            pressStyle={mkPressStyle(`mode-${mode}`)}
            pressHandlers={mkPressHandlers(`mode-${mode}`)}
          >
            <Icon size={iconPx} color="var(--text-dark)" />
          </ControlButton>
        ))}
      </div>

      <Divider />

      {/* Row 3: cursor modes */}
      <div ref={cursorGroupRef} style={{ display: 'flex', gap: 6, position: 'relative' }}>
        {CURSORS.map(({ mode, label }) => (
          <ControlButton
            key={mode} active={cursorMode === mode}
            label={label} onClick={() => setCursorMode(mode)}
            size={dials.controlSize}
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
