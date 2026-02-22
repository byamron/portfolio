import { Monitor, Sun, Moon } from '@phosphor-icons/react'
import { useThemeContext } from '@/contexts/ThemeContext'

const modes = [
  { id: 'system', label: 'System theme', Icon: Monitor },
  { id: 'light', label: 'Light theme', Icon: Sun },
  { id: 'dark', label: 'Dark theme', Icon: Moon },
] as const

export function ModeSwitcher() {
  const { appearanceMode, setAppearanceMode } = useThemeContext()

  return (
    <div
      role="radiogroup"
      aria-label="Appearance mode"
      style={{ display: 'flex', gap: 8 }}
    >
      {modes.map(({ id, label, Icon }) => {
        const isActive = appearanceMode === id
        return (
          <button
            key={id}
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            onClick={() => setAppearanceMode(id)}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: isActive ? 'default' : 'pointer',
              padding: 0,
              borderRadius: 8,
              opacity: isActive ? 1 : 0.5,
              color: isActive ? 'var(--swatch)' : 'var(--text-grey)',
              transition: 'opacity 200ms ease-in-out, transform 200ms ease-in-out, color 200ms ease-in-out',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <Icon size={24} weight="regular" />
          </button>
        )
      })}
    </div>
  )
}
