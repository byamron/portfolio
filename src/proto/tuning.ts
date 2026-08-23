// DEV TOOLING — DialKit tuning dials for the /new prototype. Strip before merge
// (this file, the <DialRoot /> in ProtoRoutes, and the dialkit dependency),
// baking the final values back into the components.
import { useRef } from 'react'
import { useDialKit, type DialConfig } from 'dialkit'
import type { AnimationOptions } from 'framer-motion'

export const EASE = [0.25, 0.46, 0.45, 0.94] as const

function toMotionTransition(config: { type: 'spring' | 'easing'; [key: string]: unknown }): AnimationOptions {
  if (config.type === 'easing') return { ...config, type: 'tween' } as AnimationOptions
  return config as AnimationOptions
}

function useStableConfig<T extends DialConfig>(config: T): T {
  const ref = useRef(config)
  return ref.current
}

/** Type scale. The thumbnail is always a square matching the heading's line height. */
export function useTypeDials() {
  const config = useStableConfig({
    headingSize: [30, 20, 44, 1],
    headingLineHeight: [1.2, 1, 1.6, 0.05],
    bodySize: [18, 14, 26, 1],
  } satisfies DialConfig)
  const t = useDialKit('Type', config, { id: 'proto-type' })
  return { ...t, thumb: Math.round(t.headingSize * t.headingLineHeight) }
}

/** Settings panel layout + experiments. */
export function useSettingsDials() {
  const config = useStableConfig({
    // Control sizes — bigger defaults for tactile feel
    controlSize: [56, 36, 80, 2],
    portraitSize: [88, 48, 160, 4],
    // Glass pill hover (toggleable to compare with/without)
    glassPill: true,
    // Spring press on click
    springPress: true,
    pressDepth: [0.93, 0.85, 1, 0.005],
    // Portrait preview on accent hover
    previewOnHover: true,
    // Glow pulse on intensity release
    glowPulse: true,
    // Momentum-based intensity thumb
    momentumThumb: true,
    // Glass pill physics
    swatchSpringK: [220, 100, 500, 10],
    swatchSpringC: [22, 10, 40, 1],
    iconSpringK: [500, 200, 800, 10],
    iconSpringC: [30, 15, 50, 1],
    leanOnHover: true,
    edgePull: true,
    // Proposal 9c: continuous hue slider with portrait detents (off by default)
    continuousHue: false,
  } satisfies DialConfig)
  return useDialKit('Settings panel', config, { id: 'proto-settings' })
}

/** Hover preview: size + entrance/exit feel + the click morph. */
export function usePreviewDials() {
  const config = useStableConfig({
    size: [228, 120, 400, 4],
    rise: [8, 0, 24, 1],
    scaleFrom: [0.96, 0.85, 1, 0.005],
    enter: { type: 'easing', duration: 0.2, ease: [...EASE] },
    morph: { type: 'spring', stiffness: 340, damping: 30 },
    fadeOut: [0.16, 0.05, 0.5, 0.01],
  } satisfies DialConfig)
  const d = useDialKit('Hover preview', config, { id: 'proto-preview' })
  return {
    ...d,
    enter: toMotionTransition(d.enter as { type: 'spring' | 'easing'; [key: string]: unknown }),
    morph: toMotionTransition(d.morph as { type: 'spring' | 'easing'; [key: string]: unknown }),
  }
}

/** Page-level transitions (home ↔ case study). */
export function usePageDials() {
  const config = useStableConfig({
    enterDuration: [0.35, 0.1, 0.8, 0.01],
    enterRise: [10, 0, 30, 1],
    exitDuration: [0.22, 0.08, 0.6, 0.01],
    heroShrink: [0.96, 0.85, 1, 0.005],
  } satisfies DialConfig)
  return useDialKit('Page transitions', config, { id: 'proto-page' })
}
