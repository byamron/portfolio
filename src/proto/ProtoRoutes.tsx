import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { Route, Routes } from 'react-router-dom'
import { MusicNotesSimple } from '@phosphor-icons/react'
import './proto.css'
import { CustomCursor } from '@/components/CustomCursor'
import { CursorCompanion } from '@/components/CursorCompanion'
import { RECORD_ASPECT, SidebarThemeControls, THEME_SIDEBAR_STATE } from '@/components/SidebarThemeControls'
import { ProtoHome } from './ProtoHome'
import { CursorGlow } from './CursorGlow'
import { RecordDock } from './RecordDock'
import { SimpleHome } from './SimpleHome'

// /new/simple: the toolbar grows a little and the record shrinks to meet it,
// so the record reads as one more control in the rail.
const SIMPLE_CONTROL_SCALE = 1.15
// RecordToggle's size unit is 96px of plinth height.
// The settings button sits in the page's top-right corner.
const SIMPLE_TRIGGER_TOP = 21 // glyph 32px from the top (8-grid), square with its 32–33px from the right
// The rail stops above the contribution strip (label + cells + breathing room).
const STRIP_RESERVE = 104

// Dead-code-eliminated from production builds: the tuner (and DialKit) only
// exist under `vite dev`.
const ProtoTuner = import.meta.env.DEV ? lazy(() => import('./ProtoTuner')) : null

// No AnimatePresence here: its `initial={false}` reaches every motion
// component in the subtree and silently skipped the home page's entrance.
function ProtoShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', color: 'var(--text-dark)' }}>
      {children}
      <CustomCursor />
      <CursorCompanion />
    </div>
  )
}

/** Settings glyph whose knobs are real: they slide to opposite ends while
 *  the rail is open (proto.css, keyed off the trigger's aria-expanded).
 *  When the portrait changes the theme with the rail shut, it wiggles and
 *  its knobs tweak — pointing at where the theme controls live. */
function SlidersGlyph({ playing }: { playing: boolean }) {
  const reducedMotion = useReducedMotion()
  const wiggle = useAnimationControls()
  const [railOpen, setRailOpen] = useState(false)
  const [tweak, setTweak] = useState(0)
  useEffect(() => {
    const onState = (e: Event) => setRailOpen(!!(e as CustomEvent<{ open: boolean }>).detail?.open)
    window.addEventListener(THEME_SIDEBAR_STATE, onState)
    return () => window.removeEventListener(THEME_SIDEBAR_STATE, onState)
  }, [])
  useEffect(() => {
    const onCycled = () => {
      if (railOpen || reducedMotion) return
      setTweak(t => t + 1)
      // A flick that decays on its own: spring from a sideways kick.
      wiggle.start({ rotate: 0, transition: { type: 'spring', velocity: -320, stiffness: 600, damping: 12 } })
    }
    document.addEventListener('accent-cycled', onCycled)
    return () => document.removeEventListener('accent-cycled', onCycled)
  }, [railOpen, reducedMotion, wiggle])
  return (
    <>
    <motion.svg
      animate={wiggle}
      width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true"
    >
      <line x1="4" y1="8" x2="20" y2="8" />
      <line x1="4" y1="16" x2="20" y2="16" />
      {/* Re-keyed per tweak so the knobs' CSS animation restarts. */}
      <g key={tweak} className={tweak ? 'sliders-tweak' : undefined}>
        <circle className="sliders-knob sliders-knob-a" cx="15" cy="8" r="2.5" fill="var(--bg)" />
        <circle className="sliders-knob sliders-knob-b" cx="9" cy="16" r="2.5" fill="var(--bg)" />
      </g>
    </motion.svg>
    {/* Music is on: the record keeps playing after the rail closes, so the
        way back to it says so. */}
    <span className={`sliders-playing${playing ? ' is-on' : ''}`} aria-hidden="true" />
    </>
  )
}

/** /new/simple: knows whether the rail's record is playing. */
function SimpleShell() {
  const [playing, setPlaying] = useState(false)
  return (
    <ProtoShell>
      <CursorGlow />
      <SimpleHome />
      <SidebarThemeControls
        triggerIcon={<SlidersGlyph playing={playing} />}
        triggerLabel="Settings"
        controlScale={SIMPLE_CONTROL_SCALE}
        openOn="click"
        stagger={0.018}
        glidePill
        fitBottomReserve={STRIP_RESERVE}
        triggerTop={SIMPLE_TRIGGER_TOP}
        extraControl={({ extraWidth }) => (
          <RecordDock credit="left" size={extraWidth / RECORD_ASPECT / 96} idleCaption={<MusicNotesSimple size={15} weight="regular" style={{ display: 'block' }} />} onChange={setPlaying} />
        )}
      />
    </ProtoShell>
  )
}

function ProtoPages() {
  return (
    <Routes>
      <Route
        index
        element={
          <ProtoShell>
            <ProtoHome />
            {/* The portrait is the visible way in; the right edge still opens it on hover. */}
            <SidebarThemeControls hideTriggerAtRest />
          </ProtoShell>
        }
      />
      {/* A settings button is the way in; the record lives in the sidebar
          and keeps playing after it closes. */}
      <Route path="simple" element={<SimpleShell />} />
    </Routes>
  )
}

export function ProtoRoutes() {
  if (!ProtoTuner) return <ProtoPages />
  return (
    <Suspense fallback={null}>
      <ProtoTuner><ProtoPages /></ProtoTuner>
    </Suspense>
  )
}
