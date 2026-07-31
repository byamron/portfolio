import { useEffect, useState } from 'react'
import type { FontEntry } from './fonts'

/**
 * Loads a Google Font and reports when its glyphs are actually available.
 *
 * The round must never render in a fallback face. A flash of Helvetica before
 * the real font arrives is not just ugly here — it is a false clue, and the
 * player may have already committed to a guess by the time it resolves. So
 * stylesheets are requested with `display=block` (invisible during load, never
 * a fallback swap) and the caller gates the specimen on `ready`.
 *
 * Loading happens in two stages so the round starts fast:
 *
 *   1. Regular 400 only — one file. The specimen appears as soon as this lands.
 *   2. The remaining weights, injected afterwards, which light up the weight
 *      control. Variable families get a single file covering the whole axis;
 *      static families get one file per weight, which is why this is deferred.
 */

/**
 * Injected stylesheets, keyed by href, holding a promise that settles when the
 * sheet has actually parsed.
 *
 * Waiting on this matters: `document.fonts.load()` only sees FontFace entries
 * that the CSSOM already knows about, so calling it straight after appending
 * the <link> resolves with an empty list and looks exactly like a font that
 * failed to load. That race is silent, intermittent, and blames the font.
 */
const injected = new Map<string, Promise<void>>()

function inject(href: string): Promise<void> {
  const existing = injected.get(href)
  if (existing) return existing

  const pending = new Promise<void>((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`stylesheet failed: ${href}`))
    document.head.appendChild(link)
  })

  // Never cache a rejection: one transient network blip would otherwise make
  // that family permanently unloadable for the session, and `prefetchFont` can
  // poison a font before it has even been drawn.
  pending.catch(() => injected.delete(href))
  injected.set(href, pending)
  return pending
}

const encode = (family: string) => encodeURIComponent(family).replace(/%20/g, '+')

function regularHref(family: string) {
  return `https://fonts.googleapis.com/css2?family=${encode(family)}&display=block`
}

/** The full weight range, as one request. Returns null when there's nothing more to fetch. */
function allWeightsHref(font: FontEntry): string | null {
  if (font.wghtAxis) {
    const [min, max] = font.wghtAxis
    return `https://fonts.googleapis.com/css2?family=${encode(font.family)}:wght@${min}..${max}&display=block`
  }
  if (font.weights.length > 1) {
    return `https://fonts.googleapis.com/css2?family=${encode(font.family)}:wght@${font.weights.join(';')}&display=block`
  }
  return null
}

export type LoadState = 'loading' | 'ready' | 'error'

export function useFontLoader(font: FontEntry | null) {
  const [state, setState] = useState<LoadState>('loading')
  /** True once every weight is available, so the control can stop being provisional. */
  const [weightsReady, setWeightsReady] = useState(false)

  useEffect(() => {
    if (!font) return
    let cancelled = false
    setState('loading')
    setWeightsReady(false)

    // Generous, so a slow network degrades to a message rather than hanging on
    // a blank specimen forever.
    const timeout = setTimeout(() => {
      if (!cancelled) setState('error')
    }, 8000)

    inject(regularHref(font.family))
      .then(() => document.fonts.load(`400 72px "${font.family}"`))
      .then((faces) => {
        if (cancelled) return
        clearTimeout(timeout)
        if (faces.length === 0) {
          setState('error')
          return
        }
        setState('ready')

        const more = allWeightsHref(font)
        if (!more) {
          setWeightsReady(true)
          return
        }

        // The extra weights are non-critical: if they fail, the control simply
        // stays on the regular weight rather than breaking the round.
        inject(more)
          .then(() =>
            Promise.all(
              font.weights.map((w) => document.fonts.load(`${w} 72px "${font.family}"`)),
            ),
          )
          .then(() => !cancelled && setWeightsReady(true))
          .catch(() => !cancelled && setWeightsReady(true))
      })
      .catch(() => {
        if (cancelled) return
        clearTimeout(timeout)
        setState('error')
      })

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [font])

  return { state, weightsReady }
}

/** Warms the next round's font while the player is still reading the reveal. */
export function prefetchFont(family: string) {
  inject(regularHref(family))
    .then(() => document.fonts.load(`400 72px "${family}"`))
    .catch(() => {})
}
