import { useTypography, type TypographyVariant, type SectionHeadingMode } from '@/contexts/TypographyContext'

const variants: { key: TypographyVariant; label: string; description: string }[] = [
  { key: 'current', label: 'Before', description: 'Literata 300 · 22px' },
  { key: 'unified', label: 'After', description: 'Onest 400 · 18px' },
]

const headingModes: { key: SectionHeadingMode; label: string }[] = [
  { key: 'control', label: 'Control' },
  { key: 'dark-narrative', label: 'A: Dark' },
  { key: 'label', label: 'B: Labels' },
]

const pillButton = (isActive: boolean) => ({
  padding: '6px 12px',
  borderRadius: 7,
  border: 'none',
  cursor: 'pointer',
  background: isActive ? 'hsla(0, 0%, 100%, 0.15)' : 'transparent',
  color: isActive ? '#fff' : 'hsla(0, 0%, 100%, 0.5)',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: isActive ? 500 : 400,
  transition: 'all 0.15s ease',
  whiteSpace: 'nowrap' as const,
})

export function TypographyDevPanel() {
  const { variant, setVariant, sectionHeadingMode, setSectionHeadingMode } = useTypography()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 8,
        borderRadius: 14,
        background: 'hsla(0, 0%, 10%, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid hsla(0, 0%, 100%, 0.1)',
        boxShadow: '0 4px 24px hsla(0, 0%, 0%, 0.4)',
        fontFamily: "'Onest', sans-serif",
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', gap: 2 }}>
        {variants.map(v => {
          const isActive = variant === v.key
          return (
            <button
              key={v.key}
              onClick={() => setVariant(v.key)}
              style={{
                ...pillButton(isActive),
                padding: '8px 16px',
                borderRadius: 9,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                flex: 1,
              }}
            >
              <span>{v.label}</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>{v.description}</span>
            </button>
          )
        })}
      </div>
      <div style={{ height: 1, background: 'hsla(0, 0%, 100%, 0.08)', margin: '0 4px' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
        <span style={{ color: 'hsla(0, 0%, 100%, 0.4)', fontSize: 11, flexShrink: 0 }}>Sections</span>
        <div style={{ display: 'flex', gap: 2, flex: 1 }}>
          {headingModes.map(m => (
            <button
              key={m.key}
              onClick={() => setSectionHeadingMode(m.key)}
              style={{ ...pillButton(sectionHeadingMode === m.key), flex: 1, textAlign: 'center' }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
