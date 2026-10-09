import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'
import './proto.css'
import { CustomCursor } from '@/components/CustomCursor'
import { CursorCompanion } from '@/components/CursorCompanion'
import { SidebarThemeControls } from '@/components/SidebarThemeControls'
import { ProtoHome } from './ProtoHome'

const RecordToggle = lazy(() => import('@/components/RecordToggle').then(m => ({ default: m.RecordToggle })))

function ProtoShell() {
  const location = useLocation()
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
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 40 }}>
        <Suspense fallback={null}>
          <RecordToggle />
        </Suspense>
      </div>
    </div>
  )
}

export function ProtoRoutes() {
  return <ProtoShell />
}
