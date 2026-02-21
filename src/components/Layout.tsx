import { LeftColumn } from './LeftColumn'
import { RightColumn } from './RightColumn'

export function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      <LeftColumn />
      <RightColumn />
    </div>
  )
}
