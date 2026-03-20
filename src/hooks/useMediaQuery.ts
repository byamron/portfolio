import { useState, useEffect } from 'react'

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia(query).matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** True when viewport is >= 900px (two-column layout) */
export function useIsWide(): boolean {
  return useMediaQuery('(min-width: 900px)')
}

/** True when two-column but below the wide tier (900–1199px) */
export function useIsCompactTwoColumn(): boolean {
  return useMediaQuery('(min-width: 900px) and (max-width: 1199px)')
}
