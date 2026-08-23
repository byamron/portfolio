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

/** Proposal 5: momentum-based drag thumb for the intensity strip. */
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
        const t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
        onChange(t)
      }}
      onPointerMove={e => {
        if (!e.buttons) return
        const r = e.currentTarget.getBoundingClientRect()
        onChange(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)))
      }}
      onPointerUp={() => {
        window.dispatchEvent(new CustomEvent('proto-glow-pulse'))
      }}
      onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(1, value + 0.05))
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(0, value - 0.05))
      }}
      style={{ position: 'relative', width: 72, height: 11, cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
    >
      <div
        style={{
          position: 'absolute', top: 1.5, left: 0, width: 72, height: 8, borderRadius: 4,
          background: 'linear-gradient(to right, color-mix(in srgb, var(--swatch) 8%, transparent), color-mix(in srgb, var(--swatch) 55%, transparent))',
        }}
      />
      <motion.div
        style={{
          position: 'absolute', top: 0, left, width: 11, height: 11,
          borderRadius: '50%', background: 'var(--swatch)',
          border: '1.5px solid color-mix(in srgb, var(--text-dark) 25%, transparent)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }}
      />
    </div>
  )
}

/** Proposal 7: cursor-as-light-source radial gradient on portrait swatches. */
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
  const reducedMotion = useReducedMotion()

  // Glass pill per control group — with per-group spring constants from dials
  const accentGroupRef = useRef<HTMLDivElement>(null)
  const modeGroupRef = useRef<HTMLDivElement>(null)
  const cursorGroupRef = useRef<HTMLDivElement>(null)
  useGlassHighlight(accentGroupRef, {
    cardSelector: '[data-settings-card]',
    borderRadius: dials.swatchSize * 0.12,
    clearDelay: 120,
    springStiffness: dials.swatchSpringK,
    springDamping: dials.swatchSpringC,
    pillMaxLean: dials.leanOnHover ? 1.0 : 0,
    pillMaxTilt: dials.leanOnHover ? 1.0 : 0,
    pullStrength: dials.edgePull ? 0.20 : 0,
  })
  useGlassHighlight(modeGroupRef, {
    cardSelector: '[data-settings-card]',
    borderRadius: 12,
    clearDelay: 120,
    springStiffness: dials.iconSpringK,
    springDamping: dials.iconSpringC,
    pillMaxLean: dials.leanOnHover ? 1.0 : 0,
    pillMaxTilt: dials.leanOnHover ? 1.0 : 0,
    pullStrength: dials.edgePull ? 0.20 : 0,
  })
  useGlassHighlight(cursorGroupRef, {
    cardSelector: '[data-settings-card]',
    borderRadius: 12,
    clearDelay: 120,
    springStiffness: dials.iconSpringK,
    springDamping: dials.iconSpringC,
    pillMaxLean: dials.leanOnHover ? 1.0 : 0,
    pillMaxTilt: dials.leanOnHover ? 1.0 : 0,
    pullStrength: dials.edgePull ? 0.20 : 0,
  })

  // Spring-press state
  const [pressedId, setPressedId] = useState<string | null>(null)
  const pressStyle = useCallback((id: string, isLarge: boolean) => {
    if (!dials.springPress) return {}
    const depth = isLarge ? dials.pressDepthLarge : dials.pressDepthSmall
    return {
      transform: pressedId === id ? `scale(${depth})` : 'scale(1)',
      transition: pressedId === id ? 'transform 80ms ease-out' : SPRING_PRESS,
    } as React.CSSProperties
  }, [pressedId, dials.springPress, dials.pressDepthLarge, dials.pressDepthSmall])

  const pressHandlers = (id: string) => dials.springPress ? ({
    onPointerDown: () => setPressedId(id),
    onPointerUp: () => setPressedId(null),
    onPointerLeave: () => setPressedId(null),
  }) : ({})

  // Proposal 6b: border loading ring on accent switch
  const [ringAccent, setRingAccent] = useState<string | null>(null)
  useEffect(() => {
    if (!ringAccent) return
    const t = setTimeout(() => setRingAccent(null), 520)
    return () => clearTimeout(t)
  }, [ringAccent])

  const outerSize = dials.swatchSize + dials.borderWidth * 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Accent: portrait thumbnails with swatch-colored border rings */}
      <div ref={accentGroupRef} style={{ display: 'flex', gap: 14, position: 'relative' }}>
        {VALID_ACCENTS.map((accent: AccentColor) => {
          const selected = accent === accentColor
          const showRing = dials.borderRing && ringAccent === accent
          return (
            <button
              key={accent}
              data-settings-card
              data-link-card
              type="button"
              aria-label={`${accent} accent`}
              aria-pressed={selected}
              onClick={() => {
                setAccentColor(accent)
                if (dials.borderRing) setRingAccent(accent)
              }}
              onMouseEnter={dials.previewOnHover ? () => onHoverAccent?.(accent) : undefined}
              onMouseLeave={dials.previewOnHover ? () => onHoverAccent?.(null) : undefined}
              {...pressHandlers(`accent-${accent}`)}
              style={{
                width: outerSize,
                height: outerSize,
                padding: dials.borderWidth,
                borderRadius: dials.swatchSize * 0.14,
                border: 'none',
                cursor: 'pointer',
                // Proposal 6b: conic-gradient border fill on click
                background: showRing && !reducedMotion
                  ? `conic-gradient(from 0deg, var(--swatch-${accent}) var(--ring-progress, 0%), transparent var(--ring-progress, 0%))`
                  : `var(--swatch-${accent})`,
                outline: selected
                  ? `2px solid color-mix(in srgb, var(--swatch-${accent}) 60%, transparent)`
                  : 'none',
                outlineOffset: 3,
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                // Proposal 4: selected swatch stays slightly depressed
                ...(dials.depthOnSelect && selected && !pressedId?.startsWith('accent-')
                  ? { transform: `scale(${dials.selectDepth})`, boxShadow: `inset 0 1px 3px rgba(0,0,0,0.15)`, transition: SPRING_PRESS }
                  : pressStyle(`accent-${accent}`, true)),
              }}
            >
              <div style={{ position: 'relative', width: dials.swatchSize, height: dials.swatchSize, borderRadius: dials.swatchSize * 0.10, overflow: 'hidden' }}>
                <img
                  src={`/images/portrait-square-${accent}.jpg`}
                  alt={accent}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  }}
                />
                {/* Proposal 7: cursor-as-light-source on the portrait */}
                <CursorLightOverlay enabled={dials.cursorLight} intensity={dials.cursorLightIntensity} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Intensity strip — proposal 5: momentum thumb when enabled */}
      <MomentumThumb value={bgIntensity} onChange={setBgIntensity} enabled={dials.momentumThumb} />

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
              {...pressHandlers(`mode-${mode}`)}
              style={{
                width: dials.controlSize, height: dials.controlSize,
                display: 'grid', placeItems: 'center',
                background: 'transparent', border: 'none', borderRadius: 8,
                cursor: 'pointer', opacity: active ? 1 : 0.4, padding: 0,
                position: 'relative', zIndex: 1,
                ...pressStyle(`mode-${mode}`, false),
              }}
            >
              <span
                style={{
                  width: dials.iconSize, height: dials.iconSize, display: 'grid', placeItems: 'center', borderRadius: 6,
                  outline: active ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none',
                  outlineOffset: 3,
                }}
              >
                <Icon size={dials.iconSize * 0.75} color="var(--text-dark)" />
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
              {...pressHandlers(`cursor-${mode}`)}
              style={{
                width: dials.controlSize, height: dials.controlSize,
                display: 'grid', placeItems: 'center',
                background: 'transparent', border: 'none', borderRadius: 8,
                cursor: 'pointer', opacity: active ? 1 : 0.4, padding: 0,
                position: 'relative', zIndex: 1,
                ...pressStyle(`cursor-${mode}`, false),
              }}
            >
              <span style={{ width: dials.iconSize, height: dials.iconSize, display: 'grid', placeItems: 'center', borderRadius: 6, outline: active ? '1.5px solid color-mix(in srgb, var(--text-dark) 20%, transparent)' : 'none', outlineOffset: 3 }}>
                {mode === 'standard'
                  ? <NavigationArrow size={dials.iconSize * 0.75} color="var(--text-dark)" />
                  : <img src="/images/figpal.png" alt="" style={{ width: dials.iconSize, height: dials.iconSize, objectFit: 'contain' }} />
                }
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
