import { lazy, Suspense, useEffect, useState } from 'react'
import type { ProtoMedia } from './data'

const Lottie = lazy(() => import('lottie-react'))

const fill = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
} as const

function LottieFill({ src }: { src: string }) {
  const [data, setData] = useState<object | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch(src)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setData(null) })
    return () => { cancelled = true }
  }, [src])
  if (!data) return <div style={{ ...fill, background: 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))' }} />
  return (
    <Suspense fallback={null}>
      <div style={{ ...fill, display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <Lottie animationData={data} loop autoplay style={{ width: '80%', height: '80%' }} />
      </div>
    </Suspense>
  )
}

/** Renders a ProtoMedia into an absolutely-filled parent. Shared by the preview layer and case-study hero. */
export function ProtoMediaFill({ media, label }: { media: ProtoMedia; label: string }) {
  if (media.type === 'video') {
    return <video src={media.src} style={fill} autoPlay muted loop playsInline preload="metadata" />
  }
  if (media.type === 'image') {
    return <img src={media.src} alt={label} style={fill} />
  }
  if (media.type === 'lottie') {
    return <LottieFill src={media.src} />
  }
  return <div style={{ ...fill, background: 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))' }} />
}
