interface ViewSwitcherProps {
  view: 'main' | 'case-study'
  onViewChange: (view: 'main' | 'case-study') => void
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        background: 'none',
        border: 'none',
        padding: '4px 8px',
        fontSize: 13,
        fontFamily: 'system-ui, sans-serif',
        color: active ? '#fff' : '#666',
        borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'color 120ms ease, border-color 120ms ease',
      }}
    >
      {children}
    </button>
  )
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: '8px 4px',
        border: '1px solid #333',
        display: 'flex',
        gap: 2,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <ToggleButton
        active={view === 'main'}
        onClick={() => onViewChange('main')}
      >
        Main
      </ToggleButton>
      <ToggleButton
        active={view === 'case-study'}
        onClick={() => onViewChange('case-study')}
      >
        Case Study
      </ToggleButton>
    </div>
  )
}
