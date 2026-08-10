import { useAppState } from '../state/AppState'
import { useIsMobile } from '../hooks/useIsMobile'
import { Icon } from './icons'

/** Opens the navigation drawer. Only exists when the rail is not already there. */
export function RailToggle() {
  const { setRailOpen } = useAppState()
  const isMobile = useIsMobile()
  if (!isMobile) return null

  return (
    <button
      type="button"
      onClick={() => setRailOpen(true)}
      aria-label="Open navigation"
      className="icon-btn size-9 shrink-0"
    >
      <Icon name="panel" size={20} strokeWidth={1.5} />
    </button>
  )
}
