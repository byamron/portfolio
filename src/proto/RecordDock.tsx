import { lazy, Suspense } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useProtoSettings } from './protoSettings'

const RecordToggle = lazy(() => import('@/components/RecordToggle').then(m => ({ default: m.RecordToggle })))

const ORIGINAL_LABEL = '#a3403a'
const ORIGINAL_EDGE = '#8e3631'

/** The record toggle, themed to the page. Placement is the caller's job;
 *  `credit` says where the now-playing line has room to appear. */
export function RecordDock({ credit }: { credit: 'above' | 'below' }) {
  const { record: s } = useProtoSettings()
  const { resolvedAppearance } = useTheme()
  const pct = Math.round(s.labelAccent * 100)
  // Deep enough in every accent that the cream label print stays legible.
  const labelColor = `color-mix(in oklab, hsl(var(--accent-hue), 42%, 40%) ${pct}%, ${ORIGINAL_LABEL})`
  const labelEdge = `color-mix(in oklab, hsl(var(--accent-hue), 46%, 31%) ${pct}%, ${ORIGINAL_EDGE})`

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Suspense fallback={null}>
        <RecordToggle
          appearance={resolvedAppearance}
          size={s.size}
          trackId={s.trackId}
          tuning={s.tuning}
          labelColor={labelColor}
          labelEdge={labelEdge}
          creditPlacement={credit}
          creditAlign={credit === 'above' ? 'center' : 'start'}
          idleCaption={s.idleCaption || undefined}
          creditFont='"Onest", system-ui, sans-serif'
          titleColor="var(--text-dark)"
          artistColor="var(--text-grey)"
          trackOffColor="color-mix(in oklab, var(--bg), var(--text-dark) 12%)"
          focusColor="var(--swatch)"
        />
      </Suspense>
    </div>
  )
}
