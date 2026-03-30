/** Tuned transition settings for image cross-fades in ImageDisplay. */
export const transitionSettings = {
  // Preview images (project hover) — slightly more blur to mask the swap
  previewEnterBlur: 5,
  previewExitBlur: 2,
  previewDuration: 0.25,
  // Portrait images (default/theme) — slightly less blur reads right at larger size
  portraitEnterBlur: 4.5,
  portraitExitBlur: 1.5,
  portraitDuration: 0.3,
  // Summary text — less blur needed to register the effect
  summaryEnterBlur: 3,
  summaryExitBlur: 1,
  summaryDuration: 0.2,
  // Scale (enter from slightly smaller)
  previewEnterScale: 0.98,
  previewExitScale: 0.99,
  portraitEnterScale: 0.98,
  portraitExitScale: 0.995,
  // Easing
  easing: 'easeOut',
  // Image load fade
  imageLoadFadeDuration: 150,
} as const
