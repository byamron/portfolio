/** Tuned transition settings for image cross-fades in ImageDisplay. */
export const transitionSettings = {
  // Preview images (project hover) — slightly more blur to mask the swap
  previewEnterBlur: 5,
  previewExitBlur: 2,
  previewDuration: 0.25,
  // Portrait images (accent cycling) — opacity-only, near-instant
  portraitDuration: 0.08,
  // Summary text — less blur needed to register the effect
  summaryEnterBlur: 3,
  summaryExitBlur: 1,
  summaryDuration: 0.2,
  // Scale (enter from slightly smaller)
  previewEnterScale: 0.98,
  previewExitScale: 0.99,
  // Easing
  easing: 'easeOut',
  // Image load fade
  imageLoadFadeDuration: 150,
} as const
