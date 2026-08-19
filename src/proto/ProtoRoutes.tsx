import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PreviewProvider, usePreview, type PlacementMode, type EntranceMode } from './PreviewContext'
import { PreviewLayer } from './PreviewLayer'
import { ProtoHome } from './ProtoHome'
import { ProtoCaseStudy } from './ProtoCaseStudy'

// DEV PANEL — strip before merge. Two knobs for the hover preview:
//  entrance:  appear (fade in place) / grow (scale up out of the link)
//  placement: static (centered on link) / seed (x from pointer) / follow (damped tracking)
function DevKnobs() {
  const { placement, setPlacement, entrance, setEntrance } = usePreview()
  const placements: PlacementMode[] = ['static', 'seed', 'follow']
  const entrances: EntranceMode[] = ['appear', 'grow']

  const row = (label: string, opts: string[], active: string, set: (v: string) => void) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ opacity: 0.4, minWidth: 62 }}>{label}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {opts.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => set(m)}
            style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: m === active ? 'color-mix(in srgb, var(--text-dark) 14%, var(--bg))' : 'transparent',
              color: 'var(--text-dark)', opacity: m === active ? 1 : 0.45,
              fontFamily: 'inherit', fontSize: 'inherit',
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div
      style={{
        position: 'fixed', bottom: 16, left: 16, zIndex: 60,
        display: 'flex', flexDirection: 'column', gap: 4,
        fontFamily: '"Onest", system-ui, sans-serif', fontSize: 12,
      }}
    >
      {row('entrance', entrances, entrance, v => setEntrance(v as EntranceMode))}
      {row('placement', placements, placement, v => setPlacement(v as PlacementMode))}
    </div>
  )
}

function ProtoShell() {
  const location = useLocation()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', color: 'var(--text-dark)' }}>
      <AnimatePresence mode="sync" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route index element={<ProtoHome />} />
          <Route path=":slug" element={<ProtoCaseStudy />} />
        </Routes>
      </AnimatePresence>
      <PreviewLayer />
      <DevKnobs />
    </div>
  )
}

export function ProtoRoutes() {
  return (
    <PreviewProvider>
      <ProtoShell />
    </PreviewProvider>
  )
}
