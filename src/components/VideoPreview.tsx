import { useState } from 'react'

interface VideoPreviewProps {
  src: string
  alt: string
  /** When true, fills container via object-fit: cover and locks 4:3 aspect (sony-only). */
  fitCover?: boolean
  /** Optional CSS filter (e.g. drop-shadow) applied to the video. */
  dropShadow?: string
}

// Hover-preview / case-study video element with a load-gated opacity fade,
// to avoid showing the empty first frame before the browser has decoded any data.
// Gate lives inside the keyed child (not on any motion.div wrapper) so it
// doesn't interact with AnimatePresence lifecycles — see history.md 2026-05-12.
export function VideoPreview({ src, alt, fitCover = false, dropShadow }: VideoPreviewProps) {
  const [ready, setReady] = useState(false)
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onLoadedData={() => setReady(true)}
      aria-label={alt}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: fitCover ? 'cover' : 'contain',
        aspectRatio: fitCover ? '4 / 3' : undefined,
        borderRadius: 32,
        filter: dropShadow,
        opacity: ready ? 1 : 0,
        transition: 'opacity 160ms ease-out',
      }}
    />
  )
}
