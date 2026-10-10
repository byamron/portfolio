import { createContext, useContext } from 'react'
import type { RecordToggleParams, RecordTrackId } from '@/components/RecordToggle'

export interface RecordDockSettings {
  size: number
  trackId: RecordTrackId
  /** 0 = the original oxblood label, 1 = fully in the site's accent hue */
  labelAccent: number
  idleCaption: string
  tuning: Partial<RecordToggleParams>
}

export type RecordPlacement = 'strip' | 'inline'

export interface ProtoSettings {
  /** Prose size on wide screens; phones get 65% of it, fluid in between. */
  proseMax: number
  recordPlacement: RecordPlacement
  /** Strip stays at the viewport bottom while the page scrolls behind it. */
  stickyStrip: boolean
  record: RecordDockSettings
}

// Calmer than the playground defaults: the record sits beside a reading page.
export const PROTO_DEFAULTS: ProtoSettings = {
  proseMax: 40,
  recordPlacement: 'strip',
  stickyStrip: false,
  record: {
    size: 0.6,
    trackId: 'martini',
    labelAccent: 1,
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
  },
}

/** Overridden only by the dev-only tuner; production reads the defaults. */
export const ProtoSettingsContext = createContext<ProtoSettings>(PROTO_DEFAULTS)
export const useProtoSettings = () => useContext(ProtoSettingsContext)

/** Fluid size: `max` at ≥1440px wide, 65% of it at ≤390px. */
export function fluidSize(max: number) {
  const min = Math.round(max * 0.65)
  const slope = (max - min) / (1440 - 390) // px per px of viewport
  const intercept = min - slope * 390
  return `clamp(${min}px, calc(${intercept.toFixed(2)}px + ${(slope * 100).toFixed(3)}vw), ${max}px)`
}

// The sidebar's hover zone is a full-height 56px strip on the right edge;
// anything inside it opens the sidebar instead of taking the click.
export const SIDEBAR_GUTTER = 56
