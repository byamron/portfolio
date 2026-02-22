import { useThemeContext } from '@/contexts/ThemeContext'
import type { AccentColor } from '@/data/projects'

const accents: { id: AccentColor; color: string }[] = [
  { id: 'table', color: 'var(--swatch-table)' },
  { id: 'portrait', color: 'var(--swatch-portrait)' },
  { id: 'sky', color: 'var(--swatch-sky)' },
  { id: 'pizza', color: 'var(--swatch-pizza)' },
]

export function AccentPicker() {
  const { accentColor, setAccentColor } = useThemeContext()

  return (
    <div
      role="radiogroup"
      aria-label="Accent color"
      style={{ display: 'flex', gap: 12 }}
    >
      {accents.map(({ id, color }) => {
        const isActive = accentColor === id
        return (
          <button
            key={id}
            role="radio"
            aria-checked={isActive}
            aria-label={`${id} theme`}
            onClick={() => setAccentColor(id)}
            style={{
              width: 24,
              height: 24,
              minWidth: 24,
              minHeight: 24,
              borderRadius: 12,
              background: color,
              border: 'none',
              cursor: isActive ? 'default' : 'pointer',
              padding: 0,
              outline: isActive ? `2px solid ${color}` : 'none',
              outlineOffset: 3,
              transition: 'outline 200ms ease-in-out',
            }}
          />
        )
      })}
    </div>
  )
}
