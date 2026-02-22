import { LeftColumn } from './LeftColumn'
import { RightColumn } from './RightColumn'
import { useIsWide } from '@/hooks/useMediaQuery'

export function Layout() {
  const showRightColumn = useIsWide()

  return (
    <div
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
    </div>
  )
}
