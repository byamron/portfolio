import { useState } from 'react'

const MODES = [
  { id: 'original', label: 'Original' },
  { id: 'frost', label: 'Frost' },
  { id: 'soft-ring', label: 'Soft Ring' },
  { id: 'gradient-wash', label: 'Gradient' },
] as const

export function GlassModeSwitcher() {
  const [mode, setMode] = useState(
    () => document.documentElement.dataset.glassMode || 'original',
  )

  function handleSelect(id: string) {
    setMode(id)
    document.documentElement.dataset.glassMode = id
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 11,
        letterSpacing: '0.3px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => handleSelect(m.id)}
          style={{
            padding: '7px 12px',
            background: mode === m.id ? '#333' : 'transparent',
            color: mode === m.id ? '#fff' : '#777',
            border: 'none',
            borderRight: m.id !== 'gradient-wash' ? '1px solid #2a2a2a' : 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            letterSpacing: 'inherit',
            lineHeight: 1,
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
