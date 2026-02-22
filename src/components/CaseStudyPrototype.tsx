import { mochiSubscriptions } from '@/data/case-study-content'
import { CaseStudyLayoutA } from './CaseStudyLayoutA'
import { useIsWide } from '@/hooks/useMediaQuery'

export function CaseStudyPrototype() {
  const isWide = useIsWide()

  return (
    <>
      {/* Top fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 20,
          pointerEvents: 'none',
          zIndex: 100,
          background: 'linear-gradient(to bottom, var(--bg), transparent)',
        }}
      />
      {/* Bottom fade */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 20,
          pointerEvents: 'none',
          zIndex: 100,
          background: 'linear-gradient(to top, var(--bg), transparent)',
        }}
      />

      <CaseStudyLayoutA data={mochiSubscriptions} isNarrow={!isWide} />
    </>
  )
}
