import { useRef, useEffect, useState } from 'react'
import { useRive } from '@rive-app/react-canvas'
import { useTheme } from '@/contexts/ThemeContext'

export function SignatureAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  const { resolvedAppearance } = useTheme()

  const { rive, RiveComponent } = useRive({
    src: '/signature.riv',
    stateMachines: 'State Machine 1',
    autoplay: false,
    artboard: 'signature',
  })

  useEffect(() => {
    if (!containerRef.current || hasTriggered) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && rive) {
          rive.play()
          setHasTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [rive, hasTriggered])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: 24,
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          filter: resolvedAppearance === 'dark' ? 'invert(0.75)' : 'invert(0.45)',
        }}
      >
        <RiveComponent aria-label="Ben Yamron's signature" />
      </div>
    </div>
  )
}
