import { LeftColumn } from '@/components/LeftColumn'
import { RightColumn } from '@/components/RightColumn'
import { SidebarThemeControls } from '@/components/SidebarThemeControls'

export function Layout() {
  return (
    <div
      className="layout-root"
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
      }}
    >
      <LeftColumn />
      <RightColumn />
      <SidebarThemeControls />
    </div>
  )
}
