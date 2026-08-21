import { lazy, Suspense, useEffect, useState } from 'react'
import type { ProtoMedia } from './data'

const Lottie = lazy(() => import('lottie-react'))

// Lottie JSON is fetched once per src and shared across mounts (the preview
// layer and the hero both render the same animation).
const lottieCache = new Map<string, Promise<object>>()

const fill = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
} as const

const blankFill = { ...fill, background: 'color-mix(in srgb, var(--text-dark) 7%, var(--bg))' } as const

function VideoFill({ src }: { src: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  if (state === 'error') return <div style={blankFill} />
  return (
    <video
      src={src}
      style={{ ...fill, opacity: state === 'ready' ? 1 : 0, transition: 'opacity 200ms ease' }}
      onLoadedData={() => setState('ready')}
      onError={() => setState('error')}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  )
}

function LottieFill({ src }: { src: string }) {
  const [data, setData] = useState<object | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!lottieCache.has(src)) lottieCache.set(src, fetch(src).then(r => r.json()))
    lottieCache.get(src)!
      .then(d => { if (!cancelled) setData(d) })
      .catch(err => { console.warn('[proto] failed to load lottie', src, err); if (!cancelled) setData(null) })
    return () => { cancelled = true }
  }, [src])
  if (!data) return <div style={blankFill} />
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
  if (media.type === 'video') return <VideoFill src={media.src} />
  if (media.type === 'image') return <img src={media.src} alt={label} style={fill} />
  if (media.type === 'lottie') return <LottieFill src={media.src} />
  return <div style={blankFill} />
}
