import { useTheme, type IntensityVariant } from '@/contexts/ThemeContext'

const variants: { key: IntensityVariant; label: string }[] = [
  { key: 'gradient', label: 'Gradient Strip' },
  { key: 'ring', label: 'Ring Cycle' },
]

export function BgIntensityPanel() {
  const { intensityVariant, setIntensityVariant } = useTheme()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 4,
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 10,
        zIndex: 1000,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          padding: '0 8px',
          color: '#666',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
        }}
      >
        Intensity UI
      </span>
      {variants.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setIntensityVariant(key)}
          aria-pressed={intensityVariant === key}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: 7,
            cursor: 'pointer',
            background: intensityVariant === key ? '#333' : 'transparent',
            color: intensityVariant === key ? '#fff' : '#777',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: intensityVariant === key ? 500 : 400,
            transition: 'all 150ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
