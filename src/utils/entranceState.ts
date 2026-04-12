/** Module-level timestamp — any component mounting within the first second is part of the entrance. */
const mountTime = Date.now()
const ENTRANCE_WINDOW_MS = 1000

export function isInitialEntrance(): boolean {
  return Date.now() - mountTime < ENTRANCE_WINDOW_MS
}

/** Entrance choreography timing — three-beat structure with per-element cascade. */
export const entrancePreset = {
  stagger: 0.35,         // 350ms between top-level beats (hero, each section, about)
  portraitDelay: 0.35,   // portrait arrives between hero and first section
  childDuration: 0.45,   // each element's blur-to-sharp fade
  blur: 5,               // initial blur in px
  containerDelay: 0.1,   // delay before hero starts
  sidebarDelay: 1.8,     // sidebar trigger fade-in
  cascadeStagger: 0.07,  // 70ms between elements within a section
} as const
