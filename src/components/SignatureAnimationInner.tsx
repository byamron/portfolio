import { useRef, useEffect, useState } from 'react'
import { useRive } from '@rive-app/react-canvas'
import { useTheme } from '@/contexts/ThemeContext'

/** startDelayMs: earliest time after mount the signature may start, so it can
 *  follow a page entrance instead of racing it. Still waits to be in view. */
export default function SignatureAnimationInner({ startDelayMs = 0 }: { startDelayMs?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  const { resolvedAppearance } = useTheme()
  const mountedAt = useRef(performance.now())

  const { rive, RiveComponent } = useRive({
    src: '/signature.riv',
    stateMachines: 'State Machine 1',
    autoplay: false,
    artboard: 'signature',
  })

  useEffect(() => {
    if (!containerRef.current || hasTriggered) return
    let timer: ReturnType<typeof setTimeout> | undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && rive) {
          observer.disconnect()
          const wait = Math.max(0, startDelayMs - (performance.now() - mountedAt.current))
          timer = setTimeout(() => {
            rive.play()
            setHasTriggered(true)
          }, wait)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(containerRef.current)
    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [rive, hasTriggered, startDelayMs])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: 24,
        paddingBottom: 24,
        paddingRight: 16,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          filter: resolvedAppearance === 'dark' ? 'invert(0.99)' : 'invert(0.07)',
        }}
      >
        <RiveComponent aria-label="Ben Yamron's signature" />
      </div>
    </div>
  )
}
