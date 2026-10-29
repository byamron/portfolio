import { useEffect, useRef } from 'react'

/** Switching apps or macOS Spaces never sends a pointerleave, so anything
 *  driven by hover would stay on. Runs `cb` when the window loses focus or is
 *  hidden; returns an unsubscribe. */
export function onWindowLeave(cb: () => void): () => void {
  const onVis = () => { if (document.hidden) cb() }
  window.addEventListener('blur', cb)
  document.addEventListener('visibilitychange', onVis)
  return () => {
    window.removeEventListener('blur', cb)
    document.removeEventListener('visibilitychange', onVis)
  }
}

/** `onWindowLeave` while `active`, always calling the latest `cb`. */
export function useWindowLeave(cb: () => void, active = true) {
  const latest = useRef(cb)
  latest.current = cb
  useEffect(() => (active ? onWindowLeave(() => latest.current()) : undefined), [active])
}
