import { useEffect, useState } from 'react'

/** Below this the rail and the side panels stop fitting beside the content. */
export const MOBILE = '(max-width: 767px)'

/**
 * Layout mode, not a style hook.
 *
 * The rail and the panels change *shape* on a phone — from columns beside the
 * content to overlays on top of it — which is a structural decision the
 * components have to make, not something a container query can express.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE).matches)

  useEffect(() => {
    const query = window.matchMedia(MOBILE)
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return isMobile
}
