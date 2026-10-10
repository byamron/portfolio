// DEV ONLY — loaded behind `import.meta.env.DEV` in ProtoRoutes, so it never
// reaches a production bundle. Tune here, then bake into RECORD_DOCK_DEFAULTS.
import { useRef, type ReactNode } from 'react'
import { DialRoot, useDialKit, type DialConfig } from 'dialkit'
import 'dialkit/styles.css'
import { DEFAULT_PARAMS } from '@/components/RecordToggle'
import { RecordDockSettingsContext, RECORD_DOCK_DEFAULTS as D } from './RecordDock'

const T = { ...DEFAULT_PARAMS, ...D.tuning }

function useStableConfig<C extends DialConfig>(config: C): C {
  return useRef(config).current
}

export default function RecordDockTuner({ children }: { children: ReactNode }) {
  const config = useStableConfig({
    'Size': [D.size, 0.4, 1, 0.02],
    'Edge offset px': [D.offset, 8, 48, 2],
    'Track': { type: 'select', options: ['martini', 'venice', 'lovin'], default: D.trackId },
    'Idle caption': { type: 'text', default: D.idleCaption, placeholder: 'e.g. Side A' },
    'Label accent': [D.labelAccent, 0, 1, 0.05],
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
  } satisfies DialConfig)
  const v = useDialKit('Record', config, { id: 'record-dock' })

  const settings = {
    size: v['Size'],
    offset: v['Edge offset px'],
    trackId: v['Track'] as typeof D.trackId,
    idleCaption: v['Idle caption'] as string,
    labelAccent: v['Label accent'],
    tuning: {
      crackle: v['Crackle (audio)'],
      vinylDark: v['Vinyl detail (dark)'],
      vinylLight: v['Vinyl detail (light)'],
      grain: v['Wood grain'],
      offStyle: v['Off style'] as typeof T.offStyle,
      glow: v['Glow'] as typeof T.glow,
      glowDark: v['Glow (dark)'],
      glowLight: v['Glow (light)'],
      glowToneLight: v['Glow tone (light)'],
      breathDetail: v['Glow detail'],
      spinUp: v['Spin up s'],
      spinDown: v['Wind down s'],
    },
  }

  return (
    <RecordDockSettingsContext.Provider value={settings}>
      {children}
      <DialRoot />
      <style>{'.dialkit-preset-manager { display: none !important; }'}</style>
    </RecordDockSettingsContext.Provider>
  )
}
