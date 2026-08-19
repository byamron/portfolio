import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PreviewProvider, usePreview, type PlacementMode } from './PreviewContext'
import { PreviewLayer } from './PreviewLayer'
import { ProtoHome } from './ProtoHome'
import { ProtoCaseStudy } from './ProtoCaseStudy'

// DEV PANEL — strip before merge. Placement knob for the hover preview:
// static (centered on link) / seed (x from pointer at enter) / follow (damped pointer tracking).
function PlacementKnob() {
  const { placement, setPlacement } = usePreview()
  const modes: PlacementMode[] = ['static', 'seed', 'follow']
  return (
    <div
      style={{
        position: 'fixed', bottom: 16, left: 16, zIndex: 60, display: 'flex', gap: 4,
        fontFamily: '"Onest", system-ui, sans-serif', fontSize: 12,
      }}
    >
      {modes.map(m => (
        <button
          key={m}
          type="button"
          onClick={() => setPlacement(m)}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: m === placement
              ? 'color-mix(in srgb, var(--text-dark) 14%, var(--bg))'
              : 'transparent',
            color: 'var(--text-dark)',
            opacity: m === placement ? 1 : 0.45,
          }}
        >
          {m}
        </button>
      ))}
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
      <PlacementKnob />
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
