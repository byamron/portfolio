import { defaultImageMap, projectImageMap } from '@/data/projects'

const preloaded = new Set<string>()

function preload(src: string): void {
  if (preloaded.has(src)) return
  preloaded.add(src)
  const img = new Image()
  img.src = src
}

/** Preload all portrait images so theme switching is instant. */
export function preloadPortraitImages(): void {
  Object.values(defaultImageMap).forEach(preload)
}

/** Preload project preview images (excluding Lottie JSON). */
export function preloadPreviewImages(): void {
  Object.values(projectImageMap).forEach(src => {
    if (!src.endsWith('.json') && !src.endsWith('.mp4')) preload(src)
  })
}
