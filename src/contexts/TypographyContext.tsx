import { createContext, useContext, useState, type ReactNode, type CSSProperties } from 'react'

export type TypographyVariant = 'current' | 'unified'
export type SectionHeadingMode = 'control' | 'dark-narrative' | 'label'

interface TypographyContextValue {
  variant: TypographyVariant
  setVariant: (v: TypographyVariant) => void
  narrativeStyle: CSSProperties
  sectionHeadingMode: SectionHeadingMode
  setSectionHeadingMode: (v: SectionHeadingMode) => void
}

const currentNarrative: CSSProperties = {
  fontFamily: "'Literata', serif",
  fontSize: 'var(--text-size-narrative)',
  fontWeight: 300,
  lineHeight: 1.4,
  color: 'var(--text-grey)',
}

const unifiedNarrative: CSSProperties = {
  fontFamily: "'Onest', sans-serif",
  fontSize: 'var(--text-size-body)',
  fontWeight: 400,
  lineHeight: 1.4,
  color: 'var(--text-grey)',
}

const TypographyContext = createContext<TypographyContextValue>({
  variant: 'unified',
  setVariant: () => {},
  narrativeStyle: unifiedNarrative,
  sectionHeadingMode: 'control',
  setSectionHeadingMode: () => {},
})

export function TypographyProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<TypographyVariant>('unified')
  const [sectionHeadingMode, setSectionHeadingMode] = useState<SectionHeadingMode>('control')

  const base = variant === 'unified' ? unifiedNarrative : currentNarrative
  const narrativeStyle = sectionHeadingMode === 'dark-narrative'
    ? { ...base, color: 'var(--text-dark)' }
    : base

  return (
    <TypographyContext.Provider value={{ variant, setVariant, narrativeStyle, sectionHeadingMode, setSectionHeadingMode }}>
      {children}
    </TypographyContext.Provider>
  )
}

export function useTypography() {
  return useContext(TypographyContext)
}
