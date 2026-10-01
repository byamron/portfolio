// DEV TOOLING — DialKit tuning dials for the /new prototype. Strip before merge.
import { useRef } from 'react'
import { useDialKit, useDialKitController, type DialConfig } from 'dialkit'
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

// Two named presets — switchable via the 'Preset' select at the top of the Layout group.
const PRESETS: Record<string, Record<string, number | boolean | string>> = {
  'Default': {
    'Heading font': 'Literata', 'Heading px': 40, 'Heading line-height': 1.2,
    'Body font': 'Onest', 'Body px': 24, 'Body line-height': 1.35,
    'Show portrait': true, 'Portrait height px': 160,
    'Control size px': 56, 'Thumb→heading gap px': 24, 'Heading→body gap px': 32,
    'Paragraph gap px': 22, 'Content max-width px': 920, 'Bottom margin px': 0,
    'Contrib strip on top': true, 'Icon scale (× text size)': 0.9,
  },
  'Uniform': {
    'Heading font': 'Literata', 'Heading px': 40, 'Heading line-height': 1.3,
    'Body font': 'Literata', 'Body px': 40, 'Body line-height': 1.3,
    'Show portrait': false, 'Portrait height px': 160,
    'Control size px': 56, 'Thumb→heading gap px': 24, 'Heading→body gap px': 40,
    'Paragraph gap px': 40, 'Content max-width px': 920, 'Bottom margin px': 0,
    'Contrib strip on top': true, 'Icon scale (× text size)': 0.75,
    'Icon alignment': 'middle', 'Content top padding px': 192,
  },
}

/** Layout & type — the core visual knobs with switchable presets. */
export function useLayoutDials() {
  const config = useStableConfig({
    'Preset': { type: 'select', options: Object.keys(PRESETS), default: 'Default' },
    'Heading font': { type: 'select', options: ['Literata', 'Onest', 'IBM Plex Mono', 'Georgia', 'system-ui'], default: 'Literata' },
    'Heading px': [40, 20, 60, 1],
    'Heading line-height': [1.2, 1, 1.6, 0.05],
    'Body font': { type: 'select', options: ['Onest', 'Literata', 'IBM Plex Mono', 'system-ui'], default: 'Onest' },
    'Body px': [24, 13, 40, 1],
    'Body line-height': [1.35, 1, 2, 0.05],
    'Show portrait': true,
    'Portrait height px': [160, 48, 280, 4],
    'Control size px': [56, 36, 80, 2],
    'Thumb→heading gap px': [24, 4, 48, 2],
    'Heading→body gap px': [32, 12, 64, 2],
    'Paragraph gap px': [22, 8, 48, 2],
    'Content max-width px': [920, 320, 1200, 8],
    'Bottom margin px': [0, 0, 80, 4],
    'Contrib strip on top': true,
    'Icon scale (× text size)': [0.9, 0.5, 1.5, 0.05],
    'Icon alignment': { type: 'select', options: ['middle', 'baseline', 'text-bottom', 'text-top'], default: 'middle' },
    'Content top padding px': [48, 0, 400, 4],
  } satisfies DialConfig)

  const { values: d, setValue } = useDialKitController('Layout', config, { id: 'proto-layout' })
  const selectedPreset = d['Preset'] as string

  // Apply preset values when the select changes
  const lastPreset = useRef(selectedPreset)
  if (selectedPreset !== lastPreset.current) {
    lastPreset.current = selectedPreset
    const preset = PRESETS[selectedPreset]
    if (preset) {
      for (const [key, val] of Object.entries(preset)) {
        setValue(key, val as never)
      }
    }
  }

  return {
    headingFont: d['Heading font'] as string,
    showPortrait: d['Show portrait'] as boolean,
    headingSize: d['Heading px'],
    headingLineHeight: d['Heading line-height'],
    bodyFont: d['Body font'] as string,
    bodySize: d['Body px'],
    bodyLineHeight: d['Body line-height'],
    portraitHeight: d['Portrait height px'],
    controlSize: d['Control size px'],
    thumbGap: d['Thumb→heading gap px'],
    headingBodyGap: d['Heading→body gap px'],
    paragraphGap: d['Paragraph gap px'],
    contentMaxWidth: d['Content max-width px'],
    bottomMargin: d['Bottom margin px'],
    contribOnTop: d['Contrib strip on top'],
    iconScale: d['Icon scale (× text size)'],
    iconAlign: d['Icon alignment'] as string,
    contentTopPadding: d['Content top padding px'],
  }
}

/** Interaction experiments — toggleable. */
export function useExperimentDials() {
  const config = useStableConfig({
    'Glass pill hover': true,
    'Spring press on click': true,
    'Press depth': [0.93, 0.85, 1, 0.005],
    'Preview accent on hover': true,
    'Glow pulse on release': true,
    'Momentum slider thumb': true,
    'Lean + tilt on hover': true,
    'Edge pull between items': true,
  } satisfies DialConfig)
  return useDialKit('Experiments', config, { id: 'proto-experiments' })
}

/** Hover preview: size + entrance/exit feel + the click morph. */
export function usePreviewDials() {
  const config = useStableConfig({
    'Preview size px': [320, 120, 500, 4],
    'Rise px': [8, 0, 24, 1],
    'Scale from': [0.96, 0.85, 1, 0.005],
    'Enter easing': { type: 'easing', duration: 0.2, ease: [...EASE] },
    'Morph spring': { type: 'spring', stiffness: 340, damping: 30 },
    'Fade out sec': [0.16, 0.05, 0.5, 0.01],
    'Opacity': [1, 0.3, 1, 0.05],
  } satisfies DialConfig)
  const d = useDialKit('Hover preview', config, { id: 'proto-preview' })
  return {
    size: d['Preview size px'],
    rise: d['Rise px'],
    scaleFrom: d['Scale from'],
    enter: toMotionTransition(d['Enter easing'] as { type: 'spring' | 'easing'; [key: string]: unknown }),
    morph: toMotionTransition(d['Morph spring'] as { type: 'spring' | 'easing'; [key: string]: unknown }),
    fadeOut: d['Fade out sec'],
    opacity: d['Opacity'],
  }
}

/** Page-level transitions (home ↔ case study). */
export function usePageDials() {
  const config = useStableConfig({
    'Enter duration sec': [0.35, 0.1, 0.8, 0.01],
    'Enter rise px': [10, 0, 30, 1],
    'Exit duration sec': [0.22, 0.08, 0.6, 0.01],
    'Hero shrink on exit': [0.96, 0.85, 1, 0.005],
  } satisfies DialConfig)
  const d = useDialKit('Page transitions', config, { id: 'proto-page' })
  return {
    enterDuration: d['Enter duration sec'],
    enterRise: d['Enter rise px'],
    exitDuration: d['Exit duration sec'],
    heroShrink: d['Hero shrink on exit'],
  }
}
