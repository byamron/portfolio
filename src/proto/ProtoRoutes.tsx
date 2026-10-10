import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'
import './proto.css'
import { CustomCursor } from '@/components/CustomCursor'
import { CursorCompanion } from '@/components/CursorCompanion'
import { SidebarThemeControls } from '@/components/SidebarThemeControls'
import { ProtoHome } from './ProtoHome'
import { RecordDock, useRecordDockPinned } from './RecordDock'

// Dead-code-eliminated from production builds: the tuner (and DialKit) only
// exist under `vite dev`.
const RecordDockTuner = import.meta.env.DEV ? lazy(() => import('./RecordDockTuner')) : null

function ProtoShell() {
  const location = useLocation()
  const pinned = useRecordDockPinned()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', color: 'var(--text-dark)' }}>
      <AnimatePresence mode="sync" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route index element={<ProtoHome />} />
        </Routes>
      </AnimatePresence>
      <CustomCursor />
      <CursorCompanion />
      <SidebarThemeControls />
      {pinned && <RecordDock placement="fixed" />}
    </div>
  )
}

export function ProtoRoutes() {
  if (!RecordDockTuner) return <ProtoShell />
  return (
    <Suspense fallback={null}>
      <RecordDockTuner><ProtoShell /></RecordDockTuner>
    </Suspense>
  )
}
