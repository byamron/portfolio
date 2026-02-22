import { LeftColumn } from '@/components/LeftColumn'
import { RightColumn } from '@/components/RightColumn'
import { SidebarThemeControls } from '@/components/SidebarThemeControls'
import { useIsWide } from '@/hooks/useMediaQuery'

export function Layout() {
  const showRightColumn = useIsWide()

  return (
    <div
      className="layout-root"
      style={{
        display: 'flex',
        flexDirection: 'row',
        minHeight: '100vh',
        gap: 'var(--layout-gap)',
      }}
      role="presentation"
    >
      <LeftColumn fullWidth={!showRightColumn} />
      {showRightColumn && <RightColumn />}
      <SidebarThemeControls />
    </div>
  )
}
