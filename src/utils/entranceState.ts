/** Module-level timestamp — any component mounting within the first second is part of the entrance.
 *
 * IMPORTANT: This module must stay in the main bundle (not code-split) for the timestamp
 * to reflect actual page load time. All current consumers import it statically. */
const mountTime = Date.now()
const ENTRANCE_WINDOW_MS = 1000

export function isInitialEntrance(): boolean {
  return Date.now() - mountTime < ENTRANCE_WINDOW_MS
}

/** Entrance choreography timing — two-beat structure.
 *
 * Beat 1: Hero heading, portrait image, and sidebar appear together.
 * Beat 2: All left-column content cascades in at 80ms per element.
 *
 * IMPORTANT: This module must stay in the main bundle (not code-split) for the timestamp
 * to reflect actual page load time. All current consumers import it statically. */
export const entrancePreset = {
  heroDuration: 0.45,      // hero fade-in duration
  heroDelay: 0.1,          // slight delay before hero starts
  portraitDelay: 0.1,      // portrait appears with hero (beat 1)
  sidebarDelay: 0.1,       // sidebar appears with hero (beat 1)
  cascadeDelay: 0.55,      // content starts after hero is mostly visible (heroDelay + heroDuration)
  cascadeStagger: 0.08,    // 80ms between content elements
  itemDuration: 0.35,      // each content element's fade duration
} as const
