/** Tuned transition settings for image cross-fades in ImageDisplay. */
export const transitionSettings = {
  // All media (previews + portraits) share the same blur/scale/duration
  previewEnterBlur: 5,
  previewExitBlur: 2,
  previewDuration: 0.25,
  previewEnterScale: 0.98,
  previewExitScale: 0.99,
  // Summary text — less blur needed to register the effect
  summaryEnterBlur: 3,
  summaryExitBlur: 1,
  summaryDuration: 0.2,
  // Easing
  easing: 'easeOut',
  // Image load fade
  imageLoadFadeDuration: 150,
} as const
