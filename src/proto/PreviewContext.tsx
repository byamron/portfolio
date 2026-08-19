import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ProtoEntry } from './data'

/**
 * State machine for the link-anchored hover preview and its morph into the
 * case-study hero.
 *
 *   hidden → hover        (pointer/focus enters an inline link)
 *   hover  → morph        (link clicked; layer flies to the hero rect)
 *   morph  → docked       (layer reaches the hero; in-page hero takes over)
 *   docked → return       (back pressed; layer flies back to the source link)
 *   return → hidden       (layer settles above the link and fades)
 */
export type LayerPhase = 'hidden' | 'hover' | 'morph' | 'docked' | 'return'

/** How the mini preview positions itself horizontally relative to the link. */
export type PlacementMode = 'static' | 'seed' | 'follow'

interface PreviewState {
  phase: LayerPhase
  entry: ProtoEntry | null
  /** Pointer x captured on enter (seed) or continuously (follow). Null for keyboard focus. */
  pointerX: number | null
}

interface PreviewContextValue {
  state: PreviewState
  placement: PlacementMode
  setPlacement: (p: PlacementMode) => void
  /** Bumped whenever a link or hero element (re)registers, so the layer re-measures. */
  measureVersion: number

  hoverLink: (entry: ProtoEntry, pointerX: number | null) => void
  movePointer: (pointerX: number) => void
  leaveLink: () => void
  /** Begin the click morph. Caller navigates immediately after. */
  morphTo: (entry: ProtoEntry) => void
  /** Layer reached the hero rect. */
  dock: () => void
  /** Begin the reverse morph (only meaningful from `docked`). */
  beginReturn: () => void
  /** Return animation finished (or was abandoned). */
  settle: () => void

  registerLink: (id: string, el: HTMLElement | null) => void
  registerHero: (el: HTMLElement | null) => void
  linkEls: React.RefObject<Map<string, HTMLElement>>
  heroEl: React.RefObject<HTMLElement | null>

  /** Whether the case-study page should show its own hero media. */
  heroVisible: boolean
}

const PreviewContext = createContext<PreviewContextValue | null>(null)

const LEAVE_DELAY_MS = 120

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState>({ phase: 'hidden', entry: null, pointerX: null })
  const [placement, setPlacement] = useState<PlacementMode>('seed')
  const [measureVersion, setMeasureVersion] = useState(0)

  const linkEls = useRef(new Map<string, HTMLElement>())
  const heroEl = useRef<HTMLElement | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelLeave = () => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null }
  }

  const hoverLink = useCallback((entry: ProtoEntry, pointerX: number | null) => {
    cancelLeave()
    setState(s => (s.phase === 'morph' || s.phase === 'return' ? s : { phase: 'hover', entry, pointerX }))
  }, [])

  const movePointer = useCallback((pointerX: number) => {
    setState(s => (s.phase === 'hover' ? { ...s, pointerX } : s))
  }, [])

  const leaveLink = useCallback(() => {
    cancelLeave()
    leaveTimer.current = setTimeout(() => {
      setState(s => (s.phase === 'hover' ? { phase: 'hidden', entry: null, pointerX: null } : s))
    }, LEAVE_DELAY_MS)
  }, [])

  const morphTo = useCallback((entry: ProtoEntry) => {
    cancelLeave()
    setState(s => ({ phase: 'morph', entry, pointerX: s.pointerX }))
  }, [])

  const dock = useCallback(() => {
    setState(s => (s.phase === 'morph' ? { ...s, phase: 'docked' } : s))
  }, [])

  const beginReturn = useCallback(() => {
    setState(s => (s.phase === 'docked' ? { ...s, phase: 'return' } : { phase: 'hidden', entry: null, pointerX: null }))
  }, [])

  const settle = useCallback(() => {
    setState({ phase: 'hidden', entry: null, pointerX: null })
  }, [])

  const registerLink = useCallback((id: string, el: HTMLElement | null) => {
    if (el) linkEls.current.set(id, el)
    else linkEls.current.delete(id)
    setMeasureVersion(v => v + 1)
  }, [])

  const registerHero = useCallback((el: HTMLElement | null) => {
    heroEl.current = el
    setMeasureVersion(v => v + 1)
  }, [])

  const heroVisible = state.phase === 'hidden' || state.phase === 'docked' || state.phase === 'hover'

  const value = useMemo<PreviewContextValue>(() => ({
    state, placement, setPlacement, measureVersion,
    hoverLink, movePointer, leaveLink, morphTo, dock, beginReturn, settle,
    registerLink, registerHero, linkEls, heroEl, heroVisible,
  }), [state, placement, measureVersion, hoverLink, movePointer, leaveLink, morphTo, dock, beginReturn, settle, registerLink, registerHero, heroVisible])

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
}

export function usePreview() {
  const ctx = useContext(PreviewContext)
  if (!ctx) throw new Error('usePreview must be used within PreviewProvider')
  return ctx
}
