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
  /** Prose size on wide screens; phones get 65% of it, fluid in between.
   *  (/new/simple's fluid mode uses it too.) */
  proseMax: number
  recordPlacement: RecordPlacement
  /** Strip stays at the viewport bottom while the page scrolls behind it. */
  stickyStrip: boolean
  /** LinkedIn business card lettering. */
  cardCase: 'caps' | 'sentence'
  record: RecordDockSettings
  /** /new/simple text block. */
  simpleLayout: {
    align: 'left' | 'center'
    maxWidth: number
    wrap: 'balance' | 'pretty'
    /** Size the block to its widest line and centre that, so ragged
     *  left-aligned text still sits optically centred. */
    shrinkWrap: boolean
    /** 'fit': size so line 2 fills maxWidth (≈51ch); 'fluid': viewport clamp. */
    sizeMode: 'fit' | 'fluid'
    /** Fit-mode floor; below it the text wraps instead of shrinking. */
    minText: number
    maxText: number
    /** Line-break variant (SimpleHome COPY_VARIANTS key). */
    copy: string
    /** TEXT_PRESETS key, or 'custom' to use copy / maxText / maxWidth. */
    preset: string
    /** Overrides the preset's type size (DialKit slider, S → M). */
    presetSize?: number
  }
  /** /new/simple experiment: the glass pill's cursor light, page-wide. */
  cursorGlow: { on: boolean; intensity: number; radius: number; falloff: number; tint: number }
}

// Calmer than the playground defaults: the record sits beside a reading page.
export const PROTO_DEFAULTS: ProtoSettings = {
  proseMax: 40,
  recordPlacement: 'strip',
  stickyStrip: false,
  cardCase: 'caps',
  simpleLayout: { align: 'left', maxWidth: 1120, wrap: 'pretty', shrinkWrap: true, sizeMode: 'fit', minText: 26, maxText: 56, copy: 'two · even', preset: '2 lines · S' },
  cursorGlow: { on: true, intensity: 0.15, radius: 224, falloff: 55, tint: 1 }, // Ben's tuning
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
