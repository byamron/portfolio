import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GLASS_DEFAULTS } from '@/hooks/useGlassHighlight'

/**
 * DEV ONLY — floating panel to tune light-mode cursor light properties.
 * Must be removed before merging to main.
 */

const FONT = "'SF Mono', 'Cascadia Code', ui-monospace, monospace"
const BORDER = 'rgba(255,255,255,0.08)'
const LABEL_COLOR = 'rgba(255,255,255,0.45)'
const VALUE_COLOR = 'rgba(255,255,255,0.65)'
const PRIMARY = 'rgba(255,255,255,0.9)'
const TRACK = 'rgba(255,255,255,0.10)'
const FILL = 'rgba(255,255,255,0.22)'
const THUMB = 'rgba(255,255,255,0.85)'

function Slider({
  label, value, onChange, min = 0, max = 1, step = 0.01,
}: {
  label: string; value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number
}) {
  const progress = (value - min) / (max - min)
  const formatted = step >= 1 ? String(Math.round(value)) : step >= 0.1 ? value.toFixed(1) : value.toFixed(2)

  const clamp = useCallback(
    (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step)),
    [min, max, step],
  )

  const [draft, setDraft] = useState<string | null>(null)
  const editing = draft !== null

  const commit = useCallback(() => {
    if (draft !== null) {
      const parsed = parseFloat(draft)
      if (!isNaN(parsed)) onChange(clamp(parsed))
    }
    setDraft(null)
  }, [draft, onChange, clamp])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: LABEL_COLOR, userSelect: 'none' }}>{label}</span>
        <input
          type="text"
          inputMode="decimal"
          value={editing ? draft : formatted}
          aria-label={`${label} value`}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => { setDraft(formatted); requestAnimationFrame(() => e.target.select()) }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur() }
            else if (e.key === 'Escape') { setDraft(null); (e.target as HTMLInputElement).blur() }
            else if (e.key === 'ArrowUp') { e.preventDefault(); onChange(clamp(value + step)); setDraft(null) }
            else if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - step)); setDraft(null) }
          }}
          style={{
            width: 40, background: 'none', border: 'none', color: VALUE_COLOR,
            fontSize: 10, fontFamily: FONT, fontVariantNumeric: 'tabular-nums',
            textAlign: 'right', padding: 0, outline: 'none', cursor: 'text',
          }}
        />
      </div>
      <div
        style={{ position: 'relative', height: 14, cursor: 'pointer', touchAction: 'none' }}
        onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); update(e) }}
        onPointerMove={(e) => { if (e.buttons) update(e) }}
      >
        <div style={{ position: 'absolute', top: 6, left: 0, right: 0, height: 2, borderRadius: 1, background: TRACK }} />
        <div style={{ position: 'absolute', top: 6, left: 0, width: `${progress * 100}%`, height: 2, borderRadius: 1, background: FILL }} />
        <div style={{
          position: 'absolute', top: 3, left: `calc(${progress * 100}% - 4px)`,
          width: 8, height: 8, borderRadius: '50%', background: THUMB,
          boxShadow: '0 0 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )

  function update(e: React.PointerEvent) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const raw = min + x * (max - min)
    onChange(Math.min(max, Math.max(min, Math.round(raw / step) * step)))
  }
}

interface LightTunerProps {
  values: {
    lightCursorIntensity: number
    lightCursorSaturation: number
    lightCursorLightness: number
    lightEdgeIntensity: number
  }
  onChange: (v: Partial<LightTunerProps['values']>) => void
}

export function GlassLightTuner({ values, onChange }: LightTunerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)', border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: '7px 12px', color: PRIMARY,
            fontSize: 10, fontFamily: FONT, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 7,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
          Light Tuner
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            style={{
              position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
              width: 220, background: 'rgba(8, 8, 10, 0.85)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 12, border: `1px solid ${BORDER}`,
              padding: 14, fontFamily: FONT,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)' }}>
              Light Mode Cursor
            </span>

            <Slider label="Intensity" value={values.lightCursorIntensity} onChange={v => onChange({ lightCursorIntensity: v })} min={0.5} max={6} step={0.1} />
            <Slider label="Saturation" value={values.lightCursorSaturation} onChange={v => onChange({ lightCursorSaturation: v })} min={5} max={60} step={1} />
            <Slider label="Lightness" value={values.lightCursorLightness} onChange={v => onChange({ lightCursorLightness: v })} min={15} max={70} step={1} />

            <div style={{ height: 1, background: BORDER, margin: '2px -2px' }} />

            <Slider label="Edge intensity" value={values.lightEdgeIntensity} onChange={v => onChange({ lightEdgeIntensity: v })} min={0} max={2} step={0.1} />

            <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
              <motion.button
                onClick={() => onChange({
                  lightCursorIntensity: GLASS_DEFAULTS.lightCursorIntensity,
                  lightCursorSaturation: GLASS_DEFAULTS.lightCursorSaturation,
                  lightCursorLightness: GLASS_DEFAULTS.lightCursorLightness,
                  lightEdgeIntensity: GLASS_DEFAULTS.lightEdgeIntensity,
                })}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: 'transparent', border: `1px solid ${BORDER}`,
                  borderRadius: 6, padding: '5px 8px', color: LABEL_COLOR,
                  fontSize: 10, fontFamily: FONT, cursor: 'pointer',
                }}
              >
                Reset
              </motion.button>
              <motion.button
                onClick={() => setOpen(false)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
                  borderRadius: 6, padding: '5px 8px', color: PRIMARY,
                  fontSize: 10, fontFamily: FONT, cursor: 'pointer',
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
