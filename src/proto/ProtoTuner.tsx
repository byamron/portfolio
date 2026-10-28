// DEV ONLY — loaded behind `import.meta.env.DEV` in ProtoRoutes, so it never
// reaches a production bundle. Tune here, then bake into PROTO_DEFAULTS.
import { useRef, type ReactNode } from 'react'
import { DialRoot, useDialKit, type DialConfig } from 'dialkit'
import 'dialkit/styles.css'
import { DEFAULT_PARAMS } from '@/components/RecordToggle'
import { COPY_VARIANTS, TEXT_PRESETS } from './data'
import { PROTO_DEFAULTS as P, ProtoSettingsContext, type ProtoSettings, type RecordPlacement } from './protoSettings'

const R = P.record
const T = { ...DEFAULT_PARAMS, ...R.tuning }

function useStableConfig<C extends DialConfig>(config: C): C {
  return useRef(config).current
}

export default function ProtoTuner({ children }: { children: ReactNode }) {
  const page = useDialKit('Page', useStableConfig({
    'Text size px (wide)': [P.proseMax, 24, 72, 1],
    'Record placement': { type: 'select', options: ['strip', 'inline'], default: P.recordPlacement },
    'Sticky strip': P.stickyStrip,
    'Business card case': { type: 'select', options: ['caps', 'sentence'], default: P.cardCase },
  } satisfies DialConfig), { id: 'proto-page' })

  const S = P.simpleLayout
  const simple = useDialKit('Simple layout', useStableConfig({
    'Text preset': { type: 'select', options: ['custom', ...Object.keys(TEXT_PRESETS)], default: S.preset },
    'Text px (S→M)': [TEXT_PRESETS['2 lines · S']!.size, TEXT_PRESETS['2 lines · S']!.size, TEXT_PRESETS['2 lines · M']!.size, 1],
    'Copy (custom)': { type: 'select', options: Object.keys(COPY_VARIANTS), default: S.copy },
    'Size mode': { type: 'select', options: ['fit', 'fluid'], default: S.sizeMode },
    'Max width px': [S.maxWidth, 480, 1400, 10],
    'Min text px (fit)': [S.minText, 16, 40, 1],
    'Max text px (custom)': [S.maxText, 24, 80, 1],
    'Align': { type: 'select', options: ['left', 'center'], default: S.align },
    'Line wrap': { type: 'select', options: ['balance', 'pretty'], default: S.wrap },
    'Shrink-wrap (optical centre)': S.shrinkWrap,
  } satisfies DialConfig), { id: 'proto-simple-layout' })

  const G = P.cursorGlow
  const glow = useDialKit('Cursor glow', useStableConfig({
    'On': G.on,
    'Intensity': [G.intensity, 0, 3, 0.05],
    'Radius px': [G.radius, 24, 320, 2],
    'Accent tint': [G.tint, 0, 2, 0.05],
  } satisfies DialConfig), { id: 'proto-cursor-glow' })

  const E = P.emailFx
  const email = useDialKit('Email note', useStableConfig({
    'Typing chars/s': [E.typeCps, 10, 80, 1],
    'Fold pace (×)': [E.foldPace, 0.5, 1.6, 0.05],
    'Plane length px': [E.planeLength, 70, 200, 2],
  } satisfies DialConfig), { id: 'proto-email' })

  const rec = useDialKit('Record', useStableConfig({
    'Size': [R.size, 0.4, 1, 0.02],
    'Track': { type: 'select', options: ['martini', 'venice', 'lovin'], default: R.trackId },
    'Idle caption': { type: 'text', default: R.idleCaption, placeholder: 'e.g. Side A' },
    'Label accent': [R.labelAccent, 0, 1, 0.05],
    'Crackle (audio)': [T.crackle, 0, 1, 0.05],
    'Vinyl detail (dark)': [T.vinylDark, 0, 1.5, 0.05],
    'Vinyl detail (light)': [T.vinylLight, 0, 1.5, 0.05],
    'Wood grain': [T.grain, 0, 1, 0.05],
    'Off style': { type: 'select', options: ['tactile', 'clean'], default: T.offStyle },
    'Glow': { type: 'select', options: ['breath', 'spectrum', 'off'], default: T.glow },
    'Glow (dark)': [T.glowDark, 0, 1.5, 0.05],
    'Glow (light)': [T.glowLight, 0, 4, 0.1],
    'Glow tone (light)': [T.glowToneLight, 20, 60, 1],
    'Glow detail': [T.breathDetail, 0, 1, 0.05],
    'Spin up s': [T.spinUp, 0.2, 1.5, 0.05],
    'Wind down s': [T.spinDown, 0.15, 3, 0.05],
  } satisfies DialConfig), { id: 'proto-record' })

  const settings: ProtoSettings = {
    proseMax: page['Text size px (wide)'],
    recordPlacement: page['Record placement'] as RecordPlacement,
    stickyStrip: page['Sticky strip'] as boolean,
    cardCase: page['Business card case'] as 'caps' | 'sentence',
    simpleLayout: {
      align: simple['Align'] as 'left' | 'center',
      maxWidth: simple['Max width px'],
      wrap: simple['Line wrap'] as 'balance' | 'pretty',
      shrinkWrap: simple['Shrink-wrap (optical centre)'] as boolean,
      sizeMode: simple['Size mode'] as 'fit' | 'fluid',
      minText: simple['Min text px (fit)'],
      maxText: simple['Max text px (custom)'],
      copy: simple['Copy (custom)'] as string,
      preset: simple['Text preset'] as string,
      presetSize: simple['Text px (S→M)'],
    },
    cursorGlow: {
      on: glow['On'] as boolean,
      intensity: glow['Intensity'],
      radius: glow['Radius px'],
      tint: glow['Accent tint'],
    },
    emailFx: {
      typeCps: email['Typing chars/s'],
      foldPace: email['Fold pace (×)'],
      planeLength: email['Plane length px'],
    },
    record: {
      size: rec['Size'],
      trackId: rec['Track'] as typeof R.trackId,
      idleCaption: rec['Idle caption'] as string,
      labelAccent: rec['Label accent'],
      tuning: {
        ...R.tuning,
        crackle: rec['Crackle (audio)'],
        vinylDark: rec['Vinyl detail (dark)'],
        vinylLight: rec['Vinyl detail (light)'],
        grain: rec['Wood grain'],
        offStyle: rec['Off style'] as typeof T.offStyle,
        glow: rec['Glow'] as typeof T.glow,
        glowDark: rec['Glow (dark)'],
        glowLight: rec['Glow (light)'],
        glowToneLight: rec['Glow tone (light)'],
        breathDetail: rec['Glow detail'],
        spinUp: rec['Spin up s'],
        spinDown: rec['Wind down s'],
      },
    },
  }

  return (
    <ProtoSettingsContext.Provider value={settings}>
      {children}
      {/* Top-left and collapsed: the right edge belongs to the theme sidebar
          and the bottom to the contribution strip. */}
      <DialRoot position="top-left" defaultOpen={false} />
      <style>{'.dialkit-preset-manager { display: none !important; }'}</style>
    </ProtoSettingsContext.Provider>
  )
}
