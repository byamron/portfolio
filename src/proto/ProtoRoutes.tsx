import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { DialRoot } from 'dialkit'
import { Agentation } from 'agentation'
import 'dialkit/styles.css'
import './proto.css'
import { CustomCursor } from '@/components/CustomCursor'
import { PreviewProvider } from './PreviewContext'
import { PreviewLayer } from './PreviewLayer'
import { ProtoHome } from './ProtoHome'
import { ProtoCaseStudy } from './ProtoCaseStudy'

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
      {/* Cursor mode (standard/figpal) comes from the customization panel. */}
      <CustomCursor />
      {/* DEV TOOLING — DialKit dials (see tuning.ts) + Agentation feedback overlay. Strip before merge. */}
      <DialRoot />
      <Agentation />
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
