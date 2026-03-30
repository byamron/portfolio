import { LeftColumn } from '@/components/LeftColumn'
import { useIsWide } from '@/hooks/useMediaQuery'

export function Layout() {
  const isWide = useIsWide()

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
      <LeftColumn fullWidth={!isWide} />
    </div>
  )
}
