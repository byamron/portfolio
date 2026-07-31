export type AboutEntry = {
  designers: string[]
  dateAdded: string
  totalViews: number | null
  weekViews: number | null
  thickness: number | null
  width: number | null
  about: string[]
}

/**
 * The about payload is ~1MB — far too much to sit in the initial bundle for
 * data that is only needed once a round has been answered. It is fetched once,
 * on the first reveal, and cached for the session.
 */
let cache: Record<string, AboutEntry> | null = null
let inflight: Promise<Record<string, AboutEntry>> | null = null

export async function loadAbout(family: string): Promise<AboutEntry | null> {
  if (!cache) {
    inflight ??= import('../data/font-about.json').then((m) => {
      cache = m.default as Record<string, AboutEntry>
      return cache
    })
    try {
      await inflight
    } catch {
      // Drop the rejected promise so a later reveal can retry, rather than
      // every subsequent round inheriting one offline moment.
      inflight = null
      return null
    }
  }
  return cache?.[family] ?? null
}

/** Pulled forward as soon as a round starts, so the reveal never waits on it. */
export function warmAbout() {
  if (!cache && !inflight) {
    inflight = import('../data/font-about.json').then((m) => {
      cache = m.default as Record<string, AboutEntry>
      return cache
    })
  }
}

export function specimenUrl(family: string) {
  return `https://fonts.google.com/specimen/${family.replace(/ /g, '+')}`
}
