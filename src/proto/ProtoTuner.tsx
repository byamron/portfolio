// DEV ONLY — loaded behind `import.meta.env.DEV` in ProtoRoutes, so it never
// reaches a production bundle. Tune here, then bake into PROTO_DEFAULTS.
import { useRef, type ReactNode } from 'react'
import { DialRoot, useDialKit, type DialConfig } from 'dialkit'
import 'dialkit/styles.css'
import { DEFAULT_PARAMS } from '@/components/RecordToggle'
import { PROTO_DEFAULTS as P, ProtoSettingsContext, type ProtoSettings, type RecordPlacement } from './protoSettings'

const R = P.record
const T = { ...DEFAULT_PARAMS, ...R.tuning }

function useStableConfig<C extends DialConfig>(config: C): C {
  return useRef(config).current
}

export default function ProtoTuner({ children }: { children: ReactNode }) {
  const page = useDialKit('Page', useStableConfig({
    'Text size px (wide)': [P.proseMax, 24, 56, 1],
    'Record placement': { type: 'select', options: ['strip', 'inline'], default: P.recordPlacement },
    'Sticky strip': P.stickyStrip,
  } satisfies DialConfig), { id: 'proto-page' })

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
      <DialRoot />
      <style>{'.dialkit-preset-manager { display: none !important; }'}</style>
    </ProtoSettingsContext.Provider>
  )
}
