import { createContext, lazy, Suspense, useContext, useSyncExternalStore } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { RecordToggleParams, RecordTrackId } from '@/components/RecordToggle'

const RecordToggle = lazy(() => import('@/components/RecordToggle').then(m => ({ default: m.RecordToggle })))

export interface RecordDockSettings {
  size: number
  trackId: RecordTrackId
  /** 0 = the original oxblood label, 1 = fully in the site's accent hue */
  labelAccent: number
  offset: number
  idleCaption: string
  tuning: Partial<RecordToggleParams>
}

// Calmer than the playground defaults: this sits at the edge of a reading page.
export const RECORD_DOCK_DEFAULTS: RecordDockSettings = {
  size: 0.6,
  trackId: 'martini',
  labelAccent: 1,
  offset: 24,
  idleCaption: '',
  tuning: {
    crackle: 0.25,
    vinylDark: 0.3,
    vinylLight: 0.4,
    grain: 0.12,
    glowDark: 0.25,
    glowLight: 1.2,
    glowToneLight: 40,
    breathDetail: 0.35,
    trebleBoost: 1,
    glowFadeIn: 2.5,
  },
}

/** Lets the dev-only tuner drive whichever dock instance is on screen. */
export const RecordDockSettingsContext = createContext<Partial<RecordDockSettings>>({})

// Pinned to the viewport only when the 920px column leaves room beside it;
// narrower than that, a fixed widget would sit on top of the text as you read.
const PINNED_QUERY = '(min-width: 1280px)'
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(PINNED_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
export function useRecordDockPinned() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(PINNED_QUERY).matches, () => true)
}

// The sidebar's hover zone is a full-height 56px strip on the right edge;
// anything inside it opens the sidebar instead of taking the click.
export const SIDEBAR_GUTTER = 56

const ORIGINAL_LABEL = '#a3403a'
const ORIGINAL_EDGE = '#8e3631'

export function RecordDock({ placement }: { placement: 'fixed' | 'inline' }) {
  const override = useContext(RecordDockSettingsContext)
  const s = { ...RECORD_DOCK_DEFAULTS, ...override, tuning: { ...RECORD_DOCK_DEFAULTS.tuning, ...override.tuning } }
  const { resolvedAppearance } = useTheme()
  const pct = Math.round(s.labelAccent * 100)
  // Deep enough in every accent that the cream label print stays legible.
  const labelColor = `color-mix(in oklab, hsl(var(--accent-hue), 42%, 40%) ${pct}%, ${ORIGINAL_LABEL})`
  const labelEdge = `color-mix(in oklab, hsl(var(--accent-hue), 46%, 31%) ${pct}%, ${ORIGINAL_EDGE})`
  const pinned = placement === 'fixed'

  return (
    <div
      style={pinned
        ? { position: 'fixed', bottom: s.offset, right: SIDEBAR_GUTTER + s.offset, zIndex: 40 }
        : { position: 'relative', display: 'inline-block' }}
    >
      <Suspense fallback={null}>
        <RecordToggle
          appearance={resolvedAppearance}
          size={s.size}
          trackId={s.trackId}
          tuning={s.tuning}
          labelColor={labelColor}
          labelEdge={labelEdge}
          creditPlacement={pinned ? 'above' : 'below'}
          creditAlign={pinned ? 'end' : 'start'}
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
