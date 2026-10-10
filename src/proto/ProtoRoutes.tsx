import { lazy, Suspense } from 'react'
import './proto.css'
import { CustomCursor } from '@/components/CustomCursor'
import { CursorCompanion } from '@/components/CursorCompanion'
import { SidebarThemeControls } from '@/components/SidebarThemeControls'
import { ProtoHome } from './ProtoHome'

// Dead-code-eliminated from production builds: the tuner (and DialKit) only
// exist under `vite dev`.
const ProtoTuner = import.meta.env.DEV ? lazy(() => import('./ProtoTuner')) : null

// No AnimatePresence here: its `initial={false}` reaches every motion
// component in the subtree and silently skipped the home page's entrance.
function ProtoShell() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', color: 'var(--text-dark)' }}>
      <ProtoHome />
      <CustomCursor />
      <CursorCompanion />
      <SidebarThemeControls />
    </div>
  )
}

export function ProtoRoutes() {
  if (!ProtoTuner) return <ProtoShell />
  return (
    <Suspense fallback={null}>
      <ProtoTuner><ProtoShell /></ProtoTuner>
    </Suspense>
  )
}
