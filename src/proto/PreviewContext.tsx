import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ProtoEntry } from './data'

/**
 * State machine for the link-anchored hover preview and its morph into the
 * case-study hero.
 *
 *   hidden → hover   (pointer/focus enters an inline link)
 *   hover  → morph   (link clicked; layer flies to the hero rect)
 *   morph  → hidden  (layer reaches the hero and fades out over the in-page hero)
 */
export type LayerPhase = 'hidden' | 'hover' | 'morph'

interface PreviewState {
  phase: LayerPhase
  entry: ProtoEntry | null
}

interface PreviewContextValue {
  state: PreviewState

  hoverLink: (entry: ProtoEntry) => void
  leaveLink: () => void
  /** Begin the click morph. Caller navigates immediately after. */
  morphTo: (entry: ProtoEntry) => void
  /** Reset to hidden (morph finished, or back navigation). */
  settle: () => void

  registerLink: (id: string, el: HTMLElement | null) => void
  linkEls: React.RefObject<Map<string, HTMLElement>>
  /** The case-study hero element, once mounted — the morph's flight target. */
  heroEl: HTMLElement | null
  registerHero: (el: HTMLElement | null) => void
}

const PreviewContext = createContext<PreviewContextValue | null>(null)

const LEAVE_DELAY_MS = 120

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState>({ phase: 'hidden', entry: null })
  const [heroEl, setHeroEl] = useState<HTMLElement | null>(null)

  const linkEls = useRef(new Map<string, HTMLElement>())
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelLeave = () => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null }
  }

  const hoverLink = useCallback((entry: ProtoEntry) => {
    cancelLeave()
    setState(s => (s.phase === 'morph' ? s : { phase: 'hover', entry }))
  }, [])

  const leaveLink = useCallback(() => {
    cancelLeave()
    leaveTimer.current = setTimeout(() => {
      setState(s => (s.phase === 'hover' ? { phase: 'hidden', entry: null } : s))
    }, LEAVE_DELAY_MS)
  }, [])

  const morphTo = useCallback((entry: ProtoEntry) => {
    cancelLeave()
    setState({ phase: 'morph', entry })
  }, [])

  const settle = useCallback(() => {
    setState({ phase: 'hidden', entry: null })
  }, [])

  const registerLink = useCallback((id: string, el: HTMLElement | null) => {
    if (el) linkEls.current.set(id, el)
    else linkEls.current.delete(id)
  }, [])

  const value = useMemo<PreviewContextValue>(() => ({
    state, hoverLink, leaveLink, morphTo, settle, registerLink, linkEls, heroEl, registerHero: setHeroEl,
  }), [state, heroEl, hoverLink, leaveLink, morphTo, settle, registerLink])

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
}

export function usePreview() {
  const ctx = useContext(PreviewContext)
  if (!ctx) throw new Error('usePreview must be used within PreviewProvider')
  return ctx
}
